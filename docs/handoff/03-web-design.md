# Hand-off · Claude ฝ่ายเว็บไซต์ดีไซน์

สำหรับ Claude ที่ดูแลหน้าตาและการทำงานของ eatlikeboss.com (โค้ดใน repo นี้)
อ่าน `CLAUDE.md` ก่อนเสมอ (ตาราง "Where things live" บอกว่าแก้อะไรที่ไฟล์ไหน) และ `docs/HANDOFF.md` (บันทึกเทคนิคละเอียดทุกเซสชัน + วิธีทดสอบ)
อัปเดตล่าสุด: 4 พ.ย. 2026

---

## 0. ข่าวล่าสุด
- **23 พ.ย. 2026 17:40 (บอสตัดสินแล้ว · ฝ่ายแกนกลาง): ซีรีส์บอสพาชิล** · ชื่ออังกฤษ **"Boss Go Chills"** (บอสเลือก 24 พ.ย.: ตัวใหญ่ทุกคำ แทนข้อเสนอ "The Boss Chills") · เลขกำกับ **Ep.N** แบบซีรีส์อื่น (ไม่ใช่ Chill No.) · **ย้าย 16 ร้านนี้เท่านั้น:** aimee · burapa · chenin · folk-lane · gaston · ginza-shabu-shabu-koubai · heiyin · ise-suriwong · namsu · niku-yama · odashi-hakkei · pari · rangoon-tea-house-iconsiam · sri-trat · sris-room · yardbird · **คงไว้ในบอสพาชิม (ไม่ย้าย):** clara · cross-2022 · cross-x-scotch · kwantip · ginza-koara · Shin Yeh / หมก / Ubon24 ยังไม่ได้ขึ้นเว็บ ใช้ series ใหม่ตอนลงเว็บ · ทุกบทที่ย้ายต้องมี 301 จาก `/review/<city>/<slug>/` (รวม `/en/ /ja/ /zh/`) · key และเส้นทาง URL ฝ่ายเว็บเลือกได้ (เช่น `chill` · `/chill/<city>/<slug>/`)
- **23 พ.ย. 2026 (ฝ่ายโพสต์ · บอสสั่ง): ซีรีส์ใหม่ "🛋️ บอสพาชิล" สำหรับร้าน casual** · บอสสั่งให้ฝ่ายเว็บเตรียมเว็บรองรับ แล้วย้ายร้าน casual เก่าเข้าซีรีส์นี้ · บทความแรก Fav. Bangkok (Neo-Korean bistro bar ศาลาแดง, `฿฿ · AD`, visit Nov-2026) จะลงต่อเมื่อเว็บพร้อม
  1. **เพิ่มซีรีส์ใน `SERIES` (`config.ts`)** · (บอสเลือกแล้ว ดูบรรทัดบนสุด): key `chill` · th "บอสพาชิล" · en "Boss Go Chills" · สีและเส้นทาง URL ฝ่ายเว็บเสนอ (เช่น `/chill/<city>/<slug>/`) · ซีรีส์แยกตามกฎ 13 พ.ย. (เลข Tasting Notes No. นับเฉพาะ `review` · ซีรีส์นี้ใช้ Ep.N บอสเลือกแล้ว) · ใส่ในเมนู Notes (`NavLinks.astro` / `i18n.ts`) หน้าซีรีส์ ตัวกรองหน้า Restaurants และ `posts/_template.md` (`series: review | history | drinks | chill`) + `scripts/post-article.mjs` + Studio schema
  2. **ยังเป็นร้านอาหารจริง:** การ์ด กล่องข้อมูลร้าน The Boss's Bill (฿/฿฿) แผนที่ หน้าเมือง Repeat visits ต้องทำงานเหมือนรีวิว · UI ใช้ไอคอนเส้นตามกฎ ไม่ใช้ emoji 🛋️ (emoji ใช้เฉพาะชื่อเรื่องบนโซเชียล)
  3. **ย้ายร้าน casual เก่า:** เปลี่ยน `series:` ในไฟล์ `posts/<slug>.md` เป็นซีรีส์ใหม่ · **URL เก่า `/review/<city>/<slug>/` ห้ามหาย** ต้องมี 301 ใน `public/_redirects` ทุกบท (รวม `/en/ /ja/ /zh/`) · เลข Tasting Notes ของรีวิวที่เหลือจะเลื่อน แจ้งบอสก่อน · รันกระบวนการ pull-articles ก่อนแก้ไฟล์ที่บอสอาจแก้ใน Studio
     - **รายชื่อรอบอสยืนยัน** (ผมคัดจาก billBand ฿฿ ไม่ใช่ทุกร้าน ฿฿ จะเป็น casual เช่น Florilège 2★ / Khao 1★ / T+T / Wu You Xian ที่เป็นมื้อกลางวันไฟน์ไดนิ่ง ไม่ควรย้าย): aimee · burapa · chenin · clara · folk-lane · gaston · ginza-koara · ginza-shabu-shabu-koubai · heiyin · ise-suriwong · cross-2022 · cross-x-scotch · kwantip · namsu · niku-yama · odashi-hakkei · pari · rangoon-tea-house-iconsiam · sri-trat · sris-room · yardbird · และร้านที่บอสเรียกว่า casual ในฝ่ายนักเขียน: Shin Yeh, หมก (mok / mok-ubon), Ubon24 (ถ้าอยู่บนเว็บแล้ว) · **บอสติ๊กแล้ว: ย้าย 16 ร้านตามบรรทัดบนสุด**
  4. หลังเว็บพร้อม แจ้งกลับที่ §0 ของ `01-posting-translation.md` ฝ่ายโพสต์จะลง `posts/fav-bangkok.md` ด้วย `series` ใหม่
