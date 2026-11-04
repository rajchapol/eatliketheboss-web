// Studio → article → tab "5 ภาษา / คำแปล": shows which article this one belongs to, every language it
// exists in (with links), and buttons that create a missing translation pre-filled from the Thai article.
// The button writes the new draft itself (id `<thai id>-<lang>`, the same ids scripts/post-article.mjs uses),
// already linked through `translationOf`, then opens it — nothing to pick by hand.
// Read-only otherwise: the panel stores nothing.
import { useEffect, useState } from 'react';
import { useClient, useFormValue } from 'sanity';
import { IntentLink, useRouter } from 'sanity/router';
import { Badge, Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { useToast } from '@sanity/ui/toast';
import { AddIcon } from '@sanity/icons/Add';
import { LaunchIcon } from '@sanity/icons/Launch';

export const LANGS = [
  { id: 'th', label: 'ไทย (ต้นฉบับ)', short: 'TH' },
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'ja', label: '日本語', short: 'JA' },
  { id: 'zh', label: '中文', short: 'ZH' },
];
const labelOf = (id?: string) => LANGS.find((l) => l.id === id)?.label ?? id ?? '—';
const bare = (id = '') => id.replace(/^drafts\./, '');

type Row = { _id: string; language?: string; title?: string; name?: string; city?: string; visit?: string };

function DocLink({ row, tone }: { row: Row; tone?: 'primary' | 'default' }) {
  return (
    <Card as={IntentLink as any} intent="edit" params={{ id: bare(row._id), type: 'article' }} padding={3} radius={2} border tone={tone} style={{ textDecoration: 'none' }}>
      <Flex align="center" gap={3}>
        <Badge tone={row.language === 'th' ? 'primary' : 'positive'}>{LANGS.find((l) => l.id === row.language)?.short ?? '?'}</Badge>
        <Stack space={2} flex={1}>
          <Text size={1} weight="semibold">{row.name || row.title || 'ไม่มีชื่อ'}</Text>
          <Text size={1} muted>{[labelOf(row.language), row.city, row.visit && `Visit ${row.visit}`, row._id.startsWith('drafts.') ? 'ฉบับร่าง' : null].filter(Boolean).join(' · ')}</Text>
        </Stack>
        <Text size={1} muted><LaunchIcon /></Text>
      </Flex>
    </Card>
  );
}

export function TranslationsPanel() {
  const client = useClient({ apiVersion: '2025-01-01' });
  const id = bare(useFormValue(['_id']) as string);
  const language = (useFormValue(['language']) as string) || 'th';
  const sourceRef = (useFormValue(['translationOf']) as { _ref?: string } | undefined)?._ref;
  const baseId = language === 'th' ? id : sourceRef;
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [thaiPublished, setThaiPublished] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // Copy everything that stays the same (restaurant, city, photos, dishes, Bill, Visit, slug) plus the Thai
  // text to translate over; SEO texts are written fresh in the new language.
  async function createTranslation(lang: string) {
    const newId = `${id}-${lang}`;
    setBusy(lang);
    try {
      const existing = await client.fetch<string | null>('*[_id in [$id, "drafts." + $id]][0]._id', { id: newId }, { perspective: 'raw' });
      if (!existing) {
        const src = await client.fetch<any>('coalesce(*[_id == "drafts." + $id][0], *[_id == $id][0])', { id }, { perspective: 'raw' });
        if (!src) throw new Error('ไม่พบบทความต้นฉบับ');
        const { _id, _rev, _createdAt, _updatedAt, _type, translationOf, seoTitle, seoDescription, language: _l, ...rest } = src;
        await client.create({ ...rest, _id: `drafts.${newId}`, _type: 'article', language: lang, translationOf: { _type: 'reference', _ref: id } });
      }
      router.navigateIntent('edit', { id: newId, type: 'article' });
    } catch (e: any) {
      toast.push({ status: 'error', title: 'สร้างคำแปลไม่สำเร็จ', description: String(e?.message || e) });
    } finally { setBusy(null); }
  }

  useEffect(() => {
    if (!baseId) { setRows([]); return; }
    let live = true;
    const q = `*[_type == "article" && (_id in [$id, "drafts." + $id] || translationOf._ref == $id)]{_id, language, title, "name": restaurant.name, "city": city->nameEn, visit}`;
    const load = () => client.fetch<Row[]>(q, { id: baseId }, { perspective: 'raw' }).then((r) => {
      // one row per document: a draft wins over its published version
      if (live) setThaiPublished(r.some((x) => x._id === baseId));
      const byId = new Map<string, Row>();
      for (const x of r) if (!byId.has(bare(x._id)) || x._id.startsWith('drafts.')) byId.set(bare(x._id), x);
      if (live) setRows([...byId.values()].sort((a, b) => LANGS.findIndex((l) => l.id === a.language) - LANGS.findIndex((l) => l.id === b.language)));
    });
    load();
    const sub = client.listen(q, { id: baseId }, { visibility: 'query' }).subscribe(() => load());
    return () => { live = false; sub.unsubscribe(); };
  }, [client, baseId]);

  if (language !== 'th' && !baseId) {
    return <Card padding={3} radius={2} tone="caution" border><Text size={1}>เลือกบทความภาษาไทยที่แปลมา ในช่อง "แปลจากบทความ" ด้านบนก่อนครับ</Text></Card>;
  }
  if (!rows) return <Text size={1} muted>กำลังโหลด…</Text>;
  const have = new Set(rows.map((r) => r.language));
  const published = thaiPublished; // a translation must point at a published Thai article
  const others = rows.filter((r) => bare(r._id) !== id);
  const missing = LANGS.filter((l) => l.id !== 'th' && !have.has(l.id));

  return (
    <Stack space={3}>
      {language !== 'th' && <Text size={1} weight="semibold">คำแปลนี้ผูกกับบทความไทยด้านล่าง (การ์ดสีฟ้า)</Text>}
      <Text size={1} muted>บทความนี้มีทั้งหมด {rows.length} ภาษา · กดเพื่อเปิด</Text>
      {others.length ? others.map((r) => <DocLink key={r._id} row={r} tone={r.language === 'th' ? 'primary' : 'default'} />)
        : <Card padding={3} radius={2} border><Text size={1} muted>ยังไม่มีคำแปล</Text></Card>}
      {language === 'th' && id && !published && (
        <Card padding={3} radius={2} tone="caution" border><Text size={1}>กดเผยแพร่ (Publish) บทความไทยก่อน แล้วค่อยเพิ่มคำแปล</Text></Card>
      )}
      {language === 'th' && id && published && missing.length > 0 && (
        <Box>
          <Text size={1} muted>เพิ่มคำแปล (คัดลอกร้าน รูป รายการจาน และข้อความไทยไปให้ แล้วแปลทับได้เลย)</Text>
          <Flex gap={2} wrap="wrap" marginTop={3}>
            {missing.map((l) => (
              <Button key={l.id} mode="ghost" icon={AddIcon} text={busy === l.id ? 'กำลังสร้าง…' : l.label} disabled={Boolean(busy)} onClick={() => createTranslation(l.id)} />
            ))}
          </Flex>
        </Box>
      )}
    </Stack>
  );
}
