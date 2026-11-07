// Image lines in post files: "path | alt text [| focus=0.5,0.4] [| zoom=1.3] [| caption]".
//   focus = where the subject is, as x,y from 0 to 1 (0,0 top-left · 0.5,0.5 centre). The 3:2 crop on the site centres there.
//   zoom  = how much to crop in around the focus (1 = whole photo, 1.5 = the middle two thirds), for a dish that is small in the frame.
// Both end up as Sanity's crop + hotspot, so the Boss can still fine-tune them in Studio (click the photo → crop tool).
export function parseImageSpec(spec) {
  const parts = String(spec ?? '').split('|').map((s) => s.trim());
  const [path, alt = ''] = parts;
  let focus, zoom, caption;
  for (const p of parts.slice(2)) {
    const f = /^focus\s*=\s*([\d.]+)\s*,\s*([\d.]+)$/i.exec(p), z = /^zoom\s*=\s*([\d.]+)$/i.exec(p);
    if (f) focus = [Math.min(1, Math.max(0, +f[1])), Math.min(1, Math.max(0, +f[2]))];
    else if (z) zoom = Math.min(4, Math.max(1, +z[1]));
    else if (p) caption = p;
  }
  return { path, alt, focus, zoom, caption };
}

/** Sanity crop (fractions cut from each side) + hotspot for a focus point and a zoom. */
export function cropAndHotspot(focus, zoom) {
  if (!focus && !zoom) return {};
  const [fx, fy] = focus || [0.5, 0.5], s = 1 / (zoom || 1);
  const left = Math.min(Math.max(fx - s / 2, 0), 1 - s), top = Math.min(Math.max(fy - s / 2, 0), 1 - s);
  const r = (n) => +n.toFixed(4);
  return {
    ...(zoom && zoom > 1 ? { crop: { _type: 'sanity.imageCrop', left: r(left), top: r(top), right: r(1 - left - s), bottom: r(1 - top - s) } } : {}),
    hotspot: { _type: 'sanity.imageHotspot', x: r(fx), y: r(fy), width: r(Math.min(s, 0.5)), height: r(Math.min(s, 0.5)) },
  };
}

/** The 3:2 window the site shows, in pixels of the original (same rule as Sanity's crop + hotspot). */
export function siteWindow(w, h, focus, zoom, ratio = 1.5) {
  const c = cropAndHotspot(focus, zoom);
  const cl = (c.crop?.left || 0) * w, ct = (c.crop?.top || 0) * h, cw = w - cl - (c.crop?.right || 0) * w, ch = h - ct - (c.crop?.bottom || 0) * h;
  let ww = cw, wh = cw / ratio;
  if (wh > ch) { wh = ch; ww = ch * ratio; }
  const cx = (focus ? focus[0] : 0.5) * w, cy = (focus ? focus[1] : 0.5) * h;
  const x = Math.min(Math.max(cx - ww / 2, cl), cl + cw - ww), y = Math.min(Math.max(cy - wh / 2, ct), ct + ch - wh);
  return { left: Math.round(x), top: Math.round(y), width: Math.round(ww), height: Math.round(wh) };
}

/** Back from Sanity to the file: ["focus=x,y", "zoom=z"] (empty when the photo has no crop or hotspot). */
export function fitOf(im) {
  const out = [], h = im?.hotspot, c = im?.crop;
  const r = (n) => +(+n).toFixed(2);
  if (h && (Math.abs(h.x - 0.5) > 0.005 || Math.abs(h.y - 0.5) > 0.005)) out.push(`focus=${r(h.x)},${r(h.y)}`);
  if (c) { const s = Math.max(1 - c.left - c.right, 1 - c.top - c.bottom); if (s < 0.99) { if (!out.length && h) out.push(`focus=${r(h.x)},${r(h.y)}`); out.push(`zoom=${r(1 / s)}`); } }
  return out;
}
