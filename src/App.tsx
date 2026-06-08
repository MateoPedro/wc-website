import { useEffect } from 'react'
import { createLenis } from './lib/lenis'
import { useSiteConfig } from './hooks/useSupabase'
import Navbar from './components/Navbar'
import HeroSection from './sections/HeroSection'
import MapSection from './sections/MapSection'
import ScoresSection from './sections/ScoresSection'
import PlaylistSection from './sections/PlaylistSection'

export default function App() {
  const { data: config } = useSiteConfig()

  useEffect(() => {
    const lenis = createLenis()

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <div style={{ background: '#080808' }}>
      <Navbar showScores={config?.show_scores ?? true} />
      <section id="hero">
        <HeroSection heroMessage={config?.hero_message} />
      </section>
      <section id="map">
        <MapSection />
      </section>
      <section id="scores">
        <ScoresSection />
      </section>
      <section id="playlist">
        <PlaylistSection spotifyUrl={config?.spotify_playlist_url} />
      </section>
    </div>
  )
}
