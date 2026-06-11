import { useState, useEffect, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { adminApi, uploadFile } from '../lib/adminApi'
import type { Destination, Photo, Traveler } from '../types'

async function getCroppedFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = new Image()
  image.src = imageSrc
  await new Promise((res) => { image.onload = res })
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise((res) => canvas.toBlob((b) => res(new File([b!], 'preview.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.92))
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

function photoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/photos/${path}`
}

function avatarUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`
}

const EMPTY_DEST: Partial<Destination> = {
  city: '', lat: 0, lng: 0, description: '', date_range: '', order: 99, match_info: null, preview_image_url: null,
}

// ── Inline photo section per destination ──────────────────

function DestPhotos({ dest, collapsed }: { dest: Destination; collapsed: boolean }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    adminApi.getPhotos(dest.id).then(setPhotos).catch(() => setErr('Failed to load photos'))
  }, [dest.id])

  async function handleUpload(files: FileList) {
    setUploading(true)
    setErr('')
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${dest.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        await uploadFile('photos', path, file)
        await adminApi.createPhoto({ destination_id: dest.id, storage_path: path, caption: '', sort_order: photos.length + 1 })
      }
      setPhotos(await adminApi.getPhotos(dest.id))
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function updateCaption(id: string, caption: string) {
    await adminApi.updatePhoto(id, { caption })
    setPhotos((prev) => prev.map((p) => p.id === id ? { ...p, caption } : p))
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = photos.findIndex((p) => p.id === id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= photos.length) return
    const updated = [...photos];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]]
    await Promise.all(updated.map((p, i) => adminApi.updatePhoto(p.id, { sort_order: i + 1 })))
    setPhotos(updated)
  }

  async function del(id: string) {
    if (!confirm('Delete photo?')) return
    await adminApi.deletePhoto(id)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  // Collapsed: just show a summary strip
  if (collapsed) {
    return (
      <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {photos.slice(0, 5).map((p) => (
            <div key={p.id} style={{ width: 28, height: 28, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
              <img src={photoUrl(p.storage_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
          {photos.length === 0 && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>No photos — click ▼ Photos to upload</span>
          )}
          {photos.length > 5 && (
            <div style={{ width: 28, height: 28, borderRadius: 4, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
              +{photos.length - 5}
            </div>
          )}
        </div>
        {photos.length > 0 && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
        )}
      </div>
    )
  }

  // Expanded: full upload + grid
  return (
    <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
          Photos · {photos.length}
        </span>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={greenBtnSm}>
          {uploading ? 'Uploading…' : '+ Add Photos'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => e.target.files && handleUpload(e.target.files)} />
      </div>
      {err && <div style={errStyle}>{err}</div>}
      {photos.length === 0 && !uploading && (
        <div
          onClick={() => fileRef.current?.click()}
          style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8, padding: '28px 0', textAlign: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}
        >
          📷 Click to upload photos for {dest.city}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {photos.map((photo, i) => (
          <div key={photo.id} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ position: 'relative', aspectRatio: '4/3' }}>
              <img src={photoUrl(photo.storage_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 3 }}>
                <button onClick={() => move(photo.id, -1)} disabled={i === 0} style={iconBtn}>↑</button>
                <button onClick={() => move(photo.id, 1)} disabled={i === photos.length - 1} style={iconBtn}>↓</button>
                <button onClick={() => del(photo.id)} style={{ ...iconBtn, color: 'rgba(255,68,68,0.8)' }}>×</button>
              </div>
            </div>
            <div style={{ padding: '6px 8px' }}>
              <input
                type="text"
                defaultValue={photo.caption ?? ''}
                placeholder="Caption…"
                onBlur={(e) => updateCaption(photo.id, e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 11, boxSizing: 'border-box' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────

export default function DestinationManager() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [editing, setEditing] = useState<Partial<Destination> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [attendees, setAttendees] = useState<string[]>([])
  const [uploadingPreview, setUploadingPreview] = useState(false)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null)
  const previewInputRef = useRef<HTMLInputElement>(null)

  // Crop state
  const [cropSrc, setCropSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  useEffect(() => { load() }, [])
  useEffect(() => {
    adminApi.getTravelers().then(setTravelers).catch(() => {})
  }, [])

  async function load() {
    try {
      setDestinations(await adminApi.getDestinations())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }

  function openNew() {
    setEditing({ ...EMPTY_DEST })
    setAttendees([])
    setPreviewFile(null)
    setPreviewObjectUrl(null)
    setIsNew(true)
    setError('')
  }

  function openEdit(d: Destination) {
    setEditing({ ...d })
    const existingAttendees = (d.match_info as { attendees?: string[] } | null)?.attendees ?? []
    setAttendees(existingAttendees)
    setPreviewFile(null)
    setPreviewObjectUrl(null)
    setIsNew(false)
    setError('')
  }

  function handlePreviewSelect(file: File) {
    setCropSrc(URL.createObjectURL(file))
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function applyCrop() {
    if (!croppedAreaPixels || !cropSrc) return
    const file = await getCroppedFile(cropSrc, croppedAreaPixels)
    setPreviewFile(file)
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
    setPreviewObjectUrl(URL.createObjectURL(file))
    setCropSrc('')
  }

  function close() {
    setEditing(null)
    setAttendees([])
    setPreviewFile(null)
    setCropSrc('')
    if (previewObjectUrl) { URL.revokeObjectURL(previewObjectUrl); setPreviewObjectUrl(null) }
  }

  function toggleAttendee(name: string) {
    setAttendees((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name])
  }

  async function save() {
    if (!editing) return
    setSaving(true)
    setError('')
    try {
      const matchInfo = attendees.length > 0
        ? { ...(editing.match_info as object ?? {}), attendees }
        : editing.match_info ?? null

      const payload: Record<string, unknown> = {
        city: editing.city,
        lat: editing.lat,
        lng: editing.lng,
        description: editing.description,
        date_range: editing.date_range,
        order: editing.order,
        match_info: matchInfo,
        preview_image_url: editing.preview_image_url ?? null,
      }

      let destId = editing.id!

      if (isNew) {
        const created = await adminApi.createDestination(payload)
        destId = created.id
      } else {
        await adminApi.updateDestination(destId, payload)
      }

      // Upload preview image if one was selected
      if (previewFile) {
        setUploadingPreview(true)
        const ext = previewFile.name.split('.').pop() ?? 'jpg'
        const path = `previews/${destId}/preview.${ext}`
        await uploadFile('photos', path, previewFile)
        await adminApi.updateDestination(destId, { preview_image_url: path })
      }

      await load()
      close()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
      setUploadingPreview(false)
    }
  }

  async function del(id: string, city: string) {
    if (!confirm(`Delete ${city} and all its photos?`)) return
    try {
      await adminApi.deleteDestination(id)
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const friends = travelers.filter((t) => !t.is_owner)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={headingStyle}>Destinations</h2>
        <button onClick={openNew} style={greenBtn}>+ Add Destination</button>
      </div>

      {error && <div style={errStyle}>{error}</div>}

      {destinations.length === 0 && (
        <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: '48px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
          No destinations yet — add your first stop
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {destinations.map((d) => {
          const destAttendees = (d.match_info as { attendees?: string[] } | null)?.attendees ?? []
          const isOpen = expanded === d.id
          return (
            <div key={d.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', background: '#0d0d0d' }}>
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{d.city}</span>
                    {d.date_range && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 20 }}>
                        {d.date_range}
                      </span>
                    )}
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>#{d.order}</span>
                  </div>
                  {destAttendees.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      {destAttendees.map((name) => {
                        const t = travelers.find((tr) => tr.name === name)
                        return (
                          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#1a1a1a', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                              {t?.avatar_url
                                ? <img src={avatarUrl(t.avatar_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{name.slice(0, 1)}</span>}
                            </div>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{name}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <button onClick={() => openEdit(d)} style={ghostBtn}>Edit</button>
                <button onClick={() => del(d.id, d.city)} style={{ ...ghostBtn, color: 'rgba(255,68,68,0.6)' }}>Delete</button>
                <button
                  onClick={() => setExpanded(isOpen ? null : d.id)}
                  style={{ ...ghostBtn, fontSize: 11, borderColor: isOpen ? 'rgba(0,204,68,0.4)' : undefined, color: isOpen ? '#00cc44' : undefined }}
                >
                  {isOpen ? '▲ Photos' : '▼ Photos'}
                </button>
              </div>

              {/* Always-accessible photo section */}
              <DestPhotos dest={d} collapsed={!isOpen} />
            </div>
          )
        })}
      </div>

      {/* Crop modal */}
      {cropSrc && (
        <div style={{ ...overlay, zIndex: 200 }} onClick={() => setCropSrc('')}>
          <div style={{ ...modal, maxWidth: 480, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ ...headingStyle, fontSize: 18, margin: 0 }}>Crop Preview Image</h3>
              <button onClick={() => setCropSrc('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div style={{ position: 'relative', width: '100%', height: 260, borderRadius: 10, overflow: 'hidden', background: '#000' }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
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

      {/* Add / Edit modal */}
      {editing && (
        <div style={overlay} onClick={close}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ ...headingStyle, fontSize: 20, margin: 0 }}>{isNew ? 'New Destination' : `Edit · ${editing.city}`}</h3>
              <button onClick={close} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              {/* City */}
              <div style={{ gridColumn: '1 / -1', marginBottom: 16 }}>
                <label style={labelStyle}>City</label>
                <input type="text" value={editing.city ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, city: e.target.value } : null)} style={inputStyle} placeholder="e.g. Kansas City" onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Lat / Lng */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Latitude</label>
                <input type="number" step="any" value={editing.lat ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, lat: parseFloat(e.target.value) || 0 } : null)} style={inputStyle} placeholder="39.0997" onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Longitude</label>
                <input type="number" step="any" value={editing.lng ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, lng: parseFloat(e.target.value) || 0 } : null)} style={inputStyle} placeholder="-94.5786" onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Tip: right-click on Google Maps → "What's here?" to copy coordinates</span>
              </div>

              {/* Date range */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Date Range</label>
                <input type="text" value={editing.date_range ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, date_range: e.target.value } : null)} style={inputStyle} placeholder="June 15–18" onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Order */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Route Order</label>
                <input type="number" value={editing.order ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, order: parseInt(e.target.value) || 0 } : null)} style={inputStyle} placeholder="1" onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Description */}
              <div style={{ gridColumn: '1 / -1', marginBottom: 20 }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing((p) => p ? { ...p, description: e.target.value } : null)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Short blurb shown in the map popup"
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(0,204,68,0.5)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>

            {/* Preview image */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Map Pin Preview Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Thumbnail */}
                <div
                  onClick={() => previewInputRef.current?.click()}
                  style={{
                    width: 80, height: 56, borderRadius: 8, overflow: 'hidden',
                    border: '1px dashed rgba(255,255,255,0.15)', background: '#161616',
                    cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {previewObjectUrl || editing.preview_image_url ? (
                    <img
                      src={previewObjectUrl ?? photoUrl(editing.preview_image_url!)}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: 18, opacity: 0.25 }}>🏙</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <button onClick={() => previewInputRef.current?.click()} style={greenBtnSm}>
                    {editing.preview_image_url || previewObjectUrl ? 'Replace Image' : 'Upload Image'}
                  </button>
                  {(editing.preview_image_url || previewObjectUrl) && (
                    <button
                      onClick={() => {
                        setEditing((p) => p ? { ...p, preview_image_url: null } : null)
                        setPreviewFile(null)
                        if (previewObjectUrl) { URL.revokeObjectURL(previewObjectUrl); setPreviewObjectUrl(null) }
                      }}
                      style={{ ...ghostBtn, marginLeft: 8, fontSize: 11 }}
                    >
                      Remove
                    </button>
                  )}
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
                    Shown as the destination card image on the map
                  </p>
                </div>
              </div>
              <input
                ref={previewInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handlePreviewSelect(e.target.files[0])}
              />
            </div>

            {/* Attendees */}
            {friends.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Who's going</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {friends.map((t) => {
                    const selected = attendees.includes(t.name)
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleAttendee(t.name)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          padding: '6px 12px',
                          background: selected ? 'rgba(0,204,68,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${selected ? 'rgba(0,204,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: 20, cursor: 'pointer',
                          color: selected ? '#00cc44' : 'rgba(255,255,255,0.5)',
                          fontSize: 12, transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#1a1a1a', overflow: 'hidden', flexShrink: 0 }}>
                          {t.avatar_url
                            ? <img src={avatarUrl(t.avatar_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{t.name.slice(0, 1)}</span>}
                        </div>
                        {t.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {error && <div style={{ ...errStyle, marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={save} disabled={saving} style={{ ...greenBtn, flex: 1 }}>{uploadingPreview ? 'Uploading…' : saving ? 'Saving…' : 'Save'}</button>
              <button onClick={close} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────

const headingStyle: React.CSSProperties = { fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: '#fff', letterSpacing: '0.04em', margin: 0 }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }
const greenBtn: React.CSSProperties = { padding: '8px 18px', background: '#00cc44', border: 'none', borderRadius: 7, color: '#000', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em' }
const greenBtnSm: React.CSSProperties = { padding: '5px 12px', background: '#00cc44', border: 'none', borderRadius: 6, color: '#000', fontSize: 11, fontWeight: 600, cursor: 'pointer' }
const ghostBtn: React.CSSProperties = { padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer' }
const errStyle: React.CSSProperties = { fontSize: 12, color: '#ff4444', padding: '8px 12px', background: 'rgba(255,68,68,0.08)', borderRadius: 6, marginBottom: 16 }
const iconBtn: React.CSSProperties = { width: 22, height: 22, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }
const modal: React.CSSProperties = { background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 28px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }
