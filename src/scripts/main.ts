import {
  initAdvantages,
  initHeroScroll,
  initLineReveal,
  initManifesto,
  initParallax,
  initPipeline,
  initProcessLine,
  initReveal,
  initSplitHeadline,
  initWorldBackground,
} from './animations/scroll-scenes';
import { initSmoothScroll } from './animations/smooth-scroll';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './utils/motion';

const reducedMotion = prefersReducedMotion();

const hasWebGL = (() => {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
})();

// ---------- Animasi scroll ----------
// Progress chapter diteruskan ke scene 3D setelah scene selesai dimuat
const progress = { hero: (_: number) => {}, manifesto: (_: number) => {} };

if (!reducedMotion) {
  initSmoothScroll();
  initSplitHeadline();
  initLineReveal();
  initParallax();
  initReveal();
  initWorldBackground();
  initHeroScroll((p) => progress.hero(p));
  initManifesto((p) => progress.manifesto(p));
  initPipeline();
  initAdvantages();
  initProcessLine();
}

// Hitung ulang posisi trigger saat layout berubah (filter portofolio, font selesai dimuat)
window.addEventListener('layout:change', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());

// ---------- 3D (dimuat terpisah agar tidak memperlambat tampilan awal) ----------
const worldCanvas = document.getElementById('world-canvas') as HTMLCanvasElement | null;
const heroStage = document.querySelector<HTMLElement>('[data-hero-stage]');
const viewerCanvas = document.getElementById('viewer-canvas') as HTMLCanvasElement | null;

if (hasWebGL && worldCanvas && heroStage) {
  const chapters = ['hero', 'manifesto']
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el);

  const start = () =>
    import('./three/world-scene').then(({ createWorldScene }) => {
      const world = createWorldScene(worldCanvas, heroStage, chapters, reducedMotion);
      progress.hero = world.setHeroProgress;
      progress.manifesto = world.setManifestoProgress;
      document.getElementById('hero-fallback')?.classList.add('opacity-0');
      ScrollTrigger.refresh();
    });
  'requestIdleCallback' in window
    ? requestIdleCallback(start, { timeout: 1200 })
    : setTimeout(start, 300);
}

if (hasWebGL && viewerCanvas) {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      import('./three/product-viewer').then(({ createProductViewer }) =>
        createProductViewer(viewerCanvas, reducedMotion),
      );
    },
    { rootMargin: '400px' },
  );
  io.observe(viewerCanvas);
}
