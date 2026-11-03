// Sample content used when Sanity is not connected yet (no SANITY_PROJECT_ID).
// Everything in [square brackets] is a placeholder. Real content comes from Sanity.
import type { Article, City, Settings } from '../lib/types';
import citiesJson from './cities.json';

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
    id: 'sample-tokyo', baseId: 'sample-tokyo', language: 'th', series: 'review', no: 42,
    slug: 'sample-tokyo', title: 'บอสพาชิม in Tokyo: [ร้านตัวอย่าง] - [คำโปรยเชิงศิลปะ]',
    tagline: '[คำโปรยเชิงศิลปะ]', city: city('tokyo'),
    restaurant: { name: '[ร้านตัวอย่าง]', originalName: '[ชื่อภาษาเดิม]', chef: '[ชื่อเชฟ]', area: 'Ginza', cuisine: 'ญี่ปุ่น', priceBand: '฿฿฿฿', awards: ['MICHELIN'] },
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
    restaurant: { name: '[ร้านตัวอย่าง B]', chef: '[ชื่อเชฟ]', area: 'Sukhumvit', cuisine: 'ไทย', priceBand: '฿฿฿', awards: ['Tatler Best'] },
    bodyHtml: intro, dishes: [dish('[จานที่ 1]'), dish('[จานที่ 2]'), dish('[จานที่ 3]')],
    tag: 'Event', visit: 'Oct-2026', hashtags: ['บอสพาชิม', 'eatliketheboss', 'Bangkok'],
    publishedAt: '2026-10-25', readingMinutes: 6,
  },
  {
    id: 'sample-osaka', baseId: 'sample-osaka', language: 'th', series: 'review', no: 39,
    slug: 'sample-osaka', title: 'บอสพาชิม in Osaka: [ร้านตัวอย่าง C] - [คำโปรย]',
    tagline: '[คำโปรย]', city: city('osaka'),
    restaurant: { name: '[ร้านตัวอย่าง C]', area: 'Kita', cuisine: 'ญี่ปุ่น', priceBand: '฿฿฿', awards: ['MICHELIN'] },
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
];

export const settings: Settings = {
  aboutHeadline: 'กินจริง เล่าตามจริงครับ',
  aboutBio: [
    'สวัสดีครับ ผมชื่อบอส คนเขียนเพจบอสพาชิม หรือ Eat Like The Boss ผมเริ่มเขียนรีวิวร้าน Fine Dining ตั้งแต่ปี 2017 จากความชอบส่วนตัวล้วนๆ ทั้งร้านในกรุงเทพฯ และร้านที่ตั้งใจบินไปกินที่ญี่ปุ่น ฮ่องกง และอีกหลายเมืองทั่วโลก',
    'ผมทำงานในวงการ Hospitality และ F&B มากว่า 15 ปี เลยมองมื้ออาหารทั้งในมุมคนกินและมุมคนทำร้าน และชอบคิดต่อเสมอว่ามื้อนี้ควรเปิดไวน์อะไร และปี 2026 ผมเป็นคณะกรรมการ Tatler Best Asia-Pacific และงานจัดอันดับอาหารอีกหลายงานครับ',
  ],
  aboutShortBio:
    'รีวิว Fine Dining แบบจริงใจและเจาะลึก ทั้งในไทยและทั่วโลก โดยคนในวงการ Hospitality และ F&B กว่า 15 ปี กรรมการ Tatler Best Asia-Pacific และงานจัดอันดับอาหารอีกหลายงาน',
  whyHonest: [
    'สิ่งที่ผมตั้งใจตั้งแต่วันแรกคือเล่าให้ตรงที่สุดครับ จานไหนอร่อยก็บอกว่าอร่อยพร้อมเหตุผล จานไหนไม่ถูกปากก็บอกตรงๆ ว่าติดตรงไหน',
    'ผมเชื่อว่าคนที่กำลังจะจองร้านราคาหลักหมื่น ควรได้อ่านข้อมูลที่จริงใจก่อนตัดสินใจ ทั้งเรื่องเชฟ วัตถุดิบ บรรยากาศ และราคาที่จ่ายจริง',
  ],
  howIReview: [
    { title: 'บอกตรงทุกมื้อ', text: 'ท้ายทุกบทความมี The Boss\'s Bill มื้อไหนได้รับเชิญหรือเป็นงานโฆษณา ผมติดป้าย AD หรือ Event ไว้ชัดเจนเสมอครับ' },
    { title: 'ไม่ให้ดาว ไม่ให้คะแนน', text: 'ตัวเลขบอกไม่ได้ว่าจานนั้นดีเพราะอะไร ผมเลยเลิกให้คะแนน ความชอบและข้อติทั้งหมดอยู่ในเนื้อความแทนครับ' },
    { title: 'ถอดแว่นชิม', text: 'จานที่อร่อยจนผมต้องขอถอดแว่นชิม จะได้ตราถอดแว่นในบทความ และรวมไว้ใน Glasses Off Awards ทุกปี' },
  ],
  workWithMe:
    'ร้านอาหาร แบรนด์ไวน์ และผู้จัดงาน ติดต่อร่วมงานกับผมได้ครับ ทุกโพสต์ที่ได้รับเชิญจะติดป้าย AD หรือ Event เสมอ ส่วนความเห็นในบทความยังเป็นของผมทั้งหมด',
};
