import { site } from '@/data/site';

/** Membuat link wa.me dengan pesan yang sudah terisi. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${site.whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const defaultMessage = `Halo ${site.name}, saya tertarik dengan jasa visual produk 3D. Boleh konsultasi?`;
