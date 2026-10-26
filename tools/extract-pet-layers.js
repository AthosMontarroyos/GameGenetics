'use strict';
// Preparação da arte: amostra os PNGs v1 e extrai recortes indexados editáveis.
// As máscaras selecionam pixels da referência; não desenham corpos ou cabeças.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { decode, encode, colors, palettes } = require('./pet-png');
const N = 64, root = path.join(__dirname, '..');
const refs = path.join(root, 'assets/animals/referencias-padrao-visual');
const out = path.join(root, 'assets/animals/camadas-v1');
fs.mkdirSync(out, { recursive: true });
const empty = () => new Array(N * N).fill('.');
const get = (g, x, y) => x < 0 || y < 0 || x >= N || y >= N ? '.' : g[y * N + x];
function select(g, test) { return g.map((v, i) => test(i % N, Math.floor(i / N), v) ? v : '.'); }
function overlay(g, layer) { layer.forEach((v, i) => { if (v !== '.') g[i] = v; }); return g; }
const furRGB = palettes.marrom.slice(0, 4).map(v => [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16)));
function role(r, g, b, x, y, species) {
  // Regiões dos olhos são medidas nas referências, na grade final.
  const boxes = species === 'gato' ? [[17,24,27,35],[37,24,46,35]] : species === 'cachorro' ? [[19,23,28,33],[35,23,44,33]] : [[23,33,30,40],[34,33,40,40]];
  const inEye = boxes.some(([x0,y0,x1,y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
  if (inEye) {
    if (r > 215 && g > 215 && b > 215) return 'w';
    if (b > r * 1.4 && b > g * 1.12 && b > 80) return 'e';
    if (r < 45 && g < 55 && b < 65 && b >= r * .8) return 'p';
  }
  if (r > 110 && r > g * 1.2 && b > g * .86 && b > r * .48) return y >= 30 && x >= 28 && x <= 34 ? 'n' : 'i';
  if (r > 185 && g > 155 && b > 115 && g / r > .78) return 'm';
  let best = 0, distance = Infinity;
  furRGB.forEach((rgb, i) => { const d = (r-rgb[0])**2 + (g-rgb[1])**2 + (b-rgb[2])**2; if (d < distance) { distance = d; best = i; } });
  return ['o','s','b','l'][best];
}
function reduce(file, species) {
  const { w, h, pixels } = decode(path.join(refs, file)), grid = empty();
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const votes = new Map(); let opaque = 0;
    // Voto de área na célula, seguido de quantização; sem pixels parcialmente opacos.
    for (let sy = 0; sy < 9; sy++) for (let sx = 0; sx < 9; sx++) {
      const px = Math.floor((x + (sx + .5) / 9) * w / N), py = Math.floor((y + (sy + .5) / 9) * h / N), i = (py * w + px) * 4;
      if (pixels[i + 3] < 128) continue;
      opaque++; const v = role(pixels[i], pixels[i+1], pixels[i+2], x, y, species); votes.set(v, (votes.get(v) || 0) + 1);
    }
    if (opaque >= 41) grid[y * N + x] = [...votes].sort((a,b) => b[1]-a[1])[0][0];
  }
  return grid;
}
function serialize(g) { return Array.from({ length: N }, (_, y) => g.slice(y * N, (y + 1) * N).join('')); }
function savePreview(name, grid) { const palette = colors('marrom'); encode(path.join(out, name + '.png'), grid.map(v => palette[v]), 64, 64, 4); }
function transform(g, ax, ay, bx, by, angle, scale = 1) {
  const result = empty(), c = Math.cos(angle), s = Math.sin(angle);
  // Amostragem inversa mais próxima: nenhuma interpolação ou criação de formas.
  for (let y = 1; y < 63; y++) for (let x = 1; x < 63; x++) {
    const dx = (x - bx) / scale, dy = (y - by) / scale;
    const sx = Math.round(ax + c * dx + s * dy), sy = Math.round(ay - s * dx + c * dy);
    result[y * N + x] = get(g, sx, sy);
  }
  return result;
}
function strip(g, layer) { layer.forEach((v, i) => { if (v !== '.') g[i] = '.'; }); }
function fillEarRoot(base, source, species) {
  // Completa apenas os trechos da testa antes cobertos pelas orelhas.
  // Cada linha copia tons da testa original, sem substituir a face por primitivas.
  const spans = species === 'gato' ? [[14,20,43],[15,17,46],[16,15,48],[17,14,49],[18,13,50],[19,12,51],[20,12,51],[21,11,52],[22,11,52]] :
    species === 'cachorro' ? [[13,27,36],[14,24,39],[15,22,41],[16,20,43],[17,19,44],[18,18,45],[19,17,46],[20,16,47],[21,15,48],[22,15,48]] : [];
  for (const [y, x0, x1] of spans) for (let x = x0; x <= x1; x++) {
    const i = y * N + x;
    if (base[i] === '.' || base[i] === 'i') base[i] = x === x0 || x === x1 ? 'o' : get(source, Math.max(28, Math.min(35,x)), y) === 'l' ? 'l' : 'b';
  }
}
for (const species of ['gato','cachorro','coelho']) {
  const file = `${species}-marrom-azul-v1.png`, source = reduce(file, species);
  // Creme indevido em peito/patas: recolore mantendo as divisões escuras dos dedos.
  const chestY = species === 'gato' ? 42 : 46;
  source.forEach((v,i) => { if (v === 'm' && Math.floor(i/N) >= chestY) source[i] = 'b'; });
  savePreview(species + '-reduzido', source);
  const ears = select(source, (x,y) => species === 'gato' ? (y < 23 && (x < 24 || x > 40)) : species === 'cachorro' ? (y < 23 && (x < 26 || x > 37)) : (y < 28 && (x < 29 || x > 34)));
  const tail = select(source, (x,y) => species === 'gato' ? (y >= 39 && x >= (y < 51 ? 48 : 44)) : species === 'cachorro' ? (y >= 35 && x >= (y < 48 ? 49 : 46)) : (y >= 44 && x >= 43));
  const base = source.slice(); strip(base, ears); strip(base, tail); fillEarRoot(base, source, species);
  // Olhos preservam desenho, pupilas e brilhos da referência. Só a íris troca de cor.
  let eyes = select(base, (x,y,v) => ['e','p','w'].includes(v)); strip(base, eyes);
  if (species === 'coelho') eyes = overlay(transform(select(eyes,x=>x<32),27,36,27,36,0,1.35),transform(select(eyes,x=>x>=32),37,36,37,36,0,1.35));
  // Um brilho legível por olho, mesmo quando a amostra de área perde o ponto branco.
  const centers = species === 'gato' ? [[22,29],[41,29]] : species === 'cachorro' ? [[24,28],[39,28]] : [[27,36],[37,36]];
  for (const [cx,cy] of centers) {
    const pixels=[];
    for(let y=cy-5;y<=cy+4;y++)for(let x=cx-4;x<=cx+4;x++)if(['e','p','w'].includes(get(eyes,x,y)))pixels.push([x,y]);
    if (!pixels.length) throw new Error('Olho não encontrado: '+species);
    // Usa o brilho existente; só restaura um pixel se o detalhe se perdeu na redução.
    if (!pixels.some(([x,y])=>eyes[y*N+x]==='w')) {
      const [x,y]=pixels.sort((a,b)=>(a[0]-(cx-1))**2+(a[1]-(cy-2))**2-((b[0]-(cx-1))**2+(b[1]-(cy-2))**2))[0];
      eyes[y*N+x]='w';
    }
  }
  // O fundo dos olhos evita buracos de transparência durante a composição.
  eyes.forEach((v,i) => { if (v !== '.') base[i] = 'b'; });
  let fallen = empty(), upright = ears;
  if (species === 'cachorro') {
    const floppy = reduce('cachorro-orelhas-caidas-v1-edit.png', species);
    fallen = select(floppy, (x,y) => y >= 13 && y <= 39 && (x <= 18 + Math.max(0,20-y)*.6 || x >= 44 - Math.max(0,20-y)*.6));
    // Pontas eretas menores e dobradas: recortes da mesma orelha, encurtados.
    const left = select(ears, x => x < 32), right = select(ears, x => x >= 32);
    upright = overlay(transform(left, 22,21,21,21,-.20,.78), transform(right, 41,21,42,21,.20,.78));
  } else if (species === 'gato') {
    fallen = overlay(transform(select(ears,x=>x<32),20,20,17,19,-1.05,.72), transform(select(ears,x=>x>=32),44,20,47,19,1.05,.72));
  } else {
    const floppy = reduce('coelho-orelhas-caidas-v1-edit.png', species);
    fallen = select(floppy, (x,y) => y >= 27 && y <= 49 && (x <= 25 - Math.max(0,y-28)*.32 || x >= 39 + Math.max(0,y-28)*.32));
    // A testa antes escondida pela raiz vem da edição da mesma referência.
    for(let y=0;y<29;y++)for(let x=0;x<N;x++)base[y*N+x]='.';
    for(let y=25;y<32;y++)for(let x=24;x<=39;x++)base[y*N+x]=floppy[y*N+x];
  }
  // O toco/pompom curto é um recorte reduzido do próprio rabo longo, junto à raiz.
  const anchor = species === 'gato' ? [44,55] : species === 'cachorro' ? [46,52] : [43,54];
  const short = transform(tail, anchor[0],anchor[1],anchor[0],anchor[1],0,species==='coelho'?.65:.38);
  const layers = { body: base, earsErect: upright, earsFallen: fallen, tailLong: tail, tailShort: short, eyes };
  const data = { size:64, species, source:file, sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(refs,file))).digest('hex'), tailAnchor:anchor, layers:Object.fromEntries(Object.entries(layers).map(([k,v])=>[k,serialize(v)])) };
  fs.writeFileSync(path.join(out,species+'.json'), JSON.stringify(data,null,2)+'\n');
}
console.log('Camadas extraídas das referências v1 em assets/animals/camadas-v1.');
