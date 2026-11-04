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
  copied: { th: 'คัดลอกลิงก์แล้ว', en: 'Link copied', ja: 'リンクをコピーしました', zh: '链接已复制' },
  coverLabel: { th: 'ภาพเปิด', en: 'Cover photo', ja: 'カバー写真', zh: '封面图片' },
  atTable: { th: 'AT THE TABLE', en: 'AT THE TABLE', ja: 'AT THE TABLE', zh: 'AT THE TABLE' },
  restaurantInfo: { th: 'ข้อมูลร้าน', en: 'Restaurant details', ja: '店舗情報', zh: '餐厅信息' },
  chef: { th: 'เชฟ', en: 'Chef', ja: 'シェフ', zh: '主厨' },
  awards: { th: 'รางวัล', en: 'Awards', ja: '受賞', zh: '荣誉' },
  cityArea: { th: 'เมือง / ย่าน', en: 'City / Area', ja: '都市 / エリア', zh: '城市 / 区域' },
  menuTitle: { th: 'ศิลปะแห่งรสชาติในมื้อนี้', en: 'The art of taste in this meal', ja: 'この一食の味わい', zh: '本餐的味觉艺术' },
  courses: { th: '{n} courses', en: '{n} courses', ja: '全{n}皿', zh: '共 {n} 道' },
  jumpToDish: { th: 'ข้ามไปที่จาน', en: 'Jump to a course', ja: '料理へ移動', zh: '跳至菜品' },
  dishPhoto: { th: 'ภาพจาน {n}', en: 'Course {n} photo', ja: '{n}皿目の写真', zh: '第 {n} 道图片' },
  glassesQuote: { th: '“จานนี้อร่อยจนบอสต้องขอถอดแว่นชิม”', en: '“So good the Boss took the glasses off.”', ja: '「思わずボスが眼鏡を外した一皿」', zh: '“好吃到 Boss 忍不住摘下眼镜的一道菜”' },
  summary: { th: 'สรุปมื้อนี้', en: 'Meal summary', ja: 'この食事のまとめ', zh: '本餐小结' },
  more: { th: 'More Tasting Notes', en: 'More Tasting Notes', ja: 'More Tasting Notes', zh: 'More Tasting Notes' },
  visits: { th: 'บอสมาร้านนี้ {n} ครั้ง', en: 'The Boss has reviewed this restaurant {n} times', ja: 'ボスはこの店を{n}回レビュー', zh: 'Boss 已点评此餐厅 {n} 次' },
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
export const NAV_LABELS: Record<Locale, Record<'finder' | 'destinations' | 'articles' | 'awards' | 'about', string>> = {
  th: { finder: 'ค้นหาร้าน', destinations: 'จุดหมาย', articles: 'บทความ', awards: 'Glasses Off Awards', about: 'เกี่ยวกับบอส' },
  en: { finder: 'Restaurants', destinations: 'Destinations', articles: 'Articles', awards: 'Glasses Off Awards', about: 'About the Boss' },
  ja: { finder: 'レストラン', destinations: '目的地', articles: '記事', awards: 'Glasses Off Awards', about: 'ボスについて' },
  zh: { finder: '餐厅', destinations: '目的地', articles: '文章', awards: 'Glasses Off Awards', about: '关于 Boss' },
};
