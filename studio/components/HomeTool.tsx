// Studio home (the Boss, 16 Nov 2026: "make Sanity easier"): open Studio and see at once what is waiting,
// what went up lately, and one-click buttons to start a new review / episode.
import { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Box, Button, Card, Flex, Grid, Heading, Stack, Text } from '@sanity/ui';
import { AddIcon } from '@sanity/icons/Add';
import { LaunchIcon } from '@sanity/icons/Launch';

const API = '2025-01-01';
const TH = '_type == "article" && !defined(translationOf)';
const PUB = '!(_id in path("drafts.**"))';

// Each to-do counter uses the same filter as the "To do" list in sanity.config.ts.
const QUERY = `{
  "reviews": count(*[${TH} && ${PUB} && series == "review"]),
  "history": count(*[${TH} && ${PUB} && series == "history"]),
  "drinks": count(*[${TH} && ${PUB} && series == "drinks"]),
  "cities": count(*[_type == "city" && count(*[_type == "article" && city._ref == ^._id]) > 0]),
  "todo": [
    { "t": "ร่างใหม่ ยังไม่เผยแพร่", "n": count(*[_type == "article" && _id in path("drafts.**") && count(*[_id == string::split(^._id, "drafts.")[1]]) == 0]) },
    { "t": "แก้ไขค้างไว้ ยังไม่กด Publish", "n": count(*[_type == "article" && _id in path("drafts.**") && count(*[_id == string::split(^._id, "drafts.")[1]]) > 0]) },
    { "t": "รีวิวที่ยังไม่มีระดับราคา", "n": count(*[${TH} && series == "review" && !defined(billBand) && !defined(bill) && !defined(restaurant.priceBand)]) },
    { "t": "ยังไม่ใส่ Visit", "n": count(*[${TH} && !defined(visit)]) },
    { "t": "SEO ยังไม่ครบ", "n": count(*[_type == "article" && (!defined(seoTitle) || !defined(seoDescription) || length(seoTitle) > 60 || length(seoDescription) < 120 || length(seoDescription) > 155)]) },
    { "t": "จานที่ยังไม่มีรูป", "n": count(*[${TH} && count(dishes[!defined(image.asset)]) > 0]) },
    { "t": "เมืองที่ยังขาดรูปหรือเรื่องน่ารู้", "n": count(*[_type == "city" && (!defined(cover.asset) || !defined(intro)) && count(*[_type == "article" && city._ref == ^._id]) > 0]) }
  ],
  "latest": *[${TH}] | order(_updatedAt desc)[0...8]{ _id, title, series, episode, visit, "name": restaurant.name, "city": city->nameEn, "draft": _id in path("drafts.**"), _updatedAt }
}`;

type Data = { reviews: number; history: number; drinks: number; cities: number; todo: { t: string; n: number }[]; latest: any[] };

const NEW = [
  { template: 'article-review', label: 'รีวิวร้านใหม่', en: 'New review' },
  { template: 'article-history', label: 'มื้ออาหารเปลี่ยนโลก ตอนใหม่', en: 'New episode' },
  { template: 'article-drinks', label: 'บอสพาดื่ม บทใหม่', en: 'New drinks article' },
];

export function HomeTool() {
  const client = useClient({ apiVersion: API });
  const [d, setD] = useState<Data | null>(null);
  useEffect(() => { let live = true; client.fetch<Data>(QUERY).then((x) => live && setD(x)); return () => { live = false; }; }, [client]);
  const when = (iso: string) => new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <Box padding={[3, 4, 5]} style={{ maxWidth: 1080, margin: '0 auto' }}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading size={3}>บอสพาชิม · Eat Like The Boss</Heading>
          <Text muted size={1}>Studio home · หน้าแรก</Text>
        </Stack>

        <Stack space={3}>
          <Text size={1} weight="semibold">Start something new · เริ่มบทความใหม่</Text>
          <Flex gap={2} wrap="wrap">
            {NEW.map((x) => (
              <Button key={x.template} as={IntentLink} intent="create" params={{ type: 'article', template: x.template }} icon={AddIcon} text={`${x.en} · ${x.label}`} tone="primary" mode={x.template === 'article-review' ? 'default' : 'ghost'} />
            ))}
            <Button as="a" href="https://eatlikeboss.com" target="_blank" rel="noreferrer" icon={LaunchIcon} text="เปิดเว็บ" mode="bleed" />
          </Flex>
        </Stack>

        <Grid columns={[2, 2, 4]} gap={3}>
          {[['รีวิว', d?.reviews], ['มื้ออาหารเปลี่ยนโลก (ตอน)', d?.history], ['บอสพาดื่ม', d?.drinks], ['เมือง', d?.cities]].map(([t, n]) => (
            <Card key={String(t)} padding={4} radius={3} shadow={1}>
              <Stack space={3}><Text size={4} weight="bold">{n ?? '…'}</Text><Text size={1} muted>{t}</Text></Stack>
            </Card>
          ))}
        </Grid>

        <Grid columns={[1, 1, 2]} gap={4}>
          <Card padding={4} radius={3} shadow={1}>
            <Stack space={4}>
              <Text size={1} weight="semibold">To do · งานที่ค้าง</Text>
              {!d ? <Text muted size={1}>กำลังโหลด…</Text> : d.todo.map((x) => (
                <Flex key={x.t} justify="space-between" align="center">
                  <Text size={1} muted={!x.n}>{x.t}</Text>
                  <Card paddingX={2} paddingY={1} radius={2} tone={x.n ? 'caution' : 'positive'}><Text size={1} weight="semibold">{x.n}</Text></Card>
                </Flex>
              ))}
              <Text size={0} muted>ดูรายการเต็มได้ที่เมนู Content → To do</Text>
            </Stack>
          </Card>
          <Card padding={4} radius={3} shadow={1}>
            <Stack space={4}>
              <Text size={1} weight="semibold">Latest changes · แก้ล่าสุด</Text>
              {!d ? <Text muted size={1}>กำลังโหลด…</Text> : d.latest.map((a) => (
                <IntentLink key={a._id} intent="edit" params={{ id: a._id.replace(/^drafts\./, ''), type: 'article' }} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Flex justify="space-between" gap={3}>
                    <Stack space={2} style={{ minWidth: 0 }}>
                      <Text size={1} weight="medium" textOverflow="ellipsis">{a.series !== 'history' ? (a.name || a.title) : `Ep.${a.episode ?? '?'} ${a.title}`}</Text>
                      <Text size={0} muted>{[a.city, a.visit && `Visit ${a.visit}`, a.draft && 'ร่าง'].filter(Boolean).join(' · ')}</Text>
                    </Stack>
                    <Text size={0} muted style={{ whiteSpace: 'nowrap' }}>{when(a._updatedAt)}</Text>
                  </Flex>
                </IntentLink>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Stack>
    </Box>
  );
}
