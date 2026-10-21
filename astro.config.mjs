// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: https://<username>.github.io/jastif-web/
// Isi SITE_URL & BASE_PATH lewat env (lihat .github/workflows/deploy.yml).
// Jika nanti memakai domain sendiri (mis. jastif.id), set BASE_PATH=/ .
const site = process.env.SITE_URL ?? 'https://example.github.io';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
