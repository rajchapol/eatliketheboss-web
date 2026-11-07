#!/usr/bin/env node
// One-off: turn the plain-text awards in Sanity ("MICHELIN Plate (2019)") into the new award items { award, year, note }
// that the Studio dropdown edits (the Boss, 6 Nov 2026). Text that matches no award in src/data/awards.json is listed and left as is.
// Safe to run again (items that are already objects are kept, except a stray note left by an old parser bug,
// e.g. "Asia's 50 Best Restaurants" + note "Restaurants", which is dropped).
//   node scripts/migrate-awards.mjs [--dry]      · Actions → Migrate awards (dry first). Needs SANITY_WRITE_TOKEN (not for --dry).
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { makeAwards } from '../src/lib/awards.mjs';

const dry = process.argv.includes('--dry');
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && !token) { console.error('Missing SANITY_WRITE_TOKEN'); process.exit(1); }
const A = makeAwards(JSON.parse(readFileSync(new URL('../src/data/awards.json', import.meta.url), 'utf8')));
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', token, useCdn: false, perspective: 'raw' });

/** A note that only repeats the end of the award name ('Restaurants') or a plural 's' from "2 stars". */
const strayNote = (o) => !!o.note && (o.note.trim().toLowerCase() === 's' || String(o.award).toLowerCase().endsWith(' ' + o.note.trim().toLowerCase()));

const docs = await client.fetch('*[_type == "article" && count(restaurant.awards) > 0]{_id, "slug": slug.current, language, "awards": restaurant.awards}');
const tx = client.transaction();
let n = 0;
for (const d of docs) {
  const items = [], left = [];
  let changed = false;
  d.awards.forEach((x, i) => {
    if (x && typeof x === 'object' && x._type === 'award') {
      if (strayNote(x)) { const { note, ...rest } = x; items.push(rest); changed = true; } else items.push(x);
      return;
    }
    changed = true;
    const p = A.parse(x);
    if (p) items.push({ _key: x?._key || `aw${i}`, _type: 'award', ...p });
    else if (x != null && String(x).trim()) { left.push(x); items.push(x); }
  });
  if (!changed) continue;
  if (left.length) console.log(`! ${d._id}: not in the list, kept as text (fix in Studio): ${left.map((x) => JSON.stringify(x)).join(', ')}`);
  console.log(`${d._id}: ${d.awards.map((x) => (typeof x === 'object' ? A.label(x) : JSON.stringify(x))).join(', ')} → ${items.map((o) => (typeof o === 'object' ? A.label(o) : JSON.stringify(o))).join(' · ') || '(none)'}`);
  tx.patch(d._id, (p) => p.set({ 'restaurant.awards': items }));
  n++;
}
if (dry) { console.log(`Dry run: ${n} article(s) would change.`); process.exit(0); }
if (!n) { console.log('Nothing to change.'); process.exit(0); }
await tx.commit();
console.log(`Done: ${n} article(s) updated.`);
