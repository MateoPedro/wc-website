import { useState, useEffect, useRef } from 'react'
import { adminApi, uploadFile } from '../lib/adminApi'
import { getDestinations } from '../lib/supabase'
import type { Destination, Photo } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

function photoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/photos/${path}`
}

export default function PhotoManager() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [selectedDest, setSelectedDest] = useState<string>('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getDestinations().then((ds) => {
      setDestinations(ds)
      if (ds.length > 0) setSelectedDest(ds[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedDest) return
    adminApi.getPhotos(selectedDest).then(setPhotos).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [selectedDest])

  async function handleUpload(files: FileList) {
    if (!selectedDest) return
    setUploading(true)
    setError('')
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${selectedDest}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        await uploadFile('photos', path, file)
        await adminApi.createPhoto({
          destination_id: selectedDest,
          storage_path: path,
          caption: '',
          sort_order: photos.length + 1,
        })
      }
      const updated = await adminApi.getPhotos(selectedDest)
      setPhotos(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function updateCaption(id: string, caption: string) {
    try {
      await adminApi.updatePhoto(id, { caption })
      setPhotos((prev) => prev.map((p) => p.id === id ? { ...p, caption } : p))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = photos.findIndex((p) => p.id === id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= photos.length) return
    const updated = [...photos]
    ;[updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]]
    // Persist new order
    try {
      await Promise.all(updated.map((p, i) => adminApi.updatePhoto(p.id, { sort_order: i + 1 })))
      setPhotos(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Reorder failed')
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this photo?')) return
    try {
      await adminApi.deletePhoto(id)
      setPhotos((prev) => prev.filter((p) => p.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const destName = destinations.find((d) => d.id === selectedDest)?.city ?? ''

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={headingStyle}>Photos</h2>
        <button onClick={() => fileRef.current?.click()} disabled={uploading || !selectedDest} style={greenBtn}>
          {uploading ? 'Uploading…' : '+ Upload'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => e.target.files && handleUpload(e.target.files)} />
      </div>

      {/* Destination selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Destination</label>
        <select
          value={selectedDest}
          onChange={(e) => setSelectedDest(e.target.value)}
          style={{ padding: '9px 12px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 13, outline: 'none', minWidth: 200 }}
        >
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.city}</option>)}
        </select>
      </div>

      {error && <div style={errStyle}>{error}</div>}

      {photos.length === 0 && !uploading && (
        <div
          onClick={() => fileRef.current?.click()}
          style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: '48px 0', textAlign: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,204,68,0.3)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
        >
          Click or drag photos for {destName}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {photos.map((photo, i) => (
          <div key={photo.id} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ position: 'relative', aspectRatio: '4/3', background: '#0a0a0a' }}>
              <img src={photoUrl(photo.storage_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
                <button onClick={() => move(photo.id, -1)} disabled={i === 0} style={iconBtn} title="Move up">↑</button>
                <button onClick={() => move(photo.id, 1)} disabled={i === photos.length - 1} style={iconBtn} title="Move down">↓</button>
                <button onClick={() => del(photo.id)} style={{ ...iconBtn, color: 'rgba(255,68,68,0.8)' }} title="Delete">×</button>
              </div>
            </div>
            <div style={{ padding: '10px 12px' }}>
              <input
                type="text"
                defaultValue={photo.caption ?? ''}
                placeholder="Caption…"
                onBlur={(e) => updateCaption(photo.id, e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 12, boxSizing: 'border-box' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const headingStyle: React.CSSProperties = { fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: '#fff', letterSpacing: '0.04em', margin: 0 }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }
const greenBtn: React.CSSProperties = { padding: '8px 18px', background: '#00cc44', border: 'none', borderRadius: 7, color: '#000', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em' }
const errStyle: React.CSSProperties = { fontSize: 12, color: '#ff4444', padding: '8px 12px', background: 'rgba(255,68,68,0.08)', borderRadius: 6, marginBottom: 16 }
const iconBtn: React.CSSProperties = { width: 24, height: 24, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }
