'use strict';
// Monta as 192 combinações a partir das 30 artes aprovadas (output/characters).
// Troca de olhos, mancha e rabo é feita por diferença entre imagens alinhadas.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.join(__dirname, '..');
const SRC = path.join(root, 'output/characters');
const OUT = path.join(root, 'assets/animals/arte-v1');
const N = 1024, SIZE = 320;
const SP = { gato: 'cat', cachorro: 'dog', coelho: 'rabbit' };
const COLORS = ['preto', 'cinza', 'marrom', 'claro'];

function decode(file) {
  const png = fs.readFileSync(file), w = png.readUInt32BE(16), h = png.readUInt32BE(20), ct = png[25];
  if (png[24] !== 8 || png[28] !== 0 || (ct !== 2 && ct !== 6)) throw new Error('PNG não suportado: ' + file);
  const bpp = ct === 6 ? 4 : 3, chunks = [];
  for (let i = 8; i < png.length;) { const n = png.readUInt32BE(i); if (png.toString('ascii', i + 4, i + 8) === 'IDAT') chunks.push(png.subarray(i + 8, i + 8 + n)); i += n + 12; }
  const raw = zlib.inflateSync(Buffer.concat(chunks)), stride = w * bpp, px = Buffer.alloc(w * h * bpp);
  for (let y = 0; y < h; y++) for (let x = 0; x < stride; x++) {
    const f = raw[y * (stride + 1)], a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = y && x >= bpp ? px[(y - 1) * stride + x - bpp] : 0;
    let v = raw[y * (stride + 1) + x + 1];
    if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
    else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
    px[y * stride + x] = v & 255;
  }
  const rgb = new Uint8ClampedArray(w * h * 3);
  for (let i = 0; i < w * h; i++) { rgb[i * 3] = px[i * bpp]; rgb[i * 3 + 1] = px[i * bpp + 1]; rgb[i * 3 + 2] = px[i * bpp + 2]; }
  return { w, h, rgb };
}
function crc32(buf) { let c = 0xffffffff; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0); } return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const n = Buffer.from(type), l = Buffer.alloc(4), c = Buffer.alloc(4); l.writeUInt32BE(data.length); c.writeUInt32BE(crc32(Buffer.concat([n, data]))); return Buffer.concat([l, n, data, c]); }
function encodeRGBA(file, rgba, w, h) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
}

// Remove o magenta: alpha = 1 - magentaness; cor recuperada sem o magenta que vazou na borda.
function key(img) {
  const n = img.w * img.h, out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const r = img.rgb[i * 3], g = img.rgb[i * 3 + 1], b = img.rgb[i * 3 + 2];
    const m = Math.max(0, Math.min(r, b) - g), a = 1 - m / 255;
    if (a < 0.03) continue;
    out[i * 4] = (r - (1 - a) * 255) / a; out[i * 4 + 1] = g / a; out[i * 4 + 2] = (b - (1 - a) * 255) / a;
    out[i * 4 + 3] = a * 255;
  }
  return out;
}
const isBg = (img, i) => Math.min(img.rgb[i * 3], img.rgb[i * 3 + 2]) - img.rgb[i * 3 + 1] > 200;
const diff = (a, b, i) => Math.max(Math.abs(a.rgb[i * 3] - b.rgb[i * 3]), Math.abs(a.rgb[i * 3 + 1] - b.rgb[i * 3 + 1]), Math.abs(a.rgb[i * 3 + 2] - b.rgb[i * 3 + 2]));

function loadSpecies(s) {
  const b = SP[s], L = f => decode(path.join(SRC, f));
  const v = n => L(`variants/${s}-${n}.png`);
  const base = { marrom: { eretas: L(`${b}-brown-blue-1024.png`), caidas: v('marrom-caidas') } };
  for (const c of ['preto', 'cinza', 'claro']) base[c] = { eretas: v(`${c}-eretas`), caidas: v(`${c}-caidas`) };
  return { base, verdes: v('marrom-verdes'), manchado: v('marrom-manchado'), curto: v('marrom-curto') };
}

