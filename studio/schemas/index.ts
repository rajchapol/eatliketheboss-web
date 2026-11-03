import { defineArrayMember, defineField, defineType } from 'sanity';

const altField = defineField({
  name: 'alt',
  title: 'คำบรรยายภาพ (alt)',
  description: 'บรรยายจานจริง เช่น "ซูชิโอโทโระบนข้าวอุ่น ร้าน X โตเกียว" — ช่วย SEO และคนที่ใช้โปรแกรมอ่านหน้าจอ',
  type: 'string',
  validation: (r) => r.required().min(10),
});
const photo = (name: string, title: string) =>
  defineField({ name, title, type: 'image', options: { hotspot: true }, fields: [altField] });

const CUISINES = ['ญี่ปุ่น', 'ไทย', 'ฝรั่งเศส', 'จีน', 'อิตาเลียน', 'สเปน', 'Modern', 'อื่นๆ'];

export const article = defineType({
  name: 'article',
  title: 'บทความ',
  type: 'document',
  groups: [
    { name: 'main', title: 'เนื้อหา', default: true },
    { name: 'dishes', title: 'รายการจาน' },
    { name: 'meta', title: 'Bill / Visit / แท็ก' },
    { name: 'seo', title: 'SEO' },
    { name: 'lang', title: 'ภาษา' },
  ],
  fields: [
    defineField({ name: 'language', title: 'ภาษา', type: 'string', group: 'lang', initialValue: 'th',
      options: { list: [{ title: 'ไทย', value: 'th' }, { title: 'English', value: 'en' }, { title: '日本語', value: 'ja' }, { title: '中文', value: 'zh' }], layout: 'radio', direction: 'horizontal' },
      validation: (r) => r.required() }),
    defineField({ name: 'translationOf', title: 'แปลจากบทความ (ภาษาไทย)', type: 'reference', to: [{ type: 'article' }], group: 'lang',
      options: { filter: 'language == "th"' }, hidden: ({ document }) => document?.language === 'th' }),
    defineField({ name: 'series', title: 'ซีรีส์', type: 'string', group: 'main', initialValue: 'review',
      options: { list: [{ title: 'บอสพาชิม (รีวิวร้าน)', value: 'review' }, { title: 'มื้ออาหารเปลี่ยนโลก', value: 'history' }, { title: 'บอสพาดื่ม', value: 'drinks' }], layout: 'radio' },
      validation: (r) => r.required() }),
    defineField({ name: 'no', title: 'Tasting Notes No.', type: 'number', group: 'main', validation: (r) => r.required().integer().positive() }),
    defineField({ name: 'episode', title: 'Ep.', type: 'number', group: 'main', hidden: ({ document }) => document?.series !== 'history' }),
    defineField({ name: 'title', title: 'ชื่อบทความเต็ม', description: 'เช่น บอสพาชิม in Tokyo: ชื่อร้าน (ชื่อเดิม) - คำโปรย (ไม่ต้องใส่อีโมจิ)', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug (ส่วนท้าย URL)', description: 'ภาษาอังกฤษตัวเล็ก คั่นด้วย - เช่น sezanne — ตั้งแล้วห้ามเปลี่ยน', type: 'slug', group: 'main',
      options: { source: (doc: any) => doc.restaurant?.name || doc.title, maxLength: 80 }, validation: (r) => r.required() }),
    defineField({ name: 'tagline', title: 'คำโปรยเชิงศิลปะ', type: 'string', group: 'main' }),
    defineField({ name: 'city', title: 'เมือง', type: 'reference', to: [{ type: 'city' }], group: 'main',
      hidden: ({ document }) => document?.series === 'history', validation: (r) => r.custom((v, ctx: any) => (ctx.document?.series === 'review' && !v ? 'รีวิวร้านต้องเลือกเมือง' : true)) }),
    defineField({ name: 'restaurant', title: 'ร้าน', type: 'object', group: 'main', hidden: ({ document }) => document?.series !== 'review',
      fields: [
        defineField({ name: 'name', title: 'ชื่อร้าน', type: 'string' }),
        defineField({ name: 'originalName', title: 'ชื่อภาษาเดิม', type: 'string' }),
        defineField({ name: 'chef', title: 'เชฟ', type: 'string' }),
        defineField({ name: 'area', title: 'ย่าน', type: 'string' }),
        defineField({ name: 'cuisine', title: 'ประเภทอาหาร', type: 'string', options: { list: CUISINES } }),
        defineField({ name: 'priceBand', title: 'ระดับราคา', type: 'string', options: { list: ['฿฿', '฿฿฿', '฿฿฿฿'], layout: 'radio', direction: 'horizontal' } }),
        defineField({ name: 'awards', title: 'รางวัล (ตรวจจากแหล่งจริงแล้ว)', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
      ] }),
    photo('cover', 'ภาพปก (4:5 หรือแนวนอน)'),
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
    defineField({ name: 'tag', title: 'มื้อนี้ได้รับเชิญ / โฆษณา?', type: 'string', group: 'meta',
      options: { list: [{ title: 'จ่ายเอง (ไม่มีป้าย)', value: '' }, { title: 'AD', value: 'AD' }, { title: 'Event', value: 'Event' }], layout: 'radio', direction: 'horizontal' } }),
    defineField({ name: 'bill', title: "The Boss's Bill", description: 'เขียนตามที่บอสให้ เช่น 6,999 THB++ (ไม่ต้องใส่ถ้าเป็น AD/Event)', type: 'string', group: 'meta', hidden: ({ document }) => Boolean(document?.tag) }),
    defineField({ name: 'visit', title: 'Visit', description: 'รูปแบบ Mon-YYYY เช่น Oct-2026', type: 'string', group: 'meta',
      validation: (r) => r.regex(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/, { name: 'Mon-YYYY' }) }),
    defineField({ name: 'hashtags', title: 'แฮชแท็ก (ไม่ต้องใส่ #, ไม่เกิน 10)', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' }, group: 'meta', validation: (r) => r.max(10) }),
    defineField({ name: 'publishedAt', title: 'วันที่เผยแพร่', type: 'date', group: 'meta', initialValue: () => new Date().toISOString().slice(0, 10), validation: (r) => r.required() }),
    defineField({ name: 'seoTitle', title: 'Meta title', description: '≤ 60 ตัวอักษร เช่น "ร้าน X Tokyo รีวิว Fine Dining" (ระบบเติม "— บอสพาชิม" ให้)', type: 'string', group: 'seo', validation: (r) => r.max(60) }),
    defineField({ name: 'seoDescription', title: 'Meta description', description: '120–155 ตัวอักษร ในน้ำเสียงบอส ห้ามมีดาวหรือคะแนน', type: 'text', rows: 3, group: 'seo',
      validation: (r) => r.min(80).max(160).warning() }),
  ],
  orderings: [{ title: 'ใหม่สุด', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', no: 'no', lang: 'language', media: 'cover' },
    prepare: ({ title, no, lang, media }: any) => ({ title, subtitle: `No. ${no ?? '?'} · ${String(lang || 'th').toUpperCase()}`, media }) },
});

export const city = defineType({
  name: 'city',
  title: 'เมือง',
  type: 'document',
  fields: [
    defineField({ name: 'nameEn', title: 'ชื่ออังกฤษ', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'nameTh', title: 'ชื่อไทย', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'nameEn' }, validation: (r) => r.required() }),
    defineField({ name: 'country', title: 'ประเทศ (ไทย)', type: 'string' }),
    defineField({ name: 'region', title: 'ภูมิภาค', type: 'string', initialValue: 'other',
      options: { list: [{ title: 'ประเทศไทย', value: 'th' }, { title: 'ญี่ปุ่น', value: 'jp' }, { title: 'จีน ฮ่องกง สิงคโปร์', value: 'cn' }, { title: 'อื่นๆ', value: 'other' }] } }),
    defineField({ name: 'motif', title: 'ลายประจำเมือง', type: 'string', initialValue: 'loop',
      options: { list: [{ title: 'Seigaiha (Tokyo)', value: 'seigaiha' }, { title: 'Shippo (Kyoto)', value: 'shippo' }, { title: 'Kikko (Osaka)', value: 'kikko' }, { title: 'ลายประจำยาม (Bangkok)', value: 'prajam' }, { title: '回纹 Fret (Hong Kong)', value: 'fret' }, { title: 'Gold Loop (ทั่วไป)', value: 'loop' }] } }),
    defineField({ name: 'intro', title: 'คำแนะนำเมืองในมุมของบอส', type: 'text', rows: 3 }),
    photo('cover', 'ภาพเมือง'),
    defineField({ name: 'featured', title: 'แสดงเป็นเมืองแนะนำในหน้าจุดหมาย', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'nameEn', subtitle: 'nameTh', media: 'cover' } },
});

export const settings = defineType({
  name: 'settings',
  title: 'ตั้งค่าเว็บ / เกี่ยวกับบอส',
  type: 'document',
  fields: [
    defineField({ name: 'aboutHeadline', title: 'หัวข้อหน้าเกี่ยวกับบอส', type: 'string' }),
    defineField({ name: 'aboutBio', title: 'ประวัติ (ย่อหน้า)', type: 'array', of: [defineArrayMember({ type: 'text' })] }),
    defineField({ name: 'aboutShortBio', title: 'ประวัติสั้น 1 บรรทัด', type: 'text', rows: 2 }),
    defineField({ name: 'whyHonest', title: 'Why honest matters (ย่อหน้า)', type: 'array', of: [defineArrayMember({ type: 'text' })] }),
    defineField({ name: 'howIReview', title: 'How the Boss reviews', type: 'array',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'title', type: 'string', title: 'หัวข้อ' }), defineField({ name: 'text', type: 'text', title: 'คำอธิบาย' })] })] }),
    defineField({ name: 'workWithMe', title: 'Work with the Boss', type: 'text', rows: 3 }),
  ],
  preview: { prepare: () => ({ title: 'ตั้งค่าเว็บ / เกี่ยวกับบอส' }) },
});

export const schemaTypes = [article, city, settings];
