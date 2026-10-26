(function(root){
  'use strict';
  // Artes 320x320 geradas por tools/build-pet-art.js (assets/animals/arte-v1).
  var DIR='assets/animals/arte-v1/',cache={};

  function fileFor(id,t){
    var ears=t.ears==='eretas'?'eretas':'caidas';
    return DIR+[id,t.color,t.eyes,ears,t.spots,t.tail].join('-')+'.png';
  }
  function load(src){
    var entry=cache[src];
    if(entry)return entry;
    var img=new Image();
    entry=cache[src]={img:img,ready:false,failed:false,waiting:[]};
    img.onload=function(){entry.ready=true;entry.waiting.splice(0).forEach(function(fn){fn();});};
    img.onerror=function(){entry.failed=true;entry.waiting.length=0;};
    img.src=src;
    return entry;
  }
  function paint(target,img,token){
    if(target.__petSpriteToken!==token)return;
    var ctx=target.getContext('2d'),size=Math.min(target.width,target.height);
    ctx.clearRect(0,0,target.width,target.height);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(img,Math.floor((target.width-size)/2),Math.floor((target.height-size)/2),size,size);
  }
  function draw(target,id,visualId){
    if(!root.PetCatalog||!root.PetCatalog.species[id])return false;
    var src=fileFor(id,root.PetCatalog.traitsForVisual(id,visualId)),entry=load(src),token=src+'#'+Math.random();
    if(entry.failed)return false;
    target.__petSpriteToken=token;
    target.getContext('2d').clearRect(0,0,target.width,target.height);
    if(entry.ready)paint(target,entry.img,token);
    else entry.waiting.push(function(){paint(target,entry.img,token);});
    return true;
  }
  root.PetSprites={draw:draw};
})(typeof globalThis!=='undefined'?globalThis:this);
