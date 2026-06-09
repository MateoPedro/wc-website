import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { motion } from 'framer-motion'
import { useDestinations, useTravelers } from '../hooks/useSupabase'
import DestinationPanel from '../components/DestinationPanel'
import type { Destination, Traveler } from '../types'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// ── Marker helpers (vanilla DOM — no portal overhead) ─────

function initials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function makeTravelerEl(t: Traveler): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText =
    'display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;'

  const ring = document.createElement('div')
  const gold = t.is_owner
  ring.style.cssText = `
    width:46px;height:46px;border-radius:50%;
    border:2.5px solid ${gold ? '#C8A200' : 'rgba(255,255,255,0.75)'};
    background:#111;overflow:hidden;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 ${gold ? '14px rgba(200,162,0,0.45)' : '10px rgba(0,0,0,0.7)'};
    transition:transform 0.15s ease;
  `
  ring.onmouseenter = () => (ring.style.transform = 'scale(1.12)')
  ring.onmouseleave = () => (ring.style.transform = 'scale(1)')

  if (t.avatar_url) {
    const img = document.createElement('img')
    img.src = t.avatar_url
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;'
    img.onerror = () => img.replaceWith(makeInitialsEl(t.name, gold))
    ring.appendChild(img)
  } else {
    ring.appendChild(makeInitialsEl(t.name, gold))
  }

  const label = document.createElement('div')
  label.style.cssText = `
    font-size:10px;font-weight:500;color:rgba(255,255,255,0.9);
    font-family:Inter,sans-serif;letter-spacing:0.04em;
    text-shadow:0 1px 6px rgba(0,0,0,0.9);white-space:nowrap;
  `
  label.textContent = t.name

  wrap.appendChild(ring)
  wrap.appendChild(label)
  return wrap
}

function makeInitialsEl(name: string, gold: boolean): HTMLDivElement {
  const el = document.createElement('div')
  el.style.cssText = `
    font-size:13px;font-weight:600;
    color:${gold ? '#C8A200' : '#fff'};
    font-family:Inter,sans-serif;
  `
  el.textContent = initials(name)
  return el
}

function makeDestinationEl(): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText =
    'display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;'

  const dot = document.createElement('div')
  dot.style.cssText = `
    width:10px;height:10px;border-radius:50%;
    background:#00cc44;border:1.5px solid rgba(255,255,255,0.25);
    box-shadow:0 0 8px #00cc44,0 0 18px rgba(0,204,68,0.35);
  `

  wrap.appendChild(dot)
  return wrap
}

function travelerPopup(t: Traveler): string {
  return `
    <div style="font-family:Inter,sans-serif;min-width:150px;">
      <div style="font-size:14px;font-weight:600;color:#fff;margin-bottom:3px;">${t.name}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:8px;">📍 ${t.current_city}</div>
      ${t.note ? `<div style="font-size:12px;color:rgba(255,255,255,0.65);line-height:1.5;">${t.note}</div>` : ''}
    </div>`
}


// ── Animated dashed route ──────────────────────────────────

const DASH_SEQUENCES: number[][] = [
  [0, 2, 4], [0.5, 2, 3.5], [1, 2, 3], [1.5, 2, 2.5],
  [2, 2, 2], [2.5, 2, 1.5], [3, 2, 1], [3.5, 2, 0.5],
  [4, 2, 0], [0, 0.5, 3.5, 1.5], [0, 1, 3, 2],
  [0, 1.5, 2.5, 2.5], [0, 2, 2, 3], [0, 2, 1, 4],
]

