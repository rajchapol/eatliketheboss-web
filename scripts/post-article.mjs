#!/usr/bin/env node
// Post (or update) one article from a Markdown file into Sanity.
//   npm run post -- posts/sezanne.md          → upload images + create/replace the article
//   npm run post -- posts/sezanne.md --dry    → print the document only, send nothing
// Needs SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in .env (see .env.example).
// File format: see posts/_template.md
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { createClient } from '@sanity/client';
import { parse as parseYaml } from 'yaml';

const env = Object.fromEntries(
  existsSync('.env') ? readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]) : [],
);
const get = (k) => process.env[k] || env[k];
const [file, ...flags] = process.argv.slice(2);
const dry = flags.includes('--dry');
if (!file) { console.error('ใช้: npm run post -- posts/<slug>.md [--dry]'); process.exit(1); }

const src = readFileSync(file, 'utf8');
const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
if (!m) throw new Error('ไฟล์ต้องขึ้นต้นด้วย frontmatter --- ... ---');
const fm = parseYaml(m[1]);
const body = m[2];
const base = dirname(resolve(file));
const lang = fm.language || 'th';
const key = () => Math.random().toString(36).slice(2, 10);

// "## ศิลปะแห่งรสชาติในมื้อนี้" splits intro from dishes; each "### name" is one dish.
const [introMd, dishesMd = ''] = body.split(/^##\s+.*$/m);
const paragraphs = introMd.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const block = (text, style = 'normal') => ({ _type: 'block', _key: key(), style, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] });
const bodyBlocks = paragraphs.map((p) => (p.startsWith('> ') ? block(p.replace(/^>\s?/gm, ''), 'blockquote') : block(p)));

const dishes = dishesMd.split(/^###\s+/m).slice(1).map((chunk) => {
  const [head, ...rest] = chunk.split('\n');
  const glassesOff = /🕶️|\[glasses-off\]/.test(head);
  const name = head.replace(/🕶️|\[glasses-off\]/g, '').trim();
  let image;
  const lines = rest.filter((l) => {
    const im = l.match(/^image:\s*(.+?)\s*\|\s*(.+)$/);
    if (im) { image = { path: im[1], alt: im[2] }; return false; }
    return true;
  });
  return { name, glassesOff, image, description: lines.join('\n').trim() };
});

if (!dry && !get('SANITY_PROJECT_ID')) throw new Error('ไม่มี SANITY_PROJECT_ID ใน .env');
const client = dry ? null : createClient({ projectId: get('SANITY_PROJECT_ID'), dataset: get('SANITY_DATASET') || 'production', apiVersion: '2025-01-01', token: get('SANITY_WRITE_TOKEN'), useCdn: false });

async function upload(spec) {
  if (!spec) return undefined;
  const [p, alt] = typeof spec === 'string' ? spec.split('|').map((s) => s.trim()) : [spec.path, spec.alt];
  if (dry) return { _type: 'image', asset: { _ref: `(upload ${p})` }, alt };
  const buf = p.startsWith('http') ? Buffer.from(await (await fetch(p)).arrayBuffer()) : readFileSync(resolve(base, p));
  const asset = await client.assets.upload('image', buf, { filename: basename(p) });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt };
}

const cityRef = fm.city ? (dry ? { _ref: `(city ${fm.city})` } : await client.fetch('*[_type=="city" && slug.current==$s][0]{_id}', { s: fm.city }).then((c) => {
  if (!c) throw new Error(`ไม่พบเมือง "${fm.city}" ใน Sanity — สร้างเมืองก่อนใน Studio`); return { _type: 'reference', _ref: c._id };
})) : undefined;

const slug = fm.slug;
const id = `article-${slug}${lang === 'th' ? '' : `-${lang}`}`;
const doc = {
  _id: id, _type: 'article', language: lang,
  ...(lang !== 'th' ? { translationOf: { _type: 'reference', _ref: `article-${slug}` } } : {}),
  series: fm.series || 'review', episode: fm.episode, title: fm.title, slug: { _type: 'slug', current: slug },
  tagline: fm.tagline, city: cityRef, restaurant: fm.restaurant, cover: await upload(fm.cover),
  body: bodyBlocks, quote: fm.quote,
  dishes: await Promise.all(dishes.map(async (d) => ({ _type: 'dish', _key: key(), name: d.name, description: d.description, glassesOff: d.glassesOff, image: await upload(d.image) }))),
  tag: fm.tag || '', bill: fm.tag ? undefined : fm.bill, visit: fm.visit, hashtags: (fm.hashtags || []).map((h) => String(h).replace(/^#/, '')),
  publishedAt: String(fm.publishedAt || new Date().toISOString().slice(0, 10)), seoTitle: fm.seoTitle, seoDescription: fm.seoDescription,
};

if (doc.dishes.filter((d) => d.glassesOff).length > 2) throw new Error('ถอดแว่นชิมได้มากสุด 2 จาน');
if (dry) { console.log(JSON.stringify(doc, null, 2)); process.exit(0); }
if (!get('SANITY_WRITE_TOKEN')) throw new Error('ไม่มี SANITY_WRITE_TOKEN ใน .env');
await client.createOrReplace(doc);
console.log(`✓ โพสต์แล้ว: ${id} — เว็บจะอัปเดตเองภายในไม่กี่นาที (Cloudflare build)`);
