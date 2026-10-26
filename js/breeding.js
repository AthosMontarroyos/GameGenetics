(function (root) {
  'use strict';
  // O cliente pede, o jogador escolhe dois pais do catálogo, cruza e nasce um filhote sorteado.
  // O jogador vê só a aparência dos pais; os genes ficam escondidos e só aparecem no filhote.
  var PUP_NAMES = ['Pipa', 'Bolinha', 'Fofo', 'Mingau', 'Pitoco', 'Churros', 'Dengo', 'Farelo', 'Gotinha', 'Xodó', 'Tapioca', 'Biju', 'Cuca', 'Pudim', 'Soneca', 'Trufa', 'Brigadeiro', 'Paçoca', 'Fiapo', 'Neném', 'Quindim', 'Sorvete', 'Jabuti', 'Moranguinho'];

  function seeded(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function recessiveCount(pair) { return pair.split('').filter(function (a) { return a === a.toLowerCase(); }).length; }

  // Probabilidade de um filhote ter ao menos um alelo dominante no gene.
  function dominantChance(a, b, gene) { return 1 - (recessiveCount(a[gene]) / 2) * (recessiveCount(b[gene]) / 2); }

  // Chance de um filhote de a × b atender a todas as características pedidas (genes independentes).
  function pairChance(speciesId, a, b, targets) {
    var spec = root.PetCatalog.species[speciesId];
    var chance = 1;
    Object.keys(targets).forEach(function (trait) {
      var value = targets[trait];
      var p;
      if (trait === 'color') {
        var index = spec.colors.indexOf(value);
        var pa = dominantChance(a, b, 'A');
        var pb = dominantChance(a, b, 'B');
        p = (index < 2 ? pa : 1 - pa) * (index % 2 === 0 ? pb : 1 - pb);
      } else {
        var gene = { eyes: 'E', ears: 'O', spots: 'M', tail: 'T' }[trait];
        var positive = { eyes: 'azuis', ears: spec.ears[0], spots: 'manchado', tail: 'longo' }[trait];
        p = dominantChance(a, b, gene);
        if (value !== positive) p = 1 - p;
      }
      chance *= p;
    });
    return chance;
  }

  function meets(targets, traits) { return Object.keys(targets).every(function (key) { return traits[key] === targets[key]; }); }

  // Quais características pedidas o filhote não tem (para o cliente dizer o que está errado).
  function mismatches(targets, traits) { return Object.keys(targets).filter(function (key) { return traits[key] !== targets[key]; }); }

  // Melhor par do catálogo para o pedido: define a meta de cruzamentos para ganhar as três estrelas.
  function bestChance(speciesId, order) {
    var animals = root.PetCatalog.individuals.filter(function (animal) { return animal.speciesId === speciesId; });
    var best = 0;
    for (var i = 0; i < animals.length; i += 1) {
      for (var j = i + 1; j < animals.length; j += 1) {
        best = Math.max(best, pairChance(speciesId, animals[i].genotype, animals[j].genotype, order.targets));
      }
    }
    return best;
  }

  function planFor(speciesId, order) {
    var p = bestChance(speciesId, order);
    return { chance: p, par: p > 0 ? Math.max(2, Math.min(8, Math.ceil(1 / p) + 1)) : 8 };
  }

  function stars(attempts, plan) { return attempts <= plan.par ? 3 : attempts <= plan.par + 2 ? 2 : 1; }

  // O viveiro tem os três bichos; cada pedido tem a sua espécie e só se cruzam bichos da mesma espécie.
  function create(orders, seed) {
    var rand = seeded(seed == null ? Math.floor(Math.random() * 4294967296) : seed);
    return {
      rand: rand,
      roster: root.PetCatalog.individuals.slice(),
      journal: [],
      pupCount: 0,
      plans: orders.map(function (order) { return planFor(order.speciesId, order); })
    };
  }

  function rosterOf(game, speciesId) { return game.roster.filter(function (animal) { return animal.speciesId === speciesId; }); }

  function find(game, id) { return game.roster.filter(function (animal) { return animal.id === id; })[0] || null; }

  function snapshot(animal) { return { id: animal.id, name: animal.name, speciesId: animal.speciesId, traits: animal.traits, visualId: animal.visualId }; }

  // Cruza dois pais e devolve o filhote (um sorteio por gene, como na meiose do modelo).
  function cross(game, firstId, secondId) {
    var a = find(game, firstId);
    var b = find(game, secondId);
    if (!a || !b) return { ok: false, reason: 'Escolha dois pais.' };
    if (a.id === b.id) return { ok: false, reason: 'Escolha dois bichos diferentes.' };
    if (a.speciesId !== b.speciesId) return { ok: false, reason: 'Só dá para cruzar bichos da mesma espécie.' };
    var speciesId = a.speciesId;
    var loci = root.PetCatalog.species[speciesId].loci;
    var genotype = {};
    loci.forEach(function (locus) {
      var one = a.genotype[locus].charAt(game.rand() < 0.5 ? 0 : 1);
      var two = b.genotype[locus].charAt(game.rand() < 0.5 ? 0 : 1);
      genotype[locus] = one === one.toUpperCase() ? one + two : (two === two.toUpperCase() ? two + one : one + two);
    });
    var traits = root.PetCatalog.traitsFor(speciesId, genotype);
    game.pupCount += 1;
    var turn = Math.ceil(game.pupCount / PUP_NAMES.length);
    var pup = {
      id: speciesId + '-f' + game.pupCount,
      name: PUP_NAMES[(game.pupCount - 1) % PUP_NAMES.length] + (turn > 1 ? ' ' + turn : ''),
      speciesId: speciesId,
      genotype: genotype,
      traits: traits,
      visualId: root.PetCatalog.visualFor(speciesId, traits),
      parents: [a.id, b.id],
      parentNames: [a.name, b.name]
    };
    var entry = { number: game.pupCount, parents: [snapshot(a), snapshot(b)], pup: snapshot(pup) };
    game.journal.push(entry);
    return { ok: true, pup: pup, entry: entry };
  }

  root.PetBreeding = { create: create, rosterOf: rosterOf, find: find, cross: cross, meets: meets, mismatches: mismatches, planFor: planFor, stars: stars, pairChance: pairChance, seeded: seeded };
})(typeof globalThis !== 'undefined' ? globalThis : this);
