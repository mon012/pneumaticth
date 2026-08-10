import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pneumaticth.com',
  integrations: [sitemap({
    filter: (page) => ![
      'https://pneumaticth.com/category/uncategorized/',
      'https://pneumaticth.com/uncategorized/',
      'https://pneumaticth.com/%E0%B8%9A%E0%B8%97%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1/',
      'https://pneumaticth.com/tag/air-compressor/',
      'https://pneumaticth.com/tag/plc/',
      'https://pneumaticth.com/404/',
    ].includes(page),
  })],
  build: { format: 'directory' },
});
