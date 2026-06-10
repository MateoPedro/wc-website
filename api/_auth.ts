import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

export function signToken(secret: string): string {
  return crypto.createHmac('sha256', secret).update('admin_session_v1').digest('hex')
}

export function verifyAdmin(req: VercelRequest): boolean {
  const cookie = req.cookies?.wc_admin_session
  if (!cookie) return false
  const secret = process.env.ADMIN_COOKIE_SECRET
  if (!secret) return false
  const expected = signToken(secret)
  try {
    return crypto.timingSafeEqual(Buffer.from(cookie, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export function unauthorized(res: VercelResponse) {
  res.status(401).json({ error: 'Unauthorized' })
}
