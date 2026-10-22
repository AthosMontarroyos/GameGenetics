// Gera js/occluders.js: máscara exata (RLE) de cada oclusor retangular de js/main.js.
// Os objetos do cenário têm contorno escuro fechado; o que se alcança de fora do retângulo sem
// atravessar o contorno é chão e fica transparente. Uso: node tools/build-occluders.js
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const root = path.join(__dirname, '..');
const png = fs.readFileSync(path.join(root, 'assets/scenery/pet-shop.png'));
const W = png.readUInt32BE(16);
const H = png.readUInt32BE(20);
if (png[24] !== 8 || png[25] !== 2 || png[28] !== 0) throw new Error('Esperado PNG RGB 8 bits sem entrelaçamento.');

const idat = [];
for (let p = 8; p < png.length;) {
  const len = png.readUInt32BE(p);
  if (png.toString('latin1', p + 4, p + 8) === 'IDAT') idat.push(png.subarray(p + 8, p + 8 + len));
  p += 12 + len;
}
const raw = zlib.inflateSync(Buffer.concat(idat));
const stride = W * 3;
const pix = Buffer.alloc(H * stride);
for (let y = 0; y < H; y += 1) {
  const filter = raw[y * (stride + 1)];
  const src = y * (stride + 1) + 1;
  for (let x = 0; x < stride; x += 1) {
    const a = x >= 3 ? pix[y * stride + x - 3] : 0;
    const b = y ? pix[(y - 1) * stride + x] : 0;
    const c = x >= 3 && y ? pix[(y - 1) * stride + x - 3] : 0;
    let v = raw[src + x];
    if (filter === 1) v += a;
    else if (filter === 2) v += b;
    else if (filter === 3) v += (a + b) >> 1;
    else if (filter === 4) {
      const pp = a + b - c;
      const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
      v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    }
    pix[y * stride + x] = v & 255;
  }
}
const isDark = (x, y) => Math.max(pix[y * stride + x * 3], pix[y * stride + x * 3 + 1], pix[y * stride + x * 3 + 2]) < 90;

const src = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
const list = eval(src.match(/objects: \[([\s\S]*?)\n    \],/)[1].replace(/\/\/.*$/gm, '').replace(/^/, '[') + ']');

const out = {};
let skipped = 0;
list.forEach((o) => {
  const simple = Array.isArray(o);
  const shapes = simple ? [[o[0], o[1], o[2], o[3]]] : o.occ;
  shapes.forEach((s) => {
    if (s[0] === 'e') return;
    const PAD = 6; // igual ao PAD de js/main.js
    const x0 = Math.max(0, s[0] - PAD), y0 = Math.max(0, s[1] - PAD);
    const x1 = Math.min(W, s[0] + s[2] + PAD), y1 = Math.min(H, s[1] + s[3] + PAD);
    const w = x1 - x0, h = y1 - y0;
    const bg = new Uint8Array(w * h);
    const stack = [];
    const seed = (x, y) => { if (!bg[y * w + x] && !isDark(x0 + x, y0 + y)) { bg[y * w + x] = 1; stack.push(y * w + x); } };
    for (let x = 0; x < w; x += 1) { seed(x, 0); seed(x, h - 1); }
    for (let y = 0; y < h; y += 1) { seed(0, y); seed(w - 1, y); }
    while (stack.length) {
      const p = stack.pop();
      const x = p % w, y = (p / w) | 0;
      if (x > 0) seed(x - 1, y);
      if (x < w - 1) seed(x + 1, y);
      if (y > 0) seed(x, y - 1);
      if (y < h - 1) seed(x, y + 1);
    }
    let n = 0;
    for (let i = 0; i < bg.length; i += 1) n += bg[i];
    if (n > 0.92 * w * h) { skipped += 1; console.log('sem máscara (contorno aberto):', s.join(',')); return; }
    const runs = [];
    let cur = 1, len = 0; // começa contando fundo
    for (let i = 0; i < bg.length; i += 1) {
      if (bg[i] === cur) len += 1;
      else { runs.push(len); cur = bg[i]; len = 1; }
    }
    runs.push(len);
    out[s.join(',')] = runs.join(',');
  });
});

fs.writeFileSync(path.join(root, 'js/occluders.js'),
  '// Gerado por tools/build-occluders.js. Não edite à mão.\nwindow.PetOccluders = ' + JSON.stringify(out) + ';\n');
console.log('máscaras:', Object.keys(out).length, 'sem máscara:', skipped);
