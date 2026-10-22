(function (root) {
  'use strict';

  function normalizeGenotype(value) {
    if (typeof value !== 'string' || value.length !== 2) {
      throw new Error('Genótipo inválido.');
    }
    const alleles = value.split('');
    if (!alleles.every(function (allele) { return allele === 'A' || allele === 'a'; })) {
      throw new Error('Genótipo inválido.');
    }
    alleles.sort(function (left, right) {
      if (left === right) return 0;
      return left === 'A' ? -1 : 1;
    });
    return alleles.join('');
  }

  function gametes(genotype) {
    const normalized = normalizeGenotype(genotype);
    return [normalized.charAt(0), normalized.charAt(1)];
  }

  function phenotypeOf(genotype) {
    const normalized = normalizeGenotype(genotype);
    return normalized.indexOf('A') === -1 ? 'marrom' : 'roxo';
  }

  function cross(parentA, parentB) {
    const gametesA = gametes(parentA);
    const gametesB = gametes(parentB);
    const counts = { AA: 0, Aa: 0, aa: 0 };
    const grid = gametesB.map(function (alleleRow) {
      return gametesA.map(function (alleleColumn) {
        const genotype = normalizeGenotype(alleleColumn + alleleRow);
        counts[genotype] += 1;
        return {
          alleleColumn: alleleColumn,
          alleleRow: alleleRow,
          genotype: genotype,
          phenotype: phenotypeOf(genotype),
        };
      });
    });
    const genotypes = {
      AA: counts.AA / 4,
      Aa: counts.Aa / 4,
      aa: counts.aa / 4,
    };
    const phenotypes = {
      roxo: genotypes.AA + genotypes.Aa,
      marrom: genotypes.aa,
    };
    return {
      parentA: normalizeGenotype(parentA),
      parentB: normalizeGenotype(parentB),
      gametesA: gametesA,
      gametesB: gametesB,
      grid: grid,
      genotypes: genotypes,
      phenotypes: phenotypes,
    };
  }

  function orderMet(chance, order) {
    if (order.exclusive) return chance > order.minimum;
    return chance >= order.minimum;
  }

  root.PetGenetics = {
    normalizeGenotype: normalizeGenotype,
    gametes: gametes,
    phenotypeOf: phenotypeOf,
    cross: cross,
    orderMet: orderMet,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
