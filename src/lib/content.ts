// One place that loads content. Uses the live Sanity project (ID is public, not a secret).
// Set SANITY_PROJECT_ID=sample to build from the sample content in src/data/seed.ts.
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { toHTML } from '@portabletext/to-html';
import * as seed from '../data/seed';
import type { Article, City, Img, Settings } from './types';
import { DEFAULT_LOCALE, SERIES, SITE, localePrefix, type Locale } from './config';

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
const cleanDish = (s: string) => s.replace(/^\s*(?:🕶️|🕶)?\s*["“]?จานนี้อร่อยจนบอสต้องขอถอดแว่นชิม["”]?\s*/u, '');

const IMG = `{..., asset->{url, metadata{dimensions}}}`;
const CITY = `{"slug": slug.current, nameEn, nameTh, country, region, motif, intro, featured, "pickIds": picks[]._ref, cover${IMG}}`;

let articlesCache: Promise<Article[]> | null = null;
let citiesCache: Promise<City[]> | null = null;

export function getCities(): Promise<City[]> {
  if (!client) return Promise.resolve(seed.cities);
  return (citiesCache ??= client
    .fetch(`*[_type=="city" && !(_id in path("drafts.**"))]${CITY} | order(nameEn asc)`)
    .then((rows: any[]) => rows.map((c) => ({ ...c, cover: img(c.cover, `ภาพเมือง ${c.nameEn}`) }))));
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

/** All published articles in every language, newest visit first, numbered by visit order. */
export function getAllArticles(): Promise<Article[]> {
  if (!client) return Promise.resolve(numberByVisit([...seed.articles]));
  return (articlesCache ??= client
    .fetch(
      `*[_type=="article" && defined(slug.current) && !(_id in path("drafts.**"))] | order(publishedAt desc){
        _id, language, series, no, episode, title, tagline, "slug": slug.current,
        "baseId": coalesce(translationOf._ref, _id),
        "city": city->${CITY},
        restaurant, cover${IMG}, body, quote,
        dishes[]{name, description, glassesOff, image${IMG}},
        bill, tag, visit, hashtags, publishedAt, _updatedAt, seoTitle, seoDescription
      }`,
    )
    .then((rows: any[]) =>
      rows.map((r): Article => {
        const bodyHtml = r.body ? toHTML(r.body) : '';
        const dishes = (r.dishes || []).map((d: any) => ({ name: d.name, description: cleanDish(d.description || ''), glassesOff: !!d.glassesOff, image: img(d.image, d.name) }));
        return {
          id: r._id, baseId: r.baseId, language: r.language || DEFAULT_LOCALE, series: r.series || 'review',
          no: r.no, slug: r.slug, title: r.title, tagline: r.tagline, city: r.city || undefined,
          restaurant: r.restaurant, episode: r.episode, cover: img(r.cover, r.title), bodyHtml, quote: r.quote,
          dishes, bill: r.bill, tag: r.tag, visit: r.visit, hashtags: r.hashtags || [],
          publishedAt: r.publishedAt, updatedAt: r._updatedAt, seoTitle: r.seoTitle, seoDescription: r.seoDescription,
          readingMinutes: readMinutes(bodyHtml, dishes, r.language || DEFAULT_LOCALE),
        };
      }),
    )
    .then(numberByVisit));
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
/** Visit month as written ("Oct-2026"), or the publish month in the same style. */
export function visitLabel(a: Pick<Article, 'visit' | 'publishedAt'>) {
  if (a.visit) return a.visit;
  return a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).replace(' ', '-') : '';
}

/**
 * Same restaurant = same city + same restaurant name (case, spaces and punctuation ignored).
 * Keep the restaurant name identical across visits so repeat reviews group together.
 */
export function restaurantKey(a: Article) {
  if (a.series !== 'review' || !a.restaurant?.name) return `article:${a.baseId}`;
  return `${a.city?.slug ?? ''}|${a.restaurant.name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')}`;
}
/** All visits to the same restaurant in the given list (newest visit first, as the list is sorted). */
export function visitsOf(a: Article, list: Article[]) {
  const k = restaurantKey(a);
  return list.filter((x) => x.language === a.language && restaurantKey(x) === k);
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
  return groupByRestaurant(list.filter((a) => a.dishes.some((d) => d.glassesOff))).map((g) => g.latest).slice(0, max);
}
