# Folder Gambar

Simpan hasil render di folder berikut, lalu daftarkan path-nya di file data (`src/data/`).
Gunakan format **.webp** (lebih ringan), lebar maksimal ±1600 px.

| Folder          | Isi                                 | Daftarkan di                                  |
| --------------- | ----------------------------------- | --------------------------------------------- |
| `brand/`        | Logo (sudah terisi)                 | -                                             |
| `showcase/`     | 3 render: front, perspective, promo | `src/data/services.ts` → `angles[].image`     |
| `portfolio/`    | Karya portofolio, rasio 4:5         | `src/data/portfolio.ts` → `portfolio[].image` |
| `before-after/` | Foto asli HP + hasil render (4:5)   | `src/data/portfolio.ts` → `beforeAfter`       |
| `team/`         | Foto anggota tim, rasio 1:1         | `src/data/team.ts` → `team[].photo`           |
| `gallery/`      | Tile bola galeri 3D, rasio ±16:10   | `src/data/gallery.ts` → `galleryImages`       |

Contoh: file `public/images/showcase/front.webp` → isi `image: 'images/showcase/front.webp'`.
