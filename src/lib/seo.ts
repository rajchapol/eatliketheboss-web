// JSON-LD builders. No reviewRating anywhere: the brand gives no stars or scores.
import { SITE, HREFLANG } from './config';
import { articleUrl, imgUrl } from './content';
import type { Article } from './types';

const abs = (p: string) => new URL(p, SITE.url).href;

// Names people (and AI assistants) use for the brand: keep them all here so search engines and answer
// engines connect "บอสพาชิม", "Eat Like The Boss" and the site (the Boss, 16 Nov 2026).
export const BRAND_NAMES = ['บอสพาชิม', 'Eat Like The Boss', 'Eat Like the BOSS', 'EatLikeTheBoss', 'บอสพาชิม Eat Like The Boss', 'eatlikeboss.com'];
const KNOWS = ['Fine dining', 'Restaurant reviews', 'Michelin Guide restaurants', 'Omakase', 'Kaiseki', 'Thai cuisine', 'Japanese cuisine', 'French cuisine', 'Food history', 'Wine and spirits', 'Hospitality', 'Food & beverage'];

export const person = () => ({
  '@type': 'Person',
  '@id': abs('/about/#boss'),
  name: 'บอส (The Boss)',
  alternateName: ['บอส บอสพาชิม', 'The Boss — Eat Like The Boss', 'บอสพาชิม'],
  jobTitle: 'Fine dining reviewer',
  url: abs('/about/'),
  image: abs('/img/brand/logo-th/profile-th-teal-gold.svg'),
  description: 'บอส ผู้เขียนเพจ บอสพาชิม (Eat Like The Boss) รีวิวร้านอาหาร Fine Dining ตั้งแต่ปี 2017 อยู่ในวงการ Hospitality และ F&B มากว่า 15 ปี · Fine dining reviewer since 2017, 15+ years in hospitality and F&B, Tatler Best Asia-Pacific panelist & more.',
  knowsAbout: KNOWS,
  knowsLanguage: ['th', 'en'],
  worksFor: { '@id': abs('/#org') },
  sameAs: [SITE.facebook, SITE.instagram],
});

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': abs('/#org'),
  name: SITE.shortName,
  alternateName: BRAND_NAMES.filter((n) => n !== SITE.shortName),
  url: SITE.url,
  logo: abs('/img/logo-2026.png'),
  image: abs('/img/og-default.jpg'),
  description: 'บอสพาชิม (Eat Like The Boss) — รีวิวร้านอาหาร Fine Dining แบบจริงใจและเจาะลึก ทั้งในไทยและทั่วโลก ไม่มีดาว ไม่มีคะแนน มีแต่ความเห็นตรงๆ และจานถอดแว่นชิม · Honest, in-depth fine dining reviews from Thailand and around the world, without stars or scores.',
  foundingDate: '2017',
  founder: { '@id': abs('/about/#boss') },
  knowsAbout: KNOWS,
  areaServed: 'Worldwide',
  sameAs: [SITE.facebook, SITE.instagram],
});

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': abs('/#website'),
  name: SITE.name,
  alternateName: BRAND_NAMES,
  url: SITE.url,
  description: SITE.description,
  inLanguage: ['th', 'en', 'ja', 'zh-Hans'],
  publisher: { '@id': abs('/#org') },
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: abs('/restaurants/?q={search_term_string}') }, 'query-input': 'required name=search_term_string' },
});

/** FAQ shown on the About page; the same text goes into FAQPage JSON-LD (must match what is visible). */
export const faqLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
});

export const breadcrumbs = (items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.href) })),
});

export function articleLd(a: Article) {
  const url = abs(articleUrl(a));
  // Photos carry credit and copyright (shown by Google Images); the article names its copyright holder.
  const photo = (url: string) => ({ '@type': 'ImageObject', url, creditText: 'Eat Like The Boss (บอสพาชิม)', copyrightNotice: '© Eat Like The Boss. All rights reserved.', creator: { '@id': abs('/about/#boss') }, acquireLicensePage: abs('/about/#work') });
  const image = a.cover ? [photo(imgUrl(a.cover, 1600)!)] : [abs('/img/og-default.jpg')];
  const base = {
    '@context': 'https://schema.org',
    headline: a.title,
    image,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt || a.publishedAt,
    inLanguage: HREFLANG[a.language],
    author: person(),
    copyrightHolder: { '@id': abs('/#org') },
    copyrightYear: Number((a.publishedAt || '').slice(0, 4)) || undefined,
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
        servesCuisine: a.restaurant.style ? [a.restaurant.cuisine, a.restaurant.style] : a.restaurant.cuisine,
        priceRange: a.restaurant.priceBand,
        address: a.city ? { '@type': 'PostalAddress', addressLocality: a.city.nameEn, streetAddress: a.restaurant.area } : undefined,
        award: a.restaurant.awards,
      },
    };
  }
  return { ...base, '@type': 'Article' };
}