function startRouteAnimation(map: mapboxgl.Map): number {
  let step = 0
  let rafId: number
  function tick(ts: number) {
    const next = Math.floor(ts / 60) % DASH_SEQUENCES.length
    if (next !== step) {
      step = next
      if (map.getLayer('route-animated')) {
        map.setPaintProperty('route-animated', 'line-dasharray', DASH_SEQUENCES[step])
      }
    }
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
  return rafId
}

// ── Component ──────────────────────────────────────────────

export default function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const rafRef = useRef<number>(0)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const [activeDestination, setActiveDestination] = useState<Destination | null>(null)

  const { data: destinations } = useDestinations()
  const { data: travelers } = useTravelers()

  // Init map
  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return

    mapboxgl.accessToken = TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-95, 42],
      zoom: 3.0,
      projection: 'mercator',
      attributionControl: false,
    })

    map.on('error', (e) => console.error('Mapbox error:', e.error?.message))

    // Force resize after a tick in case dimensions weren't ready at init
    setTimeout(() => map.resize(), 100)

    map.addControl(new mapboxgl.AttributionControl({ compact: true }))
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    mapRef.current = map

    return () => {
      cancelAnimationFrame(rafRef.current)
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Add destinations + route when data arrives
  useEffect(() => {
    const map = mapRef.current
    if (!map || destinations.length === 0) return

    const apply = () => {
      const coords = destinations.map((d) => [d.lng, d.lat] as [number, number])

      // Route base (solid, dim)
      if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } },
        })
        map.addLayer({
          id: 'route-base',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#00cc44', 'line-width': 1.5, 'line-opacity': 0.25 },
        })
        map.addLayer({
          id: 'route-animated',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#00cc44',
            'line-width': 2.5,
            'line-opacity': 0.85,
            'line-dasharray': [0, 2, 4],
          },
        })
        rafRef.current = startRouteAnimation(map)
      }

      // Destination markers — open panel on click instead of popup
      destinations.forEach((dest) => {
        const el = makeDestinationEl()
        el.addEventListener('click', () => setActiveDestination(dest))
        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([dest.lng, dest.lat])
          .addTo(map)
        markersRef.current.push(marker)
      })

      // Fit to all destinations
      if (destinations.length > 1) {
        const bounds = destinations.reduce(
          (b, d) => b.extend([d.lng, d.lat] as [number, number]),
          new mapboxgl.LngLatBounds(
            [destinations[0].lng, destinations[0].lat],
            [destinations[0].lng, destinations[0].lat],
          ),
        )
        map.fitBounds(bounds, { padding: 140, maxZoom: 7, duration: 2200, essential: true })
      }
    }

    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [destinations])

  // Add traveler markers when data arrives
  useEffect(() => {
    const map = mapRef.current
    if (!map || travelers.length === 0) return

    const apply = () => {
      travelers.forEach((t) => {
        const el = makeTravelerEl(t)
        const popup = new mapboxgl.Popup({ closeButton: false, className: 'map-popup', offset: 30 })
          .setHTML(travelerPopup(t))
        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([t.lng, t.lat])
          .setPopup(popup)
          .addTo(map)
        markersRef.current.push(marker)
      })
    }

    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [travelers])

  // ── No token fallback ──────────────────────────────────

  if (!TOKEN) {
    return (
      <div className="relative h-screen flex flex-col" style={{ background: '#070d07' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div
              className="text-xs tracking-[0.3em] uppercase"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              Map unavailable
            </div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Add <code style={{ color: '#00cc44' }}>VITE_MAPBOX_TOKEN</code> to .env.local
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Mapbox canvas */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Dark gradient vignette on edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, transparent 18%, transparent 80%, rgba(8,8,8,0.4) 100%),' +
            'linear-gradient(to right, rgba(8,8,8,0.3) 0%, transparent 15%, transparent 85%, rgba(8,8,8,0.3) 100%)',
        }}
      />

      {/* Section label overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute top-20 left-8 flex items-center gap-4 pointer-events-none"
      >
        <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
          01
        </span>
        <div className="h-px w-10" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
          The Journey
        </span>
      </motion.div>

      {/* Destination panel + lightbox */}
      <DestinationPanel
        destination={activeDestination}
        onClose={() => setActiveDestination(null)}
      />

      {/* Traveler count badge */}
      {travelers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute bottom-10 left-8 flex items-center gap-3"
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: '#00cc44' }}
          />
          <span
            className="text-[11px] tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {travelers.length} travelers · {destinations.length} cities
          </span>
        </motion.div>
      )}
    </div>
  )
}
