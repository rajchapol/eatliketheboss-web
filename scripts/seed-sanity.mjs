#!/usr/bin/env node
// One-time: create the starting cities in Sanity (safe to re-run; it won't overwrite edits).
//   node scripts/seed-sanity.mjs
import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@sanity/client';
const env = Object.fromEntries(existsSync('.env') ? readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()]) : []);
const get = (k) => process.env[k] || env[k];
const client = createClient({ projectId: get('SANITY_PROJECT_ID'), dataset: get('SANITY_DATASET') || 'production', apiVersion: '2025-01-01', token: get('SANITY_WRITE_TOKEN'), useCdn: false });
const cities = JSON.parse(readFileSync('src/data/cities.json', 'utf8'));
const tx = client.transaction();
for (const c of cities) {
  const { slug, intro, ...rest } = c;
  tx.createIfNotExists({ _id: `city-${slug}`, _type: 'city', slug: { _type: 'slug', current: slug }, ...rest, ...(intro && !intro.startsWith('[') ? { intro } : {}) });
}
await tx.commit();
console.log(`✓ สร้างเมือง ${cities.length} เมืองใน Sanity แล้ว`);
