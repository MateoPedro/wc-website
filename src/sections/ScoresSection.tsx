import { motion } from 'framer-motion'
import { useScores } from '../hooks/useScores'
import { isPortugal, formatKickoff, type FDMatch, type FDStandingRow } from '../lib/footballData'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// ── Match card ────────────────────────────────────────────

function statusBadge(status: FDMatch['status']) {
  if (status === 'IN_PLAY' || status === 'PAUSED') {
    return { label: '● Live', color: '#ff4444', bg: 'rgba(255,68,68,0.12)' }
  }
  if (status === 'FINISHED') {
    return { label: 'Full Time', color: '#00cc44', bg: 'rgba(0,204,68,0.1)' }
  }
  return { label: 'Upcoming', color: '#C8A200', bg: 'rgba(200,162,0,0.12)' }
}

function MatchCard({ match, index }: { match: FDMatch; index: number }) {
  const porIsHome = isPortugal(match.homeTeam.id)
  const por = porIsHome ? match.homeTeam : match.awayTeam
  const opp = porIsHome ? match.awayTeam : match.homeTeam
  const porScore = porIsHome ? match.score.fullTime.home : match.score.fullTime.away
  const oppScore = porIsHome ? match.score.fullTime.away : match.score.fullTime.home
  const finished = match.status === 'FINISHED'
  const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const badge = statusBadge(match.status)

  const porWon = finished && porScore !== null && oppScore !== null && porScore > oppScore
  const drew = finished && porScore !== null && oppScore !== null && porScore === oppScore

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: EASE }}
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${porWon ? 'rgba(0,204,68,0.25)' : drew ? 'rgba(200,162,0,0.2)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* Status + date */}
      <div className="flex items-center justify-between mb-5">
        <span
          className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {formatKickoff(match.utcDate)}
        </span>
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-4">
        {/* Portugal */}
        <div className="flex items-center gap-3 flex-1">
          <img src={por.crest} alt={por.name} className="w-9 h-9 object-contain" />
          <div>
            <div className="text-sm font-semibold text-white">{por.name}</div>
            <div className="text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.3)' }}>POR</div>
          </div>
        </div>

        {/* Score */}
        <div className="text-center px-3 shrink-0">
          {(finished || live) && porScore !== null && oppScore !== null ? (
            <div
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 38,
                letterSpacing: '0.08em',
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {porScore} — {oppScore}
            </div>
          ) : (
            <div
              className="text-[11px] tracking-[0.25em] uppercase"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              vs
            </div>
          )}
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-3 flex-1 flex-row-reverse text-right">
          <img src={opp.crest} alt={opp.name} className="w-9 h-9 object-contain" />
          <div>
            <div className="text-sm font-semibold text-white">{opp.name}</div>
            <div className="text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {opp.name.slice(0, 3).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Standing row ──────────────────────────────────────────

function StandingRow({ row, index }: { row: FDStandingRow; index: number }) {
  const mine = isPortugal(row.team.id)
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.05 * index, duration: 0.5, ease: EASE }}
      className="flex items-center px-4 py-3 text-sm"
      style={{
        background: mine ? 'rgba(0,204,68,0.07)' : 'transparent',
        borderTop: index > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined,
      }}
    >
      <span className="w-6 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{row.position}</span>
      <div className="flex items-center gap-2.5 flex-1">
        <img src={row.team.crest} alt={row.team.name} className="w-5 h-5 object-contain" />
        <span
          className="text-sm"
          style={{ color: mine ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: mine ? 600 : 400 }}
        >
          {row.team.name}
        </span>
      </div>
      {[row.playedGames, row.won, row.draw, row.lost, row.goalDifference].map((v, i) => (
        <span key={i} className="w-8 text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {typeof v === 'number' && v > 0 ? `+${v}` === `+${v}` && i === 4 ? (v > 0 ? `+${v}` : v) : v : v}
        </span>
      ))}
      <span
        className="w-10 text-right text-sm font-semibold tabular-nums"
        style={{ color: mine ? '#C8A200' : 'rgba(255,255,255,0.6)' }}
      >
        {row.points}
      </span>
    </motion.div>
  )
}

// ── Section ───────────────────────────────────────────────

export default function ScoresSection() {
  const { data, loading, error } = useScores()

  return (
    <div className="relative min-h-screen" style={{ background: '#080808' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 100% 30%, rgba(204,0,0,0.06) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 px-8 md:px-16 lg:px-24 pt-24 pb-24 max-w-screen-xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>02</span>
          <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Match Results</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Left: heading + standings */}
          <div className="lg:col-span-2">
            <motion.h2
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 'clamp(60px, 8vw, 120px)',
                lineHeight: 0.9, letterSpacing: '0.02em',
              }}
            >
              <span className="text-white">The</span>
              <br />
              <span style={{
                background: 'linear-gradient(110deg, #CC0000, #ff6666)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Scores
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-sm leading-relaxed max-w-xs"
              style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}
            >
              Portugal Group K results, live scores, and standings.
              Updated daily.
            </motion.p>

            {/* Group standings */}
            {data && data.standings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.7 }}
                className="mt-10 rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Header */}
                <div
                  className="flex items-center px-4 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="w-6" />
                  <span className="flex-1 text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Group K</span>
                  {['P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => (
                    <span key={h} className="w-8 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{h}</span>
                  ))}
                </div>
                {data.standings.map((row, i) => (
                  <StandingRow key={row.team.id} row={row} index={i} />
                ))}
              </motion.div>
            )}

            {/* Loading / error states */}
            {loading && (
              <div className="mt-10 text-xs tracking-widest uppercase animate-pulse" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Loading…
              </div>
            )}
            {error && (
              <div className="mt-10 text-xs" style={{ color: 'rgba(204,0,0,0.6)' }}>
                {error}
              </div>
            )}
          </div>

          {/* Right: match cards */}
          <div className="lg:col-span-3 space-y-4">
            {loading && !data && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            )}

            {data?.matches.map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} />
            ))}

            {data && data.matches.length === 0 && (
              <div className="flex items-center justify-center h-40 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No fixtures found — tournament may not have started yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
