# Handoff log — Claude sessions on eatlikeboss.com

For the next Claude (or person) working on this repo. Read `CLAUDE.md` first; this file says what was done, why, and what is still open.

---

## Session 2026-11-05 · Index expands in place, Lighthouse in CI, pull articles from Sanity

- **The Index** (`index.astro`): every article is in the HTML. The first 10 show; the button "ดูทั้งหมด N เรื่อง ▾" (or "ดูเพิ่มอีก 20 เรื่อง") opens the rest in place, and "ย่อรายการ" folds them back and scrolls to the heading. Without JS, the row links to `/review/`. CSS `.idx-row[hidden]`, `.idx-toggle`.
- **Lighthouse** in `check.yml` (`lighthouserc.cjs`):
  - Phone profile on `/`, `/restaurants/`, `/destinations/`, `/glasses-off-awards/` and the first review of the live-content build. Scores go to the job summary (`scripts/lighthouse-summary.mjs`).
  - Fails only below performance 60, accessibility 90 or SEO 90.
  - First run (5 Nov): performance 89–98, accessibility 100, best practices 100, SEO 100. The home page was at accessibility 96 because the slider dots were too close for touch; dot gap is now 14px, so centres are 24px apart.
- **Pull articles from Sanity** (`scripts/pull-articles.mjs`, Actions → Pull articles from Sanity):
  - Writes every published article back to `posts/<slug>(.lang).md` in the same format and YAML style, and opens a `[sanity-sync]` PR.
  - Keeps from the existing file: local image paths (matched by `originalFilename`, which post-article sets from the file name), `cityNew`, and the dishes heading. Other photos become Sanity CDN URLs.
  - If the Studio body has links or headings the format can't hold, it keeps the file's body and warns.
  - `--check` lists the files that differ; a slug argument limits it to one article.
  - `post-article.yml` skips commits/merges containing `sanity-sync`, so nothing goes back to Sanity.
  - Round-trip tested: all 17 pulled files pass `post-article --dry` with the same dish counts, glasses-off and SEO as Sanity.
  - The first check (5 Nov) found all 17 files out of date, e.g. Meet The Bund: the first tea course was replaced in Studio by an ambience photo, the last tea course was removed, and the price band was set.
  - The workflow needs Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests".

---
## 5 Nov 2026 — Michelin batch 1 posted
- Posted 9 old FB/Pantip reviews (content kept, scores/links/stars cut): harutaka, ishikawa, leffervescence, forum, le-palais, jl-studio (new city `taichung` via `cityNew`), zen-singapore, odette, maaemo. All photos 3:2.
- `scripts/post-article.mjs` supports `cityNew: { nameEn, nameTh, country, region }`.
- Open: Maaemo 2017 visit (old location) for the time capsule needs its text (FB post 457908344679187); Thai typos in old copies left as written pending the Boss; no glasses-off picks on old articles.

## Session 2026-11-05 · Home slider autoplay + English spelling fixes

