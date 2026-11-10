// One place that loads content. Uses the live Sanity project (ID is public, not a secret).
// Set SANITY_PROJECT_ID=sample to build from the sample content in src/data/seed.ts.
import { keepNamesTogether } from './thai-names';
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { toHTML } from '@portabletext/to-html';
import * as seed from '../data/seed';
import type { Article, City, Img, Settings } from './types';
import { AWARDS, DEFAULT_LOCALE, SERIES, SITE, cuisineOf, styleOf, localePrefix, type Locale } from './config';

const envId = import.meta.env.SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'ohviqc5c';
const projectId = envId === 'sample' ? '' : envId;
const dataset = import.meta.env.SANITY_DATASET || process.env.SANITY_DATASET || 'production';
export const usingSanity = Boolean(projectId);

const client = usingSanity
  ? createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false })
  : null;

const img = (i: any, fallbackAlt = ''): Img | undefined =>
  i?.asset?.url
    ? { url: i.asset.url, alt: i.alt || fallbackAlt, width: i.asset.metadata?.dimensions?.width, height: i.asset.metadata?.dimensions?.height,
        crop: i.crop || undefined, hotspot: i.hotspot || undefined }
    : undefined;

// Characters read per minute: Thai ~500, English ~1,000 (≈200 words), Japanese ~500, Chinese ~400.
const READ_RATE: Record<string, number> = { th: 500, en: 1000, ja: 500, zh: 400 };
const readMinutes = (html: string, dishes: { description: string }[], lang = 'th') => {
  const chars = html.replace(/<[^>]+>/g, '').length + dishes.reduce((n, d) => n + d.description.length, 0);
  return Math.max(2, Math.round(chars / (READ_RATE[lang] ?? 500)));
};

// The Facebook post opens a glasses-off dish with 🕶️ "จานนี้อร่อยจนบอสต้องขอถอดแว่นชิม"; the page already shows that line.
// Control characters pasted from Google Docs (vertical tab, zero-width space…) show as boxes; turn them into spaces.
const stripCtrl = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u200B\uFEFF]+/g, ' ');
/**
 * Article body as it reads on the site (10 Nov 2026):
 * - "**words**" left over from IG / Google Doc drafts → bold (17 articles showed the stars)
 * - the IG hand-over line ("🍽️ ศิลปะแห่งรสชาติในมื้อนี้:" — a short emoji-led line ending in ":") is dropped: the menu heading does that job
 */
const tidyBody = (html: string) => stripCtrl(html)
  .replace(/\*\*(?!\s)([^*<]{1,200}?)(?<!\s)\*\*/g, '<strong>$1</strong>')
  .replace(/\*\*/g, '') // an unpaired "**" left in a draft
  .replace(/<p>\s*(?:\p{Extended_Pictographic}|\uFE0F|\s)+[^<]{0,60}[:：]\s*<\/p>/gu, '');
const boldStars = (s: string) => s.replace(/\*\*(?!\s)([^*]{1,200}?)(?<!\s)\*\*/g, '$1');
const cleanDish = (s: string) => boldStars(stripCtrl(s)).replace(/^\s*(?:🕶️|🕶)?\s*["“]?จานนี้อร่อยจนบอสต้องขอถอดแว่นชิม["”]?\s*/u, '');

const IMG = `{..., asset->{url, metadata{dimensions}}}`;
const CITY = `{"slug": slug.current, nameEn, nameTh, country, region, motif, intro, featured, "pickIds": picks[]._ref, location, aliases, cover${IMG}}`;

let articlesCache: Promise<Article[]> | null = null;
let citiesCache: Promise<City[]> | null = null;

