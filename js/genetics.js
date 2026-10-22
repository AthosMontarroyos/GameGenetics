(function (root) {
  'use strict';

  function normalizeGenotype(value) {
    if (typeof value !== 'string' || value.length !== 2 || !Array.from(value).every(function (a) { return a === 'A' || a === 'a'; })) {
      throw new Error('Genótipo inválido.');
    }
    return value.split('').sort(function (a, b) { return a === b ? 0 : a === a.toUpperCase() ? -1 : 1; }).join('');
  }

  function gametes(genotype) {
    var pair = normalizeGenotype(genotype);
    return [pair.charAt(0), pair.charAt(1)];
  }

  function phenotypeOf(genotype) {
    return normalizeGenotype(genotype).indexOf('A') === -1 ? 'marrom' : 'roxo';
  }

  function cross(parentA, parentB) {
    var a = gametes(parentA), b = gametes(parentB), counts = { AA: 0, Aa: 0, aa: 0 };
    var grid = b.map(function (row) { return a.map(function (col) {
      var genotype = normalizeGenotype(col + row); counts[genotype] += 1;
      return { alleleColumn: col, alleleRow: row, genotype: genotype, phenotype: phenotypeOf(genotype), weight: 0.25 };
    }); });
    var genotypes = { AA: counts.AA / 4, Aa: counts.Aa / 4, aa: counts.aa / 4 };
    return { parentA: normalizeGenotype(parentA), parentB: normalizeGenotype(parentB), gametesA: a, gametesB: b, grid: grid, genotypes: genotypes, phenotypes: { roxo: genotypes.AA + genotypes.Aa, marrom: genotypes.aa } };
  }

  function normalizeLoci(genotype, loci) {
    if (!genotype || typeof genotype !== 'object' || !Array.isArray(loci) || !loci.length) throw new Error('Genótipo de múltiplos genes inválido.');
    var out = {};
    loci.forEach(function (locus) {
      var pair = genotype[locus];
      if (typeof pair !== 'string' || pair.length !== 2 || !Array.from(pair).every(function (a) { return a.toUpperCase() === locus && (a === a.toUpperCase() || a === a.toLowerCase()); })) {
        throw new Error('Alelos inválidos no gene ' + locus + '.');
      }
      out[locus] = pair.split('').sort(function (a, b) { return a === b ? 0 : a === a.toUpperCase() ? -1 : 1; }).join('');
    });
    if (Object.keys(genotype).length !== loci.length) throw new Error('Quantidade de genes inválida.');
    return out;
  }

  function makeGametes(genotype, loci) {
    var normalized = normalizeLoci(genotype, loci), result = [{ alleles: {}, probability: 1 }];
    loci.forEach(function (locus) {
      var pair = normalized[locus], options = pair[0] === pair[1] ? [{ allele: pair[0], p: 1 }] : [{ allele: pair[0], p: 0.5 }, { allele: pair[1], p: 0.5 }];
      var next = [];
      result.forEach(function (base) { options.forEach(function (option) {
        var alleles = Object.assign({}, base.alleles); alleles[locus] = option.allele;
        next.push({ alleles: alleles, probability: base.probability * option.p });
      }); });
      result = next;
    });
    return result.map(function (item) { return { genotype: loci.map(function (l) { return item.alleles[l]; }).join(''), probability: item.probability }; });
  }

  function combineGametes(a, b, loci) {
    var result = {};
    loci.forEach(function (locus, index) {
      result[locus] = [a[index], b[index]].sort(function (x, y) { return x === y ? 0 : x === x.toUpperCase() ? -1 : 1; }).join('');
    });
    return result;
  }

  function genotypeKey(genotype, loci) { return loci.map(function (locus) { return genotype[locus]; }).join(''); }

  function crossLoci(parentA, parentB, loci, classify) {
    if (typeof classify !== 'function') throw new Error('A regra de fenótipo é obrigatória.');
    var a = normalizeLoci(parentA, loci), b = normalizeLoci(parentB, loci);
    var ga = makeGametes(a, loci), gb = makeGametes(b, loci), genotypes = {}, phenotypes = {}, grid = [];
    gb.forEach(function (row) {
      var cells = [];
      ga.forEach(function (col) {
        var genotype = combineGametes(col.genotype, row.genotype, loci), key = genotypeKey(genotype, loci);
        var phenotype = classify(genotype), weight = col.probability * row.probability;
        genotypes[key] = (genotypes[key] || 0) + weight;
        phenotypes[phenotype] = (phenotypes[phenotype] || 0) + weight;
        cells.push({ genotype: genotype, key: key, phenotype: phenotype, weight: weight });
      });
      grid.push({ gamete: row.genotype, probability: row.probability, cells: cells });
    });
    return { parentA: a, parentB: b, loci: loci.slice(), gametesA: ga, gametesB: gb, grid: grid, genotypes: genotypes, phenotypes: phenotypes };
  }

  function orderMet(chance, order) {
    var operator = order.operator || (order.exclusive ? '>' : '>='), minimum = order.minimum || 0, eps = 1e-10;
    if (operator === '>') return chance > minimum + eps;
    if (operator === '>=') return chance + eps >= minimum;
    if (operator === '=') return Math.abs(chance - minimum) <= eps;
    throw new Error('Operador de probabilidade inválido.');
  }

  root.PetGenetics = { normalizeGenotype: normalizeGenotype, gametes: gametes, phenotypeOf: phenotypeOf, cross: cross, crossLoci: crossLoci, makeGametes: makeGametes, normalizeLoci: normalizeLoci, orderMet: orderMet };
})(typeof globalThis !== 'undefined' ? globalThis : this);
