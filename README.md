# บอสพาชิม · Eat Like The Boss — เว็บไซต์

เว็บรีวิว Fine Dining ของบอส สร้างด้วย **Astro** + **Sanity** (ระบบหลังบ้าน) + **Cloudflare Pages** (โฮสต์)
โดเมน: **eatlikeboss.com**

ตอนนี้เว็บ build ได้แล้วด้วยเนื้อหาตัวอย่าง (ข้อความใน [วงเล็บ]) พอต่อ Sanity แล้ว เนื้อหาจริงจะขึ้นแทนอัตโนมัติ

## ตั้งค่าครั้งแรก (ทำครั้งเดียว ประมาณ 30 นาที)

### 1. สร้างโปรเจกต์ Sanity
1. สมัคร/เข้าสู่ระบบที่ https://www.sanity.io/manage → **Create project** ชื่อ `Eat Like The Boss` dataset ชื่อ `production` (Public)
2. จด **Project ID** (เช่น `ab12cd34`)
3. ในโปรเจกต์ → **API → CORS origins** เพิ่ม `https://eatlikeboss.com` และ `http://localhost:4321`
4. **API → Tokens** → Add token ชื่อ `claude-post` สิทธิ์ **Editor** → เก็บ token ไว้ (ใช้ให้ Claude โพสต์)

### 2. เปิดหน้าแก้ไข (Sanity Studio)
บนคอมพิวเตอร์ (ต้องมี Node.js 22):
```bash
cd studio
npm install
SANITY_STUDIO_PROJECT_ID=<Project ID> npx sanity deploy
```
จะได้หน้าแก้ไขที่ **https://eatliketheboss.sanity.studio** บอสเข้าไปแก้บทความ รูป และหน้าเกี่ยวกับบอสได้เอง
(หรือให้ Claude ทำขั้นนี้ให้ตอนต่อเครื่องไว้)

### 3. ใส่เมืองเริ่มต้น
ที่โฟลเดอร์หลัก สร้างไฟล์ `.env` จาก `.env.example` แล้วกรอก Project ID และ token จากนั้น:
```bash
npm install
node scripts/seed-sanity.mjs
```

### 4. ขึ้นเว็บบน Cloudflare Pages
1. https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git** → เลือก repo `eatliketheboss-web`
2. Framework: **Astro** · Build command: `npm run build` · Output: `dist`
3. **Environment variables:** `SANITY_PROJECT_ID` = Project ID, `SANITY_DATASET` = `production`, `NODE_VERSION` = `22`
4. Deploy แล้ว **Custom domains** → เพิ่ม `eatlikeboss.com` (ถ้าโดเมนอยู่ที่อื่น ต้องชี้ DNS หรือย้าย nameserver มา Cloudflare ตามที่หน้าจอบอก)

### 5. ให้เว็บอัปเดตเองเมื่อกด Publish ใน Sanity
1. Cloudflare Pages → โปรเจกต์ → **Settings → Builds → Deploy hooks** → สร้าง hook ชื่อ `sanity` → คัดลอก URL
2. Sanity manage → **API → Webhooks** → Create: URL = deploy hook, Dataset = production, Trigger on = Create/Update/Delete, Filter = `_type in ["article","city","settings"]`

เสร็จแล้ว: Publish ใน Studio หรือให้ Claude โพสต์ → เว็บอัปเดตภายในไม่กี่นาที

### 6. Google Search Console
เพิ่ม property `eatlikeboss.com` → ส่ง sitemap `https://eatlikeboss.com/sitemap-index.xml`

## โพสต์บทความ
- **บอสโพสต์เอง:** เข้า Studio → บทความ (ภาษาไทย) → Create → กรอก → Publish
- **ให้ Claude โพสต์:** สั่ง "โพสต์บทความ <ชื่อร้าน> ลงเว็บ" Claude จะเขียนไฟล์ `posts/<slug>.md` แล้วรัน `npm run post` (รายละเอียดใน `CLAUDE.md`)

## โครงสร้าง
```
src/styles/site.css        สี ฟอนต์ ลวดลาย เอฟเฟกต์ (ชุดเดียวกับ canvas ดีไซน์)
src/components/            Header, Footer, ไอคอน, การ์ดบทความ
src/layouts/Base.astro     SEO ทุกหน้า
src/pages/                 หน้าเว็บทั้งหมด
src/lib/                   ตั้งค่า, ดึงเนื้อหา, SEO
src/data/                  เนื้อหาตัวอย่าง (ใช้ตอนยังไม่ต่อ Sanity)
studio/                    Sanity Studio (หน้าแก้ไขของบอส)
posts/                     ไฟล์บทความที่ Claude ใช้โพสต์
scripts/                   post-article, seed-sanity
docs/SEO.md                กติกา SEO
```

## สิ่งที่ต้องกรอกเพิ่มใน `src/lib/config.ts`
ลิงก์ Facebook, Instagram และอีเมลติดต่อร่วมงาน
