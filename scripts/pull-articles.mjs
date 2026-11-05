#!/usr/bin/env node
// Pull articles from Sanity back into posts/*.md so the files in the repo match what is live
// (the Boss edits in Studio; the files would otherwise drift). The reverse of post-article.mjs.
//   node scripts/pull-articles.mjs            → write posts/<slug>.md and posts/<slug>.<lang>.md for every published article
//   node scripts/pull-articles.mjs --check    → only list which files differ, write nothing
//   node scripts/pull-articles.mjs yong-fu    → one article (all its languages)
// Reads the public dataset (no token). Manual workflow: Actions → Pull articles from Sanity (opens a PR).
// A PR made by this script is marked [sanity-sync]; the post workflow skips it, so nothing is sent back to Sanity.
//
// Kept from the existing file when it has them: local image paths (matched by file name, as post-article uploads
// them with their file name), cityNew, the dishes heading. Anything the file format can't hold (links or headings
// inside the body) is reported and that article's body is left as it is in the file.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
import { createClient } from '@sanity/client';
import { parse as parseYaml, Document, isScalar, isSeq, visit } from 'yaml';

const args = process.argv.slice(2);
const check = args.includes('--check');
const only = args.find((a) => !a.startsWith('--'));
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', useCdn: false });

const IMG = '{alt, caption, "url": asset->url, "file": asset->originalFilename}';
const articles = await client.fetch(`*[_type == "article" && defined(slug.current) && !(_id in path("drafts.**"))]{
  _id, language, series, episode, title, "slug": slug.current, tagline, "city": city->slug.current,
  restaurant{..., "sameAs": sameAs->slug.current}, cover${IMG}, gallery[]${IMG}, body, quote,
  dishes[]{name, description, glassesOff, image${IMG}}, tag, bill, billBand, visit, hashtags, publishedAt, seoTitle, seoDescription
} | order(slug.current asc)`);

const DISH_HEADING = { th: '## ศิลปะแห่งรสชาติในมื้อนี้', en: '## The art of taste in this meal', ja: '## この食事の味わい', zh: '## 这一餐的味道艺术' };
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)));

// What the existing file already says (same rules as post-article.mjs).
function readExisting(path) {
  if (!existsSync(path)) return null;
  const src = readFileSync(path, 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const fm = parseYaml(m[1]) || {};
  const heading = (m[2].match(/^##\s+.*$/m) || [])[0];
  const [introMd] = m[2].split(/^##\s+.*$/m);
  const paths = new Map();
  const note = (p) => { if (p && !/^https?:/.test(p)) paths.set(basename(p), p); };
  const first = (s) => String(s || '').split('|')[0].trim();
  note(first(fm.cover));
  [].concat(fm.gallery || []).forEach((g) => note(first(g)));
  for (const im of m[2].matchAll(/^image:\s*(.+?)\s*\|/gm)) note(im[1]);
  return { src, fm, heading, intro: introMd.trim(), paths };
}

// Same look as the hand-written files: text in "quotes", short codes plain, lists on one line.
const PLAIN = new Set(['language', 'series', 'slug', 'city', 'visit', 'publishedAt', 'episode', 'region']);
function toYaml(obj) {
  const doc = new Document(obj);
  visit(doc, {
    Pair(_, pair) {
      const k = pair.key?.value;
      if (isScalar(pair.value) && typeof pair.value.value === 'string') pair.value.type = PLAIN.has(k) ? 'PLAIN' : 'QUOTE_DOUBLE';
      if (isSeq(pair.value) && ['hashtags', 'awards', 'aliases'].includes(k)) pair.value.flow = true;
    },
  });
  return doc.toString({ lineWidth: 0, flowCollectionPadding: false }).trimEnd();
}

const write = [];
const warn = [];
for (const a of articles) {
  if (only && a.slug !== only) continue;
  const lang = a.language || 'th';
  const path = `posts/${a.slug}${lang === 'th' ? '' : `.${lang}`}.md`;
  const old = readExisting(path);
  const where = (im) => (im?.file && old?.paths.get(im.file)) || im?.url; // keep the local file when it is the same photo
  const line = (im, extra = []) => (im?.url ? [where(im), im.alt || '', ...extra].join(' | ').replace(/\s\|\s$/, '') : undefined);

  // Body: plain paragraphs and "> " quotes are all the file format holds.
  const blocks = a.body || [];
  const lossy = blocks.some((b) => b._type !== 'block' || !['normal', 'blockquote'].includes(b.style || 'normal') || (b.markDefs || []).length || (b.children || []).some((c) => (c.marks || []).length));
  let intro = blocks.map((b) => {
    const t = (b.children || []).map((c) => c.text || '').join('');
    return b.style === 'blockquote' ? t.split('\n').map((l) => `> ${l}`).join('\n') : t;
  }).filter((t) => t.trim()).join('\n\n');
  if (lossy && old) { intro = old.intro; warn.push(`${path}: body has links / headings / formatting the file can't hold; kept the file's body`); }

  const r = a.restaurant ? clean({
    name: a.restaurant.name, originalName: a.restaurant.originalName, chef: a.restaurant.chef, area: a.restaurant.area,
    cuisine: a.restaurant.cuisine, awards: a.restaurant.awards, aliases: a.restaurant.aliases, sameAs: a.restaurant.sameAs,
  }) : undefined;
  const fm = clean({
    language: lang, series: a.series, episode: a.episode, title: a.title, slug: a.slug, tagline: a.tagline, city: a.city,
    cityNew: old?.fm.cityNew, restaurant: r && Object.keys(r).length ? r : undefined,
    cover: line(a.cover), gallery: (a.gallery || []).map((g) => line(g, g.caption ? [g.caption] : [])).filter(Boolean),
    quote: a.quote, tag: a.tag, bill: a.bill, billBand: a.billBand, visit: a.visit, hashtags: a.hashtags,
    publishedAt: a.publishedAt, seoTitle: a.seoTitle, seoDescription: a.seoDescription,
  });
  const dishes = (a.dishes || []).map((d) => [
    `### ${d.name || ''}${d.glassesOff ? ' 🕶️' : ''}`,
    ...(d.image?.url ? [`image: ${line(d.image)}`] : []),
    (d.description || '').trim(),
  ].filter((x, i) => i < 2 || x).join('\n')).join('\n\n');
  const heading = old?.heading || DISH_HEADING[lang] || DISH_HEADING.th;
  const text = `---\n${toYaml(fm)}\n---\n${intro}\n\n${heading}\n\n${dishes}\n`;
  if (old?.src === text) continue;
  write.push({ path, text, isNew: !old });
}

for (const w of warn) console.log(`! ${w}`);
if (!write.length) { console.log('All post files already match Sanity.'); process.exit(0); }
for (const w of write) console.log(`${w.isNew ? '+ new ' : '~ changed'} ${w.path}`);
if (check) { console.log(`Check only: ${write.length} file(s) differ from Sanity.`); process.exit(0); }
write.forEach((w) => writeFileSync(w.path, w.text));
console.log(`Wrote ${write.length} file(s). Review the diff before committing.`);
