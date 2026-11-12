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
  // en = the series' English name (menu, overline above the number); ink = a darker shade of dot for text on cream.
  review: { th: 'บอสพาชิม', en: 'Tasting Notes', dot: '#0b5357', ink: '#0b5357', path: 'review' },
  history: { th: 'มื้ออาหารเปลี่ยนโลก', en: 'Meals That Changed the World', dot: '#0abab5', ink: '#077a76', path: 'history' },
  drinks: { th: 'บอสพาดื่ม', en: 'The Boss Pours', dot: '#c39e5c', ink: '#6e3f08', path: 'drinks' },
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
  // 9 more cities (brand chat, 7 Nov 2026)
  amsterdam: { cls: 'm-amsterdam', label: 'หน้าจั่วบ้านริมคลอง' },
  barcelona: { cls: 'm-barcelona', label: 'กระเบื้องทางเท้า Panot ลายดอกไม้' },
  frankfurt: { cls: 'm-frankfurt', label: 'โครงไม้ Fachwerk แบบตึก Römer' },
  iwaki: { cls: 'm-iwaki', label: 'ไอน้ำ Tatewaku เมืองออนเซ็น' },
  madrid: { cls: 'm-madrid', label: 'ระเบียงเหล็กดัด' },
  nonthaburi: { cls: 'm-nonthaburi', label: 'โอ่งดินเผามอญเกาะเกร็ด' },
  reykjavik: { cls: 'm-reykjavik', label: 'เสาหินบะซอลต์ Hallgrímskirkja' },
  sakai: { cls: 'm-sakai', label: 'สุสานโบราณรูปรูกุญแจ Kofun' },
  taichung: { cls: 'm-taichung', label: 'โค้งโรงละคร Taichung Theater' },
  loop: { cls: 'm-loop', label: 'Gold Loop' },
};

/** The motif to show for a city: the one picked in Studio, or — when Studio still says Gold Loop
 *  (or nothing) — the city's own motif matched by English name, so a new or duplicate city doc
 *  gets its pattern without a Studio edit. Falls back to Gold Loop. */
export function motifOf(city: { motif?: string | null; nameEn?: string | null; slug?: string | null }) {
  if (city.motif && city.motif !== 'loop' && MOTIFS[city.motif]) return MOTIFS[city.motif];
  const key = String(city.nameEn || city.slug || '').toLowerCase().replace(/[^a-z]/g, '');
  const byName: Record<string, string> = { tokyo: 'seigaiha', kyoto: 'shippo', osaka: 'kikko', bangkok: 'prajam', hongkong: 'fret' };
  const k = byName[key] ?? key;
  return MOTIFS[k] && k !== 'loop' ? MOTIFS[k] : MOTIFS.loop;
}

/** Map pins (lat, lng) for common cities. A city can also set its own point in Studio → เมือง → ตำแหน่งบนแผนที่. */
import COORDS from '../data/city-coords.json';
export const CITY_COORDS = Object.fromEntries(Object.entries(COORDS).filter(([k]) => !k.startsWith('_'))) as Record<string, [number, number]>;

/** Cuisine: a few broad categories, in English only (the Boss, 5 Nov 2026), each with optional styles (Sushi, Cantonese…).
 *  Category = the Restaurants filter; style = detail shown next to it. One list for site, Studio and post check:
 *  src/data/cuisines.json (add a style there, in a PR, only when none fits). */
import CUISINE_LIST from '../data/cuisines.json';
export const CUISINE_STYLES = Object.fromEntries(Object.entries(CUISINE_LIST).filter(([k]) => !k.startsWith('_'))) as Record<string, string[]>;
export const CUISINES = Object.keys(CUISINE_STYLES);
// Older values (Thai, or styles typed as the category) → [category, style], so the site stays tidy even before the data is fixed.
const CUISINE_OLD: Record<string, [string, string?]> = {
  'ญี่ปุ่น': ['Japanese'], 'ซูชิ': ['Japanese', 'Sushi'], 'ไคเซกิ': ['Japanese', 'Kaiseki'], 'kappo kaiseki': ['Japanese', 'Kappo'],
  'จีน': ['Chinese'], 'ไทย': ['Thai'], 'ฝรั่งเศส': ['French'], 'ฝรั่งเศสร่วมสมัย': ['French', 'Contemporary'], 'อิตาเลียน': ['Italian'],
  'สเปน': ['Spanish'], 'หมู่เกาะคานารี่': ['Spanish', 'Canarian'], 'modern spanish': ['Spanish', 'Contemporary'], 'นอร์ดิก': ['Nordic'], 'อื่นๆ': ['Other'],
};
const findStyle = (v: string) => Object.entries(CUISINE_STYLES).find(([, list]) => list.some((x) => x.toLowerCase() === v.toLowerCase()));
/** Category of a cuisine value (old values and bare styles included); 'Other' when unknown. */
export function cuisineOf(raw?: string): string | undefined {
  const v = raw?.trim();
  if (!v) return undefined;
  return CUISINES.find((c) => c.toLowerCase() === v.toLowerCase()) ?? CUISINE_OLD[v]?.[0] ?? CUISINE_OLD[v.toLowerCase()]?.[0] ?? findStyle(v)?.[0] ?? 'Other';
}
/** Style of a restaurant: its own `style`, else one implied by an old cuisine value (e.g. "ซูชิ" → Sushi). */
export function styleOf(r?: { cuisine?: string; style?: string }): string | undefined {
  if (r?.style?.trim()) return r.style.trim();
  const v = r?.cuisine?.trim();
  if (!v) return undefined;
  const old = CUISINE_OLD[v] ?? CUISINE_OLD[v.toLowerCase()];
  if (old?.[1]) return old[1];
  const hit = findStyle(v);
  return hit ? hit[1].find((x) => x.toLowerCase() === v.toLowerCase()) : undefined;
}

/** Restaurant awards: guide → awards, one list (src/data/awards.json). parse() / label() in src/lib/awards.mjs. */
import AWARD_LIST from '../data/awards.json';
import { makeAwards } from './awards.mjs';
export const AWARDS = makeAwards(AWARD_LIST);

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
