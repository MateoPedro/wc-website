import { useEffect } from 'react'
import { createLenis } from './lib/lenis'
import Navbar from './components/Navbar'
import HeroSection from './sections/HeroSection'
import MapSection from './sections/MapSection'
import ScoresSection from './sections/ScoresSection'
import PlaylistSection from './sections/PlaylistSection'

export default function App() {
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
      <Navbar />
      <section id="hero">
        <HeroSection />
      </section>
      <section id="map">
        <MapSection />
      </section>
      <section id="scores">
        <ScoresSection />
      </section>
      <section id="playlist">
        <PlaylistSection />
      </section>
    </div>
  )
}
