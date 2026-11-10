// Keep Thai names on one line (the Boss, 10 Nov 2026: "โทยา / มะ" broke across lines).
// Browsers break Thai with a dictionary; names and transliterations ("โทยามะ", "คานาซาว่า", "โอมากาเสะ") are not in it,
// so they split into syllables. We wrap them in <span class="nb"> (white-space: nowrap; site.css).
//
// Where the names come from (no manual list needed for most):
//   1. "<Thai>(<Latin>)" — the Boss writes a name in Thai with the original in brackets the first time:
//      "เมืองโทยามะ (Toyama)". The trailing short dictionary-less pieces before the bracket are the name.
//      Learned from every Thai article, then kept together everywhere on the site.
//      Also "<Latin> (<Thai>)" and the short pieces after "เชฟ" / "คุณ" ("เชฟอิสุมิซัง").
//   2. Thai city names (Studio → City → ชื่อไทย).
//   3. src/data/thai-names.json — words to add by hand (posting team may add; one word per entry).
// A false catch only keeps a few words together (max 14 letters), so it can't harm the layout.
import EXTRA from '../data/thai-names.json';
import type { Article } from './types';

const seg = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter('th', { granularity: 'word' }) : null;
// letters without vowel / tone marks above and below
const letters = (s: string) => s.replace(/[ัิ-ฺ็-๎]/g, '').length;
// Common short Thai words that end a name run (they are real words, not syllables of a name).
const STOP = new Set(
  ('ที่ ของ กับ และ ใน จาก ด้วย คือ เป็น มา ไป ได้ ให้ ทาน คู่ แบบ ซึ่ง โดย ทำ ใช้ นำ ผสม ซอส น้ำ ปลา ปู กุ้ง หอย ไก่ หมู เนื้อ ' +
    'ผัก ข้าว เส้น ถั่ว ใบ ดอก ราก หัว เห็ด ชา นม ไข่ ส้ม มัน ไวน์ ชีส ครีม เชฟ ร้าน เมือง จาน ซูชิ ส่วน หรือ เรียก ชื่อ คำ ว่า ตัว ' +
    'ลูก แห่ง ย่าน จังหวัด เกาะ ภูเขา ท่า สวน วัด ยัง ก็ จะ แล้ว นี้ นั้น เอง อยู่ มี ไม่ ดี มาก น้อย เลย ครับ ค่ะ บน ล่าง ข้าง หน้า หลัง ' +
    'ทอด ย่าง ต้ม นึ่ง ดอง ตาก ห่อ โรย ราด ทา พร้อม เสิร์ฟ ท็อป อบ หวาน เค็ม เปรี้ยว เผ็ด ขม กลิ่น รส สี ความ การ').split(' '),
);
const THAI = /[฀-๿]/;

/** Names learned from "<Thai>(<Latin>)" in all Thai text, plus city names and the hand list. */
export function learnNames(list: Article[]): string[] {
  const out = new Set<string>((EXTRA as string[]).filter((w) => THAI.test(w)));
  for (const a of list) {
    if (a.city?.nameTh && !/\s/.test(a.city.nameTh) && letters(a.city.nameTh) > 2) out.add(a.city.nameTh);
    if (!seg || a.language !== 'th') continue;
    const text = [a.bodyHtml.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&'), ...a.dishes.map((d) => d.description)].join('\n');
    for (const m of text.matchAll(/([฀-๿]+)\s*\(\s*[A-Za-z][A-Za-z .'&\-]{1,40}\)/g)) {
      const parts = [...seg.segment(m[1])].map((x) => x.segment);
      const run: string[] = [];
      for (let i = parts.length - 1; i >= 0 && letters(parts[i]) <= 4 && !STOP.has(parts[i]); i--) run.unshift(parts[i]);
      const w = run.join('');
      if (run.length >= 2 && letters(w) <= 14) out.add(w);
    }
    // "<Latin> (<Thai>)": the Thai in brackets is the name, e.g. "R-HAAN (อาหาร)" is skipped (a real word), "Toyama (โทยามะ)" kept
    for (const m of text.matchAll(/[A-Za-z][A-Za-z .'&\-]{1,40}\s*\(\s*([\u0E00-\u0E7F]+)\s*\)/g)) {
      const parts = [...seg.segment(m[1])].map((x) => x.segment);
      if (parts.length >= 2 && parts.every((p) => letters(p) <= 4) && letters(m[1]) <= 14) out.add(m[1]);
    }
    // "เชฟ<name>" / "คุณ<name>" up to a space or punctuation: all short pieces = the person's name, e.g. "เชฟอิสุมิซัง "
    for (const m of text.matchAll(/(?:เชฟ|คุณ)([\u0E00-\u0E7F]{3,24})(?![\u0E00-\u0E7F])/g)) {
      const parts = [...seg.segment(m[1])].map((x) => x.segment);
      if (parts.length >= 2 && parts.every((p) => letters(p) <= 4 && !STOP.has(p)) && letters(m[1]) <= 10) out.add(m[1]);
    }
  }
  return [...out].sort((a, b) => b.length - a.length);
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const reFor = (names: string[]) => (names.length ? new RegExp(names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g') : null);

/** Wrap the names in an HTML string (text only, never inside a tag). */
export function keepTogetherHtml(html: string, re: RegExp | null) {
  if (!re || !THAI.test(html)) return html;
  return html.split(/(<[^>]+>)/).map((part) => (part.startsWith('<') ? part : part.replace(re, '<span class="nb">$&</span>'))).join('');
}

/** Apply to every article: body + dish descriptions (descriptionHtml, plain text stays in description). */
export function keepNamesTogether(list: Article[]): Article[] {
  const re = reFor(learnNames(list));
  return list.map((a) => ({
    ...a,
    bodyHtml: keepTogetherHtml(a.bodyHtml, re),
    dishes: a.dishes.map((d) => ({ ...d, descriptionHtml: keepTogetherHtml(esc(d.description || ''), re) })),
  }));
}
