import { createClient } from '@supabase/supabase-js'
import type { Traveler, Destination, Photo, SiteConfig } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Travelers ──────────────────────────────────────────────

export async function getTravelers(): Promise<Traveler[]> {
  const { data, error } = await supabase
    .from('travelers')
    .select('*')
    .order('is_owner', { ascending: false })
    .order('created_at')

  if (error) throw error
  return data
}

// ── Destinations ───────────────────────────────────────────

export async function getDestinations(): Promise<Destination[]> {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('order')

  if (error) throw error
  return data
}

// ── Photos ─────────────────────────────────────────────────

export async function getPhotosByDestination(destinationId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('destination_id', destinationId)
    .order('sort_order')

  if (error) throw error
  return data
}

export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from('photos').getPublicUrl(storagePath)
  return data.publicUrl
}

// ── Leaderboard ────────────────────────────────────────────

export interface LeaderboardEntry {
  id: string
  name: string
  points: number
  correct_predictions: number
  updated_at: string
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('points', { ascending: false })

  if (error) throw error
  return data
}

// ── Site config ────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig> {
  const { data, error } = await supabase
    .from('site_config')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) throw error
  return data
}
