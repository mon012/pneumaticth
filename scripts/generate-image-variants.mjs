/**
 * Generate width variants for the images that ship without a srcset.
 *
 * The legacy WordPress export left most photos at a single large width — the
 * product galleries render 1024px files into ~286px grid cells, and the article
 * cards render 750px files into ~370px cells. This script emits smaller
 * re-encodes next to each original and records them in src/data/image-variants.json,
 * which src/lib/content.js reads at build time to attach srcset/sizes.
 *
 * Originals are never touched: variants are new "<name>-<width>w.webp" files.
 * Re-running is cheap — an existing variant newer than its original is skipped.
 *
 *   node scripts/generate-image-variants.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const publicDir = path.join(root, 'public');
const manifestFile = path.join(root, 'src/data/image-variants.json');

// A dense ladder matters more than a short one: a 2x phone asking for 678px
// against a sparse [400,640,1024] ladder jumps straight to the 1024 original.
// The 720 step exists for exactly that request against the 768px-wide article
// photos, which would otherwise fall back to the full-size file.
const WIDTHS = [320, 480, 640, 720, 800, 1024, 1280];
/** Below this width an image already fits its largest slot; leave it alone. */
const MIN_SOURCE_WIDTH = 500;
/** Skip a variant that would save little over the original. */
const MIN_SHRINK = 0.95;

/** Every <img src> in the site content that has no srcset of its own. */
function referencedSources() {
  const sources = new Set();
  const files = [
    path.join(root, 'src/data/pages.json'),
    ...fs.readdirSync(path.join(root, 'src/pages')).map((f) => path.join(root, 'src/pages', f)),
  ];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/<img\b[^>]*?>/gi)) {
      const tag = match[0].replaceAll('\\"', '"');
      if (/\ssrcset=/i.test(tag)) continue;
      const src = tag.match(/\ssrc="([^"]+)"/i)?.[1];
      if (src?.startsWith('/')) sources.add(src);
    }
  }
  return [...sources].sort();
}

const manifest = {};
let created = 0;
let skipped = 0;
let oversized = 0;

for (const src of referencedSources()) {
  const file = path.join(publicDir, decodeURIComponent(src));
  if (!fs.existsSync(file)) {
    console.warn(`!! missing ${src}`);
    continue;
  }
  const { width, height } = await sharp(file).metadata();
  if (width < MIN_SOURCE_WIDTH) continue;

  const sourceBytes = fs.statSync(file).size;
  const variants = [];
  for (const target of WIDTHS) {
    if (target > width * MIN_SHRINK) continue;
    const out = src.replace(/\.(webp|jpe?g|png)$/i, `-${target}w.webp`);
    const outFile = path.join(publicDir, decodeURIComponent(out));
    const fresh = fs.existsSync(outFile) && fs.statSync(outFile).mtimeMs >= fs.statSync(file).mtimeMs;
    if (fresh) {
      // A stale run may have kept a variant that is not worth serving.
      if (fs.statSync(outFile).size >= sourceBytes) {
        fs.unlinkSync(outFile);
        oversized += 1;
        continue;
      }
      skipped += 1;
    } else {
      const buf = await sharp(file).resize({ width: target }).webp({ quality: 78 }).toBuffer();
      // Re-encoding a detailed photo can cost more bits than the original even
      // at a smaller width. Such a variant is never the right thing to serve.
      if (buf.length >= sourceBytes) {
        oversized += 1;
        continue;
      }
      fs.writeFileSync(outFile, buf);
      created += 1;
    }
    variants.push({ url: out, width: target });
  }
  if (!variants.length) continue;

  variants.push({ url: src, width });
  manifest[src] = { width, height, variants };
}

fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `${Object.keys(manifest).length} images, ${created} variants written, ` +
    `${skipped} already current, ${oversized} dropped as no smaller than the original`,
);
