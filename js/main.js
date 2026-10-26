(function () {
  'use strict';

  var WORLD = {
    width: 1536,
    height: 1024,
    speed: 220,
    actorHeight: 78,
    spawn: { x: 768, y: 724, dir: 'up' },
    lab: { x: 660, y: 160, w: 120, h: 100 },
    client: { x: 820, y: 632 },
    // Só paredes e objetos bloqueiam; o resto do cenário (1536×1024) é livre, inclusive rua e calçada.
    // Medidos sobre pet-shop.png. Vão da porta: x 718–818.
    blocks: [
      // paredes externas
      { x: 332, y: 24, w: 828, h: 40 },
      { x: 216, y: 92, w: 136, h: 26 },
      { x: 332, y: 24, w: 20, h: 94 },
      { x: 212, y: 92, w: 24, h: 516 },
      { x: 1140, y: 24, w: 20, h: 80 },
      { x: 1140, y: 84, w: 208, h: 40 },
      { x: 1328, y: 84, w: 20, h: 524 },
      // paredes internas
      { x: 212, y: 232, w: 436, h: 22 },
      { x: 634, y: 254, w: 62, h: 100 },
      { x: 754, y: 236, w: 16, h: 122 },
      { x: 764, y: 236, w: 166, h: 118 },
      { x: 924, y: 260, w: 224, h: 40 },
      { x: 662, y: 40, w: 16, h: 152 },
      { x: 784, y: 40, w: 14, h: 196 },
      { x: 1136, y: 104, w: 14, h: 375 },
      { x: 1232, y: 256, w: 16, h: 212 },
      { x: 1236, y: 256, w: 112, h: 22 },
      { x: 1136, y: 364, w: 112, h: 20 },
      { x: 348, y: 186, w: 12, h: 46 },
      { x: 712, y: 42, w: 22, h: 40 },
      { x: 526, y: 60, w: 36, h: 30 },
      { x: 1256, y: 277, w: 62, h: 110 },
      // fachada, portas e quinas
      { x: 214, y: 606, w: 52, h: 112 },
      { x: 264, y: 640, w: 70, h: 72 },
      { x: 331, y: 648, w: 300, h: 77 },
      { x: 920, y: 648, w: 300, h: 77 },
      { x: 1218, y: 640, w: 82, h: 86 },
      { x: 1280, y: 606, w: 70, h: 56 },
      { x: 12, y: 138, w: 18, h: 354 },
    ],
    // Objetos em perspectiva 3/4: [x, y, w, h, base]. Só a base (chão) bloqueia; o resto do desenho
    // passa por cima do personagem quando ele está atrás. base = altura em px a partir do fundo, ou [x, y, w, h].
    objects: [
      // escritório, closet, canis e depósito
      [249, 148, 36, 84, 24],
      [361, 66, 90, 122, 30],
      [361, 165, 26, 40, 20],
      [453, 100, 198, 106, 42],
      [686, 88, 60, 104, 30],
      [810, 60, 270, 152, 50],
      [1085, 104, 44, 100, 26],
      [1154, 112, 82, 104, 30],
      [1248, 126, 68, 98, 28],
      [1159, 258, 25, 36, 18],
      [1154, 308, 36, 54, 26],
      [1158, 426, 80, 56, 30],
      // loja: lado esquerdo e centro
      [242, 258, 40, 188, 28],
      [284, 313, 72, 133, 40],
      [379, 274, 256, 104, 50],
      [433, 355, 122, 92, 46],
      [650, 347, 24, 46, 14],
      [266, 494, 112, 128, 30],
      [381, 576, 38, 60, 22],
      [459, 498, 116, 108, 30],
      [436, 622, 106, 30, 20],
      [652, 490, 236, 104, 56],
      // portas: batentes e folhas de vidro (só a ponta de baixo bloqueia)
      [628, 620, 20, 105, 30],
      [904, 620, 20, 105, 30],
      { foot: [694, 700, 24, 25], occ: [[689, 603, 30, 122]] },
      { foot: [818, 700, 32, 25], occ: [[818, 605, 32, 121]] },
      // loja: lado direito e plantas da porta
      [819, 366, 72, 106, 28],
      [786, 414, 32, 52, 20],
      [928, 296, 148, 112, 30],
      [1080, 314, 40, 70, 22],
      [968, 496, 126, 114, 30],
      [1121, 584, 38, 56, 22],
      [1003, 618, 110, 30, 20],
      [1157, 494, 128, 116, 34],
      [652, 660, 44, 68, 30],
      [851, 655, 50, 72, 30],
      [1296, 665, 42, 56, 24],
      // exterior
      { foot: [28, 695, 60, 26], occ: [['e', 68, 566, 74, 76], [28, 640, 60, 81]] },
      { foot: [157, 745, 24, 26], occ: [[153, 618, 32, 42], [163, 658, 14, 87], [156, 735, 28, 36]] },
      [118, 797, 100, 110, 56],
      { foot: [1458, 745, 44, 26], occ: [['e', 1469, 628, 74, 80], [1444, 703, 67, 68]] },
      { foot: [1366, 820, 26, 26], occ: [[1361, 682, 33, 42], [1371, 722, 14, 98], [1363, 813, 29, 34]] },
      [992, 730, 138, 70, 34],
      [1168, 742, 42, 50, 22],
      { foot: [1424, 300, 50, 25], occ: [[1382, 105, 134, 145], [1438, 249, 24, 52], [1424, 300, 50, 25]] },
      [130, 14, 200, 44, 14],
      [1161, 14, 350, 50, 14],
      [1498, 14, 30, 95, 22],
      [144, 74, 50, 82, 26],
      [36, 166, 82, 86, 44],
      { foot: [72, 140, 42, 26], occ: [['e', 88, 50, 54, 70], [77, 100, 28, 61]] },
      [12, 372, 72, 118, 50],
    ],
  };

  // Cada objeto vira um bloco de chão; as formas do desenho viram oclusores para quem está atrás da base.
  // Forma: [x, y, w, h] ou ['e', cx, cy, rx, ry] (elipse, para copas de árvore).
  var PAD = 6; // margem do oclusor retangular; a máscara descarta o chão que sobrar
  WORLD.occluders = [];
  WORLD.objects.forEach(function (o) {
    var simple = o instanceof Array;
    var foot;
    var shapes;
    if (simple) {
      foot = o[4] instanceof Array ? { x: o[4][0], y: o[4][1], w: o[4][2], h: o[4][3] } : { x: o[0], y: o[1] + o[3] - o[4], w: o[2], h: o[4] };
      shapes = [[o[0], o[1], o[2], o[3]]];
    } else {
      foot = { x: o.foot[0], y: o.foot[1], w: o.foot[2], h: o.foot[3] };
      shapes = o.occ;
    }
    WORLD.blocks.push(foot);
    shapes.forEach(function (s) {
      var round = s[0] === 'e';
      var box = round ? { x: s[1] - s[3], y: s[2] - s[4], w: s[3] * 2, h: s[4] * 2 } : { x: s[0] - PAD, y: s[1] - PAD, w: s[2] + PAD * 2, h: s[3] + PAD * 2 };
      if (box.h > foot.h || box.y < foot.y) WORLD.occluders.push({ x: box.x, y: box.y, w: box.w, h: box.h, base: foot.y + foot.h, round: round ? s : null, key: round ? '' : s.slice(0, 4).join(',') });
    });
  });

  var ORDERS = PetOrders.orders;

  var canvas = document.getElementById('world');
  var worldFailed = !window.PetWorld;
  var modal = document.getElementById('modal');
  var modalTitle = document.getElementById('modal-title');
  var modalKicker = document.getElementById('modal-kicker');
  var modalBody = document.getElementById('modal-body');
  var dialogue = document.getElementById('dialogue');
  var hintEl = document.getElementById('hint');
  var images = null;
  var hintText = '';

  var state = {
    phase: 'inicio',
    loading: false,
    orderIndex: 0,
    orderReceived: false,
    game: null,
    parents: [null, null],
    parentSlot: null,
    labTab: 'analise',
    labSpecies: 'gato',
    pup: null,
    attempts: 0,
    carry: false,
    results: [],
    say: '',
    journalOnly: false,
    panel: null,
    message: '',
    liveNote: '',
    status: '',
    deliverLock: false,
    held: {},
    customer: null,
    player: { x: WORLD.spawn.x, y: WORLD.spawn.y, dir: 'up' },
  };

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'className') node.className = attrs[key];
        else if (key === 'text') node.textContent = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    for (var i = 2; i < arguments.length; i += 1) {
      if (arguments[i] != null && arguments[i] !== false) node.append(arguments[i]);
    }
    return node;
  }

  function button(label, className, onClick, id) {
    var node = el('button', { type: 'button', className: className, text: label });
    if (id) node.id = id;
    node.addEventListener('click', function (event) {
      event.preventDefault();
      onClick();
    });
    return node;
  }

  function currentOrder() {
    return ORDERS[state.orderIndex] || null;
  }

  function phenotypeName(phenotype, speciesId) {
    var names = { roxo: 'pelo roxo', marrom: 'pelo marrom', claro: 'pelo claro', cinza: 'pelo cinza', azul: 'pelo azul', verde: 'pelo verde', laranja: 'pelo laranja', amarelo: 'pelo amarelo' };
    return (names[phenotype] || phenotype) + (speciesId ? ' de ' + PetCatalog.species[speciesId].name : '');
  }

  function formatPercent(value) {
    var pct = Math.round(value * 1000) / 10;
    if (Math.abs(pct - Math.round(pct)) < 0.05) return Math.round(pct) + '%';
    return pct.toFixed(1).replace('.', ',') + '%';
  }

  function animalInfo(id) {
    var animal = PetBreeding.find(state.game, id);
    if (!animal) throw new Error('Bicho não encontrado: ' + id);
    return animal;
  }

  function traitLine(traits) {
    return [PetCatalog.label(traits.color), 'olhos ' + traits.eyes, 'orelhas ' + PetCatalog.label(traits.ears).toLowerCase(), PetCatalog.label(traits.spots).toLowerCase(), 'rabo ' + traits.tail].join(', ');
  }

  function clearKeys() {
    state.held = {};
  }

  function pointInZone(x, y, zone) {
    return x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h;
  }

  function nearClient() {
    if(!state.customer||state.customer.phase!=='waiting'||state.customer.orderIndex!==state.orderIndex)return false;
    var dx = state.player.x - state.customer.x;
    var dy = state.player.y - state.customer.y;
    return dx * dx + dy * dy <= 96 * 96;
  }

  function feetBox(x, y) {
    return { x: x - 10, y: y - 10, w: 20, h: 10 };
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function blocked(box) {
    if (box.x < 0 || box.y < 0 || box.x + box.w > WORLD.width || box.y + box.h > WORLD.height) return true;
    for (var i = 0; i < WORLD.blocks.length; i += 1) {
      if (overlaps(box, WORLD.blocks[i])) return true;
    }
    return false;
  }

  function renderHud() {
    var progress = document.getElementById('progress');
    var summary = document.getElementById('order-summary');
    var objective = document.getElementById('objective');
    var status = document.getElementById('status');
    document.body.classList.toggle('is-playing', state.phase === 'mundo');
    if (state.phase === 'concluido') progress.textContent = ORDERS.length + '/' + ORDERS.length + ' · ' + totalStars() + '★';
    else if (state.phase === 'intervalo') progress.textContent = 'Nível concluído';
    else if (state.phase === 'mundo') {
      var active = currentOrder();
      var activeLevel = active ? PetOrders.levels.find(function (level) { return level.id === active.levelId; }) : null;
      progress.textContent = active ? 'Nível ' + (PetOrders.levels.indexOf(activeLevel) + 1) + ' · Pedido ' + (active.indexInLevel + 1) + '/' + activeLevel.orders.length + ' · ' + totalStars() + '★' : 'Nível concluído';
    }
    else progress.textContent = 'Nível solo';
    var order = currentOrder();
    if (state.phase !== 'mundo' || !order) {
      summary.textContent = '';
      objective.textContent = '';
    } else if (!state.orderReceived) {
      var waiting = state.customer && state.customer.phase === 'waiting';
      summary.textContent = waiting ? 'Atenda o cliente' : 'Cliente a caminho';
      objective.textContent = waiting ? 'Aproxime-se e pressione E.' : 'Aguarde a chegada ao balcão.';
    } else {
      summary.textContent = order.speech;
      objective.textContent = state.carry && state.pup ? 'Leve ' + state.pup.name + ' até o cliente e pressione E.' : 'Escolha dois pais no laboratório e cruze.';
    }
    status.textContent = state.status || '';
  }

  function paintSprite(thumbCanvas, image, frame) {
    var thumbCtx = thumbCanvas.getContext('2d');
    thumbCtx.imageSmoothingEnabled = true;
    thumbCtx.imageSmoothingQuality = 'high';
    thumbCtx.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);
    if (!image || !frame) return;
    var scale = Math.min((thumbCanvas.height * 0.92) / frame.h, (thumbCanvas.width * 0.92) / frame.w);
    var dw = frame.w * scale;
    var dh = frame.h * scale;
    thumbCtx.drawImage(
      image,
      frame.x, frame.y, frame.w, frame.h,
      (thumbCanvas.width - dw) / 2,
      thumbCanvas.height - dh - 4,
      dw,
      dh
    );
  }

  function makeThumb(speciesId, visualId, className) {
    var thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 320;
    thumbCanvas.height = 320;
    thumbCanvas.className = className || 'thumb';
    var species = PetCatalog.species[speciesId];
    if (window.PetSprites && PetSprites.draw(thumbCanvas, speciesId, visualId, images)) return thumbCanvas;
    var frame = PetAssets.frames.pets[visualId];
    paintSprite(thumbCanvas, images && images[species.imageId], frame);
    return thumbCanvas;
  }

  function currentPlan() {
    var order = currentOrder();
    return order && state.game ? state.game.plans[order.indexInLevel] : null;
  }

  function starText(count) { return '★★★'.slice(0, count) + '☆☆☆'.slice(0, 3 - count); }

  function totalStars() { return state.results.reduce(function (sum, item) { return sum + item.stars; }, 0); }

  var TRAITS = ['color', 'eyes', 'ears', 'spots', 'tail'];

  function valueText(trait, value) {
    if (trait === 'eyes') return 'olhos ' + value;
    if (trait === 'tail') return 'rabo ' + value;
    return PetCatalog.label(value);
  }

  function dot(trait, value, slot) {
    if (trait === 'color' || trait === 'eyes') return el('span', { className: 'dot', 'data-tone': value });
    return el('span', { className: 'dot', 'data-slot': String(slot || 0) });
  }

  // Só o que se vê: a aparência. Os genes ficam ocultos; a análise do par aparece na mesa de cruzamento.
  function traitChips(traits, order) {
    var wanted = order ? order.targets : {};
    var row = el('span', { className: 'pet-chips' });
    TRAITS.forEach(function (trait) {
      var isWanted = wanted[trait] === traits[trait];
      row.append(el('span', { className: 'chip chip-' + trait + (isWanted ? ' is-wanted' : '') }, trait === 'color' || trait === 'eyes' ? dot(trait, traits[trait]) : null, valueText(trait, traits[trait])));
    });
    return row;
  }

  function orderFor(speciesId, order) { return order && order.speciesId === speciesId ? order : null; }

  function parentSlot(id) { return state.parents.indexOf(id); }

  function toggleParent(id) {
    var index = parentSlot(id);
    if (index !== -1) {
      state.parents[index] = null;
      if (index === 0) { state.parents[0] = state.parents[1]; state.parents[1] = null; }
    } else if (state.parentSlot !== null) {
      state.parents[state.parentSlot] = id;
    } else if (!state.parents[0]) {
      state.parents[0] = id;
    } else if (!state.parents[1]) {
      state.parents[1] = id;
    } else {
      state.message = 'Remova um pai antes de escolher outro bicho.';
      state.liveNote = state.message;
      renderLab('card-' + id, true);
      return;
    }
    state.parentSlot = null;
    state.labTab = 'analise';
    state.message = '';
    state.liveNote = '';
    renderLab('card-' + id, true);
  }

  function renderSlots(order) {
    var ROLE_NAMES = ['Mãe', 'Pai'];
    var ROLE_ICONS = ['♀', '♂'];
    var ROLE_CSS   = ['sex-femea', 'sex-macho'];
    var SLOT_CSS   = ['slot-mae', 'slot-pai'];
    function slotLabel(pos) {
      return el('span', { className: 'slot-label' },
        el('span', { className: 'sex-icon ' + ROLE_CSS[pos], text: ROLE_ICONS[pos] }),
        ROLE_NAMES[pos]);
    }
    var wrap = el('div', { className: 'slots' });
    for (var slot = 0; slot < 2; slot += 1) {
      var id = state.parents[slot];
      var box = el('div', { className: 'slot ' + SLOT_CSS[slot] + (state.parentSlot === slot ? ' is-target' : '') + (id ? ' is-filled' : ' is-empty') });
      if (!id) {
        (function (position) {
          var choose = button('Escolher ' + ROLE_NAMES[position].toLowerCase(), 'slot-empty', function () { state.parentSlot = position; renderLab('slot-choose-' + position, true); }, 'slot-choose-' + position);
          box.append(slotLabel(position), el('span', { className: 'slot-silhouette', 'aria-hidden': 'true', text: '?' }), choose, el('span', { className: 'slot-help', text: 'Toque em um bicho da lista' }));
        })(slot);
      } else {
        var info = animalInfo(id);
        box.append(slotLabel(slot),
          makeThumb(info.speciesId, info.visualId, 'thumb'),
          el('strong', { className: 'slot-name', text: info.name }));
        (function (animalId, position) {
          box.append(el('div', { className: 'slot-controls' },
            button(state.parentSlot === position ? 'Escolha outro' : 'Trocar', 'text-button', function () { state.parentSlot = position; renderLab('slot-change-' + position, true); }, 'slot-change-' + position),
            button('Remover', 'text-button', function () { toggleParent(animalId); })));
        })(id, slot);
      }
      wrap.append(box);
      if (slot === 0) wrap.append(el('span', { className: 'slot-cross', 'aria-hidden': 'true', text: '×' }));
    }
    return wrap;
  }

  function parentCard(animal, order) {
    var picked = parentSlot(animal.id);
    var card = el('button', { type: 'button', className: 'parent-card' + (picked !== -1 ? ' is-selected' : ''), id: 'card-' + animal.id });
    card.setAttribute('aria-pressed', picked !== -1 ? 'true' : 'false');
    card.setAttribute('aria-label', animal.name + ' · ' + traitLine(animal.traits));
    card.append(
      el('span', { className: 'pet-art', 'data-visual': animal.visualId }, makeThumb(animal.speciesId, animal.visualId, 'thumb'),
        picked !== -1 ? el('span', { className: 'pet-selected', text: picked === 0 ? 'Mãe' : 'Pai' }) : null),
      el('span', { className: 'pet-card-copy' },
        el('span', { className: 'who', text: animal.name }),
        traitChips(animal.traits, orderFor(animal.speciesId, order))));
    card.addEventListener('click', function (event) { event.preventDefault(); toggleParent(animal.id); });
    return card;
  }

  function selectSpecies(speciesId) {
    if (state.labSpecies === speciesId) return;
    state.labSpecies = speciesId;
    state.parents = [null, null];
    state.parentSlot = null;
    state.labTab = 'analise';
    state.message = '';
    state.liveNote = PetCatalog.species[speciesId].name + ': escolha dois pais.';
    renderLab('species-' + speciesId, true);
  }

  function renderSpeciesTabs(order) {
    var tabs = el('div', { className: 'species-tabs', role: 'tablist', 'aria-label': 'Espécie dos pais' });
    Object.keys(PetCatalog.species).forEach(function (speciesId) {
      var species = PetCatalog.species[speciesId];
      var control = labTabButton(species.name, 'species-' + speciesId, state.labSpecies === speciesId, function () { selectSpecies(speciesId); });
      control.textContent = '';
      if (order.speciesId === speciesId) control.classList.add('is-order');
      control.append(makeThumb(speciesId, species.variants[0].id, 'thumb'),
        el('span', { text: species.name }),
        el('span', { className: 'species-count', text: order.speciesId === speciesId ? 'pedido atual' : 'treino' }));
      tabs.append(control);
    });
    return tabs;
  }

  function renderRoster(order) {
    var library = el('section', { className: 'lab-library' });
    var roster = PetBreeding.rosterOf(state.game, state.labSpecies);
    library.append(renderSpeciesTabs(order));
    library.append(el('div', { className: 'collection-heading' },
      el('h3', { text: 'Escolha os pais' }),
      el('span', { text: roster.length + ' bichos' })));
    library.append(el('p', { className: 'collection-notice', text: state.labSpecies === order.speciesId
      ? 'Você só vê a aparência. O que está escondido nos genes pode aparecer no filhote.'
      : 'Treino: este bicho não é o do pedido, então o cruzamento não conta como tentativa.' }));
    var list = el('div', { className: 'parent-list', id: 'pet-collection' });
    roster.forEach(function (animal) { list.append(parentCard(animal, order)); });
    library.append(list);
    return library;
  }

  function pupView(order) {
    var box = el('section', { className: 'litter' });
    var pup = state.pup;
    if (!pup) {
      box.append(el('p', { className: 'empty-note', text: 'Escolha dois pais e cruze. Nasce um filhote sorteado: ele pode ter características que os pais não mostram.' }));
      return box;
    }
    var forOrder = orderFor(pup.speciesId, order);
    box.append(el('h3', { text: pup.name + ' nasceu!' }),
      el('p', { className: 'cross-parents', text: 'Filho de ' + pup.parentNames[0] + ' e ' + pup.parentNames[1] }),
      el('div', { className: 'litter-pup is-single' }, makeThumb(pup.speciesId, pup.visualId, 'thumb'), traitChips(pup.traits, forOrder)));
    if (forOrder) {
      var list = el('ul', { className: 'check-list', 'aria-label': 'Confere com o pedido?' });
      TRAITS.filter(function (trait) { return forOrder.targets[trait]; }).forEach(function (trait) {
        var ok = pup.traits[trait] === forOrder.targets[trait];
        list.append(el('li', { className: ok ? 'is-ok' : 'is-miss' },
          el('span', { className: 'check-mark', 'aria-hidden': 'true', text: ok ? '✓' : '✗' }),
          el('span', { text: ok ? 'Confere: ' + valueText(trait, forOrder.targets[trait]) : 'Pedido: ' + valueText(trait, forOrder.targets[trait]) + ' · saiu: ' + valueText(trait, pup.traits[trait]) })));
      });
      box.append(list);
    } else {
      box.append(el('p', { className: 'empty-note', text: 'Treino: este filhote é de outra espécie e não vale para o pedido.' }));
    }
    return box;
  }

  function journalView(order) {
    var box = el('section', { className: 'journal' });
    var journal = state.game.journal;
    box.append(el('h3', { text: 'Caderno' }));
    if (!journal.length) {
      box.append(el('p', { className: 'empty-note', text: 'Cada cruzamento fica anotado aqui. Compare os pais com o filhote para descobrir o que cada um carrega.' }));
      return box;
    }
    var onlyPicked = state.journalOnly && (state.parents[0] || state.parents[1]);
    box.append(button(state.journalOnly ? 'Mostrar todos' : 'Só os escolhidos', 'text-button', function () { state.journalOnly = !state.journalOnly; renderLab('journal-filter', true); }, 'journal-filter'));
    journal.slice().reverse().forEach(function (entry) {
      if (onlyPicked && !entry.parents.some(function (parent) { return state.parents.indexOf(parent.id) !== -1; })) return;
      box.append(el('div', { className: 'journal-entry' },
        el('div', { className: 'journal-head' }, el('strong', { text: 'Cruzamento ' + entry.number + ' · ' + PetCatalog.species[entry.pup.speciesId].name }), el('span', { text: entry.parents[0].name + ' × ' + entry.parents[1].name })),
        el('div', { className: 'journal-parents' }, traitChips(entry.parents[0].traits), el('span', { className: 'journal-x', 'aria-hidden': 'true', text: '×' }), traitChips(entry.parents[1].traits)),
        el('div', { className: 'journal-pups' }, el('span', { className: 'journal-name', text: 'Filhote ' + entry.pup.name }), traitChips(entry.pup.traits, orderFor(entry.pup.speciesId, order)))));
    });
    return box;
  }

  function labTabButton(label, id, selected, activate) {
    var control = button(label, 'lab-tab' + (selected ? ' is-active' : ''), activate, id);
    control.setAttribute('role', 'tab');
    control.setAttribute('aria-selected', String(selected));
    control.setAttribute('tabindex', selected ? '0' : '-1');
    control.addEventListener('keydown', function (event) {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(event.key) === -1) return;
      event.preventDefault();
      var tabs = Array.prototype.slice.call(event.currentTarget.parentElement.querySelectorAll('[role="tab"]'));
      var index = tabs.indexOf(event.currentTarget);
      var next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click();
    });
    return control;
  }

  function analysisView(order) {
    function alleleSpan(a) { return el('span', { className: 'al al-' + (a === a.toUpperCase() ? 'dom' : 'rec'), text: a }); }
    function allelePill(pair) { return el('span', { className: 'al-pair' }, alleleSpan(pair[0]), alleleSpan(pair[1])); }
    function punnettTable(gene) {
      var tbl = el('div', { className: 'punnett-tbl' });
      var hdr = el('div', { className: 'punnett-r' });
      hdr.append(el('span', { className: 'punnett-corner' }));
      gene.gametesA.forEach(function(g) {
        hdr.append(el('span', { className: 'punnett-hd' }, el('span', { className: 'sex-icon sex-femea', text: '♀' }), alleleSpan(g.genotype)));
      });
      tbl.append(hdr);
      gene.grid.forEach(function(row) {
        var dr = el('div', { className: 'punnett-r' });
        dr.append(el('span', { className: 'punnett-sd' }, el('span', { className: 'sex-icon sex-macho', text: '♂' }), alleleSpan(row.gamete)));
        row.cells.forEach(function(cell) {
          var rec = cell.key === cell.key.toLowerCase();
          dr.append(el('span', { className: 'punnett-cell' + (rec ? ' is-rec' : ' is-dom') }, allelePill(cell.key)));
        });
        tbl.append(dr);
      });
      return tbl;
    }
    function parentGenoEl(genotype, spec) {
      var row = el('div', { className: 'parent-geno' });
      spec.traits.forEach(function(trait) {
        var grp = el('span', { className: 'geno-group' }, el('span', { className: 'geno-lbl', text: trait.name }));
        trait.genes.forEach(function(gene) { grp.append(allelePill(genotype[gene])); });
        row.append(grp);
      });
      return row;
    }
    var box = el('section', { className: 'analysis' });
    var first = state.parents[0] ? animalInfo(state.parents[0]) : null;
    var second = state.parents[1] ? animalInfo(state.parents[1]) : null;
    if (!first || !second) {
      box.append(el('div', { className: 'analysis-empty' },
        el('strong', { text: 'Análise de fenótipos' }),
        el('p', { text: 'Escolha dois pais da mesma espécie. Aqui aparece o que cada característica pode ser no filhote e com que chance.' })));
      return box;
    }
    var speciesId = first.speciesId;
    var spec = PetCatalog.species[speciesId];
    var result = PetCatalog.cross(speciesId, first.genotype, second.genotype);
    var forOrder = orderFor(speciesId, order);
    var targets = forOrder ? forOrder.targets : {};
    if (forOrder) {
      var nonSexTargets = {};
      Object.keys(targets).forEach(function (k) { if (k !== 'sex') nonSexTargets[k] = targets[k]; });
      var chance = PetCatalog.chanceFor(result, nonSexTargets) * (targets.sex ? 0.5 : 1);
      var plan = currentPlan();
      var fill = el('span', { className: 'meter-fill' });
      fill.style.width = Math.round(chance * 100) + '%';
      box.append(el('div', { className: 'chance-card' + (chance >= 0.5 ? ' is-high' : chance === 0 ? ' is-zero' : ''), role: 'status' },
        el('div', { className: 'chance-main' }, el('span', { className: 'chance-label', text: 'Chance de sair o pedido' }), el('strong', { className: 'chance-number', text: formatPercent(chance) })),
        el('span', { className: 'meter' }, fill),
        el('span', { className: 'chance-best', text: chance === 0 ? 'Com esse par é impossível: troque um dos pais.' : plan && plan.chance > 0 ? 'Melhor par do viveiro: ' + formatPercent(plan.chance) : '' })));
    } else {
      box.append(el('p', { className: 'training-note', text: 'Treino: o cliente quer ' + PetOrders.nouns[order.speciesId] + '. Esta análise não conta para o pedido.' }));
    }
    // Fenótipos individuais de cada pai
    var maeCard = el('div', { className: 'parent-pheno-card parent-pheno-mae' },
      el('div', { className: 'parent-pheno-head' },
        el('span', { className: 'sex-icon sex-femea', text: '♀' }),
        el('strong', { className: 'parent-role-label', text: 'Mãe' }),
        el('span', { className: 'parent-pheno-name', text: first.name })),
      traitChips(first.traits, forOrder),
      parentGenoEl(first.genotype, spec));
    var paiCard = el('div', { className: 'parent-pheno-card parent-pheno-pai' },
      el('div', { className: 'parent-pheno-head' },
        el('span', { className: 'sex-icon sex-macho', text: '♂' }),
        el('strong', { className: 'parent-role-label', text: 'Pai' }),
        el('span', { className: 'parent-pheno-name', text: second.name })),
      traitChips(second.traits, forOrder),
      parentGenoEl(second.genotype, spec));
    box.append(el('div', { className: 'parents-pheno' },
      maeCard,
      el('span', { className: 'parent-pheno-sep', 'aria-hidden': 'true', text: '×' }),
      paiCard));

    var rows = el('div', { className: 'trait-rows' });
    spec.traits.forEach(function (trait) {
      var probs = result.traitProbabilities[trait.id];
      var wantedValue = targets[trait.id];
      var bar = el('div', { className: 'prob-bar' });
      var legend = el('ul', { className: 'prob-legend' });
      trait.values.forEach(function (value, index) {
        var p = probs[value] || 0;
        if (p <= 0) return;
        var seg = el('span', { className: 'prob-seg' + (wantedValue === value ? ' is-wanted' : '') });
        seg.setAttribute(trait.id === 'color' || trait.id === 'eyes' ? 'data-tone' : 'data-slot', trait.id === 'color' || trait.id === 'eyes' ? value : String(index));
        seg.style.flexGrow = String(p);
        bar.append(seg);
        legend.append(el('li', { className: wantedValue === value ? 'is-wanted' : '' }, dot(trait.id, value, index), el('span', { text: valueText(trait.id, value) }), el('strong', { text: p >= 0.9995 ? 'sempre' : formatPercent(p) })));
      });
      var traitRowEl = el('div', { className: 'trait-row' + (wantedValue ? ' is-asked' : '') },
        el('div', { className: 'trait-head' }, el('strong', { text: trait.name }), wantedValue ? el('span', { className: 'trait-tag', text: 'pedido' }) : null,
          el('span', { className: 'trait-parents' },
            el('span', { className: 'mini' }, el('span', { className: 'sex-icon sex-femea mini-sex', text: '♀' }), dot(trait.id, first.traits[trait.id], trait.values.indexOf(first.traits[trait.id])), valueText(trait.id, first.traits[trait.id])),
            el('span', { className: 'mini-x', 'aria-hidden': 'true', text: '×' }),
            el('span', { className: 'mini' }, el('span', { className: 'sex-icon sex-macho mini-sex', text: '♂' }), dot(trait.id, second.traits[trait.id], trait.values.indexOf(second.traits[trait.id])), valueText(trait.id, second.traits[trait.id])))),
        bar, legend);
      if (trait.genes.length === 1) {
        var locusIdx = spec.loci.indexOf(trait.genes[0]);
        traitRowEl.append(punnettTable(result.perGene[locusIdx]));
      }
      rows.append(traitRowEl);
    });
    box.append(rows);

    var basePhenoEntries = Object.keys(result.appearances).map(function (key) {
      return { traits: PetCatalog.traitsFromKey(key), p: result.appearances[key] };
    });
    var phenoEntries = [];
    ['macho', 'femea'].forEach(function (sex) {
      basePhenoEntries.forEach(function (entry) {
        phenoEntries.push({ traits: Object.assign({}, entry.traits, { sex: sex }), p: entry.p * 0.5 });
      });
    });
    phenoEntries.sort(function (a, b) {
      if (Math.abs(b.p - a.p) > 1e-9) return b.p - a.p;
      return a.traits.sex === 'macho' ? -1 : 1;
    });

    if (phenoEntries.length > 0) {
      var phenoCount = phenoEntries.length;
      var phenoHead = el('div', { className: 'pheno-head' },
        el('strong', { text: 'Fenótipos possíveis' }),
        el('span', { className: 'pheno-count', text: phenoCount + (phenoCount === 1 ? ' combinação' : ' combinações') }));
      var phenoList = el('div', { className: 'pheno-list' });
      var nonSexTargetsPh = {};
      Object.keys(targets).forEach(function (k) { if (k !== 'sex') nonSexTargetsPh[k] = targets[k]; });
      phenoEntries.forEach(function (entry) {
        var traitsMatch = Object.keys(nonSexTargetsPh).length === 0 || PetCatalog.matches(entry.traits, nonSexTargetsPh);
        var sexMatch = !targets.sex || entry.traits.sex === targets.sex;
        var isTarget = Object.keys(targets).length > 0 && traitsMatch && sexMatch;
        var pctFill = el('span', { className: 'pheno-fill' });
        pctFill.style.width = Math.max(2, Math.round(entry.p * 100)) + '%';
        var sexIcon = entry.traits.sex === 'macho' ? '♂' : '♀';
        var descText = PetCatalog.label(entry.traits.color) + ' · olhos ' + entry.traits.eyes + ' · ' + PetCatalog.label(entry.traits.ears).toLowerCase() + ' · ' + PetCatalog.label(entry.traits.spots).toLowerCase() + ' · rabo ' + entry.traits.tail;
        phenoList.append(el('div', { className: 'pheno-row' + (isTarget ? ' is-target' : '') },
          el('span', { className: isTarget ? 'pheno-match' : 'pheno-rank', 'aria-hidden': 'true', text: isTarget ? '✓' : '' }),
          el('span', { className: 'pheno-desc' },
            el('span', { className: 'sex-icon sex-' + entry.traits.sex, 'aria-label': entry.traits.sex, text: sexIcon }),
            el('span', { className: 'dot', 'data-tone': entry.traits.color }),
            el('span', { text: descText })),
          el('span', { className: 'pheno-bar-wrap' }, el('span', { className: 'pheno-bar' }, pctFill)),
          el('strong', { className: 'pheno-pct', text: entry.p >= 0.9995 ? 'sempre' : formatPercent(entry.p) })));
      });
      box.append(el('div', { className: 'pheno-section' }, phenoHead, phenoList));
    }

    return box;
  }

  function renderTable(order) {
    var table = el('aside', { className: 'lab-table', 'aria-label': 'Mesa de cruzamento' },
      el('div', { className: 'selection-heading' }, el('h3', { text: 'Mesa de cruzamento' }), el('span', { text: state.parents.filter(Boolean).length + '/2 pais' })), renderSlots(order));
    var tabs = el('div', { className: 'analysis-tabs', role: 'tablist', 'aria-label': 'Análise, filhote e caderno' });
    [['analise', 'Análise'], ['filhote', 'Filhote'], ['caderno', 'Caderno']].forEach(function (entry) {
      var control = labTabButton(entry[1], 'analysis-' + entry[0], state.labTab === entry[0], function () { state.labTab = entry[0]; renderLab('analysis-' + entry[0], true); });
      control.setAttribute('aria-controls', 'analysis-panel');
      tabs.append(control);
    });
    var panel = el('div', { className: 'analysis-panel', id: 'analysis-panel', role: 'tabpanel', 'aria-labelledby': 'analysis-' + state.labTab, tabindex: '0' });
    if (state.message) panel.append(el('p', { className: 'alert', text: state.message }));
    panel.append(state.labTab === 'caderno' ? journalView(order) : state.labTab === 'filhote' ? pupView(order) : analysisView(order));
    table.append(tabs, panel, renderBenchActions());
    return table;
  }

  function orderRibbon(order) {
    var plan = currentPlan();
    var want = el('span', { className: 'pet-chips' });
    PetCatalog.species[order.speciesId].traits.forEach(function (trait) {
      var value = order.targets[trait.id];
      if (value) want.append(el('span', { className: 'chip is-wanted chip-' + trait.id }, trait.id === 'color' || trait.id === 'eyes' ? dot(trait.id, value) : null, PetOrders.phrase(trait.id, value)));
    });
    if (order.targets.sex) want.append(el('span', { className: 'chip is-wanted chip-sex' },
      el('span', { className: 'sex-icon sex-' + order.targets.sex, text: order.targets.sex === 'macho' ? '♂' : '♀' }),
      PetOrders.phrase('sex', order.targets.sex)));
    return el('div', { className: 'lab-ribbon' },
      el('div', { className: 'ribbon-copy' }, el('span', { className: 'order-client', text: 'Pedido de ' + order.clientName }), el('strong', { text: order.speech }), want),
      el('div', { className: 'ribbon-meta' },
        el('span', { className: 'ribbon-count', text: state.attempts === 0 ? 'Nenhum cruzamento ainda' : state.attempts + (state.attempts === 1 ? ' cruzamento' : ' cruzamentos') }),
        plan ? el('span', { className: 'ribbon-stars', text: '★★★ até ' + plan.par + ' cruzamentos' }) : null));
  }

  // Chance de um filhote do par escolhido atender ao pedido, pela mesma lógica de cruzamento do catálogo.
  function labChance(order) {
    if (!state.parents[0] || !state.parents[1]) return null;
    var first = animalInfo(state.parents[0]);
    var second = animalInfo(state.parents[1]);
    if (first.speciesId !== order.speciesId || second.speciesId !== order.speciesId) return null;
    var tgt = order.targets || {};
    var noSex = {};
    Object.keys(tgt).forEach(function (k) { if (k !== 'sex') noSex[k] = tgt[k]; });
    var base = PetCatalog.chanceFor(PetCatalog.cross(order.speciesId, first.genotype, second.genotype), noSex);
    return tgt.sex ? base * 0.5 : base;
  }

  function renderBenchActions() {
    var actions = el('div', { className: 'bench-actions', role: 'group', 'aria-label': 'Ações do laboratório' });
    var ready = !!(state.parents[0] && state.parents[1]);
    var cross = button('Cruzar', '', doBreed, 'btn-cruzar');
    cross.disabled = !ready;
    var clear = button('Limpar seleção', 'secondary', clearParents, 'btn-limpar');
    clear.disabled = !(state.parents[0] || state.parents[1]);
    if (state.pup) actions.append(button('Entregar este filhote', 'deliver', reserveForDelivery, 'btn-deliver'));
    actions.append(cross, clear);
    return actions;
  }

  function renderLab(focusId, preventScroll) {
    var order = currentOrder();
    var card = document.getElementById('modal-card');
    var samePanel = modal.dataset.panel === state.panel;
    var savedScroll = samePanel ? card.scrollTop : 0;
    dialogue.hidden = true;
    modalTitle.textContent = 'Laboratório';
    modalKicker.textContent = 'Escolha dois pais, cruze e entregue o filhote';
    modal.classList.add('is-bench');
    modal.classList.remove('is-help');
    modalBody.textContent = '';
    modalBody.append(orderRibbon(order), el('div', { className: 'lab-workspace' }, renderRoster(order), renderTable(order)));
    modal.dataset.panel = state.panel;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    card.scrollTop = savedScroll;
    syncInert();
    announceChoice();
    var target = document.getElementById(focusId || 'btn-cruzar') || document.getElementById('btn-cruzar');
    if (target && !target.disabled) target.focus({ preventScroll: !!preventScroll });
  }

  function renderHelp() {
    dialogue.hidden = true;
    modalTitle.textContent = 'Ajuda';
    modalKicker.textContent = 'Controles e como jogar';
    modal.classList.add('is-help');
    modal.classList.remove('is-bench');
    modalBody.textContent = '';
    modalBody.append(
      el('h3', { text: 'Controles' }),
      el('ul', {},
        el('li', { text: 'WASD ou setas: andar.' }),
        el('li', { text: 'E: falar com o cliente, abrir o laboratório ou entregar.' }),
        el('li', { text: 'Esc: fechar o painel.' })
      ),
      el('h3', { text: 'Como jogar' }),
      el('ul', {},
        el('li', { text: 'Atenda o cliente e leia o pedido: ele quer um filhote com todas as características pedidas.' }),
        el('li', { text: 'No laboratório, escolha dois pais e cruze. Você vê só a aparência deles; os genes ficam escondidos.' }),
        el('li', { text: 'Há três bichos: gatinho, cachorrinho e coelhinho. Os pais têm de ser da mesma espécie. A aba do pedido conta tentativas; as outras são só treino.' }),
        el('li', { text: 'Nasce um filhote sorteado. Se ele tiver tudo o que o cliente pediu, escolha “Entregar este filhote” e leve até o balcão.' }),
        el('li', { text: 'Se não tiver, cruze de novo ou troque os pais. O caderno guarda os cruzamentos: compare pais e filhotes para descobrir o que cada um carrega.' }),
        el('li', { text: 'Quanto menos cruzamentos, mais estrelas.' })
      ),
      el('p', { text: 'Modelo didático fictício. Não descreve a genética real desses animais.' })
    );
    modal.hidden = false;
    document.body.classList.add('modal-open');
    syncInert();
    document.getElementById('btn-fechar-painel').focus();
  }

  function renderDialogue() {
    var order = currentOrder();
    dialogue.textContent = '';
    var thumb = document.createElement('canvas');
    thumb.className = 'dialogue-portrait';
    thumb.width = 256;
    thumb.height = 256;
    thumb.setAttribute('aria-hidden', 'true');
    if (images && images[order.clientId]) {
      var frame = PetAssets.frames.clients[order.clientId];
      paintSprite(thumb, images[order.clientId], { x: frame.x, y: frame.y, w: frame.w, h: Math.min(frame.w, frame.h) });
    }
    var copy = el('div', { className: 'dialogue-copy' },
      el('h2', { id: 'dialogue-name', text: order.clientName }),
      el('p', { text: state.say || order.speech })
    );
    var actions = el('div', { className: 'dialogue-actions' },
      button('Continuar · E', '', closePanel, 'btn-ir-lab')
    );
    dialogue.append(thumb, copy, actions);
    dialogue.hidden = false;
    modal.hidden = true;
    document.body.classList.add('modal-open');
    syncInert();
    document.getElementById('btn-ir-lab').focus();
  }

  function renderModal(focusId, preventScroll) {
    if (state.panel === 'pedido') renderDialogue();
    else if (state.panel === 'ajuda') renderHelp();
    else renderLab(focusId, preventScroll);
  }

  function announceChoice() {
    var live = document.getElementById('choice-live');
    if (!live) return;
    if (state.panel !== 'pais') {
      live.textContent = '';
      return;
    }
    var text = state.liveNote || '';
    if (!text) {
      var first = state.parents[0] ? animalInfo(state.parents[0]).name : '';
      var second = state.parents[1] ? animalInfo(state.parents[1]).name : '';
      if (!first) text = 'Nenhum pai selecionado.';
      else if (!second) text = 'Pai 1: ' + first + '. Selecione mais um pai.';
      else text = 'Pai 1: ' + first + '. Pai 2: ' + second + '. Pronto para cruzar.';
    }
    if (live.textContent !== text) live.textContent = text;
  }

  function syncInert() {
    var start = document.getElementById('screen-start');
    var end = document.getElementById('screen-end');
    var stage = document.getElementById('stage');
    var startOpen = !start.hidden;
    var endOpen = !end.hidden;
    var dialogueOpen = state.panel === 'pedido';
    var modalOpen = state.panel === 'pais' || state.panel === 'ajuda';
    stage.inert = startOpen || endOpen || dialogueOpen || modalOpen;
    dialogue.inert = !dialogueOpen;
    modal.inert = !modalOpen;
    start.inert = !startOpen;
    end.inert = !endOpen;
  }

  function activeSurface() {
    var start = document.getElementById('screen-start');
    var end = document.getElementById('screen-end');
    if (!start.hidden) return start;
    if (!end.hidden) return end;
    if (state.panel === 'pais' || state.panel === 'ajuda') return modal;
    if (state.panel === 'pedido') return dialogue;
    return null;
  }

  function focusableIn(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('button, summary, a[href], input, select, textarea'),
      function (node) {
        return !node.disabled && !node.closest('[hidden]') && !node.closest('[inert]');
      }
    );
  }

  function trapTab(event, surface) {
    var items = focusableIn(surface);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    var current = document.activeElement;
    if (event.shiftKey && (current === first || !surface.contains(current))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === last || !surface.contains(current))) {
      event.preventDefault();
      first.focus();
    }
  }
  function openPanel(name, focusId, preventScroll) {
    state.panel = name;
    clearKeys();
    renderHud();
    renderModal(focusId, preventScroll);
  }

  function closePanel() {
    if (!state.panel) return;
    state.panel = null;
    state.message = '';
    state.liveNote = '';
    modal.hidden = true;
    modal.classList.remove('is-bench');
    modal.classList.remove('is-help');
    modal.dataset.panel = '';
    dialogue.hidden = true;
    document.body.classList.remove('modal-open');
    clearKeys();
    syncInert();
    renderHud();
    canvas.focus();
  }

  function clearParents() {
    state.parents = [null, null];
    state.parentSlot = null;
    state.labTab = 'analise';
    state.message = '';
    state.liveNote = '';
    renderLab('btn-cruzar', true);
  }

  function doBreed() {
    if (!state.parents[0] || !state.parents[1]) {
      state.message = 'Escolha dois pais para cruzar.';
      state.liveNote = state.message;
      renderLab('btn-cruzar', true);
      return;
    }
    var result = PetBreeding.cross(state.game, state.parents[0], state.parents[1]);
    if (!result.ok) {
      state.message = result.reason;
      state.liveNote = result.reason;
      renderLab('btn-cruzar', true);
      return;
    }
    var forOrder = result.pup.speciesId === currentOrder().speciesId;
    if (forOrder) state.attempts += 1;
    state.pup = result.pup;
    state.carry = false;
    state.labTab = 'filhote';
    state.message = forOrder ? '' : 'Treino: ' + result.pup.name + ' é de outra espécie e não conta para o pedido.';
    state.liveNote = result.pup.name + ' nasceu: ' + traitLine(result.pup.traits) + '.';
    renderHud();
    renderLab('btn-deliver', true);
  }

  function reserveForDelivery() {
    if (!state.pup) return;
    state.carry = true;
    state.status = 'Leve ' + state.pup.name + ' até o cliente.';
    closePanel();
  }

  function mismatchText(order, pup, wrong) {
    return wrong.map(function (key) {
      return 'pedi ' + PetOrders.phrase(key, order.targets[key]) + ', mas ele tem ' + PetOrders.phrase(key, pup.traits[key]);
    }).join('; ') + '.';
  }

  // O cliente confere só a aparência do filhote que o jogador trouxe.
  function tryDeliver() {
    var order = currentOrder();
    var pup = state.pup;
    if (!state.carry || !pup) {
      state.carry = false;
      state.status = 'Cruze no laboratório e traga o filhote.';
      renderHud();
      return;
    }
    if (pup.speciesId !== order.speciesId) {
      state.carry = false;
      state.pup = null;
      state.say = 'Hmm, eu queria ' + PetOrders.nouns[order.speciesId] + ', não ' + PetOrders.nouns[pup.speciesId] + '. Pode tentar outro cruzamento?';
      state.status = '';
      openPanel('pedido', 'btn-ir-lab');
      return;
    }
    var wrong = PetBreeding.mismatches(order.targets, pup.traits);
    if (!wrong.length) {
      completeOrder(PetBreeding.stars(state.attempts, currentPlan()));
      return;
    }
    state.carry = false;
    state.pup = null;
    state.say = 'Hmm, ' + pup.name + ' não é bem o que eu queria: ' + mismatchText(order, pup, wrong) + ' Pode tentar outro cruzamento?';
    state.status = '';
    openPanel('pedido', 'btn-ir-lab');
  }

  function createGameFor(order) {
    var level = PetOrders.levels.find(function (item) { return item.id === order.levelId; });
    return PetBreeding.create(level.orders);
  }

  function completeOrder(stars) {
    if (state.phase !== 'mundo' || state.panel || state.deliverLock) return;
    state.deliverLock = true;
    PetCustomers.leave(state.customer);
    var finished = currentOrder();
    state.results.push({ order: state.orderIndex, stars: stars, attempts: state.attempts });
    state.carry = false;
    state.pup = null;
    state.parents = [null, null];
    state.parentSlot = null;
    state.orderReceived = false;
    state.message = '';
    state.liveNote = '';
    state.say = '';
    state.attempts = 0;
    state.orderIndex += 1;
    var summary = totalStars() + ' de ' + ORDERS.length * 3 + ' estrelas';
    if (state.orderIndex >= ORDERS.length) {
      state.phase = 'concluido';
      state.status = '';
      state.panel = null;
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      document.getElementById('screen-end').hidden = false;
      document.getElementById('end-title').textContent = 'Jogo concluído';
      document.getElementById('done-count').textContent = ORDERS.length + '/' + ORDERS.length + ' pedidos entregues · ' + summary;
      document.getElementById('end-copy').textContent = 'Você entregou todos os filhotes escolhendo os pais certos.';
      document.getElementById('end-details').hidden = false;
      document.getElementById('btn-next-level').hidden = true;
      syncInert();
      renderHud();
      document.getElementById('btn-restart').focus();
      state.deliverLock = false;
      return;
    }
    if (currentOrder().levelId !== finished.levelId) {
      var levelOrders = PetOrders.levels.find(function (level) { return level.id === finished.levelId; }).orders;
      var levelStars = state.results.filter(function (item) { return ORDERS[item.order].levelId === finished.levelId; }).reduce(function (sum, item) { return sum + item.stars; }, 0);
      state.phase = 'intervalo';
      state.status = '';
      state.panel = null;
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      document.getElementById('screen-end').hidden = false;
      document.getElementById('end-title').textContent = 'Nível concluído';
      document.getElementById('done-count').textContent = levelStars + ' de ' + levelOrders.length * 3 + ' estrelas neste nível';
      document.getElementById('end-copy').textContent = currentOrder().levelName + ' traz pedidos mais difíceis para os três bichos. Continue quando quiser.';
      document.getElementById('end-details').hidden = true;
      document.getElementById('btn-next-level').hidden = false;
      syncInert();
      renderHud();
      document.getElementById('btn-next-level').focus();
      state.deliverLock = false;
      return;
    }
    state.status = 'Pedido entregue: ' + starText(stars);
    renderHud();
    state.deliverLock = false;
  }

  function interact() {
    if (state.phase !== 'mundo' || state.panel) return;
    var atService = nearClient();
    var atLab = pointInZone(state.player.x, state.player.y, WORLD.lab);
    if (atService) {
      if (!state.orderReceived) {
        state.orderReceived = true;
        state.status = '';
        state.say = '';
        openPanel('pedido', 'btn-ir-lab');
        return;
      }
      if (state.carry) {
        tryDeliver();
        return;
      }
      state.say = '';
      openPanel('pedido', 'btn-ir-lab');
      return;
    }
    if (atLab && !state.orderReceived) {
      state.status = 'Fale com o cliente primeiro.';
      renderHud();
      return;
    }
    if (atLab) {
      state.status = '';
      if (state.labSpecies !== currentOrder().speciesId) {
        state.labSpecies = currentOrder().speciesId;
        state.parents = [null, null];
        state.parentSlot = null;
      }
      openPanel('pais', 'btn-cruzar');
    }
  }

  function directionFromEvent(event) {
    var code = event.code;
    var key = (event.key || '').toLowerCase();
    if (code === 'ArrowUp' || code === 'KeyW' || key === 'w') return 'up';
    if (code === 'ArrowDown' || code === 'KeyS' || key === 's') return 'down';
    if (code === 'ArrowLeft' || code === 'KeyA' || key === 'a') return 'left';
    if (code === 'ArrowRight' || code === 'KeyD' || key === 'd') return 'right';
    return '';
  }

  function onKeyDown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    var surface = activeSurface();
    if (surface && event.key === 'Tab') trapTab(event, surface);
    if (!document.getElementById('screen-start').hidden) {
      if (event.key === 'Escape') showMenuPage('home');
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        var menuButtons = focusableIn(document.getElementById('screen-start'));
        if (menuButtons.length) {
          var currentIndex = menuButtons.indexOf(document.activeElement);
          var nextIndex = currentIndex < 0 ? 0 : (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) + menuButtons.length) % menuButtons.length;
          menuButtons[nextIndex].focus();
        }
      }
      return;
    }
    var arrows = event.code === 'ArrowUp' || event.code === 'ArrowDown' || event.code === 'ArrowLeft' || event.code === 'ArrowRight';
    if (state.phase === 'mundo' && !state.panel && !surface && arrows) event.preventDefault();
    if (event.repeat) return;
    if (state.panel === 'pedido' && (event.code === 'KeyE' || event.code === 'Enter' || event.code === 'Space')) {
      event.preventDefault();
      closePanel();
      return;
    }
    if (!surface && state.phase === 'mundo' && !state.panel && isMoveCode(event.code)) state.held[event.code] = true;
    if (!surface && state.phase === 'mundo' && !state.panel && (event.code === 'KeyH' || (event.key || '').toLowerCase() === 'h')) openPanel('ajuda', 'btn-fechar-painel');
    if (!surface && (event.code === 'KeyE' || (event.key || '').toLowerCase() === 'e')) interact();
    if (event.code === 'Escape' && state.panel) closePanel();
  }

  function isMoveCode(code) {
    return code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight' ||
      code === 'KeyW' || code === 'KeyA' || code === 'KeyS' || code === 'KeyD';
  }

  function onKeyUp(event) {
    delete state.held[event.code];
  }

  function readAxis() {
    var up = state.held.ArrowUp || state.held.KeyW;
    var down = state.held.ArrowDown || state.held.KeyS;
    var left = state.held.ArrowLeft || state.held.KeyA;
    var right = state.held.ArrowRight || state.held.KeyD;
    var x = 0;
    var y = 0;
    if (left) x -= 1;
    if (right) x += 1;
    if (up) y -= 1;
    if (down) y += 1;
    if (x !== 0 && y !== 0) {
      var scale = Math.SQRT1_2;
      x *= scale;
      y *= scale;
    }
    return { x: x, y: y };
  }

  function update(dt) {
    if(state.phase!=='inicio'&&!state.panel){
      var customerChanged=PetCustomers.update(state.customer,dt);
      if(state.customer&&state.customer.phase==='gone'&&state.phase==='mundo'&&currentOrder()){
        state.customer=PetCustomers.create(currentOrder(),state.orderIndex);customerChanged=true;
      }
      if(customerChanged)renderHud();
    }
    state.player.moving=false;
    if (state.phase === 'mundo' && !state.panel) {
      var axis = readAxis();
      if (axis.x || axis.y) {
        var previousX=state.player.x,previousY=state.player.y;
        var distance = WORLD.speed * dt;
        var nextX = state.player.x + axis.x * distance;
        if (!blocked(feetBox(nextX, state.player.y))) state.player.x = nextX;
        var nextY = state.player.y + axis.y * distance;
        if (!blocked(feetBox(state.player.x, nextY))) state.player.y = nextY;
        if (Math.abs(axis.x) > Math.abs(axis.y)) state.player.dir = axis.x > 0 ? 'right' : 'left';
        else state.player.dir = axis.y > 0 ? 'down' : 'up';
        state.player.moving=state.player.x!==previousX||state.player.y!==previousY;
      }
    }
    state.player.walkTime=state.player.moving?(state.player.walkTime||0)+dt:0;
    var nextHint = '';
    if (state.phase === 'mundo' && !state.panel) {
      var atService = nearClient();
      var atLab = pointInZone(state.player.x, state.player.y, WORLD.lab);
      if (atService && state.carry) nextHint = '[E] Entregar';
      else if (atService && state.orderReceived) nextHint = '[E] Ver pedido';
      else if (atService) nextHint = '[E] Conversar';
      else if (atLab && state.orderReceived) nextHint = '[E] Viveiro';
    }
    if (nextHint !== hintText) {
      hintText = nextHint;
      hintEl.hidden = !nextHint;
      hintEl.textContent = nextHint;
    }
  }

  // Máscara exata do objeto (js/occluders.js): só os pixels do próprio objeto cobrem o personagem, não o chão em volta.
  function occluderMask(o) {
    if (o.mask !== undefined) return o.mask;
    o.mask = null;
    var runs = window.PetOccluders && window.PetOccluders[o.key];
    if (!runs) return null;
    var x0 = Math.max(0, o.x);
    var y0 = Math.max(0, o.y);
    var w = Math.min(WORLD.width, o.x + o.w) - x0;
    var h = Math.min(WORLD.height, o.y + o.h) - y0;
    var mask = document.createElement('canvas');
    mask.width = w;
    mask.height = h;
    var mctx = mask.getContext('2d');
    var pos = 0;
    var solid = false;
    runs.split(',').forEach(function (value) {
      var len = +value;
      while (solid && len > 0) {
        var row = Math.floor(pos / w);
        var col = pos % w;
        var span = Math.min(len, w - col);
        mctx.fillRect(col, row, span, 1);
        pos += span;
        len -= span;
      }
      if (!solid) pos += len;
      solid = !solid;
    });
    mctx.globalCompositeOperation = 'source-in';
    mctx.drawImage(images.scenery, x0, y0, w, h, 0, 0, w, h);
    o.mask = { canvas: mask, x: x0, y: y0 };
    return o.mask;
  }

  function resetPlay() {
    state.phase = 'mundo';
    state.orderIndex = 0;
    state.orderReceived = false;
    state.parents = [null, null];
    state.parentSlot = null;
    state.labTab = 'analise';
    state.pup = null;
    state.attempts = 0;
    state.carry = false;
    state.results = [];
    state.say = '';
    state.journalOnly = false;
    state.game = createGameFor(currentOrder());
    state.panel = null;
    state.message = '';
    state.liveNote = '';
    state.status = '';
    state.deliverLock = false;
    state.player.x = WORLD.spawn.x;
    state.player.y = WORLD.spawn.y;
    state.player.dir = WORLD.spawn.dir;
    state.player.moving=false;state.player.walkTime=0;
    state.customer=PetCustomers.create(currentOrder(),state.orderIndex);
    clearKeys();
    hintText = '';
    hintEl.hidden = true;
    hintEl.textContent = '';
    modal.hidden = true;
    modal.classList.remove('is-bench');
    modal.classList.remove('is-help');
    modal.dataset.panel = '';
    document.getElementById('modal-card').scrollTop = 0;
    dialogue.hidden = true;
    document.body.classList.remove('modal-open');
    syncInert();
    renderHud();
  }

  function continueLevel() {
    if (state.phase !== 'intervalo') return;
    document.getElementById('screen-end').hidden = true;
    state.phase = 'mundo';
    state.game = createGameFor(currentOrder());
    state.status = '';
    syncInert();
    renderHud();
    canvas.focus();
  }

  function showLoadError(failed) {
    var paths = Array.isArray(failed) ? failed.join(', ') : String(failed);
    var error = document.getElementById('load-error');
    error.textContent = 'Não foi possível carregar: ' + paths + '. Confira se a pasta assets está junto de index.html e se esses arquivos PNG existem.';
    error.hidden = false;
  }

  async function onPlay() {
    if (state.loading || state.phase === 'mundo') return;
    state.loading = true;
    var playButton = document.getElementById('btn-play');
    var error = document.getElementById('load-error');
    error.hidden = true;
    playButton.disabled = true;
    playButton.textContent = 'Carregando...';
    try {
      if (!window.PetAssets || !window.PetGenetics) {
        throw new Error('scripts locais de genética ou de imagens');
      }
      if (worldFailed) throw new Error('vendor/phaser.min.js');
      if (!images || !images.player) images = await PetAssets.loadAll();
      PetWorld.setImages(images);
      document.getElementById('screen-start').hidden = true;
      document.getElementById('screen-end').hidden = true;
      resetPlay();
      canvas.focus();
    } catch (failed) {
      showLoadError(failed);
    } finally {
      state.loading = false;
      playButton.disabled = false;
      playButton.textContent = 'Jogar';
    }
  }

  function onRestart() {
    document.getElementById('screen-end').hidden = true;
    resetPlay();
    canvas.focus();
  }

  function showMenuPage(page) {
    document.getElementById('menu-home').hidden = page !== 'home';
    document.getElementById('menu-instructions').hidden = page !== 'instructions';
    document.getElementById('menu-credits').hidden = page !== 'credits';
    if (page === 'home') document.getElementById('btn-play').focus();
    else document.getElementById('btn-back-' + page).focus();
  }

  function preloadMenuPets() {
    if (!window.PetAssets || !window.PetCatalog) return;
    ['gato', 'cachorro', 'coelho'].forEach(function (speciesId) {
      var species = PetCatalog.species[speciesId];
      var image = new Image();
      image.onload = function () {
        if (!images) images = {};
        images[species.atlasId] = image;
        PetSprites.draw(document.getElementById('menu-' + speciesId), speciesId, species.variants[0].id, images);
      };
      image.onerror = function () { document.getElementById('menu-' + speciesId).hidden = true; };
      image.src = window.PetSpriteData && PetSpriteData[species.atlasId] || PetAssets.files[species.atlasId];
    });
  }

  document.getElementById('btn-play').addEventListener('click', onPlay);
  document.getElementById('btn-how-to').addEventListener('click', function () { showMenuPage('instructions'); });
  document.getElementById('btn-credits').addEventListener('click', function () { showMenuPage('credits'); });
  document.getElementById('btn-back-instructions').addEventListener('click', function () { showMenuPage('home'); });
  document.getElementById('btn-back-credits').addEventListener('click', function () { showMenuPage('home'); });
  document.getElementById('btn-restart').addEventListener('click', onRestart);
  document.getElementById('btn-next-level').addEventListener('click', continueLevel);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', clearKeys);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearKeys();
  });
  document.getElementById('btn-help').addEventListener('click', function () {
    if (state.phase !== 'mundo' || state.panel) return;
    openPanel('ajuda');
  });
  document.getElementById('btn-fechar-painel').addEventListener('click', closePanel);
  // Dev helper: allows automated test access to the lab modal
  window.__devOpenLab = function () {
    if (state.phase !== 'mundo') return 'wrong phase: ' + state.phase;
    state.orderReceived = true;
    if (state.labSpecies !== currentOrder().speciesId) {
      state.labSpecies = currentOrder().speciesId;
      state.parents = [null, null];
      state.parentSlot = null;
    }
    openPanel('pais', 'btn-cruzar');
    return 'ok';
  };

  function preloadScenery() {
    if (!window.PetAssets) return;
    var image = new Image();
    image.onload = function () {
      if (!images) images = {};
      if (!images.scenery) images.scenery = image;
      if (window.PetWorld) PetWorld.setImages(images);
    };
    image.src = PetAssets.files.scenery;
  }

  // Dados que o motor de render (js/world-engine.js) desenha a cada quadro.
  function worldView() {
    if (state.phase !== 'mundo') return null;
    var actors = [{ key: 'player', frame: PetAssets.walkFrame(state.player.dir, state.player.moving, state.player.walkTime), x: state.player.x, y: state.player.y }];
    var customer = state.customer;
    if (customer && customer.phase !== 'gone') {
      actors.push({ key: customer.clientId, frame: PetAssets.clientFrame(customer.clientId, customer.dir, customer.moving, customer.clock), x: customer.x, y: customer.y });
    }
    var arrow = null;
    if (!state.panel && currentOrder()) {
      var toClient = !state.orderReceived || !!state.carry;
      if (!toClient || (customer && customer.phase === 'waiting')) {
        arrow = {
          x: toClient ? customer.x : WORLD.lab.x + WORLD.lab.w / 2,
          y: (toClient ? customer.y - WORLD.actorHeight : WORLD.lab.y + WORLD.lab.h / 2) - 42,
        };
      }
    }
    return { actors: actors, arrow: arrow };
  }

  function startWorld() {
    canvas = PetWorld.init(document.getElementById('world'), {
      world: WORLD,
      update: function (dt) { if (state.phase !== 'inicio') update(dt); },
      view: worldView,
      occluderMask: occluderMask,
    });
  }

  renderHud();
  syncInert();
  preloadScenery();
  preloadMenuPets();
  if (window.PetWorld) {
    try {
      startWorld();
    } catch (failed) {
      worldFailed = true;
      showLoadError('vendor/phaser.min.js');
    }
  }
})();
