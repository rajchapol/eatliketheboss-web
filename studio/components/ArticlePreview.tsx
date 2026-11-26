// "Preview · ดูหน้าตา" tab on an article (the Boss, 16 Nov 2026): how the card and the Google result will
// look, plus a short pre-publish checklist — before pressing Publish. Reads the draft as it is being edited.
import { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { Box, Card, Flex, Stack, Text } from '@sanity/ui';

const PROJECT = 'ohviqc5c';
const SITE = 'eatlikeboss.com';
const SERIES: Record<string, { en: string; th: string; path: string; dot: string }> = {
  review: { en: 'The Boss Dines', th: 'บอสพาชิม', path: 'review', dot: '#0b5357' },
  history: { en: 'Meals That Changed the World', th: 'มื้ออาหารเปลี่ยนโลก', path: 'history', dot: '#0abab5' },
  drinks: { en: 'The Boss Pours', th: 'บอสพาดื่ม', path: 'drinks', dot: '#c39e5c' },
  chill: { en: 'The Boss Goes Chilling', th: 'บอสพาชิล', path: 'chill', dot: '#c8704a' },
};

// image-<id>-<w>x<h>-<ext> → CDN URL (crop centre; the site also honours the hotspot)
function imgUrl(ref?: string, w = 900, h = 600) {
  const m = ref?.match(/^image-([a-f0-9]+)-(\d+)x(\d+)-(\w+)$/);
  return m ? `https://cdn.sanity.io/images/${PROJECT}/production/${m[1]}-${m[2]}x${m[3]}.${m[4]}?w=${w}&h=${h}&fit=crop&auto=format` : undefined;
}
const dims = (ref?: string) => { const m = ref?.match(/-(\d+)x(\d+)-\w+$/); return m ? { w: +m[1], h: +m[2] } : undefined; };
const text = (blocks?: any[]) => (blocks || []).filter((b) => b?._type === 'block').map((b) => (b.children || []).map((c: any) => c.text).join('')).join(' ').trim();
const len = (s?: string) => [...(s || '')].length;

export function ArticlePreview(props: any) {
  const a = props.document?.displayed || {};
  const client = useClient({ apiVersion: '2025-01-01' });
  const [city, setCity] = useState<{ en?: string; slug?: string }>({});
  useEffect(() => {
    const ref = a.city?._ref; if (!ref) { setCity({}); return; }
    let live = true; client.fetch('*[_id == $id][0]{"en": nameEn, "slug": slug.current}', { id: ref }).then((c: any) => live && setCity(c || {}));
    return () => { live = false; };
  }, [client, a.city?._ref]);

  const s = SERIES[a.series || 'review'] || SERIES.review;
  const isReview = (a.series || 'review') === 'review';
  const name = isReview ? (a.restaurant?.name || a.title) : a.title;
  const cover = imgUrl(a.cover?.asset?._ref);
  const pills = [city.en, a.visit && `Visit ${a.visit}`, [a.restaurant?.cuisine, a.restaurant?.style].filter(Boolean).join(' · '), [a.billBand, a.tag].filter(Boolean).join(' · ')].filter(Boolean);
  const metaTitle = (a.seoTitle || a.title || '').replace(/\s*[—–-]\s*(บอสพาชิม|Eat Like The Boss)\s*$/i, '');
  const url = `${SITE} › ${s.path}${isReview && city.slug ? ` › ${city.slug}` : ''} › ${a.slug?.current || '…'}`;
  const desc = a.seoDescription || a.tagline || text(a.body).slice(0, 155);

  const glasses = (a.dishes || []).filter((d: any) => d.glassesOff).length;
  const cd = dims(a.cover?.asset?._ref);
  const noAlt = [a.cover, ...(a.dishes || []).map((d: any) => d.image), ...(a.gallery || [])].filter((i: any) => i?.asset && !i.alt).length;
  const checks: [boolean, string][] = [
    [!!cover, 'มีรูปปก'],
    [!cd || cd.w / cd.h >= 1.25, 'รูปปกเป็นแนวนอน (เว็บครอป 3:2)'],
    [!noAlt, noAlt ? `รูปยังไม่มีคำบรรยาย ${noAlt} รูป` : 'ทุกรูปมีคำบรรยาย (alt)'],
    [glasses <= 2, `จานถอดแว่นชิม ${glasses} จาน (ไม่เกิน 2)`],
    [!!a.visit, 'ใส่ Visit แล้ว'],
    [!isReview || !!(a.billBand || a.bill), 'มีระดับราคา (The Boss\'s Bill)'],
    [len(a.seoTitle) > 0 && len(a.seoTitle) <= 60, `Meta title ${len(a.seoTitle)}/60`],
    [len(a.seoDescription) >= 120 && len(a.seoDescription) <= 155, `Meta description ${len(a.seoDescription)} (120–155)`],
  ];

  return (
    <Box padding={4} style={{ maxWidth: 760 }}>
      <Stack space={5}>
        <Stack space={3}>
          <Text size={1} weight="semibold">Card · การ์ดบนเว็บ</Text>
          <Card radius={3} shadow={1} overflow="hidden" style={{ maxWidth: 380, background: '#fbf7ef' }}>
            <div style={{ aspectRatio: '3 / 2', background: '#e8dfcf' }}>{cover && <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}</div>
            <Box padding={4}>
              <Stack space={3}>
                <Text size={0} style={{ letterSpacing: '.16em', textTransform: 'uppercase', color: s.dot }}>{isReview ? 'Tasting Notes' : s.en}{a.series === 'history' && a.episode ? ` · Ep.${a.episode}` : ''}</Text>
                <Text size={3} weight="semibold" style={{ color: '#1a2632' }}>{name || 'ยังไม่มีชื่อ'}</Text>
                {a.tagline && <Text size={1} style={{ color: '#3d4955' }}>{a.tagline}</Text>}
                <Flex gap={2} wrap="wrap">{pills.map((p) => <Card key={String(p)} paddingX={2} paddingY={1} radius={5} style={{ boxShadow: '0 0 0 1px rgba(195,158,92,.6)', background: '#fff' }}><Text size={0}>{p}</Text></Card>)}</Flex>
              </Stack>
            </Box>
          </Card>
        </Stack>

        <Stack space={3}>
          <Text size={1} weight="semibold">Google · ผลค้นหา</Text>
          <Card padding={4} radius={3} shadow={1} style={{ background: '#fff', fontFamily: 'arial, sans-serif' }}>
            <div style={{ fontSize: 12, color: '#4d5156' }}>{url}</div>
            <div style={{ fontSize: 20, color: '#1a0dab', lineHeight: 1.3, margin: '4px 0' }}>{metaTitle || 'ยังไม่มี Meta title'} — บอสพาชิม</div>
            <div style={{ fontSize: 14, color: '#4d5156', lineHeight: 1.58 }}>{desc || 'ยังไม่มี Meta description'}</div>
          </Card>
        </Stack>

        <Stack space={3}>
          <Text size={1} weight="semibold">Before Publish · เช็กก่อนกด Publish</Text>
          <Card padding={4} radius={3} shadow={1}>
            <Stack space={3}>{checks.map(([ok, t]) => <Text key={t} size={1} style={{ color: ok ? '#1b7f4a' : '#b7791f' }}>{ok ? '✓' : '!'}  {t}</Text>)}</Stack>
          </Card>
          <Text size={0} muted>รูปในตัวอย่างครอปตรงกลาง บนเว็บจะใช้จุดโฟกัสที่ตั้งไว้ · รูปแชร์ (OG) สร้างหลัง Publish</Text>
        </Stack>
      </Stack>
    </Box>
  );
}
