// Article document actions:
// - "เปิดดูบนเว็บ": opens the published page on eatlikeboss.com (same URL rules as src/lib/content.ts articleUrl()).
// - "ลบบทความ…": a clearer delete. It says what disappears from the website, and refuses while translations
//   still point at this Thai article (delete those first; the list links to them).
import { useEffect, useState } from 'react';
import { useClient, type DocumentActionComponent, type DocumentActionProps } from 'sanity';
import { usePaneRouter } from 'sanity/structure';
import { useToast } from '@sanity/ui/toast';
import { IntentLink } from 'sanity/router';
import { Box, Button, Card, Flex, Stack } from '@sanity/ui';
import { Line } from './Line';
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
  const client = useClient({ apiVersion: '2025-01-01' });
  const pane = usePaneRouter();
  const toast = useToast();
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
    disabled: !draft && !published,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: 'dialog',
      header: `ลบ "${name}" ถาวร?`,
      onClose: () => { setOpen(false); onComplete(); },
      content: (
        <Stack space={4}>
          <Line>ลบทั้งฉบับร่างและฉบับที่เผยแพร่ กู้คืนจากปุ่มนี้ไม่ได้ (ดูประวัติย้อนหลังได้จากเมนู History ก่อนลบเท่านั้น)</Line>
          {url ? <Line>หน้าเว็บ <code>{url.replace(SITE, '')}</code> จะหายไปหลังเว็บอัปเดต ลิงก์ที่เคยแชร์ไปจะเปิดไม่ได้</Line>
            : <Line muted>บทความนี้ยังไม่เคยเผยแพร่ ลบแล้วไม่กระทบหน้าเว็บ</Line>}
          {refs === null ? <Line muted>กำลังตรวจคำแปลที่ผูกอยู่…</Line> : blocked && (
            <Card padding={3} radius={2} tone="caution" border>
              <Stack space={3}>
                <Line bold>ยังลบไม่ได้: มีเอกสารผูกกับบทความนี้อยู่ {refs!.length} รายการ ลบหรือแก้รายการเหล่านี้ก่อน</Line>
                {refs!.map((r) => (
                  <Card key={r._id} as={IntentLink as any} intent="edit" params={{ id: r._id, type: 'article' }} padding={2} radius={2} border style={{ textDecoration: 'none' }}>
                    <Line>{(r.language || 'th').toUpperCase()} · {r.name || r.title || r._id}</Line>
                  </Card>
                ))}
              </Stack>
            </Card>
          )}
          <Flex gap={2} justify="flex-end">
            <Button mode="ghost" text="ยกเลิก" onClick={() => { setOpen(false); onComplete(); }} />
            <Button tone="critical" icon={TrashIcon} text={busy ? 'กำลังลบ…' : 'ลบถาวร'} disabled={refs === null || blocked || busy}
              onClick={async () => {
                // Delete the draft and the published version in one transaction, then close this pane:
                // an open form could otherwise write the empty document back (the "ไม่มีชื่อ" that kept returning).
                setBusy(true);
                try {
                  await client.transaction().delete(`drafts.${bare(id)}`).delete(bare(id)).commit({ visibility: 'sync' });
                  toast.push({ status: 'success', title: `ลบ "${name}" แล้ว` });
                  setOpen(false); onComplete();
                  try { pane.closeCurrent(); } catch { /* not in a structure pane */ }
                } catch (e: any) {
                  toast.push({ status: 'error', title: 'ลบไม่สำเร็จ', description: String(e?.message || e) });
                  setBusy(false);
                }
              }} />
          </Flex>
        </Stack>
      ),
    },
  };
};
