#!/usr/bin/env node
// Post (or update) one article from a Markdown file into Sanity.
//   npm run post -- posts/sezanne.md          → upload images + create/replace the article
//   npm run post -- posts/sezanne.md --dry    → print the document only, send nothing
//   npm run post -- posts/sezanne.md --since <git ref>  → for an article that already exists, send ONLY the fields
//        that changed in this file since <ref> (the post workflow passes the previous commit; without --since the
//        file's previous commit is used). Everything else, including what the Boss edited in Studio, is left alone.
// Needs SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in .env (see .env.example).
// File format: see posts/_template.md
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve, basename, relative } from 'node:path';
import { makeAwards } from '../src/lib/awards.mjs';
import { createClient } from '@sanity/client';
import { parse as parseYaml } from 'yaml';

const env = Object.fromEntries(
  existsSync('.env') ? readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]) : [],
);
const get = (k) => process.env[k] || env[k];
const [file, ...flags] = process.argv.slice(2);
const dry = flags.includes('--dry');
const since = flags.includes('--since') ? flags[flags.indexOf('--since') + 1] : undefined;
if (!file) { console.error('ใช้: npm run post -- posts/<slug>.md [--dry]'); process.exit(1); }

// Google Docs pastes can carry vertical tabs / zero-width spaces that show as boxes on the site.
// "## ศิลปะแห่งรสชาติในมื้อนี้" splits intro from dishes; each "### name" is one dish.
function parse(text) {
  const src = text.replace(/[\v\f\u200B\uFEFF]+/g, ' ');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('ไฟล์ต้องขึ้นต้นด้วย frontmatter --- ... ---');
  const [introMd, dishesMd = ''] = m[2].split(/^##\s+.*$/m);
  const paragraphs = introMd.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
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
  return { fm: parseYaml(m[1]), paragraphs, dishes };
}
const { fm, paragraphs, dishes } = parse(readFileSync(file, 'utf8'));
const base = dirname(resolve(file));
const lang = fm.language || 'th';
const key = () => Math.random().toString(36).slice(2, 10);
const block = (text, style = 'normal') => ({ _type: 'block', _key: key(), style, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] });
const bodyBlocks = paragraphs.map((p) => (p.startsWith('> ') ? block(p.replace(/^>\s?/gm, ''), 'blockquote') : block(p)));

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

