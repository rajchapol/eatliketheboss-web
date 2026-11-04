import rss from '@astrojs/rss';
import { SITE } from '../lib/config';
import { getArticles, articleUrl } from '../lib/content';

export async function GET(context) {
  // Feed readers expect newest published first (lists elsewhere are sorted by visit).
  const byPublished = [...(await getArticles('th'))].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  const items = byPublished.slice(0, 50).map((a) => ({
    title: a.title,
    link: articleUrl(a),
    pubDate: new Date(a.publishedAt),
    description: a.seoDescription || a.tagline || '',
  }));
  return rss({ title: SITE.name, description: SITE.description, site: context.site, items, customData: '<language>th</language>' });
}
