(function(root){
  'use strict';
  // Padrão: grade 32x32, vista frontal, camadas (rabo, orelhas, corpo, cabeça, manchas, rosto).
  // Cada característica genética troca só a sua camada; a cor vem da paleta de 3 tons.
  var N=32,cache={};
  var furs={
    preto:{base:'#3d3d4a',shadow:'#272732',light:'#5a5a6e',spot:'#f1e6d2'},
    cinza:{base:'#9ca0ad',shadow:'#7b7f8e',light:'#bec2cd',spot:'#f4eadb'},
    marrom:{base:'#8c5a34',shadow:'#6b4024',light:'#ab774a',spot:'#f1e1c6'},
    claro:{base:'#ead6ab',shadow:'#cbb386',light:'#f8ecce',spot:'#9a6a40'}
  };
  var eyeColors={azuis:'#2f86ff',verdes:'#35c768'};
  var OUT='#1d1a24',PINK='#e98ea0',MUZZLE='#f4ead6',NOSE='#c2566b',PUPIL='#101820',WHITE='#ffffff';

  function mask(){return new Uint8Array(N*N);}
  function has(m,x,y){return x>=0&&y>=0&&x<N&&y<N&&m[y*N+x]===1;}
  function ellipse(m,cx,cy,rx,ry){
    for(var y=0;y<N;y++)for(var x=0;x<N;x++){var dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)m[y*N+x]=1;}
  }
  function side(px,py,ax,ay,bx,by){return (px-bx)*(ay-by)-(ax-bx)*(py-by);}
  function tri(m,x1,y1,x2,y2,x3,y3,k){
    if(k){var cx=(x1+x2+x3)/3,cy=(y1+y2+y3)/3;x1=cx+(x1-cx)*k;y1=cy+(y1-cy)*k;x2=cx+(x2-cx)*k;y2=cy+(y2-cy)*k;x3=cx+(x3-cx)*k;y3=cy+(y3-cy)*k;}
    for(var y=0;y<N;y++)for(var x=0;x<N;x++){
      var px=x+.5,py=y+.5,a=side(px,py,x1,y1,x2,y2),b=side(px,py,x2,y2,x3,y3),c=side(px,py,x3,y3,x1,y1);
      if(!((a<0||b<0||c<0)&&(a>0||b>0||c>0)))m[y*N+x]=1;
    }
  }
  function path(m,points,r){
    for(var i=0;i<points.length-1;i++){
      var a=points[i],b=points[i+1],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*2);
      for(var s=0;s<=steps;s++){var t=s/steps;ellipse(m,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,r,r);}
    }
  }
  function minus(m,other){for(var i=0;i<m.length;i++)if(other[i])m[i]=0;return m;}
  function inter(m,other){for(var i=0;i<m.length;i++)if(!other[i])m[i]=0;return m;}

  // Forma de cada espécie e de cada valor de característica (orelhas e rabo).
  function shape(id,t){
    var s={tail:mask(),back:mask(),front:mask(),inner:mask(),body:mask(),head:mask(),hx:16,hy:14,eyeY:13,eyeDx:4,muzzleY:17,muzzleRx:3,muzzleRy:2};
    var longTail=t.tail==='longo',erect=t.ears==='eretas';
    if(id==='gato'){
      ellipse(s.body,16,24.5,7,6);ellipse(s.head,16,14,8,6.5);
      if(longTail)path(s.tail,[[23,28],[27,26],[28,21],[26,16]],1.6);else ellipse(s.tail,24.5,28,2,2);
      if(erect){tri(s.back,8,9,10,1,15,7);tri(s.back,24,9,22,1,17,7);tri(s.inner,8,9,10,1,15,7,.55);tri(s.inner,24,9,22,1,17,7,.55);}
      else{ellipse(s.front,8.5,9.5,2.6,1.6);ellipse(s.front,6.2,10.7,2.2,1.5);ellipse(s.front,23.5,9.5,2.6,1.6);ellipse(s.front,25.8,10.7,2.2,1.5);}
    }else if(id==='cachorro'){
      ellipse(s.body,16,24.5,8,6);ellipse(s.head,16,14,8,7);s.muzzleY=17.5;s.muzzleRx=4;s.muzzleRy=2.6;
      if(longTail)path(s.tail,[[23,28],[27,25],[29,20],[28,15]],1.7);else ellipse(s.tail,25,28,2,2);
      if(erect){tri(s.back,7.5,10,8.5,3,14,7);tri(s.back,24.5,10,23.5,3,18,7);tri(s.inner,7.5,10,8.5,3,14,7,.5);tri(s.inner,24.5,10,23.5,3,18,7,.5);}
      else{ellipse(s.front,6,14,3,5.5);ellipse(s.front,26,14,3,5.5);}
    }else{
      ellipse(s.body,16,25.5,7,5);ellipse(s.head,16,17,7,6);s.hy=17;s.eyeY=16;s.eyeDx=3.8;s.muzzleY=20;s.muzzleRx=2.6;s.muzzleRy=1.8;
      if(longTail)ellipse(s.tail,24.5,27,3.4,3.4);else ellipse(s.tail,23.5,29,2,2);
      if(erect){ellipse(s.back,11.5,7,2.4,6.2);ellipse(s.back,20.5,7,2.4,6.2);ellipse(s.inner,11.5,7.5,1.2,4.2);ellipse(s.inner,20.5,7.5,1.2,4.2);}
      else{ellipse(s.front,7.5,19,2.6,5);ellipse(s.front,24.5,19,2.6,5);}
    }
    ellipse(s.body,12,29.5,2.6,1.2);ellipse(s.body,20,29.5,2.6,1.2);
    return s;
  }

  function paint(grid,m,fur){
    for(var y=0;y<N;y++)for(var x=0;x<N;x++){
      if(!m[y*N+x])continue;
      var shadow=!has(m,x+1,y)||!has(m,x,y+1)||!has(m,x+1,y+1),light=!has(m,x-1,y)||!has(m,x,y-1);
      grid[y*N+x]=shadow?fur.shadow:light?fur.light:fur.base;
    }
  }
  function fill(grid,m,color){for(var i=0;i<m.length;i++)if(m[i])grid[i]=color;}
  function dot(grid,x,y,color){if(x>=0&&y>=0&&x<N&&y<N)grid[y*N+x]=color;}

  function build(id,traits){
    var s=shape(id,traits),fur=furs[traits.color]||furs.cinza,g=new Array(N*N);
    paint(g,s.tail,fur);paint(g,s.back,fur);paint(g,s.body,fur);paint(g,s.head,fur);paint(g,s.front,fur);
    fill(g,minus(s.inner,s.head),PINK);
    if(traits.spots==='manchado'){
      var h=mask(),b=mask();
      ellipse(h,s.hx-5,s.hy-3.5,3.2,2.8);ellipse(b,20.5,24,3.4,3);ellipse(b,11.5,23,2,2);
      fill(g,inter(h,s.head),fur.spot);fill(g,minus(inter(b,s.body),s.head),fur.spot);
    }
    var solid=g.map(function(c){return !!c;});
    for(var y=0;y<N;y++)for(var x=0;x<N;x++){
      if(solid[y*N+x])continue;
      if((x>0&&solid[y*N+x-1])||(x<N-1&&solid[y*N+x+1])||(y>0&&solid[(y-1)*N+x])||(y<N-1&&solid[(y+1)*N+x]))g[y*N+x]=OUT;
    }
    var mz=mask();ellipse(mz,16,s.muzzleY,s.muzzleRx,s.muzzleRy);fill(g,inter(mz,s.head),MUZZLE);
    var ny=Math.floor(s.muzzleY-1);
    dot(g,15,ny,NOSE);dot(g,16,ny,NOSE);dot(g,14,ny+1,OUT);dot(g,17,ny+1,OUT);dot(g,15,ny+2,OUT);dot(g,16,ny+2,OUT);
    var a=Math.round(15-s.eyeDx),eye=eyeColors[traits.eyes]||eyeColors.azuis;
    [a,31-a-2].forEach(function(x0,i){
      for(var dy=-1;dy<=1;dy++)for(var dx=0;dx<3;dx++)dot(g,x0+dx,s.eyeY+dy,eye);
      dot(g,x0+1,s.eyeY,PUPIL);dot(g,x0+(i?2:0),s.eyeY-1,WHITE);
    });
    return g;
  }

  function sprite(id,traits){
    var key=id+'::'+root.PetCatalog.appearanceKey(traits);if(cache[key])return cache[key];
    var grid=build(id,traits),c=document.createElement('canvas');c.width=N;c.height=N;
    var ctx=c.getContext('2d'),img=ctx.createImageData(N,N);
    for(var i=0;i<grid.length;i++){
      var col=grid[i];if(!col)continue;
      img.data[i*4]=parseInt(col.slice(1,3),16);img.data[i*4+1]=parseInt(col.slice(3,5),16);img.data[i*4+2]=parseInt(col.slice(5,7),16);img.data[i*4+3]=255;
    }
    ctx.putImageData(img,0,0);cache[key]=c;return c;
  }
  function draw(target,id,visualId){
    if(!root.PetCatalog||!root.PetCatalog.species[id])return false;
    var ctx=target.getContext('2d');ctx.clearRect(0,0,target.width,target.height);
    ctx.imageSmoothingEnabled=false;ctx.drawImage(sprite(id,root.PetCatalog.traitsForVisual(id,visualId)),0,0,target.width,target.height);
    return true;
  }
  root.PetSprites={draw:draw};
})(typeof globalThis!=='undefined'?globalThis:this);
