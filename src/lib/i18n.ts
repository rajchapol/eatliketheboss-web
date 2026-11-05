// Interface text for translated article pages (th / en / ja / zh). Listing pages stay Thai.
// Restaurant, dish and chef names are never translated; they come from the article itself.
import type { Locale } from './config';

const T = {
  home: { th: 'หน้าแรก', en: 'Home', ja: 'ホーム', zh: '首页' },
  by: { th: 'โดย', en: 'By', ja: '文', zh: '作者' },
  boss: { th: 'บอส', en: 'The Boss', ja: 'ボス', zh: 'Boss' },
  published: { th: 'เผยแพร่', en: 'Published', ja: '公開', zh: '发布于' },
  readMin: { th: 'อ่านราว {n} นาที', en: '{n} min read', ja: '約{n}分で読めます', zh: '约 {n} 分钟阅读' },
  cuisine: { th: 'ประเภท', en: 'Cuisine', ja: 'ジャンル', zh: '菜系' },
  glassesOff: { th: 'ถอดแว่นชิม', en: 'Glasses Off', ja: 'グラスオフ', zh: '摘镜之味' },
  goToDish: { th: 'ไปที่จาน {n}', en: 'Go to course {n}', ja: '{n}皿目へ', zh: '前往第 {n} 道' },
  share: { th: 'แชร์บทความ', en: 'Share this article', ja: '記事をシェア', zh: '分享文章' },
  shareShort: { th: 'แชร์', en: 'Share', ja: 'シェア', zh: '分享' },
  toTop: { th: 'กลับขึ้นด้านบน', en: 'Back to top', ja: 'ページの先頭へ', zh: '回到顶部' },
  footReview: { th: 'บอสพาชิม — รีวิวร้าน', en: 'Restaurant reviews', ja: 'レストランレビュー', zh: '餐厅点评' },
  footHistory: { th: 'มื้ออาหารเปลี่ยนโลก', en: 'Meals that changed the world', ja: '世界を変えた食事', zh: '改变世界的一餐' },
  footDrinks: { th: 'บอสพาดื่ม', en: 'Drinks with the Boss', ja: 'ボスと一杯', zh: '与 Boss 小酌' },
  allCities: { th: 'ทุกเมือง', en: 'All cities', ja: 'すべての都市', zh: '所有城市' },
  workWith: { th: 'ติดต่อร่วมงาน', en: 'Work with the Boss', ja: 'お仕事のご依頼', zh: '合作联系' },
  allLinks: { th: 'ลิงก์ทั้งหมด', en: 'All links', ja: 'リンク一覧', zh: '全部链接' },
  rights: { th: 'สงวนลิขสิทธิ์ บทความและภาพทั้งหมด ห้ามคัดลอกหรือนำไปใช้โดยไม่ได้รับอนุญาต', en: 'All rights reserved. Text and photos may not be copied or reused without permission.', ja: '無断転載・複製を禁じます。', zh: '版权所有，未经许可禁止转载或使用文字与图片。' },
  photoRights: { th: 'ภาพนี้สงวนลิขสิทธิ์ © Eat Like The Boss', en: 'This photo is © Eat Like The Boss', ja: 'この写真の著作権は Eat Like The Boss に帰属します', zh: '此图片版权归 Eat Like The Boss 所有' },
  source: { th: 'ที่มา', en: 'Source', ja: '出典', zh: '来源' },
  gallery: { th: 'บรรยากาศร้านและเชฟ', en: 'The room and the chef', ja: '店内とシェフ', zh: '餐厅环境与主厨' },
  recommend: { th: 'แนะนำร้านให้บอส', en: 'Recommend a restaurant', ja: 'お店を推薦する', zh: '推荐餐厅' },
  copyLink: { th: 'คัดลอกลิงก์', en: 'Copy link', ja: 'リンクをコピー', zh: '复制链接' },
  moreShare: { th: 'แชร์อื่นๆ', en: 'More', ja: 'その他', zh: '更多' },
  shareThis: { th: 'ชอบร้านนี้? แชร์ให้เพื่อน', en: 'Enjoyed this? Share it', ja: 'この記事をシェア', zh: '分享这篇点评' },
  copied: { th: 'คัดลอกลิงก์แล้ว', en: 'Link copied', ja: 'リンクをコピーしました', zh: '链接已复制' },
  coverLabel: { th: 'ภาพเปิด', en: 'Cover photo', ja: 'カバー写真', zh: '封面图片' },
  atTable: { th: 'AT THE TABLE', en: 'AT THE TABLE', ja: 'AT THE TABLE', zh: 'AT THE TABLE' },
  restaurantInfo: { th: 'ข้อมูลร้าน', en: 'Restaurant details', ja: '店舗情報', zh: '餐厅信息' },
  chef: { th: 'เชฟ', en: 'Chef', ja: 'シェフ', zh: '主厨' },
  awards: { th: 'รางวัล', en: 'Awards', ja: '受賞', zh: '荣誉' },
  cityArea: { th: 'เมือง / ย่าน', en: 'City / Area', ja: '都市 / エリア', zh: '城市 / 区域' },
  menuTitle: { th: 'ศิลปะแห่งรสชาติในมื้อนี้', en: 'The art of taste in this meal', ja: 'この一食の味わい', zh: '本餐的味觉艺术' },
  atGlance: { th: 'สรุปสั้น', en: 'At a glance', ja: 'ひと目で', zh: '一览' },
  seeCourses: { th: 'ดูทั้ง {n} จาน', en: 'See all {n} courses', ja: '全{n}皿を見る', zh: '查看全部 {n} 道' },
  courses: { th: '{n} courses', en: '{n} courses', ja: '全{n}皿', zh: '共 {n} 道' },
  jumpToDish: { th: 'ข้ามไปที่จาน', en: 'Jump to a course', ja: '料理へ移動', zh: '跳至菜品' },
  dishPhoto: { th: 'ภาพจาน {n}', en: 'Course {n} photo', ja: '{n}皿目の写真', zh: '第 {n} 道图片' },
  glassesQuote: { th: '“จานนี้อร่อยจนบอสต้องขอถอดแว่นชิม”', en: '“So good the Boss took the glasses off.”', ja: '「思わずボスが眼鏡を外した一皿」', zh: '“好吃到 Boss 忍不住摘下眼镜的一道菜”' },
  summary: { th: 'สรุปมื้อนี้', en: 'Meal summary', ja: 'この食事のまとめ', zh: '本餐小结' },
  more: { th: 'More Tasting Notes', en: 'More Tasting Notes', ja: 'More Tasting Notes', zh: 'More Tasting Notes' },
  visits: { th: 'บอสมาร้านนี้ {n} ครั้ง', en: 'The Boss has reviewed this restaurant {n} times', ja: 'ボスはこの店を{n}回レビュー', zh: 'Boss 已点评此餐厅 {n} 次' },
  seriesReview: { th: 'บอสพาชิม', en: 'Restaurant review', ja: 'レストランレビュー', zh: '餐厅点评' },
  seriesHistory: { th: 'มื้ออาหารเปลี่ยนโลก', en: 'Meals that changed the world', ja: '世界を変えた食事', zh: '改变世界的一餐' },
  seriesDrinks: { th: 'บอสพาดื่ม', en: 'Drinks with the Boss', ja: 'ボスと一杯', zh: '与 Boss 小酌' },
  readNotes: { th: 'อ่าน Tasting Notes', en: 'Read the Tasting Notes', ja: 'テイスティングノートを読む', zh: '阅读品鉴笔记' },
  reviewedTimes: { th: 'รีวิว {n} ครั้ง', en: 'Reviewed {n} times', ja: '{n}回レビュー', zh: '点评 {n} 次' },
  thisVisit: { th: 'ครั้งนี้', en: 'This visit', ja: '今回', zh: '本次' },
  review: { th: 'บอสพาชิม', en: 'Eat Like The Boss', ja: 'Eat Like The Boss', zh: 'Eat Like The Boss' },
  in: { th: 'in', en: 'in', ja: 'in', zh: 'in' },
  titleSuffix: { th: 'บอสพาชิม', en: 'Eat Like The Boss', ja: 'Eat Like The Boss', zh: 'Eat Like The Boss' },
  reviewWord: { th: 'รีวิว', en: 'Review', ja: 'レビュー', zh: '点评' },
  autoDesc: {
    th: 'รีวิว {name}{city} โดยบอสพาชิม เล่าทีละจาน พร้อม The Boss\'s Bill และจานถอดแว่นชิม',
    en: '{name}{city} reviewed course by course by Eat Like The Boss, with The Boss\'s Bill and the Glasses Off dish.',
    ja: 'Eat Like The Boss による {name}{city} のレビュー。一皿ずつの解説と The Boss\'s Bill、グラスオフの一皿。',
    zh: 'Eat Like The Boss 逐道点评 {name}{city}，附 The Boss\'s Bill 与摘镜之味。',
  },
} as const;
export type I18nKey = keyof typeof T;

