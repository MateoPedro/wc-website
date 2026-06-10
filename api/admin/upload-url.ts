import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

function isAdmin(req: VercelRequest): boolean {
  const cookie = req.cookies?.wc_admin_session
  if (!cookie || !process.env.ADMIN_COOKIE_SECRET) return false
  const expected = crypto.createHmac('sha256', process.env.ADMIN_COOKIE_SECRET).update('admin_session_v1').digest('hex')
  try { return crypto.timingSafeEqual(Buffer.from(cookie, 'hex'), Buffer.from(expected, 'hex')) } catch { return false }
}

const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { bucket, path } = req.body ?? {}
  if (!bucket || !path) return res.status(400).json({ error: 'Missing bucket or path' })

  const { data, error } = await sb.storage.from(bucket).createSignedUploadUrl(path)
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}