export function getCities(): Promise<City[]> {
  if (!client) return Promise.resolve(seed.cities);
  return (citiesCache ??= client
    .fetch(`*[_type=="city" && !(_id in path("drafts.**"))]${CITY} | order(nameEn asc)`)
    .then((rows: any[]) => {
      const out = rows.map((c) => ({ ...c, nameEn: (c.nameEn || '').trim(), nameTh: (c.nameTh || '').trim(), cover: img(c.cover, `ภาพเมือง ${c.nameEn}`) }));
      const seen = new Map<string, string>();
      out.forEach((c) => { const k = c.nameEn.toLowerCase(); if (seen.has(k)) console.warn(`[cities] "${c.nameEn}" twice: ${seen.get(k)} and ${c.slug} — merge them (Actions → Merge duplicate cities)`); else seen.set(k, c.slug); });
      return out;
    }));
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
/** Sort key from the Visit field ("Oct-2026"); articles without a visit use the publish date. */
const visitKey = (a: Article) => {
  const m = /^([A-Za-z]{3})-(\d{4})$/.exec(a.visit || '');
  const ym = m && MONTHS.includes(m[1].toLowerCase()) ? `${m[2]}-${String(MONTHS.indexOf(m[1].toLowerCase()) + 1).padStart(2, '0')}` : (a.publishedAt || '').slice(0, 7);
  return `${ym}|${a.publishedAt || ''}|${a.slug}`;
};
/**
 * Tasting Notes No. = order of the visit (oldest meal = No. 001), counted on the original (Thai) articles.
 * Translations share the number of their original. Lists come back newest visit first.
 */
function numberByVisit(all: Article[]): Article[] {
  const originals = all.filter((a) => a.id === a.baseId).sort((a, b) => visitKey(a).localeCompare(visitKey(b)));
  const noOf = new Map(originals.map((a, i) => [a.baseId, i + 1]));
  return all.map((a) => ({ ...a, no: noOf.get(a.baseId) ?? a.no ?? 0 })).sort((a, b) => b.no - a.no || a.language.localeCompare(b.language));
}

/**
 * Price band from a written price (Studio "ราคาจริง", not shown on the site): the first amount converted to THB
 * (rough rates; it's only a band) → under 3,000 = ฿฿, under 8,000 = ฿฿฿, else ฿฿฿฿.
 */
const THB_RATE: [RegExp, number][] = [
  [/HK\$|HKD/i, 4.4], [/S\$|SGD/i, 26], [/NT\$|TWD/i, 1.05], [/US\$|USD/i, 34], [/A\$|AUD/i, 22], [/MOP/i, 4.2],
  [/€|EUR/i, 37], [/£|GBP/i, 43], [/₩|KRW|วอน/i, 0.025], [/RM|MYR|ริงกิต/i, 7.5], [/CHF/i, 39], [/AED|ดิรฮัม/i, 9.3],
  [/JPY|เยน|円/i, 0.22], [/CNY|RMB|หยวน|元/i, 4.7], [/THB|บาท|฿/i, 1], [/\$/, 34],
];
export function priceBandFromBill(bill?: string): '฿฿' | '฿฿฿' | '฿฿฿฿' | undefined {
  if (!bill) return undefined;
  const m = bill.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/); if (!m) return undefined;
  const amount = Number(m[1]);
  let rate = THB_RATE.find(([re]) => re.test(bill))?.[1];
  if (/¥/.test(bill) && rate === undefined) rate = amount >= 5000 ? 0.22 : 4.7; // ¥: yen if large, else yuan
  const thb = amount * (rate ?? 1);
  return thb < 3000 ? '฿฿' : thb < 8000 ? '฿฿฿' : '฿฿฿฿';
}
/** The Boss's Bill band (and the cuisine category): chosen in Studio (Bill tab), else the older restaurant field, else worked out from the price. */
const withPriceBand = (a: Article): Article => {
  const band = a.billBand || a.restaurant?.priceBand || priceBandFromBill(a.bill);
  // cuisine = one of the broad English categories, style = optional detail (cuisineOf / styleOf in config.ts)
  // awards come as { award, year, note } (Studio) or old plain text; the site uses one label each, e.g. "Tatler Best 20 2026 (Taiwan)"
  const awards = a.restaurant?.awards?.map((x: any) => AWARDS.label(x)).filter(Boolean);
  const restaurant = a.restaurant ? { ...a.restaurant, cuisine: cuisineOf(a.restaurant.cuisine), style: styleOf(a.restaurant), awards: awards?.length ? awards : undefined, ...(band ? { priceBand: band } : {}) } : a.restaurant;
  return { ...a, billBand: band, restaurant };
};

