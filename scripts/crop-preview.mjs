// Contact sheet of every photo in a post file, as the site will show it (3:2, with focus= / zoom=).
//   npm run crop-preview -- posts/<slug>.md      → posts/_preview/<slug>.jpg
// Left: the whole photo with the 3:2 window drawn on it. Right: what the site shows. Red label = photo too small.
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import sharp from 'sharp';
import { parse as parseYaml } from 'yaml';
import { parseImageSpec, siteWindow } from './image-spec.mjs';

const file = process.argv[2];
if (!file) { console.error('ใช้: npm run crop-preview -- posts/<slug>.md'); process.exit(1); }
const text = readFileSync(file, 'utf8'), base = dirname(resolve(file));
const fm = parseYaml(text.split(/^---$/m)[1] || '') || {};

const specs = [];
if (fm.cover) specs.push(['cover', fm.cover]);
for (const g of fm.gallery || []) specs.push(['gallery', g]);
for (const m of text.matchAll(/^\s*image:\s*(.+)$/gm)) specs.push(['dish', m[1].replace(/^["']|["']$/g, '')]);

const W = 420, H = 280, PAD = 16, LABEL = 34;
const tiles = [];
for (const [kind, raw] of specs) {
  const { path, focus, zoom } = parseImageSpec(raw);
  if (!path || path.startsWith('http')) continue;
  const src = sharp(resolve(base, path)).rotate();
  const { width: w, height: h } = await src.clone().metadata().then(async (m) => (m.orientation >= 5 ? { width: m.height, height: m.width } : m));
  const win = siteWindow(w, h, focus, zoom);
  const s = Math.min(W / w, H / h), tw = Math.round(w * s), th = Math.round(h * s);
  const small1 = await src.clone().resize(tw, th).toBuffer();
  const r = { left: Math.round(win.left * s), top: Math.round(win.top * s) };
  r.width = Math.max(1, Math.min(tw - r.left, Math.round(win.width * s))); r.height = Math.max(1, Math.min(th - r.top, Math.round(win.height * s)));
  const shade = Buffer.from(`<svg width="${tw}" height="${th}"><rect width="${tw}" height="${th}" fill="black" fill-opacity=".55"/></svg>`);
  const frame = Buffer.from(`<svg width="${tw}" height="${th}"><rect x="${r.left + 1.5}" y="${r.top + 1.5}" width="${r.width - 3}" height="${r.height - 3}" fill="none" stroke="#ffd34d" stroke-width="3"/></svg>`);
  const dimmed = await sharp(small1).composite([{ input: shade }, { input: await sharp(small1).extract(r).toBuffer(), left: r.left, top: r.top }, { input: frame }]).png().toBuffer();
  const shown = await src.clone().extract(win).resize(W, H).toBuffer();
  const small = Math.max(w, h) < 1600;
  const label = `${kind} · ${basename(path)} · ${w}×${h}${focus ? ` · focus=${focus.join(',')}` : ''}${zoom ? ` · zoom=${zoom}` : ''}${small ? ' · TOO SMALL' : ''}`;
  tiles.push({ dimmed, tw, th, shown, label, small });
}
if (!tiles.length) { console.error('ไม่เจอรูปในไฟล์ (local paths only)'); process.exit(1); }

const rowH = H + LABEL + PAD, sheetW = PAD * 3 + W * 2, sheetH = PAD + tiles.length * rowH;
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const comps = tiles.flatMap((t, i) => {
  const y = PAD + i * rowH;
  return [
    { input: Buffer.from(`<svg width="${sheetW}" height="${LABEL}"><text x="${PAD}" y="22" font-family="sans-serif" font-size="16" fill="${t.small ? '#ff6b6b' : '#eee'}">${esc(t.label)}</text></svg>`), left: 0, top: y },
    { input: t.dimmed, left: PAD + Math.round((W - t.tw) / 2), top: y + LABEL + Math.round((H - t.th) / 2) },
    { input: t.shown, left: PAD * 2 + W, top: y + LABEL },
  ];
});
const out = resolve('posts/_preview', `${basename(file, '.md')}.jpg`);
mkdirSync(dirname(out), { recursive: true });
await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#1c1c1c' } }).composite(comps).jpeg({ quality: 82 }).toFile(out);
console.log(`✓ ${out} — ${tiles.length} รูป · ซ้าย = รูปเต็ม (กรอบเหลือง = ส่วนที่เว็บโชว์) · ขวา = ที่เว็บโชว์ 3:2${tiles.some((t) => t.small) ? ` · ⚠︎ ${tiles.filter((t) => t.small).length} รูปเล็กไป` : ''}`);
