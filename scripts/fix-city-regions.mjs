#!/usr/bin/env node
// One-off: move cities saved with old region values (jp / cn / other / empty) to the new groups
// (th / asia / europe / americas / oceania / mea), using the same rule as the website (regionOf in src/lib/config.ts).
// Only the `region` field is changed. Safe to run again: cities already on a new value are skipped.
//   node --experimental-strip-types scripts/fix-city-regions.mjs [--dry]
// Needs SANITY_PROJECT_ID (default ohviqc5c) and SANITY_WRITE_TOKEN (GitHub secret; never commit it).
import { createClient } from '@sanity/client';
const { regionOf } = await import('../src/lib/config.ts');

const dry = process.argv.includes('--dry');
const NEW = ['th', 'asia', 'europe', 'americas', 'oceania', 'mea']; // the Studio list
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && !token) { console.error('Missing SANITY_WRITE_TOKEN'); process.exit(1); }
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', token, useCdn: false });

const cities = await client.fetch('*[_type == "city"]{_id, nameEn, country, region} | order(nameEn asc)');
const todo = [];
for (const c of cities) {
  const now = c.region ?? '(empty)';
  if (NEW.includes(c.region)) { console.log(`ok    ${c.nameEn.padEnd(14)} ${now}`); continue; }
  const next = regionOf(c);
  if (next === 'other') { console.log(`skip  ${c.nameEn.padEnd(14)} ${now} → country "${c.country ?? ''}" not recognised; set it in Studio`); continue; }
  console.log(`fix   ${c.nameEn.padEnd(14)} ${now} → ${next}${c._id.startsWith('drafts.') ? '  (draft)' : ''}`);
  todo.push({ id: c._id, next });
}
if (!todo.length) { console.log('Nothing to change.'); process.exit(0); }
if (dry) { console.log(`Dry run: ${todo.length} city/cities would change.`); process.exit(0); }
const tx = client.transaction();
todo.forEach(({ id, next }) => tx.patch(id, (p) => p.set({ region: next })));
await tx.commit();
console.log(`Done: ${todo.length} city/cities updated. The site rebuilds through the Sanity webhook.`);
