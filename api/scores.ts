import type { VercelRequest, VercelResponse } from '@vercel/node'

const PORTUGAL_ID = 765
const BASE = 'https://api.football-data.org/v4'
const KEY = process.env.FOOTBALL_DATA_API_KEY!

// Portugal's Group K opponents (football-data.org returns a flat 48-team list for WC 2026)
const GROUP_K_IDS = new Set([PORTUGAL_ID, 1934, 8070, 818]) // Portugal, Congo DR, Uzbekistan, Colombia

async function fd(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'X-Auth-Token': KEY } })
  if (!res.ok) throw new Error(`football-data ${res.status}`)
  return res.json()
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const [matchesData, standingsData] = await Promise.all([
      fd(`/teams/${PORTUGAL_ID}/matches?competitions=WC&season=2026`),
      fd(`/competitions/WC/standings?season=2026`),
    ])

    type StandingRow = { team: { id: number; name: string } }
    type GroupEntry = { stage: string; group?: string; type?: string; table: StandingRow[] }
    const groups: GroupEntry[] = standingsData.standings ?? []

    const totalTable = groups.find((g) => g.type === 'TOTAL')?.table ?? []
    const portGroup = totalTable
      .filter((row) => GROUP_K_IDS.has(row.team?.id))
      .map((row, i) => ({ ...row, position: i + 1 }))

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
    res.json({ matches: matchesData.matches ?? [], standings: portGroup })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    res.status(500).json({ error: message })
  }
}
