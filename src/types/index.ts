export interface Traveler {
  id: string
  name: string
  avatar_url: string
  lat: number
  lng: number
  current_city: string
  note: string
  is_owner: boolean
  created_at: string
}

export interface Destination {
  id: string
  city: string
  lat: number
  lng: number
  description: string
  date_range: string
  match_info: Record<string, unknown> | null
  order: number
}

export interface Photo {
  id: string
  destination_id: string
  storage_path: string
  caption: string | null
  sort_order: number
  uploaded_at: string
}

export interface SiteConfig {
  id: 1
  spotify_playlist_url: string
  hero_message: string
  route_color: string
  show_scores: boolean
}

export type Section = 'map' | 'scores' | 'playlist'
