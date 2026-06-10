import type { VercelRequest, VercelResponse } from '@vercel/node'

const PORTUGAL_ID = 765
const BASE = 'https://api.football-data.org/v4'
const KEY = process.env.FOOTBALL_DATA_API_KEY!

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

    // Find the group stage table that contains Portugal
    const groups: { stage: string; group?: string; table: { team: { id: number } }[] }[] = standingsData.standings ?? []
    const portGroup = groups.find(
      (g) => g.stage === 'GROUP_STAGE' && Array.isArray(g.table) && g.table.some((row) => row.team?.id === PORTUGAL_ID)
    )?.table ?? []

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
    res.json({ matches: matchesData.matches ?? [], standings: portGroup })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    res.status(500).json({ error: message })
  }
}
