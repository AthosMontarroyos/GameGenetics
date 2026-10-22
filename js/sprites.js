(function(root){
  'use strict';
  var families={},sprites={};
  var rows={gato:[0,340],cachorro:[340,310],coelho:[645,379]},columns=[0,438,790,1170,1536];
  var palettes={preto:[218,.08,.34,.012],cinza:[214,.075,.86,.095],marrom:[25,.55,.79,.05],claro:[39,.22,.45,.54]};
  // Coordinates follow the face, so markings stay attached across ear/tail drawings.
  var markings={gato:[[-.38,-.35,.34,.63],[.43,1.04,.4,.61]],cachorro:[[-.4,.02,.34,.48],[.41,1.27,.47,.69]],coelho:[[.35,-.2,.36,.55],[-.39,1.03,.45,.57]]};
  function canvas(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function cropAnimal(image,rect){
    var source=canvas(Math.ceil(rect.w),Math.ceil(rect.h)),ctx=source.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(image,rect.x,rect.y,rect.w,rect.h,0,0,source.width,source.height);
    var pixels=ctx.getImageData(0,0,source.width,source.height),data=pixels.data,w=source.width,h=source.height;
    // Retain the complete animal; discard stray pixels from adjacent atlas cells.
    var labels=new Int32Array(w*h),queue=new Int32Array(w*h),label=0,best=0,bestSize=0;
    for(var start=0;start<labels.length;start++){
      if(labels[start]||data[start*4+3]<=24)continue;
      label++;var head=0,tail=1;queue[0]=start;labels[start]=label;
      while(head<tail){var p=queue[head++],x=p%w,y=Math.floor(p/w);
        var neighbors=[x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1];
        for(var j=0;j<neighbors.length;j++){var next=neighbors[j];if(next>=0&&!labels[next]&&data[next*4+3]>24){labels[next]=label;queue[tail++]=next;}}
      }
      if(tail>bestSize){bestSize=tail;best=label;}
    }
    if(bestSize<1000)throw new Error('Desenho da família vazio.');
    var minX=w,minY=h,maxX=0,maxY=0;
    for(var i=0;i<labels.length;i++){
      if(labels[i]!==best){data[i*4+3]=0;continue;}
      var col=i%w,row=Math.floor(i/w);minX=Math.min(minX,col);maxX=Math.max(maxX,col);minY=Math.min(minY,row);maxY=Math.max(maxY,row);
    }
    var anchor=0,lines=0;
    for(var yy=Math.floor(minY+(maxY-minY)*.3);yy<minY+(maxY-minY)*.43;yy++){
      var left=w,right=0;for(var xx=minX;xx<=maxX;xx++)if(labels[yy*w+xx]===best){left=Math.min(left,xx);right=Math.max(right,xx);}
      if(left<=right){anchor+=(left+right)/2-minX;lines++;}
    }
    ctx.putImageData(pixels,0,0);
    var output=canvas(maxX-minX+1,maxY-minY+1);
    output.getContext('2d').drawImage(source,minX,minY,output.width,output.height,0,0,output.width,output.height);
    output.anchorX=lines?anchor/lines:output.width/2;return output;
  }
  function prepare(id,image){
    if(families[id])return families[id];
    var sx=(image.naturalWidth||image.width)/1536,sy=(image.naturalHeight||image.height)/1024;
    var animals=[0,1,2,3].map(function(index){return cropAnimal(image,{x:columns[index]*sx,y:rows[id][0]*sy,w:(columns[index+1]-columns[index])*sx,h:rows[id][1]*sy});});
    var height=Math.max.apply(null,animals.map(function(a){return a.height;})),half=Math.max.apply(null,animals.map(function(a){return Math.max(a.anchorX,a.width-a.anchorX);}));
    animals.scale=Math.min(296/height,148/half);families[id]=animals;return animals;
  }
  function hsl(r,g,b){r/=255;g/=255;b/=255;var max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2,s=d===0?0:d/(1-Math.abs(2*l-1)),h=0;if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return[h,s,l];}
  function rgb(h,s,l){var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,values=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return values.map(function(v){return Math.round((v+m)*255);});}
  function faceGeometry(source,data){
    if(source.face)return source.face;
    var minX=source.width,maxX=0,minY=source.height,maxY=0;
    for(var i=0;i<data.length;i+=4){if(data[i+3]<100)continue;var value=hsl(data[i],data[i+1],data[i+2]);
      if(value[0]>=175&&value[0]<=240&&value[1]>.3&&value[2]>.15){var p=i/4,x=p%source.width,y=Math.floor(p/source.width);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
    }
    source.face=maxX>minX?{x:(minX+maxX)/2,y:(minY+maxY)/2,span:maxX-minX}:{x:source.anchorX,y:source.height*.4,span:source.width*.38};return source.face;
  }
  function inMarking(id,x,y){
    return markings[id].some(function(m){var dx=(x-m[0])/m[2],dy=(y-m[1])/m[3],angle=Math.atan2(dy,dx);
      return dx*dx+dy*dy<1+.07*Math.sin(angle*9)+.035*Math.sin(angle*17);
    });
  }
  function render(id,traits,images){
    var key=id+'::'+root.PetCatalog.appearanceKey(traits);if(sprites[key])return sprites[key];
    var spec=root.PetCatalog.species[id],image=images[spec.atlasId];if(!image)return null;
    // Each family owns four complete frontal drawings. No parts are exchanged.
    var index=(traits.ears===spec.ears[0]?0:2)+(traits.tail==='curto'?1:0),family=prepare(id,image),source=family[index];
    var animal=canvas(source.width,source.height),ctx=animal.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);
    var pixels=ctx.getImageData(0,0,animal.width,animal.height),data=pixels.data,palette=palettes[traits.color],face=faceGeometry(source,data);
    for(var i=0;i<data.length;i+=4){
      if(data[i+3]===0)continue;
      var value=hsl(data[i],data[i+1],data[i+2]),next=null;
      var px=i/4,x=(px%animal.width-face.x)/face.span,y=(Math.floor(px/animal.width)-face.y)/face.span;
      var nose=Math.pow(x/.14,2)+Math.pow((y-.3)/.13,2)<1;
      if(value[0]>=175&&value[0]<=240&&value[1]>.25&&value[2]>.1){next=rgb(traits.eyes==='verdes'?139:209,Math.max(.72,value[1]),value[2]);}
      else if(!nose&&value[1]<.22&&value[2]>.13&&value[2]<.86){
        var light=Math.min(.94,value[2]*palette[2]+palette[3]);
        var spot=traits.spots==='manchado'&&inMarking(id,x,y);
        var spotLight=traits.color==='claro'?.12+value[2]*.36:traits.color==='cinza'?.055+value[2]*.34:Math.min(.96,.58+value[2]*.46);
        next=spot?rgb(traits.color==='claro'?25:32,traits.color==='claro'?.35:.06,spotLight):rgb(palette[0],palette[1],light);
      }
      if(next){data[i]=next[0];data[i+1]=next[1];data[i+2]=next[2];}
    }
    ctx.putImageData(pixels,0,0);
    var output=canvas(320,320),pen=output.getContext('2d'),scale=family.scale;
    pen.imageSmoothingEnabled=true;pen.imageSmoothingQuality='high';pen.drawImage(animal,160-source.anchorX*scale,308-animal.height*scale,animal.width*scale,animal.height*scale);
    sprites[key]=output;return output;
  }
  function draw(target,id,visualId,images){var source=render(id,root.PetCatalog.traitsForVisual(id,visualId),images||{});if(!source)return false;var ctx=target.getContext('2d');ctx.clearRect(0,0,target.width,target.height);ctx.drawImage(source,0,0,target.width,target.height);return true;}
  root.PetSprites={draw:draw};
})(typeof globalThis!=='undefined'?globalThis:this);
