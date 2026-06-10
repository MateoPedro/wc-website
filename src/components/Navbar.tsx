import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scrollTo } from '../lib/lenis'
import { useActiveSection } from '../hooks/useActiveSection'

const SECTIONS = ['hero', 'map', 'scores', 'playlist', 'predictor']

const allLinks = [
  { id: 'map', label: 'Map' },
  { id: 'scores', label: 'Scores' },
  { id: 'playlist', label: 'Playlist' },
  { id: 'predictor', label: 'Predictor' },
]

export default function Navbar({ showScores = true }: { showScores?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveSection(SECTIONS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      animate={{
        backgroundColor: scrolled ? 'rgba(8,8,8,0.92)' : 'rgba(8,8,8,0)',
        borderBottomColor: scrolled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0)',
      }}
      transition={{ duration: 0.3 }}
      style={{
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
      }}
    >
      <div className="flex items-center justify-between h-16 px-8 max-w-screen-xl mx-auto">
        {/* Logo */}
        <button
          onClick={() => scrollTo('#hero', { offset: 0 })}
          className="flex items-center gap-3 group"
        >
          <span className="text-xl">🇵🇹</span>
          <div className="text-left">
            <div
              className="text-[11px] tracking-[0.3em] uppercase leading-none"
              style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter', fontWeight: 500 }}
            >
              Portugal
            </div>
            <div
              className="text-[9px] tracking-[0.4em] uppercase leading-none mt-0.5"
              style={{ color: '#C8A200' }}
            >
              WC 2026
            </div>
          </div>
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-8">
          {allLinks.filter(l => l.id !== 'scores' || showScores).map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(`#${link.id}`)}
              className="relative text-[11px] tracking-[0.2em] uppercase font-medium transition-colors duration-300"
              style={{ color: active === link.id ? '#ffffff' : 'rgba(255,255,255,0.35)' }}
            >
              {link.label}
              <AnimatePresence>
                {active === link.id && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-px"
                    style={{ background: '#00cc44' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        {/* Admin */}
        <a
          href="/admin"
          className="text-[10px] tracking-[0.3em] uppercase transition-colors duration-300"
          style={{ color: 'rgba(255,255,255,0.18)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.18)')}
        >
          Admin
        </a>
      </div>
    </motion.nav>
  )
}
