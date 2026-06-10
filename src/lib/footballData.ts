export interface FDMatch {
  id: number
  utcDate: string
  status: 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED'
  stage: string
  group: string
  homeTeam: { id: number; name: string; crest: string }
  awayTeam: { id: number; name: string; crest: string }
  score: {
    winner: string | null
    fullTime: { home: number | null; away: number | null }
  }
}

export interface FDStandingRow {
  position: number
  team: { id: number; name: string; crest: string }
  playedGames: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string | null
}

export interface ScoresData {
  matches: FDMatch[]
  standings: FDStandingRow[]
}

const PORTUGAL_ID = 765

export async function fetchScores(): Promise<ScoresData> {
  const res = await fetch('/api/scores')
  if (!res.ok) throw new Error(`Scores API ${res.status}`)
  const json = await res.json()
  // api/scores.ts already returns { matches, standings } combined
  return {
    matches: json.matches ?? [],
    standings: json.standings ?? [],
  }
}

export function isPortugal(id: number) {
  return id === PORTUGAL_ID
}

export function formatKickoff(utcDate: string): string {
  return new Date(utcDate).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    timeZoneName: 'short',
  })
}
