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
import { basename, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { makeAwards } from '../src/lib/awards.mjs';
const AWARDS = makeAwards(JSON.parse(readFileSync(new URL('../src/data/awards.json', import.meta.url), 'utf8')));
import { execFileSync } from 'node:child_process';
import { createClient } from '@sanity/client';
import { parse as parseYaml, Document, isScalar, isSeq, visit } from 'yaml';

const args = process.argv.slice(2);
const check = args.includes('--check');
const force = args.includes('--force'); // also overwrite files that are newer than Sanity (normally skipped)
const only = args.find((a) => !a.startsWith('--'));
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', useCdn: false });

const IMG = '{alt, caption, "url": asset->url, "file": asset->originalFilename, "sha1": asset->sha1hash}';
const articles = await client.fetch(`*[_type == "article" && defined(slug.current) && !(_id in path("drafts.**"))]{
  _id, _updatedAt, language, series, episode, title, "slug": slug.current, tagline, "city": city->slug.current,
  restaurant{..., "sameAs": sameAs->slug.current}, cover${IMG}, gallery[]${IMG}, body, quote,
  dishes[]{name, description, glassesOff, image${IMG}}, tag, bill, billBand, visit, hashtags, publishedAt, seoTitle, seoDescription
} | order(slug.current asc)`);

const DISH_HEADING = { th: '## ศิลปะแห่งรสชาติในมื้อนี้', en: '## The art of taste in this meal', ja: '## この食事の味わい', zh: '## 这一餐的味道艺术' };
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)));

