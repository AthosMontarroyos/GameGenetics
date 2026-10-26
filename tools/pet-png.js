'use strict';
const fs = require('node:fs');
const zlib = require('node:zlib');
function decode(file) {
  const png = fs.readFileSync(file), w = png.readUInt32BE(16), h = png.readUInt32BE(20);
  if (png[24] !== 8 || png[25] !== 6 || png[28] !== 0) throw new Error('Esperado PNG RGBA 8 bits: ' + file);
  const chunks = [];
  for (let i = 8; i < png.length;) { const n = png.readUInt32BE(i); if (png.toString('ascii', i + 4, i + 8) === 'IDAT') chunks.push(png.subarray(i + 8, i + 8 + n)); i += n + 12; }
  const raw = zlib.inflateSync(Buffer.concat(chunks)), stride = w * 4, pixels = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < stride; x++) {
    const f = raw[y * (stride + 1)], a = x >= 4 ? pixels[y * stride + x - 4] : 0, b = y ? pixels[(y - 1) * stride + x] : 0, c = y && x >= 4 ? pixels[(y - 1) * stride + x - 4] : 0;
    let v = raw[y * (stride + 1) + x + 1];
    if (f === 1) v += a;
    else if (f === 2) v += b;
    else if (f === 3) v += Math.floor((a + b) / 2);
    else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
    else if (f !== 0) throw new Error('Filtro PNG inválido');
    pixels[y * stride + x] = v & 255;
  }
  return { w, h, pixels };
}
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0); }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type), len = Buffer.alloc(4), crc = Buffer.alloc(4);
  len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([len, name, data, crc]);
}
function encode(file, grid, w, h, scale = 1) {
  const width = w * scale, height = h * scale, raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const c = grid[Math.floor(y / scale) * w + Math.floor(x / scale)]; if (!c) continue;
    const offset = y * (width * 4 + 1) + 1 + x * 4;
    raw[offset] = parseInt(c.slice(1, 3), 16); raw[offset + 1] = parseInt(c.slice(3, 5), 16); raw[offset + 2] = parseInt(c.slice(5, 7), 16); raw[offset + 3] = 255;
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
const palettes = {
  preto: ['#1b1b24', '#272732', '#3d3d4a', '#5a5a6e', '#f1e6d2'],
  cinza: ['#565a69', '#7b7f8e', '#9ca0ad', '#bec2cd', '#f4eadb'],
  marrom: ['#4a2c17', '#6b4024', '#8c5a34', '#ab774a', '#f1e1c6'],
  claro: ['#9c8454', '#cbb386', '#ead6ab', '#f8ecce', '#9a6a40']
};
function colors(color, eyes = 'azuis') {
  const p = palettes[color];
  return { '.': null, o: p[0], s: p[1], b: p[2], l: p[3], t: p[4], e: eyes === 'azuis' ? '#2f86ff' : '#35c768', p: '#101820', w: '#ffffff', i: '#e98ea0', n: '#c2566b', m: '#f4ead6' };
}
module.exports = { decode, encode, palettes, colors };
