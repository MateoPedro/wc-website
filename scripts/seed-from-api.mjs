/**
 * Fetches Portugal's WC 2026 fixtures from football-data.org and seeds
 * the destinations table in Supabase with real venue + match data.
 *
 * Run with: node scripts/seed-from-api.mjs
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── Load env vars from .env.local ─────────────────────────
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const [k, ...v] = l.split('=')
      return [k.trim(), v.join('=').trim().replace(/^["']|["']$/g, '')]
    }),
)

const FOOTBALL_KEY = env.FOOTBALL_DATA_API_KEY
const SUPABASE_URL = env.VITE_SUPABASE_URL
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!FOOTBALL_KEY) { console.error('Missing FOOTBALL_DATA_API_KEY in .env.local'); process.exit(1) }
if (!SUPABASE_URL)  { console.error('Missing VITE_SUPABASE_URL in .env.local'); process.exit(1) }
if (!SERVICE_KEY)   { console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Known WC 2026 venue coordinates ──────────────────────
const VENUE_MAP = {
  'MetLife Stadium':            { city: 'New York',              lat: 40.8135, lng: -74.0745 },
  'SoFi Stadium':               { city: 'Los Angeles',           lat: 33.9535, lng: -118.3392 },
  'AT&T Stadium':               { city: 'Dallas',                lat: 32.7480, lng: -97.0930 },
  'Arrowhead Stadium':          { city: 'Kansas City',           lat: 39.0489, lng: -94.4839 },
  "Levi's Stadium":             { city: 'San Francisco',         lat: 37.4032, lng: -121.9698 },
  'Hard Rock Stadium':          { city: 'Miami',                 lat: 25.9580, lng: -80.2389 },
  'NRG Stadium':                { city: 'Houston',               lat: 29.6847, lng: -95.4107 },
  'Lincoln Financial Field':    { city: 'Philadelphia',          lat: 39.9008, lng: -75.1675 },
  'Geodis Park':                { city: 'Nashville',             lat: 36.1305, lng: -86.7718 },
  'Empower Field at Mile High': { city: 'Denver',                lat: 39.7439, lng: -105.0201 },
  'Lumen Field':                { city: 'Seattle',               lat: 47.5952, lng: -122.3316 },
  'BC Place':                   { city: 'Vancouver',             lat: 49.2768, lng: -123.1118 },
  'BMO Field':                  { city: 'Toronto',               lat: 43.6332, lng: -79.4183 },
  'Estadio Azteca':             { city: 'Mexico City',           lat: 19.3029, lng: -99.1505 },
  'Estadio Akron':              { city: 'Guadalajara',           lat: 20.6888, lng: -103.4592 },
  'Estadio BBVA':               { city: 'Monterrey',             lat: 25.6693, lng: -100.2436 },
}

// ── Portugal Group K venue overrides (free API has no venue field) ──
// Source: FOX Sports / Sky Sports confirmed fixtures
const PORTUGAL_VENUE_OVERRIDES = {
  537403: { venue: 'NRG Stadium',       ...VENUE_MAP['NRG Stadium'] },       // Jun 17 vs Congo DR
  537405: { venue: 'NRG Stadium',       ...VENUE_MAP['NRG Stadium'] },       // Jun 23 vs Uzbekistan
  537407: { venue: 'Hard Rock Stadium', ...VENUE_MAP['Hard Rock Stadium'] }, // Jun 27 vs Colombia
}

// Fallback: derive city from venue string
function venueToCity(venue) {
  for (const [name, data] of Object.entries(VENUE_MAP)) {
    if (venue?.toLowerCase().includes(name.toLowerCase().split(' ')[0].toLowerCase())) {
      return data
    }
  }
  return null
}

// ── Fetch Portugal fixtures ───────────────────────────────
// Portugal's team ID on football-data.org is 765
const PORTUGAL_ID = 765

async function fetchFixtures() {
  console.log('Fetching Portugal WC 2026 fixtures…')

  // Try WC 2026 competition endpoint
  const res = await fetch(
    `https://api.football-data.org/v4/teams/${PORTUGAL_ID}/matches?competitions=WC&season=2026`,
    { headers: { 'X-Auth-Token': FOOTBALL_KEY } },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  console.log(`Got ${data.matches?.length ?? 0} matches`)
  return data.matches ?? []
}

// ── Format match date range ───────────────────────────────
function formatDate(utcDate) {
  return new Date(utcDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

function stageLabel(stage) {
  const map = {
    GROUP_STAGE: 'Group Stage',
    ROUND_OF_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-final',
    SEMI_FINALS: 'Semi-final',
    FINAL: 'Final',
    THIRD_PLACE: 'Third Place',
  }
  return map[stage] ?? stage
}

// ── Seed ─────────────────────────────────────────────────
async function seed() {
  const matches = await fetchFixtures()

  if (matches.length === 0) {
    console.warn('No matches returned — check your API key and that WC 2026 fixtures are published')
    process.exit(0)
  }

  // Sort by date
  matches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))

  // Build destination rows (one per match)
  const destinations = matches.map((m, i) => {
    const override = PORTUGAL_VENUE_OVERRIDES[m.id]
    const venue = override?.venue ?? m.venue ?? ''
    const coords = override ?? VENUE_MAP[venue] ?? venueToCity(venue) ?? { city: 'TBD', lat: 39.5, lng: -98.35 }

    const opponent = m.homeTeam.id === PORTUGAL_ID ? m.awayTeam.name : m.homeTeam.name
    const date = formatDate(m.utcDate)
    const stage = stageLabel(m.stage)

    return {
      city: coords.city,
      lat: coords.lat,
      lng: coords.lng,
      description: `${stage} vs ${opponent} · ${venue}`,
      date_range: date,
      match_info: {
        matchId: m.id,
        stage: m.stage,
        opponent,
        venue,
        utcDate: m.utcDate,
        status: m.status,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        score: m.score,
      },
      order: i + 1,
    }
  })

  console.log('\nDestinations to insert:')
  destinations.forEach((d) => console.log(`  ${d.order}. ${d.city} — ${d.date_range} (${d.description})`))

  // Clear existing destinations + photos (photos cascade)
  console.log('\nClearing existing destinations…')
  const { error: deleteError } = await supabase.from('destinations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (deleteError) throw deleteError

  // Insert new
  console.log('Inserting new destinations…')
  const { error: insertError } = await supabase.from('destinations').insert(destinations)
  if (insertError) throw insertError

  console.log(`\n✅ Seeded ${destinations.length} destinations from live API data`)
  console.log('Refresh your app to see the updated map.')
}

seed().catch((e) => { console.error('Error:', e.message); process.exit(1) })
