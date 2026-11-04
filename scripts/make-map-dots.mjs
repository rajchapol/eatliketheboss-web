#!/usr/bin/env node
// One-off: rebuild the dotted maps in public/img/map/ from Natural Earth land (public domain, via world-atlas).
// Not part of the build. Run in an empty folder:
//   npm i world-atlas@2 topojson-client@3 d3-geo@3 && node /path/to/scripts/make-map-dots.mjs <out-dir>
// viewBox is in degrees: x = lon + 180 (0..360), y = 78 - lat (0..136 = 78°N … 58°S). Pins use the same maths.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
// Packages are looked up in the folder you run this from (not in the repo).
const req = createRequire(process.cwd() + '/');
const { feature } = await import(pathToFileURL(req.resolve('topojson-client')).href);
const { geoContains } = await import(pathToFileURL(req.resolve('d3-geo')).href);
const out = process.argv[2] || '.';
const topo = JSON.parse(readFileSync(req.resolve('world-atlas/land-50m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);
function dots(step, latTop, latBottom, lonLeft, lonRight) {
  const d = [];
  for (let lat = latTop - step / 2; lat > latBottom; lat -= step)
    for (let lon = lonLeft + step / 2; lon < lonRight; lon += step)
      if (geoContains(land, [lon, lat])) d.push(`M${+(lon + 180).toFixed(2)} ${+(78 - lat).toFixed(2)}h0`);
  return d.join('');
}
const svg = (d, w) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 136" width="360" height="136"><path d="${d}" fill="none" stroke="#d4b372" stroke-width="${w}" stroke-linecap="round"/></svg>`;
writeFileSync(`${out}/world-dots.svg`, svg(dots(1.5, 78, -58, -180, 180), '.95')); // whole world, 1.5° grid
writeFileSync(`${out}/sea-dots.svg`, svg(dots(0.5, 36, -6, 76, 138), '.32')); // Southeast Asia, 0.5° grid (Thailand zoom)