/** All published articles in every language, newest visit first, numbered by visit order. */
export function getAllArticles(): Promise<Article[]> {
  // Sample content gets the same clean-up as Sanity content (stray control characters, repeated glasses-off quote).
  const tidy = (a: Article): Article => ({ ...a, bodyHtml: tidyBody(a.bodyHtml), dishes: a.dishes.map((d) => ({ ...d, name: stripCtrl(d.name), description: cleanDish(d.description || '') })) });
  if (!client) return Promise.resolve(keepNamesTogether(linkRestaurants(numberByVisit([...seed.articles].map(tidy).map(withPriceBand)))));
  return (articlesCache ??= client
    .fetch(
      `*[_type=="article" && defined(slug.current) && !(_id in path("drafts.**"))] | order(publishedAt desc){
        _id, language, series, no, episode, title, tagline, "slug": slug.current,
        "baseId": coalesce(translationOf._ref, _id),
        "city": city->${CITY},
        restaurant, cover${IMG}, gallery[]${IMG}, body, quote,
        dishes[]{name, description, glassesOff, image${IMG}},
        bill, billBand, tag, visit, hashtags, publishedAt, _updatedAt, seoTitle, seoDescription
      }`,
    )
    .then((rows: any[]) =>
      rows.map((r): Article => {
        const bodyHtml = r.body ? tidyBody(toHTML(r.body)) : '';
        const dishes = (r.dishes || []).map((d: any) => ({ name: stripCtrl(d.name || ''), description: cleanDish(d.description || ''), glassesOff: !!d.glassesOff, image: img(d.image, d.name) }));
        return {
          id: r._id, baseId: r.baseId, language: r.language || DEFAULT_LOCALE, series: r.series || 'review',
          no: r.no, slug: r.slug, title: r.title, tagline: r.tagline, city: r.city || undefined,
          restaurant: r.restaurant ? { ...r.restaurant, sameAs: r.restaurant.sameAs?._ref } : undefined, episode: r.episode, cover: img(r.cover, r.title), bodyHtml, quote: r.quote,
          gallery: (r.gallery || []).map((g: any) => ({ ...img(g, r.restaurant?.name || r.title), caption: g.caption || undefined })).filter((g: any) => g.url),
          dishes, bill: r.bill, billBand: r.billBand || undefined, tag: r.tag || undefined, visit: r.visit, hashtags: r.hashtags || [],
          publishedAt: r.publishedAt, updatedAt: r._updatedAt, seoTitle: r.seoTitle, seoDescription: r.seoDescription,
          readingMinutes: readMinutes(bodyHtml, dishes, r.language || DEFAULT_LOCALE),
        };
      }),
    )
    .then((list: Article[]) => list.map(withPriceBand))
    .then(numberByVisit)
    .then(linkRestaurants)
    .then(keepNamesTogether));
}

export async function getArticles(lang: Locale = DEFAULT_LOCALE) {
  return (await getAllArticles()).filter((a) => a.language === lang);
}

async function loadSettings(): Promise<Settings> {
  const base = seed.settings as Settings;
  if (!client) return base;
  const s = await client.fetch(`*[_type=="settings"][0]{..., "featuredArticleId": featuredArticle._ref, "ogImageUrl": ogImage.asset->url, "homeCitySlugs": homeCities[]->slug.current}`);
  // Empty fields in Sanity fall back to the defaults in src/data/settings.json.
  const clean = Object.fromEntries(Object.entries(s || {}).filter(([, v]) => v !== null && v !== '' && !(Array.isArray(v) && !v.length)));
  return { ...base, ...clean, seriesText: { ...base.seriesText, ...(clean.seriesText || {}) } } as Settings;
}
// Loaded once per build; also pushes site-wide values (description, socials) into SITE.
const settingsLoaded = await loadSettings();
Object.assign(SITE, {
  tagline: settingsLoaded.tagline, description: settingsLoaded.siteDescription,
  facebook: settingsLoaded.facebook, instagram: settingsLoaded.instagram, contactEmail: settingsLoaded.contactEmail,
});
export async function getSettings(): Promise<Settings> { return settingsLoaded; }

/** Public URL of an article, e.g. /review/tokyo/sezanne/ or /en/review/tokyo/sezanne/ */
export function articleUrl(a: Pick<Article, 'series' | 'slug' | 'city' | 'language'>) {
  const base = SERIES[a.series].path;
  const mid = a.series === 'review' && a.city ? `${a.city.slug}/` : '';
  return `${localePrefix(a.language)}/${base}/${mid}${a.slug}/`;
}

/** Translations of the same article, keyed by language. */
export async function translationsOf(a: Article) {
  return (await getAllArticles()).filter((x) => x.baseId === a.baseId);
}

/**
 * Image URL at a given width (Sanity CDN), or the url as-is for other hosts.
 * With a height, the crop follows the crop + hotspot set in Studio instead of the centre.
 */
