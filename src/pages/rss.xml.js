import rss from '@astrojs/rss';
import { SITE } from '../lib/config';
import { getArticles, articleUrl } from '../lib/content';

export async function GET(context) {
  const items = (await getArticles('th')).slice(0, 50).map((a) => ({
    title: a.title,
    link: articleUrl(a),
    pubDate: new Date(a.publishedAt),
    description: a.seoDescription || a.tagline || '',
  }));
  return rss({ title: SITE.name, description: SITE.description, site: context.site, items, customData: '<language>th</language>' });
}
