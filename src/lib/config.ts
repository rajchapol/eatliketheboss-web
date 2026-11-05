// Site-wide settings. Change here, every page follows.
export const SITE = {
  url: 'https://eatlikeboss.com',
  name: 'บอสพาชิม · Eat Like The Boss',
  shortName: 'Eat Like The Boss',
  tagline: 'สัมผัสศิลปะแห่งรสชาติ และประสบการณ์การกินอย่างเหนือระดับ ในแบบฉบับของบอส',
  description:
    'รีวิวร้านอาหาร Fine Dining แบบจริงใจและเจาะลึก ทั้งในไทยและทั่วโลก โดยคนในวงการ Hospitality และ F&B กว่า 15 ปี',
  facebook: 'https://www.facebook.com/eatliketheboss',
  instagram: 'https://www.instagram.com/eatliketheboss/',
  contactEmail: 'eatlikethebossth@gmail.com',
};

export const LOCALES = ['th', 'en', 'ja', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'th';
export const LOCALE_LABEL: Record<Locale, string> = { th: 'TH', en: 'EN', ja: '日本語', zh: '中文' };
export const HREFLANG: Record<Locale, string> = { th: 'th', en: 'en', ja: 'ja', zh: 'zh-Hans' };

/** Path prefix for a locale: '' for Thai, '/en' etc. for others. */
export const localePrefix = (l: Locale) => (l === DEFAULT_LOCALE ? '' : `/${l}`);

export const SERIES = {
  review: { th: 'บอสพาชิม', dot: '#0b5357', path: 'review' },
  history: { th: 'มื้ออาหารเปลี่ยนโลก', dot: '#0abab5', path: 'history' },
  drinks: { th: 'บอสพาดื่ม', dot: '#c39e5c', path: 'drinks' },
} as const;
export type SeriesKey = keyof typeof SERIES;

/** City motif key → CSS class + label (see site.css "city motifs"). */
export const MOTIFS: Record<string, { cls: string; label: string }> = {
  seigaiha: { cls: 'm-seigaiha', label: 'Seigaiha' },
  shippo: { cls: 'm-shippo', label: 'Shippo' },
  kikko: { cls: 'm-kikko', label: 'Kikko' },
  prajam: { cls: 'm-prajam', label: 'ลายประจำยาม' },
  fret: { cls: 'm-fret', label: '回纹 Fret' },
  // 12 more cities from the brand kit (2026 Brand Kit/web-graphics/city-motifs, 5 Nov 2026)
  shanghai: { cls: 'm-shanghai', label: 'Art Deco ตึกขั้นบันได' },
  hangzhou: { cls: 'm-hangzhou', label: 'ดอกบัว' },
  sapporo: { cls: 'm-sapporo', label: 'Yukiwa' },
  chiangmai: { cls: 'm-chiangmai', label: 'โคมยี่เป็ง' },
  phuket: { cls: 'm-phuket', label: 'ซุ้มโค้งชิโน-โปรตุกีส' },
  singapore: { cls: 'm-singapore', label: 'กระเบื้องเปอรานากัน' },
  taipei: { cls: 'm-taipei', label: 'ดอกเหมย 梅花' },
  helsinki: { cls: 'm-helsinki', label: 'คลื่น Aalto' },
  copenhagen: { cls: 'm-copenhagen', label: 'ลายร่อง Musselmalet' },
  oslo: { cls: 'm-oslo', label: 'ดาว Selbu' },
  istanbul: { cls: 'm-istanbul', label: 'ดาวแปดแฉกออตโตมัน' },
  seoul: { cls: 'm-seoul', label: 'หน้าต่าง 亞 เกาหลี' },
  loop: { cls: 'm-loop', label: 'Gold Loop' },
};

/** Map pins (lat, lng) for common cities. A city can also set its own point in Studio → เมือง → ตำแหน่งบนแผนที่. */
export const CITY_COORDS: Record<string, [number, number]> = {
  bangkok: [13.75, 100.5], phuket: [7.88, 98.39], 'chiang-mai': [18.79, 98.98], pattaya: [12.93, 100.88], 'hua-hin': [12.57, 99.96], 'koh-samui': [9.51, 100.01],
  tokyo: [35.68, 139.69], osaka: [34.69, 135.5], kyoto: [35.01, 135.77], fukuoka: [33.59, 130.4], sapporo: [43.06, 141.35], kanazawa: [36.56, 136.65], nagoya: [35.18, 136.91],
  'hong-kong': [22.32, 114.17], macau: [22.2, 113.55], shanghai: [31.23, 121.47], beijing: [39.9, 116.4], guangzhou: [23.13, 113.26], shenzhen: [22.54, 114.06], chengdu: [30.57, 104.07], hangzhou: [30.27, 120.16],
  taipei: [25.03, 121.57], seoul: [37.57, 126.98], singapore: [1.35, 103.82], 'kuala-lumpur': [3.14, 101.69], bali: [-8.65, 115.22], jakarta: [-6.2, 106.85], manila: [14.6, 120.98], 'ho-chi-minh-city': [10.82, 106.63], hanoi: [21.03, 105.85],
  paris: [48.86, 2.35], london: [51.51, -0.13], lyon: [45.76, 4.84], 'san-sebastian': [43.32, -1.98], barcelona: [41.39, 2.17], madrid: [40.42, -3.7], rome: [41.9, 12.5], milan: [45.46, 9.19], copenhagen: [55.68, 12.57],
  oslo: [59.91, 10.75], helsinki: [60.17, 24.94], stockholm: [59.33, 18.07], amsterdam: [52.37, 4.9], berlin: [52.52, 13.4], vienna: [48.21, 16.37], lisbon: [38.72, -9.14], zurich: [47.38, 8.54],
  taichung: [24.15, 120.67], tainan: [22.99, 120.21], kaohsiung: [22.63, 120.3], busan: [35.18, 129.08], nara: [34.69, 135.8], kobe: [34.69, 135.2], yokohama: [35.44, 139.64], okinawa: [26.21, 127.68],
  'siem-reap': [13.36, 103.86], 'luang-prabang': [19.89, 102.13], yangon: [16.84, 96.17], 'chiang-rai': [19.91, 99.83], krabi: [8.09, 98.91], 'khao-yai': [14.44, 101.37],
  istanbul: [41.01, 28.98], istalbul: [41.01, 28.98], 'new-york': [40.71, -74.01], 'san-francisco': [37.77, -122.42], 'los-angeles': [34.05, -118.24], sydney: [-33.87, 151.21], melbourne: [-37.81, 144.96], dubai: [25.2, 55.27],
};

/** Cuisine: a few broad categories, in English only (the Boss, 5 Nov 2026). Finer styles (sushi, kaiseki…) go in the article,
 *  not here. Keep in step with the Studio list (studio/schemas/index.ts) and the check in scripts/post-article.mjs. */
export const CUISINES = ['Japanese', 'Chinese', 'Thai', 'French', 'Italian', 'Spanish', 'Nordic', 'Modern', 'Other'] as const;
// Older values (Thai, or finer styles) → category, so the site and the Restaurants filter stay tidy even before the data is fixed.
const CUISINE_OLD: Record<string, (typeof CUISINES)[number]> = {
  'ญี่ปุ่น': 'Japanese', 'ซูชิ': 'Japanese', 'ไคเซกิ': 'Japanese', 'kappo kaiseki': 'Japanese', 'kaiseki': 'Japanese', 'sushi': 'Japanese',
  'จีน': 'Chinese', 'ไทย': 'Thai', 'ฝรั่งเศส': 'French', 'ฝรั่งเศสร่วมสมัย': 'French', 'อิตาเลียน': 'Italian',
  'สเปน': 'Spanish', 'หมู่เกาะคานารี่': 'Spanish', 'modern spanish': 'Spanish', 'นอร์ดิก': 'Nordic', 'อื่นๆ': 'Other',
};
export function cuisineOf(raw?: string): string | undefined {
  const v = raw?.trim();
  if (!v) return undefined;
  const hit = CUISINES.find((c) => c.toLowerCase() === v.toLowerCase());
  return hit ?? CUISINE_OLD[v] ?? CUISINE_OLD[v.toLowerCase()] ?? 'Other';
}

/** Map position of a city: Studio pin, else CITY_COORDS by slug, by English name, or by the slug without a country prefix
 *  (cities are often saved as "norway-oslo"). */
export function cityCoords(c: { slug: string; nameEn?: string; location?: { lat?: number; lng?: number } }): [number, number] | undefined {
  if (c.location?.lat != null && c.location?.lng != null) return [c.location.lat, c.location.lng];
  const name = (c.nameEn || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const parts = c.slug.split('-');
  for (const k of [c.slug, name, ...parts.map((_, i) => parts.slice(i + 1).join('-')).filter(Boolean)]) if (CITY_COORDS[k]) return CITY_COORDS[k];
  return undefined;
}

/** Destinations page groups: Thailand first, then continents. Each group lists its countries, then cities. */
export const REGIONS = [
  { id: 'th', name: 'ประเทศไทย', latin: 'Thailand' },
  { id: 'asia', name: 'เอเชีย', latin: 'Asia' },
  { id: 'europe', name: 'ยุโรป', latin: 'Europe' },
  { id: 'americas', name: 'อเมริกา', latin: 'The Americas' },
  { id: 'oceania', name: 'โอเชียเนีย', latin: 'Oceania' },
  { id: 'mea', name: 'ตะวันออกกลางและแอฟริกา', latin: 'Middle East & Africa' },
  { id: 'other', name: 'เมืองอื่นๆ', latin: 'Worldwide' }, // country not recognised and no region set
] as const;
export type RegionKey = (typeof REGIONS)[number]['id'];
// Country (Thai name, as typed in Sanity) → continent, for cities still saved with the old region values.
const COUNTRY_REGION: Record<string, RegionKey> = Object.fromEntries(
  ([
    ['th', 'ประเทศไทย ไทย'],
    ['asia', 'ญี่ปุ่น จีน ฮ่องกง มาเก๊า ไต้หวัน เกาหลีใต้ เกาหลี สิงคโปร์ มาเลเซีย อินโดนีเซีย เวียดนาม ฟิลิปปินส์ กัมพูชา ลาว เมียนมา อินเดีย ศรีลังกา มัลดีฟส์ เนปาล ภูฏาน'],
    ['europe', 'ฝรั่งเศส อิตาลี สเปน โปรตุเกส อังกฤษ สหราชอาณาจักร ไอร์แลนด์ เยอรมนี ออสเตรีย สวิตเซอร์แลนด์ เบลเยียม เนเธอร์แลนด์ เดนมาร์ก สวีเดน นอร์เวย์ ฟินแลนด์ ไอซ์แลนด์ กรีซ โครเอเชีย สโลวีเนีย ฮังการี เช็ก โปแลนด์ ตุรกี'],
    ['americas', 'สหรัฐอเมริกา อเมริกา แคนาดา เม็กซิโก เปรู บราซิล อาร์เจนตินา ชิลี โคลอมเบีย'],
    ['oceania', 'ออสเตรเลีย นิวซีแลนด์'],
    ['mea', 'สหรัฐอาหรับเอมิเรตส์ ดูไบ กาตาร์ ซาอุดีอาระเบีย อิสราเอล เลบานอน แอฟริกาใต้ โมร็อกโก อียิปต์'],
  ] as [RegionKey, string][]).flatMap(([r, names]) => names.split(' ').map((n) => [n, r])),
);
/** Continent group of a city: worked out from the country when it is a known name, else the Studio value. */
export function regionOf(c: { region?: string; country?: string }): RegionKey {
  const fromCountry = c.country ? COUNTRY_REGION[c.country.trim()] : undefined;
  if (fromCountry) return fromCountry;
  if (c.region === 'jp' || c.region === 'cn') return 'asia'; // older entries
  if (c.region && c.region !== 'other' && REGIONS.some((r) => r.id === c.region)) return c.region as RegionKey;
  return 'other';
}
