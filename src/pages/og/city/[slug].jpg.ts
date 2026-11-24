import { isRestaurantSeries } from '../../../lib/config';
// /og/city/<slug>.jpg — share image for each city page (see renderCityOg in src/lib/og.ts).
import type { APIRoute } from 'astro';
import { getCities, getArticles } from '../../../lib/content';
import { renderCityOg } from '../../../lib/og';
import type { Article, City } from '../../../lib/types';

export async function getStaticPaths() {
  const reviews = (await getArticles('th')).filter((a) => isRestaurantSeries(a.series));
  return (await getCities()).map((c) => ({ params: { slug: c.slug }, props: { c, latest: reviews.find((a) => a.city?.slug === c.slug && a.cover) } }));
}
export const GET: APIRoute = async ({ props }) => {
  const { c, latest } = props as { c: City; latest?: Article };
  return new Response(await renderCityOg(c, latest), { headers: { 'Content-Type': 'image/jpeg' } });
};
