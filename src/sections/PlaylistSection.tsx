import { motion } from 'framer-motion'

const tracks = [
  { n: '01', title: 'Heróis do Mar', artist: 'Rui Veloso', dur: '3:42' },
  { n: '02', title: 'Feeling Good', artist: 'Nina Simone', dur: '2:58' },
  { n: '03', title: 'Seven Nation Army', artist: 'The White Stripes', dur: '3:51' },
  { n: '04', title: 'Lisboa', artist: 'David Fonseca', dur: '4:10' },
  { n: '05', title: "Wavin' Flag", artist: "K'naan", dur: '3:32' },
  { n: '06', title: 'Eye of the Tiger', artist: 'Survivor', dur: '4:05' },
  { n: '07', title: 'We Will Rock You', artist: 'Queen', dur: '2:02' },
]

export default function PlaylistSection() {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Heading + vinyl */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 'clamp(60px, 8vw, 120px)',
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
              className="mt-6 text-sm leading-relaxed max-w-xs"
              style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}
            >
              The trip's soundtrack, live from Spotify. Updated on the road.
            </motion.p>

            {/* Vinyl */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.9 }}
              className="mt-12 relative w-56 h-56"
            >
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

              {/* Center label */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex flex-col items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C8A200, #a07800)', zIndex: 2 }}
              >
                <span className="text-black text-[8px] font-bold tracking-wider">POR</span>
                <span className="text-black text-[7px] opacity-70 tracking-widest">2026</span>
              </div>

              {/* Spotify badge */}
              <div
                className="absolute -bottom-2 -right-2 rounded-full px-3 py-1.5 text-[10px] font-semibold"
                style={{ background: '#1DB954', color: '#000' }}
              >
                Spotify
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-10 text-[11px] tracking-wider"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              Admin pastes a Spotify URL → embed appears here · Phase 7
            </motion.p>
          </div>

          {/* Track list */}
          <div className="space-y-0">
            {tracks.map((track, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="group flex items-center gap-5 py-5 cursor-pointer"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span
                  className="text-[11px] tabular-nums w-6 shrink-0"
                  style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}
                >
                  {track.n}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate group-hover:text-[#C8A200] transition-colors duration-200">
                    {track.title}
                  </div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {track.artist}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                  >
                    {track.dur}
                  </span>
                  {/* Play icon on hover */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <svg width="8" height="10" viewBox="0 0 8 10" fill="rgba(255,255,255,0.6)">
                      <path d="M0 0l8 5-8 5V0z" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
