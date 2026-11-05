#!/usr/bin/env node
// Prints the Lighthouse CI scores as a Markdown table (for the GitHub job summary). Reads .lighthouseci/manifest.json.
import { readFileSync } from 'node:fs';
const runs = JSON.parse(readFileSync('.lighthouseci/manifest.json', 'utf8'));
const pct = (x) => (x == null ? '—' : Math.round(x * 100));
const mark = (x, floor) => (x == null ? '' : x < floor ? ' ⚠️' : '');
console.log('### Lighthouse (phone profile)\n');
console.log('| Page | Performance | Accessibility | Best practices | SEO |');
console.log('| --- | ---: | ---: | ---: | ---: |');
for (const r of runs) {
  const s = r.summary, path = new URL(r.url).pathname;
  console.log(`| \`${path}\` | ${pct(s.performance)}${mark(s.performance, 0.8)} | ${pct(s.accessibility)}${mark(s.accessibility, 0.9)} | ${pct(s['best-practices'])}${mark(s['best-practices'], 0.9)} | ${pct(s.seo)}${mark(s.seo, 0.9)} |`);
}
console.log('\n⚠️ = below the comfort line (performance 80, others 90). The check fails only below performance 60 / accessibility 90 / SEO 90.');
