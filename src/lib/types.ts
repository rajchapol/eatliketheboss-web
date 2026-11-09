import type { Locale, SeriesKey } from './config';

export interface Img {
  url: string; // base URL (Sanity CDN accepts ?w=&auto=format)
  alt: string;
  width?: number;
  height?: number;
  crop?: { top: number; bottom: number; left: number; right: number }; // set in Sanity Studio
  hotspot?: { x: number; y: number; width: number; height: number }; // focal point for crops
}

export interface City {
  slug: string;
  nameEn: string;
  nameTh: string;
  country: string; // Thai name, e.g. ญี่ปุ่น
  region: string; // th | asia | europe | americas | oceania | mea (older entries: jp | cn | other) — see regionOf()
  motif: string; // key of MOTIFS
  intro?: string;
  cover?: Img;
  featured?: boolean;
  location?: { lat: number; lng: number }; // map pin set in Studio (else CITY_COORDS)
  aliases?: string[]; // other names people search by (Studio)
  pickIds?: string[]; // Boss's Picks chosen in Studio (article ids); empty = automatic
}

export interface Dish {
  name: string;
  description: string;
  glassesOff?: boolean;
  image?: Img;
}

export interface Restaurant {
  name: string;
  originalName?: string;
  chef?: string;
  area?: string;
  cuisine?: string; // category (src/data/cuisines.json keys)
  style?: string; // optional style within the category, e.g. Sushi, Cantonese
  priceBand?: '฿฿' | '฿฿฿' | '฿฿฿฿';
  awards?: string[];
  aliases?: string[]; // other names people search by, e.g. Thai spelling (Studio)
  sameAs?: string; // id of an earlier review of the same restaurant (when the name changed)
}

export interface Article {
  id: string;
  baseId: string; // groups translations of the same article
  language: Locale;
  series: SeriesKey;
  no: number; // Tasting Notes number
  slug: string;
  title: string; // full title, e.g. "บอสพาชิม in Tokyo: ร้าน (ชื่อเดิม) - คำโปรย"
  tagline?: string;
  city?: City;
  restaurant?: Restaurant;
  episode?: number; // มื้ออาหารเปลี่ยนโลก Ep.
  cover?: Img;
  gallery?: (Img & { caption?: string })[]; // ambience / chef photos shown before the dishes
  bodyHtml: string; // intro paragraphs
  quote?: string;
  dishes: Dish[];
  bill?: string; // real price as written (not shown; used to work out billBand)
  billBand?: '฿฿' | '฿฿฿' | '฿฿฿฿'; // The Boss's Bill shown on the site
  tag?: 'AD' | 'Event';
  visit?: string; // "Oct-2026"
  hashtags: string[];
  publishedAt: string; // ISO date
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  readingMinutes: number;
  restaurantGroup?: string; // set by linkRestaurants(): same value = same restaurant
}

export interface Settings {
  aboutHeadline: string;
  aboutBio: string[];
  aboutShortBio: string;
  whyHonest: string[];
  howIReview: { title: string; text: string }[];
  workWithMe: string;
  tagline: string;
  siteDescription: string;
  featuredArticleId?: string;
  homeFinderLabel: string;
  homeAwardsText: string;
  invitedNote: string;
  aboutStats: { value: string; label: string }[];
  seriesText: { review: string; history: string; drinks: string };
  finderTitle: string;
  finderIntro: string;
  destinationsIntro: string;
  awardsIntro: string;
  facebook: string;
  instagram: string;
  contactEmail: string;
  ogImageUrl?: string;
  cfAnalyticsToken?: string; // Cloudflare Web Analytics site token (public); empty = no analytics
  googleSiteVerification?: string; // Google Search Console HTML-tag code (public); empty = no tag
  web3formsKey?: string; // contact form → Boss's email (web3forms.com access key, public by design)
  // Texts that used to be fixed in the code (defaults in src/data/settings.json)
  homeSearchPlaceholder: string;
  homeLatestTitle: string;
  homeIndexTitle: string;
  homeIndexLink: string;
  articleMenuTitle: string;
  articleGlassesQuote: string;
  articleShareTitle: string;
  destinationsTitle: string;
  mapTitle: string;
  contactTitle: string;
  contactIntro: string;
  footerRights: string;
  capsuleTitle: string;
  capsuleIntro: string;
  capsuleReturning: string;
  capsuleLink: string;
  homeCitySlugs?: string[];
}
