(function (root) {
  'use strict';
  var loci = ['A','B','E','O','M','T'];
  var definitions = {
    gato: { name:'Gatinho', colors:['preto','cinza','marrom','claro'], ears:['eretas','dobradas'], earLabel:'Orelhas', imageId:'pet-families', atlasId:'pet-families' },
    cachorro: { name:'Cachorrinho', colors:['marrom','preto','cinza','claro'], ears:['eretas','caidas'], earLabel:'Orelhas', imageId:'pet-families', atlasId:'pet-families' },
    coelho: { name:'Coelhinho', colors:['cinza','marrom','claro','preto'], ears:['eretas','caidas'], earLabel:'Orelhas', imageId:'pet-families', atlasId:'pet-families' }
  };
  var labels = { roxo:'Roxo', cinza:'Cinza', marrom:'Marrom', claro:'Claro', preto:'Preto', azul:'Azul', verde:'Verde', laranja:'Laranja', amarelo:'Amarelo', azuis:'Azuis', verdes:'Verdes', eretas:'Eretas', dobradas:'Dobradas', caidas:'Caídas', alta:'Alta', baixa:'Baixa', manchado:'Com manchas', liso:'Sem manchas', longo:'Longo', curto:'Curto' };
  var traitKeys = ['color','eyes','ears','spots','tail'];
  var species = {}, individuals = [];
  function label(value) { return labels[value] || value; }
  function dominant(pair, gene) { return (pair || gene + gene).indexOf(gene) !== -1; }
  function classify(id, genotype) {
    var config = definitions[id];
    if (!config) throw new Error('Espécie desconhecida: ' + id);
    return config.colors[(dominant(genotype.A,'A') ? 0 : 2) + (dominant(genotype.B,'B') ? 0 : 1)];
  }
  function traitsFor(id, genotype) {
    return { color:classify(id,genotype), eyes:dominant(genotype.E,'E')?'azuis':'verdes', ears:definitions[id].ears[dominant(genotype.O,'O')?0:1], spots:dominant(genotype.M,'M')?'manchado':'liso', tail:dominant(genotype.T,'T')?'longo':'curto' };
  }
  function appearanceKey(traits) { return traitKeys.map(function(key){return traits[key];}).join('|'); }
  function traitsFromKey(key) {
    var values=key.split('|'), result={};
    traitKeys.forEach(function(trait,index){result[trait]=values[index];});
    return result;
  }
  function describeTraits(id, traits) {
    return [label(traits.color), 'olhos '+traits.eyes, 'orelhas '+label(traits.ears).toLowerCase(), label(traits.spots).toLowerCase(), 'rabo '+traits.tail].join(' · ');
  }
  function visualFor(id, phenotype) {
    var traits = typeof phenotype === 'object' ? phenotype : phenotype.indexOf('|') !== -1 ? traitsFromKey(phenotype) : {color:phenotype,eyes:'azuis',ears:definitions[id].ears[0],spots:'liso',tail:'longo'};
    return id+'::'+appearanceKey(traits);
  }
  function traitsForVisual(id, visualId) {
    var separator=visualId.indexOf('::');
    if(separator!==-1) return traitsFromKey(visualId.slice(separator+2));
    return {color:definitions[id].colors[0],eyes:'azuis',ears:definitions[id].ears[0],spots:'liso',tail:'longo'};
  }
  function combination(id, traits) {
    var config=definitions[id], color=config.colors.indexOf(traits.color);
    var number=1+color*16+(traits.eyes==='verdes'?8:0)+(traits.ears===config.ears[1]?4:0)+(traits.spots==='manchado'?2:0)+(traits.tail==='curto'?1:0);
    return {code:({gato:'GAT',coelho:'COE',cachorro:'CAO'})[id]+'-'+String(number).padStart(3,'0'),
      pieces:[config.name,label(traits.color),'Olhos '+traits.eyes,config.earLabel+' '+label(traits.ears).toLowerCase(),label(traits.spots),'Rabo '+traits.tail],
      genes:[['A_B_','A_bb','aaB_','aabb'][color],traits.eyes==='azuis'?'E_':'ee',traits.ears===config.ears[0]?'O_':'oo',traits.spots==='manchado'?'M_':'mm',traits.tail==='longo'?'T_':'tt'].join(' · ')};
  }
  function suggestCross(id, targets) {
    var animals=individuals.filter(function(animal){return animal.speciesId===id;}),best=null;
    function dominantChance(a,b,gene){var lower=gene.toLowerCase();return 1-(a[gene].split(lower).length-1)*(b[gene].split(lower).length-1)/4;}
    for(var i=0;i<animals.length;i++)for(var j=i+1;j<animals.length;j++){
      var a=animals[i],b=animals[j],chance=1;
      Object.keys(targets).forEach(function(trait){var value=targets[trait],p;
        if(trait==='color'){var index=definitions[id].colors.indexOf(value),pa=dominantChance(a.genotype,b.genotype,'A'),pb=dominantChance(a.genotype,b.genotype,'B');p=(index<2?pa:1-pa)*(index%2===0?pb:1-pb);}
        else{var gene={eyes:'E',ears:'O',spots:'M',tail:'T'}[trait];p=dominantChance(a.genotype,b.genotype,gene);var positive={eyes:'azuis',ears:definitions[id].ears[0],spots:'manchado',tail:'longo'}[trait];if(value!==positive)p=1-p;}
        chance*=p;
      });
      if(chance>0&&(!best||chance>best.chance))best={parents:[a.id,b.id],chance:chance};
    }
    return best;
  }
  Object.keys(definitions).forEach(function(id){
    var config=definitions[id];
    var traits=[{id:'color',name:'Cor',genes:['A','B'],values:config.colors},{id:'eyes',name:'Olhos',genes:['E'],values:['azuis','verdes']},{id:'ears',name:config.earLabel,genes:['O'],values:config.ears},{id:'spots',name:'Manchas',genes:['M'],values:['liso','manchado']},{id:'tail',name:'Rabo',genes:['T'],values:['longo','curto']}];
    var variants=[];
    config.colors.forEach(function(color){['azuis','verdes'].forEach(function(eyes){config.ears.forEach(function(ears){['liso','manchado'].forEach(function(spots){['longo','curto'].forEach(function(tail){var appearance={color:color,eyes:eyes,ears:ears,spots:spots,tail:tail};variants.push({id:visualFor(id,appearance),name:describeTraits(id,appearance),phenotype:color,traits:appearance});});});});});});
    variants.forEach(function(variant){variant.recipe=combination(id,variant.traits);});
    species[id]=Object.assign({id:id,loci:loci.slice(),traits:traits,variants:variants},config);
  });
  var recipes=[
    ['AA','BB','EE','OO','mm','TT'],['Aa','Bb','Ee','Oo','Mm','Tt'],['Aa','bb','ee','oo','mm','tt'],['aa','BB','EE','oo','Mm','Tt'],
    ['aa','Bb','ee','OO','mm','tt'],['aa','bb','Ee','Oo','MM','TT'],['Aa','BB','ee','oo','MM','tt'],['AA','bb','EE','OO','mm','tt'],
    ['aa','bb','ee','oo','mm','tt'],['aa','bb','ee','oo','mm','tt'],['aa','BB','ee','oo','MM','tt'],['aa','BB','ee','oo','MM','tt'],
    ['AA','BB','EE','OO','MM','TT'],['AA','bb','ee','OO','MM','TT'],['aa','Bb','Ee','oo','mm','TT'],['Aa','bb','Ee','OO','mm','Tt']
  ];
  var names={gato:['Íris','Amora','Nina','Cacau','Tico','Pipoca','Jade','Lua','Loki','Brisa','Canela','Mimo','Nuvem','Tuca','Zeca','Neve'],coelho:['Nino','Lili','Pingo','Algodão','Mochi','Avelã','Kiwi','Biscoito','Coco','Mel','Fubá','Noz','Tutu','Bolota','Floco','Pompom'],cachorro:['Azulão','Índigo','Lima','Brasa','Sol','Ouro','Safira','Musgo','Coral','Chama','Céu','Caju','Raio','Néon','Duna','Faísca']};
  Object.keys(species).forEach(function(id){recipes.forEach(function(recipe,index){var genotype={};loci.forEach(function(locus,i){genotype[locus]=recipe[i];});var appearance=traitsFor(id,genotype);individuals.push({id:id+'-'+(index+1),speciesId:id,name:names[id][index],genotype:genotype,traits:appearance,visualId:visualFor(id,appearance)});});});
  function cross(id, first, second) {
    var result=root.PetGenetics.crossLoci(first,second,loci,function(genotype){return appearanceKey(traitsFor(id,genotype));});
    result.appearances=result.phenotypes;
    result.phenotypes={}; result.traitProbabilities={};
    traitKeys.forEach(function(key){result.traitProbabilities[key]={};});
    Object.keys(result.appearances).forEach(function(key){var appearance=traitsFromKey(key),probability=result.appearances[key];traitKeys.forEach(function(trait){var values=result.traitProbabilities[trait];values[appearance[trait]]=(values[appearance[trait]]||0)+probability;});});
    result.phenotypes=result.traitProbabilities.color; result.multi=true;
    result.perGene=loci.map(function(locus){var a={},b={};a[locus]=first[locus];b[locus]=second[locus];var one=root.PetGenetics.crossLoci(a,b,[locus],function(genotype){return genotype[locus];});one.multi=true;return one;});
    result.traitCrosses=species[id].traits.map(function(trait){var a={},b={};trait.genes.forEach(function(gene){a[gene]=first[gene];b[gene]=second[gene];});var part=root.PetGenetics.crossLoci(a,b,trait.genes,function(genotype){return traitsFor(id,genotype)[trait.id];});part.multi=true;return {trait:trait,result:part};});
    return result;
  }
  function matches(traits, targets) { return Object.keys(targets).every(function(key){return traits[key]===targets[key];}); }
  function chanceFor(result,targets) { return Object.keys(result.appearances).reduce(function(sum,key){return sum+(matches(traitsFromKey(key),targets)?result.appearances[key]:0);},0); }
  function targetsFor(order) {return order.targets || {color:order.phenotype};}
  function describeTargets(order) {var spec=species[order.speciesId],targets=targetsFor(order);return spec.traits.filter(function(trait){return targets[trait.id];}).map(function(trait){return trait.name.toLowerCase()+': '+label(targets[trait.id]);}).join(' · ');}
  root.PetCatalog={species:species,individuals:individuals,combination:combination,suggestCross:suggestCross,classify:classify,visualFor:visualFor,traitsFor:traitsFor,traitsForVisual:traitsForVisual,appearanceKey:appearanceKey,traitsFromKey:traitsFromKey,describeTraits:describeTraits,label:label,cross:cross,matches:matches,chanceFor:chanceFor,targetsFor:targetsFor,describeTargets:describeTargets};
})(typeof globalThis!=='undefined'?globalThis:this);
