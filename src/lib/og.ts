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

/** JPEG (≈150 KB instead of ≈1 MB PNG) — share previews load fast in LINE / Facebook. */
export async function renderOg(a: Article): Promise<Buffer> {
  const name = a.restaurant?.name ?? a.title;
  const nameSize = name.length > 24 ? 54 : name.length > 15 ? 64 : 76;
  const nameLines = wrap(name, nameSize, 660, 2);
  const tagLines = a.tagline ? wrap(a.tagline, 30, 660, 2) : [];
  const meta = [a.city?.nameEn, a.restaurant?.cuisine, a.visit ? `Visit ${visitLabel(a)}` : undefined].filter(Boolean).join('  ·  ');
  const cover = await coverData(a);
  let y = 270 + nameSize * 0.95; // first name line sits clear of the "Tasting Notes" line
  const nameSvg = nameLines.map((l, i) => `<text x="64" y="${(y += i ? nameSize * 1.15 : 0)}" font-family="Noto Serif Thai" font-weight="600" font-size="${nameSize}" fill="#ffffff">${esc(l)}</text>`).join('');
  y += 30;
  const tagSvg = tagLines.map((l) => `<text x="64" y="${(y += 44)}" font-family="Noto Serif Thai" font-size="30" fill="#fdeac0">${esc(l)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#052a2d" stop-opacity=".96"/><stop offset=".5" stop-color="#073b3e" stop-opacity=".72"/><stop offset="1" stop-color="#073b3e" stop-opacity=".12"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c39e5c"/><stop offset=".5" stop-color="#fdeac0"/><stop offset="1" stop-color="#c39e5c"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0b5357"/>
  ${cover ? `<image href="${cover}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>` : ''}
  <rect width="1200" height="630" fill="url(#fade)"/>
  <rect x="24" y="24" width="1152" height="582" rx="22" fill="none" stroke="#d4b372" stroke-opacity=".75" stroke-width="2"/>
  <image href="${LOGO}" x="58" y="52" width="168" height="150"/>
  <text x="64" y="244" font-family="Cormorant Garamond Medium" font-style="italic" font-size="34" fill="#fdeac0" letter-spacing="1">Tasting Notes  No. ${String(a.no).padStart(3, '0')}</text>
  <rect x="64" y="258" width="72" height="2" fill="url(#gold)"/>
  ${nameSvg}
  ${tagSvg}
  ${meta ? `<text x="64" y="566" font-family="Noto Serif Thai" font-size="24" fill="#ffffff" fill-opacity=".92">${esc(meta)}</text>` : ''}
  <text x="1136" y="566" text-anchor="end" font-family="Cormorant Garamond Medium" font-style="italic" font-size="28" fill="#fdeac0">eatlikeboss.com</text>
</svg>`;
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Noto Serif Thai' } }).render().asPng();
  return sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}
