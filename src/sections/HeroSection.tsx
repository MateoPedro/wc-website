import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { scrollTo } from '../lib/lenis'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.2 } },
}

export default function HeroSection({ heroMessage }: { heroMessage?: string }) {
  void heroMessage // available for future use in subtitle
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Background glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at -5% 110%, rgba(0,102,0,0.22) 0%, transparent 60%),' +
            'radial-gradient(ellipse 50% 50% at 105% -5%, rgba(204,0,0,0.07) 0%, transparent 55%),' +
            'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,0,0,0) 0%, #080808 100%)',
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      {/* Corner date label */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="absolute top-20 right-8 text-right hidden md:block"
      >
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Tournament
        </div>
        <div className="text-sm font-light mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Jun 12 – Jul 19, 2026
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-24 pb-16"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-screen-xl"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#00cc44' }}
            />
            <span
              className="text-[10px] tracking-[0.35em] uppercase font-medium"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Live Trip Tracker
            </span>
            <span
              className="h-px w-12"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            />
          </motion.div>

          {/* Headline */}
          <div className="overflow-hidden">
            <motion.h1
              variants={fadeUp}
              className="leading-none select-none"
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 'clamp(80px, 13vw, 200px)',
                color: '#ffffff',
                letterSpacing: '0.02em',
                lineHeight: 0.92,
              }}
            >
              Following
            </motion.h1>
          </div>

          <div className="overflow-hidden">
            <motion.h1
              variants={fadeUp}
              className="leading-none select-none"
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 'clamp(80px, 13vw, 200px)',
                letterSpacing: '0.02em',
                lineHeight: 0.92,
                background: 'linear-gradient(110deg, #ffffff 0%, #00cc44 45%, #C8A200 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Portugal 🇵🇹
            </motion.h1>
          </div>

          {/* Divider */}
          <motion.div variants={fadeUp} className="flex items-center gap-6 mt-10 mb-8">
            <div
              className="h-px flex-1 max-w-xs"
              style={{ background: 'linear-gradient(90deg, rgba(0,204,68,0.6), transparent)' }}
            />
            <div className="flex items-center gap-6">
              {['USA', 'Canada', 'Mexico'].map((c, i) => (
                <span key={c} className="flex items-center gap-6">
                  {i > 0 && (
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                    />
                  )}
                  <span
                    className="text-[11px] tracking-[0.3em] uppercase"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {c}
                  </span>
                </span>
              ))}
            </div>
          </motion.div>

          {/* Sub-details */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6">
            {[
              { label: 'Travelers', value: '10' },
              { label: 'Cities', value: '8+' },
              { label: 'Matches', value: '7+' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: 'Bebas Neue, sans-serif',
                    color: '#ffffff',
                    letterSpacing: '0.05em',
                  }}
                >
                  {value}
                </div>
                <div
                  className="text-[10px] tracking-[0.25em] uppercase mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll CTA */}
      <motion.button
        variants={fadeIn}
        initial="hidden"
        animate="show"
        onClick={() => scrollTo('#map')}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group"
      >
        <span
          className="text-[9px] tracking-[0.4em] uppercase"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
            <rect x="1" y="1" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1.2" />
            <motion.rect
              x="6" y="5" width="2" height="4" rx="1" fill="currentColor"
              animate={{ y: [0, 4, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
      </motion.button>
    </div>
  )
}
