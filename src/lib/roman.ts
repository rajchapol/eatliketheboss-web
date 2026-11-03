// Roman numerals for course numbers and lists (1 → "I", 14 → "XIV"). One helper so every page counts the same way.
const NUMERALS: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1) return String(n);
  let out = '';
  for (const [v, s] of NUMERALS) while (n >= v) { out += s; n -= v; }
  return out;
}
/** Zero-based index → numeral (0 → "I"). */
export const romanAt = (i: number) => toRoman(i + 1);
