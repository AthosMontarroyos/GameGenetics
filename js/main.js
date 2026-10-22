(function () {
  'use strict';

  var WORLD = {
    width: 1536,
    height: 1024,
    speed: 220,
    actorHeight: 78,
    spawn: { x: 768, y: 724, dir: 'up' },
    service: { x: 700, y: 598, w: 160, h: 50 },
    lab: { x: 660, y: 160, w: 120, h: 100 },
    client: { x: 820, y: 632 },
    // Obstáculos medidos no cenário 1536×1024. O vão da porta fica em x 710–830.
    blocks: [
      { x: 0, y: 0, w: 236, h: 1024 },
      { x: 0, y: 0, w: 1536, h: 88 },
      { x: 1296, y: 0, w: 240, h: 1024 },
      { x: 0, y: 760, w: 1536, h: 264 },
      { x: 236, y: 648, w: 474, h: 120 },
      { x: 830, y: 648, w: 466, h: 120 },
      { x: 420, y: 88, w: 250, h: 118 },
      { x: 688, y: 96, w: 96, h: 100 },
      { x: 808, y: 88, w: 488, h: 160 },
      { x: 236, y: 214, w: 414, h: 48 },
      { x: 786, y: 200, w: 510, h: 70 },
      { x: 248, y: 268, w: 400, h: 172 },
      { x: 258, y: 448, w: 188, h: 176 },
      { x: 448, y: 492, w: 130, h: 132 },
      { x: 650, y: 490, w: 250, h: 104 },
      { x: 868, y: 304, w: 260, h: 156 },
      { x: 820, y: 404, w: 80, h: 64 },
      { x: 948, y: 496, w: 176, h: 124 },
      { x: 1144, y: 424, w: 152, h: 200 },
      { x: 1160, y: 250, w: 136, h: 160 },
    ],
  };

  var ANIMALS = {
    'roxo-AA-1': { id: 'roxo-AA-1', name: 'Roxo 1', genotype: 'AA' },
    'roxo-Aa-1': { id: 'roxo-Aa-1', name: 'Roxo 2', genotype: 'Aa' },
    'roxo-Aa-2': { id: 'roxo-Aa-2', name: 'Roxo 3', genotype: 'Aa' },
    'marrom-aa-1': { id: 'marrom-aa-1', name: 'Marrom 1', genotype: 'aa' },
    'marrom-aa-2': { id: 'marrom-aa-2', name: 'Marrom 2', genotype: 'aa' },
  };

  var ORDERS = [
    {
      clientId: 'cliente-12683',
      clientName: 'Estudante',
      phenotype: 'roxo',
      minimum: 0,
      exclusive: true,
      parents: ['roxo-AA-1', 'marrom-aa-1', 'marrom-aa-2'],
      speech: 'Quero um Mendelino de pelo roxo. Qualquer chance maior que zero já serve.',
    },
    {
      clientId: 'cliente-12682',
      clientName: 'Homem adulto',
      phenotype: 'marrom',
      minimum: 0.25,
      exclusive: false,
      parents: ['roxo-Aa-1', 'roxo-Aa-2', 'roxo-AA-1'],
      speech: 'Quero um Mendelino de pelo marrom, com chance mínima de 25%.',
    },
    {
      clientId: 'cliente-12687',
      clientName: 'Senhora idosa',
      phenotype: 'marrom',
      minimum: 1,
      exclusive: false,
      parents: ['marrom-aa-1', 'marrom-aa-2', 'roxo-Aa-1'],
      speech: 'Quero um Mendelino de pelo marrom com chance de 100%. Metade não basta.',
    },
  ];

  var REMINDER = [
    'Genótipo é o par de alelos (AA, Aa ou aa). Fenótipo é a cor visível do pelo.',
    'A é dominante (roxo). a é recessivo (marrom). AA e Aa têm o mesmo fenótipo roxo.',
    'Homozigose: alelos iguais (AA ou aa). Heterozigose: alelos diferentes (Aa).',
    'Cada pai manda um alelo no gameta. As quatro células do quadro valem 25% cada uma.',
    'A chance do pedido é a soma das células com o fenótipo pedido. O cruzamento precisa atingir a exigência do cliente.',
  ];

  var canvas = document.getElementById('world');
  var ctx = canvas.getContext('2d');
  var modal = document.getElementById('modal');
  var modalTitle = document.getElementById('modal-title');
  var modalKicker = document.getElementById('modal-kicker');
  var modalBody = document.getElementById('modal-body');
  var dialogue = document.getElementById('dialogue');
  var hintEl = document.getElementById('hint');
  var images = null;
  var lastTime = 0;
  var loopStarted = false;
  var hintText = '';

  var state = {
    phase: 'inicio',
    loading: false,
    orderIndex: 0,
    orderReceived: false,
    parents: [null, null],
    preview: null,
    approved: null,
    panel: null,
    message: '',
    liveNote: '',
    status: '',
    deliverLock: false,
    held: {},
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

  function phenotypeName(phenotype) {
    return phenotype === 'roxo' ? 'pelo roxo' : 'pelo marrom';
  }

  function genotypeKind(genotype) {
    if (genotype === 'AA') return 'homozigoto dominante';
    if (genotype === 'Aa') return 'heterozigoto';
    return 'homozigoto recessivo';
  }

  function formatPercent(value) {
    var pct = Math.round(value * 1000) / 10;
    if (Math.abs(pct - Math.round(pct)) < 0.05) return Math.round(pct) + '%';
    return pct.toFixed(1).replace('.', ',') + '%';
  }

  function requirementText(order) {
    if (order.exclusive) return 'qualquer chance maior que 0%';
    if (order.minimum === 1) return 'chance de 100%';
    return 'chance mínima de ' + formatPercent(order.minimum);
  }

  function animalInfo(id) {
    var animal = ANIMALS[id];
    var genotype = PetGenetics.normalizeGenotype(animal.genotype);
    return {
      id: animal.id,
      name: animal.name,
      genotype: genotype,
      phenotype: PetGenetics.phenotypeOf(genotype),
    };
  }

  function clearKeys() {
    state.held = {};
  }

  function phenotypeChip(order) {
    var name = order.phenotype === 'roxo' ? 'Pelo roxo' : 'Pelo marrom';
    if (order.exclusive) return name + ' · chance maior que 0%';
    if (order.minimum === 1) return name + ' · chance de 100%';
    return name + ' · mínimo ' + formatPercent(order.minimum);
  }

  function pointInZone(x, y, zone) {
    return x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h;
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
    if (state.phase === 'concluido') progress.textContent = '3/3';
    else if (state.phase === 'mundo') progress.textContent = 'Pedido ' + (state.orderIndex + 1) + '/3';
    else progress.textContent = 'Nível solo';
    var order = currentOrder();
    if (state.phase !== 'mundo' || !order) {
      summary.textContent = '';
      objective.textContent = '';
    } else if (!state.orderReceived) {
      summary.textContent = 'Pedido: aguardando cliente';
      objective.textContent = 'Fale com o cliente (marca roxa)';
    } else if (!state.approved) {
      summary.textContent = 'Pedido: ' + phenotypeChip(order);
      objective.textContent = 'Vá ao laboratório (marca azul)';
    } else {
      summary.textContent = 'Pedido: ' + phenotypeChip(order);
      objective.textContent = 'Volte ao cliente para entregar';
    }
    status.textContent = state.status;
  }

  function reminderList() {
    var list = el('ul');
    REMINDER.forEach(function (line) {
      list.append(el('li', { text: line }));
    });
    return el('div', { className: 'reminder' }, el('strong', { text: 'Lembrete' }), list);
  }

  function paintSprite(thumbCanvas, image, frame) {
    var thumbCtx = thumbCanvas.getContext('2d');
    thumbCtx.imageSmoothingEnabled = false;
    thumbCtx.fillStyle = '#f4ead8';
    thumbCtx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);
    if (!image || !frame) return;
    var scale = (thumbCanvas.height * 0.9) / frame.h;
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

  function paintThumb(thumbCanvas, frame) {
    paintSprite(thumbCanvas, images && images.mendelino, frame);
  }

  function makeThumb(phenotype, className) {
    var thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 128;
    thumbCanvas.height = 128;
    thumbCanvas.className = className || 'thumb';
    paintThumb(thumbCanvas, PetAssets.frames.mendelino[phenotype]);
    return thumbCanvas;
  }

  function punnettTable(result) {
    var table = el('table', { className: 'punnett' });
    var caption = el('caption', { text: 'Genótipos: ' + compactGenotypes(result) });
    var head = el('tr', {},
      el('th', { scope: 'col', text: 'Gametas' }),
      el('th', { scope: 'col' }, el('span', { className: 'allele', text: result.gametesA[0] }), el('span', { className: 'allele-note', text: 'Pai 1' })),
      el('th', { scope: 'col' }, el('span', { className: 'allele', text: result.gametesA[1] }), el('span', { className: 'allele-note', text: 'Pai 1' }))
    );
    table.append(caption, head);
    result.grid.forEach(function (row) {
      var tr = el('tr', {},
        el('th', { scope: 'row' }, el('span', { className: 'allele', text: row[0].alleleRow }), el('span', { className: 'allele-note', text: 'Pai 2' }))
      );
      row.forEach(function (cell) {
        tr.append(el('td', {},
          el('strong', { text: cell.genotype }),
          el('span', { className: 'cell-pheno', text: cell.phenotype === 'roxo' ? 'roxo' : 'marrom' })
        ));
      });
      table.append(tr);
    });
    return el('div', { className: 'punnett-wrap' }, table);
  }

  function renderSlots() {
    var wrap = el('div', { className: 'slots' });
    for (var slot = 0; slot < 2; slot += 1) {
      var id = state.parents[slot];
      var box = el('div', { className: 'slot' });
      if (!id) {
        box.append(el('p', { className: 'slot-line' },
          el('strong', { text: 'Pai ' + (slot + 1) }),
          el('span', { text: ' · vazio' })
        ));
      } else {
        var info = animalInfo(id);
        box.append(el('p', { className: 'slot-line' },
          el('strong', { text: 'Pai ' + (slot + 1) }),
          el('span', { text: ' · ' + info.name + ' · ' + info.genotype })
        ));
        (function (animalId) {
          box.append(button('Remover', 'secondary', function () { selectAnimal(animalId); }));
        })(id);
      }
      wrap.append(box);
    }
    return wrap;
  }

  function renderParentCards(order) {
    var list = el('div', { className: 'parent-list' });
    order.parents.forEach(function (id) {
      var info = animalInfo(id);
      var selected = state.parents.indexOf(id) !== -1;
      var card = el('button', {
        type: 'button',
        className: 'parent-card' + (selected ? ' is-selected' : ''),
        id: 'parent-btn-' + id,
      });
      card.setAttribute('aria-pressed', selected ? 'true' : 'false');
      card.append(
        makeThumb(info.phenotype, 'thumb'),
        el('span', {},
          el('span', { className: 'who', text: info.name }),
          el('span', { className: 'cell-pheno', text: 'Genótipo ' + info.genotype + ' · ' + genotypeKind(info.genotype) }),
          el('span', { className: 'cell-pheno', text: 'Fenótipo: ' + phenotypeName(info.phenotype) }),
          selected ? el('span', { className: 'badge', text: 'Selecionado' }) : null
        )
      );
      card.addEventListener('click', function (event) {
        event.preventDefault();
        selectAnimal(id);
      });
      list.append(card);
    });
    return list;
  }

  function failureMessage() {
    return 'Escolha outro cruzamento. O atendimento não avançou.';
  }

  function firstParentButtonId() {
    var order = currentOrder();
    return order ? 'parent-btn-' + order.parents[0] : 'btn-fechar-painel';
  }

  function selectionPrompt() {
    if (!state.parents[0] && !state.parents[1]) return 'Escolha dois pais para analisar o cruzamento.';
    if (!state.parents[1]) return 'Selecione mais um pai.';
    return '';
  }

  function compactGenotypes(result) {
    return 'AA ' + formatPercent(result.genotypes.AA) + ' · Aa ' + formatPercent(result.genotypes.Aa) + ' · aa ' + formatPercent(result.genotypes.aa);
  }

  function renderDialogue() {
    var order = currentOrder();
    dialogue.textContent = '';
    var thumb = document.createElement('canvas');
    thumb.className = 'thumb';
    thumb.width = 96;
    thumb.height = 96;
    if (images && images[order.clientId]) {
      paintSprite(thumb, images[order.clientId], PetAssets.frames.clients[order.clientId]);
    }
    var copy = el('div', { className: 'dialogue-copy' },
      el('h2', { id: 'dialogue-name', text: order.clientName }),
      el('p', { text: order.speech }),
      el('p', { text: phenotypeChip(order) })
    );
    var actions = el('div', { className: 'dialogue-actions' },
      button('Ir ao laboratório', '', closePanel, 'btn-ir-lab'),
      button('Fechar', 'secondary', closePanel, 'btn-fechar-dialogo')
    );
    dialogue.append(thumb, copy, actions);
    dialogue.hidden = false;
    modal.hidden = true;
    document.body.classList.add('modal-open');
    syncInert();
    document.getElementById('btn-ir-lab').focus();
  }

  function chanceSummary(chance, order) {
    return el('p', { className: 'chance-line' },
      el('strong', { text: 'Chance de ' + phenotypeName(order.phenotype) + ': ' + formatPercent(chance) }),
      el('span', { className: 'chance-req', text: ' · Pedido: ' + requirementText(order) })
    );
  }

  function renderCrossColumn() {
    var column = el('section', { className: 'bench-cross' }, el('h3', { text: 'Cruzamento' }));
    if (!state.preview) {
      column.append(el('p', { className: 'empty-note', text: selectionPrompt() }));
      return column;
    }
    var result = state.preview.result;
    var parent1 = animalInfo(state.preview.parentIds[0]);
    var parent2 = animalInfo(state.preview.parentIds[1]);
    column.append(
      el('p', { className: 'cross-parents', text: 'Pai 1 ' + parent1.genotype + ' · Pai 2 ' + parent2.genotype }),
      punnettTable(result)
    );
    var details = el('details');
    details.append(el('summary', { text: 'Entender o cálculo' }));
    details.append(el('p', { text: 'Pai 1 (' + parent1.name + ', ' + parent1.genotype + ') forma os gametas ' + result.gametesA.join(' e ') + '. Pai 2 (' + parent2.name + ', ' + parent2.genotype + ') forma os gametas ' + result.gametesB.join(' e ') + '. Cada célula do quadro junta um gameta de cada pai e vale 25%. AA e Aa têm pelo roxo; aa tem pelo marrom. A chance é a soma das células com o fenótipo pedido.' }));
    column.append(details);
    return column;
  }

  function renderResultColumn(order) {
    var column = el('section', { className: 'bench-result' }, el('h3', { text: 'Resultado previsto' }));
    if (state.message) column.append(el('p', { className: 'alert', text: state.message }));
    if (!state.preview) {
      column.append(el('p', { className: 'empty-note', text: selectionPrompt() }));
    } else {
      var verdict = state.preview.ok ? 'Atende ao pedido' : 'Não atende ao pedido';
      column.append(
        chanceSummary(state.preview.chance, order),
        el('p', { className: 'verdict ' + (state.preview.ok ? 'is-ok' : 'is-bad'), text: verdict })
      );
    }
    return column;
  }

  function renderBenchActions() {
    var actions = el('div', { className: 'bench-actions', role: 'group', 'aria-label': 'Ações do laboratório' });
    if (state.panel === 'resultado' && state.approved) {
      actions.append(
        button('Voltar ao cliente', '', closePanel, 'btn-voltar'),
        button('Rever os pais', 'secondary', reviseParents, 'btn-rever')
      );
      return actions;
    }
    var ready = !!(state.parents[0] && state.parents[1]);
    var confirmButton = button('Confirmar cruzamento', '', confirmCross, 'btn-confirm');
    confirmButton.disabled = !ready;
    var clearButton = button('Limpar seleção', 'secondary', clearParents, 'btn-limpar');
    clearButton.disabled = !(state.parents[0] || state.parents[1]);
    actions.append(confirmButton, clearButton);
    return actions;
  }

  function renderApprovedBench(order) {
    var saved = state.approved;
    var parent1 = animalInfo(saved.parentIds[0]);
    var parent2 = animalInfo(saved.parentIds[1]);
    var parents = el('section', { className: 'bench-parents' },
      el('h3', { text: 'Pais' }),
      el('p', { text: 'Pai 1: ' + parent1.name + ' · ' + parent1.genotype }),
      el('p', { text: 'Pai 2: ' + parent2.name + ' · ' + parent2.genotype })
    );
    var cross = el('section', { className: 'bench-cross' },
      el('h3', { text: 'Cruzamento' }),
      punnettTable(saved.result)
    );
    var result = el('section', { className: 'bench-result' },
      el('h3', { text: 'Resultado previsto' }),
      chanceSummary(saved.chance, order),
      el('p', { className: 'verdict is-ok', text: 'Atende ao pedido' }),
      el('figure', { className: 'example' },
        makeThumb(order.phenotype, 'thumb example-thumb'),
        el('figcaption', { text: 'Exemplo de descendente possível. A entrega não realiza um sorteio.' })
      )
    );
    return el('div', { className: 'bench' }, parents, cross, result);
  }

  function renderLab(focusId, preventScroll) {
    var order = currentOrder();
    var card = document.getElementById('modal-card');
    var isResult = state.panel === 'resultado' && !!state.approved;
    var samePanel = modal.dataset.panel === state.panel;
    var savedScroll = samePanel ? card.scrollTop : 0;
    dialogue.hidden = true;
    modalTitle.textContent = 'Laboratório';
    modalKicker.textContent = order.clientName + ' · Pedido: ' + phenotypeChip(order);
    modal.classList.add('is-bench');
    modal.classList.remove('is-help');
    modalBody.textContent = '';
    if (isResult) {
      modalBody.append(el('p', { className: 'approval-banner', text: 'Cruzamento aprovado. Volte ao cliente para entregar.' }));
      modalBody.append(renderApprovedBench(order));
    } else {
      modalBody.append(el('div', { className: 'bench' },
        el('section', { className: 'bench-parents' },
          el('h3', { text: 'Pais' }),
          renderSlots(),
          renderParentCards(order)
        ),
        renderCrossColumn(),
        renderResultColumn(order)
      ));
    }
    modalBody.append(renderBenchActions());
    modal.dataset.panel = state.panel;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    card.scrollTop = isResult ? 0 : savedScroll;
    syncInert();
    announceChoice();
    var preferred = focusId || (isResult ? 'btn-voltar' : firstParentButtonId());
    var target = document.getElementById(preferred) || document.getElementById(firstParentButtonId());
    if (target) target.focus({ preventScroll: isResult ? true : !!preventScroll });
  }

  function renderHelp() {
    dialogue.hidden = true;
    modalTitle.textContent = 'Ajuda';
    modalKicker.textContent = 'Controles e gene da cor';
    modal.classList.add('is-help');
    modal.classList.remove('is-bench');
    modalBody.textContent = '';
    modalBody.append(
      el('h3', { text: 'Controles' }),
      el('ul', {},
        el('li', { text: 'WASD ou setas: andar.' }),
        el('li', { text: 'E: atender, rever o pedido, abrir o laboratório ou entregar.' }),
        el('li', { text: 'Esc: fechar o painel sem entregar.' })
      ),
      el('h3', { text: 'Como atender' }),
      el('p', { text: 'Fale com o cliente na marca roxa. Caminhe até a marca azul e monte o cruzamento. Só a entrega no cliente avança o pedido.' }),
      reminderList(),
      el('p', { text: 'Modelo didático fictício. Não descreve a genética real dos gatos.' })
    );
    modal.hidden = false;
    document.body.classList.add('modal-open');
    syncInert();
    document.getElementById('btn-fechar-painel').focus();
  }

  function renderModal(focusId, preventScroll) {
    if (state.panel === 'pedido') renderDialogue();
    else if (state.panel === 'ajuda') renderHelp();
    else renderLab(focusId, preventScroll);
  }

  function announceChoice() {
    var live = document.getElementById('choice-live');
    if (!live) return;
    if (state.panel === 'resultado' && state.approved) {
      live.textContent = 'Cruzamento aprovado. Atende ao pedido. Chance de ' +
        phenotypeName(currentOrder().phenotype) + ': ' + formatPercent(state.approved.chance) + '.';
      return;
    }
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
      else if (state.preview) {
        text = 'Pai 1: ' + first + '. Pai 2: ' + second + '. Chance calculada: ' + formatPercent(state.preview.chance) + '. ' +
          (state.preview.ok ? 'Atende à chance exigida.' : 'Não atende à chance exigida.');
      }
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
    var modalOpen = state.panel === 'pais' || state.panel === 'resultado' || state.panel === 'ajuda';
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
    if (state.panel === 'pais' || state.panel === 'resultado' || state.panel === 'ajuda') return modal;
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

  function refreshPreview() {
    var first = state.parents[0];
    var second = state.parents[1];
    var order = currentOrder();
    if (!first || !second || first === second || !order) {
      state.preview = null;
      return;
    }
    var result = PetGenetics.cross(ANIMALS[first].genotype, ANIMALS[second].genotype);
    var chance = result.phenotypes[order.phenotype];
    state.preview = {
      parentIds: [first, second],
      result: result,
      chance: chance,
      ok: PetGenetics.orderMet(chance, order),
    };
  }

  function selectAnimal(id) {
    var index = state.parents.indexOf(id);
    if (index !== -1) {
      state.parents[index] = null;
      if (index === 0) {
        state.parents[0] = state.parents[1];
        state.parents[1] = null;
      }
    } else if (!state.parents[0]) {
      state.parents[0] = id;
    } else if (!state.parents[1]) {
      if (state.parents[0] === id) {
        state.message = 'Escolha dois animais diferentes. O mesmo indivíduo não pode ocupar as duas posições.';
        state.liveNote = state.message;
        renderModal('parent-btn-' + id, true);
        return;
      }
      state.parents[1] = id;
    } else {
      state.message = 'Remova um pai antes de escolher outro animal.';
      state.liveNote = state.message;
      renderModal('parent-btn-' + id, true);
      return;
    }
    state.message = '';
    state.liveNote = '';
    state.approved = null;
    refreshPreview();
    renderHud();
    renderModal('parent-btn-' + id, true);
  }

  function clearParents() {
    state.parents = [null, null];
    state.preview = null;
    state.approved = null;
    state.message = '';
    state.status = '';
    state.liveNote = '';
    openPanel('pais', firstParentButtonId(), true);
  }

  function reviseParents() {
    state.approved = null;
    state.message = '';
    state.status = '';
    state.liveNote = '';
    if (!state.preview && state.parents[0] && state.parents[1]) refreshPreview();
    openPanel('pais', firstParentButtonId(), true);
  }

  function confirmCross() {
    var order = currentOrder();
    if (!state.preview) {
      state.message = 'Selecione dois animais diferentes, um em cada posição.';
      state.liveNote = state.message;
      state.approved = null;
      renderModal('btn-confirm', true);
      return;
    }
    if (!state.preview.ok) {
      state.approved = null;
      state.message = failureMessage();
      state.liveNote = 'Não atende ao pedido. A chance de ' + phenotypeName(order.phenotype) + ' é ' + formatPercent(state.preview.chance) + '.';
      renderHud();
      renderModal('btn-confirm', true);
      return;
    }
    state.approved = state.preview;
    state.message = '';
    state.liveNote = '';
    state.status = '';
    openPanel('resultado', 'btn-voltar');
  }

  function deliverOrder() {
    if (state.phase !== 'mundo' || !state.approved || state.panel || state.deliverLock) return;
    state.deliverLock = true;
    var delivered = state.orderIndex + 1;
    state.approved = null;
    state.preview = null;
    state.parents = [null, null];
    state.orderReceived = false;
    state.message = '';
    state.liveNote = '';
    state.orderIndex += 1;
    if (state.orderIndex >= ORDERS.length) {
      state.phase = 'concluido';
      state.status = '';
      state.panel = null;
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      document.getElementById('screen-end').hidden = false;
      syncInert();
      renderHud();
      document.getElementById('btn-restart').focus();
      state.deliverLock = false;
      return;
    }
    state.status = 'Pedido ' + delivered + ' entregue.';
    renderHud();
    state.deliverLock = false;
  }

  function interact() {
    if (state.phase !== 'mundo' || state.panel) return;
    var atService = pointInZone(state.player.x, state.player.y, WORLD.service);
    var atLab = pointInZone(state.player.x, state.player.y, WORLD.lab);
    if (atService && state.approved) {
      deliverOrder();
      return;
    }
    if (atService) {
      state.orderReceived = true;
      state.status = '';
      openPanel('pedido', 'btn-ir-lab');
      return;
    }
    if (atLab && !state.orderReceived) {
      state.status = 'Fale com o cliente primeiro.';
      renderHud();
      return;
    }
    if (atLab && state.approved) {
      openPanel('resultado', 'btn-voltar');
      return;
    }
    if (atLab) {
      state.status = '';
      refreshPreview();
      openPanel('pais', firstParentButtonId());
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
    var arrows = event.code === 'ArrowUp' || event.code === 'ArrowDown' || event.code === 'ArrowLeft' || event.code === 'ArrowRight';
    if (state.phase === 'mundo' && !state.panel && !surface && arrows) event.preventDefault();
    if (event.repeat) return;
    if (!surface && state.phase === 'mundo' && !state.panel && isMoveCode(event.code)) state.held[event.code] = true;
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
    if (state.phase === 'mundo' && !state.panel) {
      var axis = readAxis();
      if (axis.x || axis.y) {
        var distance = WORLD.speed * dt;
        var nextX = state.player.x + axis.x * distance;
        if (!blocked(feetBox(nextX, state.player.y))) state.player.x = nextX;
        var nextY = state.player.y + axis.y * distance;
        if (!blocked(feetBox(state.player.x, nextY))) state.player.y = nextY;
        if (Math.abs(axis.x) > Math.abs(axis.y)) state.player.dir = axis.x > 0 ? 'right' : 'left';
        else state.player.dir = axis.y > 0 ? 'down' : 'up';
      }
    }
    var nextHint = '';
    if (state.phase === 'mundo' && !state.panel) {
      var atService = pointInZone(state.player.x, state.player.y, WORLD.service);
      var atLab = pointInZone(state.player.x, state.player.y, WORLD.lab);
      if (atService && state.approved) nextHint = '[E] Entregar';
      else if (atService && state.orderReceived) nextHint = '[E] Ver pedido';
      else if (atService) nextHint = '[E] Atender';
      else if (atLab && state.approved) nextHint = '[E] Ver resultado';
      else if (atLab && state.orderReceived) nextHint = '[E] Laboratório';
    }
    if (nextHint !== hintText) {
      hintText = nextHint;
      hintEl.hidden = !nextHint;
      hintEl.textContent = nextHint;
    }
  }

  function drawActor(image, frame, x, y) {
    var scale = WORLD.actorHeight / frame.h;
    var dw = frame.w * scale;
    var dh = WORLD.actorHeight;
    var anchor = frame.anchorX == null ? frame.w / 2 : frame.anchorX;
    ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, x - (anchor / frame.w) * dw, y - dh, dw, dh);
  }

  function drawShadow(x, y) {
    ctx.fillStyle = 'rgba(40, 24, 16, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawZone(zone, fill, stroke, lineWidth) {
    ctx.beginPath();
    ctx.ellipse(zone.x + zone.w / 2, zone.y + zone.h / 2, zone.w / 2, Math.max(8, zone.h / 2), 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  function drawLabel(text, x, y) {
    ctx.font = '700 26px Segoe UI, Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255, 250, 243, 0.92)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = '#2a1c14';
    ctx.fillText(text, x, y);
  }

  function render() {
    if (!images) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, WORLD.width, WORLD.height);
    ctx.drawImage(images.scenery, 0, 0, WORLD.width, WORLD.height);
    if (state.phase === 'mundo') {
      var serviceNow = !state.orderReceived || !!state.approved;
      drawZone(
        WORLD.service,
        serviceNow ? 'rgba(140, 70, 180, 0.4)' : 'rgba(140, 70, 180, 0.1)',
        serviceNow ? 'rgba(92, 45, 145, 1)' : 'rgba(92, 45, 145, 0.28)',
        serviceNow ? 5 : 2
      );
      drawZone(
        WORLD.lab,
        serviceNow ? 'rgba(50, 110, 170, 0.1)' : 'rgba(50, 110, 170, 0.4)',
        serviceNow ? 'rgba(24, 78, 130, 0.28)' : 'rgba(24, 78, 130, 1)',
        serviceNow ? 2 : 5
      );
      drawLabel('Cliente', WORLD.client.x, WORLD.client.y - WORLD.actorHeight - 20);
      drawLabel('Laboratório', WORLD.lab.x + WORLD.lab.w / 2, WORLD.lab.y + WORLD.lab.h + 28);
      var order = currentOrder();
      var entities = [{
        y: state.player.y,
        draw: function () {
          drawShadow(state.player.x, state.player.y);
          drawActor(images.player, PetAssets.frames.player[state.player.dir], state.player.x, state.player.y);
        },
      }];
      if (order) {
        entities.push({
          y: WORLD.client.y,
          draw: function () {
            drawShadow(WORLD.client.x, WORLD.client.y);
            drawActor(images[order.clientId], PetAssets.frames.clients[order.clientId], WORLD.client.x, WORLD.client.y);
          },
        });
      }
      entities.sort(function (a, b) { return a.y - b.y; });
      entities.forEach(function (entity) { entity.draw(); });
    }
  }

  function tick(time) {
    if (!lastTime) lastTime = time;
    var dt = Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;
    update(dt);
    render();
    requestAnimationFrame(tick);
  }

  function ensureLoop() {
    if (loopStarted) return;
    loopStarted = true;
    requestAnimationFrame(tick);
  }

  function resetPlay() {
    state.phase = 'mundo';
    state.orderIndex = 0;
    state.orderReceived = false;
    state.parents = [null, null];
    state.preview = null;
    state.approved = null;
    state.panel = null;
    state.message = '';
    state.liveNote = '';
    state.status = '';
    state.deliverLock = false;
    state.player.x = WORLD.spawn.x;
    state.player.y = WORLD.spawn.y;
    state.player.dir = WORLD.spawn.dir;
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
    ensureLoop();
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
      if (!ctx) throw new Error('canvas');
      if (!images || !images.player) images = await PetAssets.loadAll();
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

  document.getElementById('btn-play').addEventListener('click', onPlay);
  document.getElementById('btn-restart').addEventListener('click', onRestart);
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

  function preloadScenery() {
    if (!window.PetAssets) return;
    var image = new Image();
    image.onload = function () {
      if (!images) images = {};
      if (!images.scenery) images.scenery = image;
      if (ctx && images.scenery) ctx.drawImage(images.scenery, 0, 0, WORLD.width, WORLD.height);
    };
    image.src = PetAssets.files.scenery;
  }

  renderHud();
  syncInert();
  preloadScenery();
})();
