// Flexible search for the restaurant finder (Thai + English + Chinese/Japanese).
// Used at build time (to prepare each card's search text) and in the browser (to read what was typed).
//
// What "flexible" means:
// - case, spaces, punctuation and accents don't matter ("Hong Kong" = "hongkong", "Café" = "cafe")
// - Thai tone marks and similar marks don't matter ("เซียงไฮ" finds "เซี่ยงไฮ้")
// - Thai and English names are the same thing ("เซี่ยงไฮ้" finds Shanghai, "ญี่ปุ่น" finds Japanese), see GROUPS
// - several words must all match, in any order ("เซี่ยงไฮ้ ติ่มซำ")
// - one typo is forgiven in longer words ("shangai" finds Shanghai)
// Extra names per restaurant or city can be added in Studio ("ชื่อเรียกอื่นสำหรับค้นหา").

/** Lowercase, drop accents, Thai tone marks, spaces and punctuation. */
export function norm(s: string): string {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Latin accents
    .replace(/[็-๎]/g, '') // Thai: ็ ่ ้ ๊ ๋ ์ ํ ๎
    .replace(/ฯ/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

/** Each line: names that mean the same thing. Matching any one finds all of them. */
const GROUPS: string[][] = [
  // cities
  ['shanghai', 'เซี่ยงไฮ้', 'ซ่างไห่', '上海'],
  ['beijing', 'ปักกิ่ง', '北京'],
  ['hong kong', 'ฮ่องกง', '香港', 'hk'],
  ['macau', 'มาเก๊า', '澳門'],
  ['taipei', 'ไทเป', '台北'],
  ['singapore', 'สิงคโปร์', '新加坡', 'sg'],
  ['tokyo', 'โตเกียว', '東京'],
  ['kyoto', 'เกียวโต', '京都'],
  ['osaka', 'โอซาก้า', 'โอซากา', '大阪'],
  ['fukuoka', 'ฟุกุโอกะ', '福岡'],
  ['sapporo', 'ซัปโปโร', '札幌'],
  ['seoul', 'โซล', '서울'],
  ['bangkok', 'กรุงเทพ', 'กรุงเทพมหานคร', 'กทม', 'bkk'],
  ['chiang mai', 'เชียงใหม่'],
  ['phuket', 'ภูเก็ต'],
  ['hua hin', 'หัวหิน'],
  ['pattaya', 'พัทยา'],
  ['paris', 'ปารีส'],
  ['london', 'ลอนดอน'],
  ['new york', 'นิวยอร์ก', 'nyc'],
  ['san sebastian', 'ซานเซบาสเตียน', 'donostia'],
  ['copenhagen', 'โคเปนเฮเกน'],
  ['melbourne', 'เมลเบิร์น'],
  ['sydney', 'ซิดนีย์'],
  // countries
  ['china', 'จีน', '中国'],
  ['japan', 'ญี่ปุ่น', '日本'],
  ['thailand', 'ไทย', 'ประเทศไทย'],
  ['korea', 'เกาหลี'],
  ['taiwan', 'ไต้หวัน'],
  ['france', 'ฝรั่งเศส'],
  ['italy', 'อิตาลี'],
  ['spain', 'สเปน'],
  // cuisines (the Studio list is in Thai)
  ['japanese', 'ญี่ปุ่น', 'อาหารญี่ปุ่น'],
  ['thai', 'ไทย', 'อาหารไทย'],
  ['french', 'ฝรั่งเศส', 'อาหารฝรั่งเศส'],
  ['chinese', 'จีน', 'อาหารจีน'],
  ['italian', 'อิตาเลียน', 'อิตาเลี่ยน', 'อิตาลี', 'อาหารอิตาเลียน'],
  ['spanish', 'สเปน', 'อาหารสเปน'],
  ['modern', 'โมเดิร์น', 'contemporary'],
  ['cantonese', 'กวางตุ้ง', '粤菜'],
  ['shanghainese', 'อาหารเซี่ยงไฮ้', 'benbang', '本帮菜'],
  ['sichuan', 'เสฉวน', 'szechuan', '川菜'],
  ['vegetarian', 'มังสวิรัติ', 'เจ', 'vegan', 'วีแกน', '素食'],
  // dishes and styles
  ['sushi', 'ซูชิ', '寿司', '鮨'],
  ['omakase', 'โอมากาเสะ', 'おまかせ'],
  ['kaiseki', 'ไคเซกิ', '懐石'],
  ['tempura', 'เทมปุระ', '天ぷら'],
  ['yakitori', 'ยากิโทริ', '焼き鳥'],
  ['yakiniku', 'ยากินิกุ', '焼肉'],
  ['teppanyaki', 'เทปปันยากิ', '鉄板焼き'],
  ['ramen', 'ราเมง', 'ราเม็ง', 'ラーメン'],
  ['wagyu', 'วากิว', '和牛'],
  ['dim sum', 'ติ่มซำ', '点心'],
  ['peking duck', 'เป็ดปักกิ่ง', '北京烤鸭'],
  ['xiaolongbao', 'เสี่ยวหลงเปา', '小笼包'],
  ['hairy crab', 'ปูขน', '大闸蟹'],
  ['crab', 'ปู'],
  ['lobster', 'ล็อบสเตอร์', 'กุ้งมังกร'],
  ['uni', 'อูนิ', 'ไข่หอยเม่น', 'sea urchin'],
  ['caviar', 'คาเวียร์'],
  ['truffle', 'ทรัฟเฟิล'],
  ['steak', 'สเต๊ก', 'สเต็ก'],
  ['dessert', 'ของหวาน', 'ขนม'],
  ['tasting menu', 'เทสติ้งเมนู', 'คอร์ส'],
  ['wine', 'ไวน์'],
  ['sake', 'สาเก', '酒'],
  ['tea', 'ชา', '茶'],
  ['chef', 'เชฟ'],
  // brand words
  ['michelin', 'มิชลิน', 'มิชลินสตาร์'],
  ['glasses off', 'ถอดแว่น', 'ถอดแว่นชิม'],
  ['event', 'อีเวนต์', 'อีเว้นท์'],
];
const NGROUPS = GROUPS.map((g) => [...new Set(g.map(norm).filter(Boolean))]);

/** Build-time: the text a card is searched by, with every synonym of what it contains added. */
export function searchText(parts: (string | undefined | null)[]): string {
  const base = parts.filter(Boolean).map((p) => norm(String(p)));
  const joined = base.join('|');
  const extra: string[] = [];
  for (const g of NGROUPS) {
    // Short Latin tokens (hk, sg) only count as whole words, so "chk" doesn't add Hong Kong.
    if (g.some((t) => (t.length <= 3 && /^[a-z]+$/.test(t) ? base.includes(t) : joined.includes(t)))) extra.push(...g);
  }
  return [...base, ...extra].join('|');
}

/** Edit distance ≤ 1 between `t` and some part of `text` (for typos in longer words). */
function nearMatch(text: string, t: string): boolean {
  if (t.length < 5) return false;
  const n = t.length;
  for (let len = n - 1; len <= n + 1; len++) {
    for (let i = 0; i + len <= text.length; i++) {
      const s = text.slice(i, i + len);
      if (s.includes('|')) continue;
      if (within1(s, t)) return true;
    }
  }
  return false;
}
function within1(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Thai is written without spaces: "ติ่มซำเซี่ยงไฮ้" = two words. True if `w` splits into ≤ 3 pieces (each ≥ 3 letters) that all appear. */
function splitMatch(text: string, w: string, pieces = 3): boolean {
  if (!pieces) return false;
  for (let k = w.length; k >= 3; k--) {
    if (!text.includes(w.slice(0, k))) continue;
    if (k === w.length || (w.length - k >= 3 && splitMatch(text, w.slice(k), pieces - 1))) return true;
  }
  return false;
}

// Words people add that say nothing about which restaurant: "ร้านซูชิ" = "ซูชิ".
const FILLER = /ร้านอาหาร|ร้าน|รีวิว|restaurant|review/giu;

/** Browser: does a card's prepared text match what was typed? Every word must match. */
export function matches(text: string, query: string): boolean {
  const words = query.replace(FILLER, ' ').split(/\s+/).map(norm).filter(Boolean);
  return words.every((w) => text.includes(w) || splitMatch(text, w) || nearMatch(text, w));
}
