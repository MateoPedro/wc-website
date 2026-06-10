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

  const id = req.query.id as string | undefined

  if (req.method === 'GET') {
    const { data, error } = await sb.from('travelers').select('*').order('is_owner', { ascending: false }).order('created_at')
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }
  if (req.method === 'POST') {
    const { data, error } = await sb.from('travelers').insert(req.body).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }
  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { data, error } = await sb.from('travelers').update(req.body).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }
  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { data: t } = await sb.from('travelers').select('avatar_url').eq('id', id).single()
    if (t?.avatar_url) await sb.storage.from('avatars').remove([t.avatar_url])
    const { error } = await sb.from('travelers').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }
  res.status(405).json({ error: 'Method not allowed' })
}
