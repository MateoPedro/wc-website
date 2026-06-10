import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { scrollTo } from '../lib/lenis'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.2 } },
}

export default function HeroSection({ heroMessage }: { heroMessage?: string }) {
  void heroMessage
  const ref = useRef<HTMLDivElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Full-bleed background image with parallax */}
      <motion.div
        style={{ y: imgY }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="/hero.jpg"
          alt=""
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(false)}
          className="w-full h-full object-cover"
          style={{
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity 1s ease',
          }}
        />
      </motion.div>

      {/* Dark overlay — clear at top, heavy at bottom where text sits */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: imgLoaded
            ? 'linear-gradient(to bottom, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.05) 40%, rgba(8,8,8,0.7) 70%, rgba(8,8,8,0.92) 100%)'
            : 'transparent',
          transition: 'background 1s ease',
        }}
      />

      {/* Background glows (show when no image) */}
      {!imgLoaded && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at -5% 110%, rgba(0,102,0,0.22) 0%, transparent 60%),' +
              'radial-gradient(ellipse 50% 50% at 105% -5%, rgba(204,0,0,0.07) 0%, transparent 55%)',
          }}
        />
      )}

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
          opacity: imgLoaded ? 0.4 : 1,
          transition: 'opacity 1s ease',
        }}
      />

      {/* Corner date label */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="absolute top-20 right-8 text-right hidden md:block z-10"
      >
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Tournament
        </div>
        <div className="text-sm font-light mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Jun 12 – Jul 19, 2026
        </div>
      </motion.div>

      {/* Text content — anchored to bottom */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 flex-1 flex flex-col justify-end px-8 md:px-16 lg:px-24 pt-28 pb-24"
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
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              Live Trip Tracker
            </span>
            <span className="h-px w-12" style={{ background: 'rgba(255,255,255,0.25)' }} />
          </motion.div>

          {/* Headline */}
          <div className="overflow-hidden">
            <motion.h1
              variants={fadeUp}
              className="leading-none select-none"
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 'clamp(72px, 11vw, 180px)',
                color: '#ffffff',
                letterSpacing: '0.02em',
                lineHeight: 0.9,
              }}
            >
              Pra Cima Deles,
            </motion.h1>
          </div>

          <div className="overflow-hidden">
            <motion.h1
              variants={fadeUp}
              className="leading-none select-none"
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 'clamp(72px, 11vw, 180px)',
                letterSpacing: '0.02em',
                lineHeight: 0.9,
                background: 'linear-gradient(110deg, #C8A200 0%, #ffd54f 50%, #C8A200 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Caralho
            </motion.h1>
          </div>

          {/* Divider + countries */}
          <motion.div variants={fadeUp} className="flex items-center gap-6 mt-10 mb-8">
            <div
              className="h-px flex-1 max-w-xs"
              style={{ background: 'linear-gradient(90deg, rgba(0,204,68,0.7), transparent)' }}
            />
            <div className="flex items-center gap-6">
              {['USA', 'Canada', 'Mexico'].map((c, i) => (
                <span key={c} className="flex items-center gap-6">
                  {i > 0 && (
                    <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
                  )}
                  <span
                    className="text-[11px] tracking-[0.3em] uppercase"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    {c}
                  </span>
                </span>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </motion.div>

      {/* Scroll CTA */}
      <motion.button
        variants={fadeIn}
        initial="hidden"
        animate="show"
        onClick={() => scrollTo('#map')}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
      >
        <span
          className="text-[10px] tracking-[0.4em] uppercase font-medium"
          style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'rgba(255,255,255,0.8)', filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.9))' }}
        >
          <svg width="18" height="26" viewBox="0 0 18 26" fill="none">
            <rect x="1" y="1" width="16" height="24" rx="8" stroke="currentColor" strokeWidth="1.5" />
            <motion.rect
              x="8" y="6" width="2" height="5" rx="1" fill="currentColor"
              animate={{ y: [0, 5, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
      </motion.button>
    </div>
  )
}
