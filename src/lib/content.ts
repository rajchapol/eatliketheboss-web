// One place that loads content. Uses the live Sanity project (ID is public, not a secret).
// Set SANITY_PROJECT_ID=sample to build from the sample content in src/data/seed.ts.
import { createClient } from '@sanity/client';
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
    ? { url: i.asset.url, alt: i.alt || fallbackAlt, width: i.asset.metadata?.dimensions?.width, height: i.asset.metadata?.dimensions?.height }
    : undefined;

const readMinutes = (html: string, dishes: { description: string }[]) => {
  const chars = html.replace(/<[^>]+>/g, '').length + dishes.reduce((n, d) => n + d.description.length, 0);
  return Math.max(2, Math.round(chars / 500)); // Thai reads ~500 characters a minute
};

const IMG = `{..., asset->{url, metadata{dimensions}}}`;
const CITY = `{"slug": slug.current, nameEn, nameTh, country, region, motif, intro, featured, cover${IMG}}`;

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
        const dishes = (r.dishes || []).map((d: any) => ({ name: d.name, description: d.description || '', glassesOff: !!d.glassesOff, image: img(d.image, d.name) }));
        return {
          id: r._id, baseId: r.baseId, language: r.language || DEFAULT_LOCALE, series: r.series || 'review',
          no: r.no, slug: r.slug, title: r.title, tagline: r.tagline, city: r.city || undefined,
          restaurant: r.restaurant, episode: r.episode, cover: img(r.cover, r.title), bodyHtml, quote: r.quote,
          dishes, bill: r.bill, tag: r.tag, visit: r.visit, hashtags: r.hashtags || [],
          publishedAt: r.publishedAt, updatedAt: r._updatedAt, seoTitle: r.seoTitle, seoDescription: r.seoDescription,
          readingMinutes: readMinutes(bodyHtml, dishes),
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

/** Image URL at a given width (Sanity CDN), or the url as-is for other hosts. */
export function imgUrl(i: Img | undefined, w: number, h?: number) {
  if (!i?.url) return undefined;
  if (!i.url.includes('cdn.sanity.io')) return i.url;
  return `${i.url}?w=${w}${h ? `&h=${h}&fit=crop` : ''}&auto=format&q=80`;
}
export function srcset(i: Img | undefined, widths: number[], ratio?: number) {
  if (!i?.url || !i.url.includes('cdn.sanity.io')) return undefined;
  return widths.map((w) => `${imgUrl(i, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(', ');
}

export const glassesOffDishes = (list: Article[]) =>
  list.flatMap((a) => a.dishes.filter((d) => d.glassesOff).map((d) => ({ dish: d, article: a })));
