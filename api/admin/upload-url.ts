import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin, unauthorized } from '../_auth'

const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdmin(req)) return unauthorized(res)
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { bucket, path } = req.body ?? {}
  if (!bucket || !path) return res.status(400).json({ error: 'Missing bucket or path' })

  const { data, error } = await sb.storage.from(bucket).createSignedUploadUrl(path)
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}
