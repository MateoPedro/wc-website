/**
 * Adds attendees arrays to each destination's match_info.
 * Run with: node scripts/update-attendees.mjs
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

// Who is attending each match (by traveler name, excluding Mateo who follows all)
const ATTENDEES = {
  537403: ['Luke', 'Nicole', 'Cam'],    // Houston Jun 17 — Portugal vs Congo DR
  537405: ['Cam', 'Colton', 'Leslie'],  // Houston Jun 23 — Portugal vs Uzbekistan
  537407: ['Papa'],                      // Miami   Jun 27 — Portugal vs Colombia
}

async function run() {
  const { data: destinations, error } = await supabase.from('destinations').select('id, match_info')
  if (error) throw error

  for (const dest of destinations) {
    const matchId = dest.match_info?.matchId
    const attendees = ATTENDEES[matchId] ?? []
    const { error: upErr } = await supabase
      .from('destinations')
      .update({ match_info: { ...dest.match_info, attendees } })
      .eq('id', dest.id)
    if (upErr) throw upErr
    console.log(`✓ Updated matchId ${matchId ?? '(unknown)'} → attendees: [${attendees.join(', ') || 'none'}]`)
  }

  console.log('\n✅ Done')
}

run().catch((e) => { console.error(e.message); process.exit(1) })
