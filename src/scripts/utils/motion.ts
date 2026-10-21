export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isDesktop = (): boolean => window.matchMedia('(min-width: 1024px)').matches;

/** Gabungkan path aset /public dengan base URL (penting untuk GitHub Pages sub-path). */
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
