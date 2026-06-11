import { useEffect } from 'react'
import { createLenis } from './lib/lenis'
import { useSiteConfig } from './hooks/useSupabase'
import Navbar from './components/Navbar'
import CustomCursor from './components/CustomCursor'
import MarqueeStrip from './components/MarqueeStrip'
import HeroSection from './sections/HeroSection'
import MapSection from './sections/MapSection'
import ScoresSection from './sections/ScoresSection'
import PlaylistSection from './sections/PlaylistSection'
import PredictorSection from './sections/PredictorSection'

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
      <CustomCursor />
      <Navbar showScores={config?.show_scores ?? true} />
      <section id="hero">
        <HeroSection heroMessage={config?.hero_message} />
      </section>
      <MarqueeStrip />
      <section id="map">
        <MapSection />
      </section>
      <section id="scores">
        <ScoresSection />
      </section>
      <section id="playlist">
        <PlaylistSection spotifyUrl={config?.spotify_playlist_url} />
      </section>
      <section id="predictor">
        <PredictorSection />
      </section>
    </div>
  )
}
