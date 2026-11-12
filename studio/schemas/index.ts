import { defineArrayMember, defineField, defineType } from 'sanity';
import { TranslationsPanel, LANGS } from '../components/TranslationsPanel';
import { charCount } from '../components/CharCount';
// Tab icons: one import per icon (the root entry no longer exports them in @sanity/icons v5).
import { HomeIcon } from '@sanity/icons/Home';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { SearchIcon } from '@sanity/icons/Search';
import { PinIcon } from '@sanity/icons/Pin';
import { EyeClosedIcon } from '@sanity/icons/EyeClosed';
import { BookIcon } from '@sanity/icons/Book';
import { UserIcon } from '@sanity/icons/User';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { ThListIcon } from '@sanity/icons/ThList';
import { BillIcon } from '@sanity/icons/Bill';
import { TranslateIcon } from '@sanity/icons/Translate';

const altField = defineField({
  name: 'alt',
  title: 'Alt text · คำบรรยายภาพ',
  description: 'บรรยายจานจริง เช่น "ซูชิโอโทโระบนข้าวอุ่น ร้าน X โตเกียว" — ช่วย SEO และคนที่ใช้โปรแกรมอ่านหน้าจอ',
  type: 'string',
  validation: (r) => r.required().min(10),
});
const photo = (name: string, title: string, group?: string) =>
  defineField({ name, title, type: 'image', options: { hotspot: true }, fields: [altField], ...(group ? { group } : {}) });

// Awards: guide → award, one list for site, Studio and post check (src/data/awards.json; the Boss, 6 Nov 2026).
import AWARD_LIST from '../../src/data/awards.json';
const AWARD_GROUPS = Object.fromEntries(Object.entries(AWARD_LIST).filter(([k]) => !k.startsWith('_'))) as Record<string, string[]>;
const AWARD_OPTIONS = Object.entries(AWARD_GROUPS).flatMap(([g, list]) => list.map((a) => ({ title: a.startsWith(g) || a.includes(g) ? a : `${a} — ${g}`, value: a })));
const award = defineType({
  name: 'award', title: 'Award · รางวัล', type: 'object',
  fields: [
    defineField({ name: 'award', title: 'Award · รางวัล', type: 'string', options: { list: AWARD_OPTIONS }, validation: (r) => r.required().custom((v: string | undefined) => (!v || AWARD_OPTIONS.some((o) => o.value === v) ? true : `"${v}" ไม่อยู่ในรายการรางวัล`)) }),
    defineField({ name: 'year', title: 'Year (optional) · ปี', type: 'number', validation: (r) => r.min(1900).max(2100).integer() }),
    defineField({ name: 'note', title: 'Note (optional) · หมายเหตุ', description: 'สั้นๆ เช่น Chef Au, Taiwan', type: 'string' }),
  ],
  preview: { select: { a: 'award', y: 'year', n: 'note' }, prepare: ({ a, y, n }) => ({ title: `${a || '(เลือกรางวัล)'}${y ? ` ${y}` : ''}${n ? ` (${n})` : ''}` }) },
});

// Cuisine: broad English categories + optional styles, one list for site, Studio and post check (the Boss, 5 Nov 2026).
import CUISINE_LIST from '../../src/data/cuisines.json';
const CUISINE_STYLES = Object.fromEntries(Object.entries(CUISINE_LIST).filter(([k]) => !k.startsWith('_'))) as Record<string, string[]>;
const CUISINES = Object.keys(CUISINE_STYLES);
// Style list as "Sushi — Japanese"; the value stays "Sushi". A style must belong to the chosen category.
const STYLE_OPTIONS = CUISINES.flatMap((c) => CUISINE_STYLES[c].map((st) => ({ title: `${st} — ${c}`, value: st })));

