/**
 * Build-time helpers for the legacy WordPress HTML stored in src/data/pages.json.
 *
 * Everything here runs at build time only — no client JS is added by these
 * helpers, and the resulting markup is styled by the SAME CSS rules as before
 * so the visual design is unchanged.
 */

/**
 * String/regex replace that FAILS THE BUILD when the pattern is not found.
 *
 * The legacy pages are transformed by matching exact HTML fragments. Without
 * this guard a change in the source content makes a replace silently no-op and
 * ships a broken page with no error.
 */
export function mustReplace(html, pattern, replacement, label) {
  const before = html;
  const out = html.replace(pattern, replacement);
  if (out === before) {
    throw new Error(
      `[content] replace "${label}" matched nothing. ` +
        `The source HTML in pages.json changed — update the pattern in the page that owns it.`,
    );
  }
  return out;
}

/** Same as mustReplace but for replaceAll of a plain string. */
export function mustReplaceAll(html, search, replacement, label) {
  if (!html.includes(search)) {
    throw new Error(`[content] replaceAll "${label}" matched nothing.`);
  }
  return html.replaceAll(search, replacement);
}

const YOUTUBE_IFRAME = /<iframe\b[^>]*\bsrc="https:\/\/www\.youtube\.com\/embed\/([\w-]+)[^"]*"[^>]*><\/iframe>/g;

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? '';
const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Replace YouTube <iframe> embeds with a lightweight facade.
 *
 * A YouTube embed costs ~1 MB of JS/CSS per video on page load even when the
 * visitor never presses play (the plc-type page ships four of them). The facade
 * renders the same poster frame + play button and swaps in the real iframe on
 * click, so nothing is downloaded from YouTube until the visitor asks for it.
 *
 * The facade keeps the iframe's width/height/title and is styled to match
 * `.legacy-content iframe` exactly, so layout and appearance are unchanged.
 */
export function youtubeFacade(html) {
  return html.replace(YOUTUBE_IFRAME, (tag, id) => {
    const title = attr(tag, 'title');
    const width = attr(tag, 'width') || '750';
    const height = attr(tag, 'height') || '422';
    return (
      `<div class="yt-facade" data-yt-id="${id}" data-yt-title="${escape(title)}">` +
      `<button type="button" class="yt-facade__button" aria-label="เล่นวิดีโอ: ${escape(title)}">` +
      `<img class="yt-facade__poster" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" ` +
      `width="${width}" height="${height}" loading="lazy" decoding="async">` +
      `<span class="yt-facade__play" aria-hidden="true"></span>` +
      `</button></div>`
    );
  });
}

/** True when the page contains at least one YouTube facade. */
export const hasYoutube = (html) => html.includes('class="yt-facade"');

/* -------------------------------------------------------------------------
 * Responsive images
 *
 * scripts/generate-image-variants.mjs writes width variants next to each
 * original and records them in src/data/image-variants.json. This attaches the
 * srcset, and a `sizes` that matches the slot the image actually renders into —
 * the legacy `sizes` claimed 100vw for grid cells barely a quarter that wide,
 * so browsers downloaded the largest candidate every time.
 *
 * Widths below are derived from src/styles/global.css: --container is 1180px,
 * page gutters are 24px (18px under 860px), so 1227px is the viewport at which
 * the container stops growing.
 * ---------------------------------------------------------------------- */

/**
 * Layout section -> the `sizes` its images render at. `first` covers galleries
 * whose opening tile spans two columns and two rows.
 */
const SIZE_RULES = {
  // 4-column proof gallery on the product pages.
  'product-proof': {
    first: '(max-width:860px) calc(100vw - 36px), (max-width:1227px) calc(50vw - 30px), 584px',
    rest: '(max-width:560px) calc(100vw - 36px), (max-width:860px) calc(50vw - 24px), (max-width:1227px) calc(25vw - 21px), 286px',
  },
  // 2-column gallery in the about page main column, which shares the row with
  // the contact card — so each tile is a quarter of the container, not a half.
  'about-gallery': {
    first: '(max-width:560px) calc(100vw - 36px), (max-width:1227px) calc(50vw - 8px), 580px',
    rest: '(max-width:560px) calc(100vw - 36px), (max-width:1227px) calc(25vw - 10px), 284px',
  },
  // 3-column related-posts grid at the foot of every article.
  'article-related': {
    rest: '(max-width:760px) calc(100vw - 36px), (max-width:1227px) calc(33.3vw - 30px), 377px',
  },
  // 2-column card grid on /blog/.
  'blog-grid': {
    rest: '(max-width:720px) calc(100vw - 36px), (max-width:1227px) calc(50vw - 36px), 548px',
  },
  // Article prose column: min(860px,100%) minus 24px gutters.
  'article-body': {
    rest: '(max-width:760px) calc(100vw - 36px), (max-width:907px) calc(100vw - 48px), 812px',
    // ...and the 2-column gallery nested inside it.
    gallery: '(max-width:760px) calc(100vw - 36px), (max-width:907px) calc(50vw - 30px), 400px',
  },
  // Brand logo strip above the product lead.
  'product-brands': { rest: '(max-width:560px) calc(100vw - 36px), 500px' },
  // Full-bleed hero images.
  'page-banner': { rest: '100vw', heroOnly: true },
  'article-hero': { rest: '100vw', heroOnly: true },
  // Trust badges under the about lead; they render at a fixed small size.
  'about-verification-links': { rest: '64px' },
};
const SECTION_MARKERS = Object.keys(SIZE_RULES);

