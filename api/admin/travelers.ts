import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin, unauthorized } from '../_auth'

const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdmin(req)) return unauthorized(res)

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
    // Remove avatar from storage if present
    const { data: t } = await sb.from('travelers').select('avatar_url').eq('id', id).single()
    if (t?.avatar_url) await sb.storage.from('avatars').remove([t.avatar_url])
    const { error } = await sb.from('travelers').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
