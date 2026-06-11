import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [isTouch] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(pointer: coarse)').matches ||
      navigator.maxTouchPoints > 0 ||
      'ontouchstart' in window
    )
  })
  const [visible, setVisible] = useState(false)
  const [clicking, setClicking] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const x = useSpring(mouseX, { stiffness: 280, damping: 22 })
  const y = useSpring(mouseY, { stiffness: 280, damping: 22 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      setVisible(true)
    }
    const onLeave = () => setVisible(false)
    const onDown = () => setClicking(true)
    const onUp = () => setClicking(false)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
    }
  }, [mouseX, mouseY])

  if (isTouch) return null

  return (
    <>
      <style>{`*, *::before, *::after { cursor: none !important; }`}</style>
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none select-none"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
          width: clicking ? 36 : 44,
          height: clicking ? 36 : 44,
          transition: 'width 0.1s ease, height 0.1s ease, opacity 0.2s ease',
        }}
      >
        <img src="/cursor.svg" alt="" style={{ width: '100%', height: '100%' }} />
      </motion.div>
    </>
  )
}
