import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { motion, AnimatePresence } from 'framer-motion'
import { useDestinations, useTravelers } from '../hooks/useSupabase'
import DestinationPanel from '../components/DestinationPanel'
import type { Destination, Traveler } from '../types'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

function previewUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/photos/${path}`
}

// ── Group destinations by city ─────────────────────────────

function groupByCity(destinations: Destination[]): Destination[][] {
  const map = new Map<string, Destination[]>()
  for (const d of destinations) {
    if (!map.has(d.city)) map.set(d.city, [])
    map.get(d.city)!.push(d)
  }
  return Array.from(map.values())
}

// ── Destination card ───────────────────────────────────────

function makeDestinationEl(group: Destination[], token: string): HTMLElement {
  const primary = group[0]
  const matchCount = group.length
  const matchInfo = group[0].match_info as Record<string, unknown> | null
  const imgUrl = primary.preview_image_url
    ? previewUrl(primary.preview_image_url)
    : `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${primary.lng},${primary.lat},14,0/280x160@2x?access_token=${token}`
  const opponent = matchInfo ? String(matchInfo.opponent ?? '') : ''
  const venue = matchInfo ? String(matchInfo.venue ?? '') : ''
  const dates = group.map((d) => d.date_range).filter(Boolean).join(' · ')

  const wrap = document.createElement('div')
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.8));transition:filter 0.18s ease;will-change:transform;'
  wrap.onmouseenter = () => (wrap.style.filter = 'drop-shadow(0 6px 20px rgba(0,204,68,0.3))')
  wrap.onmouseleave = () => (wrap.style.filter = 'drop-shadow(0 4px 16px rgba(0,0,0,0.8))')

  const card = document.createElement('div')
  card.style.cssText = 'width:130px;border-radius:10px;overflow:hidden;border:1.5px solid rgba(0,204,68,0.35);background:#0a0a0a;'

  const imgWrap = document.createElement('div')
  imgWrap.style.cssText = 'position:relative;width:130px;height:75px;overflow:hidden;'

  const img = document.createElement('img')
  img.src = imgUrl
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;'
  img.onerror = () => { imgWrap.style.background = '#0d1a0d' }

  const imgOverlay = document.createElement('div')
  imgOverlay.style.cssText = 'position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.65) 100%);'

  if (matchCount > 1) {
    const badge = document.createElement('div')
    badge.style.cssText = 'position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.8);border:1px solid rgba(0,204,68,0.5);border-radius:20px;padding:1px 7px;font-size:9px;font-weight:600;color:#00cc44;font-family:Inter,sans-serif;'
    badge.textContent = `${matchCount} matches`
    imgWrap.appendChild(badge)
  }

  imgWrap.appendChild(img)
  imgWrap.appendChild(imgOverlay)

  const info = document.createElement('div')
  info.style.cssText = 'padding:9px 11px 10px;background:rgba(8,8,8,0.97);'

  const cityEl = document.createElement('div')
  cityEl.style.cssText = 'font-size:13px;font-weight:700;color:#fff;font-family:Inter,sans-serif;letter-spacing:0.01em;line-height:1.2;'
  cityEl.textContent = primary.city

  const detailEl = document.createElement('div')
  detailEl.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.4);font-family:Inter,sans-serif;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
  detailEl.textContent = matchCount === 1 ? `vs ${opponent} · ${dates}` : dates

  const venueEl = document.createElement('div')
  venueEl.style.cssText = 'font-size:9px;color:rgba(0,204,68,0.6);font-family:Inter,sans-serif;margin-top:2px;letter-spacing:0.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
  venueEl.textContent = venue

  const tapLabel = document.createElement('div')
  tapLabel.style.cssText = 'margin-top:6px;font-size:9px;color:rgba(0,204,68,0.55);font-family:Inter,sans-serif;letter-spacing:0.08em;text-transform:uppercase;'
  tapLabel.textContent = 'Tap for more →'

  info.appendChild(cityEl)
  info.appendChild(detailEl)
  if (venue) info.appendChild(venueEl)
  info.appendChild(tapLabel)

  card.appendChild(imgWrap)
  card.appendChild(info)

  const arrow = document.createElement('div')
  arrow.style.cssText = 'width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid rgba(8,8,8,0.97);margin-top:-1px;'

  wrap.appendChild(card)
  wrap.appendChild(arrow)
  return wrap
}

// ── Owner pin ──────────────────────────────────────────────

function makeOwnerEl(t: Traveler): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;'

  const ring = document.createElement('div')
  ring.style.cssText = 'width:46px;height:46px;border-radius:50%;border:2.5px solid #C8A200;background:#111;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(200,162,0,0.45);transition:transform 0.15s ease;'
  ring.onmouseenter = () => { ring.style.transform = 'scale(1.12)' }
  ring.onmouseleave = () => { ring.style.transform = 'scale(1)' }

  if (t.avatar_url) {
    const img = document.createElement('img')
    img.src = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${t.avatar_url}`
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;'
    img.onerror = () => { img.style.display = 'none'; ring.appendChild(initEl()) }
    ring.appendChild(img)
  } else {
    ring.appendChild(initEl())
  }

  function initEl() {
    const el = document.createElement('div')
    el.style.cssText = 'font-size:13px;font-weight:600;color:#C8A200;font-family:Inter,sans-serif;'
    el.textContent = t.name.slice(0, 2).toUpperCase()
    return el
  }

  const label = document.createElement('div')
  label.style.cssText = 'font-size:10px;font-weight:500;color:rgba(255,255,255,0.9);font-family:Inter,sans-serif;letter-spacing:0.04em;text-shadow:0 1px 6px rgba(0,0,0,0.9);white-space:nowrap;'
  label.textContent = t.name

  wrap.appendChild(ring)
  wrap.appendChild(label)
  return wrap
}

