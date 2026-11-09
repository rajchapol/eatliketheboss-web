#!/usr/bin/env node
// Delete one article from Sanity by slug (all languages, published + draft). Removes it from city Boss's Picks first.
//   node scripts/delete-article.mjs --slug <slug> [--dry]
// Manual workflow: Actions → Delete article (dry first). Needs SANITY_WRITE_TOKEN (not for --dry).
import { createClient } from '@sanity/client';
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const slug = arg('--slug'), dry = process.argv.includes('--dry');
if (!slug) { console.error('Usage: --slug <slug> [--dry]'); process.exit(1); }
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && !token) { console.error('Missing SANITY_WRITE_TOKEN'); process.exit(1); }
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', token, useCdn: false, perspective: 'raw' });
const docs = await client.fetch('*[_type == "article" && slug.current == $slug]{_id, language, title}', { slug });
if (!docs.length) { console.log(`No article with slug "${slug}"`); process.exit(0); }
const ids = docs.map((d) => d._id);
const pubIds = [...new Set(ids.map((id) => id.replace(/^drafts\./, '')))];
const refs = await client.fetch('*[references($ids)]{_id, _type}', { ids: pubIds });
console.log('Articles:', docs.map((d) => `${d._id} [${d.language || 'th'}] ${d.title}`).join('\n  '));
console.log('Referenced by:', refs.map((r) => `${r._id} (${r._type})`).join(', ') || 'nothing');
if (dry) process.exit(0);
let tx = client.transaction();
for (const r of refs) {
  const doc = await client.getDocument(r._id);
  if (doc?.picks?.length) tx = tx.patch(r._id, (p) => p.set({ picks: doc.picks.filter((x) => !pubIds.includes(x._ref)) }));
  else { console.error(`! ${r._id} (${r._type}) references it in another field — fix by hand`); process.exit(1); }
}
for (const id of new Set([...ids, ...pubIds.map((i) => `drafts.${i}`)])) tx = tx.delete(id);
await tx.commit();
console.log(`Deleted ${slug}`);
