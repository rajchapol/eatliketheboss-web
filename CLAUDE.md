# Eat Like The Boss website — guide for Claude

Read this first. Keep edits small: read only the files you need, prefer find-and-replace over rewrites.

## Stack
- **Astro** static site (`src/`), built on **Cloudflare Workers (static assets, `wrangler.jsonc`)** from `main`, domain eatlikeboss.com.
- **Sanity** holds all content (articles, cities, About copy). Studio code in `studio/` (deployed at eatliketheboss.sanity.studio).
- Content comes from Sanity project `ohviqc5c` by default; `SANITY_PROJECT_ID=sample npm run build` uses sample content in `src/data/` (placeholders in [brackets]).
- Publishing in Sanity triggers a Cloudflare rebuild via webhook → live in a few minutes.

## Posting an article (the cheap way)
1. Write the article in the Boss's voice with the `eatliketheboss-writing-style` skill (Google Doc draft is the source of truth).
2. Copy `posts/_template.md` to `posts/<slug>.md` and fill it. Put photos in `posts/images/<slug>/` (or use https URLs). Every image needs real alt text after `|`.
3. `npm run post -- posts/<slug>.md --dry` to check, then `npm run post -- posts/<slug>.md` to publish. Needs `.env` with `SANITY_PROJECT_ID` and `SANITY_WRITE_TOKEN`.
4. Translation: same file with `language: en|ja|zh` and the same `slug`, saved as `posts/<slug>.<lang>.md`. Keep restaurant, dish, chef names untranslated; keep the Boss's critic voice.
You never need to touch `src/` to post.

## Brand rules that the code enforces or relies on
- No stars, no scores, no `reviewRating` in JSON-LD. Impressions come through writing and the 🕶️ glasses-off dish (max 2 per meal).
- The Boss's Bill = price as the Boss wrote it, or tag `AD` / `Event` for invited meals. Never claim every meal was paid for.
- Boss's Pairing is retired (3 Nov 2026). Don't add it back.
- Don't name the Boss's employer. Career: "Hospitality และ F&B มากว่า 15 ปี"; judging: "Tatler Best Asia-Pacific panelist & more".
- Icons: `src/components/Icon.astro` line icons only, never emoji in the UI.
- Brand source: the "Eat Like The Boss" design system README (Website — A3★ Lagoon Gold).

## Where things live
| Change | File |
| --- | --- |
| Colours, patterns, motifs, effects, phone layout | `src/styles/site.css` |
| Menu, logo, language switcher | `src/components/SiteHeader.astro` |
| Line art + footer links | `src/components/SiteFooter.astro` |
| `<head>`, meta, hreflang, OG | `src/layouts/Base.astro` |
| JSON-LD | `src/lib/seo.ts` |
| Site URL, socials, email, series, motifs | `src/lib/config.ts` |
| Loading content (Sanity / sample) | `src/lib/content.ts` |
| Content fields in Studio | `studio/schemas/index.ts` (keep `src/lib/content.ts` GROQ in step) |
| Pages | `src/pages/` — `[...article].astro` renders every article URL |

## URLs (never change once live; add a redirect in `public/_redirects` if you must)
`/review/<city>/<slug>/` · `/history/<slug>/` · `/drinks/<slug>/` · `/city/<slug>/` · `/restaurants/` · `/destinations/` · `/glasses-off-awards/` · `/about/` · other languages prefixed `/en/ /ja/ /zh/`.

## SEO checklist per article
Meta title ≤ 60 chars, description 120–155, slug in English, alt text on every photo, publish date, city set. Full rules: `docs/SEO.md`.

## Commands
`npm run dev` (local preview) · `npm run build` · `npm run post -- <file>` · `node scripts/seed-sanity.mjs` (one-time cities).
