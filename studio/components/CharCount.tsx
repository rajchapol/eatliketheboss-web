// Meta title / description with a live character count and the site's SEO range (docs/SEO.md).
import type { StringInputProps } from 'sanity';
import { Flex, Stack, Text } from '@sanity/ui';

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
