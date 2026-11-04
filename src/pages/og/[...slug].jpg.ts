// /og/<article path>.jpg — branded share image for every article (see src/lib/og.ts).
import type { APIRoute } from 'astro';
import { getAllArticles, articleUrl } from '../../lib/content';
import { renderOg } from '../../lib/og';
import type { Article } from '../../lib/types';

export async function getStaticPaths() {
  return (await getAllArticles()).map((a) => ({ params: { slug: articleUrl(a).replace(/^\/|\/$/g, '') }, props: { a } }));
}
export const GET: APIRoute = async ({ props }) =>
  new Response(await renderOg((props as { a: Article }).a), { headers: { 'Content-Type': 'image/jpeg' } });
