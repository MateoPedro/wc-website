import type { VercelRequest, VercelResponse } from '@vercel/node'

const PORTUGAL_ID = 765
const BASE = 'https://api.football-data.org/v4'
const KEY = process.env.FOOTBALL_DATA_API_KEY!

async function fd(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'X-Auth-Token': KEY } })
  if (!res.ok) throw new Error(`football-data ${res.status}`)
  return res.json()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const [matchesData, standingsData] = await Promise.all([
      fd(`/teams/${PORTUGAL_ID}/matches?competitions=WC&season=2026`),
      fd(`/competitions/WC/standings?season=2026`),
    ])

    // Debug mode — return raw standings structure for inspection
    if (req.query.debug === '1') {
      res.json({
        _debug: {
          standingsCount: standingsData.standings?.length,
          groups: (standingsData.standings ?? []).map((g: Record<string, unknown>) => ({
            stage: g.stage,
            group: g.group,
            type: g.type,
            size: (g.table as unknown[])?.length,
            teams: (g.table as { team: { id: number; name: string } }[])?.map((r) => ({ id: r.team?.id, name: r.team?.name })),
          })),
        },
      })
      return
    }

    type StandingRow = { team: { id: number; name: string } }
    type GroupEntry = { stage: string; group?: string; type?: string; table: StandingRow[] }
    const groups: GroupEntry[] = standingsData.standings ?? []

    // football-data.org returns all 48 teams in a flat list (group: null) for WC 2026.
    // Filter to TOTAL only, then manually pick Portugal's Group K: POR, COD, UZB, COL.
    const GROUP_K_IDS = new Set([PORTUGAL_ID, 1934, 8070, 818]) // Portugal, Congo DR, Uzbekistan, Colombia
    const totalTable = groups.find((g) => g.type === 'TOTAL')?.table ?? []
    const portGroup = totalTable.filter((row) => GROUP_K_IDS.has(row.team?.id))

    res.setHeader('Cache-Control', 'no-store')
    res.json({ matches: matchesData.matches ?? [], standings: portGroup })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    res.status(500).json({ error: message })
  }
}
