import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Smooth scroll Lenis yang disinkronkan dengan ticker GSAP agar ScrollTrigger tetap presisi. */
export function initSmoothScroll(): Lenis {
  const lenis = new Lenis({
    lerp: 0.09,
    anchors: { offset: -80 },
    allowNestedScroll: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
