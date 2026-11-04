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

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'ohviqc5c';

export default defineConfig({
  name: 'eatliketheboss',
  title: 'บอสพาชิม · Eat Like The Boss',
  projectId,
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) => {
        const API = '2025-01-01';
        const list = (id: string, title: string, filter: string, params: Record<string, unknown> = {}) =>
          S.documentList().id(id).apiVersion(API).schemaType('article').title(title).filter(filter).params(params)
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]);
        const item = (id: string, title: string, filter: string, icon?: any) => S.listItem().id(id).title(title).icon(icon).schemaType('article').child(list(id, title, filter));
        const TH = '_type == "article" && language == "th"';
        return S.list().id('content').title('เนื้อหา').items([
          // Articles, grouped the way the Boss looks for them
          S.listItem().id('articles-th').title('บทความ (ภาษาไทย)').icon(DocumentsIcon).child(
            S.list().id('articles-th-menu').title('บทความภาษาไทย').items([
              item('th-all', 'ทั้งหมด (ใหม่สุดก่อน)', TH),
              S.divider(),
              item('th-review', 'บอสพาชิม (รีวิวร้าน)', `${TH} && series == "review"`),
              item('th-history', 'มื้ออาหารเปลี่ยนโลก', `${TH} && series == "history"`),
              item('th-drinks', 'บอสพาดื่ม', `${TH} && series == "drinks"`),
              S.divider(),
              S.listItem().id('th-by-city').title('แยกตามเมือง').icon(PinIcon).child(
                S.documentTypeList('city').title('เลือกเมือง').apiVersion(API)
                  .child((cityId: string) => list(`city-${cityId}`, 'บทความในเมืองนี้', `${TH} && city._ref == $cityId`, { cityId }))),
            ])),
          S.listItem().id('articles-translations').title('คำแปล (EN / 日本語 / 中文)').icon(TranslateIcon).child(
            S.list().id('translations-menu').title('คำแปล').items([
              item('tr-en', 'English', '_type == "article" && language == "en"'),
              item('tr-ja', '日本語', '_type == "article" && language == "ja"'),
              item('tr-zh', '中文', '_type == "article" && language == "zh"'),
            ])),
          S.divider(),
          // Work to do: each list empties itself as things get fixed
          S.listItem().id('todo').title('งานที่ต้องทำ').icon(ClipboardIcon).child(
            S.list().id('todo-menu').title('งานที่ต้องทำ').items([
              item('todo-drafts-new', 'ร่างใหม่ ยังไม่เคยเผยแพร่', '_type == "article" && _id in path("drafts.**") && count(*[_id == string::split(^._id, "drafts.")[1]]) == 0', EditIcon),
              item('todo-drafts-edit', 'แก้ไขค้างไว้ ยังไม่กดเผยแพร่', '_type == "article" && _id in path("drafts.**") && count(*[_id == string::split(^._id, "drafts.")[1]]) > 0', EditIcon),
              S.divider(),
              item('todo-band', 'ยังไม่มีระดับราคา', `${TH} && series == "review" && !defined(billBand) && !defined(bill) && !defined(restaurant.priceBand)`, WarningOutlineIcon),
              item('todo-visit', 'ยังไม่ใส่ Visit', `${TH} && !defined(visit)`, WarningOutlineIcon),
              item('todo-cover', 'ไม่มีรูปปก', '_type == "article" && !defined(cover.asset)', WarningOutlineIcon),
              item('todo-alt', 'รูปยังไม่มีคำบรรยาย (alt)', '_type == "article" && ((defined(cover.asset) && !defined(cover.alt)) || count(dishes[defined(image.asset) && !defined(image.alt)]) > 0 || count(gallery[defined(asset) && !defined(alt)]) > 0)', WarningOutlineIcon),
              item('todo-seo', 'SEO ยังไม่ครบ / ยาวไม่พอดี', '_type == "article" && (!defined(seoTitle) || !defined(seoDescription) || length(seoTitle) > 60 || length(seoDescription) < 120 || length(seoDescription) > 155)', SearchIcon),
              S.divider(),
              item('todo-no-en', 'ยังไม่มีคำแปล English', `${TH} && count(*[_type == "article" && language == "en" && translationOf._ref == ^._id]) == 0`, TranslateIcon),
            ])),
          S.divider(),
          S.documentTypeListItem('city').title('เมือง').icon(PinIcon),
          S.divider(),
          S.listItem().id('settings').title('ตั้งค่าเว็บ / ข้อความทุกหน้า').icon(CogIcon).child(S.document().schemaType('settings').documentId('settings')),
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
