#!/usr/bin/env node
// One-off: fix English spelling in city documents (5 Nov 2026).
// "Istalbul" → "Istanbul" (name and slug; the old URL redirects in public/_redirects) and stray spaces in names.
// Changes only nameEn / nameTh / slug of city documents. Safe to run again.
//   node scripts/fix-city-names.mjs [--dry]      (Actions → Fix city names, dry first)
import { createClient } from '@sanity/client';

const dry = process.argv.includes('--dry');
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && !token) { console.error('Missing SANITY_WRITE_TOKEN'); process.exit(1); }
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', token, useCdn: false });

const SPELLING = { Istalbul: 'Istanbul' };
const SLUGS = { 'turkey-istalbul': 'turkey-istanbul' };
const cities = await client.fetch('*[_type == "city" && !(_id in path("drafts.**"))]{_id, nameEn, nameTh, "slug": slug.current}');
const todo = [];
for (const c of cities) {
  const set = {};
  const en = (c.nameEn || '').trim(), th = (c.nameTh || '').trim();
  const fixedEn = SPELLING[en] ?? en;
  if (fixedEn !== c.nameEn) set.nameEn = fixedEn;
  if (th !== c.nameTh) set.nameTh = th;
  if (SLUGS[c.slug]) set.slug = { _type: 'slug', current: SLUGS[c.slug] };
  if (Object.keys(set).length) todo.push({ c, set });
}
todo.forEach(({ c, set }) => console.log(`${JSON.stringify(c.nameEn)} (${c.slug}): ${Object.entries(set).map(([k, v]) => `${k} → ${JSON.stringify(k === 'slug' ? v.current : v)}`).join(', ')}`));
if (dry) { console.log(`Dry run: ${todo.length} city/cities would change.`); process.exit(0); }
if (!todo.length) { console.log('Nothing to change.'); process.exit(0); }
const tx = client.transaction();
todo.forEach(({ c, set }) => tx.patch(c._id, (p) => p.set(set)));
await tx.commit();
console.log(`Done: ${todo.length} city/cities updated.`);
