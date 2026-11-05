#!/usr/bin/env node
// One-off: fill the city "fact" field (Studio → City → City fact, field `intro`) with one short, true and slightly odd
// fact per city, in English (the Boss, 5 Nov 2026). Only fills an empty field (or a "[placeholder]"): never overwrites
// what the Boss wrote. Safe to run again.
//   node scripts/set-city-intros.mjs [--dry]
// Manual workflow: Actions → Set city facts → Run workflow (dry first). Needs SANITY_WRITE_TOKEN (not for --dry).
import { createClient } from '@sanity/client';

const dry = process.argv.includes('--dry');
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && !token) { console.error('Missing SANITY_WRITE_TOKEN'); process.exit(1); }
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID || 'ohviqc5c', dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', token, useCdn: false });

// City (slug or English name, letters only, lower case) → fact.
const FACTS = {
  tokyo: 'At the 2019 New Year auction in Tokyo, a single bluefin tuna sold for ¥333.6 million, about US$3 million.',
  kyoto: 'Kyoto was on the shortlist of atomic-bomb targets in 1945. US Secretary of War Henry Stimson, who had visited the city and admired its temples, had it taken off.',
  osaka: 'Osaka was once called "the nation\'s kitchen", and its motto is kuidaore: eat until you drop, or until you go broke.',
  sapporo: 'Sapporo is laid out on a grid counted from one point in the city centre, so an address like "North 1, West 3" works like a map coordinate.',
  shanghai: 'Shanghai runs the world\'s first commercial high-speed maglev: it floats the 30 km to Pudong Airport in about eight minutes.',
  hangzhou: 'Legend says Emperor Qianlong named 18 Longjing tea bushes at the foot of Lion Peak "imperial". They still grow there today.',
  hongkong: 'Hong Kong\'s Central–Mid-Levels escalator is the longest outdoor covered escalator system in the world: about 800 m, running downhill in the morning and uphill the rest of the day.',
  taipei: 'In Taipei, rubbish trucks play Beethoven\'s Für Elise or A Maiden\'s Prayer, and neighbours come out to meet them with their bags. There are almost no street bins.',
  taichung: 'Taichung\'s Chun Shui Tang teahouse says it was the first to drop tapioca pearls into iced milk tea, in the 1980s. Bubble tea took over the world from there.',
  singapore: 'In 2016 a Singapore hawker stall selling soya sauce chicken rice for about S$2 won a MICHELIN star. Its hawker culture is on UNESCO\'s heritage list.',
  oslo: 'In a forest outside Oslo, 1,000 trees planted in 2014 will become the paper for the Future Library: 100 sealed manuscripts that no one may read until 2114.',
  helsinki: 'Finland has around three million saunas for 5.5 million people. In Helsinki there is even one inside a Burger King, and one in a gondola of the SkyWheel.',
  copenhagen: 'In Copenhagen a Danish pastry is called wienerbrød, "Vienna bread": Austrian bakers brought the recipe when Danish bakers went on strike in 1850.',
  istanbul: 'Istanbul sits on two continents. You can have breakfast in Europe and lunch in Asia, with the Bosphorus in between.',
  madrid: 'Madrid\'s Sobrino de Botín is the oldest restaurant in the world according to Guinness World Records. Its wood oven has been lit since 1725.',
  barcelona: 'Construction of the Sagrada Família began in 1882, but it only got an official building permit in 2019.',
  bangkok: 'Bangkok\'s full ceremonial name is 168 letters long, the longest place name in the world according to Guinness World Records.',
  chiangmai: 'Chiang Mai\'s old city is an almost perfect square, its moat dug when King Mangrai founded the city in 1296.',
  phuket: 'Every ninth lunar month, Phuket\'s Peranakan Chinese community gives up meat for nine days for the Vegetarian Festival, with street processions that go on for days.',
};
const key = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');
const empty = (v) => !v || !String(v).trim() || String(v).trim().startsWith('[');

const cities = await client.fetch('*[_type == "city" && !(_id in path("drafts.**"))]{_id, nameEn, "slug": slug.current, intro} | order(nameEn asc)');
const todo = [];
for (const c of cities) {
  const fact = FACTS[key(c.slug)] || FACTS[key(c.nameEn)] || FACTS[key(String(c.slug).split('-').slice(1).join(''))];
  if (!fact) { console.log(`${c.nameEn}: no fact written yet (add one to FACTS)`); continue; }
  if (!empty(c.intro)) { console.log(`${c.nameEn}: kept (already has text)`); continue; }
  todo.push({ c, fact });
  console.log(`${c.nameEn}: ${fact}`);
}
if (dry) { console.log(`Dry run: ${todo.length} city/cities would get a fact.`); process.exit(0); }
if (!todo.length) { console.log('Nothing to change.'); process.exit(0); }
const tx = client.transaction();
todo.forEach(({ c, fact }) => tx.patch(c._id, (p) => p.set({ intro: fact })));
await tx.commit();
console.log(`Done: ${todo.length} city/cities updated. The site rebuilds via the Sanity webhook.`);