// What the existing file already says (same rules as post-article.mjs).
const sha1Cache = new Map();
const sha1 = (f) => sha1Cache.get(f) ?? (sha1Cache.set(f, createHash('sha1').update(readFileSync(f)).digest('hex')), sha1Cache.get(f));
function readExisting(path) {
  if (!existsSync(path)) return null;
  const src = readFileSync(path, 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const fm = parseYaml(m[1]) || {};
  const heading = (m[2].match(/^##\s+.*$/m) || [])[0];
  const [introMd] = m[2].split(/^##\s+.*$/m);
  // Local photos by content (Sanity keeps one asset per identical file, so its original file name can belong to
  // another copy, e.g. cover.jpg = 18.jpg): match by SHA-1 first, then by file name.
  const paths = new Map(), hashes = new Map();
  const note = (p) => {
    if (!p || /^https?:/.test(p)) return;
    if (!paths.has(basename(p))) paths.set(basename(p), p);
    const abs = resolve(dirname(path), p);
    if (existsSync(abs) && !hashes.has(sha1(abs))) hashes.set(sha1(abs), p);
  };
  const first = (s) => String(s || '').split('|')[0].trim();
  note(first(fm.cover));
  [].concat(fm.gallery || []).forEach((g) => note(first(g)));
  const dishPaths = new Map(); // dish name → the photo path that dish used
  for (const im of m[2].matchAll(/^image:\s*(.+?)\s*\|/gm)) note(im[1]);
  // image: can sit anywhere under its ### heading (not only on the next line)
  for (const chunk of m[2].split(/^###\s+/m).slice(1)) {
    const name = chunk.split('\n')[0].replace(/🕶️|\[glasses-off\]/g, '').trim(), im = chunk.match(/^image:\s*(.+?)\s*\|/m);
    if (im) dishPaths.set(name, im[1]);
    if ((chunk.match(/^image:/gm) || []).length > 1) warn.push(`${path}: dish "${name}" has more than one image: line; only the last one is posted (one photo per dish)`);
  }
  return { src, fm, heading, intro: introMd.trim(), paths, hashes, dishPaths, cover: first(fm.cover) };
}

// Same look as the hand-written files: text in "quotes", short codes plain, lists on one line.
const PLAIN = new Set(['language', 'series', 'slug', 'city', 'visit', 'publishedAt', 'episode', 'region']);
function toYaml(obj) {
  const doc = new Document(obj);
  visit(doc, {
    Pair(_, pair) {
      const k = pair.key?.value;
      if (isScalar(pair.value) && typeof pair.value.value === 'string') pair.value.type = PLAIN.has(k) ? 'PLAIN' : 'QUOTE_DOUBLE';
      if (isSeq(pair.value) && ['hashtags', 'awards', 'aliases'].includes(k)) {
        pair.value.flow = true;
        if (k !== 'hashtags') pair.value.items.forEach((it) => { if (isScalar(it)) it.type = 'QUOTE_DOUBLE'; }); // awards: ["MICHELIN 3★"]
      }
    },
  });
  return doc.toString({ lineWidth: 0, flowCollectionPadding: false }).trimEnd();
}

const write = [];
const warn = [];
const skipped = [];
for (const a of articles) {
  if (only && a.slug !== only) continue;
  const lang = a.language || 'th';
  const path = `posts/${a.slug}${lang === 'th' ? '' : `.${lang}`}.md`;
  // A file committed after Sanity last changed holds work that hasn't reached Sanity yet (a post still being
  // published by the post workflow, or a draft edit): never overwrite it with the older Sanity copy.
  if (existsSync(path) && !force) {
    let committed = '';
    try { committed = execFileSync('git', ['log', '-1', '--format=%cI', '--', path], { encoding: 'utf8' }).trim(); } catch {}
    const dirty = (() => { try { return execFileSync('git', ['status', '--porcelain', '--', path], { encoding: 'utf8' }).trim() !== ''; } catch { return false; } })();
    if (dirty || (committed && new Date(committed) > new Date(a._updatedAt))) { skipped.push(`${path} (${dirty ? 'uncommitted edits' : 'file is newer than Sanity'})`); continue; }
  }
  const old = readExisting(path);
  // Keep the local file when it is the same photo. First the path this slot (cover / that dish) already used,
  // then any local copy with the same content, then the same file name, else the Sanity CDN URL.
  const same = (p, im) => { if (!p || /^https?:/.test(p)) return false; const abs = resolve(dirname(path), p); return existsSync(abs) && sha1(abs) === im.sha1; };
  const where = (im, slotPath) => {
    if (!im) return undefined;
    if (same(slotPath, im)) return slotPath;
    return (im.sha1 && old?.hashes.get(im.sha1)) || (im.file && old?.paths.get(im.file)) || im.url;
  };
  const line = (im, extra = [], slot) => (im?.url ? [where(im, slot), im.alt || '', ...extra].join(' | ').replace(/\s\|\s$/, '') : undefined);

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
    cuisine: a.restaurant.cuisine, style: a.restaurant.style, awards: a.restaurant.awards?.map((x) => AWARDS.label(x)).filter(Boolean), aliases: a.restaurant.aliases, sameAs: a.restaurant.sameAs,
  }) : undefined;
  const fm = clean({
    language: lang, series: a.series, episode: a.episode, title: a.title, slug: a.slug, tagline: a.tagline, city: a.city,
    cityNew: old?.fm.cityNew, restaurant: r && Object.keys(r).length ? r : undefined,
    cover: line(a.cover, [], old?.cover), gallery: (a.gallery || []).map((g) => line(g, g.caption ? [g.caption] : [])).filter(Boolean),
    quote: a.quote, tag: a.tag, bill: a.bill, billBand: a.billBand, visit: a.visit, hashtags: a.hashtags,
    publishedAt: a.publishedAt, seoTitle: a.seoTitle, seoDescription: a.seoDescription,
  });
  const dishes = (a.dishes || []).map((d) => [
    `### ${d.name || ''}${d.glassesOff ? ' 🕶️' : ''}`,
    ...(d.image?.url ? [`image: ${line(d.image, [], old?.dishPaths.get((d.name || '').trim()))}`] : []),
    (d.description || '').trim(),
  ].filter((x, i) => i < 2 || x).join('\n')).join('\n\n');
  const heading = old?.heading || DISH_HEADING[lang] || DISH_HEADING.th;
  const text = `---\n${toYaml(fm)}\n---\n${intro}\n\n${heading}\n\n${dishes}\n`;
  if (old?.src === text) continue;
  write.push({ path, text, isNew: !old });
}

for (const w of warn) console.log(`! ${w}`);
for (const k of skipped) console.log(`= skipped ${k}`);
if (!write.length) { console.log('All post files already match Sanity.'); process.exit(0); }
for (const w of write) console.log(`${w.isNew ? '+ new ' : '~ changed'} ${w.path}`);
if (check) { console.log(`Check only: ${write.length} file(s) differ from Sanity.`); process.exit(0); }
write.forEach((w) => writeFileSync(w.path, w.text));
console.log(`Wrote ${write.length} file(s). Review the diff before committing.`);
