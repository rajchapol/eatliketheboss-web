// Meta title / description with a live character count and the site's SEO range (docs/SEO.md).
import type { StringInputProps } from 'sanity';
import { Flex, Stack, Text } from '@sanity/ui';
import { set, useClient, useFormValue } from 'sanity';
import { Button } from '@sanity/ui';
import { SparklesIcon } from '@sanity/icons/Sparkles';

export const charCount = (min: number, max: number) => function CharCountInput(props: StringInputProps) {
  const n = [...(props.value || '')].length;
  const ok = n >= min && n <= max;
  const tip = !n ? `ควรมี ${min ? `${min}–` : '≤ '}${max} ตัวอักษร` : n < min ? `สั้นไป อีก ${min - n} ตัว` : n > max ? `ยาวไป เกิน ${n - max} ตัว` : 'ความยาวพอดี';
  return (
    <Stack space={2}>
      {props.renderDefault(props)}
      <Flex justify="space-between">
        <Text size={1} muted={ok || !n} style={{ color: n && !ok ? 'var(--card-badge-caution-fg-color, #b7791f)' : undefined }}>{tip}</Text>
        <Text size={1} weight="semibold" style={{ color: n && !ok ? 'var(--card-badge-caution-fg-color, #b7791f)' : undefined }}>{n} / {max}</Text>
      </Flex>
    </Stack>
  );
};

// Same counter plus a "ร่างให้" button (the Boss, 16 Nov 2026: fill things in for me): drafts the Meta title /
// description from the restaurant, city, tagline and intro. Only fills; the Boss edits the wording after.

const plain = (blocks?: any[]) => (blocks || []).filter((b) => b?._type === 'block').map((b) => (b.children || []).map((c: any) => c.text).join('')).join(' ').replace(/\s+/g, ' ').trim();
const cut = (s: string, max: number) => { const ch = [...s]; if (ch.length <= max) return s; const t = ch.slice(0, max).join(''); const i = t.lastIndexOf(' '); return (i > max * 0.6 ? t.slice(0, i) : t).replace(/[\s,·:–-]+$/, ''); };

export const seoInput = (kind: 'title' | 'description', min: number, max: number) => function SeoInput(props: StringInputProps) {
  const Counter = charCount(min, max);
  const doc = useFormValue([]) as any;
  const client = useClient({ apiVersion: '2025-01-01' });
  const draft = async () => {
    const city = doc?.city?._ref ? await client.fetch<string | null>('*[_id == $id][0].nameEn', { id: doc.city._ref }) : null;
    const review = (doc?.series || 'review') === 'review';
    const name = doc?.restaurant?.name || doc?.title || '';
    let v = '';
    if (kind === 'title') {
      v = review ? cut([name, city, 'รีวิว', doc?.restaurant?.style || doc?.restaurant?.cuisine || 'Fine Dining'].filter(Boolean).join(' '), max) : cut(doc?.title || '', max);
    } else {
      v = cut([doc?.tagline, plain(doc?.body)].filter(Boolean).join(' — '), max);
    }
    if (v) props.onChange(set(v));
  };
  return (
    <Stack space={2}>
      <Counter {...props} />
      <Flex justify="flex-end"><Button icon={SparklesIcon} text={props.value ? 'ร่างใหม่ให้' : 'ร่างให้'} mode="ghost" fontSize={1} padding={2} onClick={draft} /></Flex>
    </Stack>
  );
};
