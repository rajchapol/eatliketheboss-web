import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://eatlikeboss.com',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'th', locales: { th: 'th', en: 'en', ja: 'ja', zh: 'zh-Hans' } },
    }),
  ],
});
