// Restaurant awards: one list (src/data/awards.json), shared by the website and scripts/post-article.mjs / pull-articles.mjs.
// In Sanity an award is { award, year?, note? }; in a post file it is one line "<award>[ <year>][ (<note>)]".
// Plain JS on purpose, so Node scripts and Astro both import it.

// Older ways of writing an award → the name in the list.
const OLD = {
  'black pearl 3 เพชร': 'Black Pearl 3 Diamond', 'black pearl 2 เพชร': 'Black Pearl 2 Diamond', 'black pearl 1 เพชร': 'Black Pearl 1 Diamond',
  "asia's 50 best": "Asia's 50 Best Restaurants", "world's 50 best": "The World's 50 Best Restaurants", "the world's 50 best": "The World's 50 Best Restaurants",
  'michelin 3 star': 'MICHELIN 3★', 'michelin 2 star': 'MICHELIN 2★', 'michelin 1 star': 'MICHELIN 1★', 'michelin 3 stars': 'MICHELIN 3★', 'michelin 2 stars': 'MICHELIN 2★',
  'michelin bib': 'MICHELIN Bib Gourmand',
};

export function makeAwards(list) {
  const groups = Object.fromEntries(Object.entries(list).filter(([k]) => !k.startsWith('_')));
  const ALL = Object.values(groups).flat();
  const byLen = [...ALL].sort((a, b) => b.length - a.length);
  /** "MICHELIN Young Chef Award 2025 (Chef Au)" → { award, year: 2025, note: 'Chef Au' }; null when no award in the list fits. */
  const parse = (raw) => {
    if (raw && typeof raw === 'object') return raw.award ? { award: raw.award, ...(raw.year ? { year: +raw.year } : {}), ...(raw.note ? { note: String(raw.note) } : {}) } : null;
    let s = String(raw ?? '').trim();
    if (!s) return null;
    const fits = (t) => byLen.find((a) => t.toLowerCase().startsWith(a.toLowerCase()));
    // Old spellings only when no name in the list fits ("Asia's 50 Best Restaurants" must not become "… Restaurants Restaurants")
    if (!fits(s)) for (const [k, v] of Object.entries(OLD).sort((x, y) => y[0].length - x[0].length)) if (s.toLowerCase().startsWith(k)) { s = v + s.slice(k.length); break; }
    const award = fits(s);
    if (!award) return null;
    let rest = s.slice(award.length).trim(), year, notes = [];
    rest = rest.replace(/\(([^)]*)\)/g, (_, inner) => { inner.split(/[,·]/).map((x) => x.trim()).filter(Boolean).forEach((x) => (/^(19|20)\d\d$/.test(x) ? (year = +x) : notes.push(x))); return ' '; });
    rest.split(/\s+/).filter(Boolean).forEach((w) => (/^(19|20)\d\d$/.test(w) ? (year = +w) : notes.push(w)));
    const note = notes.join(' ').replace(/^[-–·,]\s*/, '').trim();
    return { award, ...(year ? { year } : {}), ...(note ? { note } : {}) };
  };
  /** How an award is shown and written in a post file: "MICHELIN 1★", "Tatler Best 20 2026 (Taiwan)". Unknown text is shown as is. */
  const label = (a) => {
    const p = parse(a);
    if (!p) return typeof a === 'string' ? a.trim() : '';
    return `${p.award}${p.year ? ` ${p.year}` : ''}${p.note ? ` (${p.note})` : ''}`;
  };
  const guideOf = (award) => Object.keys(groups).find((g) => groups[g].includes(award));
  return { groups, ALL, parse, label, guideOf };
}
