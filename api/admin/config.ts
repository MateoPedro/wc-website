import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin, unauthorized } from '../_auth'

const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdmin(req)) return unauthorized(res)

  if (req.method === 'GET') {
    const { data, error } = await sb.from('site_config').select('*').eq('id', 1).single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'PUT') {
    const { data, error } = await sb.from('site_config').update(req.body).eq('id', 1).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
