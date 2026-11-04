import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://eatlikeboss.com',
  trailingSlash: 'always',
  output: 'static',
  // The one stylesheet is ~8 KB gzipped: inline it so phones don't wait for a separate render-blocking request.
  build: { inlineStylesheets: 'always' },
  // resvg (share images, src/lib/og.ts) is a native module: load it from node_modules, don't bundle it.
  vite: { ssr: { external: ['@resvg/resvg-js', 'sharp'] } },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'th', locales: { th: 'th', en: 'en', ja: 'ja', zh: 'zh-Hans' } },
    }),
  ],
});
