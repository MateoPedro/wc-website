/**
 * Seeds real traveler data into Supabase.
 * Run with: node scripts/seed-travelers.mjs
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const [k, ...v] = l.split('=')
      return [k.trim(), v.join('=').trim().replace(/^["']|["']$/g, '')]
    }),
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// Travelers — starting positions are home cities before the trip
const travelers = [
  {
    name: 'Mateo',
    lat: 37.7749, lng: -122.4194,
    current_city: 'San Francisco',
    note: 'Following Portugal to every single game 🇵🇹🚀',
    is_owner: true,
  },
  {
    name: 'Luke',
    lat: 39.7392, lng: -104.9903,
    current_city: 'Denver',
    note: 'Flying in from Denver for Portugal vs Congo DR 🏔️',
    is_owner: false,
  },
  {
    name: 'Nicole',
    lat: 39.7392, lng: -104.9903,
    current_city: 'Denver',
    note: 'Denver crew representing! 🤙',
    is_owner: false,
  },
  {
    name: 'Cam',
    lat: 29.7604, lng: -95.3698,
    current_city: 'Houston',
    note: 'Local in Houston for both group stage games 🏠',
    is_owner: false,
  },
  {
    name: 'Colton',
    lat: 32.7767, lng: -96.7970,
    current_city: 'Dallas',
    note: 'Road tripping from Dallas for Portugal vs Uzbekistan 🚗',
    is_owner: false,
  },
  {
    name: 'Leslie',
    lat: 32.7767, lng: -96.7970,
    current_city: 'Dallas',
    note: 'Dallas to Houston for game 2 ✈️',
    is_owner: false,
  },
  {
    name: 'Papa',
    lat: 48.8566, lng: 2.3522,
    current_city: 'Paris',
    note: 'Flying in from Paris for Colombia + full finals run 🇫🇷✈️',
    is_owner: false,
  },
  {
    name: 'Alex',
    lat: 37.7749, lng: -122.4194,
    current_city: 'San Francisco',
    note: 'Locked in for the Round of 16 👀',
    is_owner: false,
  },
  {
    name: 'Santi',
    lat: 37.7749, lng: -122.4194,
    current_city: 'San Francisco',
    note: 'Waiting on that R16 draw 🔒',
    is_owner: false,
  },
  {
    name: 'Shreyas',
    lat: 19.0760, lng: 72.8777,
    current_city: 'Mumbai',
    note: 'Flying all the way from India for the quarter-final 🌏',
    is_owner: false,
  },
  {
    name: 'Kendall',
    lat: 39.0997, lng: -94.5786,
    current_city: 'Kansas City',
    note: 'Horse riding into the quarter-final 🐴',
    is_owner: false,
  },
]

async function seed() {
  console.log('Clearing existing travelers…')
  const { error: delErr } = await supabase
    .from('travelers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (delErr) throw delErr

  console.log('Inserting travelers…')
  const { error: insErr } = await supabase.from('travelers').insert(travelers)
  if (insErr) throw insErr

  console.log(`\n✅ Seeded ${travelers.length} travelers:`)
  travelers.forEach((t) =>
    console.log(`  ${t.is_owner ? '👑' : '  '} ${t.name.padEnd(10)} — ${t.current_city}`),
  )
}

seed().catch((e) => { console.error('Error:', e.message); process.exit(1) })
