import Lenis from 'lenis'

export let lenisInstance: Lenis | null = null

export function createLenis(): Lenis {
  lenisInstance = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  })
  return lenisInstance
}

export function scrollTo(
  target: string | HTMLElement | number,
  options?: { offset?: number; duration?: number },
) {
  lenisInstance?.scrollTo(target as string, options)
}
