# Eat Like The Boss website — guide for Claude

Read this first. Keep edits small: read only the files you need, prefer find-and-replace over rewrites.
What earlier sessions changed, why, and what is still open: `docs/HANDOFF.md` (add your own entry at the top when you finish).

## Stack
- **Astro** static site (`src/`), built on **Cloudflare Workers (static assets, `wrangler.jsonc`)** from `main`, domain eatlikeboss.com.
- **Sanity** holds all content (articles, cities, About copy). Studio code in `studio/` (deployed at eatliketheboss.sanity.studio).
- Content comes from Sanity project `ohviqc5c` by default; `SANITY_PROJECT_ID=sample npm run build` uses sample content in `src/data/` (placeholders in [brackets]).
- Publishing in Sanity triggers a Cloudflare rebuild via webhook → live in a few minutes.

## Posting an article (the cheap way)
1. Write the article in the Boss's voice with the `eatliketheboss-writing-style` skill (Google Doc draft is the source of truth).
2. Copy `posts/_template.md` to `posts/<slug>.md` and fill it. Put photos in `posts/images/<slug>/` (or use https URLs). Every image needs real alt text after `|`.
3. `npm run post -- posts/<slug>.md --dry` to check, then `npm run post -- posts/<slug>.md` to publish. Needs `.env` with `SANITY_PROJECT_ID` and `SANITY_WRITE_TOKEN`.
   **From a Claude session (no token needed):** run the `--dry` check locally, then — only after the Boss approves that post — commit `posts/<slug>.md` + its images and push to `main`. `.github/workflows/post-article.yml` publishes every changed `posts/*.md` with the GitHub secret `SANITY_WRITE_TOKEN`. Re-run or dry-run any file from Actions → Post article to Sanity → Run workflow. Never ask for or store the token itself.
4. Translation: same file with `language: en|ja|zh` and the same `slug`, saved as `posts/<slug>.<lang>.md`. Keep restaurant, dish, chef names untranslated; keep the Boss's critic voice.
You never need to touch `src/` to post.

## Brand rules that the code enforces or relies on
- No stars, no scores, no `reviewRating` in JSON-LD. Impressions come through writing and the 🕶️ glasses-off dish (max 2 per meal).
- The Boss's Bill = price as the Boss wrote it, or tag `AD` / `Event` for invited meals. Never claim every meal was paid for.
- Boss's Pairing is retired (3 Nov 2026). Don't add it back.
- Don't name the Boss's employer. Career: "Hospitality และ F&B มากว่า 15 ปี"; judging: "Tatler Best Asia-Pacific panelist & more".
- Icons: `src/components/Icon.astro` line icons only, never emoji in the UI.
- Copy protection (deterrent only): AI-training crawlers blocked in `public/robots.txt`; photos can't be right-clicked/dragged/long-pressed; copied text (80+ chars) gets a credit + link (`Effects.astro`); footer rights notice; photo copyright in JSON-LD (`seo.ts`).
- Every food photo (covers, dishes, cards, awards) shows at 3:2 landscape. Rounded corners: pills for controls, `--r-md`/`--r-lg` for cards and photos (`site.css` tokens).
- City motif patterns are decoration only: no "ลายประจำเมือง" text labels.
- Brand source: the "Eat Like The Boss" design system README (Website — A3★ Lagoon Gold).

## Where things live
| Change | File |
| --- | --- |
| Colours, patterns, motifs, effects, phone layout | `src/styles/site.css` |
| Fonts (self-hosted woff2 + SIL OFL licences, no Google Fonts) | `public/fonts/`, `@font-face` at the top of `site.css` |
| Menu, logo, language switcher | `src/components/SiteHeader.astro` |
| Line art + footer links | `src/components/SiteFooter.astro` |
| `<head>`, meta, hreflang, OG | `src/layouts/Base.astro` |
| JSON-LD | `src/lib/seo.ts` |
| Site copy (tagline, page intros, series text, about, socials, email, OG image) | Sanity → ตั้งค่าเว็บ (defaults: `src/data/settings.json`) |
| Site URL, series keys, motifs | `src/lib/config.ts` |
| Loading content (Sanity / sample) | `src/lib/content.ts` |
| Content fields in Studio | `studio/schemas/index.ts` (keep `src/lib/content.ts` GROQ in step) |
| Pages | `src/pages/` — `[...article].astro` renders every article URL |
| Motion: scroll reveal (skipped on Back / pages already seen this visit), compact glass bar, card tilt, spotlight, count-up, ticker — no page transitions (the Boss found them disorienting) | `src/components/Effects.astro` (script) + "Effects v2" at the end of `site.css`; all off under reduced motion (`fx-on` class on `<html>`) |
| Home slider (5 latest visits, featured article first) | `src/components/HeroSlider.astro` |
| Interface text on translated article pages (th/en/ja/zh) | `src/lib/i18n.ts` (listing pages stay Thai) |
| Language switcher | `SiteHeader.astro`: shows only languages the page really exists in (hidden when Thai only). No machine-translation fallback — Google's proxy broke links and images |
| Destinations groups (Thailand + continents → countries) | `REGIONS` / `regionOf()` in `src/lib/config.ts`; set per city in Studio → เมือง → ภูมิภาค + ประเทศ |
| Destinations map (pins, route, zoom) | `src/components/DestinationsMap.astro`; pin positions `CITY_COORDS` in `src/lib/config.ts` or Studio → เมือง → ตำแหน่งบนแผนที่; dots `public/img/map/` (rebuild: `scripts/make-map-dots.mjs`) |
| Boss's Picks on a city page | Studio → เมือง → Boss's Picks (max 3); empty = latest reviews with a glasses-off dish |
| Repeat visits | Same city + same restaurant name = one restaurant (`restaurantKey()` in `src/lib/content.ts`): one card with every visit, and a visit list on each article |

## URLs (never change once live; add a redirect in `public/_redirects` if you must)
`/review/<city>/<slug>/` · `/history/<slug>/` · `/drinks/<slug>/` · `/city/<slug>/` · `/restaurants/` · `/destinations/` · `/glasses-off-awards/` · `/about/` · other languages prefixed `/en/ /ja/ /zh/`.

## Numbering
Tasting Notes No. is automatic: order of `visit` (Mon-YYYY; oldest meal = No. 001, same month → earlier publish date first). Lists show newest visit first. Never set `no` by hand.

## SEO checklist per article
Meta title ≤ 60 chars, description 120–155, slug in English, alt text on every photo, publish date, city set. Full rules: `docs/SEO.md`.

## Checks and previews
- `.github/workflows/check.yml` builds every branch / PR (sample + live content + Studio schema). No preview deploys (the Boss chose not to use Cloudflare previews).
- Studio: `.github/workflows/deploy-studio.yml` deploys it when `studio/**` changes on main (secret `SANITY_DEPLOY_TOKEN`); by hand: `cd studio && npm ci && npx sanity login && npx sanity deploy`.
- Cloudflare Web Analytics: paste the site token in Sanity → ตั้งค่าเว็บ → ติดต่อ & SEO (empty = off).

## Commands
`npm run dev` (local preview) · `npm run build` · `npm run post -- <file>` · `node scripts/seed-sanity.mjs` (one-time cities).
