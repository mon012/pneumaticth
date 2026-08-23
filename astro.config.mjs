import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = 'https://pneumaticth.com';

// `lastmod` lives next to the content it describes, in src/data/pages.json.
// Bump a page's `lastmod` whenever you edit its copy so crawlers see the change;
// leaving it stale is better than emitting the build date, which would mark
// every page as freshly changed on every deploy and be ignored as noise.
const pages = JSON.parse(fs.readFileSync(new URL('./src/data/pages.json', import.meta.url), 'utf8'));
const lastmodByUrl = new Map(
  pages.filter((page) => page.lastmod).map((page) => [`${site}/${page.route ? `${page.route}/` : ''}`, page.lastmod]),
);
// industrial-products is built by its own route file from the pneumatic
// template, so it is not in pages.json and needs its date named here.
lastmodByUrl.set(`${site}/industrial-products/`, '2026-08-23');
// engineer-unit-converter is authored directly as a route file rather than
// migrated WordPress HTML, so its date lives here for the same reason.
lastmodByUrl.set(`${site}/engineer-unit-converter/`, '2026-08-23');

export default defineConfig({
  site,
  // /uncategorized/, /category/uncategorized/ and /บทความ/ are 301'd by
  // public/_redirects (Cloudflare Pages), so they are no longer built as pages.
  // /engineer/, /uncategorized/, /category/uncategorized/, /บทความ/, /gefran/ and
  // the /tag/ archives are 301'd by public/_redirects, so they are not built.
  integrations: [sitemap({
    filter: (page) => page !== `${site}/404/`,
    serialize(item) {
      const lastmod = lastmodByUrl.get(item.url);
      if (!lastmod) throw new Error(`[sitemap] no lastmod for ${item.url} — add one in src/data/pages.json`);
      return { ...item, lastmod };
    },
  })],
  build: { format: 'directory' },
});
