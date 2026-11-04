# Handoff log — Claude sessions on eatlikeboss.com

For the next Claude (or person) working on this repo. Read `CLAUDE.md` first; this file says what was done, why, and what is still open.

---

## Session 2026-11-04 (evening) · Calmer motion, working language switcher, new glasses

Feedback from the Boss after seeing the effects demo: the language switcher "doesn't work", some effects are disorienting when moving between pages, the round photos in the glasses look odd, and no Cloudflare previews.
- **Language switcher (`SiteHeader.astro`):** EN/JA/ZH were greyed out because Sanity has no translated articles yet. Now:
  - a human translation is used when it exists;
  - otherwise the button opens the same Thai page through Google Translate (`https://eatlikeboss-com.translate.goog/<path>?_x_tr_sl=th&_x_tr_tl=<lang>`), with `rel=nofollow` and a dotted underline;
  - TH is an absolute link, so it also leaves the Google view.
  - Not verified from the container (no network); ask the Boss to tap it on the live site.
- **Calmer motion:**
  - Page transitions and the shared photo morph are removed entirely (that was the dizziness).
  - The reveal is shorter (12px, .55s, stagger cap 4).
  - **No reveal or count-up after Back/Forward or on a page already seen this visit** (`sessionStorage` key `fx-seen`).
  - Less tilt (≈3°), less parallax (3%), gentler Ken Burns (1.06).
- **Glasses:**
  - The circles are gone. Each lens is a honeycomb of hexagon photos clipped to the lens. It drifts slowly and shifts against the mouse (`--tx/--ty` on `.specs`, CSS `translate`), so it feels like looking through lenses.
  - Hover lifts a cell and writes the dish + restaurant under the glasses (`[data-specs-now]`); gold rim = glasses-off dish.
  - On touch screens the cells are decoration only (too small to tap) and the hint links to the list below.
  - The sunglasses tint is kept.
- **No Cloudflare previews:** the preview steps were removed from `check.yml` and `preview_urls` from `wrangler.jsonc`. The build check stays.

---

## Session 2026-11-04 (later) · Motion & effects pass (branch `ccr-d06a6315-dh3n4a`, after PR #2)

The Boss wanted the site to feel more modern, with more effects (another AI writes the reviews; this work is design only).
- **Page transitions:** CSS `@view-transition{navigation:auto}`. Card photos and the article cover share `view-transition-name` (`vtName()` in `content.ts`), so the photo glides into the article. Chrome/Edge/Safari only; other browsers simply load the page.
- **`src/components/Effects.astro`** (inline script, included in `Base.astro`):
  - Photo fade-in (`img.cover.loaded`).
  - Compact glass bar `.mini-bar` (markup in `SiteHeader.astro`). It slides in after the header scrolls away, hides on scroll down, shows on scroll up, and is `inert` while hidden. It sets `--bar-offset`, which the sticky course nav and the dish anchors use.
  - Scroll reveal (`.rv` → `.in`, stagger via `--i`, then `.settled` drops the delay). Items already on screen at load skip the animation, so there is no flash and no LCP delay.
  - Count-up (`data-count-to`).
  - Card tilt + gold sheen (mouse only).
  - Cursor spotlight on `.spot` dark bands.
- **CSS "Effects v2"** (end of `site.css`):
  - slider Ken Burns + staggered text (`.slide.is-active`);
  - dish photos open like a curtain (clip-path);
  - gold sweep on section `h2.ink-grad`;
  - shine on gold/teal buttons;
  - article cover parallax via scroll-driven animation (`animation-timeline: view()`, ignored where unsupported);
  - home **ticker** of latest restaurants (pauses on hover).
- **Accessibility:** a head script adds `fx-on` to `<html>` only when reduced motion is off; every hide/animate rule is scoped under `.fx-on`.
- **Tested:** all earlier interaction tests, plus checks for the bar's show/hide logic (desktop and phone), every revealed element becoming visible, photos loading, card tilt, and reduced motion. A 30 s demo video was sent to the Boss.
- **Data fix (not run yet):**
  - `scripts/fix-city-regions.mjs` and `.github/workflows/fix-city-regions.yml` (manual, dry run by default) move cities still on region `jp`/`cn`/`other` to the continent values.
  - It must be on `main` before GitHub shows the Run button. Run it dry first, then unticked.
  - An auto-run-on-push version was blocked as an unreviewed production data change, so keep it manual.

---

## Session 2026-11-03 → 04 · UI/UX overhaul (merged as PR #2, commit `59e8c34`)

The Boss (site owner, writes in Thai) asked for a code review, then a full UI/UX pass ("impeccable", must look good on phones), then specific features. Everything below is live on `main`.

### What changed, by area

