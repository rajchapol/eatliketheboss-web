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
  title: 'คำบรรยายภาพ (alt)',
  description: 'บรรยายจานจริง เช่น "ซูชิโอโทโระบนข้าวอุ่น ร้าน X โตเกียว" — ช่วย SEO และคนที่ใช้โปรแกรมอ่านหน้าจอ',
  type: 'string',
  validation: (r) => r.required().min(10),
});
const photo = (name: string, title: string, group?: string) =>
  defineField({ name, title, type: 'image', options: { hotspot: true }, fields: [altField], ...(group ? { group } : {}) });

const CUISINES = ['ญี่ปุ่น', 'ไทย', 'ฝรั่งเศส', 'จีน', 'อิตาเลียน', 'สเปน', 'Modern', 'อื่นๆ'];

export const article = defineType({
  name: 'article',
  title: 'บทความ',
  type: 'document',
  groups: [
    // Numbered in the order you fill an article; "ทุกช่อง" shows everything on one page.
    { name: 'all-fields', title: 'ทุกช่อง' },
    { name: 'main', title: '1 ร้าน & บทนำ', icon: DocumentTextIcon, default: true },
    { name: 'dishes', title: '2 รายการจาน', icon: ThListIcon },
    { name: 'meta', title: '3 ราคา & วันที่ไป', icon: BillIcon },
    { name: 'seo', title: '4 SEO', icon: SearchIcon },
    { name: 'lang', title: '5 ภาษา / คำแปล', icon: TranslateIcon },
  ],
  fields: [
    defineField({ name: 'translations', title: 'ภาษาของบทความนี้ / เพิ่มคำแปล', type: 'string', group: 'lang', readOnly: true, components: { input: TranslationsPanel } }),
    defineField({ name: 'language', title: 'บทความนี้เป็นภาษา', description: 'ตั้งให้อัตโนมัติ แก้เองไม่ได้: บทความใหม่ = ภาษาไทย · คำแปลสร้างจากปุ่ม "+ English / 日本語 / 中文" ด้านบน', type: 'string', group: 'lang', initialValue: 'th', readOnly: true,
      options: { list: LANGS.map((l) => ({ title: l.label, value: l.id })), layout: 'radio', direction: 'horizontal' },
      validation: (r) => r.required() }),
    defineField({ name: 'translationOf', title: 'แปลจากบทความ (ภาษาไทย)', description: 'คำแปลต้องผูกกับบทความไทย เว็บจึงรู้ว่าเป็นร้านเดียวกัน และขึ้นปุ่มเปลี่ยนภาษาให้', type: 'reference', to: [{ type: 'article' }], group: 'lang',
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
    defineField({ name: 'series', title: 'ซีรีส์', type: 'string', group: 'main', initialValue: 'review',
      options: { list: [{ title: 'บอสพาชิม (รีวิวร้าน)', value: 'review' }, { title: 'มื้ออาหารเปลี่ยนโลก', value: 'history' }, { title: 'บอสพาดื่ม', value: 'drinks' }], layout: 'radio' },
      validation: (r) => r.required() }),
    defineField({ name: 'no', title: 'Tasting Notes No. (เลิกใช้)', description: 'เว็บนับเลขให้อัตโนมัติตามวัน Visit', type: 'number', hidden: true }),
    defineField({ name: 'episode', title: 'Ep.', type: 'number', group: 'main', hidden: ({ document }) => document?.series !== 'history' }),
    defineField({ name: 'title', title: 'ชื่อบทความเต็ม', description: 'เช่น บอสพาชิม in Tokyo: ชื่อร้าน (ชื่อเดิม) - คำโปรย (ไม่ต้องใส่อีโมจิ)', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug (ส่วนท้าย URL)', description: 'ภาษาอังกฤษตัวเล็ก คั่นด้วย - เช่น sezanne — ตั้งแล้วห้ามเปลี่ยน', type: 'slug', group: 'main',
      options: { source: (doc: any) => doc.restaurant?.name || doc.title, maxLength: 80,
        // a translation keeps the Thai slug (/en/review/<city>/<slug>/), so a slug only has to be unique within one language
        isUnique: async (slug: string, ctx: any) => {
          const id = String(ctx.document?._id || '').replace(/^drafts\./, '');
          return !(await ctx.getClient({ apiVersion: '2025-01-01' }).fetch('count(*[_type == "article" && slug.current == $slug && coalesce(language, "th") == $lang && !(_id in [$id, "drafts." + $id])])', { slug, lang: ctx.document?.language || 'th', id }));
        } }, validation: (r) => r.required() }),
    defineField({ name: 'tagline', title: 'คำโปรยเชิงศิลปะ', type: 'string', group: 'main' }),
    defineField({ name: 'city', title: 'เมือง', type: 'reference', to: [{ type: 'city' }], group: 'main',
      hidden: ({ document }) => document?.series === 'history', validation: (r) => r.custom((v, ctx: any) => (ctx.document?.series === 'review' && !v ? 'รีวิวร้านต้องเลือกเมือง' : true)) }),
    defineField({ name: 'restaurant', title: 'ร้าน', type: 'object', group: 'main', hidden: ({ document }) => document?.series !== 'review',
      fields: [
        defineField({ name: 'name', title: 'ชื่อร้าน', description: 'ไปซ้ำให้พิมพ์ชื่อเดิมทุกครั้ง เว็บจะรวมทุกครั้งที่ไปเป็นร้านเดียวกัน', type: 'string' }),
        defineField({ name: 'originalName', title: 'ชื่อภาษาเดิม', type: 'string' }),
        defineField({ name: 'chef', title: 'เชฟ', type: 'string' }),
        defineField({ name: 'area', title: 'ย่าน', type: 'string' }),
        defineField({ name: 'cuisine', title: 'ประเภทอาหาร', type: 'string', options: { list: CUISINES } }),
        defineField({ name: 'priceBand', title: 'ระดับราคา (เดิม)', type: 'string', hidden: true }), // older entries; now set in the Bill tab
        defineField({ name: 'sameAs', title: 'รีวิวครั้งก่อนของร้านนี้ (ไม่บังคับ)', description: 'ใช้เฉพาะเมื่อร้านเปลี่ยนชื่อหรือพิมพ์ชื่อไม่ตรงกับครั้งก่อน · ชื่อร้านเดิมในเมืองเดียวกัน เว็บรวมให้เองอยู่แล้ว', type: 'reference', weak: true, to: [{ type: 'article' }],
          options: { filter: 'language == "th" && series == "review"' } }),
        defineField({ name: 'aliases', title: 'ชื่อเรียกอื่นสำหรับค้นหา (ไม่บังคับ)', description: 'ชื่อที่คนอาจพิมพ์ค้นหา เช่น ชื่อร้านสะกดไทย "หย่งฟู" หรือชื่อเล่นของร้าน · ไม่แสดงบนเว็บ ใช้ค้นหาเท่านั้น · ชื่อเมือง/ประเภทอาหารภาษาไทย-อังกฤษ เว็บรู้เองอยู่แล้ว', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
        defineField({ name: 'awards', title: 'รางวัล (ตรวจจากแหล่งจริงแล้ว)', description: 'หนึ่งบรรทัดต่อหนึ่งรางวัล เช่น MICHELIN 1★ · กด Add item เพื่อเพิ่ม กดที่ข้อความเพื่อแก้ ลากเพื่อเรียงลำดับ', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
      ] }),
    photo('cover', 'ภาพปก (แนวนอน 3:2 — ทุกรูปอาหารในเว็บแสดง 3:2)', 'main'),
    defineField({ name: 'gallery', title: 'ภาพบรรยากาศร้าน / เชฟ (ไม่บังคับ)', description: 'แสดงต่อจากบทนำ ก่อนรายการจาน · 1–6 รูป แนวนอนดีที่สุด · ใส่คำบรรยายสั้นๆ ได้ เช่น "ห้องอาหารชั้น 56" หรือชื่อเชฟ', type: 'array', group: 'main',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [altField, defineField({ name: 'caption', title: 'คำบรรยายใต้ภาพ (ไม่บังคับ)', type: 'string' })] })],
      validation: (r) => r.max(6) }),
    defineField({ name: 'body', title: 'บทนำ', description: 'ย่อหน้าเปิดถึง "อาหารจะมีอะไรบ้างไปชมกันครับ"', type: 'array', group: 'main',
      of: [defineArrayMember({ type: 'block', styles: [{ title: 'ย่อหน้า', value: 'normal' }, { title: 'หัวข้อ', value: 'h2' }, { title: 'คำพูดเด่น', value: 'blockquote' }], lists: [] })] }),
    defineField({ name: 'quote', title: 'ประโยคเด่นของบอส (ไม่บังคับ)', type: 'text', rows: 2, group: 'main' }),
    defineField({ name: 'dishes', title: 'ศิลปะแห่งรสชาติในมื้อนี้', type: 'array', group: 'dishes',
      of: [defineArrayMember({ type: 'object', name: 'dish', title: 'จาน',
        fields: [
          defineField({ name: 'name', title: 'ชื่อจาน (ชื่อเดิม)', type: 'string', validation: (r) => r.required() }),
          defineField({ name: 'description', title: 'คำบรรยาย', description: 'สิ่งที่อยู่บนจาน. ความหมายของวัตถุดิบ/ศัพท์. รสชาติ', type: 'text', rows: 4 }),
          defineField({ name: 'glassesOff', title: '🕶️ ถอดแว่นชิม', type: 'boolean', initialValue: false }),
          photo('image', 'ภาพจาน'),
        ],
        preview: { select: { title: 'name', g: 'glassesOff', media: 'image' }, prepare: ({ title, g, media }: any) => ({ title: `${g ? '🕶️ ' : ''}${title}`, media }) } })],
      validation: (r) => r.custom((list: any[] | undefined) => ((list || []).filter((d) => d.glassesOff).length > 2 ? 'ถอดแว่นชิมได้มากสุด 2 จานต่อมื้อ' : true)) }),
    defineField({ name: 'billBand', title: "The Boss's Bill (ระดับราคาโดยประมาณ)", description: 'แสดงบนเว็บเป็นสัญลักษณ์ ไม่บอกว่ามื้อได้รับเชิญหรือจ่ายเอง · ฿฿ ต่ำกว่า 3,000 บาท · ฿฿฿ 3,000–7,999 · ฿฿฿฿ ตั้งแต่ 8,000 ต่อคน · เว้นว่าง = คำนวณจาก "ราคาจริง" ด้านล่าง', type: 'string', group: 'meta',
      options: { list: ['฿฿', '฿฿฿', '฿฿฿฿'], layout: 'radio', direction: 'horizontal' } }),
    defineField({ name: 'tag', title: 'มื้ออีเวนต์?', description: 'Event = มื้ออีเวนต์ / มื้อพิเศษ (ขึ้นป้ายคู่ระดับราคา) · AD = โพสต์ที่ได้รับค่าจ้างโฆษณา', type: 'string', group: 'meta',
      options: { list: [{ title: 'ไม่ใช่', value: '' }, { title: 'Event', value: 'Event' }, { title: 'AD (โพสต์โฆษณา)', value: 'AD' }], layout: 'radio', direction: 'horizontal' } }),
    defineField({ name: 'bill', title: 'ราคาจริง (ไม่แสดงบนเว็บ · ไม่บังคับ)', description: 'เช่น 6,999 THB++ หรือ 1,688 CNY · ใช้คำนวณระดับราคาให้อัตโนมัติเมื่อไม่ได้เลือกด้านบน', type: 'string', group: 'meta' }),
    defineField({ name: 'visit', title: 'Visit', description: 'เดือนที่ไปกินจริง รูปแบบ Mon-YYYY เช่น Oct-2026 · เว็บใช้เรียงเลข Tasting Notes No. (มื้อเก่าสุด = No. 001)', type: 'string', group: 'meta',
      validation: (r) => r.regex(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/, { name: 'Mon-YYYY' }).custom((v, ctx: any) => (ctx.document?.series === 'review' && !v ? 'รีวิวร้านต้องใส่ Visit' : true)) }),
    defineField({ name: 'hashtags', title: 'แฮชแท็ก (ไม่ต้องใส่ #, ไม่เกิน 10)', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' }, group: 'meta', validation: (r) => r.max(10) }),
    defineField({ name: 'publishedAt', title: 'วันที่เผยแพร่', type: 'date', group: 'meta', initialValue: () => new Date().toISOString().slice(0, 10), validation: (r) => r.required() }),
    defineField({ name: 'seoTitle', title: 'Meta title', description: '≤ 60 ตัวอักษร เช่น "ร้าน X Tokyo รีวิว Fine Dining" (ระบบเติม "— บอสพาชิม" ให้)', type: 'string', group: 'seo', components: { input: charCount(0, 60) }, validation: (r) => r.max(60) }),
    defineField({ name: 'seoDescription', title: 'Meta description', description: '120–155 ตัวอักษร ในน้ำเสียงบอส ห้ามมีดาวหรือคะแนน', type: 'text', rows: 3, group: 'seo',
      components: { input: charCount(120, 155) as any }, validation: (r) => r.min(120).max(155).warning('ควรยาว 120–155 ตัวอักษร') }),
  ],
  orderings: [{ title: 'ใหม่สุด', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', name: 'restaurant.name', series: 'series', ep: 'episode', visit: 'visit', lang: 'language', city: 'city.nameEn', media: 'cover' },
    // The restaurant name first, so lists and the "แปลจากบทความ" picker show which article it is at a glance.
    prepare: ({ title, name, series, ep, visit, lang, city, media }: any) => ({
      title: series === 'history' ? `Ep.${ep ?? '?'} ${title ?? ''}` : (name || title || 'ไม่มีชื่อ'),
      subtitle: [LANGS.find((l) => l.id === (lang || 'th'))?.short ?? 'TH', city, visit && `Visit ${visit}`].filter(Boolean).join(' · '),
      media,
    }) },
});

export const city = defineType({
  name: 'city',
  title: 'เมือง',
  type: 'document',
  fields: [
    defineField({ name: 'nameEn', title: 'ชื่ออังกฤษ', type: 'string', validation: (r) => [r.required(), r.custom((v?: string) => (v && v !== v.trim() ? 'มีช่องว่างหน้าหรือท้ายชื่อ ลบออกด้วยครับ' : true)).warning()] }),
    defineField({ name: 'nameTh', title: 'ชื่อไทย', type: 'string', validation: (r) => [r.required(), r.custom((v?: string) => (v && v !== v.trim() ? 'มีช่องว่างหน้าหรือท้ายชื่อ ลบออกด้วยครับ' : true)).warning()] }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'nameEn' }, validation: (r) => r.required() }),
    defineField({ name: 'country', title: 'ประเทศ (ไทย)', type: 'string' }),
    defineField({ name: 'aliases', title: 'ชื่อเรียกอื่นสำหรับค้นหา (ไม่บังคับ)', description: 'เช่น ชื่อย่าน ชื่อภาษาจีน/ญี่ปุ่น หรือสะกดไทยแบบอื่น · ชื่อเมืองหลักๆ ไทย-อังกฤษ เว็บรู้เองอยู่แล้ว', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
    defineField({ name: 'region', title: 'ภูมิภาค (กลุ่มในหน้าจุดหมาย)', description: 'ถ้าพิมพ์ชื่อประเทศที่เว็บรู้จัก (เช่น ญี่ปุ่น ฝรั่งเศส) เว็บจัดกลุ่มให้เองตามประเทศ · ในหน้าจุดหมาย แต่ละภูมิภาคแบ่งย่อยตามช่อง "ประเทศ" อีกชั้น', type: 'string',
      options: { list: [{ title: 'ประเทศไทย', value: 'th' }, { title: 'เอเชีย', value: 'asia' }, { title: 'ยุโรป', value: 'europe' }, { title: 'อเมริกา', value: 'americas' }, { title: 'โอเชียเนีย', value: 'oceania' }, { title: 'ตะวันออกกลางและแอฟริกา', value: 'mea' }] } }),
    defineField({ name: 'motif', title: 'ลายประจำเมือง', type: 'string', initialValue: 'loop',
      options: { list: [{ title: 'Seigaiha (Tokyo)', value: 'seigaiha' }, { title: 'Shippo (Kyoto)', value: 'shippo' }, { title: 'Kikko (Osaka)', value: 'kikko' }, { title: 'ลายประจำยาม (Bangkok)', value: 'prajam' }, { title: '回纹 Fret (Hong Kong)', value: 'fret' }, { title: 'Art Deco ตึกขั้นบันได (Shanghai)', value: 'shanghai' }, { title: 'ดอกบัว (Hangzhou)', value: 'hangzhou' }, { title: 'Yukiwa (Sapporo)', value: 'sapporo' }, { title: 'โคมยี่เป็ง (Chiang Mai)', value: 'chiangmai' }, { title: 'ซุ้มโค้งชิโน-โปรตุกีส (Phuket)', value: 'phuket' }, { title: 'กระเบื้องเปอรานากัน (Singapore)', value: 'singapore' }, { title: 'ดอกเหมย 梅花 (Taipei)', value: 'taipei' }, { title: 'คลื่น Aalto (Helsinki)', value: 'helsinki' }, { title: 'ลายร่อง Musselmalet (Copenhagen)', value: 'copenhagen' }, { title: 'ดาว Selbu (Oslo)', value: 'oslo' }, { title: 'ดาวแปดแฉกออตโตมัน (Istanbul)', value: 'istanbul' }, { title: 'หน้าต่าง 亞 เกาหลี (Seoul)', value: 'seoul' }, { title: 'Gold Loop (ทั่วไป)', value: 'loop' }] } }),
    defineField({ name: 'intro', title: 'คำแนะนำเมืองในมุมของบอส', type: 'text', rows: 3 }),
    defineField({ name: 'location', title: 'ตำแหน่งบนแผนที่ (ไม่บังคับ)', description: 'เมืองหลักๆ เว็บรู้ตำแหน่งอยู่แล้ว ใส่เฉพาะเมืองที่ไม่ขึ้นบนแผนที่หน้าจุดหมาย', type: 'geopoint' }),
    photo('cover', 'ภาพเมือง'),
    defineField({ name: 'featured', title: 'แสดงเป็นเมืองแนะนำในหน้าจุดหมาย', type: 'boolean', initialValue: false }),
    defineField({ name: 'picks', title: "Boss's Picks ของเมืองนี้", description: 'เลือกได้สูงสุด 3 ร้าน เรียงตามลำดับที่ใส่ · เว้นว่าง = เว็บเลือกให้เอง (ร้านล่าสุดที่มีจานถอดแว่นชิม)', type: 'array',
      of: [defineArrayMember({ type: 'reference', weak: true, to: [{ type: 'article' }], // weak: deleting an article is never blocked
        options: { filter: ({ document }: any) => ({ filter: 'language == "th" && series == "review" && city._ref == $city', params: { city: String(document?._id || '').replace(/^drafts\./, '') } }) } })],
      validation: (r) => r.max(3) }),
  ],
  preview: { select: { title: 'nameEn', subtitle: 'nameTh', media: 'cover' } },
});

// Site settings: one tab per page of the website, in the order a visitor meets them.
// Every field starts with the text the website shows today (defaults: src/data/settings.json).
const txt = (name: string, title: string, group: string, extra: Record<string, unknown> = {}) => defineField({ name, title, type: 'string', group, ...extra });
const para = (name: string, title: string, group: string, rows = 3, extra: Record<string, unknown> = {}) => defineField({ name, title, type: 'text', rows, group, ...extra });

export const settings = defineType({
  name: 'settings',
  title: 'ตั้งค่าเว็บ / ข้อความทุกหน้า',
  type: 'document',
  groups: [
    // Short names + icons, same words as the website menu, so each tab reads at a glance.
    { name: 'all-fields', title: 'ทุกช่อง', hidden: true }, // 40+ fields on one page is hard to scan
    { name: 'home', title: 'หน้าแรก', icon: HomeIcon, default: true },
    { name: 'article', title: 'บทความ', icon: DocumentTextIcon },
    { name: 'finder', title: 'ค้นหาร้าน', icon: SearchIcon },
    { name: 'destinations', title: 'จุดหมาย', icon: PinIcon },
    { name: 'awards', title: 'Awards', icon: EyeClosedIcon },
    { name: 'series', title: 'ซีรีส์', icon: BookIcon },
    { name: 'about', title: 'เกี่ยวกับบอส', icon: UserIcon },
    { name: 'contact', title: 'ติดต่อ', icon: EnvelopeIcon },
    { name: 'capsule', title: 'ไทม์แคปซูล', icon: CalendarIcon },
    { name: 'footer', title: 'ท้ายเว็บ & SEO', icon: EarthGlobeIcon },
  ],
  fields: [
    // หน้าแรก
    defineField({ name: 'featuredArticle', title: 'บทความเด่น (สไลด์แรก)', description: 'เว้นว่าง = สไลด์ 5 ร้านล่าสุดที่ไปเยือน', type: 'reference', to: [{ type: 'article' }], options: { filter: 'language == "th"' }, group: 'home' }),
    defineField({ name: 'homeCities', title: 'ปุ่มเมืองลัดใต้ช่องค้นหา', description: 'เลือก 2–5 เมือง (เว้นว่าง = 3 เมืองที่มีร้านมากที่สุด)', type: 'array', of: [defineArrayMember({ type: 'reference', to: [{ type: 'city' }] })], validation: (r) => r.max(5), group: 'home' }),
    txt('homeFinderLabel', 'ข้อความหน้าช่องค้นหา', 'home'),
    txt('homeSearchPlaceholder', 'ข้อความจางในช่องค้นหา', 'home'),
    txt('homeLatestTitle', 'หัวข้อสไลด์ร้านล่าสุด', 'home'),
    txt('homeIndexTitle', 'หัวข้อรายการบทความ', 'home'),
    txt('homeIndexLink', 'ลิงก์ "ดูทั้งหมด" ของรายการบทความ', 'home'),
    para('tagline', 'คำโปรยแบรนด์ (ตัวใหญ่กลางหน้า)', 'home', 2),
    txt('homeAwardsText', 'ข้อความแถบ Glasses Off Awards', 'home'),
    para('invitedNote', 'ข้อความใต้ "เกี่ยวกับบอส" ท้ายหน้าแรก', 'home', 2),
    // หน้าบทความ
    txt('articleMenuTitle', 'หัวข้อส่วนรายการจาน', 'article'),
    txt('articleGlassesQuote', 'ประโยคบนจานถอดแว่นชิม', 'article'),
    txt('articleShareTitle', 'ข้อความเหนือปุ่มแชร์ท้ายบทความ', 'article'),
    // ค้นหาร้าน
    txt('finderTitle', 'หัวข้อหน้าค้นหาร้าน', 'finder'),
    para('finderIntro', 'คำอธิบายหน้าค้นหาร้าน', 'finder'),
    // จุดหมาย
    txt('destinationsTitle', 'หัวข้อหน้าจุดหมาย', 'destinations'),
    para('destinationsIntro', 'คำอธิบายหน้าจุดหมาย', 'destinations'),
    txt('mapTitle', 'หัวข้อแผนที่', 'destinations'),
    // Glasses Off Awards
    para('awardsIntro', 'คำอธิบายหน้า Glasses Off Awards', 'awards'),
    // ซีรีส์
    defineField({ name: 'seriesText', title: 'คำอธิบายซีรีส์', description: 'แสดงในหน้าซีรีส์และหน้าเกี่ยวกับบอส', type: 'object', group: 'series', fields: [
      defineField({ name: 'review', title: 'บอสพาชิม', type: 'text', rows: 2 }),
      defineField({ name: 'history', title: 'มื้ออาหารเปลี่ยนโลก', type: 'text', rows: 2 }),
      defineField({ name: 'drinks', title: 'บอสพาดื่ม', type: 'text', rows: 2 }),
    ] }),
    // เกี่ยวกับบอส
    txt('aboutHeadline', 'หัวข้อหน้าเกี่ยวกับบอส', 'about'),
    defineField({ name: 'aboutBio', title: 'ประวัติ (ย่อหน้า)', type: 'array', of: [defineArrayMember({ type: 'text' })], group: 'about' }),
    para('aboutShortBio', 'ประวัติสั้น 1–2 บรรทัด (หน้าแรก + คำอธิบายใน Google)', 'about', 2),
    defineField({ name: 'aboutStats', title: 'ตัวเลขเด่น', type: 'array', group: 'about',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'value', type: 'string', title: 'ตัวเลข/คำ (เช่น 2017)' }), defineField({ name: 'label', type: 'string', title: 'คำอธิบาย' })], preview: { select: { title: 'value', subtitle: 'label' } } })], validation: (r) => r.max(4) }),
    defineField({ name: 'whyHonest', title: 'Why honest matters (ย่อหน้า)', type: 'array', of: [defineArrayMember({ type: 'text' })], group: 'about' }),
    defineField({ name: 'howIReview', title: 'How the Boss reviews', type: 'array', group: 'about',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'title', type: 'string', title: 'หัวข้อ' }), defineField({ name: 'text', type: 'text', title: 'คำอธิบาย' })], preview: { select: { title: 'title', subtitle: 'text' } } })] }),
    para('workWithMe', 'Work with the Boss (หน้าเกี่ยวกับบอส + หน้าติดต่อ)', 'about'),
    // ติดต่อ & ฟอร์ม
    txt('contactTitle', 'หัวข้อหน้าติดต่อ', 'contact'),
    para('contactIntro', 'คำอธิบายหน้าติดต่อ', 'contact'),
    defineField({ name: 'contactEmail', title: 'อีเมลติดต่อ', type: 'string', validation: (r) => r.email(), group: 'contact' }),
    defineField({ name: 'web3formsKey', title: 'ฟอร์มติดต่อ: Web3Forms access key', description: 'ทำให้ฟอร์มหน้า /contact/ ส่งเข้าอีเมลบอสตรงๆ · web3forms.com → ใส่อีเมลบอส → คัดลอก Access Key ที่ได้ทางอีเมลมาวาง · เว้นว่าง = ฟอร์มเปิดแอปอีเมลของผู้ส่งแทน', type: 'string', group: 'contact' }),
    // ท้ายเว็บ & SEO
    txt('footerRights', 'ข้อความสงวนลิขสิทธิ์ท้ายเว็บ', 'footer'),
    txt('capsuleTitle', 'หัวข้อเล็กหน้าไทม์แคปซูล (ร้านที่ไปซ้ำ)', 'capsule'),
    defineField({ name: 'capsuleIntro', title: 'คำอธิบายหน้าไทม์แคปซูล', type: 'text', rows: 2, group: 'capsule' }),
    txt('capsuleReturning', 'หัวข้อ "จานที่กลับมา"', 'capsule'),
    txt('capsuleLink', 'ข้อความลิงก์ไปหน้าไทม์แคปซูล (บนการ์ดและในรีวิว)', 'capsule'),
    defineField({ name: 'facebook', title: 'ลิงก์ Facebook', type: 'url', group: 'footer' }),
    defineField({ name: 'instagram', title: 'ลิงก์ Instagram', type: 'url', group: 'footer' }),
    defineField({ name: 'siteDescription', title: 'คำอธิบายเว็บใน Google', description: '120–155 ตัวอักษร', type: 'text', rows: 2, validation: (r) => r.max(160).warning('ยาวเกิน Google จะตัด'), group: 'footer' }),
    defineField({ name: 'ogImage', title: 'รูปตอนแชร์ลิงก์หน้าทั่วไป (1200×630)', description: 'บทความมีรูปแชร์ของตัวเองอัตโนมัติ (รูปปก + โลโก้ + ชื่อร้าน) · เว้นว่าง = รูปมาตรฐานของแบรนด์', type: 'image', group: 'footer' }),
    defineField({ name: 'cfAnalyticsToken', title: 'Cloudflare Web Analytics token', description: 'Cloudflare → Web Analytics → คัดลอกค่า token ใน snippet · เว้นว่าง = ไม่เก็บสถิติ', type: 'string', group: 'footer' }),
  ],
  preview: { prepare: () => ({ title: 'ตั้งค่าเว็บ / ข้อความทุกหน้า' }) },
});

export const schemaTypes = [article, city, settings];