- **23 พ.ย. 2026 (ฝ่ายเว็บ · ทำแล้ว):** รูปแชร์แยกตามหน้าต่อเข้าเว็บครบ · รูปแชร์หน้าเมือง CITY EDITION ทำแล้ว (`/og/city/<slug>.jpg`) · ลายเส้นใช้ที่หน้า 404 (ฝาครอบ) ค้นหาไม่เจอ (เมนู) และหน้าซีรีส์ (มีดส้อม / ลูกโลก / องุ่น) · ปกที่เปลี่ยนไฟล์ชื่อเดิมตอนนี้ส่งเข้า Sanity เองได้ (`--resend cover`) · ยังไม่ได้ทำ: ไอคอนแบบวงกลมเขียวเข้ม และไอคอนสถิติ `countries` / `cities`
- **17 พ.ย. 2026 (ฝ่ายแบรนด์ · บอสเลือก final):** **ไอคอนประจำแบรนด์ 28 ตัว** แทนไอคอนทั่วไปตรงที่ยังไม่มีเอกลักษณ์ · ไฟล์ `public/img/brand/icons/<ชื่อ>.svg` (กริด 24, เส้น **1.0** ปลายมน `stroke="currentColor"`, บอสเลือกเส้นบางเท่าเส้นทองบนเว็บ ห้ามทำหนาขึ้น) · ภาพรวม + ตัวอย่างใช้จริง: `docs/handoff/signature-icons-preview.jpg` · **บอสสั่งให้ฝ่ายแบรนด์ต่อเข้าเว็บใน PR นี้เลย (17 พ.ย.)**: เพิ่มเข้า `Icon.astro` แล้ว (ไอคอน signature มี class `ico-sig` เส้น 1.0; bill pin calendar award chef glasses clock เปลี่ยนเป็นแบบใหม่ทั้งเว็บ) + `cuisineIcon()` ใน `config.ts` · ใช้แล้วตามนี้ ถ้าฝ่ายเว็บอยากปรับตำแหน่ง/ขนาดทำได้เลย:
  1. **หมวดอาหาร** `cuisine-japanese / -chinese / -thai / -french / -italian / -spanish / -nordic / -modern / -other` (ชื่อตรงกับ key ใน `src/data/cuisines.json`) แทน `Icon name="cuisine"` ทุกจุด: ปุ่มตัวกรองหน้าค้นหาร้าน ป้ายบนการ์ด กล่องสรุปและ At the table บนหน้ารีวิว
  2. **ข้อมูลร้าน** `bill` `visit` `pin` `chef` `award` `glasses-off` `read-time` แทน bill/calendar/pin/award/glasses/clock เดิม · (แบบวงกลมเขียวเข้มไอคอนทองอ่อนในภาพตัวอย่าง ยังไม่ได้ทำ ฝ่ายเว็บพิจารณาได้)
  3. **สารบัญ In This Issue** 01 `index` · 02 `history` · 03 `glasses-off` · 04 `destinations` · 05 `the-boss` ข้างเลข (ประมาณ 28–32 px)
  4. **หน้า About:** การ์ด How the Boss reviews I `bill` · II `honest` · III `glasses-off` · หัวข้อ Why honest matters `honest`
  5. **หน้าติดต่อ:** ปุ่มหัวข้อ แนะนำร้าน `recommend` · ร่วมงาน `collab` · อื่นๆ `letter`
  6. **หน้าจุดหมาย / หน้าร้าน:** จำนวนร้าน `restaurants` (ทำแล้ว) · ยังไม่ได้ทำ: ตัวเลขสถิติ ประเทศ `countries` · เมือง `cities` และหน้าซีรีส์ `history` / `drinks`
  ใช้ขนาด 20 px ขึ้นไป (เส้นบาง) · ไม่มีไอคอนดาว · ถ้าตรงไหนไม่เหมาะหรืออยากได้ไอคอนเพิ่ม เขียนถามใน §0 ของ `02-brand-graphics.md`
  · ระหว่างดูเว็บเจอคำผิดภาษาอังกฤษในหน้า About: "200 + **Stared** restaurant visit" ควรเป็น "200+ **starred** restaurant visits" (ข้อความอยู่ใน Studio → ตั้งค่าเว็บ → เกี่ยวกับบอส) และ "Panelist**Tatler**" ในหน้าแรกส่วน "เกี่ยวกับบอส" ขาดเว้นวรรค
