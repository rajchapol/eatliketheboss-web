import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'ohviqc5c';

export default defineConfig({
  name: 'eatliketheboss',
  title: 'บอสพาชิม · Eat Like The Boss',
  projectId,
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .id('content')
          .title('เนื้อหา')
          .items([
            S.listItem().id('articles-th').title('บทความ (ภาษาไทย)').schemaType('article').child(S.documentList().id('articles-th').apiVersion('2025-01-01').schemaType('article').title('บทความไทย').filter('_type == "article" && language == "th"').defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])),
            S.listItem().id('articles-translations').title('คำแปล (EN / 日本語 / 中文)').schemaType('article').child(S.documentList().id('articles-translations').apiVersion('2025-01-01').schemaType('article').title('คำแปล').filter('_type == "article" && language != "th"')),
            S.divider(),
            S.documentTypeListItem('city').title('เมือง'),
            S.divider(),
            S.listItem().id('settings').title('ตั้งค่าเว็บ / ข้อความทุกหน้า').child(S.document().schemaType('settings').documentId('settings')),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // "เพิ่มคำแปล" (Studio → Thai article → tab 5): a new article in that language, linked to the Thai one and
    // pre-filled with everything that stays the same (restaurant, city, photos, dishes, Bill, Visit) plus the Thai
    // text to translate over. Same slug, so the page lives at /<lang>/review/<city>/<slug>/.
    templates: (prev) => [
      ...prev,
      {
        id: 'article-translation',
        title: 'คำแปลบทความ',
        schemaType: 'article',
        parameters: [{ name: 'sourceId', type: 'string' }, { name: 'language', type: 'string' }],
        value: async ({ sourceId, language }: { sourceId: string; language: string }, { getClient }: any) => {
          const src = await getClient({ apiVersion: '2025-01-01' }).fetch('coalesce(*[_id == "drafts." + $id][0], *[_id == $id][0])', { id: sourceId });
          if (!src) return { language, translationOf: { _type: 'reference', _ref: sourceId } };
          const { _id, _rev, _createdAt, _updatedAt, _type, translationOf, seoTitle, seoDescription, ...rest } = src;
          return { ...rest, language, translationOf: { _type: 'reference', _ref: sourceId } };
        },
      },
    ],
  },
  document: {
    // Settings is a single document: no "create new" for it. Translations are made from the Thai article.
    newDocumentOptions: (prev) => prev.filter((t) => t.templateId !== 'settings' && t.templateId !== 'article-translation'),
  },
});
