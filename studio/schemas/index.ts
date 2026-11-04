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
    defineField({ name: 'no', title: 'Tasting Notes No. (เลิกใช้)', description: 'เว็บนับเลขให้อัตโนมัติตามวัน Visit', type: 'number', hidden: true }),
    defineField({ name: 'episode', title: 'Ep.', type: 'number', group: 'main', hidden: ({ document }) => document?.series !== 'history' }),
    defineField({ name: 'title', title: 'ชื่อบทความเต็ม', description: 'เช่น บอสพาชิม in Tokyo: ชื่อร้าน (ชื่อเดิม) - คำโปรย (ไม่ต้องใส่อีโมจิ)', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug (ส่วนท้าย URL)', description: 'ภาษาอังกฤษตัวเล็ก คั่นด้วย - เช่น sezanne — ตั้งแล้วห้ามเปลี่ยน', type: 'slug', group: 'main',
      options: { source: (doc: any) => doc.restaurant?.name || doc.title, maxLength: 80 }, validation: (r) => r.required() }),
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
        defineField({ name: 'priceBand', title: 'ระดับราคา', type: 'string', options: { list: ['฿฿', '฿฿฿', '฿฿฿฿'], layout: 'radio', direction: 'horizontal' } }),
        defineField({ name: 'awards', title: 'รางวัล (ตรวจจากแหล่งจริงแล้ว)', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
      ] }),
    photo('cover', 'ภาพปก (แนวนอน 3:2 — ทุกรูปอาหารในเว็บแสดง 3:2)'),
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
    defineField({ name: 'visit', title: 'Visit', description: 'เดือนที่ไปกินจริง รูปแบบ Mon-YYYY เช่น Oct-2026 · เว็บใช้เรียงเลข Tasting Notes No. (มื้อเก่าสุด = No. 001)', type: 'string', group: 'meta',
      validation: (r) => r.regex(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/, { name: 'Mon-YYYY' }).custom((v, ctx: any) => (ctx.document?.series === 'review' && !v ? 'รีวิวร้านต้องใส่ Visit' : true)) }),
    defineField({ name: 'hashtags', title: 'แฮชแท็ก (ไม่ต้องใส่ #, ไม่เกิน 10)', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' }, group: 'meta', validation: (r) => r.max(10) }),
    defineField({ name: 'publishedAt', title: 'วันที่เผยแพร่', type: 'date', group: 'meta', initialValue: () => new Date().toISOString().slice(0, 10), validation: (r) => r.required() }),
    defineField({ name: 'seoTitle', title: 'Meta title', description: '≤ 60 ตัวอักษร เช่น "ร้าน X Tokyo รีวิว Fine Dining" (ระบบเติม "— บอสพาชิม" ให้)', type: 'string', group: 'seo', validation: (r) => r.max(60) }),
    defineField({ name: 'seoDescription', title: 'Meta description', description: '120–155 ตัวอักษร ในน้ำเสียงบอส ห้ามมีดาวหรือคะแนน', type: 'text', rows: 3, group: 'seo',
      validation: (r) => r.min(80).max(160).warning() }),
  ],
  orderings: [{ title: 'ใหม่สุด', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', visit: 'visit', lang: 'language', media: 'cover' },
    prepare: ({ title, visit, lang, media }: any) => ({ title, subtitle: `Visit ${visit || '—'} · ${String(lang || 'th').toUpperCase()}`, media }) },
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
    defineField({ name: 'region', title: 'ภูมิภาค (กลุ่มในหน้าจุดหมาย)', description: 'ถ้าพิมพ์ชื่อประเทศที่เว็บรู้จัก (เช่น ญี่ปุ่น ฝรั่งเศส) เว็บจัดกลุ่มให้เองตามประเทศ · ในหน้าจุดหมาย แต่ละภูมิภาคแบ่งย่อยตามช่อง "ประเทศ" อีกชั้น', type: 'string',
      options: { list: [{ title: 'ประเทศไทย', value: 'th' }, { title: 'เอเชีย', value: 'asia' }, { title: 'ยุโรป', value: 'europe' }, { title: 'อเมริกา', value: 'americas' }, { title: 'โอเชียเนีย', value: 'oceania' }, { title: 'ตะวันออกกลางและแอฟริกา', value: 'mea' }] } }),
    defineField({ name: 'motif', title: 'ลายประจำเมือง', type: 'string', initialValue: 'loop',
      options: { list: [{ title: 'Seigaiha (Tokyo)', value: 'seigaiha' }, { title: 'Shippo (Kyoto)', value: 'shippo' }, { title: 'Kikko (Osaka)', value: 'kikko' }, { title: 'ลายประจำยาม (Bangkok)', value: 'prajam' }, { title: '回纹 Fret (Hong Kong)', value: 'fret' }, { title: 'Gold Loop (ทั่วไป)', value: 'loop' }] } }),
    defineField({ name: 'intro', title: 'คำแนะนำเมืองในมุมของบอส', type: 'text', rows: 3 }),
    photo('cover', 'ภาพเมือง'),
    defineField({ name: 'featured', title: 'แสดงเป็นเมืองแนะนำในหน้าจุดหมาย', type: 'boolean', initialValue: false }),
    defineField({ name: 'picks', title: "Boss's Picks ของเมืองนี้", description: 'เลือกได้สูงสุด 3 ร้าน เรียงตามลำดับที่ใส่ · เว้นว่าง = เว็บเลือกให้เอง (ร้านล่าสุดที่มีจานถอดแว่นชิม)', type: 'array',
      of: [defineArrayMember({ type: 'reference', weak: true, to: [{ type: 'article' }], // weak: deleting an article is never blocked
        options: { filter: ({ document }: any) => ({ filter: 'language == "th" && series == "review" && city._ref == $city', params: { city: String(document?._id || '').replace(/^drafts\./, '') } }) } })],
      validation: (r) => r.max(3) }),
  ],
  preview: { select: { title: 'nameEn', subtitle: 'nameTh', media: 'cover' } },
});

