import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'

function isAdmin(req: VercelRequest): boolean {
  const cookie = req.cookies?.wc_admin_session
  if (!cookie || !process.env.ADMIN_COOKIE_SECRET) return false
  const expected = crypto.createHmac('sha256', process.env.ADMIN_COOKIE_SECRET).update('admin_session_v1').digest('hex')
  try { return crypto.timingSafeEqual(Buffer.from(cookie, 'hex'), Buffer.from(expected, 'hex')) } catch { return false }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (isAdmin(req)) res.json({ ok: true })
  else res.status(401).json({ error: 'Unauthorized' })
}
