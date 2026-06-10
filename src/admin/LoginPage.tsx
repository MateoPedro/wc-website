import { useState, FormEvent } from 'react'
import { adminApi } from '../lib/adminApi'

export default function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminApi.login(password)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 360, padding: '48px 40px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
        <a
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', marginBottom: 28, letterSpacing: '0.05em' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 1L3 6l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to site
        </a>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: '#fff', letterSpacing: '0.05em', lineHeight: 1 }}>
            WC Admin
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
            Portugal 2026 · Trip Manager
          </div>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '10px 14px',
                background: '#161616', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#fff', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#ff4444', marginBottom: 16, padding: '8px 12px', background: 'rgba(255,68,68,0.08)', borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%', padding: '11px 0',
              background: loading || !password ? 'rgba(0,204,68,0.3)' : '#00cc44',
              border: 'none', borderRadius: 8,
              color: loading || !password ? 'rgba(0,0,0,0.4)' : '#000',
              fontSize: 13, fontWeight: 600, cursor: loading || !password ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em', transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.15)', textAlign: 'center', lineHeight: 1.6 }}>
          Run <code style={{ color: 'rgba(255,255,255,0.3)' }}>vercel dev</code> locally to use admin features
        </div>
      </div>
    </div>
  )
}