**Images**
- `imgUrl()` in `src/lib/content.ts` uses `@sanity/image-url` and respects the crop and hotspot set in Studio. Before, everything was centre-cropped.
- **Every food photo shows at 3:2 landscape:** covers, dishes, cards and awards. The Boss's real photos are ~95% 3:2 (1225×815). We checked `posts/images/` before choosing.
- The zoom lightbox was removed: the Boss found it old-fashioned.

**Look and feel (`src/styles/site.css`)**
- Tokens on `:root`: `--r-sm/md/lg/pill`, colours.
  - Rounded corners everywhere: pills for controls, `.rc`/`.rl` for cards and panels.
  - Soft shadows replaced the hard offset gold blocks.
- Readability:
  - Thai body text uses weight 400 instead of 300 everywhere.
  - White text on dark teal bands is ≥ .92 opacity, with quieter patterns behind it.
- Fonts are self-hosted in `public/fonts/` with the SIL OFL licence files (Noto Serif Thai 400/600/700 thai+latin, Cormorant Garamond 500 normal/italic). There is no Google Fonts request.
- Phone fixes, all inside `@container elb (max-width:720px)`:
  - facts become rows;
  - the Index rows are compact;
  - Glasses Off cards scroll sideways;
  - About stats become rows;
  - plus a back-to-top button and a reading-progress bar on articles.
- **Gotcha we hit:** in a column flexbox, a desktop `flex: 7 1 480px` becomes a *height*. Resetting it to `flex: 0 0 auto` makes an aspect-ratio child collapse to 0 height, so it overlaps the text. The fix is `.dish-row>*{flex:0 0 auto;width:100%}`. Keep the explicit width.

**Home (`src/pages/index.astro`, `src/components/HeroSlider.astro`)**
- The slider shows the 5 latest restaurants visited, one per restaurant; a featured article set in Sanity goes first.
  - Controls: swipe, arrows, dots, 7 s autoplay.
  - Autoplay pauses on hover, on focus, when the slider is off screen, and under reduced motion.
  - The scroll handler is ignored during programmatic glides (a race we fixed), and focus moves to the new slide for keyboard users.
- The Index shows the visit month (not the publish month) and a 3:2 thumbnail after No.
- The Glasses Off band is grouped by visit year, and its cards link straight to `#dish-N` (`dishUrl()`).
- Quick-city buttons and footer cities default to the cities with the most restaurants (`citiesByCount()`).

**Glasses Off Awards (`src/pages/glasses-off-awards.astro`)**
- The hero is a pair of glasses made of 38 round dish photos.
  - Hover enlarges a photo with its caption; tap goes to the dish.
  - The lenses start as dark sunglasses (tint + glare + shadow) and clear when the glasses are ≥60% in view (`.specs.shade` → `.lit`).
  - Photos repeat when there are fewer dishes than spots; the repeats are `aria-hidden` and taken out of the tab order.
- The seal SVG is inlined and its year replaced with the latest awards year, so it uses the site fonts.
- Awards are grouped by **visit year**.

**Destinations (`src/pages/destinations.astro`, `src/components/DestinationsMap.astro`)**
- Groups are Thailand + continents, each split by country.
  - The group is worked out by `regionOf()` in `src/lib/config.ts`: a known country name wins, then the Studio value. Old `jp`/`cn` values become Asia; anything unknown goes to "เมืองอื่นๆ".
- Only cities with ≥1 review are shown (all cities while the site is empty).
- **The Boss's Map:**
  - A dotted world map from Natural Earth (`public/img/map/world-dots.svg` 1.5°, plus `sea-dots.svg` 0.5° for the Thailand zoom). Rebuild with `scripts/make-map-dots.mjs`.
  - Gold pins link to the city pages, and a dashed route joins the cities in first-visit order.
  - Zoom: world / Asia / Thailand. Overlapping labels are hidden, the city with more restaurants keeping its label.
  - Pin coordinates come from `CITY_COORDS` in `config.ts` or the Studio field `location` (geopoint).
