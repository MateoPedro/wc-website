import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyAdmin } from '../_auth'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (verifyAdmin(req)) res.json({ ok: true })
  else res.status(401).json({ error: 'Unauthorized' })
}
