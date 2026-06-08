import { motion } from 'framer-motion'

const cities = [
  { name: 'New York', country: 'USA', coords: '40.7128° N, 74.0060° W', date: 'Jun 14' },
  { name: 'Los Angeles', country: 'USA', coords: '34.0522° N, 118.2437° W', date: 'Jun 19' },
  { name: 'Miami', country: 'USA', coords: '25.7617° N, 80.1918° W', date: 'Jun 24' },
  { name: 'Dallas', country: 'USA', coords: '32.7767° N, 96.7970° W', date: 'Jun 28' },
  { name: 'Kansas City', country: 'USA', coords: '39.0997° N, 94.5786° W', date: 'Jul 3' },
  { name: 'Vancouver', country: 'Canada', coords: '49.2827° N, 123.1207° W', date: 'Jul 10' },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const reveal = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

export default function MapSection() {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: '#070d07' }}>
      {/* Green radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(0,102,0,0.15) 0%, transparent 65%)',
        }}
      />

      {/* Pitch grid lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.04 }}
      >
        <rect x="6%" y="8%" width="88%" height="84%" fill="none" stroke="white" strokeWidth="1" />
        <line x1="50%" y1="8%" x2="50%" y2="92%" stroke="white" strokeWidth="1" />
        <circle cx="50%" cy="50%" r="10%" fill="none" stroke="white" strokeWidth="1" />
        <rect x="6%" y="30%" width="13%" height="40%" fill="none" stroke="white" strokeWidth="1" />
        <rect x="81%" y="30%" width="13%" height="40%" fill="none" stroke="white" strokeWidth="1" />
      </svg>

      <div className="relative z-10 flex flex-col px-8 md:px-16 lg:px-24 pt-24 pb-16 max-w-screen-xl mx-auto w-full">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-12"
        >
          <span
            className="text-[10px] tracking-[0.4em] uppercase"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            01
          </span>
          <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span
            className="text-[10px] tracking-[0.4em] uppercase"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            The Journey
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: heading + cities */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 'clamp(60px, 9vw, 130px)',
                lineHeight: 0.9,
                color: '#ffffff',
                letterSpacing: '0.02em',
              }}
            >
              Live
              <br />
              <span
                style={{
                  background: 'linear-gradient(110deg, #00cc44 0%, #006600 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Tracker
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 max-w-xs text-sm leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}
            >
              Follow every traveler in real time across North America.
              Pins, photos, and notes updated throughout the trip.
            </motion.p>

            {/* City list */}
            <div className="mt-10 space-y-0">
              {cities.map((city, i) => (
                <motion.div
                  key={city.name}
                  variants={reveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center justify-between py-4 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#00cc44', flexShrink: 0 }}
                    />
                    <div>
                      <div className="text-sm font-medium text-white">{city.name}</div>
                      <div
                        className="text-[10px] tracking-wider mt-0.5"
                        style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}
                      >
                        {city.coords}
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-xs tabular-nums"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {city.date}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: map placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="relative rounded-2xl overflow-hidden aspect-square lg:aspect-auto lg:h-[600px]"
            style={{ border: '1px solid rgba(0,204,68,0.12)', background: 'rgba(0,20,0,0.5)' }}
          >
            {/* Radar rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[0.3, 0.55, 0.8].map((scale, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border"
                  style={{
                    width: `${scale * 100}%`,
                    height: `${scale * 100}%`,
                    borderColor: 'rgba(0,204,68,0.08)',
                  }}
                  animate={{ scale: [1, 1.03, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8 }}
                />
              ))}
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: '#00cc44', boxShadow: '0 0 20px #00cc44, 0 0 40px rgba(0,204,68,0.3)' }}
              />
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <div
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{ color: 'rgba(0,204,68,0.5)' }}
              >
                Mapbox Interactive Map
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                Traveler pins + animated routes · Phase 4
              </div>
            </div>

            {/* Scan line animation */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, transparent 45%, rgba(0,204,68,0.03) 50%, transparent 55%)',
              }}
              animate={{ y: ['-50%', '150%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
