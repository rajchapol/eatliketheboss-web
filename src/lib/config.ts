// Site-wide settings. Change here, every page follows.
export const SITE = {
  url: 'https://eatlikeboss.com',
  name: 'บอสพาชิม · Eat Like The Boss',
  shortName: 'Eat Like The Boss',
  tagline: 'สัมผัสศิลปะแห่งรสชาติ และประสบการณ์การกินอย่างเหนือระดับ ในแบบฉบับของบอส',
  description:
    'รีวิวร้านอาหาร Fine Dining แบบจริงใจและเจาะลึก ทั้งในไทยและทั่วโลก โดยคนในวงการ Hospitality และ F&B กว่า 15 ปี',
  facebook: 'https://www.facebook.com/', // TODO: ใส่ลิงก์เพจจริง
  instagram: 'https://www.instagram.com/', // TODO: ใส่ลิงก์จริง
  contactEmail: '', // TODO: อีเมลติดต่อร่วมงาน
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