function compose(sp, color, eyes, ears, spots, tail) {
  const ref = sp.base.marrom.eretas, src = sp.base[color][ears], n = N * N;
  const rgb = Uint8ClampedArray.from(src.rgb), bg = new Uint8Array(n);
  for (let i = 0; i < n; i++) bg[i] = isBg(src, i) ? 1 : 0;
  if (eyes === 'verdes') for (let i = 0; i < n; i++) if (!isBg(ref, i) && diff(sp.verdes, ref, i) > 40) { for (let k = 0; k < 3; k++) rgb[i * 3 + k] = sp.verdes.rgb[i * 3 + k]; }
  if (spots === 'manchado') {
    const earMask = ears === 'caidas' ? i => diff(sp.base.marrom.caidas, ref, i) > 40 : () => false;
    for (let i = 0; i < n; i++) {
      if (isBg(ref, i) || diff(sp.manchado, ref, i) <= 40 || earMask(i)) continue;
      const from = color === 'claro' ? ref : sp.manchado;
      for (let k = 0; k < 3; k++) rgb[i * 3 + k] = from.rgb[i * 3 + k];
    }
  }
  if (tail === 'curto') for (let i = 0; i < n; i++) if (!isBg(ref, i) && isBg(sp.curto, i)) { bg[i] = 1; rgb[i * 3] = 255; rgb[i * 3 + 1] = 0; rgb[i * 3 + 2] = 255; }
  for (let i = 0; i < n; i++) if (bg[i]) { rgb[i * 3] = 255; rgb[i * 3 + 1] = 0; rgb[i * 3 + 2] = 255; }
  return { w: N, h: N, rgb };
}

function bbox(rgba) {
  let x0 = N, y0 = N, x1 = 0, y1 = 0;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (rgba[(y * N + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}
// Redução por média de área em alfa pré-multiplicado.
function crop(rgba, cx, cy, size) {
  const out = new Uint8ClampedArray(SIZE * SIZE * 4), k = size / SIZE;
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const xa = cx + x * k, xb = xa + k, ya = cy + y * k, yb = ya + k;
    let r = 0, g = 0, b = 0, a = 0, w = 0;
    for (let yy = Math.floor(ya); yy < Math.ceil(yb); yy++) for (let xx = Math.floor(xa); xx < Math.ceil(xb); xx++) {
      if (xx < 0 || yy < 0 || xx >= N || yy >= N) { w += 0; continue; }
      const wx = Math.min(xx + 1, xb) - Math.max(xx, xa), wy = Math.min(yy + 1, yb) - Math.max(yy, ya), ww = wx * wy, p = (yy * N + xx) * 4, al = rgba[p + 3] / 255;
      r += rgba[p] * al * ww; g += rgba[p + 1] * al * ww; b += rgba[p + 2] * al * ww; a += al * ww; w += ww;
    }
    const o = (y * SIZE + x) * 4, aa = w ? a / (k * k) : 0;
    if (a > 0) { out[o] = r / a; out[o + 1] = g / a; out[o + 2] = b / a; }
    out[o + 3] = Math.min(1, aa) * 255;
  }
  return out;
}

fs.mkdirSync(OUT, { recursive: true });
const species = Object.fromEntries(Object.keys(SP).map(s => [s, loadSpecies(s)]));
// Quadro comum: une as silhuetas de todos os bichos para manter as proporções entre espécies.
let u = [N, N, 0, 0];
for (const s of Object.keys(SP)) for (const img of [species[s].base.marrom.eretas, species[s].base.marrom.caidas, species[s].curto]) {
  const bb = bbox(key(img)); u = [Math.min(u[0], bb[0]), Math.min(u[1], bb[1]), Math.max(u[2], bb[2]), Math.max(u[3], bb[3])];
}
const pad = 12, side = Math.max(u[2] - u[0], u[3] - u[1]) + pad * 2;
const cx = Math.round((u[0] + u[2]) / 2 - side / 2), cy = Math.round((u[1] + u[3]) / 2 - side / 2);
let count = 0;
const manifest = [];
for (const s of Object.keys(SP)) for (const c of COLORS) for (const e of ['azuis', 'verdes']) for (const a of ['eretas', 'caidas'])
  for (const m of ['liso', 'manchado']) for (const t of ['longo', 'curto']) {
    const file = [s, c, e, a, m, t].join('-') + '.png';
    encodeRGBA(path.join(OUT, file), crop(key(compose(species[s], c, e, a, m, t)), cx, cy, side), SIZE, SIZE);
    manifest.push(file); count++;
  }
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ size: SIZE, crop: { x: cx, y: cy, side }, files: manifest }, null, 2) + '\n');
console.log(count + ' PNGs ' + SIZE + 'x' + SIZE + ' em ' + path.relative(root, OUT) + '; recorte ' + [cx, cy, side]);
