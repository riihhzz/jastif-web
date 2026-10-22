export interface Member {
  name: string;
  role: string;
  /** Path di /public, mis. 'images/team/abdullah.webp'. Kosongkan untuk inisial. */
  photo?: string;
}

export const team: Member[] = [
  { name: 'Abdullah Al Mujahid', role: 'Ketua · 3D & Dokumentasi' },
  {
    name: 'Farih Maulana',
    role: 'Produksi Visual & Konten',
    photo: 'images/team/farih-maulana.webp',
  },
  { name: 'Hafizh Khairuddin', role: '3D Production & Quality Check' },
  { name: "Wafiq Nu'man Jadid", role: 'Marketing & Administrasi' },
];
