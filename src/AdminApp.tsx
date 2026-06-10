import { useState, useEffect } from 'react'
import { adminApi } from './lib/adminApi'
import LoginPage from './admin/LoginPage'
import TravelerManager from './admin/TravelerManager'
import PhotoManager from './admin/PhotoManager'
import ConfigManager from './admin/ConfigManager'
import LeaderboardManager from './admin/LeaderboardManager'

type Tab = 'travelers' | 'photos' | 'config' | 'leaderboard'

export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null) // null = checking
  const [tab, setTab] = useState<Tab>('travelers')

  useEffect(() => {
    adminApi.check().then(() => setAuthed(true)).catch(() => setAuthed(false))
  }, [])

  if (authed === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>LOADING…</div>
      </div>
    )
  }

  if (!authed) return <LoginPage onSuccess={() => setAuthed(true)} />

  const navItems: { id: Tab; label: string }[] = [
    { id: 'travelers', label: 'Travelers' },
    { id: 'photos', label: 'Photos' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'config', label: 'Config' },
  ]

  async function logout() {
    await adminApi.logout()
    setAuthed(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '32px 0' }}>
        <div style={{ padding: '0 24px 28px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: '#fff', letterSpacing: '0.06em' }}>WC Admin</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Portugal 2026</div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 24px', background: tab === item.id ? 'rgba(0,204,68,0.08)' : 'transparent',
                border: 'none', borderLeft: `3px solid ${tab === item.id ? '#00cc44' : 'transparent'}`,
                color: tab === item.id ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: 13, fontWeight: tab === item.id ? 600 : 400, cursor: 'pointer',
                letterSpacing: '0.02em', transition: 'all 0.15s',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '0 24px 8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
          <a href="/" style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 10, textDecoration: 'none' }}>← View site</a>
          <button
            onClick={logout}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 11, cursor: 'pointer', padding: 0, letterSpacing: '0.05em' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        {tab === 'travelers' && <TravelerManager />}
        {tab === 'photos' && <PhotoManager />}
        {tab === 'leaderboard' && <LeaderboardManager />}
        {tab === 'config' && <ConfigManager />}
      </main>
    </div>
  )
}
