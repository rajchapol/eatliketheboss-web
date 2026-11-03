import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'YOUR_PROJECT_ID';

export default defineConfig({
  name: 'eatliketheboss',
  title: 'บอสพาชิม · Eat Like The Boss',
  projectId,
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('เนื้อหา')
          .items([
            S.listItem().title('บทความ (ภาษาไทย)').child(S.documentList().title('บทความไทย').filter('_type == "article" && language == "th"').defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])),
            S.listItem().title('คำแปล (EN / 日本語 / 中文)').child(S.documentList().title('คำแปล').filter('_type == "article" && language != "th"')),
            S.divider(),
            S.documentTypeListItem('city').title('เมือง'),
            S.divider(),
            S.listItem().title('ตั้งค่าเว็บ / เกี่ยวกับบอส').child(S.document().schemaType('settings').documentId('settings')),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
  document: {
    // Settings is a single document: no "create new" for it.
    newDocumentOptions: (prev) => prev.filter((t) => t.templateId !== 'settings'),
  },
});
