// Sample content used when Sanity is not connected yet (no SANITY_PROJECT_ID).
// Everything in [square brackets] is a placeholder. Real content comes from Sanity.
import type { Article, City, Settings } from '../lib/types';
import citiesJson from './cities.json';
import settingsJson from './settings.json';

export const cities: City[] = citiesJson as City[];
const city = (s: string) => cities.find((c) => c.slug === s)!;

const dish = (name: string, glassesOff = false) => ({
  name,
  description: '[สิ่งที่อยู่บนจาน. อธิบายวัตถุดิบหรือศัพท์ 1 ประโยค. รสชาติจากโน้ตของบอส]',
  glassesOff,
});
const intro = [
  '[ย่อหน้าเปิด: ร้าน คอนเซปต์ และย่าน — เข้าเรื่องตรง ร้าน + เชฟ + ฉายา]',
  '[ย่อหน้าเชฟ: ประวัติ แนวทาง และรางวัลที่ตรวจแล้ว]',
  '[ย่อหน้าบรรยากาศและบริการ]',
  'อาหารจะมีอะไรบ้างไปชมกันครับ',
].map((p) => `<p>${p}</p>`).join('');

export const articles: Article[] = [
  {
    id: 'sample-tokyo-2025', baseId: 'sample-tokyo-2025', language: 'th', series: 'review', no: 0,
    slug: 'sample-tokyo-2025', title: 'บอสพาชิม in Tokyo: [ร้านตัวอย่าง] - [ครั้งแรกที่ไป]',
    tagline: '[คำโปรยครั้งแรก]', city: city('tokyo'),
    restaurant: { name: '[ร้านตัวอย่าง]', originalName: '[ชื่อภาษาเดิม]', chef: '[ชื่อเชฟ]', area: 'Ginza', cuisine: 'Japanese', priceBand: '฿฿฿', awards: ['MICHELIN'] },
    bodyHtml: intro, quote: '[ประโยคเด่นจากครั้งแรก]',
    dishes: [dish('[จานที่ 1 (ชื่อเดิม)]', true), dish('[จานเก่า A]'), dish('[จานเก่า B]')],
    bill: '[ราคา] JPY', visit: 'Mar-2025', hashtags: ['บอสพาชิม', 'eatliketheboss', 'Tokyo'],
    publishedAt: '2025-04-01', readingMinutes: 5,
    seoDescription: '[คำอธิบายสั้น 120–155 ตัวอักษร ในน้ำเสียงของบอส]',
  },
  {
    id: 'sample-tokyo', baseId: 'sample-tokyo', language: 'th', series: 'review', no: 42,
    slug: 'sample-tokyo', title: 'บอสพาชิม in Tokyo: [ร้านตัวอย่าง] - [คำโปรยเชิงศิลปะ]',
    tagline: '[คำโปรยเชิงศิลปะ]', city: city('tokyo'),
    restaurant: { name: '[ร้านตัวอย่าง]', originalName: '[ชื่อภาษาเดิม]', chef: '[ชื่อเชฟ]', area: 'Ginza', cuisine: 'Japanese', priceBand: '฿฿฿฿', awards: ['MICHELIN'] },
    bodyHtml: intro, quote: '[ประโยคความเห็นของบอสที่เด่นที่สุดในบทความ]',
    dishes: [dish('[จานที่ 1 (ชื่อเดิม)]'), dish('[จานที่ 2 (ชื่อเดิม)]'), dish('[จานที่ 3 (ชื่อเดิม)]', true), dish('[จานที่ 4 (ชื่อเดิม)]'), dish('[ของหวาน (ชื่อเดิม)]')],
    bill: '[ราคา] JPY', visit: 'Oct-2026', hashtags: ['บอสพาชิม', 'eatliketheboss', 'Tokyo'],
    publishedAt: '2026-11-01', readingMinutes: 8,
    seoDescription: '[คำอธิบายสั้น 120–155 ตัวอักษร ในน้ำเสียงของบอส]',
  },
  {
    id: 'sample-bangkok', baseId: 'sample-bangkok', language: 'th', series: 'review', no: 41,
    slug: 'sample-bangkok', title: 'บอสพาชิม in Bangkok: [ร้านตัวอย่าง B] - [คำโปรย]',
    tagline: '[คำโปรย]', city: city('bangkok'),
    restaurant: { name: '[ร้านตัวอย่าง B]', chef: '[ชื่อเชฟ]', area: 'Sukhumvit', cuisine: 'Thai', priceBand: '฿฿฿', awards: ['Tatler Best'] },
    bodyHtml: intro, dishes: [dish('[จานที่ 1]'), dish('[จานที่ 2]'), dish('[จานที่ 3]')],
    tag: 'Event', visit: 'Oct-2026', hashtags: ['บอสพาชิม', 'eatliketheboss', 'Bangkok'],
    publishedAt: '2026-10-25', readingMinutes: 6,
  },
  {
    id: 'sample-osaka', baseId: 'sample-osaka', language: 'th', series: 'review', no: 39,
    slug: 'sample-osaka', title: 'บอสพาชิม in Osaka: [ร้านตัวอย่าง C] - [คำโปรย]',
    tagline: '[คำโปรย]', city: city('osaka'),
    restaurant: { name: '[ร้านตัวอย่าง C]', area: 'Kita', cuisine: 'Japanese', priceBand: '฿฿฿', awards: ['MICHELIN'] },
    bodyHtml: intro, dishes: [dish('[จานที่ 1]', true), dish('[จานที่ 2]')],
    bill: '[ราคา] JPY', visit: 'Sep-2026', hashtags: ['บอสพาชิม', 'eatliketheboss', 'Osaka'],
    publishedAt: '2026-10-10', readingMinutes: 5,
  },
  {
    id: 'sample-history', baseId: 'sample-history', language: 'th', series: 'history', no: 40, episode: 1,
    slug: 'ep-1-sample', title: 'มื้ออาหารเปลี่ยนโลก Ep.1: [ชื่องานเลี้ยง]',
    bodyHtml: '<p>[เรื่องเล่าของมื้ออาหารที่มีผลต่อประวัติศาสตร์]</p>', dishes: [],
    hashtags: ['มื้ออาหารเปลี่ยนโลก', 'eatliketheboss'], publishedAt: '2026-10-18', readingMinutes: 7,
  },
  // An English translation of the Tokyo sample, so the sample build also covers translated pages and the language switch.
  {
    id: 'sample-tokyo-en', baseId: 'sample-tokyo', language: 'en', series: 'review', no: 42,
    slug: 'sample-tokyo', title: 'Eat Like The Boss in Tokyo: [Sample restaurant] - [Artful tagline]',
    tagline: '[Artful tagline]', city: city('tokyo'),
    restaurant: { name: '[ร้านตัวอย่าง]', originalName: '[ชื่อภาษาเดิม]', chef: '[Chef name]', area: 'Ginza', cuisine: 'Japanese' },
    bodyHtml: '<p>[English introduction in the Boss\'s voice.]</p>', quote: '[The Boss\'s standout line]',
    dishes: [dish('[จานที่ 1 (ชื่อเดิม)]'), dish('[จานที่ 2 (ชื่อเดิม)]'), dish('[จานที่ 3 (ชื่อเดิม)]', true)],
    bill: '[ราคา] JPY', visit: 'Oct-2026', hashtags: ['EatLikeTheBoss', 'Tokyo'],
    publishedAt: '2026-11-02', readingMinutes: 4,
    seoDescription: '[Short description, 120–155 characters, in the Boss\'s voice]',
  },
];

export const settings: Settings = settingsJson as Settings;
