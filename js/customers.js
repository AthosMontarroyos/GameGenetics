(function(root){
  'use strict';
  // Entrance stays at the edge of the road, then follows the sidewalk and door.
  var route=[{x:1510,y:900},{x:1260,y:900},{x:1260,y:820},{x:768,y:820},{x:768,y:740},{x:768,y:632},{x:820,y:632}];
  function create(order,index){return {orderIndex:index,clientId:order.clientId,x:route[0].x,y:route[0].y,dir:'left',phase:'arriving',point:1,clock:0,moving:true};}
  function leave(customer){if(customer&&customer.phase==='waiting'){customer.phase='leaving';customer.point=route.length-2;customer.moving=true;customer.clock=0;customer.dir='left';}}
  function update(customer,dt){
    if(!customer||customer.phase==='waiting'||customer.phase==='gone')return false;
    var budget=190*Math.max(0,Math.min(dt,.1));customer.clock+=dt;
    while(budget>0){
      var target=route[customer.point],dx=target.x-customer.x,dy=target.y-customer.y,distance=Math.hypot(dx,dy);
      customer.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
      if(distance>budget){customer.x+=dx/distance*budget;customer.y+=dy/distance*budget;budget=0;}
      else{customer.x=target.x;customer.y=target.y;budget-=distance;customer.point+=customer.phase==='arriving'?1:-1;
        if(customer.point>=route.length||customer.point<0){customer.phase=customer.phase==='arriving'?'waiting':'gone';customer.moving=false;customer.clock=0;if(customer.phase==='waiting')customer.dir='up';return true;}
      }
    }
    return false;
  }
  root.PetCustomers={create:create,leave:leave,update:update,route:route};
})(typeof globalThis!=='undefined'?globalThis:this);
