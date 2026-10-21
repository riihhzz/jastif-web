# Jastif.id — Website

Website landing page Jastif.id, jasa visual produk 3D untuk UMKM.

**Stack:** Astro 7 · Tailwind CSS 4 · TypeScript · GSAP ScrollTrigger · Lenis · Three.js

Efek scroll terinspirasi gaya _sticky storytelling_: section "sticker" (wrapper tinggi +
isi sticky), satu kanvas 3D fixed yang berganti formasi per chapter, latar yang berganti warna,
teks manifesto yang menebal kata demi kata, dan kartu kaca yang melintas di atas headline raksasa.

## Menjalankan di komputer

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # hasil di folder dist/
npm run preview   # cek hasil build
npm run format    # rapikan kode dengan Prettier
```

Membutuhkan Node.js 22.23 atau lebih baru.

## Struktur folder

```
├── .github/workflows/deploy.yml   # Deploy otomatis ke GitHub Pages
├── public/
│   ├── images/                    # brand, showcase, portfolio, before-after, team
│   └── models/                    # product.glb untuk viewer 3D
└── src/
    ├── components/
    │   ├── layout/                # Header, Footer, tombol WhatsApp melayang
    │   ├── sections/              # Setiap section halaman (Hero, Manifesto, Pricing, ...)
    │   └── ui/                    # Komponen kecil yang dipakai ulang (Button, Sticker, Blob, ...)
    ├── data/                      # SEMUA konten teks: kontak, harga, FAQ, portofolio, tim
    ├── layouts/BaseLayout.astro   # <head>, SEO, Open Graph, lapisan world (latar & kanvas 3D)
    ├── pages/                     # index (beranda) & 404
    ├── scripts/
    │   ├── animations/            # Smooth scroll & efek parallax/scroll
    │   ├── three/                 # World canvas (logo & kubus mengalir) + viewer produk
    │   └── utils/                 # Helper WhatsApp, motion, path aset
    └── styles/global.css          # Design token (warna, font) & utilitas
```

## Mengubah konten

Hampir semua isi website ada di `src/data/`:

- `site.ts` – nama brand, nomor WhatsApp, Instagram, menu
- `services.ts` – alur konsep, 3 sudut render, keunggulan, paket & harga
- `portfolio.ts` – daftar portofolio & gambar before/after
- `faq.ts` – pertanyaan umum
- `team.ts` – anggota tim

Gambar yang belum diisi otomatis tampil sebagai placeholder "Render segera hadir".
Panduan menaruh gambar ada di [`public/images/README.md`](public/images/README.md)
dan model 3D di [`public/models/README.md`](public/models/README.md).

## Deploy ke GitHub Pages

Setiap push ke branch `main` otomatis di-build dan dipublikasikan oleh GitHub Actions
(`.github/workflows/deploy.yml`). Pastikan **Settings → Pages → Source** bernilai
**GitHub Actions**.

URL & base path diatur otomatis oleh workflow. Jika nanti memakai domain sendiri
(mis. `jastif.id`), atur di Settings → Pages → Custom domain.

## Aksesibilitas & performa

- Animasi otomatis dimatikan untuk pengguna dengan pengaturan _reduce motion_
  (section sticky tampil sebagai section biasa).
- Three.js dimuat terpisah setelah halaman tampil (tidak memperlambat loading awal).
- Render 3D berhenti otomatis saat kanvas tidak terlihat di layar.
