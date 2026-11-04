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

/** Destinations page groups: Thailand first, then continents. Each group lists its countries, then cities. */
export const REGIONS = [
  { id: 'th', name: 'ประเทศไทย', latin: 'Thailand' },
  { id: 'asia', name: 'เอเชีย', latin: 'Asia' },
  { id: 'europe', name: 'ยุโรป', latin: 'Europe' },
  { id: 'americas', name: 'อเมริกา', latin: 'The Americas' },
  { id: 'oceania', name: 'โอเชียเนีย', latin: 'Oceania' },
  { id: 'mea', name: 'ตะวันออกกลางและแอฟริกา', latin: 'Middle East & Africa' },
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
/** Continent group of a city: the Studio value, or worked out from the country for older entries (jp/cn/other). */
export function regionOf(c: { region?: string; country?: string }): RegionKey {
  const fromCountry = c.country ? COUNTRY_REGION[c.country.trim()] : undefined;
  if (fromCountry === 'th' || c.region === 'th') return 'th';
  if (REGIONS.some((r) => r.id === c.region)) return c.region as RegionKey;
  if (c.region === 'jp' || c.region === 'cn') return 'asia';
  return fromCountry ?? 'asia';
}
