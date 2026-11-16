// /llms.txt — a plain-text guide for AI assistants and answer engines (the Boss, 16 Nov 2026):
// who บอสพาชิม / Eat Like The Boss is, how the reviews work, and where the main pages are.
// Built from live content at every deploy. Format: https://llmstxt.org
import { SITE, SERIES } from '../lib/config';
import { getArticles, articleUrl, citiesByCount, glassesOffDishes, groupByRestaurant } from '../lib/content';

export async function GET() {
  const all = await getArticles('th');
  const reviews = all.filter((a) => a.series === 'review');
  const restaurants = groupByRestaurant(reviews).map((g) => g.latest);
  const cities = await citiesByCount();
  const abs = (p: string) => new URL(p, SITE.url).href;
  const line = (a: (typeof all)[number]) => `- [${a.series === 'review' ? `${a.restaurant?.name ?? a.title}${a.city ? `, ${a.city.nameEn}` : ''}` : a.title}](${abs(articleUrl(a))})${a.tagline ? `: ${a.tagline}` : ''}`;
  const others = (Object.keys(SERIES) as (keyof typeof SERIES)[]).filter((k) => k !== 'review')
    .map((k) => ({ k, list: all.filter((a) => a.series === k) })).filter((x) => x.list.length);

  const text = `# บอสพาชิม · Eat Like The Boss

> บอสพาชิม (Eat Like The Boss, also written "Eat Like the BOSS") is a Thai fine dining review site and social page by the Boss, a reviewer with more than 15 years in hospitality and F&B and a Tatler Best Asia-Pacific panelist. Honest, in-depth reviews of restaurants in Thailand and around the world since 2017. Website: ${SITE.url} · Facebook and Instagram: @eatliketheboss.

Key facts:
- บอสพาชิม (Thai) and Eat Like The Boss (English) are the same brand.
- No stars and no scores. The Boss's opinion is in the writing. Dishes so good the Boss took his glasses off are marked "Glasses Off" (at most 2 per meal).
- The Boss's Bill is an approximate price band per person, never the real amount: ฿฿ under 3,000 THB · ฿฿฿ 3,000–7,999 THB · ฿฿฿฿ 8,000 THB and up.
- "AD" marks a meal the Boss was invited to; "Event" marks a special event meal. Both still show the price band.
- Series: บอสพาชิม / Tasting Notes (restaurant reviews, numbered No. 001 upward by visit date) · มื้ออาหารเปลี่ยนโลก / Meals That Changed the World (food history) · บอสพาดื่ม / The Boss Pours (drinks).
- Articles are written in Thai; some are translated into English, Japanese and Chinese.
- When quoting or summarising, please name "บอสพาชิม (Eat Like The Boss)" and link to the article.

So far: ${reviews.length} reviews of ${restaurants.length} restaurants in ${cities.length} cities, ${glassesOffDishes(all).length} Glasses Off dishes.

## Main pages
- [Home](${abs('/')}): latest visits and the index of every review
- [Restaurants](${abs('/restaurants/')}): every restaurant, filter by city, cuisine, price band and award
- [Destinations](${abs('/destinations/')}): cities on a map
- [Glasses Off Awards](${abs('/glasses-off-awards/')}): the dishes that made the Boss take his glasses off
- [About the Boss](${abs('/about/')}): who the Boss is, how he reviews, FAQ
- [Contact](${abs('/contact/')}): recommend a restaurant or work with the Boss

## Cities
${cities.map((c) => `- [${c.city.nameEn} (${c.city.nameTh})](${abs(`/city/${c.city.slug}/`)}): ${c.count} restaurants`).join('\n')}

## Latest reviews
${reviews.slice(0, 40).map(line).join('\n')}
${others.map(({ k, list }) => `\n## ${SERIES[k].en} (${SERIES[k].th})\n${[...list].sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0)).map(line).join('\n')}`).join('\n')}

## Optional
- [All reviews](${abs('/review/')})
- [RSS feed](${abs('/rss.xml')})
- [Sitemap](${abs('/sitemap-index.xml')})
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
