export type Category = 'Minuman' | 'Makanan' | 'Skincare' | 'Retail';

export interface PortfolioItem {
  title: string;
  category: Category;
  /** Path di /public, mis. 'images/portfolio/segarku-front.webp'. Kosongkan bila belum ada. */
  image?: string;
}

export const categories: Category[] = ['Minuman', 'Makanan', 'Skincare', 'Retail'];

// Ganti / tambah item setelah render siap. Item tanpa `image` tampil sebagai placeholder.
export const portfolio: PortfolioItem[] = [
  { title: 'SegarKu — Front View', category: 'Minuman' },
  { title: 'SegarKu — Perspective', category: 'Minuman' },
  { title: 'SegarKu — Splash Promo', category: 'Minuman' },
  { title: 'Keripik Kemasan', category: 'Makanan' },
  { title: 'Serum Botol Kaca', category: 'Skincare' },
  { title: 'Headphone Wireless', category: 'Retail' },
];

export interface BeforeAfter {
  title: string;
  before?: string;
  after?: string;
}

export const beforeAfter: BeforeAfter = {
  title: 'SegarKu 250 ml',
};
