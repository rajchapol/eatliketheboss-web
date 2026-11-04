// Studio → article → tab "5 ภาษา / คำแปล": shows which article this one belongs to, every language it
// exists in (with links), and buttons that create a missing translation pre-filled from the Thai article.
// Read-only: it stores nothing (the link itself is the `translationOf` reference on each translation).
import { useEffect, useState } from 'react';
import { useClient, useFormValue } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Badge, Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';
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

  useEffect(() => {
    if (!baseId) { setRows([]); return; }
    let live = true;
    const q = `*[_type == "article" && (_id in [$id, "drafts." + $id] || translationOf._ref == $id)]{_id, language, title, "name": restaurant.name, "city": city->nameEn, visit}`;
    const load = () => client.fetch<Row[]>(q, { id: baseId }, { perspective: 'raw' }).then((r) => {
      // one row per document: a draft wins over its published version
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
  const others = rows.filter((r) => bare(r._id) !== id);
  const missing = LANGS.filter((l) => l.id !== 'th' && !have.has(l.id));

  return (
    <Stack space={3}>
      <Text size={1} muted>บทความนี้มีทั้งหมด {rows.length} ภาษา · กดเพื่อเปิด</Text>
      {others.length ? others.map((r) => <DocLink key={r._id} row={r} tone={r.language === 'th' ? 'primary' : 'default'} />)
        : <Card padding={3} radius={2} border><Text size={1} muted>ยังไม่มีคำแปล</Text></Card>}
      {language === 'th' && id && missing.length > 0 && (
        <Box>
          <Text size={1} muted>เพิ่มคำแปล (คัดลอกร้าน รูป รายการจาน และข้อความไทยไปให้ แล้วแปลทับได้เลย)</Text>
          <Flex gap={2} wrap="wrap" marginTop={3}>
            {missing.map((l) => (
              <Button key={l.id} as={IntentLink as any} intent="create" mode="ghost" icon={AddIcon} text={l.label}
                params={[{ type: 'article', template: 'article-translation' }, { sourceId: id, language: l.id }]} />
            ))}
          </Flex>
        </Box>
      )}
    </Stack>
  );
}
