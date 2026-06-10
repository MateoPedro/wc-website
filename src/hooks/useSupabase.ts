import { useState, useEffect } from 'react'
import { getTravelers, getDestinations, getSiteConfig, getLeaderboard } from '../lib/supabase'
import type { Traveler, Destination, SiteConfig } from '../types'
import type { LeaderboardEntry } from '../lib/supabase'

function useQuery<T>(fetcher: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetcher()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

export function useTravelers() {
  return useQuery<Traveler[]>(getTravelers, [])
}

export function useDestinations() {
  return useQuery<Destination[]>(getDestinations, [])
}

export function useSiteConfig() {
  return useQuery<SiteConfig | null>(getSiteConfig, null)
}

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[]>(getLeaderboard, [])
}
