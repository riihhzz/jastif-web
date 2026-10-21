import {
  initAdvantages,
  initGallery,
  initHeroScroll,
  initLineReveal,
  initManifesto,
  initParallax,
  initPipeline,
  initProcessLine,
  initReveal,
  initSplitHeadline,
  initViewer,
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

/**
 * Penghubung progress scroll → scene 3D. Scene dimuat belakangan, jadi nilai terakhir disimpan
 * dan langsung dikirim saat scene tersambung.
 */
function relay() {
  let value = 0;
  let target: (p: number) => void = () => {};
  return {
    push: (p: number) => {
      value = p;
      target(p);
    },
    connect: (fn: (p: number) => void) => {
      target = fn;
      fn(value);
    },
  };
}

const progress = {
  hero: relay(),
  manifesto: relay(),
  viewer: relay(),
  gallery: relay(),
};

// ---------- Animasi scroll ----------
// Efek scroll (parallax, sticky, reveal) dikendalikan langsung oleh scroll pengguna, jadi aktif
// untuk semua. Untuk pengguna "reduce motion" hanya smooth scroll (inersia) yang dimatikan;
// animasi loop CSS & gerakan idle 3D dimatikan di global.css dan scene 3D.
if (!reducedMotion) initSmoothScroll();
initSplitHeadline();
initLineReveal();
initParallax();
initReveal();
initWorldBackground();
initHeroScroll(progress.hero.push);
initManifesto(progress.manifesto.push);
initPipeline();
initAdvantages();
initViewer(progress.viewer.push);
initGallery(progress.gallery.push);
initProcessLine();

// Hitung ulang posisi trigger saat layout berubah (filter portofolio, font selesai dimuat)
window.addEventListener('layout:change', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());

// ---------- 3D (dimuat terpisah agar tidak memperlambat tampilan awal) ----------
/** Jalankan `load` sekali saat elemen mendekati layar. */
function whenNear(el: Element, load: () => void) {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      load();
    },
    { rootMargin: '600px' },
  );
  io.observe(el);
}

const worldCanvas = document.getElementById('world-canvas') as HTMLCanvasElement | null;
const heroStage = document.querySelector<HTMLElement>('[data-hero-stage]');
const viewerCanvas = document.getElementById('viewer-canvas') as HTMLCanvasElement | null;
const galleryCanvas = document.getElementById('gallery-canvas') as HTMLCanvasElement | null;

if (hasWebGL && worldCanvas && heroStage) {
  const chapters = ['hero', 'manifesto']
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el);

  const start = () =>
    import('./three/world-scene').then(({ createWorldScene }) => {
      const world = createWorldScene(worldCanvas, heroStage, chapters, reducedMotion);
      progress.hero.connect(world.setHeroProgress);
      progress.manifesto.connect(world.setManifestoProgress);
      document.getElementById('hero-fallback')?.classList.add('opacity-0');
      ScrollTrigger.refresh();
    });
  'requestIdleCallback' in window
    ? requestIdleCallback(start, { timeout: 1200 })
    : setTimeout(start, 300);
}

if (hasWebGL && viewerCanvas) {
  whenNear(viewerCanvas, () =>
    import('./three/product-viewer')
      .then(({ createProductViewer }) => createProductViewer(viewerCanvas, reducedMotion))
      .then((viewer) => progress.viewer.connect(viewer.setProgress)),
  );
}

if (hasWebGL && galleryCanvas) {
  whenNear(galleryCanvas, () =>
    import('./three/gallery-sphere')
      .then(({ createGallerySphere }) => createGallerySphere(galleryCanvas, reducedMotion))
      .then((gallery) => progress.gallery.connect(gallery.setProgress)),
  );
}
