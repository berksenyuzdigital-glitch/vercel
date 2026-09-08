import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Lenis + GSAP ScrollTrigger, wired so that:
 *  - native scroll still wins (no wheel hijacking beyond easing)
 *  - keyboard scrolling keeps working
 *  - prefers-reduced-motion disables smoothing and reveal motion entirely
 *  - everything is torn down on unmount (no unbounded rAF loop)
 */
export function useSmoothScroll() {
  onMounted(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.registerPlugin(ScrollTrigger)

    let lenis: Lenis | null = null
    let rafId = 0

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // touch keeps native inertia — custom easing on touch feels wrong on iOS
        syncTouch: false
      })

      lenis.on('scroll', ScrollTrigger.update)

      const raf = (time: number) => {
        lenis?.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    }

    // Reveals — instant when reduced motion is requested
    const targets = gsap.utils.toArray<HTMLElement>('.reveal')
    targets.forEach((el) => {
      if (reduced) {
        el.classList.add('is-revealed')
        return
      }
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'expo.out',
            onComplete: () => el.classList.add('is-revealed')
          })
        }
      })
    })

    onBeforeUnmount(() => {
      cancelAnimationFrame(rafId)
      ScrollTrigger.getAll().forEach((t) => t.kill())
      lenis?.destroy()
    })
  })
}
