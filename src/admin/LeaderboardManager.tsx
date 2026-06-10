import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../lib/adminApi'
import type { LeaderboardEntry } from '../lib/supabase'

const cell: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 13,
  color: 'rgba(255,255,255,0.8)',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  verticalAlign: 'middle',
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 13,
  padding: '8px 12px',
  outline: 'none',
  width: '100%',
}

const btn = (variant: 'primary' | 'ghost' | 'danger'): React.CSSProperties => ({
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.04em',
  padding: '7px 14px',
  transition: 'opacity 0.15s',
  background:
    variant === 'primary' ? '#00cc44'
    : variant === 'danger' ? 'rgba(204,0,0,0.15)'
    : 'rgba(255,255,255,0.07)',
  color:
    variant === 'primary' ? '#000'
    : variant === 'danger' ? '#ff4444'
    : 'rgba(255,255,255,0.6)',
})

type Draft = { name: string; points: string; correct_predictions: string }
const emptyDraft = (): Draft => ({ name: '', points: '0', correct_predictions: '0' })

export default function LeaderboardManager() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, Draft>>({})
  const [adding, setAdding] = useState(false)
  const [newEntry, setNewEntry] = useState<Draft>(emptyDraft())
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getLeaderboard()
      setEntries(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd() {
    setSaving('new')
    setError(null)
    try {
      await adminApi.createLeaderboardEntry({
        name: newEntry.name.trim(),
        points: Number(newEntry.points),
        correct_predictions: Number(newEntry.correct_predictions),
      })
      setNewEntry(emptyDraft())
      setAdding(false)
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add')
    } finally {
      setSaving(null)
    }
  }

  async function handleSave(id: string) {
    const draft = editing[id]
    if (!draft) return
    setSaving(id)
    setError(null)
    try {
      await adminApi.updateLeaderboardEntry(id, {
        name: draft.name.trim(),
        points: Number(draft.points),
        correct_predictions: Number(draft.correct_predictions),
      })
      setEditing((prev) => { const next = { ...prev }; delete next[id]; return next })
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this player?')) return
    setSaving(id)
    try {
      await adminApi.deleteLeaderboardEntry(id)
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setSaving(null)
    }
  }

  function startEdit(entry: LeaderboardEntry) {
    setEditing((prev) => ({
      ...prev,
      [entry.id]: {
        name: entry.name,
        points: String(entry.points),
        correct_predictions: String(entry.correct_predictions),
      },
    }))
  }

  function cancelEdit(id: string) {
    setEditing((prev) => { const next = { ...prev }; delete next[id]; return next })
  }

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#fff', letterSpacing: '0.05em' }}>
            Leaderboard
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            Update points and correct predictions after each match.
          </p>
        </div>
        <button style={btn('primary')} onClick={() => { setAdding(true); setNewEntry(emptyDraft()) }}>
          + Add player
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#ff6666' }}>
          {error}
        </div>
      )}

      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['#', 'Player', 'Points', 'Exact scores', ''].map((h) => (
                <th key={h} style={{ ...cell, color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: h === '' ? 'right' : 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const draft = editing[entry.id]
              const isSaving = saving === entry.id

              return (
                <tr key={entry.id} style={{ opacity: isSaving ? 0.5 : 1 }}>
                  <td style={{ ...cell, width: 40, color: 'rgba(255,255,255,0.3)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 18 }}>
                    {i + 1}
                  </td>

                  <td style={{ ...cell }}>
                    {draft ? (
                      <input
                        style={inputStyle}
                        value={draft.name}
                        onChange={(e) => setEditing((p) => ({ ...p, [entry.id]: { ...p[entry.id], name: e.target.value } }))}
                      />
                    ) : (
                      <span style={{ fontWeight: 500 }}>{entry.name}</span>
                    )}
                  </td>

                  <td style={{ ...cell, width: 120 }}>
                    {draft ? (
                      <input
                        type="number" min="0"
                        style={{ ...inputStyle, width: 80 }}
                        value={draft.points}
                        onChange={(e) => setEditing((p) => ({ ...p, [entry.id]: { ...p[entry.id], points: e.target.value } }))}
                      />
                    ) : (
                      <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: '#C8A200' }}>{entry.points}</span>
                    )}
                  </td>

                  <td style={{ ...cell, width: 120 }}>
                    {draft ? (
                      <input
                        type="number" min="0"
                        style={{ ...inputStyle, width: 80 }}
                        value={draft.correct_predictions}
                        onChange={(e) => setEditing((p) => ({ ...p, [entry.id]: { ...p[entry.id], correct_predictions: e.target.value } }))}
                      />
                    ) : (
                      <span>{entry.correct_predictions}</span>
                    )}
                  </td>

                  <td style={{ ...cell, textAlign: 'right', width: 160 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      {draft ? (
                        <>
                          <button style={btn('primary')} disabled={isSaving} onClick={() => handleSave(entry.id)}>Save</button>
                          <button style={btn('ghost')} onClick={() => cancelEdit(entry.id)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button style={btn('ghost')} onClick={() => startEdit(entry)}>Edit</button>
                          <button style={btn('danger')} disabled={isSaving} onClick={() => handleDelete(entry.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}

            {/* Add row */}
            {adding && (
              <tr style={{ background: 'rgba(0,204,68,0.04)' }}>
                <td style={cell} />
                <td style={cell}>
                  <input
                    style={inputStyle}
                    placeholder="Player name"
                    value={newEntry.name}
                    autoFocus
                    onChange={(e) => setNewEntry((p) => ({ ...p, name: e.target.value }))}
                  />
                </td>
                <td style={cell}>
                  <input
                    type="number" min="0"
                    style={{ ...inputStyle, width: 80 }}
                    value={newEntry.points}
                    onChange={(e) => setNewEntry((p) => ({ ...p, points: e.target.value }))}
                  />
                </td>
                <td style={cell}>
                  <input
                    type="number" min="0"
                    style={{ ...inputStyle, width: 80 }}
                    value={newEntry.correct_predictions}
                    onChange={(e) => setNewEntry((p) => ({ ...p, correct_predictions: e.target.value }))}
                  />
                </td>
                <td style={{ ...cell, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button style={btn('primary')} disabled={saving === 'new' || !newEntry.name.trim()} onClick={handleAdd}>Add</button>
                    <button style={btn('ghost')} onClick={() => setAdding(false)}>Cancel</button>
                  </div>
                </td>
              </tr>
            )}

            {entries.length === 0 && !adding && (
              <tr>
                <td colSpan={5} style={{ ...cell, textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '32px 16px' }}>
                  No players yet — click "Add player" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>
        Rankings are sorted by points automatically. Update after every match.
      </p>
    </div>
  )
}