- **17 พ.ย. 2026 (ฝ่ายแบรนด์ · asset ใหม่):** ลายเส้นชิ้นเดี่ยว 24 ชิ้น สไตล์เดียวกับลายเส้นโต๊ะอาหาร (แก้วไวน์ แชมเปญ ขวด ฝาครอบ แว่นกลม ซูชิ ราเมน ถ้วยชา มีดส้อม เทียน เมนู แก้วคูป องุ่น ลูกโลก หอยนางรม ชุดสาเก วิสกี้ ดีแคนเตอร์ หมวกเชฟ เค้ก เอสเพรสโซ ติ่มซำ ชามเบญจรงค์ ที่เปิดไวน์) · สี: ทองบนเขียวเข้ม เขียวเข้มบนครีม ขาวบนรูปเข้ม หมึกสำหรับงานพิมพ์ · ห้ามเติมสีทึบ ห้ามผสมสองสีในชิ้นเดียว แว่นกลมใช้เฉพาะจานถอดแว่น / Glasses Off Awards · ไฟล์ครบ 4 สี SVG + PNG 960 px: Drive `2026 Brand Kit/graphics/lineart-spots/` (preview.jpg ดูทั้งชุด) · ใน PR นี้ใส่ SVG สีทองและเขียวไว้ที่ `public/img/brand/lineart/lineart-<ชื่อ>-<gold|teal>.svg` (viewBox 240, เส้น 3 ปลายมน) · ไอเดียที่ใช้ได้: หน้า 404 / ค้นหาไม่เจอ แทนภาพฝาครอบเดิม, ตัวคั่นหัวแต่ละส่วนบนหน้าแรก, ไอคอนใหญ่ของหน้าซีรีส์ (องุ่น = บอสพาดื่ม, ลูกโลก = มื้ออาหารเปลี่ยนโลก), หน้า About / ติดต่อ · **ถ้าเห็นว่าเหมาะ อยากลองใช้ที่อื่นเพิ่ม** (หน้าไหน งานไหน หรืออยากได้ชิ้นใหม่/สีใหม่ ขนาดอื่น) เขียนถามหรือเสนอไว้ใน §0 ของ `02-brand-graphics.md` ได้เลย ฝ่ายแบรนด์จะดูให้
- **17 พ.ย. 2026 (ฝ่ายแบรนด์ บอสสั่ง):** 
  1. **รูปแชร์แยกตามหน้า** (1200×630, ข้อความอยู่ในกลาง 560 px ตามกฎ LINE) อยู่ใน PR นี้ที่ `public/img/og/`: `og-review.jpg` (/review/) · `og-history.jpg` (/history/) · `og-drinks.jpg` (/drinks/) · `og-restaurants.jpg` · `og-destinations.jpg` · `og-awards.jpg` · `og-about.jpg` · `og-contact.jpg` · รบกวนส่ง `image="/img/og/og-<page>.jpg"` ให้ `Base.astro` ในแต่ละหน้า (หน้าแรกกับหน้าอื่นยังใช้ og-default / Studio) · ถ้าเปลี่ยนไฟล์ภายหลังให้เพิ่ม `?v=`
  2. **หน้าเมือง** ขอให้สร้างรูปแชร์อัตโนมัติแบบเดียวกับบทความ (`og.ts`): รูปปกของรีวิวล่าสุดในเมืองนั้นสีจริง เงาเขียวเข้มเฉพาะบนและล่าง · โลโก้ Crest TH foil กลางบน · กลางภาพ: "CITY EDITION" (Cormorant SC ห่าง สีทองอ่อน) เส้นทองสั้น ชื่อเมืองอังกฤษ Cormorant Garamond 600 ตัวโต + ชื่อไทย Noto Serif Thai · ล่าง "eatlikeboss.com" · ตัวอย่างโทนดูจาก `og-restaurants.jpg`
  3. **ไทม์ไลน์โลโก้หน้า About:** เปลี่ยน 4 รูปเป็นไฟล์ต้นฉบับคมชัด (2018, 2021, 2024, 2026) ชื่อไฟล์เดิม ขนาดเดิม 480 px · 2017 กับ #supportyourlocalrestaurant ไม่มีต้นฉบับที่ใหญ่กว่า คงไว้
  4. Design System กับ Brand Manual V5 ลงเรื่องสีซีรีส์ เลขแบบนิตยสาร สารบัญ และกฎรูปใหม่แล้ว (ตอบ §0 ของฝ่ายแบรนด์ 13 และ 16 พ.ย.)
