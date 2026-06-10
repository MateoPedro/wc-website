/**
 * Upload an avatar for a traveler directly to Supabase Storage.
 *
 * Usage:
 *   node scripts/upload-avatar.mjs <traveler-name> <image-path>
 *
 * Examples:
 *   node scripts/upload-avatar.mjs Luke ~/Desktop/luke.jpg
 *   node scripts/upload-avatar.mjs "Nicole" ./photos/nicole.png
 */

import { readFileSync, existsSync } from 'fs'
import { extname } from 'path'
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

const [, , travelerName, imagePath] = process.argv

if (!travelerName || !imagePath) {
  console.error('Usage: node scripts/upload-avatar.mjs <traveler-name> <image-path>')
  console.error('Example: node scripts/upload-avatar.mjs Luke ~/Desktop/luke.jpg')
  process.exit(1)
}

const resolvedPath = imagePath.replace(/^~/, process.env.HOME)
if (!existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`)
  process.exit(1)
}

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  // Find the traveler
  const { data: travelers, error: fetchErr } = await sb
    .from('travelers')
    .select('id, name, avatar_url')
    .ilike('name', travelerName)

  if (fetchErr) throw fetchErr
  if (!travelers || travelers.length === 0) {
    console.error(`No traveler found matching "${travelerName}"`)
    const { data: all } = await sb.from('travelers').select('name')
    console.error('Available travelers:', all?.map((t) => t.name).join(', '))
    process.exit(1)
  }

  const traveler = travelers[0]
  console.log(`Found: ${traveler.name} (${traveler.id})`)

  // Upload image
  const ext = extname(resolvedPath).slice(1) || 'jpg'
  const storagePath = `${traveler.id}.${ext}`
  const fileBuffer = readFileSync(resolvedPath)

  console.log(`Uploading ${resolvedPath} → avatars/${storagePath}…`)
  const { error: upErr } = await sb.storage
    .from('avatars')
    .upload(storagePath, fileBuffer, {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: true,
    })

  if (upErr) throw upErr

  // Update DB record
  const { error: updateErr } = await sb
    .from('travelers')
    .update({ avatar_url: storagePath })
    .eq('id', traveler.id)

  if (updateErr) throw updateErr

  const publicUrl = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${storagePath}`
  console.log(`\n✅ Done! ${traveler.name}'s avatar updated.`)
  console.log(`   ${publicUrl}`)
}

run().catch((e) => { console.error('Error:', e.message); process.exit(1) })
