import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const WORDS = ['PORTUGAL', '2026', 'GROUP K', 'USA', 'CANADA', 'MEXICO', 'WC 2026', 'FORÇA PORTUGAL', 'NORTH AMERICA']
const text = WORDS.join('  ·  ') + '  ·  '
const repeated = text.repeat(6)

function Row({ reverse = false, speed = 28 }: { reverse?: boolean; speed?: number }) {
  return (
    <div style={{ overflow: 'hidden', display: 'flex' }}>
      <motion.div
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', whiteSpace: 'nowrap', willChange: 'transform' }}
      >
        <span style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 11,
          letterSpacing: '0.35em',
          color: 'rgba(255,255,255,0.18)',
        }}>
          {repeated}
        </span>
      </motion.div>
    </div>
  )
}

export default function MarqueeStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="relative py-5 overflow-hidden"
    >
      {/* Top gradient border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)' }} />
      {/* Bottom gradient border */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)' }} />

      {/* Subtle red glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(204,0,0,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Row speed={30} />
        <Row reverse speed={24} />
      </div>
    </motion.div>
  )
}
