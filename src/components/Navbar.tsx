import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, MapPin, BarChart3, Music2, Trophy } from 'lucide-react'
import { scrollTo } from '../lib/lenis'
import { useActiveSection } from '../hooks/useActiveSection'

const SECTIONS = ['hero', 'map', 'scores', 'playlist', 'predictor']

const allLinks = [
  { id: 'map',       label: 'Map' },
  { id: 'scores',    label: 'Scores' },
  { id: 'playlist',  label: 'Playlist' },
  { id: 'predictor', label: 'Predictor' },
]

const mobileTabsAll = [
  { id: 'hero',      label: 'Home',      Icon: Home },
  { id: 'map',       label: 'Map',       Icon: MapPin },
  { id: 'scores',    label: 'Scores',    Icon: BarChart3 },
  { id: 'playlist',  label: 'Playlist',  Icon: Music2 },
  { id: 'predictor', label: 'Predictor', Icon: Trophy },
]

export default function Navbar({ showScores = true }: { showScores?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveSection(SECTIONS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const desktopLinks = allLinks.filter(l => l.id !== 'scores' || showScores)
  const mobileTabs = mobileTabsAll.filter(t => t.id !== 'scores' || showScores)

  return (
    <>
      {/* ── Desktop top navbar ────────────────────────────── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 hidden md:block"
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
          <button onClick={() => scrollTo('#hero', { offset: 0 })} className="flex items-center gap-3">
            <span className="text-xl">🇵🇹</span>
            <div className="text-left">
              <div className="text-[11px] tracking-[0.3em] uppercase leading-none" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter', fontWeight: 500 }}>
                Portugal
              </div>
              <div className="text-[9px] tracking-[0.4em] uppercase leading-none mt-0.5" style={{ color: '#C8A200' }}>
                WC 2026
              </div>
            </div>
          </button>

          {/* Links */}
          <div className="flex items-center gap-8">
            {desktopLinks.map((link) => (
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

      {/* ── Mobile top header (logo only) ────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between h-12 px-5"
        style={{
          background: 'rgba(8,8,8,0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button onClick={() => scrollTo('#hero', { offset: 0 })} className="flex items-center gap-2">
          <span className="text-base">🇵🇹</span>
          <div className="text-left">
            <div className="text-[10px] tracking-[0.3em] uppercase leading-none" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
              Portugal
            </div>
            <div className="text-[8px] tracking-[0.35em] uppercase leading-none mt-0.5" style={{ color: '#C8A200' }}>
              WC 2026
            </div>
          </div>
        </button>
        <a href="/admin" className="text-[9px] tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Admin
        </a>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
        style={{
          background: 'rgba(8,8,8,0.96)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {mobileTabs.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => scrollTo(`#${id}`, { offset: id === 'hero' ? 0 : undefined })}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200"
              style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.3)' }}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ color: isActive ? '#00cc44' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}
                />
                {isActive && (
                  <motion.div
                    layoutId="tab-dot"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: '#00cc44' }}
                  />
                )}
              </div>
              <span
                className="text-[9px] tracking-[0.15em] uppercase font-medium transition-colors duration-200"
                style={{ color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
