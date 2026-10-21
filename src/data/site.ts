// Identitas & kontak utama. Ubah di sini, otomatis berlaku di seluruh website.
export const site = {
  name: 'Jastif.id',
  tagline: 'Solusi Visual Konten Promosi Digital',
  description:
    'Jastif.id membantu UMKM mengubah produk fisik menjadi aset visual 3D yang siap dipakai untuk foto produk, konten Instagram, TikTok, dan materi promosi lainnya.',
  location: 'UPI Kampus Cibiru, Bandung, Jawa Barat',
  whatsapp: {
    number: '6285892888361',
    display: '+62 858-9288-8361',
  },
  instagram: {
    handle: 'jastif.id',
    url: 'https://www.instagram.com/jastif.id/',
  },
} as const;

export const nav = [
  { label: 'Konsep', href: '#konsep' },
  { label: 'Layanan', href: '#layanan' },
  { label: 'Portofolio', href: '#portofolio' },
  { label: 'Harga', href: '#harga' },
  { label: 'FAQ', href: '#faq' },
] as const;
