import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';
import { OpenOnSiteAction, SafeDeleteAction } from './components/actions';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { PinIcon } from '@sanity/icons/Pin';
import { TranslateIcon } from '@sanity/icons/Translate';
import { ClipboardIcon } from '@sanity/icons/Clipboard';
import { EditIcon } from '@sanity/icons/Edit';
import { WarningOutlineIcon } from '@sanity/icons/WarningOutline';
import { SearchIcon } from '@sanity/icons/Search';
import { CogIcon } from '@sanity/icons/Cog';
import { ClockIcon } from '@sanity/icons/Clock';
import { RestoreIcon } from '@sanity/icons/Restore';
import { ImageIcon } from '@sanity/icons/Image';
import { StarIcon as TrophyIcon } from '@sanity/icons/Star';
import { TagIcon } from '@sanity/icons/Tag';
import AWARD_LIST from '../src/data/awards.json';

// Award names in the list (src/data/awards.json), for the "awards not in the list" to-do.
const AWARD_NAMES = Object.entries(AWARD_LIST).filter(([k]) => !k.startsWith('_')).flatMap(([, l]) => l as string[]);

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'ohviqc5c';

export default defineConfig({
  name: 'eatliketheboss',
  title: 'บอสพาชิม · Eat Like The Boss',
  projectId,
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S, context) => {
        const API = '2025-01-01';
        const client = context.getClient({ apiVersion: API });
        const list = (id: string, title: string, filter: string, params: Record<string, unknown> = {}) =>
          S.documentList().id(id).apiVersion(API).schemaType('article').title(title).filter(filter).params(params)
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]);
        const item = (id: string, title: string, filter: string, icon?: any) => S.listItem().id(id).title(title).icon(icon).schemaType('article').child(list(id, title, filter));
        // Originals = articles that are not linked to another article. Filtering on language == "th" hid
        // Thai articles whose draft had its language switched by hand (before the field was locked).
        const TH = '_type == "article" && !defined(translationOf)';
        // Restaurants A–Z: one entry per restaurant (same name + same city = same restaurant, as on the site), every visit inside.
        const restaurants = (repeatOnly: boolean) => async () => {
          const rows: any[] = await client.fetch(`*[${TH} && series == "review" && !(_id in path("drafts.**"))]{_id, "n": restaurant.name, "c": city->nameEn, "cid": city._ref}`);
          const by = new Map<string, { n: string; c: string; ids: string[] }>();
          rows.filter((r) => r.n).forEach((r) => {
            const k = `${String(r.n).trim().toLowerCase()}|${r.cid}`;
            if (!by.has(k)) by.set(k, { n: String(r.n).trim(), c: r.c || '', ids: [] });
            by.get(k)!.ids.push(r._id);
          });
          const list2 = [...by.entries()].filter(([, v]) => !repeatOnly || v.ids.length > 1).sort(([, a], [, b]) => a.n.localeCompare(b.n));
          return S.list().id(repeatOnly ? 'restaurants-repeat' : 'restaurants-all').title(repeatOnly ? 'Repeat visits · ร้านที่ไปซ้ำ' : 'All restaurants A–Z · ร้านทั้งหมด').items(
            list2.map(([k, v]) => S.listItem().id(`r-${k.replace(/[^a-z0-9]+/g, '-').slice(0, 60)}`).title(`${v.n} · ${v.c}${v.ids.length > 1 ? ` · ${v.ids.length} visits` : ''}`).schemaType('article')
              .child(S.documentList().id(`rv-${v.ids[0]}`).apiVersion(API).schemaType('article').title(v.n).filter('_id in $ids || _id in $drafts').params({ ids: v.ids, drafts: v.ids.map((i) => `drafts.${i}`) })
                .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]))),
          );
        };
        return S.list().id('content').title('Content').items([
          // What the posting team put up lately, to check in one place
          S.listItem().id('recent').title('Recently posted (7 days) · ลงใน 7 วันล่าสุด').icon(ClockIcon).schemaType('article').child(
            S.documentList().id('recent').apiVersion(API).schemaType('article').title('Recently posted (7 days) · ลงใน 7 วันล่าสุด')
              .filter('_type == "article" && dateTime(_createdAt) > dateTime(now()) - 60*60*24*7').defaultOrdering([{ field: '_createdAt', direction: 'desc' }])),
          S.listItem().id('recent-edits').title('Recently changed (7 days) · แก้ใน 7 วันล่าสุด').icon(RestoreIcon).schemaType('article').child(
            S.documentList().id('recent-edits').apiVersion(API).schemaType('article').title('Recently changed (7 days) · แก้ใน 7 วันล่าสุด')
              .filter('_type == "article" && dateTime(_updatedAt) > dateTime(now()) - 60*60*24*7').defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])),
          S.divider(),
          // Articles, grouped the way the Boss looks for them
          S.listItem().id('articles-th').title('Articles (Thai) · บทความ').icon(DocumentsIcon).child(
            S.list().id('articles-th-menu').title('Articles (Thai) · บทความภาษาไทย').items([
              item('th-all', 'All, newest first · ทั้งหมด', TH),
              S.divider(),
              item('th-review', 'Eat Like The Boss · บอสพาชิม (รีวิวร้าน)', `${TH} && series == "review"`),
              item('th-history', 'Meals That Changed the World · มื้ออาหารเปลี่ยนโลก', `${TH} && series == "history"`),
              item('th-drinks', 'Drink Like The Boss · บอสพาดื่ม', `${TH} && series == "drinks"`),
              S.divider(),
              S.listItem().id('th-by-city').title('By city · แยกตามเมือง').icon(PinIcon).child(
                S.documentTypeList('city').title('Choose a city · เลือกเมือง').apiVersion(API)
                  .child((cityId: string) => list(`city-${cityId}`, 'บทความในเมืองนี้', `${TH} && city._ref == $cityId`, { cityId }))),
            ])),
          S.listItem().id('restaurants').title('Restaurants · ร้าน').icon(TagIcon).child(
            S.list().id('restaurants-menu').title('Restaurants · ร้าน').items([
              S.listItem().id('restaurants-repeat').title('Repeat visits · ร้านที่ไปซ้ำ').icon(RestoreIcon).child(restaurants(true)),
              S.listItem().id('restaurants-all').title('All restaurants A–Z · ร้านทั้งหมด').icon(TagIcon).child(restaurants(false)),
            ])),
          // no "+" here: a translation is made from its Thai article (tab 5), which links it
          S.listItem().id('articles-translations').title('Translations (EN / 日本語 / 中文) · คำแปล').icon(TranslateIcon).child(
            S.list().id('translations-menu').title('Translations · คำแปล').items([
              S.listItem().id('tr-en').title('English').schemaType('article').child(list('tr-en', 'English', '_type == "article" && defined(translationOf) && language == "en"').initialValueTemplates([])),
              S.listItem().id('tr-ja').title('日本語').schemaType('article').child(list('tr-ja', '日本語', '_type == "article" && defined(translationOf) && language == "ja"').initialValueTemplates([])),
              S.listItem().id('tr-zh').title('中文').schemaType('article').child(list('tr-zh', '中文', '_type == "article" && defined(translationOf) && language == "zh"').initialValueTemplates([])),
            ])),
          S.divider(),
          // Work to do: each list empties itself as things get fixed
          S.listItem().id('todo').title('To do · งานที่ต้องทำ').icon(ClipboardIcon).child(
            S.list().id('todo-menu').title('To do · งานที่ต้องทำ').items([
              item('todo-lang', 'Wrong language: Thai article switched (fix in tab 5) · ภาษาเพี้ยน', '_type == "article" && !defined(translationOf) && coalesce(language, "th") != "th"', WarningOutlineIcon),
              item('todo-drafts-new', 'New drafts, never published · ร่างใหม่', '_type == "article" && _id in path("drafts.**") && count(*[_id == string::split(^._id, "drafts.")[1]]) == 0', EditIcon),
              item('todo-drafts-edit', 'Unpublished edits · แก้ไขค้างไว้', '_type == "article" && _id in path("drafts.**") && count(*[_id == string::split(^._id, "drafts.")[1]]) > 0', EditIcon),
              S.divider(),
              item('todo-band', 'No price band · ยังไม่มีระดับราคา', `${TH} && series == "review" && !defined(billBand) && !defined(bill) && !defined(restaurant.priceBand)`, WarningOutlineIcon),
              item('todo-visit', 'No Visit · ยังไม่ใส่ Visit', `${TH} && !defined(visit)`, WarningOutlineIcon),
              item('todo-cover', 'No cover photo · ไม่มีรูปปก', '_type == "article" && !defined(cover.asset)', WarningOutlineIcon),
              item('todo-alt', 'Photos without alt text · รูปยังไม่มีคำบรรยาย', '_type == "article" && ((defined(cover.asset) && !defined(cover.alt)) || count(dishes[defined(image.asset) && !defined(image.alt)]) > 0 || count(gallery[defined(asset) && !defined(alt)]) > 0)', WarningOutlineIcon),
              item('todo-style', 'No cuisine style · ยังไม่มีประเภทย่อย', `${TH} && series == "review" && !defined(restaurant.style)`, TagIcon),
              S.listItem().id('todo-awards').title('Awards not in the list · รางวัลที่ไม่อยู่ในรายการ').icon(TrophyIcon).schemaType('article').child(
                list('todo-awards', 'Awards not in the list · รางวัลที่ไม่อยู่ในรายการ', '_type == "article" && count(restaurant.awards[!defined(award) || !(award in $names)]) > 0', { names: AWARD_NAMES })),
              item('todo-seo', 'SEO missing or wrong length · SEO ยังไม่ครบ', '_type == "article" && (!defined(seoTitle) || !defined(seoDescription) || length(seoTitle) > 60 || length(seoDescription) < 120 || length(seoDescription) > 155)', SearchIcon),
              S.divider(),
              item('todo-no-en', 'No English translation · ยังไม่มีคำแปล English', `${TH} && count(*[_type == "article" && language == "en" && translationOf._ref == ^._id]) == 0`, TranslateIcon),
              S.divider(),
              // Photos and cities: things that show as gaps on the site
              item('todo-dish-photo', 'Dishes without a photo · จานที่ยังไม่มีรูป', `${TH} && count(dishes[!defined(image.asset)]) > 0`, WarningOutlineIcon),
              S.listItem().id('todo-city-photo').title('Cities without a photo · เมืองที่ยังไม่มีรูป').icon(ImageIcon).child(
                S.documentList().id('todo-city-photo').apiVersion(API).schemaType('city').title('Cities without a photo · เมืองที่ยังไม่มีรูป')
                  .filter('_type == "city" && !defined(cover.asset) && count(*[_type == "article" && city._ref == ^._id]) > 0')),
              S.listItem().id('todo-city').title('Cities missing a photo or fact · เมืองที่ยังขาดรูปหรือเรื่องน่ารู้').icon(PinIcon).child(
                S.documentList().id('todo-city').apiVersion(API).schemaType('city').title('Cities missing a photo or fact · เมืองที่ยังขาดรูปหรือเรื่องน่ารู้')
                  .filter('_type == "city" && (!defined(cover.asset) || !defined(intro)) && count(*[_type == "article" && city._ref == ^._id]) > 0')),
            ])),
          S.divider(),
          S.documentTypeListItem('city').title('City · เมือง').icon(PinIcon),
          S.divider(),
          S.listItem().id('settings').title('Site settings · ตั้งค่าเว็บ / ข้อความทุกหน้า').icon(CogIcon).child(S.document().schemaType('settings').documentId('settings')),
        ]);
      },
    }),
  ],
  document: {
    // Settings is a single document: no "create new" for it. Translations: the panel in the Thai article (components/TranslationsPanel.tsx).
    newDocumentOptions: (prev) => prev.filter((t) => t.templateId !== 'settings'),
    // Articles: "เปิดดูบนเว็บ" after Publish, and a delete that explains itself (see components/actions.tsx).
    actions: (prev, ctx) => {
      if (ctx.schemaType !== 'article') return prev;
      const out = prev.map((a) => (a.action === 'delete' ? SafeDeleteAction : a));
      const i = out.findIndex((a) => a.action === 'publish');
      out.splice(i + 1, 0, OpenOnSiteAction);
      return out;
    },
  },
  schema: {
    types: schemaTypes,
  },
});
