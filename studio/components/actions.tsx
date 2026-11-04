// Article document actions:
// - "เปิดดูบนเว็บ": opens the published page on eatlikeboss.com (same URL rules as src/lib/content.ts articleUrl()).
// - "ลบบทความ…": a clearer delete. It says what disappears from the website, and refuses while translations
//   still point at this Thai article (delete those first; the list links to them).
import { useEffect, useState } from 'react';
import { useClient, useDocumentOperation, type DocumentActionComponent, type DocumentActionProps } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { LaunchIcon } from '@sanity/icons/Launch';
import { TrashIcon } from '@sanity/icons/Trash';

const SITE = 'https://eatlikeboss.com';
const SERIES_PATH: Record<string, string> = { review: 'review', history: 'history', drinks: 'drinks' };
const bare = (id = '') => id.replace(/^drafts\./, '');

function useCitySlug(ref?: string) {
  const client = useClient({ apiVersion: '2025-01-01' });
  const [slug, setSlug] = useState<string | undefined>();
  useEffect(() => {
    if (!ref) { setSlug(undefined); return; }
    let live = true;
    client.fetch<string | null>('*[_id == $id][0].slug.current', { id: ref }).then((s) => live && setSlug(s ?? undefined));
    return () => { live = false; };
  }, [client, ref]);
  return slug;
}

function urlOf(doc: any, citySlug?: string) {
  const slug = doc?.slug?.current;
  if (!slug) return undefined;
  const series = doc.series || 'review';
  if (series === 'review' && !citySlug) return undefined;
  const lang = doc.language && doc.language !== 'th' ? `/${doc.language}` : '';
  return `${SITE}${lang}/${SERIES_PATH[series] ?? series}/${series === 'review' ? `${citySlug}/` : ''}${slug}/`;
}

export const OpenOnSiteAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const doc: any = props.published;
  const citySlug = useCitySlug(doc?.city?._ref);
  const url = urlOf(doc, citySlug);
  return {
    label: 'เปิดดูบนเว็บ',
    icon: LaunchIcon,
    disabled: !url,
    title: !doc ? 'ยังไม่ได้เผยแพร่ กด Publish ก่อน แล้วรอเว็บอัปเดตสักครู่' : !url ? 'ใส่ Slug และเมืองให้ครบก่อน' : `เปิด ${url} (ถ้าเพิ่งเผยแพร่ รอเว็บอัปเดต 2–3 นาที)`,
    onHandle: () => { if (url) window.open(url, '_blank', 'noopener'); props.onComplete(); },
  };
};

type Row = { _id: string; language?: string; title?: string; name?: string };

export const SafeDeleteAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type, draft, published, onComplete } = props;
  const op = useDocumentOperation(id, type) as any;
  const client = useClient({ apiVersion: '2025-01-01' });
  const [open, setOpen] = useState(false);
  const [refs, setRefs] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const doc: any = draft || published;
  const citySlug = useCitySlug(doc?.city?._ref);
  const url = published ? urlOf(published, citySlug) : undefined;

  useEffect(() => {
    if (!open) return;
    client.fetch<Row[]>('*[references($id) && !(_id in path("drafts.**"))]{_id, language, title, "name": restaurant.name}', { id: bare(id) }).then(setRefs);
  }, [open, client, id]);

  const name = doc?.restaurant?.name || doc?.title || 'บทความนี้';
  const blocked = (refs?.length ?? 0) > 0;
  return {
    label: 'ลบบทความ…',
    icon: TrashIcon,
    tone: 'critical',
    disabled: Boolean(op.delete?.disabled),
    onHandle: () => setOpen(true),
    dialog: open && {
      type: 'dialog',
      header: `ลบ "${name}" ถาวร?`,
      onClose: () => { setOpen(false); onComplete(); },
      content: (
        <Stack space={4}>
          <Text size={1}>ลบทั้งฉบับร่างและฉบับที่เผยแพร่ กู้คืนจากปุ่มนี้ไม่ได้ (ดูประวัติย้อนหลังได้จากเมนู History ก่อนลบเท่านั้น)</Text>
          {url ? <Text size={1}>หน้าเว็บ <code>{url.replace(SITE, '')}</code> จะหายไปหลังเว็บอัปเดต ลิงก์ที่เคยแชร์ไปจะเปิดไม่ได้</Text>
            : <Text size={1} muted>บทความนี้ยังไม่เคยเผยแพร่ ลบแล้วไม่กระทบหน้าเว็บ</Text>}
          {refs === null ? <Text size={1} muted>กำลังตรวจคำแปลที่ผูกอยู่…</Text> : blocked && (
            <Card padding={3} radius={2} tone="caution" border>
              <Stack space={3}>
                <Text size={1} weight="semibold">ยังลบไม่ได้: มีเอกสารผูกกับบทความนี้อยู่ {refs!.length} รายการ ลบหรือแก้รายการเหล่านี้ก่อน</Text>
                {refs!.map((r) => (
                  <Card key={r._id} as={IntentLink as any} intent="edit" params={{ id: r._id, type: 'article' }} padding={2} radius={2} border style={{ textDecoration: 'none' }}>
                    <Text size={1}>{(r.language || 'th').toUpperCase()} · {r.name || r.title || r._id}</Text>
                  </Card>
                ))}
              </Stack>
            </Card>
          )}
          <Flex gap={2} justify="flex-end">
            <Button mode="ghost" text="ยกเลิก" onClick={() => { setOpen(false); onComplete(); }} />
            <Button tone="critical" icon={TrashIcon} text={busy ? 'กำลังลบ…' : 'ลบถาวร'} disabled={refs === null || blocked || busy}
              onClick={() => { setBusy(true); op.delete.execute(); setOpen(false); onComplete(); }} />
          </Flex>
        </Stack>
      ),
    },
  };
};
