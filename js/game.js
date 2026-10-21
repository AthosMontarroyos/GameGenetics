(function () {
  const gene = Genetics.PELAGEM;
  const parents = [
    { id: "noir", name: "Noir", genotype: "CC" },
    { id: "mina", name: "Mina", genotype: "Cc" },
    { id: "pingo", name: "Pingo", genotype: "Cc" },
    { id: "nuvem", name: "Nuvem", genotype: "cc" },
    { id: "algodao", name: "Algodão", genotype: "cc" },
  ];
  const customers = [
    { id: "ana", name: "Ana", sprite: "estudante-f", x: 46, y: 72, request: { type: "phenotype", value: "pelo branco" }, text: "Quero um Mendelino de pelo branco." },
    { id: "lucia", name: "Dona Lúcia", sprite: "senhora", x: 70, y: 58, request: { type: "genotype", value: "CC" }, text: "Preciso de um Mendelino CC, homozigoto de pelo preto." },
    { id: "caio", name: "Caio", sprite: "crianca", x: 30, y: 48, request: { type: "phenotype", value: "pelo preto" }, text: "Quero um Mendelino de pelo preto." },
  ];

  const state = {
    mode: "solo",
    character: "geneticista",
    dir: "front",
    x: 50,
    y: 84,
    orders: {},
    activeId: null,
    selected: [],
    coopLocked: false,
    score: 0,
    history: [],
    keys: {},
  };

  const screens = ["menu", "world", "lab", "result", "done"].reduce(function (map, id) {
    map[id] = document.getElementById(id);
    return map;
  }, {});

  function show(id) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle("active", key === id);
    });
  }

  function parentById(id) {
    return parents.find(function (parent) { return parent.id === id; });
  }

  function spriteFor(genotype) {
    const phenotype = Genetics.phenotypeFor(genotype, gene);
    const file = phenotype === gene.dominantPhenotype ? "preto" : "branco";
    return "assets/sprites/pets/mendelino/" + file + ".png";
  }

  function customer(id) {
    return customers.find(function (entry) { return entry.id === id; });
  }

  function resetOrders() {
    state.orders = {};
    state.history = [];
    state.score = 0;
    state.activeId = null;
    state.selected = [];
    state.coopLocked = false;
    customers.forEach(function (entry) {
      state.orders[entry.id] = "waiting";
    });
  }

  function requestLabel(entry) {
    if (entry.request.type === "genotype") return "genótipo " + entry.request.value;
    return entry.request.value;
  }

  function renderCast() {
    const cast = [
      ["Geneticista", "assets/sprites/personagens/geneticista/front.png"],
      ["Laboratorista", "assets/sprites/personagens/laboratorista/front.png"],
      ["Mendelino", "assets/sprites/pets/mendelino/branco.png"],
      ["Gencko", "assets/sprites/pets/gencko/azul.png"],
      ["Nibbli", "assets/sprites/pets/nibbli/branco.png"],
    ];
    document.getElementById("cast").innerHTML = cast.map(function (item) {
      return "<figure><img alt='' src='" + item[1] + "'><figcaption>" + item[0] + "</figcaption></figure>";
    }).join("");
  }

  function renderCharacters() {
    const box = document.getElementById("characters");
    box.classList.remove("hidden");
    box.innerHTML = [
      ["geneticista", "Geneticista", "Jaleco com detalhes roxos"],
      ["laboratorista", "Laboratorista", "Jaleco com detalhes azuis"],
    ].map(function (item) {
      return "<button class='choice' type='button' data-character='" + item[0] + "'><img alt='' src='assets/sprites/personagens/" + item[0] + "/front.png' style='height:96px'><strong>" + item[1] + "</strong>" + item[2] + "</button>";
    }).join("");
  }

  function placeActors() {
    const map = document.getElementById("map");
    map.querySelectorAll(".actor").forEach(function (node) { node.remove(); });
    customers.forEach(function (entry) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "actor";
      button.dataset.actor = entry.id;
      button.style.left = entry.x + "%";
      button.style.top = entry.y + "%";
      button.innerHTML = "<img alt='' src='assets/sprites/npcs/" + entry.sprite + "/front.png'><span>" + entry.name + "</span>";
      button.addEventListener("click", function () { interactWith(entry.id); });
      map.appendChild(button);
    });
  }

  function updatePlayer() {
    const player = document.getElementById("player");
    player.style.left = state.x + "%";
    player.style.top = state.y + "%";
    player.querySelector("img").src = "assets/sprites/personagens/" + state.character + "/" + state.dir + ".png";
  }

  function updateHud() {
    document.getElementById("mode-label").textContent = state.mode === "coop" ? "Coop local" : "Solo · " + (state.character === "geneticista" ? "Geneticista" : "Laboratorista");
    document.getElementById("score-line").textContent = "Pontos: " + state.score + " / 300";
    document.getElementById("orders").innerHTML = customers.map(function (entry) {
      const status = state.orders[entry.id];
      const labels = { waiting: "na loja", active: "em atendimento", ready: "pronto para entregar", done: "entregue" };
      return "<p><strong>" + entry.name + "</strong> · " + requestLabel(entry) + "<br><span>" + labels[status] + "</span></p>";
    }).join("");
    document.querySelectorAll(".actor").forEach(function (actor) {
      actor.classList.toggle("done", state.orders[actor.dataset.actor] === "done");
      actor.classList.toggle("active", state.orders[actor.dataset.actor] === "active" || state.orders[actor.dataset.actor] === "ready");
    });
  }

  function say(text) {
    document.getElementById("log").textContent = text;
  }

  function distance(x, y) {
    return Math.hypot(state.x - x, state.y - y);
  }

  function nearestActor() {
    const points = customers.map(function (entry) {
      return { id: entry.id, x: entry.x, y: entry.y };
    }).concat([{ id: "lab", x: 78, y: 24 }]);
    return points.reduce(function (best, point) {
      const gap = distance(point.x, point.y);
      return !best || gap < best.gap ? { id: point.id, gap: gap } : best;
    }, null);
  }

  function interact() {
    const nearest = nearestActor();
    if (!nearest || nearest.gap > 16) {
      say("Chegue mais perto de um cliente ou da bancada.");
      return;
    }
    interactWith(nearest.id);
  }

  function interactWith(id) {
    if (id === "lab") {
      openLab();
      return;
    }
    const entry = customer(id);
    const status = state.orders[id];
    if (status === "done") {
      say(entry.name + " já foi embora satisfeito.");
      return;
    }
    if (status === "ready") {
      state.orders[id] = "done";
      state.activeId = null;
      say("Pedido entregue para " + entry.name + ".");
      updateHud();
      if (customers.every(function (item) { return state.orders[item.id] === "done"; })) finishLevel();
      return;
    }
    if (state.activeId && state.activeId !== id) {
      say("Termine o atendimento de " + customer(state.activeId).name + " antes.");
      return;
    }
    state.orders[id] = "active";
    state.activeId = id;
    state.selected = [];
    state.coopLocked = false;
    say(entry.name + ": “" + entry.text + "” Leve o pedido ao laboratório.");
    updateHud();
  }

  function openLab() {
    if (!state.activeId) {
      say("Pegue um pedido com um cliente antes de cruzar os bichinhos.");
      return;
    }
    if (state.orders[state.activeId] === "ready") {
      say("O filhote já está pronto. Entregue para " + customer(state.activeId).name + ".");
      return;
    }
    show("lab");
    renderLab();
  }

  function selectedGenotypes() {
    return state.selected.map(function (id) { return parentById(id).genotype; });
  }

  function currentChance() {
    const chosen = selectedGenotypes();
    if (chosen.length < 2) return null;
    const entry = customer(state.activeId);
    const predicate = entry.request.type === "genotype"
      ? function (genotype) { return genotype === entry.request.value; }
      : function (genotype) { return Genetics.phenotypeFor(genotype, gene) === entry.request.value; };
    return Genetics.probability(chosen[0], chosen[1], predicate);
  }

  function renderSquare(result) {
    if (!result) return "<p>Escolha dois pais para montar o quadro.</p>";
    const square = result.square;
    const entry = customer(state.activeId);
    const rows = [0, 1].map(function (row) {
      const cells = [0, 1].map(function (column) {
        const genotype = square.cells[row * 2 + column];
        const phenotype = Genetics.phenotypeFor(genotype, gene);
        const matches = entry.request.type === "genotype"
          ? genotype === entry.request.value
          : phenotype === entry.request.value;
        return "<td class='" + (matches ? "match" : "") + "'>" + genotype + "<small>" + phenotype + "</small></td>";
      }).join("");
      return "<tr><th>" + square.parent1[row] + "</th>" + cells + "</tr>";
    }).join("");
    const header = "<tr><th></th><th>" + square.parent2[0] + "</th><th>" + square.parent2[1] + "</th></tr>";
    const percent = Math.round(result.probability * 100);
    return "<table><tbody>" + header + rows + "</tbody></table><p class='chance'>" + percent + "% de chance (" + result.hits + "/" + result.total + ")</p><p>O pedido pede " + requestLabel(entry) + ". Células marcadas atendem o pedido.</p>";
  }

  function renderLab() {
    const entry = customer(state.activeId);
    document.getElementById("lab-order").textContent = entry.name + " pediu: " + entry.text;
    const role = state.mode === "coop"
      ? (state.coopLocked ? "Jogador 2 · Laboratorista" : "Jogador 1 · Geneticista")
      : "Solo · as duas funções";
    document.getElementById("lab-role").textContent = role;
    document.getElementById("parents").innerHTML = parents.map(function (parent) {
      const selected = state.selected.indexOf(parent.id) >= 0;
      return "<button class='parent" + (selected ? " selected" : "") + "' type='button' data-parent='" + parent.id + "'><img alt='' src='" + spriteFor(parent.genotype) + "'><span><strong>" + parent.name + " · " + parent.genotype + "</strong>" + Genetics.phenotypeFor(parent.genotype, gene) + " · " + Genetics.zygosity(parent.genotype) + "</span></button>";
    }).join("");
    const showSquare = state.mode === "solo" || state.coopLocked;
    document.getElementById("punnett-box").innerHTML = showSquare
      ? renderSquare(currentChance())
      : "<p>O laboratorista só vê o quadro depois que o geneticista travar os pais.</p>";
    document.getElementById("lock-parents").classList.toggle("hidden", state.mode !== "coop" || state.coopLocked);
    document.getElementById("confirm-cross").classList.toggle("hidden", state.mode === "coop" && !state.coopLocked);
    document.getElementById("lock-parents").disabled = state.selected.length !== 2;
    document.getElementById("confirm-cross").disabled = state.selected.length !== 2;
  }

  function confirmCross() {
    const result = currentChance();
    if (!result) return;
    const entry = customer(state.activeId);
    const percent = Math.round(result.probability * 100);
    const ok = result.probability > 0;
    state.history.push({
      name: entry.name,
      parents: selectedGenotypes().join(" × "),
      percent: percent,
      ok: ok,
    });
    if (ok) {
      state.score += percent;
      state.orders[state.activeId] = "ready";
    } else {
      state.selected = [];
      state.coopLocked = false;
    }
    document.getElementById("result-title").textContent = ok ? "Cruzamento possível" : "Este cruzamento não atende";
    document.getElementById("result-copy").textContent = ok
      ? "A chance calculada foi " + percent + "%. Entregue o resultado para " + entry.name + ". A nota usa essa probabilidade, não um sorteio."
      : "A probabilidade do pedido é 0%. Os alelos desses pais não produzem " + requestLabel(entry) + ". Escolha outro casal.";
    document.getElementById("result-square").innerHTML = renderSquare(result);
    updateHud();
    show("result");
  }

  function finishLevel() {
    document.getElementById("done-copy").textContent = "Pontos " + state.score + " de 300. Cada pedido soma a chance do cruzamento escolhido.";
    document.getElementById("done-list").innerHTML = state.history.map(function (item) {
      return "<p><strong>" + item.name + "</strong> · " + item.parents + " · " + item.percent + "%" + (item.ok ? "" : " · tentativa sem o fenótipo") + "</p>";
    }).join("");
    show("done");
  }

  function startGame() {
    resetOrders();
    state.x = 50;
    state.y = 84;
    state.dir = "front";
    placeActors();
    updatePlayer();
    updateHud();
    say("Ana está logo à frente. Interaja para ouvir o pedido.");
    show("world");
  }

  function tick() {
    let dx = 0;
    let dy = 0;
    if (state.keys.arrowup || state.keys.w) dy -= 1;
    if (state.keys.arrowdown || state.keys.s) dy += 1;
    if (state.keys.arrowleft || state.keys.a) dx -= 1;
    if (state.keys.arrowright || state.keys.d) dx += 1;
    if ((dx || dy) && screens.world.classList.contains("active")) {
      state.x = Math.min(94, Math.max(6, state.x + dx * 0.28));
      state.y = Math.min(94, Math.max(8, state.y + dy * 0.28));
      if (Math.abs(dx) > Math.abs(dy)) state.dir = dx > 0 ? "right" : "left";
      else if (dy > 0) state.dir = "front";
      else if (dy < 0) state.dir = "back";
      updatePlayer();
    }
    requestAnimationFrame(tick);
  }

  document.getElementById("pick-solo").addEventListener("click", function () {
    state.mode = "solo";
    renderCharacters();
  });
  document.getElementById("pick-coop").addEventListener("click", function () {
    state.mode = "coop";
    state.character = "geneticista";
    document.getElementById("characters").classList.add("hidden");
    startGame();
  });
  document.getElementById("characters").addEventListener("click", function (event) {
    const button = event.target.closest("[data-character]");
    if (!button) return;
    state.character = button.dataset.character;
    startGame();
  });
  document.getElementById("parents").addEventListener("click", function (event) {
    const button = event.target.closest("[data-parent]");
    if (!button || (state.mode === "coop" && state.coopLocked)) return;
    const id = button.dataset.parent;
    const index = state.selected.indexOf(id);
    if (index >= 0) state.selected.splice(index, 1);
    else if (state.selected.length < 2) state.selected.push(id);
    else state.selected = [state.selected[1], id];
    renderLab();
  });
  document.getElementById("lock-parents").addEventListener("click", function () {
    if (state.selected.length !== 2) return;
    state.coopLocked = true;
    renderLab();
  });
  document.getElementById("confirm-cross").addEventListener("click", confirmCross);
  document.getElementById("back-shop").addEventListener("click", function () {
    updateHud();
    show("world");
  });
  document.getElementById("result-ok").addEventListener("click", function () {
    updateHud();
    show("world");
    if (state.orders[state.activeId] === "ready") {
      say("Volte até " + customer(state.activeId).name + " para entregar.");
    }
  });
  document.getElementById("replay").addEventListener("click", function () { show("menu"); });
  document.getElementById("interact").addEventListener("click", interact);
  document.getElementById("lab-hotspot").addEventListener("click", function () { interactWith("lab"); });
  document.querySelectorAll("[data-move]").forEach(function (button) {
    button.addEventListener("click", function () {
      const delta = button.dataset.move.split(",").map(Number);
      state.x = Math.min(94, Math.max(6, state.x + delta[0]));
      state.y = Math.min(94, Math.max(8, state.y + delta[1]));
      if (delta[0] > 0) state.dir = "right";
      if (delta[0] < 0) state.dir = "left";
      if (delta[1] > 0) state.dir = "front";
      if (delta[1] < 0) state.dir = "back";
      updatePlayer();
    });
  });
  window.addEventListener("keydown", function (event) {
    state.keys[event.key.toLowerCase()] = true;
    if (event.key.toLowerCase() === "e") interact();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(event.key.toLowerCase()) >= 0) event.preventDefault();
  });
  window.addEventListener("keyup", function (event) {
    state.keys[event.key.toLowerCase()] = false;
  });

  renderCast();
  requestAnimationFrame(tick);
})();
