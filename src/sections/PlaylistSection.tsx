import { motion } from 'framer-motion'

const vibes = ['Anthems', 'Road trips', 'Match day', 'Late nights', 'Saudade']

function getSpotifyEmbedUrl(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/)
  if (!match) return null
  return `https://open.spotify.com/embed/playlist/${match[1]}?utm_source=generator&theme=0`
}

export default function PlaylistSection({ spotifyUrl }: { spotifyUrl?: string }) {
  const embedUrl = spotifyUrl ? getSpotifyEmbedUrl(spotifyUrl) : null
  const playlistId = spotifyUrl?.match(/playlist\/([a-zA-Z0-9]+)/)?.[1]

  return (
    <div className="relative min-h-screen" style={{ background: '#080808' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 60% at 0% 100%, rgba(200,162,0,0.07) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 px-8 md:px-16 lg:px-24 pt-24 pb-32 max-w-screen-xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>03</span>
          <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Soundtrack</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
          {/* Left — heading + editorial text + vibes */}
          <div className="flex flex-col">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 'clamp(60px, 7vw, 110px)',
                lineHeight: 0.9,
                letterSpacing: '0.02em',
              }}
            >
              <span className="text-white">The</span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(110deg, #C8A200, #ffd54f)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Playlist
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-sm leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300, maxWidth: '28ch' }}
            >
              The trip's soundtrack. Updated on the road — from Lisbon to Los Angeles.
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="mt-10 h-px origin-left"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />

            {/* Vibe tags */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <p className="text-[10px] tracking-[0.35em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Vibes
              </p>
              <div className="flex flex-wrap gap-2">
                {vibes.map((vibe, i) => (
                  <motion.span
                    key={vibe}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.45 + i * 0.07 }}
                    className="px-3 py-1.5 text-[11px] tracking-wider rounded-full"
                    style={{
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.4)',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {vibe}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Open in Spotify link */}
            {playlistId && (
              <motion.a
                href={`https://open.spotify.com/playlist/${playlistId}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-12 inline-flex items-center gap-3 group w-fit"
              >
                {/* Spotify icon */}
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: '#1DB954' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#000">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </span>
                <span
                  className="text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 group-hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Open in Spotify
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M1 9L9 1M9 1H3M9 1v6" />
                </svg>
              </motion.a>
            )}
          </div>

          {/* Right — Spotify embed or vinyl */}
          <div>
            {embedUrl ? (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="500"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ border: 'none', display: 'block' }}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.9 }}
                className="flex items-center justify-center"
                style={{ minHeight: 400 }}
              >
                <div className="relative w-56 h-56">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="w-full h-full rounded-full relative overflow-hidden"
                    style={{
                      background: 'conic-gradient(from 0deg, #111 0%, #1e1e1e 25%, #0d0d0d 50%, #222 75%, #111 100%)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 0 60px rgba(200,162,0,0.08)',
                    }}
                  >
                    {[0.25, 0.42, 0.58, 0.72].map((r) => (
                      <div
                        key={r}
                        className="absolute rounded-full border"
                        style={{
                          top: `${(1 - r) * 50}%`,
                          left: `${(1 - r) * 50}%`,
                          width: `${r * 100}%`,
                          height: `${r * 100}%`,
                          borderColor: 'rgba(255,255,255,0.04)',
                        }}
                      />
                    ))}
                  </motion.div>
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex flex-col items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #C8A200, #a07800)', zIndex: 2 }}
                  >
                    <span className="text-black text-[8px] font-bold tracking-wider">POR</span>
                    <span className="text-black text-[7px] opacity-70 tracking-widest">2026</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
