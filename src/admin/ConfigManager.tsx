import { useState, useEffect, FormEvent } from 'react'
import { adminApi } from '../lib/adminApi'
import type { SiteConfig } from '../types'

export default function ConfigManager() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.getConfig().then(setConfig).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [])

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!config) return
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await adminApi.updateConfig({
        hero_message: config.hero_message,
        spotify_playlist_url: config.spotify_playlist_url,
        route_color: config.route_color,
        show_scores: config.show_scores,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (!config) return <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</div>

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={headingStyle}>Site Config</h2>

      <form onSubmit={save}>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Hero Message</label>
          <textarea
            value={config.hero_message}
            onChange={(e) => setConfig({ ...config, hero_message: e.target.value })}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>Shown in the hero section</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Spotify Playlist URL</label>
          <input
            type="url"
            value={config.spotify_playlist_url}
            onChange={(e) => setConfig({ ...config, spotify_playlist_url: e.target.value })}
            placeholder="https://open.spotify.com/playlist/…"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Route Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="color"
              value={config.route_color}
              onChange={(e) => setConfig({ ...config, route_color: e.target.value })}
              style={{ width: 44, height: 36, padding: 2, background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, cursor: 'pointer' }}
            />
            <input
              type="text"
              value={config.route_color}
              onChange={(e) => setConfig({ ...config, route_color: e.target.value })}
              style={{ ...inputStyle, width: 120 }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9 }}>
          <label style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} htmlFor="show_scores">
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: 2 }}>Show Scores Section</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Hides the scores section for all visitors</div>
          </label>
          <div
            id="show_scores"
            onClick={() => setConfig({ ...config, show_scores: !config.show_scores })}
            style={{
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
              background: config.show_scores ? '#00cc44' : 'rgba(255,255,255,0.15)',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: config.show_scores ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
            }} />
          </div>
        </div>

        {error && <div style={errStyle}>{error}</div>}

        <button
          type="submit"
          disabled={saving}
          style={{ ...greenBtn, padding: '10px 28px', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

const headingStyle: React.CSSProperties = { fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: '#fff', letterSpacing: '0.04em', margin: '0 0 28px' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }
const greenBtn: React.CSSProperties = { padding: '8px 18px', background: '#00cc44', border: 'none', borderRadius: 7, color: '#000', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em' }
const errStyle: React.CSSProperties = { fontSize: 12, color: '#ff4444', padding: '8px 12px', background: 'rgba(255,68,68,0.08)', borderRadius: 6, marginBottom: 16 }
