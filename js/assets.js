(function (root) {
  'use strict';

  // Retângulos medidos no PNG real (alfa > 12). 1254 não divide por 4;
  // cada pose usa a primeira coluna da linha daquela direção.
  const files = {
    scenery: 'assets/scenery/pet-shop.png',
    player: 'assets/players/geneticista-01.png',
    mendelino: 'assets/animals/mendelino.png',
    'cliente-12683': 'assets/npcs/cliente-12683.png',
    'cliente-12682': 'assets/npcs/cliente-12682.png',
    'cliente-12687': 'assets/npcs/cliente-12687.png',
  };

  const frames = {
    player: {
      down: { x: 58, y: 37, w: 221, h: 280, anchorX: 128 },
      up: { x: 81, y: 329, w: 214, h: 279, anchorX: 84 },
      left: { x: 65, y: 623, w: 241, h: 283, anchorX: 88 },
      right: { x: 37, y: 912, w: 244, h: 284, anchorX: 146 },
    },
    mendelino: {
      roxo: { x: 61, y: 51, w: 249, h: 257 },
      marrom: { x: 61, y: 338, w: 248, h: 256 },
    },
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
        image.src = entry.src;
      });
    });
  }

  root.PetAssets = {
    files: files,
    frames: frames,
    loadAll: loadAll,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
