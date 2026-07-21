async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...options, credentials: 'include' })
  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('API unavailable — run `vercel dev` to use admin features')
  }
  const json = await res.json().catch(() => ({ error: res.statusText }))
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json as T
}

export const adminApi = {
  check: () => req<{ ok: boolean }>('/api/admin/check'),
  login: (password: string) => req<{ ok: boolean }>('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }),
  logout: () => req<{ ok: boolean }>('/api/admin/logout', { method: 'POST' }),

  getTravelers: () => req<import('../types').Traveler[]>('/api/admin/travelers'),
  createTraveler: (body: object) => req('/api/admin/travelers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  updateTraveler: (id: string, body: object) => req(`/api/admin/travelers?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  deleteTraveler: (id: string) => req(`/api/admin/travelers?id=${id}`, { method: 'DELETE' }),

  getPhotos: (destinationId: string) => req<import('../types').Photo[]>(`/api/admin/photos?destination_id=${destinationId}`),
  createPhoto: (body: object) => req('/api/admin/photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  updatePhoto: (id: string, body: object) => req(`/api/admin/photos?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  deletePhoto: (id: string) => req(`/api/admin/photos?id=${id}`, { method: 'DELETE' }),

  getDestinations: () => req<import('../types').Destination[]>('/api/admin/destinations'),
  createDestination: (body: object) => req<import('../types').Destination>('/api/admin/destinations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  updateDestination: (id: string, body: object) => req(`/api/admin/destinations?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  deleteDestination: (id: string) => req(`/api/admin/destinations?id=${id}`, { method: 'DELETE' }),

  getConfig: () => req<import('../types').SiteConfig>('/api/admin/config'),
  updateConfig: (body: object) => req('/api/admin/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),

  getLeaderboard: () => req<import('../lib/supabase').LeaderboardEntry[]>('/api/admin/leaderboard'),
  createLeaderboardEntry: (body: object) => req('/api/admin/leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  updateLeaderboardEntry: (id: string, body: object) => req(`/api/admin/leaderboard?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  deleteLeaderboardEntry: (id: string) => req(`/api/admin/leaderboard?id=${id}`, { method: 'DELETE' }),

  getUploadUrl: (bucket: string, path: string) =>
    req<{ signedUrl: string; token: string; path: string }>('/api/admin/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket, path }),
    }),
}

export async function uploadFile(bucket: string, storagePath: string, file: File): Promise<string> {
  // Get a signed upload URL so the file goes directly to Supabase Storage,
  // bypassing Vercel's 4.5 MB function body limit.
  const { signedUrl } = await req<{ signedUrl: string; token: string; path: string }>(
    '/api/admin/upload-url',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucket, path: storagePath }) },
  )
  const res = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Upload failed: ${text}`)
  }
  return storagePath
}
