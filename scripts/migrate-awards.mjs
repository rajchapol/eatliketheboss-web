#!/usr/bin/env node
// One-off: turn the plain-text awards in Sanity ("MICHELIN Plate (2019)") into the new award items { award, year, note }
// that the Studio dropdown edits (the Boss, 6 Nov 2026). Text that matches no award in src/data/awards.json is listed and left as is.
// Safe to run again (items that are already objects are kept).
//   node scripts/migrate-awards.mjs [--dry]      · Actions → Migrate awards (dry first). Needs SANITY_WRITE_TOKEN (not for --dry).
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { makeAwards } from '../src/lib/awards.mjs';

const dry = process.argv.includes('--dry');
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && !token) { console.error('Missing SANITY_WRITE_TOKEN'); process.exit(1); }
const A = makeAwards(JSON.parse(readFileSync(new URL('../src/data/awards.json', import.meta.url), 'utf8')));
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', token, useCdn: false, perspective: 'raw' });

const docs = await client.fetch('*[_type == "article" && count(restaurant.awards) > 0]{_id, "slug": slug.current, language, "awards": restaurant.awards}');
const tx = client.transaction();
let n = 0;
for (const d of docs) {
  if (d.awards.every((x) => x && typeof x === 'object' && x._type === 'award')) continue;
  const items = [], left = [];
  d.awards.forEach((x, i) => {
    if (x && typeof x === 'object' && x._type === 'award') { items.push(x); return; }
    const p = A.parse(x);
    if (p) items.push({ _key: x?._key || `aw${i}`, _type: 'award', ...p }); else if (x != null && String(x).trim()) left.push(x);
  });
  if (left.length) console.log(`! ${d._id}: not in the list, kept out: ${left.map((x) => JSON.stringify(x)).join(', ')}`);
  console.log(`${d._id}: ${d.awards.map((x) => JSON.stringify(x)).join(', ')} → ${items.map((o) => A.label(o)).join(' · ') || '(none)'}`);
  tx.patch(d._id, (p) => p.set({ 'restaurant.awards': items }));
  n++;
}
if (dry) { console.log(`Dry run: ${n} article(s) would change.`); process.exit(0); }
if (!n) { console.log('Nothing to change.'); process.exit(0); }
await tx.commit();
console.log(`Done: ${n} article(s) updated.`);
