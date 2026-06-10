import { motion } from 'framer-motion'
import { useLeaderboard } from '../hooks/useSupabase'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const JOIN_URL = 'https://wcpredictor.app/groups/7cf92df3-819a-459f-8161-0374b6dc82bd'

const MEDAL: Record<number, { color: string; label: string }> = {
  1: { color: '#C8A200', label: '1ST' },
  2: { color: '#9ca3af', label: '2ND' },
  3: { color: '#b45309', label: '3RD' },
}

export default function PredictorSection() {
  const { data: entries, loading } = useLeaderboard()

  return (
    <div className="relative min-h-screen" style={{ background: '#080808' }}>
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 100% 0%, rgba(200,162,0,0.06) 0%, transparent 60%)',
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
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>04</span>
          <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Predictor</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 items-start">

          {/* Left — heading + leaderboard */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 'clamp(60px, 8vw, 120px)',
                lineHeight: 0.9,
                letterSpacing: '0.02em',
              }}
            >
              <span className="text-white">Who's</span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(110deg, #C8A200, #ffd54f)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Winning
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-5 text-sm leading-relaxed max-w-sm"
              style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}
            >
              Live standings from our prediction group. Updated after every match.
            </motion.p>

            {/* Leaderboard table */}
            <div className="mt-12">
              {loading && (
                <div className="flex items-center gap-3 py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <div className="w-1 h-1 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              {!loading && entries.length === 0 && (
                <p className="text-sm py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  No entries yet — add players in the admin panel.
                </p>
              )}

              {!loading && entries.length > 0 && (
                <div>
                  {/* Header row */}
                  <div
                    className="grid gap-4 pb-3 mb-1 text-[10px] tracking-[0.3em] uppercase"
                    style={{
                      gridTemplateColumns: '40px 1fr 80px 80px',
                      color: 'rgba(255,255,255,0.2)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span>#</span>
                    <span>Player</span>
                    <span className="text-right">Pts</span>
                    <span className="text-right">Correct</span>
                  </div>

                  {entries.map((entry, i) => {
                    const rank = i + 1
                    const medal = MEDAL[rank]
                    const isTop3 = rank <= 3

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06, duration: 0.6, ease: EASE }}
                        className="grid gap-4 py-4 items-center"
                        style={{
                          gridTemplateColumns: '40px 1fr 80px 80px',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: isTop3 ? `linear-gradient(90deg, ${medal.color}08 0%, transparent 60%)` : 'transparent',
                        }}
                      >
                        {/* Rank */}
                        <span
                          style={{
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontSize: 22,
                            color: medal ? medal.color : 'rgba(255,255,255,0.2)',
                            letterSpacing: '0.05em',
                            lineHeight: 1,
                          }}
                        >
                          {rank}
                        </span>

                        {/* Name */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                            style={{
                              background: medal ? `${medal.color}22` : 'rgba(255,255,255,0.06)',
                              color: medal ? medal.color : 'rgba(255,255,255,0.4)',
                              border: `1px solid ${medal ? medal.color + '44' : 'rgba(255,255,255,0.08)'}`,
                            }}
                          >
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className="text-sm font-medium truncate"
                            style={{ color: isTop3 ? '#ffffff' : 'rgba(255,255,255,0.7)' }}
                          >
                            {entry.name}
                          </span>
                          {rank === 1 && (
                            <span className="text-xs shrink-0">👑</span>
                          )}
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <span
                            style={{
                              fontFamily: 'Bebas Neue, sans-serif',
                              fontSize: 20,
                              color: medal ? medal.color : 'rgba(255,255,255,0.6)',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {entry.points}
                          </span>
                          <div className="text-[9px] tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            pts
                          </div>
                        </div>

                        {/* Correct predictions */}
                        <div className="text-right">
                          <span
                            className="text-sm"
                            style={{ color: 'rgba(255,255,255,0.4)' }}
                          >
                            {entry.correct_predictions}
                          </span>
                          <div className="text-[9px] tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            exact
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — join CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
            className="lg:sticky lg:top-28"
          >
            <div
              className="rounded-2xl p-8 flex flex-col gap-6"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              {/* Trophy */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'rgba(200,162,0,0.1)', border: '1px solid rgba(200,162,0,0.2)' }}
              >
                🏆
              </div>

              <div>
                <h3
                  className="text-white font-semibold text-lg leading-snug"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  Play the predictor
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}
                >
                  Predict every Portugal match and compete with the group. Who's got the best football brain?
                </p>
              </div>

              <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

              <ul className="space-y-2">
                {['Predict scores before each match', 'Earn points for correct results', 'Bonus points for exact scores'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ color: '#00cc44' }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={JOIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 group"
                style={{
                  background: 'linear-gradient(110deg, #C8A200, #a07800)',
                  color: '#000',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <span>Join the group</span>
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  <path d="M1 13L13 1M13 1H5M13 1v8" />
                </svg>
              </a>

              <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.15)' }}>
                Opens wcpredictor.app
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
