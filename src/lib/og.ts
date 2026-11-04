// Branded share image (1200×630) for each article, made at build time: the cover photo, a teal fade,
// the gold logo, "Tasting Notes No.", the restaurant name, tagline, city · cuisine · visit, and the site address.
// Drawn as SVG and rendered with resvg (HarfBuzz shaping, so Thai vowels and tone marks sit correctly).
// Fonts: src/og/fonts (SIL OFL). Used by src/pages/og/[...slug].jpg.ts.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import type { Article } from './types';
import { imgUrl, visitLabel } from './content';

const ROOT = process.cwd();
const FONTS = ['NotoSerifThai-Regular.ttf', 'NotoSerifThai-SemiBold.ttf', 'CormorantGaramond-MediumItalic.ttf'].map((f) => join(ROOT, 'src/og/fonts', f));
const LOGO = `data:image/png;base64,${readFileSync(join(ROOT, 'public/img/logo-gold.png')).toString('base64')}`;

// SARA AM (ำ) mis-positions with this font in resvg: write it as NIKHAHIT + (tone mark) + SARA AA, which looks the same.
const thaiFix = (s: string) => s.replace(/([\u0E48-\u0E4B]?)\u0E33/g, '\u0E4D$1\u0E32');
const esc = (s: string) => thaiFix(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Thai vowels/tone marks that sit above or below a letter take no width.
const ZERO = /[ัิ-ฺ็-๎]/;
const width = (s: string, size: number) => [...s].reduce((w, ch) => w + (ZERO.test(ch) ? 0 : /[A-Z]/.test(ch) ? 0.66 : /[฀-๿]/.test(ch) ? 0.58 : 0.52), 0) * size;

/** Break text into at most `max` lines that fit `maxW` px (spaces first; Thai without spaces breaks between letters). */
function wrap(text: string, size: number, maxW: number, max: number) {
  const tokens = text.split(/(\s+)/).flatMap((t) => (width(t, size) > maxW ? [...t] : [t]));
  const lines: string[] = [''];
  for (const t of tokens) {
    const cur = lines[lines.length - 1];
    if (width(cur + t, size) <= maxW || !cur.trim() || ZERO.test(t)) lines[lines.length - 1] = cur + t;
    else lines.push(t.trimStart());
  }
  const out = lines.map((l) => l.trim()).filter(Boolean);
  if (out.length > max) { out.length = max; out[max - 1] = out[max - 1].replace(/\s*\S{0,3}$/, '') + '…'; }
  return out;
}

async function coverData(a: Article) {
  const url = a.cover ? imgUrl(a.cover, 1200, 630) : undefined;
  if (!url) return undefined;
  try {
    if (url.startsWith('/')) return `data:image/jpeg;base64,${readFileSync(join(ROOT, 'public', url)).toString('base64')}`; // local preview images
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'fm=jpg');
    if (!res.ok) return undefined;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch { return undefined; }
}

/**
 * Crop-safe layout: LINE (and some chat apps) show the preview as a square cut from the middle,
 * so the logo and every line of text sit centred inside the middle 560px. The photo keeps its real colours;
 * only the top (behind the logo) and the bottom (behind the text) are darkened.
 * JPEG (≈100 KB instead of ≈1 MB PNG) — share previews load fast in LINE / Facebook.
 */
// The share-image fonts have no Chinese/Japanese/Korean glyphs (a CJK font would add ~10 MB), so those
// characters are left out of the image ("Taian Table 泰安门" → "Taian Table"); the page title keeps them.
const noCjk = (s: string) => s.replace(/[\u2E80-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]+/g, ' ').replace(/[(（]\s*[)）]/g, '').replace(/\s+/g, ' ').trim();

/** Two lines of similar length read better than a long line and a short one ("Meet The Bund / at Skyline"). */
function balance(lines: string[], size: number, maxW: number) {
  if (lines.length !== 2 || lines[1].endsWith('…')) return lines;
  const words = lines.join(' ').split(' ');
  let best = lines, diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const l = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
    const w = l.map((x) => width(x, size));
    if (Math.max(...w) <= maxW && Math.abs(w[0] - w[1]) < diff) { best = l; diff = Math.abs(w[0] - w[1]); }
  }
  return best;
}

export async function renderOg(a: Article): Promise<Buffer> {
  const name = noCjk(a.restaurant?.name ?? a.title) || noCjk(a.title);
  const nameSize = name.length > 26 ? 44 : name.length > 16 ? 52 : 62;
  const nameLines = balance(wrap(name, nameSize, 560, 2), nameSize, 560);
  const meta = noCjk([a.city?.nameEn, a.restaurant?.cuisine].filter(Boolean).join('  ·  ')).replace(/ · /g, '  ·  ');
  const cover = await coverData(a);
  // Bottom-up: meta, name lines, then the "Tasting Notes" line with a short gold rule.
  const metaY = 586;
  let y = metaY - 44;
  const nameSvg = nameLines.map((l, i, all) => `<text x="600" y="${y - (all.length - 1 - i) * nameSize * 1.12}" text-anchor="middle" font-family="Noto Serif Thai" font-weight="600" font-size="${nameSize}" fill="#ffffff">${esc(l)}</text>`).join('');
  y -= (nameLines.length - 1) * nameSize * 1.12 + nameSize + 26;
  const noLabel = a.series === 'review' || !a.series ? `Tasting Notes  No. ${String(a.no).padStart(3, '0')}` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#03211f" stop-opacity="0"/><stop offset=".38" stop-color="#03211f" stop-opacity="0"/>
      <stop offset=".68" stop-color="#03211f" stop-opacity=".62"/><stop offset="1" stop-color="#03211f" stop-opacity=".9"/>
    </linearGradient>
    <radialGradient id="top" cx="600" cy="70" r="300" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 70) scale(1 .62) translate(0 -70)">
      <stop offset="0" stop-color="#03211f" stop-opacity=".72"/><stop offset="1" stop-color="#03211f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c39e5c" stop-opacity="0"/><stop offset=".5" stop-color="#fdeac0"/><stop offset="1" stop-color="#c39e5c" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0b5357"/>
  ${cover ? `<image href="${cover}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>` : ''}
  <rect width="1200" height="630" fill="url(#bottom)"/>
  <rect width="1200" height="630" fill="url(#top)"/>
  <image href="${LOGO}" x="${600 - 78}" y="22" width="156" height="139"/>
  ${noLabel ? `<text x="600" y="${y}" text-anchor="middle" font-family="Cormorant Garamond Medium" font-style="italic" font-size="30" fill="#fdeac0" letter-spacing="1">${noLabel}</text>
  <rect x="540" y="${y + 14}" width="120" height="1.5" fill="url(#gold)"/>` : ''}
  ${nameSvg}
  ${meta ? `<text x="600" y="${metaY}" text-anchor="middle" font-family="Noto Serif Thai" font-size="23" fill="#ffffff" fill-opacity=".9" letter-spacing=".5">${esc(meta)}</text>` : ''}
</svg>`;
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Noto Serif Thai' } }).render().asPng();
  return sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}
