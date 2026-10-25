'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={};vm.createContext(context);
for(const file of ['js/genetics.js','js/catalog.js','js/orders.js','js/customers.js','js/client-frames.js','js/assets.js','js/breeding.js'])new vm.Script(fs.readFileSync(file,'utf8'),{filename:file}).runInContext(context);
for(const file of ['js/assets.js','js/main.js','js/sprites.js','js/world-engine.js'])new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
const {PetGenetics:g,PetCatalog:c,PetOrders:d}=context;
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);
const pairs=['AA','Aa','aa'];
const expected=[[1,0,0],[.5,.5,0],[0,1,0],[.5,.5,0],[.25,.5,.25],[0,.5,.5],[0,1,0],[0,.5,.5],[0,0,1]];
let index=0;
for(const a of pairs)for(const b of pairs){const result=g.cross(a,b);[result.genotypes.AA,result.genotypes.Aa,result.genotypes.aa].forEach((v,i)=>close(v,expected[index][i]));index++;}
assert.equal(g.normalizeGenotype('aA'),'Aa');
for(const invalid of ['AB','AAA','',null])assert.throws(()=>g.cross(invalid,'Aa'));
assert.throws(()=>g.crossLoci({A:'Aa',B:'XX'},{A:'Aa',B:'Bb'},['A','B'],x=>x.A));
const dihybrid=g.crossLoci({A:'Aa',B:'Bb'},{A:'Aa',B:'Bb'},['A','B'],x=>c.classify('cachorro',x));
for(const [key,value]of Object.entries({marrom:.5625,preto:.1875,cinza:.1875,claro:.0625}))close(dihybrid.phenotypes[key],value);
assert.equal(d.orders.length,12);assert.equal(c.individuals.length,48);
for(const spec of Object.values(c.species)){
  assert.equal(spec.variants.length,64);assert.equal(new Set(spec.variants.map(v=>v.id)).size,64);
  assert.equal(new Set(spec.variants.map(v=>v.recipe.code)).size,64);
  for(const variant of spec.variants){
    assert.equal(c.combination(spec.id,variant.traits).code,variant.recipe.code);
    const suggested=c.suggestCross(spec.id,variant.traits);
    if(suggested){
      assert.notEqual(suggested.parents[0],suggested.parents[1]);
      const parents=suggested.parents.map(id=>c.individuals.find(a=>a.id===id));
      close(c.chanceFor(c.cross(spec.id,parents[0].genotype,parents[1].genotype),variant.traits),suggested.chance);
    }
  }
  assert.equal(spec.traits.length,5);assert.equal(spec.loci.length,6);
  assert.ok(fs.existsSync('assets/animals/familias-anime.png'));
  const animals=c.individuals.filter(a=>a.speciesId===spec.id);assert.equal(animals.length,16);
  for(const trait of spec.traits)for(const value of trait.values)assert.ok(animals.some(a=>a.traits[trait.id]===value),`${spec.id}/${trait.id}/${value}: ausente no plantel`);
  for(const animal of animals){assert.equal(c.visualFor(spec.id,c.traitsFor(spec.id,animal.genotype)),animal.visualId);assert.equal(Object.keys(animal.genotype).length,6);}
  const hybrid=animals[1].genotype;
  const result=c.cross(spec.id,hybrid,hybrid);
  close(Object.values(result.appearances).reduce((a,b)=>a+b,0),1);
  assert.equal(Object.keys(result.appearances).length,64);
  assert.equal(Object.keys(result.genotypes).length,729);
  assert.equal(result.grid.length,64);assert.equal(result.grid[0].cells.length,64);
  assert.equal(result.traitCrosses.length,5);
  assert.ok(result.traitCrosses.every(x=>x.result.grid.length<=4&&x.result.grid[0].cells.length<=4));
  for(const trait of spec.traits)close(Object.values(result.traitProbabilities[trait.id]).reduce((a,b)=>a+b,0),1);
  close(result.traitProbabilities.eyes.verdes,.25);close(result.traitProbabilities.ears[spec.ears[1]],.25);close(result.traitProbabilities.spots.liso,.25);close(result.traitProbabilities.tail.curto,.25);
  close(c.chanceFor(result,{color:spec.colors[3],eyes:'verdes',ears:spec.ears[1],spots:'liso',tail:'curto'}),1/4096);
  const pure=c.cross(spec.id,animals[8].genotype,animals[9].genotype);assert.equal(Object.keys(pure.appearances).length,1);close(c.chanceFor(pure,animals[8].traits),1);
  for(const [gene,trait,value]of [['E','eyes','verdes'],['O','ears',spec.ears[1]],['M','spots','liso'],['T','tail','curto']]){
    const a={...animals[0].genotype},b={...a};a[gene]=gene+gene.toLowerCase();b[gene]=gene.toLowerCase().repeat(2);
    const one=c.cross(spec.id,a,b);close(one.traitProbabilities[trait][value],.5);
    for(const other of spec.traits)if(other.id!==trait)assert.equal(Object.keys(one.traitProbabilities[other.id]).length,1,`${gene} mudou outro traço`);
  }
}
// ---- Pedidos em linguagem natural e cruzamento com genes escondidos ----
const B=context.PetBreeding;
assert.equal(d.levels.length,3);for(const level of d.levels)assert.equal(level.orders.length,4);
assert.equal(d.orders.length,12);
for(const order of d.orders){assert.ok(!/%|chance|gene/i.test(order.speech),'o pedido não deve citar chance nem genes: '+order.speech);assert.ok(Object.keys(order.targets).length>=1);}
assert.equal(d.orders[0].speech,'Oi! Quero um gatinho cinza.');
assert.equal(d.speechFor({open:'Quero'},'cachorro',{eyes:'verdes',tail:'curto'}),'Quero um cachorrinho de olhos verdes e rabo curto.');
for(const level of d.levels){
  const game=B.create(level.id,level.orders,3);
  assert.equal(game.roster.length,16,'os pais vêm do catálogo');assert.equal(game.plans.length,4);
  level.orders.forEach((order,index)=>{
    assert.ok(game.plans[index].chance>0,'há pais que geram: '+order.speech);
    assert.ok(game.plans[index].par>=2&&game.plans[index].par<=8);
  });
}
{
  const game=B.create('gato',d.levels[0].orders,11),first=game.roster[0],second=game.roster[1];
  const result=B.cross(game,first.id,second.id);
  assert.equal(result.ok,true);assert.equal(game.journal.length,1);assert.equal(game.pupCount,1);
  g.normalizeLoci(result.pup.genotype,c.species.gato.loci);
  assert.equal(JSON.stringify(result.pup.traits),JSON.stringify(c.traitsFor('gato',result.pup.genotype)));
  assert.equal(JSON.stringify(result.pup.parents),JSON.stringify([first.id,second.id]));
  assert.equal(B.cross(game,first.id,first.id).ok,false);assert.equal(B.cross(game,first.id,'inexistente').ok,false);
  assert.equal(B.stars(2,{par:3}),3);assert.equal(B.stars(5,{par:3}),2);assert.equal(B.stars(9,{par:3}),1);
}
{ // as regras de herança: Ee × Ee dá ~25% de olhos verdes; EE × ee só dá olhos azuis
  const game=B.create('gato',d.levels[0].orders,5),mk=(id,geno)=>({id,name:id,speciesId:'gato',genotype:geno,traits:c.traitsFor('gato',geno),visualId:'x'});
  const base=game.roster[0].genotype;
  game.roster.push(mk('het1',Object.assign({},base,{E:'Ee'})),mk('het2',Object.assign({},base,{E:'Ee'})),mk('pure',Object.assign({},base,{E:'EE'})),mk('rec',Object.assign({},base,{E:'ee'})),mk('rec2',Object.assign({},base,{E:'ee'})));
  let green=0;const N=2000;for(let n=0;n<N;n++)if(B.cross(game,'het1','het2').pup.traits.eyes==='verdes')green++;
  assert.ok(Math.abs(green/N-.25)<.04,'olhos verdes ~25%: '+green/N);
  for(let n=0;n<100;n++)assert.equal(B.cross(game,'pure','rec').pup.traits.eyes,'azuis');
  for(let n=0;n<100;n++)assert.equal(B.cross(game,'rec','rec2').pup.traits.eyes,'verdes');
}
{ // chance analítica == chance do catálogo
  const animals=c.individuals.filter(a=>a.speciesId==='cachorro');
  for(const [i,j] of [[0,1],[1,2],[3,7],[4,12]])for(const targets of [{color:'claro'},{eyes:'verdes',tail:'curto'},{color:'preto',ears:'caidas',spots:'liso'}])
    close(B.pairChance('cachorro',animals[i].genotype,animals[j].genotype,targets),c.chanceFor(c.cross('cachorro',animals[i].genotype,animals[j].genotype),targets));
}
{ // todo pedido é cumprível: cruzando o melhor par, o filhote certo nasce em tempo razoável
  for(const level of d.levels)level.orders.forEach(order=>{
    const game=B.create(level.id,level.orders,9);let best=null;
    for(let i=0;i<game.roster.length;i++)for(let j=i+1;j<game.roster.length;j++){const p=B.pairChance(level.id,game.roster[i].genotype,game.roster[j].genotype,order.targets);if(!best||p>best.p)best={p,a:game.roster[i],b:game.roster[j]};}
    let tries=0;while(tries<400&&!B.meets(order.targets,B.cross(game,best.a.id,best.b.id).pup.traits))tries++;
    assert.ok(tries<400,'o melhor par gera o pedido: '+order.speech+' p='+best.p);
  });
}
// ---- Fluxo do jogo (main.js) ----
const game={};vm.createContext(game);
for(const file of ['js/genetics.js','js/catalog.js','js/orders.js','js/assets.js','js/customers.js','js/breeding.js'])new vm.Script(fs.readFileSync(file,'utf8'),{filename:file}).runInContext(game);
const nodes=new Map();
function node(){return{hidden:true,inert:false,disabled:false,textContent:'',dataset:{},classList:{add(){},remove(){},toggle(){}},getContext(){return{drawImage(){},fillRect(){},clearRect(){}}},addEventListener(){},append(){},setAttribute(){},focus(){},querySelectorAll(){return[]},contains(){return false},closest(){return null}};}
game.document={body:node(),getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement(){return node()},addEventListener(){}};
game.window=game;game.addEventListener=()=>{};game.requestAnimationFrame=()=>0;game.Image=function(){Object.defineProperty(this,'src',{set(){}})};
let source=fs.readFileSync('js/main.js','utf8').replace(/\}\)\(\);\s*$/,'renderHud=function(){};syncInert=function(){};renderLab=function(){};globalThis.__game={state,interact,closePanel,clearParents,continueLevel,resetPlay,currentOrder,update,blocked,feetBox,WORLD,doBreed,toggleParent,reserveForDelivery,tryDeliver,currentPlan,labChance};})();');
new vm.Script(source,{filename:'js/main.js'}).runInContext(game);
assert.ok(!/requestAnimationFrame|\bctx\b/.test(fs.readFileSync('js/main.js','utf8')),'main.js não desenha nem tem loop próprio');
const flow=game.__game,state=flow.state;
flow.resetPlay();
state.player.x=820;state.player.y=632;flow.interact();assert.equal(state.orderReceived,false,'cliente ainda não chegou');
function awaitCustomer(){
  for(let t=0;t<1000&&(state.customer.phase!=='waiting'||state.customer.orderIndex!==state.orderIndex);t++){
    flow.update(.05);
    assert.equal(flow.blocked(flow.feetBox(state.customer.x,state.customer.y)),false,'trajeto do cliente atravessa um obstáculo');
  }
  assert.equal(state.customer.phase,'waiting');assert.equal(state.customer.orderIndex,state.orderIndex);
}
const atClient=()=>{state.player.x=750;state.player.y=620;},atLab=()=>{state.player.x=720;state.player.y=240;};
for(let index=0;index<d.orders.length;index++){
  awaitCustomer();
  const order=d.orders[index];
  atLab();flow.interact();assert.equal(state.panel,null,'o laboratório só abre depois de atender o cliente');
  atClient();flow.interact();assert.equal(state.orderReceived,true);assert.equal(state.panel,'pedido');flow.closePanel();
  atLab();flow.interact();assert.equal(state.panel,'pais');
  const roster=state.game.roster,first=roster[0].id,second=roster[1].id;
  flow.toggleParent(first);flow.toggleParent(second);assert.equal(JSON.stringify(state.parents),JSON.stringify([first,second]));
  flow.doBreed();assert.equal(state.attempts,1);assert.ok(state.pup,'nasce um filhote');
  assert.equal(state.pup.speciesId,order.speciesId);
  // entrega errada: o cliente diz o que está errado e o filhote é descartado
  state.pup.traits=Object.assign({},state.pup.traits);
  const key=Object.keys(order.targets)[0];state.pup.traits[key]=c.species[order.speciesId].traits.find(t=>t.id===key).values.find(v=>v!==order.targets[key]);
  flow.reserveForDelivery();assert.equal(state.carry,true);assert.equal(state.panel,null);
  atClient();flow.interact();assert.equal(state.carry,false);assert.equal(state.pup,null);assert.ok(/não é bem o que eu queria/.test(state.say),state.say);assert.equal(state.orderIndex,index);flow.closePanel();
  // entrega certa (o teste forja a aparência; o sorteio real é coberto acima)
  atLab();flow.interact();flow.doBreed();assert.equal(state.attempts,2);
  state.pup.traits=Object.assign({},state.pup.traits,order.targets);
  flow.reserveForDelivery();atClient();const delivered=state.orderIndex;flow.interact();
  assert.equal(state.orderIndex,delivered+1,'entrega certa avança o pedido');
  const last=state.results[state.results.length-1];assert.ok(last.stars>=1&&last.stars<=3);assert.equal(state.pup,null);assert.equal(state.attempts,0);
  if(state.phase==='intervalo'){flow.continueLevel();assert.equal(state.game.speciesId,d.orders[state.orderIndex].speciesId,'novo nível, nova espécie');}
}
assert.equal(state.phase,'concluido');assert.equal(state.orderIndex,12);assert.equal(state.results.length,12);
flow.resetPlay();awaitCustomer();atClient();flow.interact();assert.equal(state.orderReceived,true);
flow.resetPlay();state.player.x=700;state.player.y=598;flow.interact();assert.equal(state.orderReceived,false);
for(const dir of ['up','down','left','right']){
  assert.equal(context.PetAssets.walkFrame(dir,false,0),context.PetAssets.walking[dir][1]);
  assert.notEqual(context.PetAssets.walkFrame(dir,true,0).x,context.PetAssets.walkFrame(dir,true,.14).x);
}
assert.deepEqual(Object.values(c.species).map(s=>s.name),['Gatinho','Cachorrinho','Coelhinho']);
{
  // Laboratório: a chance exibida vem da mesma lógica de cruzamento do catálogo e nunca passa da melhor do viveiro.
  flow.resetPlay();
  const order=flow.currentOrder(),roster=state.game.roster,a=roster[0],b=roster[1];
  state.parents=[null,null];assert.equal(flow.labChance(order),null,'sem pais, não há chance');
  state.parents=[a.id,b.id];
  close(flow.labChance(order),c.chanceFor(c.cross(order.speciesId,a.genotype,b.genotype),order.targets));
  assert.ok(flow.labChance(order)<=flow.currentPlan().chance+1e-10,'nenhum par passa da melhor chance do plano');
  state.parents=[null,null];
}
console.log('OK: genética por traços, pedidos sem porcentagem, pais do catálogo → filhote sorteado, caderno, entrega, estrelas e 12 pedidos em 3 níveis.');