- **17 พ.ย. 2026 (ฝ่ายแบรนด์):** ปก Ep.23 Chicken Marengo แก้คำโปรยแล้ว เป็น "ไก่นำโชคในคืนที่นโปเลียนเกือบแพ้" ตรงชื่อตอน · ไฟล์ใหม่อยู่ใน PR นี้ที่ `posts/images/chicken-marengo-1800/cover-3x2.jpg` (1800×1200 ชื่อไฟล์เดิม) และใน Drive "_มื้ออาหารเปลี่ยนโลก - History covers" (3:2 + 4:5) · รูปบนเว็บอยู่ใน Sanity ต้องอัปโหลดปกใหม่ให้ Ep.23 (Studio → ปก หรือ re-post ไฟล์นี้) เพราะ `--since` ไม่จับการเปลี่ยนไฟล์รูปอย่างเดียว · **เพิ่ม (บอสสั่ง 17 พ.ย.):** ปก Ep.01–05 คำโปรยเปลี่ยนให้ตรง tagline บนเว็บ ไฟล์ใหม่ใน PR นี้ (`julia-child-rouen-sole-meuniere-1948`, `persepolis-2500-year-celebration-1971`, `diner-des-trois-empereurs-1867`, `emperor-meiji-beef-1872`, `vatel-chantilly-feast-1671` → `cover-3x2.jpg`) ต้องอัปโหลดใน Sanity เหมือน Ep.23
- **13 พ.ย. 2026 (ฝ่ายแบรนด์ บอสเลือก):** โลโก้หลักเปลี่ยนเป็น **แบบมีชื่อไทย "บอสพาชิม"** (Eat Like the / BOSS / — บอสพาชิม — / GASTRONOMY BLOGGERS) รูปโปรไฟล์ IG/FB = Profile TH ไฟล์ SVG พร้อมใช้ใน `public/img/brand/logo-th/` (crest-th = แนวนอน, stacked-th = ซ้อน, profile-th = วงกลม; foil-flat สำหรับเว็บ) ชุดเต็มอยู่ Drive `2026 Brand Kit/logos/EatLikeTheBoss-LogoKit-2026/00-MAIN-TH (โลโก้หลัก)` **ฝากพิจารณา:** หัวเว็บบนจอคอมใช้ `crest-th-foil-flat.svg` แทน wordmark ได้ถ้าความสูงพอ (ตัวไทยต้องอ่านออก ไม่ต่ำกว่าราว 14 px) บนมือถือ/แถบย่อคง wordmark เดิม · รูปแชร์ทั่วไป (`og-default`) และหน้า About ใช้ stacked-th ได้ · favicon คง Monogram · ห้ามพิมพ์ชื่อไทยใหม่ด้วยฟอนต์เอง ใช้ไฟล์ SVG เท่านั้น หลังทำแล้วแจ้งบอสดูก่อน merge
  - **ฝ่ายเว็บ 13 พ.ย.: ทำแล้ว (PR logo-th)** หัวเว็บจอกว้าง ≥1241 px ใช้ crest-th-foil-flat กว้าง 340 px (ชื่อไทยสูงราว 16 px) · จอแคบกว่า/มือถือ/แถบย่อ คง wordmark · `og-default.jpg` เปลี่ยนเป็นโลโก้ stacked-th (ภาพอื่นเหมือนเดิม) · หน้า About ใช้ profile-th ในวงกลม (แทน Monogram) · favicon คง Monogram
