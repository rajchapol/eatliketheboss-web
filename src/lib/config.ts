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
  loop: { cls: 'm-loop', label: 'Gold Loop' },
};

/** Map pins (lat, lng) for common cities. A city can also set its own point in Studio → เมือง → ตำแหน่งบนแผนที่. */
export const CITY_COORDS: Record<string, [number, number]> = {
  bangkok: [13.75, 100.5], phuket: [7.88, 98.39], 'chiang-mai': [18.79, 98.98], pattaya: [12.93, 100.88], 'hua-hin': [12.57, 99.96], 'koh-samui': [9.51, 100.01],
  tokyo: [35.68, 139.69], osaka: [34.69, 135.5], kyoto: [35.01, 135.77], fukuoka: [33.59, 130.4], sapporo: [43.06, 141.35], kanazawa: [36.56, 136.65], nagoya: [35.18, 136.91],
  'hong-kong': [22.32, 114.17], macau: [22.2, 113.55], shanghai: [31.23, 121.47], beijing: [39.9, 116.4], guangzhou: [23.13, 113.26], shenzhen: [22.54, 114.06], chengdu: [30.57, 104.07], hangzhou: [30.27, 120.16],
  taipei: [25.03, 121.57], seoul: [37.57, 126.98], singapore: [1.35, 103.82], 'kuala-lumpur': [3.14, 101.69], bali: [-8.65, 115.22], jakarta: [-6.2, 106.85], manila: [14.6, 120.98], 'ho-chi-minh-city': [10.82, 106.63], hanoi: [21.03, 105.85],
  paris: [48.86, 2.35], london: [51.51, -0.13], lyon: [45.76, 4.84], 'san-sebastian': [43.32, -1.98], barcelona: [41.39, 2.17], madrid: [40.42, -3.7], rome: [41.9, 12.5], milan: [45.46, 9.19], copenhagen: [55.68, 12.57],
  istanbul: [41.01, 28.98], istalbul: [41.01, 28.98], 'turkey-istalbul': [41.01, 28.98], 'new-york': [40.71, -74.01], 'san-francisco': [37.77, -122.42], 'los-angeles': [34.05, -118.24], sydney: [-33.87, 151.21], melbourne: [-37.81, 144.96], dubai: [25.2, 55.27],
};

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
