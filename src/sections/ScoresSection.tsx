import { motion } from 'framer-motion'

const matches = [
  {
    opponent: 'Morocco',
    flag: '🇲🇦',
    porScore: 2,
    oppScore: 0,
    date: 'Jun 17',
    venue: 'New York',
    status: 'FT' as const,
    goals: ["Cristiano Ronaldo 34'", "Bruno Fernandes 71'"],
  },
  {
    opponent: 'Uruguay',
    flag: '🇺🇾',
    porScore: 1,
    oppScore: 1,
    date: 'Jun 22',
    venue: 'Los Angeles',
    status: 'FT' as const,
    goals: ["Bernardo Silva 58'"],
  },
  {
    opponent: 'South Korea',
    flag: '🇰🇷',
    porScore: null,
    oppScore: null,
    date: 'Jun 27',
    venue: 'Miami',
    status: 'UP' as const,
    goals: [],
  },
]

const table = [
  { pos: 1, team: 'Portugal', flag: '🇵🇹', p: 2, w: 1, d: 1, l: 0, gd: '+2', pts: 4, mine: true },
  { pos: 2, team: 'Uruguay', flag: '🇺🇾', p: 2, w: 1, d: 1, l: 0, gd: '0', pts: 4, mine: false },
  { pos: 3, team: 'Morocco', flag: '🇲🇦', p: 2, w: 0, d: 1, l: 1, gd: '-2', pts: 1, mine: false },
  { pos: 4, team: 'S. Korea', flag: '🇰🇷', p: 1, w: 0, d: 0, l: 1, gd: '-3', pts: 0, mine: false },
]

export default function ScoresSection() {
  return (
    <div className="relative min-h-screen" style={{ background: '#080808' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 100% 50%, rgba(204,0,0,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 px-8 md:px-16 lg:px-24 pt-24 pb-24 max-w-screen-xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>02</span>
          <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Match Results</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Heading */}
          <div className="lg:col-span-2">
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
                  background: 'linear-gradient(110deg, #CC0000, #ff6666)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Scores
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
              Live results, group standings, and goalscorers.
              Updated every 5 minutes via football-data.org.
            </motion.p>

            {/* Group table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-10 rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Group A
                </span>
              </div>
              {table.map((row, i) => (
                <div
                  key={row.team}
                  className="flex items-center px-4 py-3 text-xs"
                  style={{
                    background: row.mine ? 'rgba(0,204,68,0.06)' : 'transparent',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                  }}
                >
                  <span className="w-5" style={{ color: 'rgba(255,255,255,0.2)' }}>{row.pos}</span>
                  <span className="flex-1 flex items-center gap-2">
                    <span>{row.flag}</span>
                    <span style={{ color: row.mine ? '#ffffff' : 'rgba(255,255,255,0.55)', fontWeight: row.mine ? 600 : 400 }}>
                      {row.team}
                    </span>
                  </span>
                  <span className="w-6 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{row.p}</span>
                  <span className="w-6 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{row.w}</span>
                  <span className="w-6 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{row.d}</span>
                  <span className="w-6 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{row.l}</span>
                  <span className="w-10 text-right font-semibold tabular-nums" style={{ color: row.mine ? '#C8A200' : 'rgba(255,255,255,0.55)' }}>
                    {row.pts}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Match cards */}
          <div className="lg:col-span-3 space-y-4">
            {matches.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="rounded-2xl p-6"
                style={{
                  background: m.status === 'UP' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
                  border: m.status === 'FT' && m.porScore! > m.oppScore!
                    ? '1px solid rgba(0,204,68,0.2)'
                    : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Status + venue */}
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="text-[9px] tracking-[0.3em] uppercase font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: m.status === 'UP' ? 'rgba(200,162,0,0.15)' : 'rgba(0,204,68,0.12)',
                      color: m.status === 'UP' ? '#C8A200' : '#00cc44',
                    }}
                  >
                    {m.status === 'UP' ? 'Upcoming' : 'Full Time'}
                  </span>
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {m.date} · {m.venue}
                  </span>
                </div>

                {/* Score row */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">🇵🇹</span>
                    <div>
                      <div className="text-xs font-semibold text-white">Portugal</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>POR</div>
                    </div>
                  </div>

                  <div className="text-center px-4">
                    {m.status === 'UP' ? (
                      <div
                        className="text-[11px] tracking-[0.2em] uppercase"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      >
                        vs
                      </div>
                    ) : (
                      <div
                        style={{
                          fontFamily: 'Bebas Neue, sans-serif',
                          fontSize: 36,
                          letterSpacing: '0.05em',
                          color: '#ffffff',
                        }}
                      >
                        {m.porScore} — {m.oppScore}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-1 flex-row-reverse text-right">
                    <span className="text-3xl">{m.flag}</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{m.opponent}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {m.opponent.slice(0, 3).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goals */}
                {m.goals.length > 0 && (
                  <div className="mt-4 pt-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {m.goals.map((g, gi) => (
                      <span
                        key={gi}
                        className="text-[11px] px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}
                      >
                        ⚽ {g}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
