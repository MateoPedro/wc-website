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

    // Only look at TOTAL type to avoid HOME/AWAY duplicates
    const totalGroups = groups.filter((g) => !g.type || g.type === 'TOTAL')

    // Strategy 1: find the group whose table contains Portugal
    let portGroup = totalGroups.find(
      (g) => g.stage === 'GROUP_STAGE' && Array.isArray(g.table) && g.table.some((row) => row.team?.id === PORTUGAL_ID)
    )?.table ?? []

    // Strategy 2: fall back to explicit GROUP_K label
    if (portGroup.length === 0) {
      portGroup = totalGroups.find((g) => g.group === 'GROUP_K')?.table ?? []
    }

    // Strategy 3: if still empty or >4 teams from a flat list, filter to ≤4 teams
    // by finding the smallest group slice that contains Portugal
    if (portGroup.length > 4) {
      const flatWithGroup = groups.filter((g) => g.stage === 'GROUP_STAGE' && g.group)
      const exact = flatWithGroup.find((g) => Array.isArray(g.table) && g.table.some((row) => row.team?.id === PORTUGAL_ID))
      if (exact) portGroup = exact.table
    }

    res.setHeader('Cache-Control', 'no-store')
    res.json({ matches: matchesData.matches ?? [], standings: portGroup })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    res.status(500).json({ error: message })
  }
}
