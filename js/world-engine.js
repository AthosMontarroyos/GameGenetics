(function () {
  'use strict';

  // Render do #world e loop do jogo em Phaser (modo CANVAS). A lógica do jogo continua em main.js, via hooks.
  var game = null;
  var images = null;
  var hooks = null;

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function WorldScene() {
    Phaser.Scene.call(this, { key: 'world' });
  }
  WorldScene.prototype = Object.create(Phaser.Scene.prototype);
  WorldScene.prototype.constructor = WorldScene;

  WorldScene.prototype.create = function () {
    this.scenery = null;
    this.actors = {};
    this.occ = [];
    this.arrow = this.add.graphics();
    this.arrow.setDepth(1e6);
    this.arrow.setScale(0.75);
    this.arrow.lineStyle(2, 0x000000, 0.45);
    this.arrow.fillStyle(0xffffff, 1);
    this.arrow.beginPath();
    this.arrow.moveTo(-6, -14);
    this.arrow.lineTo(6, -14);
    this.arrow.lineTo(6, 2);
    this.arrow.lineTo(17, 2);
    this.arrow.lineTo(0, 19);
    this.arrow.lineTo(-17, 2);
    this.arrow.lineTo(-6, 2);
    this.arrow.closePath();
    this.arrow.fillPath();
    this.arrow.strokePath();
    this.arrow.setVisible(false);
  };

  // Cria as texturas que ainda não existem (setImages pode ser chamado várias vezes).
  WorldScene.prototype.syncTextures = function () {
    if (!images) return;
    var textures = this.textures;
    Object.keys(images).forEach(function (key) {
      if (images[key] && images[key].tagName === 'IMG' && !textures.exists(key)) textures.addImage(key, images[key]);
    });
    if (!this.scenery && textures.exists('scenery')) {
      this.scenery = this.add.image(0, 0, 'scenery').setOrigin(0, 0).setDepth(-1);
    }
  };

  // Canvas do oclusor: máscara exata do objeto, ou recorte do cenário (com elipse nos redondos).
  WorldScene.prototype.makeOccluder = function (o, index) {
    var world = hooks.world;
    var mask = o.round ? null : hooks.occluderMask(o);
    var cv;
    var ox;
    var oy;
    if (mask) {
      cv = mask.canvas;
      ox = mask.x;
      oy = mask.y;
    } else {
      ox = Math.max(0, o.x);
      oy = Math.max(0, o.y);
      var w = Math.max(1, Math.min(world.width, o.x + o.w) - ox);
      var h = Math.max(1, Math.min(world.height, o.y + o.h) - oy);
      cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      var c = cv.getContext('2d');
      if (o.round) {
        c.beginPath();
        c.ellipse(o.round[1] - ox, o.round[2] - oy, o.round[3], o.round[4], 0, 0, Math.PI * 2);
        c.clip();
      }
      c.drawImage(images.scenery, ox, oy, w, h, 0, 0, w, h);
    }
    var key = 'occ' + index;
    this.textures.addCanvas(key, cv);
    return this.add.image(ox, oy, key).setOrigin(0, 0).setDepth(o.base).setVisible(false);
  };

  WorldScene.prototype.actorFor = function (a) {
    var item = this.actors[a.key];
    if (!item) {
      if (!this.textures.exists(a.key)) return null;
      var shadow = this.add.graphics();
      shadow.fillStyle(0x281810, 0.28);
      shadow.fillEllipse(0, 0, 32, 12);
      item = this.actors[a.key] = { sprite: this.add.sprite(0, 0, a.key), shadow: shadow };
    }
    return item;
  };

  WorldScene.prototype.update = function (time, delta) {
    if (!hooks) return;
    hooks.update(Math.min(0.05, delta / 1000));
    this.syncTextures();
    var view = hooks.view();
    var self = this;
    var shown = {};
    var list = view ? view.actors : [];
    list.forEach(function (a) {
      var item = self.actorFor(a);
      if (!item) return;
      var f = a.frame;
      var texture = self.textures.get(a.key);
      var name = f.x + ',' + f.y;
      if (!texture.has(name)) texture.add(name, 0, f.x, f.y, f.w, f.h);
      var x = Math.round(a.x);
      var y = Math.round(a.y);
      item.sprite.setFrame(name);
      item.sprite.setScale(hooks.world.actorHeight / (f.referenceHeight || f.h));
      item.sprite.setOrigin((f.anchorX == null ? f.w / 2 : f.anchorX) / f.w, 1);
      item.sprite.setPosition(x, y);
      item.sprite.setDepth(y);
      item.sprite.setVisible(true);
      item.shadow.setPosition(x, y);
      item.shadow.setDepth(y - 0.001);
      item.shadow.setVisible(true);
      shown[a.key] = true;
    });
    Object.keys(this.actors).forEach(function (key) {
      if (shown[key]) return;
      self.actors[key].sprite.setVisible(false);
      self.actors[key].shadow.setVisible(false);
    });
    var world = hooks.world;
    world.occluders.forEach(function (o, i) {
      var img = self.occ[i];
      if (!img) {
        if (!images || !images.scenery) return;
        img = self.occ[i] = self.makeOccluder(o, i);
      }
      img.setVisible(list.some(function (e) {
        return e.y < o.base && e.x + 40 > o.x && e.x - 40 < o.x + o.w && e.y > o.y && e.y - world.actorHeight < o.y + o.h;
      }));
    });
    if (view && view.arrow) {
      var bounce = reducedMotion() ? 0 : Math.sin(time / 240) * 6;
      this.arrow.setPosition(Math.round(view.arrow.x), Math.round(view.arrow.y + bounce));
      this.arrow.setVisible(true);
    } else {
      this.arrow.setVisible(false);
    }
  };

  window.PetWorld = {
    // Cria o jogo dentro de parentEl e devolve o canvas do Phaser.
    init: function (parentEl, h) {
      hooks = h;
      game = new Phaser.Game({
        type: Phaser.CANVAS,
        parent: parentEl,
        width: h.world.width,
        height: h.world.height,
        pixelArt: true,
        backgroundColor: '#120e0c',
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        input: { keyboard: false },
        audio: { noAudio: true },
        pauseOnBlur: false,
        banner: false,
        scene: WorldScene,
      });
      if (!game.canvas) throw new Error('canvas');
      game.canvas.setAttribute('tabindex', '0');
      game.canvas.setAttribute('aria-label', 'Mapa do pet shop');
      game.events.on('pause', function () { game.resume(); });
      return game.canvas;
    },
    setImages: function (map) {
      images = map;
    },
    destroy: function () {
      if (game) game.destroy(true);
      game = null;
    },
  };
})();