**Slider** (`HeroSlider.astro`, CSS "home slider: timer dots…" at the end of `site.css`):
- Auto-advances every 5 s. The active dot fills like a timer, and that dot's `animationend` moves to the next slide, so the bar and the slide stay in step.
- Pauses on touch (resumes 8 s after the last touch), on real mouse hover (`pointerType === 'mouse'`, so a phone tap isn't a hover), on keyboard focus (`:focus-visible` only; a tap focuses the track), and when off screen or the tab is hidden. Off under reduced motion.
- Phones: the next slide peeks (88% columns), the dots / "ปัดดูร้านถัดไป ›" / count bar sits above the slides, the arrows are hidden, and the hint fades after the first swipe.

**Spelling:** the Boss's rule is to fix English mistakes directly but confirm Thai ones first.
- Spell-checked all English in Sanity: `posts/t-plus-t.md` "overhelm" → "overwhelm" (the post workflow sends only that dish on merge).
- City "Istalbul" → "Istanbul": `scripts/fix-city-names.mjs` + Actions → **Fix city names** (dry first). It also renames the slug `turkey-istalbul` → `turkey-istanbul` (the old URL 301s via `public/_redirects`) and trims "Helsinki ".
- Left as printed on the menu: "Nantou Nopale" (zea, Spanish plural is nopales).
## Session 2026-11-05 · Bug recheck + Studio review

Crawled the live site (29 pages, 1280 + 360 px): no JS errors, no broken links or images, no missing alt, no duplicate ids, no stuck reveals, no horizontal overflow, and JSON-LD parses.
Fixed:
- **Dishes without a photo** (Taian Table IV–V, Wu You Xian, logy XI, Jie Xiang Lou) showed a "[ภาพจาน IV]" placeholder. They now render text-only: no frame, a centred 760 px column, never flipped (`[...article].astro`).
- **Thai on English pages:** cards in "More Tasting Notes" (series badge, "ถอดแว่นชิม", "อ่าน Tasting Notes", "รีวิว N ครั้ง") and the cuisine in the at-a-glance card. New i18n keys `seriesReview/History/Drinks`, `readNotes`, `reviewedTimes` and `cuisineLabel()` (Thai cuisine list → en/ja/zh); `ArticleCard` uses `a.language`. The only Thai left is "ไทย" in the language switcher, which is correct.
- City names are trimmed when loaded (Sanity had "Helsinki ").

Studio review: every site text is in Studio (settings.json keys = Studio fields). Added:
- งานที่ต้องทำ → "จานที่ยังไม่มีรูป" and "เมืองที่มีรีวิวแล้ว แต่ยังไม่มีรูปเมือง / คำแนะนำเมือง".
- A warning when a city name has stray spaces.

Content gaps found (5 Nov) for the Boss:
- Hangzhou and Taipei have reviews but no city photo. No city has an intro.
- 5 dishes have no photo.
- No article has a "ประโยคเด่นของบอส" (`quote`).
- The 5 Taipei/Hangzhou reviews have no English yet.
- Cloudflare Web Analytics token is empty.
- "Istalbul" is misspelt.

---

## Session 2026-11-05 · City picture falls back to the city motif

The Boss: a city without a photo showed a "[ภาพ Hangzhou]" placeholder. Now the city's own motif fills the frame on teal until a photo is set; cities without a motif use the general Gold Loop pattern.
- New `src/components/CityCover.astro`: photo if `city.cover.url`, else `<span class="m-<motif> city-fill">`. It is used for the destinations cards, the featured city and the city page hero.
- The half-width motif overlay on top of a photo is now only drawn when there is a photo; the round motif badge stays.
- CSS `.city-fill` at the end of `site.css`.
- Destinations card stats no longer break "1 ร้าน" / "2 ถอดแว่นชิม" mid-phrase (nowrap items, wrapping row).
## Session 2026-11-05 · Map + / − buttons fixed

The Boss: pinch zoom works, but the + / − buttons didn't respond. Cause: after a pinch or drag, `moved` stayed high. The capture-phase click guard ("a drag is not a tap on a pin") then swallowed the next click, including the buttons, because `pointerdown` on the buttons returned before resetting `moved`.
- Fix (`DestinationsMap.astro`):
  - `moved` resets at the start of every new touch;
  - the guard never blocks `.map-ctrl`;
  - `touchend` with no fingers left clears the pointer list, since iOS can skip `pointerup` after a pinch.
- Tested with Playwright on desktop and phone: drag, then + halves the view width and − doubles it.

---

## Session 2026-11-05 · New Glasses Off Awards seal (GO) without a year

Brand kit `2026 Brand Kit/logos/glasses-off-awards/` (spec `HANDOFF-web-awards-seal.md`):
- `public/img/brand/award-seal.svg` (= `seal-color-dark.svg`, fonts embedded) replaces `award-seal-2026.svg`. The year is no longer patched into the seal: `/glasses-off-awards/` shows the seal as an `<img>` (200 px; 160 px on phones) with "ประจำปี {latest year}" as text under it.
- `public/img/brand/go-mark.svg` (= `go-mark-color-dark.svg`), the small GO mark for anything under ~120 px:
  - top-left corner of every dish card on the awards page and in the home awards row (40–44 px);
  - inside the "ถอดแว่นชิม" badge on restaurant cards (20 px), replacing the glasses icon.
- `glasses-off-badge.svg` (dish badge in articles) is unchanged. Rule: never show the full seal under 120 px, never add a year to it.

---

## Session 2026-11-05 · 12 more city motifs (brand kit)

From `2026 Brand Kit/web-graphics/city-motifs/` (spec `HANDOFF-city-motifs.md` by the brand chat), same style as the first six (gold #c39e5c line, 1px, transparent tile):
Shanghai (Art Deco), Hangzhou (lotus), Sapporo (yukiwa), Chiang Mai (yi peng lantern), Phuket (Sino-Portuguese arches), Singapore (Peranakan tile), Taipei (plum blossom), Helsinki (Aalto wave), Copenhagen (Musselmalet), Oslo (Selbu star), Istanbul (Ottoman star), Seoul (亞 window).
- `site.css`: `.m-<key>` classes right after `.m-loop`. `config.ts` `MOTIFS`: 12 keys. Studio city field "ลายประจำเมือง": 12 new choices.
- Data: `scripts/set-city-motifs.mjs` + manual workflow **Actions → Set city motifs** (dry first). It sets `motif` only where it is empty or `loop` (never overrides a choice), and fills an empty `country` for Helsinki / Copenhagen / Oslo / Istanbul. Dry run on 5 Nov listed 11 cities (Seoul isn't in Sanity yet).
- Still for the Boss: the city "Istalbul" is misspelt in Studio (slug `turkey-istalbul`); fix the name there. Change the slug only if no article links to it yet.

---

## Session 2026-11-05 · Destinations map: free zoom, drag, clusters

The Boss: the map couldn't zoom, and nearby cities (Shanghai · Hangzhou · Taipei) were hard to tell apart.
- `DestinationsMap.astro` script:
  - **Zoom:** + / − buttons (bottom right), pinch on phones, Ctrl/⌘ + wheel or trackpad pinch on computers. A plain wheel shows a hint instead of hijacking page scroll.
  - **Drag to pan:** the box has `touch-action: pan-y`, so vertical swipes still scroll the page on phones. A drag never counts as a tap on a pin.
  - **Limits:** the view width stays between 8° and 380° (`MIN_W` / `MAX_W`), and the centre is clamped.
  - **Preset buttons** (ทั้งโลก / เอเชีย / ประเทศไทย) still work; any manual move un-presses them (`name = 'custom'`).
- **Clusters:** pins closer than ~30 px at the current zoom merge into one numbered gold circle (`.map-cluster`, label "Shanghai +2 11"). Tapping it zooms just far enough for every city in it to get its own pin. Label overlap logic runs after clustering.
- Below 40° wide the dot map is hidden (`data-deep`), because its 1° dots turn into big blobs. Labels on single pins and clusters hide when the view is wider than 200° (was: only on the world preset).
- CSS at the end of `site.css` ("destinations map: free zoom, drag, clusters").
- Tested with Playwright on the live-data build at 1280 and 390 px: cluster tap separates Shanghai / Hangzhou / Taipei, drag + Ctrl-wheel change the view, no JS errors.

---

## Session 2026-11-05 · Restaurant time capsule (repeat visits, option B)

The Boss picked option B: one page per restaurant he reviewed 2+ times, so repeat visits are easy to look back on and never crowd the lists.
- New page `src/pages/restaurant/[city]/[name].astro` → `/restaurant/<city>/<name>/` (Thai only, only for 2+ visits).
  - `<name>` = latin slug of the restaurant name from the oldest visit, else that visit's slug (`restaurantSlug()` in `content.ts`).
  - Contents: hero (visit count, year span, first/latest, cuisine, city, glasses-off total), "จานที่กลับมา" (dish names on 2+ visits, `returningDishes()`), and a vertical timeline, newest first.
  - Each visit shows: cover, Visit, No., price band, tagline, quote, glasses-off dishes, and what changed since the previous visit (chef, price band, awards). Older covers are slightly sepia.
- New helpers in `content.ts`: `capsuleUrl(visits)` (undefined for single visits / non-Thai), `returningDishes(visits)`.
- Lists link to the capsule instead of listing every visit:
  - `ArticleCard` repeat footer → one "ไทม์แคปซูล · ไป N ครั้ง · 2023–2026" link;
  - city rows → one pill;
  - review page: Thai repeat visits get a capsule bar (this is visit k, previous/next visit, button to the capsule); English pages keep the old visit pills;
  - The Index on home marks "กลับไปครั้งที่ N".
- Texts in Studio → ตั้งค่าเว็บ → new tab **ไทม์แคปซูล** (`capsuleTitle`, `capsuleIntro`, `capsuleReturning`, `capsuleLink`; defaults in `settings.json`). After merge run Actions → Fill settings texts (dry first) if the Studio doc should show them.
- The sample content has a second Tokyo visit (`sample-tokyo-2025`, Mar-2025) so the capsule is exercised in sample builds/CI.
- CSS: `.capsule-*` at the end of `site.css`.
- Tested: Playwright crawl of the sample build (no errors), screenshots at 390/1280, Studio schema validate + build.
## Session 2026-11-05 · Flexible Thai search in the finder

`src/lib/search.ts` (new) is used by `ArticleCard.astro` (build time: `searchText()` prepares `data-text`) and the `/restaurants/` script (browser: `matches()`).
- Ignores case, spaces, punctuation, Latin accents and Thai tone marks (`เซียงไฮ` = `เซี่ยงไฮ้`).
- Synonym groups Thai ↔ English ↔ Chinese/Japanese for cities, countries, cuisines, dishes and brand words (`GROUPS`): `เซี่ยงไฮ้` finds Shanghai, `ญี่ปุ่น` finds Japanese.
- All words must match; Thai typed without spaces is split (`ปูขนเซี่ยงไฮ้`); filler words ร้าน/รีวิว dropped; one typo forgiven in words of 5+ letters (`shangai`).
- Card text now also includes tagline, cuisine, awards, country, hashtags.
- New Studio fields "ชื่อเรียกอื่นสำหรับค้นหา": `restaurant.aliases` (article) and `aliases` (city). Not shown on the site; GROQ updated (`CITY` projection). The post script passes `restaurant.aliases` through as-is.
- Tested: unit cases incl. false positives, plus Playwright on the real-data build (Home/404 forms post to `/restaurants/?q=`).

---

## Session 2026-11-04 (night, after hand-offs) · Re-posting keeps Studio values

`scripts/post-article.mjs` used `createOrReplace`, so pushing a `posts/*.md` again wiped everything the Boss set later in Studio. Example: the price band of the 6 Shanghai reviews, which is empty in their files.
- **Now:** when the article already exists, every top-level field the file leaves empty (`undefined`, `null`, `''`, `[]`) keeps its Sanity value. `restaurant` is merged field by field. The log lists the kept fields.
- **Follow-up, same night: patch only what changed.** The Boss asked to remove the "file only for the first post" rule.
  - For an existing article the script now compares the file with its previous version in git: `--since <ref>` (the workflow passes `github.event.before`); without it, the file's previous commit, or HEAD when the file has uncommitted edits.
  - It sends a patch with only the changed fields: frontmatter fields, `restaurant.<field>`, `body`, and per dish `dishes[_key=="…"].name/description/glassesOff/image`. A dish is matched in Sanity by its previous name, else by position. If the dish count changed, the whole list follows the file. Fields cleared in the file are unset. A slug change is refused.
  - The empty-keeps merge above is now only the fallback when there is no previous version (no git history).
  - Tested end to end against a mock Sanity client in a temporary git repo:
    - editing the SEO title and one dish text → a patch of exactly those 2 paths, with the Studio price band, Event tag and another dish's Studio edit untouched;
    - no change → nothing sent;
    - manual re-run → the same 2 paths.
- It also warns when a Studio draft (`drafts.<id>`) exists, since publishing that draft would overwrite the file's version.
- Merge logic unit-tested with mock data. Dry runs are unchanged (they exit before reading Sanity).
- Role hand-offs written in `docs/handoff/` (posting & translation · brand & graphics · web design).

---

## Session 2026-11-04 (late evening, 2) · Design pass: at-a-glance card, city list, price pills, footer, lede + quote

The Boss picked all five design suggestions:
1. **City page list on phones:** thumbnail left, text right (`.city-row` grid in `site.css`; `cr-photo` / `cr-main` / `cr-side` in `city/[slug].astro`).
2. **"สรุปสั้น / At a glance" card** at the top of every review (`[...article].astro`, `.glance*` CSS). It replaces the old 3-cell facts row, shows the price band (+ Event/AD), cuisine, awards and city/area, has one button per glasses-off dish, and "ดูทั้ง N จาน ↓" to the menu. New i18n keys `atGlance` and `seeCourses`.
3. **Price band as a pill** (`.band-pill`) on cards and city rows. Cards now read `a.billBand`, which `withPriceBand()` also copies to `restaurant.priceBand`, so the finder filter was already right.
4. **Footer:** smaller line-art band on phones; footer links in two columns on phones (`.foot-grid`).
5. **Article intro:** the first paragraph is a larger teal lede. The Boss's standout line (Studio "ประโยคเด่นของบอส", `a.quote`) is now shown as a pull quote after the intro. It was never rendered before (bug).

Checked with real content (mkseed method above) at 390/1280, then crawl + smoke test on the sample build: no errors.

---

## Session 2026-11-04 (late evening) · Bug check with real content

**How it was checked:**
- The sample build, plus a temporary build from the real `posts/*.md` (6 Shanghai articles, Thai and English, local photos).
  - Generator script: scratchpad `mkseed.mjs`, not committed.
  - It rewrites `src/data/seed.ts` and `public/pv-live/`; restore both afterwards with `git checkout src/data/seed.ts && rm -rf public/pv-live`.
- A Playwright crawler opened every internal page at 360 and 1280 px and checked:
  - JS/console errors and HTTP errors;
  - broken links and images, and images without alt;
  - duplicate ids and the h1 count;
  - horizontal overflow;
  - reveal elements left hidden;
  - Thai left on English pages.
- Also checked: JSON-LD parses, canonical, og:image files exist, sitemap, hreflang targets, RSS (Thai only), search / price filters / course jumps / glasses-off jump / language switch.

**Fixed:**
- Footer on English pages said "บอสพาชิม — Eat Like The Boss"; now just "Eat Like The Boss" (`SiteFooter.astro`).
- The home page highlighted the "Tasting Notes" menu tab; now nothing is highlighted on home (`index.astro`: `active="home"`).
- Sample content now goes through the same clean-up as Sanity content: `stripCtrl` and `cleanDish` in `getAllArticles()`. This drops stray \v characters and the repeated "จานนี้อร่อยจนบอสต้องขอถอดแว่นชิม" quote. The live site already did this.

**Everything else passed.**

---

## Session 2026-11-04 (evening) · English translations live, switcher in the article, English menu

- **Translations live:** PR #14 published the 6 Shanghai English translations through post-article.yml (run succeeded).
- **Language switcher moved** from the header into the article (`LangSwitch.astro`, under the breadcrumb).
  - The Boss's point: only articles are translated, so a switcher in the site header promised more than there is.
  - It reads "อ่านภาษา: ไทย · English", or "Read in" on English pages.
  - The header is now logo + menu on one row on desktop.
- **Menu in English** (the Boss's choice, "English + small Thai").
  - Desktop: English names (Restaurants / Destinations / Tasting Notes / Glasses Off Awards / About the Boss) with the Thai name small underneath. There is no small name on English pages.
  - Phones and the compact bar: short English names only (Search / Cities / Notes / Awards / About), so all five fit at 320px.
- **Sample data:** `src/data/seed.ts` now has an English translation of the Tokyo sample, so the sample build (and CI) covers translated pages and the switcher.
- Checked with Playwright at 320/390/1280 on Thai article, English article and home: no overflow, no JS errors. Smoke test of all pages passes.
- **Studio fixes after the Boss's screenshots:**
  - **Thai lines overlapped** in the language panel and dialogs: @sanity/ui `<Text>` trims line boxes to the Latin cap height. Replaced with `components/Line.tsx` (line-height 1.6).
  - **An empty "ไม่มีชื่อ" EN draft kept coming back after "ลบบทความ…".** The delete now removes `drafts.<id>` and `<id>` in one transaction, then closes the pane (`usePaneRouter().closeCurrent()`), so an open form cannot write it back. It also shows a toast.
  - Not reproducible here (no Studio login). If it still returns, check which tool recreates it.

---

## Session 2026-11-04 (night, later) · 404 with search, "all in this city" link, first English translation draft

- **404** (`src/pages/404.astro`, served by `not_found_handling: "404-page"`): a search box (goes to `/restaurants/?q=`), buttons to the destinations and home pages, and the 3 latest reviews.
- **Article "More Tasting Notes":** a "ดูทุกร้านใน<เมือง>" link to the city page when the suggestions are from the same city. The related section itself already existed: same city first, then same series.
- **First English translation draft:** `drafts/translations/meet-the-bund.en.md`.
  - It passes the `--dry` check: 15 dishes, glasses-off kept, id `article-meet-the-bund-en`, linked to `article-meet-the-bund`.
  - It waits for the Boss's approval, then moves to `posts/`.
- **Missing articles in Studio:** "บทความ (ภาษาไทย) → ทั้งหมด" showed only Fu He Hui, Taian Table and Wu You Xian; all 6 are published and live.
  - Cause: Meet The Bund, Sui Tang Li and Yong Fu have drafts whose `language` was switched to en by hand, before the field was locked. Studio lists use the draft, and the Thai lists filtered on `language == "th"`.
  - Fix (`studio/sanity.config.ts`): Thai lists = `!defined(translationOf)` (every original). Translation lists need `defined(translationOf)`. New to-do "ภาษาเพี้ยน" lists originals whose language isn't th.
  - The Boss fixes each with "เปลี่ยนกลับเป็นบทความภาษาไทย" in tab 5, or by discarding the draft. Never publish those drafts as they are.
- "หอยปีกนก" = torigai (Japanese cockle), per the Boss; the translation draft is updated.
- **All 6 Shanghai English drafts** are in `drafts/translations/`: meet-the-bund, sui-tang-li, fu-he-hui, taian-table, wu-you-xian, yong-fu.
  - Each passes `npm run post -- <file> --dry`: dish and image lists match the Thai source, no Thai left, glasses-off kept, SEO lengths OK.
  - They wait for the Boss's approval, and the uncertain terms were sent to the Boss.
  - **Approved 4 Nov 2026** after the Boss's corrections (ใบชะพลู = betel leaves, ลิลลี่บับ = lily buds). Moved to `posts/<slug>.en.md`; the merge to main publishes them through post-article.yml. Any "+ English" Studio draft with the same id (`article-<slug>-en`) should be discarded.
- **Share counts:** Cloudflare Web Analytics has no click/custom events, so counting LINE/Facebook shares needs something extra (a small Worker endpoint or a cookieless analytics service). Asked the Boss.

---

## Session 2026-11-04 (night) · Lighter pages, less duplicated code

Measured first. A built page is 17–20 KB gzipped. About half of it is the inlined `site.css` (≈38 KB raw), which stays inlined on purpose: most readers land on one article from LINE/Facebook, and inline CSS paints fastest on that first visit.
- `public/img/logo-gold.webp`: 640px → 400px (2× its 200px display), 62 KB → 36 KB. It loads on every first visit.
- Page scripts (share bar, to-top, slider, map, filters, reading progress, awards glasses, contact form) moved from `is:inline` to normal Astro `<script>`. They are now minified and deduplicated: the share bar's script used to be printed twice on articles.
  - Kept inline: the head `fx-on` line, and `Effects.astro`, because photos fade in from it and must not wait for a download.
- `Icon.astro`: size comes from the `width`/`height` attributes only. The repeated inline `style="width;height"` is gone, and `.ico` no longer forces 20px. CSS overrides like `.nav-ico` still win.
- `NavLinks.astro`: one menu-links component for `SiteHeader` and `MiniBar` (was copy-pasted).
- `_headers`: `/og/*` cached 7 days.
- Checked with Playwright on every page at 390 and 1280: no JS errors, icons sized right, share bars ready, slider/filters/map/progress/to-top working.

---

## Session 2026-11-04 (late night, fix 2) · Language locked; translations only from the button

The Boss's screenshot showed the real problem. On the Thai article (Sui Tang Li), the Boss had switched the "บทความนี้เป็นภาษา" radio to English. That turned the Thai article itself into a "translation", and the `translationOf` picker cannot offer the document itself, so it showed only other restaurants. The "+ English" buttons only appear while the article is Thai.
- `language` is now **read-only**: new articles are Thai; translations get their language from the button.
- `translationOf` is read-only and hidden until set (the button sets it).
- The panel is the first field in the tab. Its "+ language" buttons are now primary-coloured.
- A Thai article that was switched by hand shows **"เปลี่ยนกลับเป็นบทความภาษาไทย"**, which patches the draft back to Thai.
- The translation lists have no "+" (it would make a Thai article). Translations are made from the Thai article.
- Sui Tang Li had an unpublished draft with language = en. It must not be published as is: fix it with the button, or discard the draft.

---

## Session 2026-11-04 (late night, fix) · "+ English" now creates the translation itself

The Boss tried "+ English" after PR #10. The new translation could not be linked to the article it came from; the picker showed other restaurants only.
- Cause: not reproducible here (no Studio login). Two likely culprits were removed:
  - the create-intent template (its parameters may not reach the template);
  - the `series == $series` filter on `translationOf` (it hides the right article when series differ).
- Fix (`studio/components/TranslationsPanel.tsx`): the button now writes the draft itself and opens it.
  - The draft id is `<thai id>-<lang>`, the same ids `scripts/post-article.mjs` uses.
  - It copies the Thai article and is already linked through `translationOf`.
  - If that translation already exists, the button just opens it.
  - The buttons appear only once the Thai article is published (a strong reference needs a published target).
  - `translationOf` picker: every Thai article. The template `article-translation` is gone.
- If the Boss's test left a stray translation, it shows in the panel / คำแปล list; delete it with "ลบบทความ…".

---

## Session 2026-11-04 (late night) · Studio translations reworked, to-do lists, safer delete, open on site

The Boss: Studio's translation fields were hard to use — you couldn't tell which article a translation was linked to.
- **Tab "5 ภาษา / คำแปล"** (`studio/schemas/index.ts`, panel `studio/components/TranslationsPanel.tsx`):
  - A read-only panel lists every language of the article (Thai original + translations, drafts marked) as clickable cards, live-updating.
  - On a Thai article, buttons **+ English / 日本語 / 中文** create a translation through the initial-value template `article-translation` (`studio/sanity.config.ts`). It copies everything except ids and SEO texts (restaurant, city, cover, gallery, dishes, Bill, Visit, slug, and the Thai text to translate over) and sets `language` + `translationOf`. The template is hidden from the normal "new document" menu.
- **`translationOf`:** the picker only offers Thai articles of the same series. It is required on translations, and validation blocks a second translation in the same language.
- **Slug** is unique per language (a translation keeps the Thai slug).
- **Article preview** everywhere (lists, reference picker): the restaurant name first, then `TH/EN/JA/ZH · city · Visit`.
- `@sanity/ui` is now a direct Studio dependency. Studio redeploys when this reaches main.
- **Studio menu** (`studio/sanity.config.ts`):
  - **บทความ (ภาษาไทย):** ทั้งหมด / by series / แยกตามเมือง.
  - **คำแปล:** split by language.
  - **งานที่ต้องทำ:** lists that empty themselves as things get fixed:
    - new drafts never published;
    - drafts with unpublished edits;
    - no price band;
    - no Visit;
    - no cover;
    - photos without alt;
    - SEO missing or wrong length;
    - Thai articles with no English translation.
- **Article actions** (`studio/components/actions.tsx`):
  - **เปิดดูบนเว็บ** opens the live URL (same rules as `articleUrl()`).
  - **ลบบทความ…** replaces Delete. Its dialog says which web page disappears, and refuses while other documents (translations) still reference the article, with links to them.
- **SEO counters** (`studio/components/CharCount.tsx`): live count on Meta title (≤60) and description (120–155, warning outside).
- The draft lists use `_id in path("drafts.**")`. If they come up empty although drafts exist, check how the Studio version lists drafts.
- Not testable here: the Studio form needs a Sanity login and network. The schema validates (0 errors) and `sanity build` passes. Ask the Boss to try "+ English" on one article.

---

## Session 2026-11-04 (night, final) · Machine translation off for good

PR #8 (Google Translate in a new tab) went live and the Boss found it still did not work ("ไม่รอด"): turned off. The switcher is back to real translations only (hidden on Thai-only pages). Kept from PR #8: the desktop header layout (language row above the menu) and the tighter phone pills. Don't add Google Translate back; the way to other languages is real translations (`posts/<slug>.<lang>.md`, Boss approves first).

---

## Session 2026-11-04 (night, last) · Language switcher back (real translation first, else Google in a new tab)

The Boss asked where the translator went (it was hidden: no article has a translation yet) and chose "both".
- `SiteHeader.astro`: the switcher shows TH · EN · 日本語 · 中文 on every page. A real translation (`posts/<slug>.<lang>.md` or Studio) opens in place; otherwise `translate.google.com/translate?…&u=<page>` opens in a new tab with a small new-tab icon (`external` in `Icon.astro`; hidden on phones). The site itself is never wrapped by Google's proxy, so going back to Thai is just the original tab. The Google page may still show missing images; real translations are the fix.
- Header layout (desktop): logo on the left; the language row sits small above the menu on the right (it used to drop under the logo). Phones: logo keeps its size (84px under 380px wide), language pills tighter.
- Open: the Boss wants real translations too — ask which articles/languages first; drafts go in `posts/<slug>.<lang>.md`, published only after the Boss approves.

---

## Session 2026-11-04 (night, later) · Share image redesigned for LINE previews

The Boss: the LINE link preview looked bad. Cause: LINE shows the share image as a square cut from the middle, and the old design put the logo and name on the left (cut off), under a teal wash that dulled the food.
- `src/lib/og.ts` now: photo in its real colours, darkened only behind the logo (top) and text (bottom); logo, "Tasting Notes No.", restaurant name (two balanced lines max) and city · cuisine all centred inside the middle 560px, so a square crop keeps everything. Chinese/Japanese/Korean characters are dropped from the image only (the fonts have none; a CJK font would add ~10 MB).
- `og:image` carries `?v=2` (`src/pages/[...article].astro`): LINE and Facebook cache previews by URL, so bump it when the design changes. Links already shared in a chat keep their old preview there; new shares pick up the new one.

---

## Session 2026-11-04 (night) · Easier-to-read menus (website + Studio)

The Boss asked for the "tab menu" to be easier to read: both the website's top menu and the Studio tabs.
- **Website menu** (`SiteHeader.astro`, `MiniBar.astro`, one list `NAV_ITEMS` in `src/lib/i18n.ts`): every item has a line icon (`search`, `pin`, new `book`, `glasses`, new `user` in `Icon.astro`). Desktop: pill tabs, the current page is a gold-edged pill. Phone (≤720px): five icon tabs in one glass box that always fit 320–430px — no more sideways scrolling or cut-off "Glasses Off Awar"; the awards tab reads "Awards" on phones (`.nav-long` hides "Glasses Off "). The compact bar on phones shows the same five tabs, full width, without the logo.
- **Studio tabs** (`studio/schemas/index.ts`, icons from `@sanity/icons/<Name>` subpaths — now a direct Studio dependency): article tabs numbered in fill order "1 ร้าน & บทนำ · 2 รายการจาน · 3 ราคา & วันที่ไป · 4 SEO · 5 ภาษา" (+ "ทุกช่อง"); settings tabs short + icons, same words as the site menu; the 40-field "All fields" tab is hidden there. Group names (`main`, `meta`, …) are unchanged, so no content moves.
- Studio redeploys itself when this reaches main (deploy-studio.yml).
- **Done after merge (PR #6, 4 Nov 2026):** Studio redeployed; Actions → Fill settings texts run (dry, then apply: 24 empty fields filled + "วิธีรีวิว" item 1 reworded to the price-band policy). The Boss then set the price band on the 6 Shanghai articles, added the Web3Forms key (test message arrived) and checked the site on iPhone: all fine.

---

## Session 2026-11-04 (very late) · Bill as price band, Studio by page, gallery, share, contact, share images

**New policy from the Boss:** the site never says whether a meal was invited or paid. The Boss's Bill shows an approximate **price band** (฿฿/฿฿฿/฿฿฿฿); special event meals carry an **Event** pill. AD is kept as an option for paid posts (advertising disclosure); the Boss may decide to drop it.
- **Studio article, Bill tab:**
  - `billBand` is the band shown on the site.
  - `tag` is "มื้ออีเวนต์?" (none / Event / AD).
  - `bill` is the real price: optional, never shown, used by `priceBandFromBill()` (<3,000 / <8,000 / 8,000+ THB, rough FX).
  - `restaurant.priceBand` is now hidden; older values still count.
  - Awards are a plain editable list (the tags input could not edit an existing award).
  - New `gallery` (ambience / chef photos, with captions) shows after the intro, before the dishes; posts support `gallery:` in frontmatter.
  - The cover sits in the main tab.
- **Studio settings (`ตั้งค่าเว็บ / ข้อความทุกหน้า`):** one tab per page, plus new fields for texts that were fixed in code (home search placeholder / titles, article menu title / glasses quote / share title, destinations + map titles, contact title / intro, footer rights).
  - Defaults are in `src/data/settings.json`.
  - **Actions → Fill settings texts** (manual, dry first) fills empty fields with these, and rewords the old "invited meal" texts only if never edited (`scripts/fill-settings.mjs`).
- **Share bar** (`ShareBar.astro`): LINE, Facebook, copy link, and the phone share sheet. Shown at the top facts and at the end of the article.
- **Contact page `/contact/`:** recommend a restaurant / work with the Boss / other. Sends via Web3Forms (key in settings); without a key it opens the reader's email app. Linked from the footer and About.
- **Share images:** `src/lib/og.ts` renders `/og/<article>.jpg` (1200×630, ~70–90 KB) at build: cover + teal fade + gold frame + logo + "Tasting Notes No." + name + tagline + city · cuisine · visit.
  - Uses resvg (HarfBuzz shaping) + sharp (JPEG); both are dependencies, marked `vite.ssr.external`.
  - SARA AM is decomposed before rendering (the TTF mis-positions it in resvg).
  - Fonts in `src/og/fonts` (OFL; Cormorant subset to Latin).
- **Home ticker removed; CSS inlined.**

---

## Session 2026-11-04 (late night) · iPhone fixes

The Boss said the effects look quite broken on a phone. WebKit can't be installed in the container (no download access), so the fixes target known Safari behaviour. All taps and layouts were re-tested in Chromium iPhone emulation.
- **Fixed elements moved out of `.elb-page`:** the compact bar (now `src/components/MiniBar.astro`, rendered by `Base.astro`) and the reading-progress line. `.elb-page` is a CSS query container (`container-type`), and Safari can make a container the anchor for `position:fixed` children, so the bar scrolled with the page instead of sticking to the screen. Rule: **never put `position:fixed` UI inside `.elb-page`**; its phone CSS must use `@media`, not `@container`.
- The hexagon clip uses an explicit polygon (no `clip-path: inherit`).
- `translateZ(0)` on rounded photo wrappers keeps zoomed photos inside their corners in Safari.
- Still waiting on the Boss's screenshots / device to confirm on a real iPhone.
- **Home ticker removed** (the Boss found the restaurant strip above The Index odd on phones: on touch it had to be swiped by hand).
- **Lighthouse (mobile, local preview):** Accessibility 96–100, Best Practices 100, SEO 100, CLS ≈ 0 on every page tested.
  - CSS is now inlined (`build.inlineStylesheets: 'always'`, ~8 KB gzipped), which removed the ~0.9 s render-blocking request.
  - Slides are `div role=group`, not `article`.
  - Map pin names match their visible label.
  - Remaining warning: pins very close together at the Asia zoom (use the Thailand zoom).
  - The local preview serves full-size photos, so its LCP/performance score is lower than the live site, where photos come resized from the Sanity CDN.

---

## Session 2026-11-04 (night) · Translation fix, copy protection, city regions

- **PR #3 was merged before the effects bug-fix commit (`2539cf3`) was pushed.** That commit ships with this branch.
- **Google Translate fallback removed.** On the live site the proxied page broke: "TH" could not get back, and images showed as alt text, because Google rewrites every link and image. The switcher now shows only real translations and is hidden on Thai-only pages. Real translations = `posts/<slug>.<lang>.md` (see CLAUDE.md).
- **Copy protection (deterrent):**
  - `robots.txt` disallows AI-training crawlers (GPTBot, CCBot, Google-Extended, ClaudeBot, Applebot-Extended, Bytespider, meta-externalagent…). Search engines and AI search tools stay allowed.
  - `<meta name="robots" content="max-image-preview:large, noai, noimageai">`.
  - Photos: no right-click (shows a toast), no drag, no iOS long-press save.
  - Copied text of 80+ characters gets "— ที่มา: บอสพาชิม · Eat Like The Boss + URL".
  - Footer rights notice (i18n).
  - JSON-LD: cover as ImageObject with creditText/copyrightNotice/creator/acquireLicensePage, plus copyrightHolder/copyrightYear.
  - A screenshot always works; the Boss's photos also carry a logo watermark.
- **City regions fixed in Sanity:** Actions → Fix city regions was run (dry, then apply). 7 cities moved jp/cn → asia. A Boss-made city "Istalbul" (typo for Istanbul) was already on europe; `CITY_COORDS` has both spellings.
- **Housekeeping:** removed 6 unused CSS classes.

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
- **Bug fixes from an independent review of the effects** (all verified with Playwright):
  - Printing no longer blanks content.
  - A single-slide slider shows its text.
  - The hidden compact bar no longer casts a shadow band.
  - The ticker repeats items (shown only with ≥6 restaurants) and is a swipeable strip on touch screens.
  - Photos that already failed show their alt text.
  - **No global `scroll-behavior:smooth`:** `#dish-N` links from other pages land instantly with no reveal; in-page links scroll smoothly on click.
  - The compact bar needs ~40px of upward scroll, ignores scrolls we started, and stays hidden while the dish menu is stuck (so the course nav never jumps). `html{scroll-padding-top:72px}`.
  - Hover-only effects (spotlight, button shine, ticker pause) only apply on mouse devices.
  - Slider text animates only when a slide is chosen (not while swiping). Ken Burns is a transition, so it no longer snaps.
  - Tap targets are ≥44px.
  - Reveal reads all positions before writing; the card tilt updates once per frame.

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