// ── Animated route ─────────────────────────────────────────

const DASH_SEQUENCES: number[][] = [
  [0, 2, 4], [0.5, 2, 3.5], [1, 2, 3], [1.5, 2, 2.5],
  [2, 2, 2], [2.5, 2, 1.5], [3, 2, 1], [3.5, 2, 0.5],
  [4, 2, 0], [0, 0.5, 3.5, 1.5], [0, 1, 3, 2],
  [0, 1.5, 2.5, 2.5], [0, 2, 2, 3], [0, 2, 1, 4],
]

function startRouteAnimation(map: mapboxgl.Map, layerId = 'route-animated'): number {
  let step = 0
  let rafId: number
  function tick(ts: number) {
    const next = Math.floor(ts / 60) % DASH_SEQUENCES.length
    if (next !== step) {
      step = next
      if (map.getLayer(layerId))
        map.setPaintProperty(layerId, 'line-dasharray', DASH_SEQUENCES[step])
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
  const ownerMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const destMarkersRef = useRef<mapboxgl.Marker[]>([])
  const destElsRef = useRef<HTMLElement[]>([])

  const [activeGroup, setActiveGroup] = useState<Destination[] | null>(null)
  const [interactive, setInteractive] = useState(false)

  const { data: destinations } = useDestinations()
  const { data: travelers } = useTravelers()

  function scalePins(zoom: number) {
    const s = Math.min(1, Math.max(0.55, (zoom - 2.5) / 3.5 * 0.45 + 0.55))
    destElsRef.current.forEach((el) => { el.style.transform = `scale(${s})` })
  }

  // Map init
  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return

    mapboxgl.accessToken = TOKEN
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-102, 38],
      zoom: 2.8,
      minZoom: 2,
      maxZoom: 14,
      maxBounds: [[-175, 12], [-50, 85]],
      projection: 'mercator',
      attributionControl: false,
      scrollZoom: false,
      dragPan: false,
      dragRotate: false,
      touchZoomRotate: false,
    })

    map.on('error', (e) => console.error('Mapbox:', e.error?.message))
    map.on('zoom', () => scalePins(map.getZoom()))
    setTimeout(() => map.resize(), 100)
    map.addControl(new mapboxgl.AttributionControl({ compact: true }))
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    mapRef.current = map

    return () => {
      cancelAnimationFrame(rafRef.current)
      ownerMarkerRef.current?.remove()
      destMarkersRef.current.forEach((m) => m.remove())
      ownerMarkerRef.current = null
      destMarkersRef.current = []
      destElsRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Toggle interactivity
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (interactive) {
      map.scrollZoom.enable(); map.dragPan.enable(); map.touchZoomRotate.enable()
    } else {
      map.scrollZoom.disable(); map.dragPan.disable(); map.touchZoomRotate.disable()
    }
  }, [interactive])

  // ESC to exit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setInteractive(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Destinations + route
  useEffect(() => {
    const map = mapRef.current
    if (!map || destinations.length === 0) return

    const apply = () => {
      const groups = groupByCity(destinations)
      const routeCoords = groups.map((g) => [g[0].lng, g[0].lat] as [number, number])

      if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: routeCoords } },
        })
        map.addLayer({ id: 'route-base', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#00cc44', 'line-width': 1.5, 'line-opacity': 0.25 } })
        map.addLayer({ id: 'route-animated', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#00cc44', 'line-width': 2.5, 'line-opacity': 0.85, 'line-dasharray': [0, 2, 4] } })
        rafRef.current = startRouteAnimation(map)
      }

      destMarkersRef.current.forEach((m) => m.remove())
      destMarkersRef.current = []
      destElsRef.current = []

      groups.forEach((group) => {
        const el = makeDestinationEl(group, TOKEN)
        el.addEventListener('click', () => setActiveGroup(group))
        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom', rotationAlignment: 'viewport' })
          .setLngLat([group[0].lng, group[0].lat])
          .addTo(map)
        destMarkersRef.current.push(marker)
        destElsRef.current.push(el)
      })

      scalePins(map.getZoom())

    }

    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [destinations])

  // Hardcoded SFO → Houston segment
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      if (map.getSource('sfo-houston')) return
      map.addSource('sfo-houston', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[-122.4194, 37.7749], [-95.3698, 29.7604]] } },
      })
      map.addLayer({ id: 'sfo-houston-base', type: 'line', source: 'sfo-houston', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#00cc44', 'line-width': 1.5, 'line-opacity': 0.25 } })
      map.addLayer({ id: 'sfo-houston-animated', type: 'line', source: 'sfo-houston', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#00cc44', 'line-width': 2.5, 'line-opacity': 0.85, 'line-dasharray': [0, 2, 4] } })
      startRouteAnimation(map, 'sfo-houston-animated')
    }
    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [])

  // Owner pin only
  useEffect(() => {
    const map = mapRef.current
    if (!map || travelers.length === 0) return

    const apply = () => {
      ownerMarkerRef.current?.remove()
      ownerMarkerRef.current = null

      const owner = travelers.find((t) => t.is_owner)
      if (!owner) return

      const el = makeOwnerEl(owner)
      const popup = new mapboxgl.Popup({ closeButton: false, className: 'map-popup', offset: 30 })
        .setHTML(`<div style="font-family:Inter,sans-serif;min-width:140px;"><div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:2px;">${owner.name}</div><div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:${owner.note ? '5px' : '0'};">📍 ${owner.current_city}</div>${owner.note ? `<div style="font-size:11px;color:rgba(255,255,255,0.6);line-height:1.5;">${owner.note}</div>` : ''}</div>`)

      ownerMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([owner.lng, owner.lat])
        .setPopup(popup)
        .addTo(map)
    }

    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [travelers])


  if (!TOKEN) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#070d07' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Add <code style={{ color: '#00cc44' }}>VITE_MAPBOX_TOKEN</code> to .env.local</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, transparent 18%, transparent 75%, rgba(8,8,8,0.5) 100%),' +
            'linear-gradient(to right, rgba(8,8,8,0.3) 0%, transparent 15%, transparent 85%, rgba(8,8,8,0.3) 100%)',
        }}
      />

      {/* Explore overlay */}
      <AnimatePresence>
        {!interactive && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-end justify-center pb-12 cursor-pointer"
            onClick={() => setInteractive(true)}
          >
            <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.6) 0%, transparent 100%)' }} />
            <motion.button
              onClick={() => setInteractive(true)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="relative z-10 flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-medium tracking-wider"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', color: 'rgba(255,255,255,0.75)' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="6" cy="6" r="2" fill="currentColor"/>
              </svg>
              Explore map
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit button */}
      <AnimatePresence>
        {interactive && (
          <motion.button
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            onClick={() => setInteractive(false)}
            className="absolute top-20 right-8 z-20 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wider"
            style={{ background: 'rgba(8,8,8,0.85)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', color: 'rgba(255,255,255,0.6)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Exit map · Esc
          </motion.button>
        )}
      </AnimatePresence>

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute top-20 left-8 flex items-center gap-4 pointer-events-none"
      >
        <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>01</span>
        <div className="h-px w-10" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>The Journey</span>
      </motion.div>


      <DestinationPanel destinations={activeGroup} onClose={() => setActiveGroup(null)} />
    </div>
  )
}
