#!/usr/bin/env node
// One-off: give the 12 cities that still use Gold Loop their own motif (brand kit, 5 Nov 2026),
// and fill an empty country for the Nordic cities and Istanbul. Never overwrites a motif the Boss chose
// (only cities whose motif is empty or "loop" change). Safe to run again.
//   node scripts/set-city-motifs.mjs [--dry]
// Manual workflow: Actions → Set city motifs → Run workflow (dry first). Needs SANITY_WRITE_TOKEN (not for --dry).
import { createClient } from '@sanity/client';

const dry = process.argv.includes('--dry');
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && !token) { console.error('Missing SANITY_WRITE_TOKEN'); process.exit(1); }
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', token, useCdn: false });

// City (slug or English name, letters only, lower case) → motif key in src/lib/config.ts MOTIFS, and the country if missing.
const PLAN = {
  shanghai: { motif: 'shanghai' }, hangzhou: { motif: 'hangzhou' }, sapporo: { motif: 'sapporo' },
  chiangmai: { motif: 'chiangmai' }, phuket: { motif: 'phuket' }, singapore: { motif: 'singapore' },
  taipei: { motif: 'taipei' }, seoul: { motif: 'seoul' },
  helsinki: { motif: 'helsinki', country: 'ฟินแลนด์' }, copenhagen: { motif: 'copenhagen', country: 'เดนมาร์ก' },
  oslo: { motif: 'oslo', country: 'นอร์เวย์' }, istanbul: { motif: 'istanbul', country: 'ตุรกี' }, istalbul: { motif: 'istanbul', country: 'ตุรกี' },
};
const key = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');

const cities = await client.fetch('*[_type == "city" && !(_id in path("drafts.**"))]{_id, nameEn, "slug": slug.current, motif, country} | order(nameEn asc)');
const todo = [];
for (const c of cities) {
  const plan = PLAN[key(c.slug)] || PLAN[key(c.nameEn)];
  if (!plan) continue;
  const set = {};
  if (!c.motif || c.motif === 'loop') set.motif = plan.motif;
  if (plan.country && !c.country) set.country = plan.country;
  if (Object.keys(set).length) todo.push({ c, set });
}
todo.forEach(({ c, set }) => console.log(`${c.nameEn} (${c.slug}): ${Object.entries(set).map(([k, v]) => `${k} → ${v}`).join(', ')}`));
const untouched = cities.filter((c) => (PLAN[key(c.slug)] || PLAN[key(c.nameEn)]) && !todo.some((t) => t.c._id === c._id));
untouched.forEach((c) => console.log(`${c.nameEn}: kept (motif "${c.motif}" already chosen)`));
if (dry) { console.log(`Dry run: ${todo.length} city/cities would change.`); process.exit(0); }
if (!todo.length) { console.log('Nothing to change.'); process.exit(0); }
const tx = client.transaction();
todo.forEach(({ c, set }) => tx.patch(c._id, (p) => p.set(set)));
await tx.commit();
console.log(`Done: ${todo.length} city/cities updated. The site rebuilds via the Sanity webhook.`);
