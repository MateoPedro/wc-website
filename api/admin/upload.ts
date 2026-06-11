export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'node:crypto'

function isAdmin(req: VercelRequest): boolean {
  const cookie = req.cookies?.wc_admin_session
  if (!cookie || !process.env.ADMIN_COOKIE_SECRET) return false
  const expected = createHmac('sha256', process.env.ADMIN_COOKIE_SECRET).update('admin_session_v1').digest('hex')
  try { return timingSafeEqual(Buffer.from(cookie, 'hex'), Buffer.from(expected, 'hex')) } catch { return false }
}

const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { bucket, path, base64, contentType } = req.body ?? {}
  if (!bucket || !path || !base64) return res.status(400).json({ error: 'Missing fields' })

  const buffer = Buffer.from(base64, 'base64')
  const { data, error } = await sb.storage.from(bucket).upload(path, buffer, {
    contentType: contentType ?? 'application/octet-stream',
    upsert: true,
  })
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ path: data.path })
}
