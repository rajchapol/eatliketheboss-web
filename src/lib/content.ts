// One place that loads content. Uses the live Sanity project (ID is public, not a secret).
// Set SANITY_PROJECT_ID=sample to build from the sample content in src/data/seed.ts.
import { createClient } from '@sanity/client';
import { toHTML } from '@portabletext/to-html';
import * as seed from '../data/seed';
import type { Article, City, Img, Settings } from './types';
import { DEFAULT_LOCALE, SERIES, localePrefix, type Locale } from './config';

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
  return (citiesCache ??= client.fetch(`*[_type=="city" && !(_id in path("drafts.**"))]${CITY} | order(nameEn asc)`));
}

/** All published articles in every language, newest first. */
export function getAllArticles(): Promise<Article[]> {
  if (!client) return Promise.resolve([...seed.articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)));
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
    ));
}

export async function getArticles(lang: Locale = DEFAULT_LOCALE) {
  return (await getAllArticles()).filter((a) => a.language === lang);
}

export async function getSettings(): Promise<Settings> {
  if (!client) return seed.settings;
  const s = await client.fetch(`*[_type=="settings"][0]`);
  return { ...seed.settings, ...(s || {}) };
}

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
  if (!i) return undefined;
  if (!i.url.includes('cdn.sanity.io')) return i.url;
  return `${i.url}?w=${w}${h ? `&h=${h}&fit=crop` : ''}&auto=format&q=80`;
}
export function srcset(i: Img | undefined, widths: number[], ratio?: number) {
  if (!i || !i.url.includes('cdn.sanity.io')) return undefined;
  return widths.map((w) => `${imgUrl(i, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(', ');
}

export const glassesOffDishes = (list: Article[]) =>
  list.flatMap((a) => a.dishes.filter((d) => d.glassesOff).map((d) => ({ dish: d, article: a })));
