export interface PipelineStep {
  title: string;
  description: string;
  output: string;
}

// Alur "One Product → One Digital Asset → Many Contents"
export const pipeline: PipelineStep[] = [
  {
    title: 'Input',
    description: 'Kamu kirim foto produk, desain label, logo, dan referensi visual. Cukup dari HP.',
    output: 'Bahan produk',
  },
  {
    title: '3D Modeling',
    description: 'Produk dibentuk ulang secara digital dengan proporsi yang presisi.',
    output: 'Model 3D produk',
  },
  {
    title: 'Material & Lighting',
    description: 'Tekstur, label, dan pencahayaan studio diatur tanpa perlu studio fisik.',
    output: 'Tampilan realistis',
  },
  {
    title: 'Digital Asset',
    description: 'Model disimpan sebagai aset 3D yang bisa dipakai lagi kapan saja.',
    output: 'Aset siap pakai ulang',
  },
  {
    title: 'Many Contents',
    description: 'Satu aset jadi banyak konten: foto produk, Reels, TikTok, dan materi kampanye.',
    output: 'Konten tanpa batas',
  },
];

export interface Angle {
  label: string;
  title: string;
  description: string;
  /** Path di /public, mis. 'images/showcase/front.webp'. Kosongkan bila belum ada render. */
  image?: string;
}

// Tiga sudut render yang termasuk dalam paket dasar
export const angles: Angle[] = [
  {
    label: 'Front View',
    title: 'Tampilan Depan yang Lebih Profesional',
    description: 'Fokus pada label dan identitas brand, bersih dan siap untuk katalog.',
  },
  {
    label: 'Perspective View',
    title: 'Sudut Perspektif untuk Kesan Dinamis',
    description: 'Memperlihatkan bentuk dan dimensi produk agar terasa lebih nyata.',
  },
  {
    label: 'Promotional Shot',
    title: 'Visual Promosi yang Menarik Perhatian',
    description: 'Lengkap dengan elemen pendukung seperti es, percikan air, atau properti.',
    image: 'images/portfolio/parfum-promo.webp',
  },
];

export interface Advantage {
  label: string;
  title: string;
  description: string;
}

// Kartu yang melintas di section Keunggulan
export const advantages: Advantage[] = [
  {
    label: 'Proses',
    title: '100% Online',
    description: 'Tidak perlu datang ke studio. Cukup kirim foto produk dari HP.',
  },
  {
    label: 'Harga',
    title: 'Mulai Rp35rb',
    description: 'Harga awal yang ramah untuk UMKM yang baru mulai promosi digital.',
  },
  {
    label: 'Efisien',
    title: 'Aset Pakai Ulang',
    description: 'Satu model 3D bisa dipakai lagi untuk foto, video, dan konten baru.',
  },
  {
    label: 'Kualitas',
    title: 'Revisi Termasuk',
    description: 'Setiap paket sudah termasuk satu kali revisi ringan.',
  },
];

export interface Package {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  available: boolean;
  highlight?: boolean;
}

export const packages: Package[] = [
  {
    name: '3D Product Visual',
    price: 'Rp35.000',
    priceNote: 'mulai dari',
    description: 'Visual produk 3D untuk foto katalog dan feed media sosial.',
    features: [
      '1 produk sederhana',
      '3 hasil render (depan, perspektif, promosi)',
      '1 kali revisi ringan',
      'File JPG / PNG resolusi tinggi',
    ],
    available: true,
    highlight: true,
  },
  {
    name: '3D Short Content',
    price: 'Segera hadir',
    description: 'Video pendek dari aset 3D untuk Reels dan TikTok.',
    features: ['Animasi produk berputar', 'Format vertikal 9:16', 'Memakai aset 3D yang sudah ada'],
    available: false,
  },
  {
    name: 'Content Reuse',
    price: 'Segera hadir',
    description: 'Konten lanjutan dari aset yang sama, tanpa modeling ulang.',
    features: ['Konsep visual baru', 'Variasi warna / latar', 'Lebih hemat waktu & biaya'],
    available: false,
  },
];
