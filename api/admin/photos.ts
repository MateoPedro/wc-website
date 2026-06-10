import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin, unauthorized } from '../_auth'

const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdmin(req)) return unauthorized(res)

  const id = req.query.id as string | undefined
  const destinationId = req.query.destination_id as string | undefined

  if (req.method === 'GET') {
    if (!destinationId) return res.status(400).json({ error: 'Missing destination_id' })
    const { data, error } = await sb.from('photos').select('*').eq('destination_id', destinationId).order('sort_order')
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'POST') {
    const { data, error } = await sb.from('photos').insert(req.body).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { data, error } = await sb.from('photos').update(req.body).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { data: photo } = await sb.from('photos').select('storage_path').eq('id', id).single()
    if (photo?.storage_path) await sb.storage.from('photos').remove([photo.storage_path])
    const { error } = await sb.from('photos').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