export function imgUrl(i: Img | undefined, w: number, h?: number) {
  if (!i?.url) return undefined;
  const m = /^https:\/\/cdn\.sanity\.io\/images\/([^/]+)\/([^/]+)\//.exec(i.url);
  if (!m) return i.url;
  try {
    let b = createImageUrlBuilder({ projectId: m[1], dataset: m[2] })
      .image({ asset: { url: i.url }, crop: i.crop, hotspot: i.hotspot } as any)
      .width(w).auto('format').quality(80);
    if (h) b = b.height(h);
    return b.url();
  } catch {
    return `${i.url}?w=${w}${h ? `&h=${h}&fit=crop` : ''}&auto=format&q=80`; // URL without dimensions: centre crop
  }
}
/**
 * Frame for a photo inside an article, from the photo itself (the Boss, 10 Nov 2026): landscape 3:2 (or 4:3 when shot
 * that way), portrait 4:5. Covers, cards and share images stay 3:2. `r` = height ÷ width for imgUrl/srcset.
 */
export function photoFrame(i: Img | undefined): { ar: '3/2' | '4/3' | '4/5'; r: number; portrait: boolean } {
  const w = (i?.width || 3) * (1 - (i?.crop?.left || 0) - (i?.crop?.right || 0));
  const h = (i?.height || 2) * (1 - (i?.crop?.top || 0) - (i?.crop?.bottom || 0));
  const x = w / h;
  if (x < 1) return { ar: '4/5', r: 1.25, portrait: true };
  if (x < 1.42) return { ar: '4/3', r: 0.75, portrait: false };
  return { ar: '3/2', r: 0.6667, portrait: false };
}
/** The whole photo, uncropped, for the full-screen viewer. */
export const fullUrl = (i: Img | undefined, w = 2000) => (i?.url ? (i.url.includes('cdn.sanity.io') ? `${i.url}?w=${w}&fit=max&auto=format&q=82` : i.url) : undefined);

