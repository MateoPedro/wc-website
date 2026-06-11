import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHmac } from 'node:crypto'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password } = req.body ?? {}
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  const secret = process.env.ADMIN_COOKIE_SECRET
  if (!secret) return res.status(500).json({ error: 'Server misconfigured — set ADMIN_COOKIE_SECRET' })

  const token = createHmac('sha256', secret).update('admin_session_v1').digest('hex')
  const isProd = process.env.VERCEL_ENV === 'production'
  res.setHeader('Set-Cookie', `wc_admin_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${isProd ? '; Secure' : ''}`)
  res.json({ ok: true })
}
