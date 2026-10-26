(function(root){
  'use strict';
  // Pedidos em linguagem natural: o cliente descreve o bicho e o jogador entrega um que tenha tudo.
  var clients=[
    {id:'cliente-12683',name:'Estudante',open:'Oi! Quero'},
    {id:'cliente-12682',name:'Homem adulto',open:'Procuro'},
    {id:'cliente-12687',name:'Senhora idosa',open:'Gostaria de levar'},
    {id:'cliente-12684',name:'Estudante de mochila',open:'Estou procurando'},
    {id:'cliente-12685',name:'Jovem',open:'Quero adotar'},
    {id:'cliente-12686',name:'Entregador',open:'Vim buscar'}
  ];
  // Cada nível mistura os três bichos e a dificuldade sobe: mais características pedidas, mais recessivas.
  var levels=[
    {id:'nivel-1',title:'Primeiros pedidos',orders:[
      {speciesId:'gato',targets:{color:'cinza'}},
      {speciesId:'cachorro',targets:{color:'preto'}},
      {speciesId:'coelho',targets:{ears:'caidas'}}
    ]},
    {id:'nivel-2',title:'Dois detalhes',orders:[
      {speciesId:'gato',targets:{color:'marrom',eyes:'verdes'}},
      {speciesId:'cachorro',targets:{eyes:'verdes',tail:'curto'}},
      {speciesId:'coelho',targets:{color:'preto',spots:'manchado'}}
    ]},
    {id:'nivel-3',title:'Pedidos exigentes',orders:[
      {speciesId:'gato',targets:{color:'claro',ears:'dobradas',tail:'curto'}},
      {speciesId:'cachorro',targets:{color:'claro',eyes:'verdes',spots:'liso'}},
      {speciesId:'coelho',targets:{color:'cinza',eyes:'verdes',tail:'curto'}}
    ]},
    {id:'nivel-4',title:'Mestre dos cruzamentos',orders:[
      {speciesId:'gato',targets:{color:'claro',eyes:'verdes',ears:'dobradas',spots:'liso',tail:'curto'}},
      {speciesId:'cachorro',targets:{color:'claro',eyes:'verdes',ears:'caidas',spots:'liso',tail:'longo'}},
      {speciesId:'coelho',targets:{color:'preto',eyes:'verdes',ears:'caidas',spots:'liso',tail:'curto'}}
    ]}
  ];
  var nouns={gato:'um gatinho',cachorro:'um cachorrinho',coelho:'um coelhinho'};
  function phrase(trait,value){
    if(trait==='eyes')return 'olhos '+value;
    if(trait==='ears')return 'orelhas '+root.PetCatalog.label(value).toLowerCase();
    if(trait==='spots')return value==='manchado'?'com manchas':'sem manchas';
    if(trait==='tail')return 'rabo '+value;
    return root.PetCatalog.label(value).toLowerCase();
  }
  // "Quero um gatinho marrom, de olhos verdes e com manchas."
  function speechFor(client,speciesId,targets){
    var parts=[];
    if(targets.color)parts.push(phrase('color',targets.color));
    var rest=['eyes','ears','spots','tail'].filter(function(key){return targets[key];}).map(function(key){return phrase(key,targets[key]);});
    var text=nouns[speciesId]+(parts.length?' '+parts[0]:'');
    if(rest.length){
      var joined=rest.length>1?rest.slice(0,-1).join(', ')+' e '+rest[rest.length-1]:rest[0];
      text+=(parts.length?', ':' ')+(rest[0].indexOf('com ')===0||rest[0].indexOf('sem ')===0?'':'de ')+joined;
    }
    return client.open+' '+text+'.';
  }
  var orders=[];
  levels.forEach(function(level,levelIndex){
    level.name='Nível '+(levelIndex+1)+' — '+level.title;
    level.orders=level.orders.map(function(entry,index){
      var client=clients[(index+levelIndex*level.orders.length)%clients.length];
      return {clientId:client.id,clientName:client.name,speciesId:entry.speciesId,targets:entry.targets,phenotype:entry.targets.color,speech:speechFor(client,entry.speciesId,entry.targets),levelId:level.id,levelName:level.name,indexInLevel:index};
    });
    level.orders.forEach(function(order){orders.push(order);});
  });
  root.PetOrders={levels:levels,orders:orders,nouns:nouns,speechFor:speechFor,phrase:phrase};
})(typeof globalThis!=='undefined'?globalThis:this);
