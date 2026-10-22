(function (root) {
  'use strict';

  // Recortes da primeira vista frontal de cada variante, medidos pelos pixels com alfa > 12.
  const files = {
    scenery: 'assets/scenery/pet-shop.png',
    player: 'assets/players/atendente-walk.png',
    'pet-families': 'assets/animals/familias-anime.png',
    'cliente-12683': 'assets/npcs/cliente-12683.png',
    'cliente-12682': 'assets/npcs/cliente-12682.png',
    'cliente-12687': 'assets/npcs/cliente-12687.png',
    'cliente-12684': 'assets/npcs/cliente-12684.png',
    'cliente-12685': 'assets/npcs/cliente-12685.png',
    'cliente-12686': 'assets/npcs/cliente-12686.png',
  };

  const frames = {
    player: {},
    pets: {},
    clients: {
      'cliente-12683': { x: 92, y: 35, w: 185, h: 271 },
      'cliente-12682': { x: 115, y: 40, w: 161, h: 282 },
      'cliente-12687': { x: 94, y: 23, w: 158, h: 280 },
    },
  };

  function loadAll() {
    const entries = Object.keys(files).map(function (id) {
      return { id: id, src: files[id] };
    });
    return new Promise(function (resolve, reject) {
      const images = {};
      const errors = [];
      let pending = entries.length;
      entries.forEach(function (entry) {
        const image = new Image();
        image.onload = function () {
          if (!image.naturalWidth) errors.push(entry.src);
          else images[entry.id] = image;
          pending -= 1;
          if (pending === 0) {
            if (errors.length) reject(errors);
            else resolve(images);
          }
        };
        image.onerror = function () {
          errors.push(entry.src);
          pending -= 1;
          if (pending === 0) reject(errors);
        };
        image.src = root.PetSpriteData && root.PetSpriteData[entry.id] || entry.src;
      });
    });
  }

  const walking = {
    down:[{x:257,y:59,w:135,h:261},{x:558,y:59,w:135,h:261},{x:862,y:59,w:135,h:261}],
    left:[{x:253,y:350,w:141,h:263},{x:554,y:350,w:141,h:263},{x:861,y:351,w:143,h:262}],
    right:[{x:251,y:645,w:141,h:261},{x:556,y:645,w:143,h:261},{x:862,y:646,w:143,h:260}],
    up:[{x:253,y:937,w:136,h:257},{x:560,y:937,w:134,h:258},{x:864,y:938,w:133,h:256}]
  };
  Object.keys(walking).forEach(function(dir){frames.player[dir]=walking[dir][1];});
  function walkFrame(direction,moving,time){
    var row=walking[direction]||walking.down;
    return row[moving?[0,1,2,1][Math.floor((time||0)/.14)%4]:1];
  }
  Object.keys(root.PetClientFrames||{}).forEach(function(id){frames.clients[id]=root.PetClientFrames[id].down[0];});
  function clientFrame(id,direction,moving,time){
    var sheet=root.PetClientFrames&&root.PetClientFrames[id];
    if(!sheet)return frames.clients[id];
    var row=sheet[direction]||sheet.down;
    return row[moving?Math.floor((time||0)/.12)%row.length:0];
  }
  root.PetAssets = {
    files: files,
    frames: frames,
    walking: walking,
    walkFrame: walkFrame,
    clientFrame: clientFrame,
    loadAll: loadAll,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
