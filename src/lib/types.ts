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
  cuisine?: string;
  priceBand?: '฿฿' | '฿฿฿' | '฿฿฿฿';
  awards?: string[];
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
  bodyHtml: string; // intro paragraphs
  quote?: string;
  dishes: Dish[];
  bill?: string; // "6,999 THB++" or empty when tag is AD/Event
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
  homeCitySlugs?: string[];
}