- **13 พ.ย. 2026 (ฝ่ายโพสต์ บอสสั่งส่งให้ฝ่ายเว็บ):** ลงบทความซีรีส์ "มื้ออาหารเปลี่ยนโลก" (series `history`) เรื่องแรกแล้ว: `/history/julia-child-rouen-sole-meuniere-1948/` (`posts/julia-child-rouen-sole-meuniere-1948.md`) บอสอยากดูรูปแบบก่อนลงตอนต่อๆ ไป ฝากแก้ 3 จุด
  1. **เร่งด่วน:** หน้าบทความขึ้น "TASTING NOTES No. 124" ซีรีส์ history ถูกนับรวมในเลขรีวิว ทำให้รีวิวที่ visit หลังจากนั้นเลื่อนเลขไปหนึ่ง ควรให้ Tasting Notes No. นับเฉพาะ series `review` และให้ history แสดงเลขตอนแทน (เช่น "มื้ออาหารเปลี่ยนโลก Ep.1" ไฟล์โพสต์มี episode 1)
  2. ช่องแชร์ท้ายบทความเขียนว่า "ชอบร้านนี้?" ไม่เข้ากับบทความประวัติศาสตร์ ควรมีข้อความแยกตาม series (เช่น "ชอบเรื่องนี้?") และให้แก้ได้ใน Studio
  3. บนจอคอม คอลัมน์ข้อความแคบมาก ด้านขวาว่าง (บทความ history ไม่มีรายการจาน/ข้อมูลร้าน) ลองจัด layout ให้เต็มขึ้นสำหรับ history
  ภาพหน้าจอปัจจุบันขอดูจากเว็บจริงได้เลย หลังแก้รบกวนแจ้งบอสให้ดูอีกรอบ
  - **ฝ่ายเว็บ 13 พ.ย.: แก้ครบ 3 ข้อแล้ว (branch `history-ep`)** เลข Tasting Notes นับเฉพาะรีวิว ซีรีส์อื่นขึ้น Ep. · ข้อความแชร์ของซีรีส์อื่นแก้ได้ใน Studio "Share heading, history" · หน้าที่ไม่มีกล่องข้อมูลร้าน คอลัมน์ข้อความอยู่กลางจอ
- **9 พ.ย. 2026 (ฝ่ายแบรนด์):** โลโก้ใหม่ 2026 ใน PR นี้ (หัวเว็บ แถบย่อ favicon รูปแชร์ โมโนแกรม ตราบนรูป) ดูรายละเอียดใน HANDOFF.md · ถ้าปรับขนาดหัวเว็บ ให้ใช้ `logo-2026.webp` ห้ามกลับไปใช้ `logo-gold.*`
- **6 พ.ย. 2026 (ฝ่ายแบรนด์):** เพิ่มตราบนรูปแล้วใน PR นี้ สไลด์หน้าแรก = ตรากลม ELB ทอง มุมซ้ายล่าง · รูปเล็ก The Index = ลายเซ็นบอสสีทอง มุมซ้ายล่าง (CSS ท้าย `site.css` "Brand marks on photos") **กฎถาวร:** ตราต้องเล็ก ห้ามวางกลางรูปหรือใหญ่จนแย่งความสนใจจากอาหาร ใส่เป็นโค้ด ไม่ฝังลงรูป ถ้าจะใช้กับรูปอื่นเพิ่ม ถามบอสก่อน

---