/** Text for a key in a language, with {n}/{name}… filled in. Falls back to Thai. */
export function t(lang: Locale, key: I18nKey, vars: Record<string, string | number> = {}) {
  const s: string = (T[key] as Record<string, string>)[lang] ?? T[key].th;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

const DATE_LOCALE: Record<Locale, string> = { th: 'th-TH', en: 'en-GB', ja: 'ja-JP', zh: 'zh-CN' };
/** Publish date in the reader's language (Thai uses the Buddhist year). */
export const formatDate = (iso: string, lang: Locale) =>
  new Date(iso).toLocaleDateString(DATE_LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric' });

/** Header menu labels per language (links still go to the Thai listing pages). */
/** Main menu, in order: key, path, line icon. Labels come from NAV_LABELS. */
export const NAV_ITEMS = [
  ['finder', '/restaurants/', 'search'],
  ['destinations', '/destinations/', 'pin'],
  ['articles', '/#notes', 'book'],
  ['awards', '/glasses-off-awards/', 'glasses'],
  ['about', '/about/', 'user'],
] as const;
export const NAV_LABELS: Record<Locale, Record<'finder' | 'destinations' | 'articles' | 'awards' | 'about', string>> = {
  th: { finder: 'ค้นหาร้าน', destinations: 'จุดหมาย', articles: 'บทความ', awards: 'Glasses Off Awards', about: 'เกี่ยวกับบอส' },
  en: { finder: 'Restaurants', destinations: 'Destinations', articles: 'Tasting Notes', awards: 'Glasses Off Awards', about: 'About the Boss' },
  ja: { finder: 'レストラン', destinations: '目的地', articles: '記事', awards: 'Glasses Off Awards', about: 'ボスについて' },
  zh: { finder: '餐厅', destinations: '目的地', articles: '文章', awards: 'Glasses Off Awards', about: '关于 Boss' },
};
/** Menu (Boss's choice, 4 Nov 2026): English name on every page, the page language's name small underneath
 *  (none on English pages). Phones show only the short English name so all five tabs fit. */
export const NAV_SHORT: Record<'finder' | 'destinations' | 'articles' | 'awards' | 'about', string> = {
  finder: 'Search', destinations: 'Cities', articles: 'Notes', awards: 'Awards', about: 'About',
};

/** Cuisine names are stored in Thai (Studio list); show them in the reader's language. */
const CUISINE: Record<string, Partial<Record<Locale, string>>> = {
  'ญี่ปุ่น': { en: 'Japanese', ja: '日本料理', zh: '日本料理' }, 'ไทย': { en: 'Thai', ja: 'タイ料理', zh: '泰国菜' },
  'ฝรั่งเศส': { en: 'French', ja: 'フランス料理', zh: '法国菜' }, 'จีน': { en: 'Chinese', ja: '中国料理', zh: '中餐' },
  'อิตาเลียน': { en: 'Italian', ja: 'イタリア料理', zh: '意大利菜' }, 'สเปน': { en: 'Spanish', ja: 'スペイン料理', zh: '西班牙菜' },
  'Modern': { ja: 'モダン', zh: '创意菜' }, 'อื่นๆ': { en: 'Other', ja: 'その他', zh: '其他' },
};
export const cuisineLabel = (c: string | undefined, lang: Locale) => (c ? (lang === 'th' ? c : CUISINE[c]?.[lang] ?? c) : '');
