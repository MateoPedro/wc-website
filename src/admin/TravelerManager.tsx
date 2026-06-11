import { useState, useEffect, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { adminApi, uploadFile } from '../lib/adminApi'
import type { Traveler } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

function avatarPublicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`
}

async function getCroppedFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = new Image()
  image.src = imageSrc
  await new Promise((res) => { image.onload = res })
  const canvas = document.createElement('canvas')
  const size = Math.max(pixelCrop.width, pixelCrop.height)
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, size, size)
  return new Promise((res) => canvas.toBlob((b) => res(new File([b!], 'avatar.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.92))
}

const EMPTY: Partial<Traveler> = { name: '', current_city: '', lat: 0, lng: 0, note: '', is_owner: false, avatar_url: '' }

export default function TravelerManager() {
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [editing, setEditing] = useState<Partial<Traveler> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  // Crop state
  const [cropSrc, setCropSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setTravelers(await adminApi.getTravelers())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }

  function openNew() {
    setEditing({ ...EMPTY })
    setIsNew(true)
    setAvatarFile(null)
    setAvatarPreview('')
    setError('')
  }

  function openEdit(t: Traveler) {
    setEditing({ ...t })
    setIsNew(false)
    setAvatarFile(null)
    setAvatarPreview(t.avatar_url ? avatarPublicUrl(t.avatar_url) : '')
    setError('')
  }

  function close() { setEditing(null); setAvatarFile(null); setAvatarPreview(''); setCropSrc('') }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCropSrc(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    e.target.value = ''
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function applyCrop() {
    if (!croppedAreaPixels || !cropSrc) return
    const file = await getCroppedFile(cropSrc, croppedAreaPixels)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setCropSrc('')
  }

  async function save() {
    if (!editing) return
    setSaving(true)
    setError('')
    try {
      let avatarPath = editing.avatar_url ?? ''

      if (avatarFile) {
        const id = editing.id ?? `new-${Date.now()}`
        const path = `${id}.jpg`
        avatarPath = await uploadFile('avatars', path, avatarFile)
      }

      const payload = { ...editing, avatar_url: avatarPath }
      delete (payload as Record<string, unknown>).id
      delete (payload as Record<string, unknown>).created_at

      if (isNew) {
        await adminApi.createTraveler(payload)
      } else {
        await adminApi.updateTraveler(editing.id!, payload)
      }

      await load()
      close()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this traveler?')) return
    try {
      await adminApi.deleteTraveler(id)
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const field = (label: string, key: keyof Traveler, type = 'text') => (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={String(editing?.[key] ?? '')}
        onChange={(e) => setEditing((prev) => prev ? { ...prev, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value } : null)}
        style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
      />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={headingStyle}>Travelers</h2>
        <button onClick={openNew} style={greenBtn}>+ Add Traveler</button>
      </div>

      {error && <div style={errStyle}>{error}</div>}

      <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        {travelers.map((t, i) => (
          <div
            key={t.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined,
              background: t.is_owner ? 'rgba(200,162,0,0.04)' : 'transparent',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a1a1a', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${t.is_owner ? '#C8A200' : 'rgba(255,255,255,0.15)'}` }}>
              {t.avatar_url ? <img src={avatarPublicUrl(t.avatar_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{t.name.slice(0, 2).toUpperCase()}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{t.name} {t.is_owner && <span style={{ fontSize: 10, color: '#C8A200', letterSpacing: '0.1em' }}>OWNER</span>}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>📍 {t.current_city} &nbsp;·&nbsp; {t.lat.toFixed(4)}, {t.lng.toFixed(4)}</div>
            </div>
            <button onClick={() => openEdit(t)} style={ghostBtn}>Edit</button>
            <button onClick={() => del(t.id)} style={{ ...ghostBtn, color: 'rgba(255,68,68,0.7)' }}>Delete</button>
          </div>
        ))}
      </div>

      {/* Crop modal */}
      {cropSrc && (
        <div style={overlay} onClick={() => setCropSrc('')}>
          <div style={{ ...modal, maxWidth: 440, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ ...headingStyle, fontSize: 18, margin: 0 }}>Crop Avatar</h3>
              <button onClick={() => setCropSrc('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div style={{ position: 'relative', width: '100%', height: 320, borderRadius: 10, overflow: 'hidden', background: '#000' }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={{ ...labelStyle, marginBottom: 6 }}>Zoom</label>
              <input
                type="range" min={1} max={3} step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00cc44' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={applyCrop} style={{ ...greenBtn, flex: 1 }}>Apply Crop</button>
              <button onClick={() => setCropSrc('')} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create modal */}
      {editing && (
        <div style={overlay} onClick={close}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ ...headingStyle, fontSize: 20, margin: 0 }}>{isNew ? 'New Traveler' : 'Edit Traveler'}</h3>
              <button onClick={close} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {/* Avatar */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Avatar</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1a1a1a', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {avatarPreview ? <img src={avatarPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{(editing.name ?? '?').slice(0, 2).toUpperCase()}</span>}
                </div>
                <button onClick={() => fileRef.current?.click()} style={ghostBtn}>Upload photo</button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onAvatarChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>{field('Name', 'name')}</div>
              {field('City', 'current_city')}
              <div>{/* spacer */}</div>
              {field('Latitude', 'lat', 'number')}
              {field('Longitude', 'lng', 'number')}
              <div style={{ gridColumn: '1 / -1', marginBottom: 16 }}>
                <label style={labelStyle}>Note</label>
                <textarea
                  value={editing.note ?? ''}
                  onChange={(e) => setEditing((prev) => prev ? { ...prev, note: e.target.value } : null)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="is_owner"
                  checked={!!editing.is_owner}
                  onChange={(e) => setEditing((prev) => prev ? { ...prev, is_owner: e.target.checked } : null)}
                  style={{ accentColor: '#C8A200' }}
                />
                <label htmlFor="is_owner" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Is owner (gold pin)</label>
              </div>
            </div>

            {error && <div style={{ ...errStyle, marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={save} disabled={saving} style={{ ...greenBtn, flex: 1 }}>{saving ? 'Saving…' : 'Save'}</button>
              <button onClick={close} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────

const headingStyle: React.CSSProperties = { fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: '#fff', letterSpacing: '0.04em', margin: 0 }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }
const greenBtn: React.CSSProperties = { padding: '8px 18px', background: '#00cc44', border: 'none', borderRadius: 7, color: '#000', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em' }
const ghostBtn: React.CSSProperties = { padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer' }
const errStyle: React.CSSProperties = { fontSize: 12, color: '#ff4444', padding: '8px 12px', background: 'rgba(255,68,68,0.08)', borderRadius: 6 }
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }
const modal: React.CSSProperties = { background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 28px', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }
