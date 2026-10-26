'use strict';
// Compõe recortes indexados das referências v1. Nenhum corpo/cabeça por primitivas.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { encode, decode, palettes, colors } = require('./pet-png');
const N = 64, root = path.join(__dirname, '..');
const out = path.join(root, 'assets/animals/padrao-64-v2');
const layerRoot = path.join(root, 'assets/animals/camadas-v1');
const speciesList = ['gato','cachorro','coelho'];
const art = Object.fromEntries(speciesList.map(s => {
  const data = JSON.parse(fs.readFileSync(path.join(layerRoot, s + '.json'), 'utf8'));
  for (const rows of Object.values(data.layers)) {
    assert.equal(rows.length, N);
    assert(rows.every(row => row.length === N && /^[.osblepwinmt]+$/.test(row)), 'Camada inválida');
  }
  data.layers = Object.fromEntries(Object.entries(data.layers).map(([k,v]) => [k, v.join('').split('')]));
  return [s, data];
}));
function overlay(g, layer) { layer.forEach((v,i) => { if (v !== '.') g[i] = v; }); }
function build(s,c,e,a,m,t) {
  const layers = art[s].layers, g = new Array(N*N).fill('.');
  overlay(g, layers[t === 'longo' ? 'tailLong' : 'tailShort']);
  overlay(g, layers.body);
  overlay(g, layers[a === 'eretas' ? 'earsErect' : 'earsFallen']);
  if (m === 'manchado') {
    const [ex,ey,cx,cy] = s === 'gato' ? [22,29,31,47] : s === 'cachorro' ? [24,28,31,48] : [27,36,31,50];
    // Apenas a máscara de pigmentação é procedural. Preserva rosto e contorno.
    for (let y=0;y<N;y++) for (let x=0;x<N;x++) {
      const face = ((x-ex)/6)**2 + ((y-ey)/7)**2 <= 1;
      const chest = ((x-cx)/5)**2 + ((y-cy)/4)**2 <= 1;
      const v = g[y*N+x];
      const inner = v === 'o' && [[1,0],[-1,0],[0,1],[0,-1]].every(([dx,dy]) => g[(y+dy)*N+x+dx] !== '.');
      if ((face || chest) && (['s','b','l'].includes(v) || inner)) g[y*N+x] = 't';
    }
  }
  overlay(g, layers.eyes);
  const palette = colors(c,e);
  return g.map(v => palette[v]);
}
function filename(s,c,e,a,m,t) { return [s,c,e,a,m,t].join('-')+'.png'; }
function assertConnected(grid, file) {
  const start=grid.findIndex(Boolean), seen=new Set([start]), queue=[start];
  assert(start>=0,'Sprite vazio: '+file);
  while(queue.length) {
    const i=queue.pop(), x=i%N, y=Math.floor(i/N);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) {
      const nx=x+dx, ny=y+dy, j=ny*N+nx;
      if(nx>=0&&nx<N&&ny>=0&&ny<N&&grid[j]&&!seen.has(j)){seen.add(j);queue.push(j);}
    }
  }
  assert.equal(seen.size,grid.filter(Boolean).length,'Pixels ou rabo desconectados: '+file);
}
function sheet(file, choices, columns) {
  const rows = Math.ceil(choices.length / columns), width = columns*N, height = rows*N, g = new Array(width*height).fill('#eee9df');
  choices.forEach((args,i) => {
    const grid=build(...args), ox=(i%columns)*N, oy=Math.floor(i/columns)*N;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(grid[y*N+x])g[(oy+y)*width+ox+x]=grid[y*N+x];
  });
  encode(path.join(out,file),g,width,height,4);
}
fs.mkdirSync(out,{recursive:true});
const manifest=[];
for(const s of speciesList)for(const c of Object.keys(palettes))
  for(const e of ['azuis','verdes'])for(const a of ['eretas','caidas'])
    for(const m of ['liso','manchado'])for(const t of ['longo','curto']) {
      const grid=build(s,c,e,a,m,t), allowed=new Set(Object.values(colors(c,e)));
      assert(grid.every(v=>allowed.has(v)), 'Cor fora da paleta');
      for(let i=0;i<N;i++)assert(!grid[i]&&!grid[63*N+i]&&!grid[i*N]&&!grid[i*N+63], 'Margem cortada');
      const file=filename(s,c,e,a,m,t);assertConnected(grid,file);encode(path.join(out,file),grid,N,N);
      const decoded=decode(path.join(out,file));assert.equal(decoded.w,64);assert.equal(decoded.h,64);
      for(let i=3;i<decoded.pixels.length;i+=4)assert([0,255].includes(decoded.pixels[i]),'Alpha parcial');
      manifest.push({file,species:s,color:c,eyes:e,ears:a,spots:m,tail:t});
    }
// Contratos de composição: cada característica altera somente sua máscara.
for(const s of speciesList)for(const a of ['eretas','caidas'])for(const t of ['longo','curto']) {
  const base=build(s,'marrom','azuis',a,'liso',t);
  const eyeVariant=build(s,'marrom','verdes',a,'liso',t);
  let changes=0;
  base.forEach((v,i)=>{if(v!==eyeVariant[i]){changes++;assert.equal(v,'#2f86ff');assert.equal(eyeVariant[i],'#35c768');}});
  assert(changes>10,'Íris ausente');
  assert(base.filter(v=>v==='#101820').length>=4,'Pupilas ausentes');
  assert(base.filter(v=>v==='#ffffff').length>=2,'Brilhos ausentes');
  for(const c of Object.keys(palettes))assert.deepEqual(build(s,c,'verdes',a,'manchado',t).map(Boolean),base.map(Boolean));
  const spotted=build(s,'marrom','azuis',a,'manchado',t);
  assert(spotted.some((v,i)=>v!==base[i]),'Manchas ausentes');
  spotted.forEach((v,i)=>{if(v!==base[i]){assert.equal(v,palettes.marrom[4]);assert(palettes.marrom.slice(0,4).includes(base[i]));}});
}
for(const s of speciesList)for(const trait of ['ears','tail']) {
  const base=build(s,'marrom','azuis','eretas','liso','longo');
  const variant=build(s,'marrom','azuis',trait==='ears'?'caidas':'eretas','liso',trait==='tail'?'curto':'longo');
  const layers=art[s].layers, mask=trait==='ears'?['earsErect','earsFallen']:['tailLong','tailShort'];
  base.forEach((v,i)=>{if(mask.every(k=>layers[k][i]==='.'))assert.equal(v,variant[i],`${trait} alterou outra camada`);});
}
const choices=[];
for(const s of speciesList)for(const c of ['marrom','preto'])for(const [a,m] of [['eretas','liso'],['caidas','liso'],['caidas','manchado']])choices.push([s,c,'azuis',a,m,'longo']);
sheet('comparacao-4x.png',choices,6);
fs.copyFileSync(path.join(out,'comparacao-4x.png'),path.join(out,'comparacao-fonte-v1-4x.png'));
const allColors=[];
for(const s of speciesList)for(const c of ['marrom','preto','cinza','claro'])for(const t of ['longo','curto'])allColors.push([s,c,'verdes','caidas','liso',t]);
sheet('cores-rabos-4x.png',allColors,8);
for(const s of speciesList)for(const [name,layer]of Object.entries(art[s].layers))encode(path.join(layerRoot,`${s}-${name}.png`),layer.map(v=>colors('marrom')[v]),N,N);
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({size:64,source:'camadas-v1',palettes,layers:speciesList.map(s=>({species:s,file:`../camadas-v1/${s}.json`,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(layerRoot,s+'.json'))).digest('hex')})),sprites:manifest},null,2)+'\n');
console.log(`${manifest.length} PNGs 64×64. Paleta, alpha, margens, pupilas, brilhos e independência das cinco características verificados.`);
