import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Parallax berlapis: elemen dengan [data-speed] bergerak lebih lambat/cepat dari scroll.
 * Nilai positif = tertinggal (terasa jauh), negatif = mendahului (terasa dekat).
 */
export function initParallax(): void {
  gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed ?? '0');
    if (!speed) return;
    const trigger = el.closest('section') ?? el;
    gsap.fromTo(
      el,
      { y: () => -speed * window.innerHeight * 0.5 },
      {
        y: () => speed * window.innerHeight * 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });
}

/** Elemen [data-reveal] muncul dengan fade + naik saat masuk viewport, berurutan per grup. */
export function initReveal(): void {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true },
      ),
  });
}

/**
 * Pecah teks elemen menjadi span per kata (elemen bersarang seperti <span>/<strong> tetap dipertahankan).
 * `mask: true` membungkus tiap kata dengan overflow-hidden untuk efek naik dari balik garis.
 */
function splitWords(root: HTMLElement, mask: boolean): HTMLElement[] {
  const words: HTMLElement[] = [];
  const wrap = (node: Node) => {
    if (node.nodeType !== Node.TEXT_NODE) return Array.from(node.childNodes).forEach(wrap);
    const frag = document.createDocumentFragment();
    node.textContent!.split(/(\s+)/).forEach((part) => {
      if (!part.trim()) return frag.append(part);
      const word = document.createElement('span');
      word.className = 'inline-block';
      word.textContent = part;
      words.push(word);
      if (!mask) return frag.append(word);
      const outer = document.createElement('span');
      outer.className = 'inline-block overflow-hidden pb-[0.08em] align-bottom';
      outer.append(word);
      frag.append(outer);
    });
    node.parentNode!.replaceChild(frag, node);
  };
  root.setAttribute('aria-label', root.textContent!.replace(/\s+/g, ' ').trim());
  Array.from(root.childNodes).forEach(wrap);
  root.querySelectorAll(':scope > *').forEach((s) => s.setAttribute('aria-hidden', 'true'));
  return words;
}

/**
 * Judul [data-split]: tiap kata naik dari balik mask.
 * `data-split="scroll"` diputar saat judul masuk layar, selain itu langsung saat halaman dimuat.
 */
export function initSplitHeadline(): void {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((heading) => {
    const words = splitWords(heading, true);
    const onScroll = heading.dataset.split === 'scroll';
    gsap.from(words, {
      yPercent: 110,
      duration: onScroll ? 1 : 1.2,
      ease: 'expo.out',
      stagger: onScroll ? 0.04 : 0.06,
      delay: onScroll ? 0 : 0.15,
      scrollTrigger: onScroll ? { trigger: heading, start: 'top 88%', once: true } : undefined,
    });
  });
}

/** Judul raksasa [data-lines]: tiap baris [data-line] naik dari balik mask saat masuk layar. */
export function initLineReveal(): void {
  document.querySelectorAll<HTMLElement>('[data-lines]').forEach((title) => {
    gsap.from(title.querySelectorAll('[data-line]'), {
      yPercent: 105,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: title, start: 'top 85%', once: true },
    });
  });
}

/** Warna lapisan latar "world" berganti mengikuti section [data-bg] yang sedang aktif. */
export function initWorldBackground(): void {
  const bg = document.getElementById('world-bg');
  if (!bg) return;
  gsap.utils.toArray<HTMLElement>('[data-bg]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: (self) =>
        self.isActive &&
        gsap.to(bg, { backgroundColor: section.dataset.bg, duration: 0.9, ease: 'power2.out' }),
    });
  });
}

/**
 * Manifesto: kata demi kata berubah dari pudar ke pekat selama section sticky discroll.
 * `onProgress` menerima progress 0–1 dari section masuk hingga keluar layar (untuk scene 3D).
 */
export function initManifesto(onProgress?: (p: number) => void): void {
  const section = document.querySelector<HTMLElement>('[data-manifesto]');
  const text = section?.querySelector<HTMLElement>('[data-manifesto-text]');
  if (!section || !text) return;

  const words = splitWords(text, false);
  gsap.fromTo(
    words,
    { opacity: 0.14 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: section, start: 'top 20%', end: 'bottom 90%', scrub: true },
    },
  );

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => onProgress?.(self.progress),
  });
}

/**
 * Keunggulan: headline raksasa muncul, lalu kartu kaca melintas dari kanan ke kiri
 * sambil berputar; kartu terakhir berhenti di tengah.
 */
export function initAdvantages(): void {
  const section = document.querySelector<HTMLElement>('[data-advantages]');
  if (!section) return;
  const cards = gsap.utils.toArray<HTMLElement>('[data-advantage-card]', section);
  const lines = section.querySelectorAll('[data-line]');
  const vw = () => window.innerWidth;

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.7,
      invalidateOnRefresh: true,
    },
  });

  tl.from(lines, { yPercent: 105, stagger: 0.15, duration: 0.6, ease: 'power3.out' }, 0);
  cards.forEach((card, i) => {
    const t = 0.6 + i * 1.1;
    const tilt = i % 2 ? 4 : -4;
    tl.fromTo(
      card,
      { x: () => vw() * 0.75 + 200, y: 80, rotation: 26 },
      { x: 0, y: 0, rotation: tilt, duration: 1, ease: 'power2.out' },
      t,
    );
    if (i < cards.length - 1) {
      tl.to(
        card,
        { x: () => -(vw() * 0.75 + 200), y: -60, rotation: -22, duration: 1, ease: 'power2.in' },
        t + 1.3,
      );
    }
  });
  // Jeda singkat di akhir agar kartu terakhir sempat terbaca
  tl.to({}, { duration: 0.6 });
}