/** Which SIZE_RULES section an <img> at `index` sits in, or null if none. */
function sectionAt(html, index) {
  let best = null;
  let bestAt = -1;
  for (const marker of SECTION_MARKERS) {
    const at = html.lastIndexOf(marker, index);
    if (at > bestAt) {
      bestAt = at;
      best = marker;
    }
  }
  return best ? { name: best, at: bestAt } : null;
}

export function responsiveImages(html, manifest) {
  const seen = new Map();
  return html.replace(/<img\b[^>]*>/gi, (tag, index) => {
    const section = sectionAt(html, index);
    if (!section) return tag;
    const rules = SIZE_RULES[section.name];

    // Count every image in the section, including ones skipped below, so the
    // "first tile spans two columns" rule tracks the real DOM order.
    const nth = (seen.get(section.at) ?? 0) + 1;
    seen.set(section.at, nth);

    if (/\ssrcset=/i.test(tag)) return tag; // already responsive
    // A hero section also contains small inline images (trust badges, icons);
    // only the post thumbnail itself is actually full-bleed.
    if (rules.heroOnly && !/\bwp-post-image\b/.test(tag)) return tag;
    const entry = manifest[attr(tag, 'src')];
    if (!entry) return tag;

    const inGallery = rules.gallery && html.lastIndexOf('wp-block-gallery', index) > section.at;
    const sizes = inGallery ? rules.gallery : nth === 1 && rules.first ? rules.first : rules.rest;

    const srcset = entry.variants.map((v) => `${v.url} ${v.width}w`).join(', ');
    return tag
      .replace(/\ssizes="[^"]*"/i, '')
      .replace(/>$/, ` srcset="${srcset}" sizes="${sizes}">`);
  });
}

/* -------------------------------------------------------------------------
 * Breadcrumbs
 *
 * One trail definition feeds both the BreadcrumbList JSON-LD in BaseLayout and
 * the visible <nav> injected into the page, so the two can never disagree.
 * ---------------------------------------------------------------------- */

/** Routes that live under /blog/ and therefore get a three-level trail. */
const BLOG_ARTICLES = new Set([
  'aftercoolers-factory',
  'air-compressor',
  'hydraulic-cylinder-overhaul',
  'plc-type',
  'purchasing-department-tips',
]);

/** Routes with no breadcrumb: the home page is the root, 404 is not a place. */
const NO_BREADCRUMB = new Set(['', '404']);

/**
 * Build the breadcrumb trail for a route.
 *
 * The last crumb uses the page title with the " | Pneumatic Dotcom" brand
 * suffix stripped — the brand is already the first crumb's site, and Google
 * shows the raw crumb names in the search result.
 */
export function breadcrumbTrail(route, title) {
  if (NO_BREADCRUMB.has(route)) return [];
  const trail = [{ name: 'หน้าแรก', url: '/' }];
  if (BLOG_ARTICLES.has(route)) trail.push({ name: 'บทความ', url: '/blog/' });
  trail.push({ name: title.split(' | ')[0].trim(), url: `/${route}/` });
  return trail;
}

/** Render the visible breadcrumb nav. Returns '' for an empty trail. */
export function breadcrumbHtml(trail) {
  if (!trail.length) return '';
  const items = trail
    .map((crumb, i) =>
      i === trail.length - 1
        ? `<li><span aria-current="page">${escape(crumb.name)}</span></li>`
        : `<li><a href="${crumb.url}">${escape(crumb.name)}</a></li>`,
    )
    .join('');
  return `<nav class="breadcrumb" aria-label="เส้นทางนำทาง"><ol>${items}</ol></nav>`;
}

/**
 * Insert the breadcrumb nav between the page hero and the page body.
 *
 * Every non-home page opens its body with one of these two wrappers right after
 * the hero <header>, so this lands the nav below the hero image on every
 * template without needing per-page patterns.
 */
const CONTENT_WRAPPER = /<div class="(?:page-content|single-content)[^"]*">/;

export function withBreadcrumb(html, trail) {
  const nav = breadcrumbHtml(trail);
  if (!nav) return html;
  return mustReplace(html, CONTENT_WRAPPER, (match) => `${nav}${match}`, 'breadcrumb insertion point');
}
