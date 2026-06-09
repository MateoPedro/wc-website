import { useState, useEffect } from 'react'
import { fetchScores, type ScoresData } from '../lib/footballData'

export function useScores() {
  const [data, setData] = useState<ScoresData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await fetchScores()
        if (!cancelled) setData(result)
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load scores')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    // Refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000)

    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return { data, loading, error }
}
