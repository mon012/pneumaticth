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