export const settings = defineType({
  name: 'settings',
  title: 'ตั้งค่าเว็บ / เกี่ยวกับบอส',
  type: 'document',
  groups: [
    { name: 'home', title: 'หน้าแรก', default: true },
    { name: 'about', title: 'เกี่ยวกับบอส' },
    { name: 'pages', title: 'ข้อความหน้าอื่นๆ' },
    { name: 'contact', title: 'ติดต่อ & SEO' },
  ],
  fields: [
    // หน้าแรก
    defineField({ name: 'tagline', title: 'คำโปรยแบรนด์', description: 'ข้อความตัวใหญ่กลางหน้าแรก และใต้หัวข้อหน้าเกี่ยวกับบอส', type: 'text', rows: 2, group: 'home' }),
    defineField({ name: 'featuredArticle', title: 'บทความเด่นหน้าแรก', description: 'เว้นว่าง = ใช้รีวิวล่าสุดอัตโนมัติ', type: 'reference', to: [{ type: 'article' }], options: { filter: 'language == "th"' }, group: 'home' }),
    defineField({ name: 'homeCities', title: 'ปุ่มเมืองลัดใต้ช่องค้นหา', description: 'เลือก 2–5 เมือง (เว้นว่าง = Bangkok, Tokyo, Osaka)', type: 'array', of: [defineArrayMember({ type: 'reference', to: [{ type: 'city' }] })], validation: (r) => r.max(5), group: 'home' }),
    defineField({ name: 'homeFinderLabel', title: 'ข้อความเหนือช่องค้นหา', type: 'string', group: 'home' }),
    defineField({ name: 'homeAwardsText', title: 'ข้อความแถบ Glasses Off Awards', type: 'string', group: 'home' }),
    defineField({ name: 'invitedNote', title: 'ข้อความเรื่องมื้อที่ได้รับเชิญ (ท้ายหน้าแรก)', type: 'string', group: 'home' }),
    // เกี่ยวกับบอส
    defineField({ name: 'aboutHeadline', title: 'หัวข้อหน้าเกี่ยวกับบอส', type: 'string', group: 'about' }),
    defineField({ name: 'aboutBio', title: 'ประวัติ (ย่อหน้า)', type: 'array', of: [defineArrayMember({ type: 'text' })], group: 'about' }),
    defineField({ name: 'aboutShortBio', title: 'ประวัติสั้น 1 บรรทัด', description: 'ใช้ในหน้าแรกและเป็นคำอธิบายหน้าเกี่ยวกับบอสใน Google', type: 'text', rows: 2, group: 'about' }),
    defineField({ name: 'aboutStats', title: 'ตัวเลขเด่น', type: 'array', group: 'about',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'value', type: 'string', title: 'ตัวเลข/คำ (เช่น 2017)' }), defineField({ name: 'label', type: 'string', title: 'คำอธิบาย' })], preview: { select: { title: 'value', subtitle: 'label' } } })], validation: (r) => r.max(4) }),
    defineField({ name: 'whyHonest', title: 'Why honest matters (ย่อหน้า)', type: 'array', of: [defineArrayMember({ type: 'text' })], group: 'about' }),
    defineField({ name: 'howIReview', title: 'How the Boss reviews', type: 'array', group: 'about',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'title', type: 'string', title: 'หัวข้อ' }), defineField({ name: 'text', type: 'text', title: 'คำอธิบาย' })] })] }),
    defineField({ name: 'workWithMe', title: 'Work with the Boss', type: 'text', rows: 3, group: 'about' }),
    // ข้อความหน้าอื่นๆ
    defineField({ name: 'seriesText', title: 'คำอธิบายซีรีส์', description: 'แสดงในหน้าซีรีส์และหน้าเกี่ยวกับบอส', type: 'object', group: 'pages', fields: [
      defineField({ name: 'review', title: 'บอสพาชิม', type: 'text', rows: 2 }),
      defineField({ name: 'history', title: 'มื้ออาหารเปลี่ยนโลก', type: 'text', rows: 2 }),
      defineField({ name: 'drinks', title: 'บอสพาดื่ม', type: 'text', rows: 2 }),
    ] }),
    defineField({ name: 'finderTitle', title: 'หน้าค้นหาร้าน — หัวข้อ', type: 'string', group: 'pages' }),
    defineField({ name: 'finderIntro', title: 'หน้าค้นหาร้าน — คำอธิบาย', type: 'text', rows: 3, group: 'pages' }),
    defineField({ name: 'destinationsIntro', title: 'หน้าจุดหมาย — คำอธิบาย', type: 'text', rows: 3, group: 'pages' }),
    defineField({ name: 'awardsIntro', title: 'หน้า Glasses Off Awards — คำอธิบาย', type: 'text', rows: 3, group: 'pages' }),
    // ติดต่อ & SEO
    defineField({ name: 'contactEmail', title: 'อีเมลติดต่อร่วมงาน', type: 'string', validation: (r) => r.email(), group: 'contact' }),
    defineField({ name: 'facebook', title: 'ลิงก์ Facebook', type: 'url', group: 'contact' }),
    defineField({ name: 'instagram', title: 'ลิงก์ Instagram', type: 'url', group: 'contact' }),
    defineField({ name: 'siteDescription', title: 'คำอธิบายเว็บใน Google', description: '120–155 ตัวอักษร', type: 'text', rows: 2, validation: (r) => r.max(160).warning('ยาวเกิน Google จะตัด'), group: 'contact' }),
    defineField({ name: 'ogImage', title: 'รูปตอนแชร์ลิงก์ (1200×630)', description: 'เว้นว่าง = ใช้รูปมาตรฐานของแบรนด์', type: 'image', group: 'contact' }),
  ],
  preview: { prepare: () => ({ title: 'ตั้งค่าเว็บ / เกี่ยวกับบอส' }) },
});

export const schemaTypes = [article, city, settings];
