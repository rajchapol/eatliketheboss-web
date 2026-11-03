// JSON-LD builders. No reviewRating anywhere: the brand gives no stars or scores.
import { SITE } from './config';
import { articleUrl, imgUrl } from './content';
import type { Article } from './types';

const abs = (p: string) => new URL(p, SITE.url).href;

export const person = () => ({
  '@type': 'Person',
  '@id': abs('/about/#boss'),
  name: 'บอส',
  alternateName: 'The Boss — Eat Like The Boss',
  url: abs('/about/'),
  description: 'Fine dining reviewer since 2017. 15+ years in hospitality and F&B. Tatler Best Asia-Pacific panelist & more.',
  sameAs: [SITE.facebook, SITE.instagram],
});

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': abs('/#org'),
  name: SITE.shortName,
  alternateName: 'บอสพาชิม',
  url: SITE.url,
  logo: abs('/img/logo-gold.png'),
  sameAs: [SITE.facebook, SITE.instagram],
});

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  inLanguage: ['th', 'en', 'ja', 'zh-Hans'],
  publisher: { '@id': abs('/#org') },
});

export const breadcrumbs = (items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.href) })),
});

export function articleLd(a: Article) {
  const url = abs(articleUrl(a));
  const image = a.cover ? [imgUrl(a.cover, 1600)] : [abs('/img/og-default.png')];
  const base = {
    '@context': 'https://schema.org',
    headline: a.title,
    image,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt || a.publishedAt,
    inLanguage: a.language,
    author: person(),
    publisher: { '@id': abs('/#org') },
    mainEntityOfPage: url,
  };
  if (a.series === 'review' && a.restaurant) {
    return {
      ...base,
      '@type': 'Review',
      name: a.title,
      reviewBody: a.seoDescription || a.tagline,
      itemReviewed: {
        '@type': 'Restaurant',
        name: a.restaurant.name,
        servesCuisine: a.restaurant.cuisine,
        priceRange: a.restaurant.priceBand,
        address: a.city ? { '@type': 'PostalAddress', addressLocality: a.city.nameEn, streetAddress: a.restaurant.area } : undefined,
        award: a.restaurant.awards,
      },
    };
  }
  return { ...base, '@type': 'Article' };
}