// ---- Checks that keep Studio data tidy (also in --dry) ----
// Cuisine: one broad English category + an optional style from that category (the Boss, 5 Nov 2026).
// One list for site, Studio and this check: src/data/cuisines.json. Add a style there (in a PR) only when none fits.
const CUISINE_STYLES = Object.fromEntries(Object.entries(JSON.parse(readFileSync(new URL('../src/data/cuisines.json', import.meta.url), 'utf8'))).filter(([k]) => !k.startsWith('_')));
const CUISINES = Object.keys(CUISINE_STYLES);
const cu = fm.restaurant?.cuisine, st = fm.restaurant?.style;
if (cu && !CUISINES.includes(String(cu).trim())) throw new Error(`cuisine "${cu}" ไม่อยู่ในรายการ — ใช้หมวดใหญ่ภาษาอังกฤษอย่างใดอย่างหนึ่ง: ${CUISINES.join(' | ')} (รายละเอียด เช่น Sushi, Cantonese ใส่ใน restaurant.style)`);
if (st && !cu) throw new Error('มี restaurant.style แต่ไม่มี restaurant.cuisine — ใส่หมวดก่อน');
// Awards: each line must start with an award from src/data/awards.json (then an optional year and "(note)").
const AWARDS = makeAwards(JSON.parse(readFileSync(new URL('../src/data/awards.json', import.meta.url), 'utf8')));
const badAwards = (fm.restaurant?.awards || []).filter((x) => x != null && String(x).trim() && !AWARDS.parse(x));
if (badAwards.length) throw new Error(`รางวัลไม่อยู่ในรายการ: ${badAwards.map((x) => `"${x}"`).join(', ')} — เขียนเป็น "<ชื่อรางวัลในรายการ> [ปี] [(หมายเหตุ)]" เช่น "MICHELIN 2★", "Tatler Best 20 2026 (Taiwan)" · รายการทั้งหมดอยู่ใน src/data/awards.json (ถ้าเป็นรางวัลจริงที่ยังไม่มี ให้เพิ่มในไฟล์นั้นแล้วเปิด PR)`);
if (st && !CUISINE_STYLES[String(cu).trim()].includes(String(st).trim())) throw new Error(`style "${st}" ไม่อยู่ในหมวด ${cu} — เลือกจาก: ${CUISINE_STYLES[String(cu).trim()].join(', ')} · ถ้าไม่มีที่ตรงจริงๆ เว้นว่างไว้ หรือเพิ่มใน src/data/cuisines.json แล้วเปิด PR`);
// New city: the slug is the city's English name only, e.g. oslo, san-sebastian (no country in front).
// Four cities were made with a country prefix before this rule; their URLs are live, so they stay.
const LEGACY_CITY = ['norway-oslo', 'finland-helsinki', 'turkey-istanbul'];
if (fm.cityNew?.nameEn && !LEGACY_CITY.includes(fm.city)) {
  const want = String(fm.cityNew.nameEn).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (fm.city !== want) throw new Error(`city ของเมืองใหม่ต้องเป็นชื่อเมืองภาษาอังกฤษอย่างเดียว: city: ${want} (ตอนนี้ "${fm.city}" · ไม่ใส่ชื่อประเทศข้างหน้า)`);
}
// New city: needs its "City fact" (Studio → City fact, shown under "Did you know?" on the city page) — the Boss, 5 Nov 2026.
// cityNew.fact = one short, odd, TRUE fact about the city, in English, 1–2 sentences, checked against a real source.
// Only asked when the city does not exist in Sanity yet (checked on the public dataset, also in --dry).
if (fm.cityNew && fm.city) {
  let exists = null, dupCity = null;
  try {
    const pid = get('SANITY_PROJECT_ID') || 'ohviqc5c', ds = get('SANITY_DATASET') || 'production';
    const q = encodeURIComponent(`count(*[_type=="city" && slug.current==${JSON.stringify(String(fm.city))}])`);
    exists = (await (await fetch(`https://${pid}.apicdn.sanity.io/v2025-01-01/data/query/${ds}?query=${q}`)).json()).result > 0;
    // Same city under another slug (e.g. "denmark-copenhagen" while this file says "copenhagen"): use that one, never make a second.
    if (!exists && fm.cityNew.nameEn) {
      const q2 = encodeURIComponent(`*[_type=="city" && lower(nameEn)==${JSON.stringify(String(fm.cityNew.nameEn).trim().toLowerCase())}][0].slug.current`);
      const other = (await (await fetch(`https://${pid}.apicdn.sanity.io/v2025-01-01/data/query/${ds}?query=${q2}`)).json()).result;
      if (other) dupCity = other;
    }
  } catch { console.warn('⚠︎ เช็กไม่ได้ว่าเมืองนี้มีใน Sanity หรือยัง (ออฟไลน์?) · ข้ามการเช็ก cityNew.fact'); }
  if (dupCity) throw new Error(`มีเมือง "${fm.cityNew.nameEn}" อยู่แล้วใน Sanity (city: ${dupCity}) — ใช้ city: ${dupCity} และลบ cityNew ออก ไม่งั้นจะได้เมืองซ้ำ 2 รายการ`);
  // Map pin: a city not in src/data/city-coords.json needs cityNew.lat / cityNew.lng, or it never shows on the Destinations map.
  const COORDS = JSON.parse(readFileSync(new URL('../src/data/city-coords.json', import.meta.url), 'utf8'));
  const nameKey = String(fm.cityNew.nameEn || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const parts = String(fm.city).split('-');
  const known = [fm.city, nameKey, ...parts.map((_, i) => parts.slice(i + 1).join('-')).filter(Boolean)].some((k) => COORDS[k]);
  const lat = Number(fm.cityNew.lat), lng = Number(fm.cityNew.lng);
  const hasPos = fm.cityNew.lat != null && fm.cityNew.lng != null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  if (exists === false && !known && !hasPos)
    throw new Error(`เมืองใหม่ "${fm.city}" ยังไม่มีพิกัดแผนที่ — ใส่ cityNew.lat และ cityNew.lng (ตัวเลข องศาทศนิยม เช่น lat: 50.11, lng: 8.68) ไม่งั้นหมุดไม่ขึ้นในหน้าจุดหมาย`);
  const fact = String(fm.cityNew.fact || '').trim();
  if (exists === false && (!fact || fact.length < 40 || fact.length > 320 || /[\u0E00-\u0E7F]/.test(fact)))
    throw new Error(`เมืองใหม่ "${fm.city}" ต้องมี cityNew.fact: เรื่องจริงที่แปลกและน่าสนใจของเมือง 1 เรื่อง ภาษาอังกฤษ 1–2 ประโยค (40–320 ตัวอักษร) ตรวจจากแหล่งจริงแล้ว · ตัวอย่าง: fact: "In Copenhagen a Danish pastry is called wienerbrød, \"Vienna bread\": Austrian bakers brought the recipe during an 1850 bakers' strike."`);
}

const cityRef = fm.city ? (dry ? { _ref: `(city ${fm.city})` } : await client.fetch('*[_type=="city" && slug.current==$s][0]{_id}', { s: fm.city }).then((c) => {
  if (c) return { _type: 'reference', _ref: c._id };
  // เมืองใหม่: ใส่ cityNew: { nameEn, nameTh, country, region, fact } ใน frontmatter แล้วระบบสร้างเมืองให้ (ไม่ทับเมืองที่มีอยู่)
  const n = fm.cityNew;
  if (!n || !n.nameEn || !n.nameTh) throw new Error(`ไม่พบเมือง "${fm.city}" ใน Sanity — สร้างเมืองก่อนใน Studio หรือใส่ cityNew: { nameEn, nameTh, country, region, fact } ในไฟล์`);
  const id = `city-${fm.city}`;
  return client.createIfNotExists({ _id: id, _type: 'city', nameEn: n.nameEn, nameTh: n.nameTh, slug: { _type: 'slug', current: fm.city }, country: n.country, region: n.region || 'asia', motif: n.motif || 'loop', ...(n.fact ? { intro: String(n.fact).trim() } : {}), ...(n.lat != null && n.lng != null ? { location: { _type: 'geopoint', lat: Number(n.lat), lng: Number(n.lng) } } : {}) })
    .then(() => { console.log(`+ สร้างเมืองใหม่ ${id}`); return { _type: 'reference', _ref: id }; });
})) : undefined;

const slug = fm.slug;
const id = `article-${slug}${lang === 'th' ? '' : `-${lang}`}`;
const doc = {
  _id: id, _type: 'article', language: lang,
  ...(lang !== 'th' ? { translationOf: { _type: 'reference', _ref: `article-${slug}` } } : {}),
  series: fm.series || 'review', episode: fm.episode, title: fm.title, slug: { _type: 'slug', current: slug },
  tagline: fm.tagline, city: cityRef, cover: await upload(fm.cover),
  // gallery: ["./images/<slug>/room.jpg | alt text | caption (optional)", …] → ambience / chef photos before the dishes
  gallery: fm.gallery ? await Promise.all([].concat(fm.gallery).map(async (g) => {
    const [path, alt, caption] = String(g).split('|').map((x) => x.trim());
    const im = await upload(`${path} | ${alt || ''}`);
    return { ...im, _key: key(), ...(caption ? { caption } : {}) };
  })) : undefined,
  // restaurant.sameAs: <slug of the earlier review> links visits when the restaurant's name changed
  restaurant: fm.restaurant && { ...fm.restaurant, sameAs: fm.restaurant.sameAs ? { _type: 'reference', _ref: `article-${fm.restaurant.sameAs}`, _weak: true } : undefined,
    // awards: "Tatler Best 20 2026 (Taiwan)" → { award, year, note } (the Studio dropdown); empty lines dropped
    awards: fm.restaurant.awards ? fm.restaurant.awards.map((x) => AWARDS.parse(x)).filter(Boolean).map((o, i) => ({ _key: `aw${i}`, _type: 'award', ...o })) : undefined },
  body: bodyBlocks, quote: fm.quote,
  dishes: await Promise.all(dishes.map(async (d) => ({ _type: 'dish', _key: key(), name: d.name, description: d.description, glassesOff: d.glassesOff, image: await upload(d.image) }))),
  tag: fm.tag || '', bill: fm.bill || undefined, billBand: fm.billBand || fm.restaurant?.priceBand || undefined, visit: fm.visit, hashtags: (fm.hashtags || []).map((h) => String(h).replace(/^#/, '')),
  publishedAt: String(fm.publishedAt || new Date().toISOString().slice(0, 10)), seoTitle: fm.seoTitle, seoDescription: fm.seoDescription,
};

if (doc.dishes.filter((d) => d.glassesOff).length > 2) throw new Error('ถอดแว่นชิมได้มากสุด 2 จาน');
if (dry) { console.log(JSON.stringify(doc, null, 2)); process.exit(0); }
if (!get('SANITY_WRITE_TOKEN')) throw new Error('ไม่มี SANITY_WRITE_TOKEN ใน .env');
// ---- Writing to Sanity ----------------------------------------------------------------------------------
// New article → create it. Existing article → never overwrite what the Boss changed in Studio:
//  • with --since (the post workflow): compare this file with its previous version and send only the
//    fields that changed in the file (one dish's text, the price band, the SEO title…), as a patch.
//  • only when there is no previous version to compare (no git history): send every field the file fills;
//    fields the file leaves empty keep their value.
const isEmpty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
const same = (x, y) => JSON.stringify(x ?? null) === JSON.stringify(y ?? null);
const existing = await client.getDocument(id);

// The file's previous version: at --since, or (manual runs) before the file's last commit — or the committed
// version when the file has uncommitted edits. So a re-run from Actions re-sends only the last change.
function previousVersion() {
  try {
    const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const path = relative(git('rev-parse', '--show-toplevel'), resolve(file));
    let ref = since;
    if (!ref) ref = git('status', '--porcelain', '--', path) ? 'HEAD' : `${git('log', '-1', '--format=%H', '--', path)}^`;
    return parse(git('show', `${ref}:${path}`));
  } catch { return undefined; } // no git, or the file did not exist before
}

if (!existing) {
  await client.createOrReplace(doc);
} else {
  const old = previousVersion();
  if (old) {
    const sets = {}, unsets = [], changed = [];
    const put = (path, value) => { changed.push(path); if (isEmpty(value)) unsets.push(path); else sets[path] = value; };
    const FM = { series: 'series', episode: 'episode', title: 'title', tagline: 'tagline', city: 'city', cover: 'cover', gallery: 'gallery', quote: 'quote', tag: 'tag', bill: 'bill', visit: 'visit', hashtags: 'hashtags', publishedAt: 'publishedAt', seoTitle: 'seoTitle', seoDescription: 'seoDescription' };
    for (const [k, field] of Object.entries(FM)) if (!same(old.fm[k], fm[k])) put(field, doc[field]);
    if (!same(old.fm.billBand || old.fm.restaurant?.priceBand, fm.billBand || fm.restaurant?.priceBand)) put('billBand', doc.billBand);
    if (!same(old.fm.slug, fm.slug)) throw new Error('slug เปลี่ยนไม่ได้หลังเผยแพร่ (URL จะเสีย) — ถ้าจำเป็นจริงให้ทำใน Studio และเพิ่ม redirect');
    const oldR = old.fm.restaurant || {}, newR = fm.restaurant || {};
    for (const k of new Set([...Object.keys(oldR), ...Object.keys(newR)])) {
      if (k === 'priceBand' || same(oldR[k], newR[k])) continue;
      if (!existing.restaurant) { put('restaurant', doc.restaurant); break; }
      put(`restaurant.${k}`, doc.restaurant?.[k]);
    }
    if (!same(old.paragraphs, paragraphs)) put('body', doc.body);
    if (old.dishes.length !== dishes.length) put('dishes', doc.dishes); // dishes added/removed in the file: the list follows the file
    else dishes.forEach((d, i) => {
      const o = old.dishes[i];
      // find the same dish in Sanity by its previous name (Studio may have reordered), else by position
      const target = (existing.dishes || []).find((x) => x.name === o.name) || (existing.dishes || [])[i];
      if (!target?._key) { if (!same(o, d)) put('dishes', doc.dishes); return; }
      const at = `dishes[_key=="${target._key}"]`;
      for (const f of ['name', 'description', 'glassesOff']) if (!same(o[f], d[f])) put(`${at}.${f}`, doc.dishes[i][f]);
      if (!same(o.image, d.image)) put(`${at}.image`, doc.dishes[i].image);
    });
    if (!changed.length) { console.log('ℹ︎ ไม่มีช่องไหนเปลี่ยนในไฟล์ · ไม่ได้ส่งอะไรเข้า Sanity'); process.exit(0); }
    let patch = client.patch(id);
    if (Object.keys(sets).length) patch = patch.set(sets);
    if (unsets.length) patch = patch.unset(unsets);
    await patch.commit();
    console.log(`ℹ︎ อัปเดตเฉพาะช่องที่แก้ในไฟล์: ${changed.join(', ')} · ส่วนอื่นใน Studio ไม่ถูกแตะ`);
  } else {
    const keepStudio = (current, next, prefix, kept) => {
      const out = { ...next };
      for (const k of Object.keys(current)) if (!k.startsWith('_') && isEmpty(next[k]) && !isEmpty(current[k])) { out[k] = current[k]; kept.push(prefix + k); }
      return out;
    };
    const kept = [];
    const final = keepStudio(existing, doc, '', kept);
    if (doc.restaurant && existing.restaurant) final.restaurant = keepStudio(existing.restaurant, doc.restaurant, 'restaurant.', kept);
    await client.createOrReplace(final);
    console.log(`ℹ︎ บทความนี้มีใน Sanity แล้ว (ไม่มีไฟล์ฉบับก่อนให้เทียบ) · ส่งทุกช่องที่ไฟล์กรอก${kept.length ? ` · ช่องที่ไฟล์เว้นว่างใช้ค่าเดิม: ${kept.join(', ')}` : ''}`);
  }
}
if (await client.getDocument(`drafts.${id}`)) console.warn(`⚠︎ มีฉบับร่างค้างใน Studio (drafts.${id}) ถ้ากด Publish ฉบับร่างนั้น จะทับสิ่งที่ลงจากไฟล์นี้ · ทิ้งร่าง (Discard changes) ถ้าไม่ต้องการ`);
console.log(`✓ โพสต์แล้ว: ${id} — เว็บจะอัปเดตเองภายในไม่กี่นาที (Cloudflare build)`);
