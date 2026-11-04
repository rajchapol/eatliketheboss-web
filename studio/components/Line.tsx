// Text with room for Thai vowels and tone marks. @sanity/ui <Text> trims line boxes to the Latin cap height,
// so Thai lines overlapped each other in the panels; this keeps a normal line height.
import type { ReactNode } from 'react';

export function Line({ children, size = 14, bold, muted }: { children: ReactNode; size?: number; bold?: boolean; muted?: boolean }) {
  return <div style={{ fontSize: size, lineHeight: 1.6, fontWeight: bold ? 600 : 400, opacity: muted ? 0.72 : 1, overflowWrap: 'anywhere' }}>{children}</div>;
}
