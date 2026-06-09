import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPhotosByDestination, getPhotoUrl } from '../lib/supabase'
import Lightbox from './Lightbox'
import type { Destination, Photo } from '../types'

interface Props {
  destination: Destination | null
  onClose: () => void
}

export default function DestinationPanel({ destination, onClose }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!destination) { setPhotos([]); return }
    setLoading(true)
    getPhotosByDestination(destination.id)
      .then(setPhotos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [destination?.id])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <AnimatePresence>
        {destination && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90]"
              style={{ background: 'rgba(0,0,0,0.35)' }}
              onClick={onClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 36 }}
              className="fixed top-0 right-0 bottom-0 z-[100] flex flex-col overflow-hidden"
              style={{
                width: 'min(420px, 100vw)',
                background: 'rgba(10,10,10,0.97)',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-start justify-between px-7 pt-8 pb-6 shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <div
                    className="text-[10px] tracking-[0.35em] uppercase mb-2"
                    style={{ color: '#00cc44' }}
                  >
                    {destination.date_range ?? 'Destination'}
                  </div>
                  <h2
                    style={{
                      fontFamily: 'Bebas Neue, sans-serif',
                      fontSize: 48,
                      lineHeight: 0.9,
                      letterSpacing: '0.02em',
                      color: '#ffffff',
                    }}
                  >
                    {destination.city}
                  </h2>
                  {destination.description && (
                    <p
                      className="mt-3 text-sm leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}
                    >
                      {destination.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ml-4"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Photos */}
              <div className="flex-1 overflow-y-auto px-7 py-6">
                {loading && (
                  <div
                    className="text-xs tracking-widest uppercase text-center py-12"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  >
                    Loading photos…
                  </div>
                )}

                {!loading && photos.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                        <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(255,255,255,0.2)" />
                        <path d="M3 16l5-5 4 4 3-3 6 6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-white">No photos yet</p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      Upload photos from the admin panel
                    </p>
                  </div>
                )}

                {!loading && photos.length > 0 && (
                  <div className="columns-2 gap-3 space-y-3">
                    {photos.map((photo, i) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        className="break-inside-avoid group relative rounded-xl overflow-hidden cursor-pointer"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                        onClick={() => setLightboxIndex(i)}
                      >
                        <img
                          src={getPhotoUrl(photo.storage_path)}
                          alt={photo.caption ?? destination.city}
                          className="w-full object-cover"
                          style={{ display: 'block' }}
                        />
                        {/* Hover overlay */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3"
                          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }}
                        >
                          {photo.caption && (
                            <p className="text-xs text-white leading-tight">{photo.caption}</p>
                          )}
                        </div>
                        {/* Expand icon */}
                        <div
                          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          style={{ background: 'rgba(0,0,0,0.6)' }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 9l8-8M6 1h3v3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
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

      {/* Lightbox */}
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
