# Eat Like The Boss website — guide for Claude

Read this first. Keep edits small: read only the files you need, prefer find-and-replace over rewrites.
What earlier sessions changed, why, and what is still open: `docs/HANDOFF.md` (add your own entry at the top when you finish).
Role hand-offs (posting & translation · brand & graphics · web design, incl. how to use the Studio): `docs/handoff/`.

## Stack
- **Astro** static site (`src/`), built on **Cloudflare Workers (static assets, `wrangler.jsonc`)** from `main`, domain eatlikeboss.com.
- **Sanity** holds all content (articles, cities, About copy). Studio code in `studio/` (deployed at eatliketheboss.sanity.studio).
- Content comes from Sanity project `ohviqc5c` by default; `SANITY_PROJECT_ID=sample npm run build` uses sample content in `src/data/` (placeholders in [brackets]).
- Publishing in Sanity triggers a Cloudflare rebuild via webhook → live in a few minutes.

## Posting an article (the cheap way)
1. Write the article in the Boss's voice with the `eatliketheboss-writing-style` skill (Google Doc draft is the source of truth).
2. Copy `posts/_template.md` to `posts/<slug>.md` and fill it. Put photos in `posts/images/<slug>/` (or use https URLs). Every image needs real alt text after `|`.
3. `npm run post -- posts/<slug>.md --dry` to check, then `npm run post -- posts/<slug>.md` to publish. Needs `.env` with `SANITY_PROJECT_ID` and `SANITY_WRITE_TOKEN`.
   **From a Claude session (no token needed):** run the `--dry` check locally, then — only after the Boss approves that post — commit `posts/<slug>.md` + its images and push to `main`. `.github/workflows/post-article.yml` publishes every changed `posts/*.md` with the GitHub secret `SANITY_WRITE_TOKEN`. Re-run or dry-run any file from Actions → Post article to Sanity → Run workflow. Never ask for or store the token itself. Editing a file that is already published is fine: the re-post sends only the fields changed in the file since its previous commit (`--since`), so Studio edits elsewhere stay.
4. Translation: same file with `language: en|ja|zh` and the same `slug`, saved as `posts/<slug>.<lang>.md`. In Studio: open the Thai article → tab "5 ภาษา / คำแปล" → "+ English / 日本語 / 中文" makes a linked copy (same slug, photos, dishes) to translate over; the tab lists every language of that article. Keep restaurant, dish, chef names untranslated; keep the Boss's critic voice.
You never need to touch `src/` to post.

## Brand rules that the code enforces or relies on
- No stars, no scores, no `reviewRating` in JSON-LD. Impressions come through writing and the 🕶️ glasses-off dish (max 2 per meal).
- The Boss's Bill = an approximate **price band** (฿฿ / ฿฿฿ / ฿฿฿฿), never the real amount, and never whether a meal was invited or paid. Special event meals carry an `Event` pill; paid posts `AD`. Band = Studio "The Boss's Bill" (Bill tab), else worked out from the hidden real price (`priceBandFromBill()` in `content.ts`: <3,000 / <8,000 / 8,000+ THB).
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
| Menu: English names on every page + small Thai name underneath (phones: short English names, 5 tabs that always fit), logo | `src/components/NavLinks.astro` (used by `SiteHeader.astro` + `MiniBar.astro`); items `NAV_ITEMS`, names `NAV_LABELS` / `NAV_SHORT` in `src/lib/i18n.ts` |
| Line art + footer links | `src/components/SiteFooter.astro` |
| `<head>`, meta, hreflang, OG | `src/layouts/Base.astro` |
| JSON-LD | `src/lib/seo.ts` |
| All site copy (one Studio tab per page: home, article, finder, destinations, awards, series, about, contact, footer/SEO) | Sanity → ตั้งค่าเว็บ / ข้อความทุกหน้า (defaults: `src/data/settings.json`; Actions → Fill settings texts fills empty fields) |
| Share image per article (cover + logo + name) | `src/lib/og.ts` → `/og/<article path>.jpg` (fonts `src/og/fonts`) |
| Contact / recommend-a-restaurant form | `src/pages/contact.astro` → Web3Forms key in Sanity settings |
| Site URL, series keys, motifs | `src/lib/config.ts` |
| Loading content (Sanity / sample) | `src/lib/content.ts` |
| Content fields in Studio | `studio/schemas/index.ts` (keep `src/lib/content.ts` GROQ in step) |
| Pages | `src/pages/` — `[...article].astro` renders every article URL |
| Motion: scroll reveal (skipped on Back / pages already seen this visit), compact glass bar, card tilt, spotlight, count-up — no page transitions (the Boss found them disorienting) | `src/components/Effects.astro` (script) + "Effects v2" at the end of `site.css`; all off under reduced motion (`fx-on` class on `<html>`) |
| Home slider (5 latest visits, featured article first) | `src/components/HeroSlider.astro` |
| Interface text on translated article pages (th/en/ja/zh) | `src/lib/i18n.ts` (listing pages stay Thai) |
| Language switcher | `src/components/LangSwitch.astro`, at the top of an article ("อ่านภาษา: ไทย · English"). Only articles are translated, so it is not in the header. It shows only languages the article really exists in. **No machine translation** — Google Translate broke the site twice; the Boss turned it off for good |
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
- Lighthouse (phone profile, 5 pages of the live-content build) runs in `check.yml` via `lighthouserc.cjs`; scores land in the job summary. Fails only below performance 60 / accessibility 90 / SEO 90.
- Files ↔ Sanity: `scripts/pull-articles.mjs` (Actions → Pull articles from Sanity) writes what is live back into `posts/*.md` and opens a `[sanity-sync]` PR; `post-article.yml` skips those merges. Run it before editing a post file the Boss may have changed in Studio.
- `.github/workflows/check.yml` builds every branch / PR (sample + live content + Studio schema). No preview deploys (the Boss chose not to use Cloudflare previews).
- Studio: `.github/workflows/deploy-studio.yml` deploys it when `studio/**` changes on main (secret `SANITY_DEPLOY_TOKEN`); by hand: `cd studio && npm ci && npx sanity login && npx sanity deploy`.
- Cloudflare Web Analytics: paste the site token in Sanity → ตั้งค่าเว็บ → ติดต่อ & SEO (empty = off).

## Commands
`npm run dev` (local preview) · `npm run build` · `npm run post -- <file>` · `node scripts/seed-sanity.mjs` (one-time cities).