export const article = defineType({
  name: 'article',
  title: 'Article · บทความ',
  type: 'document',
  groups: [
    // Numbered in the order you fill an article; "ทุกช่อง" shows everything on one page.
    { name: 'all-fields', title: 'All fields' },
    { name: 'main', title: '1 Restaurant & Intro · ร้าน & บทนำ', icon: DocumentTextIcon, default: true },
    { name: 'dishes', title: '2 Dishes · รายการจาน', icon: ThListIcon },
    { name: 'meta', title: '3 Bill & Visit · ราคา & วันที่ไป', icon: BillIcon },
    { name: 'seo', title: '4 SEO', icon: SearchIcon },
    { name: 'lang', title: '5 Languages · ภาษา / คำแปล', icon: TranslateIcon },
  ],
  fields: [
    defineField({ name: 'translations', title: 'Languages · ภาษาของบทความนี้ / เพิ่มคำแปล', type: 'string', group: 'lang', readOnly: true, components: { input: TranslationsPanel } }),
    defineField({ name: 'language', title: 'Language · บทความนี้เป็นภาษา', description: 'ตั้งให้อัตโนมัติ แก้เองไม่ได้: บทความใหม่ = ภาษาไทย · คำแปลสร้างจากปุ่ม "+ English / 日本語 / 中文" ด้านบน', type: 'string', group: 'lang', initialValue: 'th', readOnly: true,
      options: { list: LANGS.map((l) => ({ title: l.label, value: l.id })), layout: 'radio', direction: 'horizontal' },
      validation: (r) => r.required() }),
    defineField({ name: 'translationOf', title: 'Translated from · แปลจากบทความไทย', description: 'คำแปลต้องผูกกับบทความไทย เว็บจึงรู้ว่าเป็นร้านเดียวกัน และขึ้นปุ่มเปลี่ยนภาษาให้', type: 'reference', to: [{ type: 'article' }], group: 'lang',
      options: { filter: 'coalesce(language, "th") == "th"' }, // every Thai article (no series filter: it hid the right one when series differed)
      // set by the "+ English" button; read-only so a translation can't be pointed at the wrong article
      readOnly: true, hidden: ({ document, value }: any) => (document?.language || 'th') === 'th' || !value?._ref,
      validation: (r) => r.custom(async (ref: any, ctx: any) => {
        const doc = ctx.document;
        if ((doc?.language || 'th') === 'th') return true;
        if (!ref?._ref) return 'ยังไม่ได้ผูกกับบทความไทย: กด "เปลี่ยนกลับเป็นบทความภาษาไทย" ในแท็บ 5 ภาษา / คำแปล';
        const id = String(doc._id).replace(/^drafts\./, '');
        const dup = await ctx.getClient({ apiVersion: '2025-01-01' }).fetch(
          'count(*[_type == "article" && language == $lang && translationOf._ref == $ref && !(_id in [$id, "drafts." + $id])])', { lang: doc.language, ref: ref._ref, id });
        return dup ? 'บทความนี้มีคำแปลภาษานี้อยู่แล้ว เปิดอันเดิมแก้แทนได้ (ดูรายการด้านล่าง)' : true;
      }) }),
    defineField({ name: 'series', title: 'Series · ซีรีส์', type: 'string', group: 'main', initialValue: 'review',
      options: { list: [{ title: 'Eat Like The Boss · บอสพาชิม (รีวิวร้าน)', value: 'review' }, { title: 'Meals That Changed the World · มื้ออาหารเปลี่ยนโลก', value: 'history' }, { title: 'Drink Like The Boss · บอสพาดื่ม', value: 'drinks' }], layout: 'radio' },
      validation: (r) => r.required() }),
    defineField({ name: 'no', title: 'Tasting Notes No. (retired)', description: 'เว็บนับเลขให้อัตโนมัติตามวัน Visit', type: 'number', hidden: true }),
    defineField({ name: 'episode', title: 'Ep.', type: 'number', group: 'main', hidden: ({ document }) => document?.series !== 'history' }),
    defineField({ name: 'title', title: 'Title · ชื่อบทความเต็ม', description: 'เช่น บอสพาชิม in Tokyo: ชื่อร้าน (ชื่อเดิม) - คำโปรย (ไม่ต้องใส่อีโมจิ)', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug · ส่วนท้าย URL', description: 'ภาษาอังกฤษตัวเล็ก คั่นด้วย - เช่น sezanne — ตั้งแล้วห้ามเปลี่ยน', type: 'slug', group: 'main',
      options: { source: (doc: any) => doc.restaurant?.name || doc.title, maxLength: 80,
        // a translation keeps the Thai slug (/en/review/<city>/<slug>/), so a slug only has to be unique within one language
        isUnique: async (slug: string, ctx: any) => {
          const id = String(ctx.document?._id || '').replace(/^drafts\./, '');
          return !(await ctx.getClient({ apiVersion: '2025-01-01' }).fetch('count(*[_type == "article" && slug.current == $slug && coalesce(language, "th") == $lang && !(_id in [$id, "drafts." + $id])])', { slug, lang: ctx.document?.language || 'th', id }));
        } }, validation: (r) => r.required() }),
    defineField({ name: 'tagline', title: 'Tagline · คำโปรย', type: 'string', group: 'main' }),
    defineField({ name: 'city', title: 'City · เมือง', type: 'reference', to: [{ type: 'city' }], group: 'main',
      hidden: ({ document }) => document?.series === 'history', validation: (r) => r.custom((v, ctx: any) => (ctx.document?.series === 'review' && !v ? 'รีวิวร้านต้องเลือกเมือง' : true)) }),
    defineField({ name: 'restaurant', title: 'Restaurant · ร้าน', type: 'object', group: 'main', hidden: ({ document }) => document?.series !== 'review',
      fields: [
        defineField({ name: 'name', title: 'Name · ชื่อร้าน', description: 'ไปซ้ำให้พิมพ์ชื่อเดิมทุกครั้ง เว็บจะรวมทุกครั้งที่ไปเป็นร้านเดียวกัน', type: 'string' }),
        defineField({ name: 'originalName', title: 'Original name · ชื่อภาษาเดิม', type: 'string' }),
        defineField({ name: 'chef', title: 'Chef · เชฟ', type: 'string' }),
        defineField({ name: 'area', title: 'Area · ย่าน', type: 'string' }),
        defineField({ name: 'cuisine', title: 'Cuisine · ประเภทอาหาร', description: 'หมวดใหญ่ภาษาอังกฤษ ใช้กรองในหน้า Restaurants · สไตล์ย่อย เช่น sushi, kaiseki เขียนในบทความ', type: 'string', options: { list: CUISINES, layout: 'radio', direction: 'horizontal' } }),
        defineField({ name: 'style', title: 'Style (optional) · ประเภทย่อย', description: 'รายละเอียดต่อจากหมวด เช่น Japanese · Sushi, Chinese · Cantonese (แสดงบนการ์ดและในบทความ ไม่ใช้กรอง) · ต้องอยู่ในหมวดที่เลือกด้านบน · ถ้าไม่มีที่ตรงจริงๆ ให้เว้นว่าง แล้วขอฝ่ายเว็บเพิ่มใน src/data/cuisines.json', type: 'string',
          options: { list: STYLE_OPTIONS },
          validation: (r) => r.custom((v: string | undefined, ctx: any) => {
            const cu = ctx.parent?.cuisine;
            if (!v) return true;
            if (!cu) return 'เลือก Cuisine (หมวด) ก่อน';
            return (CUISINE_STYLES[cu] || []).includes(v) ? true : `"${v}" ไม่อยู่ในหมวด ${cu} · เลือกจาก: ${(CUISINE_STYLES[cu] || []).join(', ')}`;
          }) }),
        defineField({ name: 'priceBand', title: 'Price band (old)', type: 'string', hidden: true }), // older entries; now set in the Bill tab
        defineField({ name: 'sameAs', title: 'Earlier review of this restaurant (optional) · รีวิวครั้งก่อน', description: 'ใช้เฉพาะเมื่อร้านเปลี่ยนชื่อหรือพิมพ์ชื่อไม่ตรงกับครั้งก่อน · ชื่อร้านเดิมในเมืองเดียวกัน เว็บรวมให้เองอยู่แล้ว', type: 'reference', weak: true, to: [{ type: 'article' }],
          options: { filter: 'language == "th" && series == "review"' } }),
        defineField({ name: 'aliases', title: 'Search aliases (optional) · ชื่อเรียกอื่นสำหรับค้นหา', description: 'ชื่อที่คนอาจพิมพ์ค้นหา เช่น ชื่อร้านสะกดไทย "หย่งฟู" หรือชื่อเล่นของร้าน · ไม่แสดงบนเว็บ ใช้ค้นหาเท่านั้น · ชื่อเมือง/ประเภทอาหารภาษาไทย-อังกฤษ เว็บรู้เองอยู่แล้ว', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
        defineField({ name: 'awards', title: 'Awards · รางวัล (ตรวจจากแหล่งจริงแล้ว)', description: 'กด Add item → เลือกรางวัลจากรายการ (จัดตามสถาบัน) · ใส่ปีถ้ามี · หมายเหตุสั้นๆ เช่น ชื่อเชฟ หรือประเทศ · ลากเพื่อเรียงลำดับ · รางวัลจริงที่ยังไม่มีในรายการ: ขอฝ่ายเว็บเพิ่มใน src/data/awards.json',
          type: 'array', of: [defineArrayMember({ type: 'award' })] }),
      ] }),
    defineField({ ...photo('cover', 'Cover · ภาพปก (landscape only · แนวนอนเท่านั้น)', 'main'),
      description: 'ใช้เป็นรูปการ์ด สไลด์หน้าแรก และรูปแชร์ แสดง 3:2 เสมอ · รูปแนวตั้งใส่เป็นรูปจานหรือแกลเลอรี (เว็บโชว์ 4:5 ให้เต็มรูป)',
      validation: (r) => r.custom(async (v: any, ctx: any) => {
        const ref = v?.asset?._ref; if (!ref) return true;
        const d = await ctx.getClient({ apiVersion: '2024-01-01' }).fetch('*[_id == $id][0].metadata.dimensions', { id: ref });
        const w = (d?.width || 3) * (1 - (v.crop?.left || 0) - (v.crop?.right || 0)), h = (d?.height || 2) * (1 - (v.crop?.top || 0) - (v.crop?.bottom || 0));
        return w >= h * 1.25 || 'ปกต้องเป็นรูปแนวนอน · Cover must be landscape';
      }).warning() }), // warning, not error: two older articles (numata-sou, yong-fu) must stay editable until their cover is swapped
    defineField({ name: 'gallery', title: 'Gallery (optional) · ภาพบรรยากาศร้าน / เชฟ', description: 'แสดงต่อจากบทนำ ก่อนรายการจาน · 1–6 รูป แนวนอนดีที่สุด · ใส่คำบรรยายสั้นๆ ได้ เช่น "ห้องอาหารชั้น 56" หรือชื่อเชฟ', type: 'array', group: 'main',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [altField, defineField({ name: 'caption', title: 'Caption (optional) · คำบรรยายใต้ภาพ', type: 'string' })] })],
      validation: (r) => r.max(6) }),
    defineField({ name: 'body', title: 'Intro · บทนำ', description: 'ย่อหน้าเปิดถึง "อาหารจะมีอะไรบ้างไปชมกันครับ"', type: 'array', group: 'main',
      of: [defineArrayMember({ type: 'block', styles: [{ title: 'Paragraph · ย่อหน้า', value: 'normal' }, { title: 'Heading · หัวข้อ', value: 'h2' }, { title: 'Quote · คำพูดเด่น', value: 'blockquote' }], lists: [] })] }),
    defineField({ name: 'quote', title: "The Boss's quote (optional) · ประโยคเด่นของบอส", type: 'text', rows: 2, group: 'main' }),
    defineField({ name: 'dishes', title: 'Dishes · ศิลปะแห่งรสชาติในมื้อนี้', type: 'array', group: 'dishes',
      of: [defineArrayMember({ type: 'object', name: 'dish', title: 'Dish · จาน',
        fields: [
          defineField({ name: 'name', title: 'Dish name · ชื่อจาน (ชื่อเดิม)', type: 'string', validation: (r) => r.required() }),
          defineField({ name: 'description', title: 'Description · คำบรรยาย', description: 'สิ่งที่อยู่บนจาน. ความหมายของวัตถุดิบ/ศัพท์. รสชาติ', type: 'text', rows: 4 }),
          defineField({ name: 'glassesOff', title: '🕶️ Glasses off · ถอดแว่นชิม', type: 'boolean', initialValue: false }),
          photo('image', 'ภาพจาน'),
        ],
        preview: { select: { title: 'name', g: 'glassesOff', media: 'image' }, prepare: ({ title, g, media }: any) => ({ title: `${g ? '🕶️ ' : ''}${title}`, media }) } })],
      validation: (r) => r.custom((list: any[] | undefined) => ((list || []).filter((d) => d.glassesOff).length > 2 ? 'ถอดแว่นชิมได้มากสุด 2 จานต่อมื้อ' : true)) }),
    defineField({ name: 'billBand', title: "The Boss's Bill · ระดับราคาโดยประมาณ", description: 'แสดงบนเว็บเป็นสัญลักษณ์ ไม่บอกว่ามื้อได้รับเชิญหรือจ่ายเอง · ฿฿ ต่ำกว่า 3,000 บาท · ฿฿฿ 3,000–7,999 · ฿฿฿฿ ตั้งแต่ 8,000 ต่อคน · เว้นว่าง = คำนวณจาก "ราคาจริง" ด้านล่าง', type: 'string', group: 'meta',
      options: { list: ['฿฿', '฿฿฿', '฿฿฿฿'], layout: 'radio', direction: 'horizontal' } }),
    defineField({ name: 'tag', title: 'Event / AD · มื้ออีเวนต์?', description: 'Event = มื้ออีเวนต์ / มื้อพิเศษ (ขึ้นป้ายคู่ระดับราคา) · AD = มื้อที่ได้รับเชิญ (บอส 7 พ.ย. 2026) · AD + Event = ได้รับเชิญ + มื้ออีเวนต์', type: 'string', group: 'meta',
      options: { list: [{ title: 'None · ไม่ใช่', value: '' }, { title: 'Event', value: 'Event' }, { title: 'AD · ได้รับเชิญ', value: 'AD' }, { title: 'AD + Event', value: 'AD · Event' }], layout: 'radio', direction: 'horizontal' } }),
    defineField({ name: 'bill', title: 'Real price (hidden, optional) · ราคาจริง', description: 'เช่น 6,999 THB++ หรือ 1,688 CNY · ใช้คำนวณระดับราคาให้อัตโนมัติเมื่อไม่ได้เลือกด้านบน', type: 'string', group: 'meta' }),
    defineField({ name: 'visit', title: 'Visit', description: 'เดือนที่ไปกินจริง รูปแบบ Mon-YYYY เช่น Oct-2026 · เว็บใช้เรียงเลข Tasting Notes No. (มื้อเก่าสุด = No. 001)', type: 'string', group: 'meta',
      validation: (r) => r.regex(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/, { name: 'Mon-YYYY' }).custom((v, ctx: any) => (ctx.document?.series === 'review' && !v ? 'รีวิวร้านต้องใส่ Visit' : true)) }),
    defineField({ name: 'hashtags', title: 'Hashtags · แฮชแท็ก (ไม่ต้องใส่ #, ไม่เกิน 10)', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' }, group: 'meta', validation: (r) => r.max(10) }),
    defineField({ name: 'publishedAt', title: 'Publish date · วันที่เผยแพร่', type: 'date', group: 'meta', initialValue: () => new Date().toISOString().slice(0, 10), validation: (r) => r.required() }),
    defineField({ name: 'seoTitle', title: 'Meta title', description: '≤ 60 ตัวอักษร เช่น "ร้าน X Tokyo รีวิว Fine Dining" (ระบบเติม "— บอสพาชิม" ให้)', type: 'string', group: 'seo', components: { input: charCount(0, 60) }, validation: (r) => r.max(60) }),
    defineField({ name: 'seoDescription', title: 'Meta description', description: '120–155 ตัวอักษร ในน้ำเสียงบอส ห้ามมีดาวหรือคะแนน', type: 'text', rows: 3, group: 'seo',
      components: { input: charCount(120, 155) as any }, validation: (r) => r.min(120).max(155).warning('ควรยาว 120–155 ตัวอักษร') }),
  ],
  orderings: [{ title: 'Newest · ใหม่สุด', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', name: 'restaurant.name', series: 'series', ep: 'episode', visit: 'visit', lang: 'language', city: 'city.nameEn', media: 'cover', band: 'billBand', cu: 'restaurant.cuisine', st: 'restaurant.style', tag: 'tag' },
    // The restaurant name first, so lists and the "แปลจากบทความ" picker show which article it is at a glance.
    // e.g. "TH · Tokyo · Visit Apr-2024 · ฿฿฿฿ · Japanese · Sushi · Event"
    prepare: ({ title, name, series, ep, visit, lang, city, media, band, cu, st, tag }: any) => ({
      title: series === 'history' ? `Ep.${ep ?? '?'} ${title ?? ''}` : (name || title || 'ไม่มีชื่อ'),
      subtitle: [LANGS.find((l) => l.id === (lang || 'th'))?.short ?? 'TH', city, visit && `Visit ${visit}`, band, [cu, st].filter(Boolean).join(' · '), tag].filter(Boolean).join(' · '),
      media,
    }) },
});

export const city = defineType({
  name: 'city',
  title: 'City · เมือง',
  type: 'document',
  fields: [
    defineField({ name: 'nameEn', title: 'English name · ชื่ออังกฤษ', type: 'string', validation: (r) => [r.required(), r.custom((v?: string) => (v && v !== v.trim() ? 'มีช่องว่างหน้าหรือท้ายชื่อ ลบออกด้วยครับ' : true)).warning(),
      // one document per city: another city with the same English name is an error (merge them: Actions → Merge duplicate cities)
      r.custom(async (v: string | undefined, ctx: any) => {
        if (!v?.trim()) return true;
        const id = String(ctx.document?._id || '').replace(/^drafts\./, '');
        const other: string | null = await ctx.getClient({ apiVersion: '2025-01-01' }).fetch('*[_type == "city" && lower(nameEn) == $n && !(_id in [$id, "drafts." + $id])][0].slug.current', { n: v.trim().toLowerCase(), id });
        return other ? `มีเมืองชื่อนี้อยู่แล้ว (slug: ${other}) · ใช้เมืองเดิม หรือรวมกันด้วย Actions → Merge duplicate cities` : true;
      })] }),
    defineField({ name: 'nameTh', title: 'Thai name · ชื่อไทย', type: 'string', validation: (r) => [r.required(), r.custom((v?: string) => (v && v !== v.trim() ? 'มีช่องว่างหน้าหรือท้ายชื่อ ลบออกด้วยครับ' : true)).warning()] }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'nameEn' }, validation: (r) => r.required() }),
    defineField({ name: 'country', title: 'Country (in Thai) · ประเทศ', type: 'string' }),
    defineField({ name: 'aliases', title: 'Search aliases (optional) · ชื่อเรียกอื่นสำหรับค้นหา', description: 'เช่น ชื่อย่าน ชื่อภาษาจีน/ญี่ปุ่น หรือสะกดไทยแบบอื่น · ชื่อเมืองหลักๆ ไทย-อังกฤษ เว็บรู้เองอยู่แล้ว', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
    defineField({ name: 'region', title: 'Region · ภูมิภาค', description: 'ถ้าพิมพ์ชื่อประเทศที่เว็บรู้จัก (เช่น ญี่ปุ่น ฝรั่งเศส) เว็บจัดกลุ่มให้เองตามประเทศ · ในหน้าจุดหมาย แต่ละภูมิภาคแบ่งย่อยตามช่อง "ประเทศ" อีกชั้น', type: 'string',
      options: { list: [{ title: 'Thailand · ประเทศไทย', value: 'th' }, { title: 'Asia · เอเชีย', value: 'asia' }, { title: 'Europe · ยุโรป', value: 'europe' }, { title: 'The Americas · อเมริกา', value: 'americas' }, { title: 'Oceania · โอเชียเนีย', value: 'oceania' }, { title: 'Middle East & Africa · ตะวันออกกลางและแอฟริกา', value: 'mea' }] } }),
    defineField({ name: 'motif', title: 'City motif · ลายประจำเมือง', type: 'string', initialValue: 'loop',
      options: { list: [{ title: 'Seigaiha (Tokyo)', value: 'seigaiha' }, { title: 'Shippo (Kyoto)', value: 'shippo' }, { title: 'Kikko (Osaka)', value: 'kikko' }, { title: 'ลายประจำยาม (Bangkok)', value: 'prajam' }, { title: '回纹 Fret (Hong Kong)', value: 'fret' }, { title: 'Art Deco ตึกขั้นบันได (Shanghai)', value: 'shanghai' }, { title: 'ดอกบัว (Hangzhou)', value: 'hangzhou' }, { title: 'Yukiwa (Sapporo)', value: 'sapporo' }, { title: 'โคมยี่เป็ง (Chiang Mai)', value: 'chiangmai' }, { title: 'ซุ้มโค้งชิโน-โปรตุกีส (Phuket)', value: 'phuket' }, { title: 'กระเบื้องเปอรานากัน (Singapore)', value: 'singapore' }, { title: 'ดอกเหมย 梅花 (Taipei)', value: 'taipei' }, { title: 'คลื่น Aalto (Helsinki)', value: 'helsinki' }, { title: 'ลายร่อง Musselmalet (Copenhagen)', value: 'copenhagen' }, { title: 'ดาว Selbu (Oslo)', value: 'oslo' }, { title: 'ดาวแปดแฉกออตโตมัน (Istanbul)', value: 'istanbul' }, { title: 'หน้าต่าง 亞 เกาหลี (Seoul)', value: 'seoul' }, { title: 'หน้าจั่วบ้านริมคลอง (Amsterdam)', value: 'amsterdam' }, { title: 'กระเบื้องทางเท้า Panot ลายดอกไม้ (Barcelona)', value: 'barcelona' }, { title: 'โครงไม้ Fachwerk แบบตึก Römer (Frankfurt)', value: 'frankfurt' }, { title: 'ไอน้ำ Tatewaku เมืองออนเซ็น (Iwaki)', value: 'iwaki' }, { title: 'ระเบียงเหล็กดัด (Madrid)', value: 'madrid' }, { title: 'โอ่งดินเผามอญเกาะเกร็ด (Nonthaburi)', value: 'nonthaburi' }, { title: 'เสาหินบะซอลต์ Hallgrímskirkja (Reykjavik)', value: 'reykjavik' }, { title: 'สุสานโบราณรูปรูกุญแจ Kofun (Sakai)', value: 'sakai' }, { title: 'โค้งโรงละคร Taichung Theater (Taichung)', value: 'taichung' }, { title: 'Gold Loop (ทั่วไป)', value: 'loop' }] } }),
    defineField({ name: 'intro', title: 'City fact · เรื่องน่ารู้ของเมือง', description: 'เรื่องจริงที่แปลกและน่าสนใจของเมือง 1 เรื่อง สั้นๆ 1–2 ประโยค ภาษาอังกฤษ (แสดงในหน้าเมือง)', type: 'text', rows: 3 }),
    defineField({ name: 'location', title: 'Map position (optional) · ตำแหน่งบนแผนที่', description: 'เมืองหลักๆ เว็บรู้ตำแหน่งอยู่แล้ว ใส่เฉพาะเมืองที่ไม่ขึ้นบนแผนที่หน้าจุดหมาย', type: 'geopoint' }),
    photo('cover', 'ภาพเมือง'),
    defineField({ name: 'featured', title: 'Featured on Destinations · เมืองแนะนำ', description: 'ติ๊กได้สูงสุด 3 เมือง หน้าจุดหมายแสดงเป็นการ์ดเรียงกัน (เรียงตามจำนวนร้าน) · ต้องมีรีวิวในเมืองนั้นแล้ว · กด Publish ด้วยทุกเมือง', type: 'boolean', initialValue: false,
      // more than 3 published featured cities: say which ones are already ticked
      validation: (r) => r.custom(async (v: boolean | undefined, ctx: any) => {
        if (!v) return true;
        const id = String(ctx.document?._id || '').replace(/^drafts\./, '');
        const others: string[] = await ctx.getClient({ apiVersion: '2025-01-01' }).fetch('*[_type == "city" && featured == true && !(_id in path("drafts.**")) && _id != $id].nameEn', { id });
        return others.length >= 3 ? `ติ๊กเมืองแนะนำได้สูงสุด 3 เมือง ตอนนี้มีแล้ว: ${others.join(', ')} · เอาติ๊กเมืองอื่นออกก่อน` : true;
      }) }),
    defineField({ name: 'picks', title: "Boss's Picks · ร้านแนะนำของเมืองนี้", description: 'เลือกได้สูงสุด 3 ร้าน เรียงตามลำดับที่ใส่ · เว้นว่าง = เว็บเลือกให้เอง (ร้านล่าสุดที่มีจานถอดแว่นชิม)', type: 'array',
      of: [defineArrayMember({ type: 'reference', weak: true, to: [{ type: 'article' }], // weak: deleting an article is never blocked
        options: { filter: ({ document }: any) => ({ filter: '!defined(translationOf) && series == "review" && city._ref == $city', params: { city: String(document?._id || '').replace(/^drafts\./, '') } }) } })],
      validation: (r) => r.max(3) }),
  ],
  // ★ = featured on Destinations · how many Boss's Picks · "no photo" when the city still needs one
  preview: { select: { title: 'nameEn', th: 'nameTh', country: 'country', f: 'featured', picks: 'picks', media: 'cover' },
    prepare: ({ title, th, country, f, picks, media }: any) => ({
      title: `${f ? '★ ' : ''}${title || ''}`,
      subtitle: [th, country, picks?.length ? `Picks ${picks.length}` : '', media ? '' : 'no photo'].filter(Boolean).join(' · '),
      media,
    }) },
});

// Site settings: one tab per page of the website, in the order a visitor meets them.
// Every field starts with the text the website shows today (defaults: src/data/settings.json).
const txt = (name: string, title: string, group: string, extra: Record<string, unknown> = {}) => defineField({ name, title, type: 'string', group, ...extra });
const para = (name: string, title: string, group: string, rows = 3, extra: Record<string, unknown> = {}) => defineField({ name, title, type: 'text', rows, group, ...extra });

export const settings = defineType({
  name: 'settings',
  title: 'Site settings · ตั้งค่าเว็บ / ข้อความทุกหน้า',
  type: 'document',
  groups: [
    // Short names + icons, same words as the website menu, so each tab reads at a glance.
    { name: 'all-fields', title: 'All fields', hidden: true }, // 40+ fields on one page is hard to scan
    { name: 'home', title: 'Home · หน้าแรก', icon: HomeIcon, default: true },
    { name: 'article', title: 'Article · บทความ', icon: DocumentTextIcon },
    { name: 'finder', title: 'Restaurants · ค้นหาร้าน', icon: SearchIcon },
    { name: 'destinations', title: 'Destinations · จุดหมาย', icon: PinIcon },
    { name: 'awards', title: 'Awards', icon: EyeClosedIcon },
    { name: 'series', title: 'Series · ซีรีส์', icon: BookIcon },
    { name: 'about', title: 'About · เกี่ยวกับบอส', icon: UserIcon },
    { name: 'contact', title: 'Contact · ติดต่อ', icon: EnvelopeIcon },
    { name: 'capsule', title: 'Time capsule · ไทม์แคปซูล', icon: CalendarIcon },
    { name: 'footer', title: 'Footer & SEO · ท้ายเว็บ & SEO', icon: EarthGlobeIcon },
  ],
  fields: [
    // หน้าแรก
    defineField({ name: 'featuredArticle', title: 'Featured article · บทความเด่น (สไลด์แรก)', description: 'เว้นว่าง = สไลด์ 5 ร้านล่าสุดที่ไปเยือน', type: 'reference', to: [{ type: 'article' }], options: { filter: 'language == "th"' }, group: 'home' }),
    defineField({ name: 'homeCities', title: 'City shortcuts · ปุ่มเมืองลัดใต้ช่องค้นหา', description: 'เลือก 2–5 เมือง (เว้นว่าง = 3 เมืองที่มีร้านมากที่สุด)', type: 'array', of: [defineArrayMember({ type: 'reference', to: [{ type: 'city' }] })], validation: (r) => r.max(5), group: 'home' }),
    txt('homeFinderLabel', 'Search label · ข้อความหน้าช่องค้นหา', 'home'),
    txt('homeSearchPlaceholder', 'Search placeholder · ข้อความจางในช่องค้นหา', 'home'),
    txt('homeLatestTitle', 'Latest visits title · หัวข้อสไลด์ร้านล่าสุด', 'home'),
    txt('homeIndexTitle', 'Index title · หัวข้อรายการบทความ', 'home'),
    txt('homeIndexLink', 'Index link · ลิงก์ "ดูทั้งหมด"', 'home'),
    para('tagline', 'Brand tagline · คำโปรยแบรนด์', 'home', 2),
    txt('homeAwardsText', 'Awards strip text · ข้อความแถบ Glasses Off Awards', 'home'),
    para('invitedNote', 'Note under About · ข้อความใต้ "เกี่ยวกับบอส"', 'home', 2),
    // หน้าบทความ
    txt('articleMenuTitle', 'Dishes heading · หัวข้อส่วนรายการจาน', 'article'),
    txt('articleGlassesQuote', 'Glasses-off line · ประโยคบนจานถอดแว่นชิม', 'article'),
    txt('articleShareTitle', 'Share heading · ข้อความเหนือปุ่มแชร์', 'article'),
    txt('articleShareTitleHistory', 'Share heading, history · ข้อความเหนือปุ่มแชร์ (มื้ออาหารเปลี่ยนโลก)', 'article'),
    // ค้นหาร้าน
    txt('finderTitle', 'Restaurants title · หัวข้อหน้าค้นหาร้าน', 'finder'),
    para('finderIntro', 'Restaurants intro · คำอธิบายหน้าค้นหาร้าน', 'finder'),
    // จุดหมาย
    txt('destinationsTitle', 'Destinations title · หัวข้อหน้าจุดหมาย', 'destinations'),
    para('destinationsIntro', 'Destinations intro · คำอธิบายหน้าจุดหมาย', 'destinations'),
    txt('mapTitle', 'Map title · หัวข้อแผนที่', 'destinations'),
    // Glasses Off Awards
    para('awardsIntro', 'Awards intro · คำอธิบายหน้า Glasses Off Awards', 'awards'),
    // ซีรีส์
    defineField({ name: 'seriesText', title: 'Series descriptions · คำอธิบายซีรีส์', description: 'แสดงในหน้าซีรีส์และหน้าเกี่ยวกับบอส', type: 'object', group: 'series', fields: [
      defineField({ name: 'review', title: 'Eat Like The Boss · บอสพาชิม', type: 'text', rows: 2 }),
      defineField({ name: 'history', title: 'Meals That Changed the World · มื้ออาหารเปลี่ยนโลก', type: 'text', rows: 2 }),
      defineField({ name: 'drinks', title: 'Drink Like The Boss · บอสพาดื่ม', type: 'text', rows: 2 }),
    ] }),
    // เกี่ยวกับบอส
    txt('aboutHeadline', 'About headline · หัวข้อหน้าเกี่ยวกับบอส', 'about'),
    defineField({ name: 'aboutBio', title: 'Bio paragraphs · ประวัติ', type: 'array', of: [defineArrayMember({ type: 'text' })], group: 'about' }),
    para('aboutShortBio', 'Short bio · ประวัติสั้น 1–2 บรรทัด', 'about', 2),
    defineField({ name: 'aboutStats', title: 'Key numbers · ตัวเลขเด่น', type: 'array', group: 'about',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'value', type: 'string', title: 'Value · ตัวเลข/คำ (เช่น 2017)' }), defineField({ name: 'label', type: 'string', title: 'Description · คำอธิบาย' })], preview: { select: { title: 'value', subtitle: 'label' } } })], validation: (r) => r.max(4) }),
    defineField({ name: 'whyHonest', title: 'Why honest matters · ย่อหน้า', type: 'array', of: [defineArrayMember({ type: 'text' })], group: 'about' }),
    defineField({ name: 'howIReview', title: 'How the Boss reviews', type: 'array', group: 'about',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'title', type: 'string', title: 'Heading · หัวข้อ' }), defineField({ name: 'text', type: 'text', title: 'Description · คำอธิบาย' })], preview: { select: { title: 'title', subtitle: 'text' } } })] }),
    para('workWithMe', 'Work with the Boss · หน้าเกี่ยวกับบอส + หน้าติดต่อ', 'about'),
    // ติดต่อ & ฟอร์ม
    txt('contactTitle', 'Contact title · หัวข้อหน้าติดต่อ', 'contact'),
    para('contactIntro', 'Contact intro · คำอธิบายหน้าติดต่อ', 'contact'),
    defineField({ name: 'contactEmail', title: 'Contact email · อีเมลติดต่อ', type: 'string', validation: (r) => r.email(), group: 'contact' }),
    defineField({ name: 'web3formsKey', title: 'Contact form: Web3Forms access key', description: 'ทำให้ฟอร์มหน้า /contact/ ส่งเข้าอีเมลบอสตรงๆ · web3forms.com → ใส่อีเมลบอส → คัดลอก Access Key ที่ได้ทางอีเมลมาวาง · เว้นว่าง = ฟอร์มเปิดแอปอีเมลของผู้ส่งแทน', type: 'string', group: 'contact' }),
    // ท้ายเว็บ & SEO
    txt('footerRights', 'Rights notice · ข้อความสงวนลิขสิทธิ์', 'footer'),
    txt('capsuleTitle', 'Time capsule label · หัวข้อเล็กหน้าไทม์แคปซูล', 'capsule'),
    defineField({ name: 'capsuleIntro', title: 'Time capsule intro · คำอธิบายหน้าไทม์แคปซูล', type: 'text', rows: 2, group: 'capsule' }),
    txt('capsuleReturning', 'Returning dishes heading · หัวข้อ "จานที่กลับมา"', 'capsule'),
    txt('capsuleLink', 'Time capsule link · ข้อความลิงก์ไปหน้าไทม์แคปซูล', 'capsule'),
    defineField({ name: 'facebook', title: 'Facebook link', type: 'url', group: 'footer' }),
    defineField({ name: 'instagram', title: 'Instagram link', type: 'url', group: 'footer' }),
    defineField({ name: 'siteDescription', title: 'Site description (Google) · คำอธิบายเว็บใน Google', description: '120–155 ตัวอักษร', type: 'text', rows: 2, validation: (r) => r.max(160).warning('ยาวเกิน Google จะตัด'), group: 'footer' }),
    defineField({ name: 'ogImage', title: 'Share image · รูปตอนแชร์ลิงก์ (1200×630)', description: 'บทความมีรูปแชร์ของตัวเองอัตโนมัติ (รูปปก + โลโก้ + ชื่อร้าน) · เว้นว่าง = รูปมาตรฐานของแบรนด์', type: 'image', group: 'footer' }),
    defineField({ name: 'googleSiteVerification', title: 'Google Search Console code · โค้ดยืนยันเว็บกับ Google', description: 'Search Console → เพิ่มพร็อพเพอร์ตี → URL prefix https://eatlikeboss.com/ → วิธี "แท็ก HTML" → วางทั้งแท็ก <meta …> หรือเฉพาะค่าใน content ก็ได้ · Publish แล้วรอเว็บ build ~3 นาที ก่อนกด Verify', type: 'string', group: 'footer' }),
    defineField({ name: 'cfAnalyticsToken', title: 'Cloudflare Web Analytics token', description: 'Cloudflare → Web Analytics → คัดลอกค่า token ใน snippet · เว้นว่าง = ไม่เก็บสถิติ', type: 'string', group: 'footer' }),
  ],
  preview: { prepare: () => ({ title: 'Site settings · ตั้งค่าเว็บ / ข้อความทุกหน้า' }) },
});

export const schemaTypes = [article, city, settings, award];