export function srcset(i: Img | undefined, widths: number[], ratio?: number) {
  if (!i?.url || !i.url.includes('cdn.sanity.io')) return undefined;
  return widths.map((w) => `${imgUrl(i, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(', ');
}

/** Every glasses-off dish with its article and position (index) in that meal. */
export const glassesOffDishes = (list: Article[]) =>
  list.flatMap((a) => a.dishes.flatMap((d, index) => (d.glassesOff ? [{ dish: d, article: a, index }] : [])));

/** Link straight to one dish inside its article, e.g. /review/tokyo/x/#dish-3 */
export const dishUrl = (a: Article, index: number) => `${articleUrl(a)}#dish-${index + 1}`;

/** "Oct-2026" → "2026-10" (for <time datetime>); falls back to the publish month. */
export function visitIso(a: Pick<Article, 'visit' | 'publishedAt'>) {
  const m = /^([A-Za-z]{3})-(\d{4})$/.exec(a.visit || '');
  const i = m ? MONTHS.indexOf(m[1].toLowerCase()) : -1;
  return i >= 0 ? `${m![2]}-${String(i + 1).padStart(2, '0')}` : (a.publishedAt || '').slice(0, 7);
}
/** Year of the meal (visit), e.g. "2026" — awards are grouped by when the Boss ate the dish. */
export const visitYear = (a: Pick<Article, 'visit' | 'publishedAt'>) => visitIso(a).slice(0, 4);

/** Cities that have at least one review, most restaurants first (ties by name). */
export async function citiesByCount() {
  const reviews = (await getArticles(DEFAULT_LOCALE)).filter((a) => a.series === 'review');
  const n = (slug: string) => groupByRestaurant(reviews.filter((a) => a.city?.slug === slug)).length;
  return (await getCities()).map((c) => ({ city: c, count: n(c.slug) })).filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count || a.city.nameEn.localeCompare(b.city.nameEn));
}

/** Visit month as written ("Oct-2026"), or the publish month in the same style. */
export function visitLabel(a: Pick<Article, 'visit' | 'publishedAt'>) {
  if (a.visit) return a.visit;
  const [y, m] = (a.publishedAt || '').split('-');
  if (!y || !m) return '';
  const mon = MONTHS[Number(m) - 1] ?? '';
  return `${mon.charAt(0).toUpperCase()}${mon.slice(1)}-${y}`; // same "Sep-2026" style as Visit (no locale "Sept")
}

/**
 * Same restaurant = same city + same restaurant name (case, spaces and punctuation ignored).
 * Keep the restaurant name identical across visits so repeat reviews group together.
 */
export function restaurantKey(a: Article) {
  if (a.restaurantGroup) return a.restaurantGroup;
  return nameKey(a);
}
function nameKey(a: Article) {
  if (a.series !== 'review' || !a.restaurant?.name) return `article:${a.baseId}`;
  return `${a.city?.slug ?? ''}|${a.restaurant.name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')}`;
}
/**
 * Groups visits to one restaurant: same city + name, or linked in Studio with
 * ร้าน → "รีวิวครั้งก่อนของร้านนี้" (for a renamed restaurant). Translations follow their original.
 */
function linkRestaurants(all: Article[]): Article[] {
  const parent = new Map<string, string>();
  const find = (x: string): string => { while (parent.has(x) && parent.get(x) !== x) x = parent.get(x)!; return x; };
  const union = (a: string, b: string) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(rb, ra); };
  const byName = new Map<string, string>();
  const originals = all.filter((a) => a.id === a.baseId);
  for (const a of originals) {
    parent.set(a.baseId, find(a.baseId));
    const k = nameKey(a);
    if (byName.has(k)) union(byName.get(k)!, a.baseId); else byName.set(k, a.baseId);
  }
  const ids = new Set(originals.map((a) => a.baseId));
  for (const a of originals) if (a.restaurant?.sameAs && ids.has(a.restaurant.sameAs)) union(a.restaurant.sameAs, a.baseId);
  return all.map((a) => ({ ...a, restaurantGroup: a.series === 'review' ? `r:${find(a.baseId)}` : `article:${a.baseId}` }));
}
/** All visits to the same restaurant in the given list (newest visit first, as the list is sorted). */
export function visitsOf(a: Article, list: Article[]) {
  const k = restaurantKey(a);
  return list.filter((x) => x.language === a.language && restaurantKey(x) === k);
}
/** URL part for a restaurant: its name in latin letters (from the oldest visit, so it stays put), else that visit's slug. */
function restaurantSlug(visits: Article[]) {
  const first = visits[visits.length - 1];
  const s = (first.restaurant?.name ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return s.length >= 2 ? s : first.slug;
}
/**
 * Time capsule page for a restaurant the Boss reviewed 2+ times (Thai only): /restaurant/<city>/<name>/.
 * `visits` newest first. Returns undefined for a single visit (the review itself is the page).
 */
export function capsuleUrl(visits: Article[]) {
  if (visits.length < 2 || visits[0].language !== DEFAULT_LOCALE || visits[0].series !== 'review') return undefined;
  return `/restaurant/${visits[0].city?.slug ?? 'other'}/${restaurantSlug(visits)}/`;
}
/** Dishes served on 2+ visits (names compared without case, spaces or brackets), with the visits they appear in. */
export function returningDishes(visits: Article[]) {
  const key = (n: string) => n.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
  const map = new Map<string, { name: string; visits: Article[] }>();
  for (const v of [...visits].reverse()) for (const d of v.dishes) {
    const k = key(d.name); if (!k) continue;
    const e = map.get(k) ?? { name: d.name, visits: [] };
    if (!e.visits.includes(v)) e.visits.push(v);
    map.set(k, e);
  }
  return [...map.values()].filter((e) => e.visits.length > 1);
}

/** One entry per restaurant: the latest visit plus every visit (newest first). Keeps list order. */
export function groupByRestaurant(list: Article[]) {
  const map = new Map<string, Article[]>();
  for (const a of list) { const k = restaurantKey(a); map.set(k, [...(map.get(k) ?? []), a]); }
  return [...map.values()].map((visits) => ({ latest: visits[0], visits }));
}

/** Boss's Picks for a city: the ones chosen in Studio, else reviews with a glasses-off dish (newest first). */
export function cityPicks(city: City, list: Article[], max = 3) {
  const chosen = (city.pickIds ?? []).map((id) => list.find((a) => a.id === id || a.baseId === id)).filter(Boolean) as Article[];
  if (chosen.length) return chosen.slice(0, max);
  return groupByRestaurant(list).filter((g) => g.visits.some((a) => a.dishes.some((d) => d.glassesOff))).map((g) => g.latest).slice(0, max);
}
