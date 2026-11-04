#!/usr/bin/env node
// Fills the Sanity settings document ("ตั้งค่าเว็บ / ข้อความทุกหน้า") so every text field in Studio shows
// the text the website uses today (defaults: src/data/settings.json):
//   • empty / missing fields → filled with the default
//   • the old wording about invited meals (scripts/data/settings-old-wording.json) → replaced with the new
//     wording, ONLY if the field still holds exactly the old default (anything the Boss edited is kept)
//   • every other field is left alone
//   node scripts/fill-settings.mjs [--dry]      (needs SANITY_WRITE_TOKEN; never commit it)
import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';

const dry = process.argv.includes('--dry');
const defaults = JSON.parse(readFileSync(new URL('../src/data/settings.json', import.meta.url), 'utf8'));
const old = JSON.parse(readFileSync(new URL('./data/settings-old-wording.json', import.meta.url), 'utf8'));
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && !token) { console.error('Missing SANITY_WRITE_TOKEN'); process.exit(1); }
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', token, useCdn: false });

const empty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
const key = () => Math.random().toString(36).slice(2, 10);
const withKeys = (v) => (Array.isArray(v) ? v.map((x) => (x && typeof x === 'object' ? { _key: key(), ...x } : x)) : v);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const SKIP = new Set(['featuredArticleId', 'homeCitySlugs', 'ogImageUrl']); // references / images are set in Studio

const doc = (await client.fetch('*[_id == "settings"][0]')) || {};
const set = {};
for (const [k, v] of Object.entries(defaults)) {
  if (SKIP.has(k)) continue;
  if (k === 'seriesText') {
    for (const [sk, sv] of Object.entries(v)) if (empty(doc.seriesText?.[sk])) set[`seriesText.${sk}`] = sv;
    continue;
  }
  if (empty(doc[k])) { set[k] = withKeys(v); console.log(`fill     ${k}`); continue; }
  if (k in old && same(doc[k], old[k])) { set[k] = v; console.log(`reword   ${k}`); }
}
// How the Boss reviews, first item: reword only if it is still the old default
const h0 = doc.howIReview?.[0];
if (h0 && same({ title: h0.title, text: h0.text }, old['howIReview.0'])) {
  set['howIReview[0].title'] = defaults.howIReview[0].title; set['howIReview[0].text'] = defaults.howIReview[0].text; console.log('reword   howIReview[0]');
}
for (const k of Object.keys(set)) if (k.startsWith('seriesText.')) console.log(`fill     ${k}`);
if (!Object.keys(set).length) { console.log('Nothing to change: every field already has text.'); process.exit(0); }
if (dry) { console.log(`Dry run: ${Object.keys(set).length} field(s) would change.`); process.exit(0); }
await client.transaction().createIfNotExists({ _id: 'settings', _type: 'settings' }).patch('settings', (p) => p.set(set)).commit();
console.log(`Done: ${Object.keys(set).length} field(s) updated. The site rebuilds through the Sanity webhook.`);
