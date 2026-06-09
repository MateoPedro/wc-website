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
  const [matchesRes, standingsRes] = await Promise.all([
    fetch('/api/scores'),
    fetch('/api/standings'),
  ])

  const matchesJson = await matchesRes.json()
  const standingsJson = await standingsRes.json()

  const matches: FDMatch[] = matchesJson.matches ?? matchesJson ?? []

  // Find Group K in standings
  const groups: { stage: string; table: FDStandingRow[] }[] = standingsJson.standings ?? []
  const groupK = groups.find((g) => g.stage === 'GROUP_STAGE')?.table ?? []

  // Filter to only Group K teams (Portugal's group)
  const porMatch = matches[0]
  const groupTeamIds = new Set<number>()
  if (porMatch) {
    matches.forEach((m) => {
      groupTeamIds.add(m.homeTeam.id)
      groupTeamIds.add(m.awayTeam.id)
    })
  }

  const standings = groupK.filter(
    (row) => groupTeamIds.size === 0 || groupTeamIds.has(row.team.id),
  )

  return { matches, standings }
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