## 1. สแตกและการทำงาน
- **Astro 7** static (`output: 'static'`, `trailingSlash: 'always'`, CSS inline ทุกหน้า) · Node ≥ 22.23.4
- Deploy: **Cloudflare Workers static assets** (`wrangler.jsonc`) build จาก `main` อัตโนมัติ · ไม่มี preview deploy (บอสเลือกไม่ใช้)
- เนื้อหา: **Sanity** `ohviqc5c` · `SANITY_PROJECT_ID=sample npm run build` ใช้ข้อมูลตัวอย่างใน `src/data/` (มีคำแปลอังกฤษตัวอย่าง 1 เรื่องด้วย)
- Studio: `studio/` · deploy เองเมื่อ `studio/**` เปลี่ยนบน main (`deploy-studio.yml`)
- CI: `check.yml` build ทุก branch/PR (ข้อมูลตัวอย่าง + ข้อมูลจริง + ตรวจ schema Studio)
- ทำงานผ่าน branch → PR → บอสกด merge เอง · **ห้าม push `posts/*.md` เข้า main โดยไม่ได้รับอนุมัติ** (จะลงบทความทันที)

## 2. สิ่งที่ทำไปตั้งแต่ deploy แรก (สรุป)
**ภาพรวม/ดีไซน์**
- รื้อ UI/UX ทั้งเว็บ: มุมโค้ง เงานุ่ม ตัวหนังสืออ่านง่ายขึ้น ฟอนต์ self-host รูปอาหาร 3:2 ทุกที่ (ใช้ crop/hotspot จาก Studio)
- หน้าแรก: สไลด์ 5 ร้านล่าสุด, The Index พร้อมเดือน Visit + รูป, Glasses Off ตามปี
- หน้า Glasses Off Awards: แว่นรวงผึ้ง แว่นดำ→สว่าง · หน้าจุดหมาย: ไทย + ทวีป → ประเทศ + แผนที่จุดไข่ปลา
- หน้าเมือง: Boss's Picks (ตั้งใน Studio), กรองประเภทอาหาร, ร้านที่ไปซ้ำรวมเป็นแถวเดียว
- เอฟเฟกต์ "สงบ": reveal, แถบเมนูกระจก, การ์ดเอียง, spotlight, count-up · ไม่มี page transition · ไม่ replay เมื่อกด Back · ปิดหมดเมื่อ reduced motion (`fx-on`)
- แก้ iPhone: UI ที่ `position:fixed` ต้องอยู่นอก `.elb-page` (Safari ผูก fixed กับ container)
- เมนู: ไอคอน + ชื่ออังกฤษ + ไทยตัวเล็ก (`NavLinks.astro`) · มือถือ 5 แท็บพอดีจอ 320px
- ปุ่มภาษาอยู่ **ในบทความ** (`LangSwitch.astro`) ไม่ใช่หัวเว็บ · **ไม่มีแปลอัตโนมัติ** (Google Translate พัง 2 รอบ บอสสั่งปิดถาวร)
- รอบล่าสุด (PR #16): กล่อง **"สรุปสั้น / At a glance"** บนสุดของรีวิว, หน้าเมืองบนมือถือเป็นรายการรูปซ้าย-ข้อความขวา, **ป้ายระดับราคาแบบแคปซูล**, ท้ายเว็บมือถือกระชับ 2 คอลัมน์, ย่อหน้าแรกตัวใหญ่ + **ประโยคเด่นของบอส** เป็นคำคม

**ฟีเจอร์**
- The Boss's Bill เป็นระดับราคา ฿฿/฿฿฿/฿฿฿฿ + ป้าย Event/AD (`priceBandFromBill()` ใน `content.ts`)
- แถบแชร์ LINE / Facebook / คัดลอกลิงก์ / แชร์ของมือถือ · รูปแชร์อัตโนมัติต่อบทความ (`src/lib/og.ts`, ออกแบบให้ LINE ครอปสี่เหลี่ยมได้)
- หน้า `/contact/` (Web3Forms, คีย์ใน Studio) · หน้า 404 มีช่องค้นหา + รีวิวล่าสุด
- กันก๊อปแบบเบา (`Effects.astro`, `robots.txt`, JSON-LD ลิขสิทธิ์รูป)
- RSS `/rss.xml` (บอสให้เก็บไว้) · sitemap · hreflang · JSON-LD (ไม่มี reviewRating)
- ประสิทธิภาพ: โลโก้ย่อขนาด, สคริปต์ย่อ/รวม, ไอคอนไม่ซ้ำสไตล์, ข้อความทุกหน้าแก้ได้ใน Studio

## 3. วิธีใช้ระบบหลังบ้าน (Studio) — ส่วนที่ฝ่ายเว็บต้องรู้
- **ตั้งค่าเว็บ / ข้อความทุกหน้า**: แท็บตามหน้า (หน้าแรก · บทความ · ค้นหาร้าน · จุดหมาย · Awards · ซีรีส์ · เกี่ยวกับบอส · ติดต่อ · ท้ายเว็บ & SEO) ทุกข้อความบนเว็บมาจากที่นี่ ค่าเริ่มต้นใน `src/data/settings.json` · ถ้าเพิ่มข้อความใหม่ในโค้ด ให้เพิ่มช่องใน `studio/schemas/index.ts` + `settings.json` + `types.ts` แล้วรัน Actions → **Fill settings texts** (dry ก่อน)
- **ชื่อในStudio: อังกฤษก่อน ไทยตาม** (บอสสั่ง 5 พ.ย.) รูปแบบ `English · ไทย` ทั้งเมนู แท็บ และหัวข้อช่อง ส่วนคำอธิบายใต้ช่องเป็นไทย · ห้ามใส่แพ็กภาษาไทยของ Studio (บอสชอบปุ่มอังกฤษ)
- **บทความ** แท็บ: 1 Restaurant & Intro · 2 Dishes · 3 Bill & Visit · 4 SEO (มีตัวนับตัวอักษร) · 5 Languages (แผงภาษา + ปุ่ม "+ English" สร้างคำแปลที่ผูกให้เอง) · ช่องภาษาล็อกไว้
- ปุ่มบทความ: **Open on site**, **Delete article…** (ลบร่าง+ฉบับเผยแพร่ในครั้งเดียว ปิดหน้าให้)
- เมนู **งานที่ต้องทำ**: ร่างค้าง ภาษาเพี้ยน ไม่มีระดับราคา/Visit/ปก/alt SEO ไม่ครบ ยังไม่มีคำแปลอังกฤษ
- **เมือง**: ภูมิภาค + ประเทศ (จัดกลุ่มหน้าจุดหมาย), ตำแหน่งบนแผนที่, Boss's Picks (สูงสุด 3), ภาพเมือง, ลาย motif, **City fact** (เรื่องแปลกจริง 1 ข้อ ภาษาอังกฤษ แสดงใต้ "Did you know?" · ไม่ใช้เป็นคำอธิบาย Google)
- **ประเภทอาหาร**: หมวดใหญ่อังกฤษ 9 หมวด (กรอง) + ประเภทย่อย `style` (แสดง "Japanese · Sushi") รายการเดียวใน `src/data/cuisines.json` ใช้ร่วมกันทั้งเว็บ (`config.ts`), Studio (`schemas/index.ts` import ไฟล์นี้) และสคริปต์โพสต์ · Studio deploy ใหม่เองเมื่อไฟล์นี้เปลี่ยน · ค่าเก่า/ไทยแปลงด้วย `cuisineOf()` / `styleOf()` ตอนโหลด · แสดงผลด้วย `cuisineText()` ใน `i18n.ts`
- โค้ด Studio: `studio/schemas/index.ts` (ฟิลด์), `studio/sanity.config.ts` (เมนู + ปุ่ม), `studio/components/` (แผงภาษา, ปุ่ม, ตัวนับ SEO, `Line.tsx` สำหรับข้อความไทยที่ไม่ทับกัน — **อย่าใช้ `<Text>` ของ @sanity/ui กับข้อความไทยหลายบรรทัด**) · เปลี่ยน GROQ ใน `src/lib/content.ts` ให้ตรงกับ schema เสมอ

## 4. กฎที่ต้องรักษา
- กฎแบรนด์ทั้งหมดใน `CLAUDE.md` (ไม่มีดาว/คะแนน, ระดับราคาเท่านั้น, ไอคอนเส้นห้ามอีโมจิ, รูปอาหาร: การ์ด/ปก 3:2 · ในบทความตามรูปจริง, ลาย motif ไม่มีป้าย ฯลฯ)
- URL ที่ live แล้วห้ามเปลี่ยน (ถ้าจำเป็นใช้ `public/_redirects`)
- เลข Tasting Notes No. นับอัตโนมัติจาก Visit
- `position:fixed` ห้ามอยู่ใน `.elb-page`; CSS มือถือของ element นอก container ใช้ `@media`
- ข้อความไทยห้าม letter-spacing กว้าง
- เปลี่ยนดีไซน์รูปแชร์ → เพิ่ม `?v=` ใน `[...article].astro`
- workflow ที่แก้ข้อมูลจริงต้องเป็นแบบกดเอง (dry ก่อน) เท่านั้น
- ห้ามขอ/เก็บ token ใดๆ บอกบอสว่าวางที่ไหน (GitHub secrets / Studio)
- ถามบอสก่อนเปลี่ยนสิ่งที่กระทบวิธีถ่ายรูปหรือเขียน และเช็คข้อมูลจริงก่อน (เกือบเลือกรูป 4:5 ผิดมาแล้ว)

## 5. วิธีทดสอบ (ใช้ซ้ำได้)
- Container ของ Claude เข้า Sanity / เว็บจริงไม่ได้ → ทดสอบด้วย build ข้อมูลตัวอย่าง หรือสร้าง `src/data/seed.ts` ชั่วคราวจาก `posts/*.md` + รูปใน `posts/images/` (วิธีใน `docs/HANDOFF.md` หัวข้อ "Bug check with real content") **อย่า commit ไฟล์ชั่วคราว**
- Playwright (ติดตั้งไว้แล้ว): ไล่ทุกหน้าที่ 360 และ 1280 px เช็ค JS error, ลิงก์/รูปเสีย, alt, id ซ้ำ, ล้นจอ, reveal ค้าง · ทดสอบ interaction: ค้นหา ตัวกรอง สไลด์ แผนที่ ปุ่มกระโดดจาน ปุ่มภาษา
- Studio: `npx sanity schema validate` + `npx sanity build` (ทดสอบหน้าจอ Studio จริงไม่ได้ ต้องให้บอสส่งภาพหน้าจอ)
- ไม่มี WebKit ใน container → เรื่อง iPhone ต้องให้บอสเช็คบนเครื่องจริง

## 6. งานค้าง / ข้อเสนอแนะ
1. **หน้ารวมภาษาอังกฤษ** (หน้าแรก/ค้นหาร้าน) เมื่อมีบทความแปลมากพอ ตอนนี้แปลแค่หน้าบทความ
2. ~~ค้นหาภาษาไทยแบบยืดหยุ่น~~ ทำแล้ว (PR #18, `src/lib/search.ts`)
3. **JSON-LD `geo`** ต่อร้านจากพิกัดแผนที่ ช่วย Google Maps/SEO
4. ~~ตรวจ Lighthouse อัตโนมัติ~~ ทำแล้ว: `check.yml` + `lighthouserc.cjs` (โปรไฟล์มือถือ 5 หน้า คะแนนอยู่ใน job summary)
5. **นับยอดแชร์**: Cloudflare Web Analytics นับคลิกไม่ได้ ถ้าบอสอยากได้ต้องเพิ่ม Worker endpoint เล็กๆ หรือบริการสถิติไร้คุกกี้ (บอสยังไม่ตัดสินใจ)
6. **Studio ภาษาไทยทั้งหมด**: มีแพ็กเกจ `@sanity/locale-th-th` ปุ่ม Publish/Discard จะเป็นไทย (ยังไม่ได้เสนอให้บอสเลือก)
7. **ฟอนต์ CJK บนรูปแชร์** ถ้าฝ่ายแบรนด์ต้องการชื่อจีนบนรูป
8. ร่างค้างใน Studio ของ Meet The Bund / Sui Tang Li / Yong Fu (จากช่วงทดสอบระบบแปล) บอสต้องกด "เปลี่ยนกลับเป็นบทความภาษาไทย" หรือ Discard · และลบร่าง "ไม่มีชื่อ" EN ที่ค้าง ถ้ายังกลับมาอีกให้ตรวจ `studio/components/actions.tsx`
9. ~~The Index กางต่อในหน้าเดิม~~ ทำแล้ว (`index.astro`: 10 เรื่องแรก + ปุ่ม "ดูทั้งหมด N เรื่อง ▾" ทีละ 20 · ไม่มี JS = ลิงก์ไป /review/)
