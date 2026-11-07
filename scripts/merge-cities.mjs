#!/usr/bin/env node
// Merge two city documents that are the same city (e.g. "copenhagen" and "denmark-copenhagen").
//   node scripts/merge-cities.mjs --from <city id> --into <city id> [--dry]
// Moves every article (and Boss's Picks) from the "from" city to the "into" city, fills fields the "into" city lacks
// (photo, map position, motif when it is the plain Gold Loop, aliases), then deletes the "from" city (published and draft).
// Manual workflow: Actions → Merge duplicate cities (dry first). Needs SANITY_WRITE_TOKEN (not for --dry).
import { createClient } from '@sanity/client';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const from = arg('--from'), into = arg('--into'), dry = process.argv.includes('--dry');
if (!from || !into || from === into) { console.error('Usage: --from <city id> --into <city id> [--dry]'); process.exit(1); }
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && !token) { console.error('Missing SANITY_WRITE_TOKEN'); process.exit(1); }
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', token, useCdn: false, perspective: 'raw' });

const [a, b] = await Promise.all([from, into].map((id) => client.getDocument(id)));
if (!a || !b) { console.error(`Not found: ${!a ? from : ''} ${!b ? into : ''}`); process.exit(1); }
if (a._type !== 'city' || b._type !== 'city') { console.error('Both ids must be cities'); process.exit(1); }
if (a.nameEn?.trim().toLowerCase() !== b.nameEn?.trim().toLowerCase()) console.warn(`! names differ: "${a.nameEn}" vs "${b.nameEn}" — check these are really the same city`);

// fields the kept city lacks, taken from the other one
const fill = {};
for (const k of ['cover', 'location', 'country', 'region', 'nameTh', 'intro']) if (!b[k] && a[k]) fill[k] = a[k];
if ((!b.motif || b.motif === 'loop') && a.motif && a.motif !== 'loop') fill.motif = a.motif;
const aliases = [...new Set([...(b.aliases || []), ...(a.aliases || [])])];
if (aliases.length > (b.aliases || []).length) fill.aliases = aliases;
if (!b.picks?.length && a.picks?.length) fill.picks = a.picks;
if (a.featured && !b.featured) fill.featured = true;

const refs = await client.fetch('*[references($id)]{_id, _type, "slug": slug.current}', { id: from });
console.log(`Keep  ${into} (${b.nameEn}, slug ${b.slug?.current})`);
console.log(`Merge ${from} (${a.nameEn}, slug ${a.slug?.current}) → then delete it`);
console.log(`Fill on kept city: ${Object.keys(fill).join(', ') || '(nothing)'}`);
if (a.intro && b.intro && a.intro !== b.intro) console.log(`  City fact kept: "${b.intro}"\n  dropped: "${a.intro}"`);
console.log(`Documents that point to the old city: ${refs.map((r) => r.slug || r._id).join(', ') || '(none)'}`);
if (dry) { console.log('Dry run: nothing changed.'); process.exit(0); }

const tx = client.transaction();
if (Object.keys(fill).length) tx.patch(into, (p) => p.set(fill));
for (const r of refs) {
  const doc = await client.getDocument(r._id);
  if (doc?.city?._ref === from && JSON.stringify(doc).split(`"_ref":"${from}"`).length === 2) tx.patch(r._id, (p) => p.set({ 'city._ref': into }));
  else tx.createOrReplace(JSON.parse(JSON.stringify(doc).split(`"_ref":"${from}"`).join(`"_ref":"${into}"`))); // other places that point to it
}
tx.delete(from); tx.delete(`drafts.${from}`);
await tx.commit();
console.log(`Done: merged into ${into}, moved ${refs.length} document(s), deleted ${from}. Add a redirect for /city/${a.slug?.current}/ if that page was ever live.`);
