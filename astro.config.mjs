// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://andreadellacorte.github.io',
  base: '/math-for-kids',
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: false, // Disable minification for easier debugging
      sourcemap: true
    }
  }
});