- City motif patterns carry no text labels (Boss's request).

**City page (`src/pages/city/[slug].astro`)**
- Boss's Picks can be chosen in Studio (city → `picks`, max 3, weak references). When empty: the latest restaurants that have a glasses-off dish (`cityPicks()`).
- A cuisine filter (chips) is added.
- Repeat visits share one row, with pill links to each visit.

**Repeat visits (`src/lib/content.ts`)**
- `linkRestaurants()` runs after loading and gives every article a `restaurantGroup`.
  - Same city + normalised restaurant name = the same restaurant, **or** linked with `restaurant.sameAs` (Studio: "รีวิวครั้งก่อนของร้านนี้"; posts: `sameAs: <old-slug>`).
- Helpers: `restaurantKey()`, `visitsOf()`, `groupByRestaurant()`.
- The finder and series pages show one card per restaurant (`ArticleCard` takes `visits`). Each article has a visits bar ("บอสมาร้านนี้ N ครั้ง").

**Article page (`src/pages/[...article].astro`)**
- Translated articles (`en/ja/zh`) get translated interface text, dates, title suffix, header nav and footer from `src/lib/i18n.ts`. Listing pages stay Thai: the Boss chose "translate article pages only".
- More Tasting Notes lists the same city first, then the same series, and leaves out other visits of the same restaurant.
- The share button has a text label and a visible "copied" status.
- `cleanDish()` strips the leading 🕶️ "จานนี้อร่อยจนบอสต้องขอถอดแว่นชิม" from dish text, because the page already shows that line. `stripCtrl()` removes vertical tabs and zero-width spaces pasted from Google Docs (they showed as boxes). `scripts/post-article.mjs` strips them too.

**Finder (`src/pages/restaurants.astro`)**
- Search matches dish names and area too.
- Cuisine options come from each card's latest visit.

**SEO / share**
- OG tags: `og:image:width/height/alt` and `article:published_time/modified_time/author`. The Sanity share image is cropped to 1200×630.
- RSS is sorted newest *published* first.
- JSON-LD `inLanguage` uses `zh-Hans`.
- `public/_headers` caches `/_astro/*` immutably.
- One `toRoman()` helper (`src/lib/roman.ts`) is used everywhere.

**Tooling**
- `.github/workflows/check.yml` builds every branch and PR: sample content, live Sanity content, and the Studio `sanity schema validate`.
  - With the secret `CLOUDFLARE_API_TOKEN` it also runs `wrangler versions upload --preview-alias <branch>` and comments the preview URL on the PR.
  - `wrangler.jsonc` has `preview_urls: true`.
- `.github/workflows/deploy-studio.yml` deploys the Studio when `studio/**` changes on `main` (secret `SANITY_DEPLOY_TOKEN`). It ran successfully on the merge.
- Cloudflare Web Analytics: Sanity settings field `cfAnalyticsToken`. The beacon is injected only when a valid 32-hex token is set.

**Studio schema (`studio/schemas/index.ts`)**
- City fields: `picks`, `location`, and `region` (new options; no default, so the country decides).
- Restaurant: `sameAs`.
- Settings: `cfAnalyticsToken`.
- Validated: 0 errors, 0 warnings.

### How we tested (reuse this)
- Sanity and the live site can't be reached from the cloud container. For realistic screenshots we built a **scratch copy** of the site in which `src/data/seed.ts` was generated from the real `posts/*.md` and `posts/images/`, plus test-only fixtures: a second Yong Fu visit, an English translation, and fake reviews in other cities. **None of that is in the repo.**
- Playwright (preinstalled) for:
  - full-page and viewport screenshots at 1280 px and on iPhone 13;
  - a horizontal-overflow check (`scrollWidth` must be 390);
  - interaction tests: slider, filters, every `#dish-N` link resolves, map pins, revisit links.
- An independent reviewer subagent read the whole diff and found 8 defects, all fixed. Examples: city revisit pills weren't clickable, the slider fought its own smooth scroll, new cities defaulted to Asia, "Sept" vs "Sep".

### Open items / known issues
1. **Cloudflare's own "Workers Builds" check fails instantly (0 s) on every non-main branch.** It is a dashboard setting; the logs are only visible in Cloudflare. It doesn't block merges, and production builds of `main` work. Either fix it in Cloudflare (Workers → eatlikeboss → Settings → Build: non-production branch builds / deploy command) or rely on `check.yml` previews.
2. **`CLOUDFLARE_API_TOKEN` is not set yet** (as of the PR #2 run), so there are no preview links yet. Add it as a *Repository secret*, then re-run the check.
3. **Live content today is only 6 Shanghai reviews.** The map has one pin, and the route appears from the second city on.
4. Older Sanity cities saved with region `jp`/`cn`/`other` show a Studio "value not in list" warning until re-saved. The site groups them correctly anyway.
5. The Web Analytics token still needs to be pasted into Sanity → ตั้งค่าเว็บ → ติดต่อ & SEO (the Boss is doing this).

### Ideas not done yet (suggested to the Boss)
- English/Japanese/Chinese listing pages (home, finder…) once there are enough translations.
- Thai search normalisation (tone marks, spacing) in the finder.
- Per-restaurant JSON-LD `geo` from the map coordinates.
- Lighthouse / performance budget step in `check.yml`.

### Rules to keep (from the Boss, beyond CLAUDE.md)
- Ask before choosing photo ratios or other things that change how the Boss shoots or writes. Check the real data first (we almost picked 4:5 wrongly).
- Never edit `posts/*.md` on `main` casually: any change there republishes the article through `post-article.yml`.
- Never ask for or store tokens. Tell the Boss where to paste them (GitHub secrets / Sanity settings).
