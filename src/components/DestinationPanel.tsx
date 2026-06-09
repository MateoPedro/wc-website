import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPhotosByDestination, getPhotoUrl } from '../lib/supabase'
import Lightbox from './Lightbox'
import type { Destination, Photo } from '../types'

interface Props {
  destinations: Destination[] | null
  onClose: () => void
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    GROUP_STAGE: 'Group Stage',
    ROUND_OF_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-final',
    SEMI_FINALS: 'Semi-final',
    FINAL: 'Final',
  }
  return map[stage] ?? stage
}

export default function DestinationPanel({ destinations, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const active = destinations?.[activeIndex] ?? null
  const matchInfo = active?.match_info as Record<string, unknown> | null

  // Reset tab when panel opens for a new location
  useEffect(() => {
    if (destinations) setActiveIndex(0)
  }, [destinations?.[0]?.city])

  // Fetch photos for active match
  useEffect(() => {
    if (!active) { setPhotos([]); return }
    setLoadingPhotos(true)
    getPhotosByDestination(active.id)
      .then(setPhotos)
      .catch(console.error)
      .finally(() => setLoadingPhotos(false))
  }, [active?.id])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const city = destinations?.[0]?.city ?? ''
  const venue = matchInfo ? String(matchInfo.venue ?? '') : ''

  return (
    <>
      <AnimatePresence>
        {destinations && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90]"
              style={{ background: 'rgba(0,0,0,0.35)' }}
              onClick={onClose}
            />

            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 36 }}
              className="fixed top-0 right-0 bottom-0 z-[100] flex flex-col overflow-hidden"
              style={{
                width: 'min(440px, 100vw)',
                background: 'rgba(10,10,10,0.97)',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Header */}
              <div className="shrink-0 px-7 pt-8 pb-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: '#00cc44' }}>
                      Group K · {destinations.length === 1 ? '1 match' : `${destinations.length} matches`}
                    </div>
                    <h2 style={{
                      fontFamily: 'Bebas Neue, sans-serif',
                      fontSize: 52, lineHeight: 0.9,
                      letterSpacing: '0.02em', color: '#ffffff',
                    }}>
                      {city}
                    </h2>
                    {venue && (
                      <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{venue}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-1 shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1l10 10M11 1L1 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Match tabs */}
                {destinations.length > 1 && (
                  <div className="flex gap-2 pb-0">
                    {destinations.map((d, i) => {
                      const mi = d.match_info as Record<string, unknown> | null
                      const opp = mi ? String(mi.opponent ?? '') : d.date_range ?? ''
                      return (
                        <button
                          key={d.id}
                          onClick={() => setActiveIndex(i)}
                          className="pb-3 text-xs font-medium transition-colors relative whitespace-nowrap"
                          style={{ color: activeIndex === i ? '#fff' : 'rgba(255,255,255,0.35)' }}
                        >
                          {d.date_range} · {opp}
                          {activeIndex === i && (
                            <motion.div
                              layoutId="tab-indicator"
                              className="absolute bottom-0 left-0 right-0 h-px"
                              style={{ background: '#00cc44' }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Match detail */}
              {active && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 mx-7 mt-5 rounded-xl p-4"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {matchInfo ? (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="text-[10px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {stageLabel(String(matchInfo.stage ?? ''))}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-white">🇵🇹 Portugal</span>
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>vs</span>
                            <span className="text-sm font-semibold text-white">{String(matchInfo.opponent ?? '')}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-medium text-white">{active.date_range}</div>
                          <div
                            className="text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block"
                            style={{
                              background: String(matchInfo.status) === 'FINISHED'
                                ? 'rgba(0,204,68,0.15)' : 'rgba(200,162,0,0.15)',
                              color: String(matchInfo.status) === 'FINISHED' ? '#00cc44' : '#C8A200',
                            }}
                          >
                            {String(matchInfo.status) === 'TIMED' ? 'Upcoming'
                              : String(matchInfo.status) === 'IN_PLAY' ? '🔴 Live'
                              : 'Full Time'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{active.description}</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Photos */}
              <div className="flex-1 overflow-y-auto px-7 py-5">
                <div className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Photos
                </div>

                {loadingPhotos && (
                  <div className="text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Loading…
                  </div>
                )}

                {!loadingPhotos && photos.length === 0 && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                        <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(255,255,255,0.2)" />
                        <path d="M3 16l5-5 4 4 3-3 6 6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-white">No photos yet</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Upload from the admin panel
                    </p>
                  </div>
                )}

                {!loadingPhotos && photos.length > 0 && (
                  <div className="columns-2 gap-3 space-y-3">
                    {photos.map((photo, i) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="break-inside-avoid group relative rounded-xl overflow-hidden cursor-pointer"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                        onClick={() => setLightboxIndex(i)}
                      >
                        <img
                          src={getPhotoUrl(photo.storage_path)}
                          alt={photo.caption ?? city}
                          className="w-full object-cover"
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3"
                          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%)' }}
                        >
                          {photo.caption && <p className="text-xs text-white leading-tight">{photo.caption}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxIndex !== null && photos.length > 0 && (
          <Lightbox
            photos={photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNav={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </>
  )
}
