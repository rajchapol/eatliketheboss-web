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
            S.listItem().id('settings').title('ตั้งค่าเว็บ / เกี่ยวกับบอส').child(S.document().schemaType('settings').documentId('settings')),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
  document: {
    // Settings is a single document: no "create new" for it.
    newDocumentOptions: (prev) => prev.filter((t) => t.templateId !== 'settings'),
  },
});
