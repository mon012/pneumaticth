import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pneumaticth.com',
  // /uncategorized/, /category/uncategorized/ and /บทความ/ are 301'd by
  // public/_redirects (Cloudflare Pages), so they are no longer built as pages.
  // /engineer/, /uncategorized/, /category/uncategorized/, /บทความ/, /gefran/ and
  // the /tag/ archives are 301'd by public/_redirects, so they are not built.
  integrations: [sitemap({
    filter: (page) => page !== 'https://pneumaticth.com/404/',
  })],
  build: { format: 'directory' },
});