/** Hero: kartu teks menjauh & memudar, panggung 3D sedikit membesar saat discroll. */
export function initHeroScroll(onProgress?: (p: number) => void): void {
  const hero = document.getElementById('hero');
  if (!hero) return;

  gsap
    .timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => onProgress?.(self.progress),
      },
    })
    .to('[data-hero-copy]', { yPercent: -18, opacity: 0.2, scale: 0.96, ease: 'none' }, 0)
    .to('[data-hero-stage]', { yPercent: 12, scale: 1.08, ease: 'none' }, 0);
}

/** Section konsep: di desktop di-pin, kartu bergeser horizontal mengikuti scroll. */
export function initPipeline(): void {
  const section = document.querySelector<HTMLElement>('[data-pipeline]');
  const track = section?.querySelector<HTMLElement>('[data-pipeline-track]');
  const progress = section?.querySelector<HTMLElement>('[data-pipeline-progress]');
  if (!section || !track) return;

  gsap.matchMedia().add('(min-width: 1024px)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance() + window.innerHeight * 0.5}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    tl.to(track, { x: () => -distance(), ease: 'none' }, 0);
    if (progress) tl.to(progress, { scaleX: 1, ease: 'none' }, 0);

    // Kartu sedikit miring lalu tegak saat lewat tengah layar (efek kedalaman)
    gsap.utils.toArray<HTMLElement>(track.children).forEach((card) => {
      gsap.fromTo(
        card,
        { rotateY: -12, transformPerspective: 900 },
        {
          rotateY: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            containerAnimation: tl,
            start: 'left right',
            end: 'center center',
            scrub: true,
          },
        },
      );
    });
  });
}

/**
 * Viewer "Segala Sudut". Desktop: section sticky, bingkai miring → tegak, teks "360°" bergeser,
 * chip melayang dengan kedalaman berbeda, langkah menyala bergantian. HP: parallax biasa.
 * `onProgress` memutar model 3D seperti turntable.
 */
export function initViewer(onProgress?: (p: number) => void): void {
  const section = document.querySelector<HTMLElement>('[data-viewer]');
  if (!section) return;
  const frame = section.querySelector('[data-viewer-frame]');
  const bigText = section.querySelector('[data-viewer-bigtext]');
  const chips = gsap.utils.toArray<HTMLElement>('[data-viewer-chip]', section);
  const steps = gsap.utils.toArray<HTMLElement>('[data-viewer-step]', section);

  const setStep = (p: number) => {
    const active = Math.min(steps.length - 1, Math.floor(p * steps.length));
    steps.forEach((s, i) => s.toggleAttribute('data-active', i === active));
  };

  const build = (start: string, end: string, desktop: boolean) => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start,
        end,
        scrub: 0.6,
        onUpdate: (self) => {
          onProgress?.(self.progress);
          if (desktop) setStep(self.progress);
        },
      },
    });
    tl.fromTo(bigText, { xPercent: 10 }, { xPercent: -45, duration: 1 }, 0);
    chips.forEach((chip) => {
      const depth = parseFloat(chip.dataset.depth ?? '1');
      tl.fromTo(chip, { y: 140 * depth }, { y: -140 * depth, duration: 1 }, 0);
    });
    if (desktop) {
      tl.fromTo(
        frame,
        { rotationX: 16, rotationY: -18, scale: 0.86 },
        { rotationX: 0, rotationY: 0, scale: 1, duration: 0.35, ease: 'power2.out' },
        0,
      ).to(frame, { rotationY: 8, rotationX: -4, duration: 0.65 }, 0.35);
    }
  };

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => build('top top', 'bottom bottom', true));
  mm.add('(max-width: 1023px)', () => build('top bottom', 'bottom top', false));
}

/** Bola galeri 3D: headline mengecil & memudar saat bola tumbuh, keterangan muncul di akhir. */
export function initGallery(onProgress?: (p: number) => void): void {
  const section = document.querySelector<HTMLElement>('[data-gallery]');
  if (!section) return;

  gsap.set('[data-gallery-caption]', { opacity: 0, y: 40 });
  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => onProgress?.(self.progress),
      },
    })
    .fromTo(
      '[data-gallery-title]',
      { scale: 1, opacity: 1 },
      { scale: 0.7, opacity: 0, filter: 'blur(12px)', duration: 0.35 },
      0.05,
    )
    .fromTo(
      '[data-gallery-caption]',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' },
      0.7,
    )
    .to({}, { duration: 0.1 });
}

/** Garis progres pada section "Cara Pesan". */
export function initProcessLine(): void {
  const line = document.querySelector('[data-process-line]');
  if (!line) return;
  gsap.to(line, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: '[data-process]', start: 'top 75%', end: 'bottom 55%', scrub: true },
  });
}
