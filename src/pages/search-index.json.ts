// /search-index.json — full text of every Thai article for the "พบในเนื้อหาบทความ" search on /restaurants/
// (the Boss, 26 Nov 2026). Plain substring matching in the browser: exact for Thai (no word-splitting guesses),
// loaded only when a reader types in the search box. Pagefind was tried first: its Thai word splitting
// matched "อูนิ" to unrelated words and found nothing for "ทรัฟเฟิล".
import { getArticles, articleUrl, numLabel } from '../lib/content';
import { SERIES } from '../lib/config';

const strip = (h?: string) => (h ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

export async function GET() {
  const all = await getArticles('th');
  const docs = all.map((a) => ({
    u: articleUrl(a),
    n: a.restaurant?.name ?? a.title,
    l: [numLabel(a), a.city?.nameEn, SERIES[a.series]?.th].filter(Boolean).join(' · '),
    // title + tagline + chef/restaurant info + body + every dish (name and description)
    t: [a.title, a.tagline, a.restaurant?.originalName, strip(a.bodyHtml), ...a.dishes.map((d) => `${d.name}. ${strip(d.descriptionHtml ?? d.description)}`)].filter(Boolean).join(' · '),
  }));
  return new Response(JSON.stringify(docs), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
