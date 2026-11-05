#!/usr/bin/env node
// One-off: rebuild the dotted maps in public/img/map/ from Natural Earth land (public domain, via world-atlas).
// Not part of the build. Run in an empty folder:
//   npm i world-atlas@2 topojson-client@3 && node /path/to/scripts/make-map-dots.mjs <out-dir>
// viewBox is in degrees: x = lon + 180 (0..360), y = 78 - lat (0..136 = 78°N … 58°S). Pins use the same maths.
// Three levels, so dots stay small at every zoom (DestinationsMap.astro picks one by how wide the view is):
//   world-dots.svg 1.5° grid · mid-dots.svg 0.5° grid (whole world) · fine-dots.svg 0.15° grid (East & Southeast Asia, Europe:
//   the boxes in FINE_BOXES of DestinationsMap.astro; keep them in step)
// Each row of land dots is one dashed line (dasharray 0 + round caps = a dot every step), which keeps the files small.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
// Packages are looked up in the folder you run this from (not in the repo).
const req = createRequire(process.cwd() + '/');
const { feature } = await import(pathToFileURL(req.resolve('topojson-client')).href);
const out = process.argv[2] || '.';
const land = (res) => { const t = JSON.parse(readFileSync(req.resolve(`world-atlas/land-${res}.json`), 'utf8')); return feature(t, t.objects.land); };
const r = (n) => +n.toFixed(3);
// Point in land: even-odd test on each polygon's rings, skipping polygons whose box does not hold the point (fast enough for 0.15° grids).
const index = (geo) => geo.geometries ? geo.geometries.flatMap(index) : geo.features ? geo.features.flatMap((f) => index(f.geometry))
  : (geo.type === 'Polygon' ? [geo.coordinates] : geo.type === 'MultiPolygon' ? geo.coordinates : []).map((rings) => {
      // A polygon across the date line (eastern Russia, Fiji) is unwrapped (no jumps of 360°) so the flat test works;
      // points are then also tested 360° to either side.
      const wraps = rings[0].some((p, i, a) => i && Math.abs(p[0] - a[i - 1][0]) > 180);
      const unwrap = (ring) => { let k = 0; return ring.map(([x, y], i) => { if (i) { const d = x - ring[i - 1][0]; if (d > 180) k -= 360; else if (d < -180) k += 360; } return [x + k, y]; }); };
      if (wraps) rings = rings.map(unwrap);
      const xs = rings[0].map((p) => p[0]), ys = rings[0].map((p) => p[1]);
      return { rings, wraps, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    });
const inRing = (ring, x, y) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const inPoly = (p, x, y) => x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1 && p.rings.reduce((c, ring) => c !== inRing(ring, x, y), false);
const contains = (polys, [x, y]) => polys.some((p) => inPoly(p, x, y) || (p.wraps && (inPoly(p, x + 360, y) || inPoly(p, x - 360, y))));
function rows(geo, step, latTop, latBottom, lonLeft, lonRight) {
  const d = [];
  for (let lat = latTop - step / 2; lat > latBottom; lat -= step) {
    let start = null, prev = null;
    const flush = () => { if (start != null) d.push(`M${r(start + 180)} ${r(78 - lat)}${prev === start ? 'h0' : `H${r(prev + 180)}`}`); start = null; };
    for (let lon = lonLeft + step / 2; lon < lonRight; lon += step) {
      if (contains(geo, [lon, lat])) { if (start == null) start = lon; prev = lon; } else flush();
    }
    flush();
  }
  return d.join('');
}
const svg = (d, step, dot) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 136" width="360" height="136"><path d="${d}" fill="none" stroke="#d4b372" stroke-width="${dot}" stroke-linecap="round" stroke-dasharray="0 ${step}"/></svg>`;
const l50 = index(land('50m')), l10 = index(land('10m'));
// Dot size ≈ 45% of the spacing: small, crisp dots at every zoom.
writeFileSync(`${out}/world-dots.svg`, svg(rows(l50, 1.5, 78, -58, -180, 180), 1.5, 0.68));
writeFileSync(`${out}/mid-dots.svg`, svg(rows(l50, 0.5, 78, -58, -180, 180), 0.5, 0.23));
// Fine boxes [lonLeft, lonRight, latTop, latBottom]; keep FINE_BOXES in DestinationsMap.astro in step (x = lon + 180, y = 78 - lat).
writeFileSync(`${out}/fine-dots.svg`, svg(rows(l10, 0.15, 50, -11, 70, 150) + rows(l10, 0.15, 72, 34, -25, 45), 0.15, 0.068));
