(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Genetics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function normalizeGenotype(first, second) {
    const alleles = [first, second].sort(function (left, right) {
      const leftDominant = left === left.toUpperCase();
      const rightDominant = right === right.toUpperCase();
      if (leftDominant !== rightDominant) return leftDominant ? -1 : 1;
      if (left < right) return -1;
      if (left > right) return 1;
      return 0;
    });
    return alleles.join("");
  }

  function punnett(genotypeA, genotypeB) {
    if (!genotypeA || genotypeA.length !== 2 || !genotypeB || genotypeB.length !== 2) {
      throw new Error("Genótipo monoíbrido precisa de dois alelos");
    }
    const rows = [genotypeA[0], genotypeA[1]];
    const cols = [genotypeB[0], genotypeB[1]];
    const cells = [];
    rows.forEach(function (rowAllele) {
      cols.forEach(function (colAllele) {
        cells.push(normalizeGenotype(rowAllele, colAllele));
      });
    });
    return { parent1: rows, parent2: cols, cells: cells };
  }

  function countGenotypes(cells) {
    return cells.reduce(function (counts, genotype) {
      counts[genotype] = (counts[genotype] || 0) + 1;
      return counts;
    }, {});
  }

  function phenotypeFor(genotype, gene) {
    const showsDominant = genotype.split("").some(function (allele) {
      return allele === gene.dominant;
    });
    return showsDominant ? gene.dominantPhenotype : gene.recessivePhenotype;
  }

  function zygosity(genotype) {
    if (genotype[0] === genotype[1]) {
      return genotype[0] === genotype[0].toUpperCase()
        ? "homozigoto dominante"
        : "homozigoto recessivo";
    }
    return "heterozigoto";
  }

  function probability(genotypeA, genotypeB, predicate) {
    const square = punnett(genotypeA, genotypeB);
    const hits = square.cells.filter(predicate).length;
    return {
      square: square,
      hits: hits,
      total: square.cells.length,
      probability: hits / square.cells.length,
    };
  }

  const PELAGEM = {
    id: "pelagem",
    name: "pelagem",
    dominant: "C",
    recessive: "c",
    dominantPhenotype: "pelo preto",
    recessivePhenotype: "pelo branco",
  };

  return {
    normalizeGenotype: normalizeGenotype,
    punnett: punnett,
    countGenotypes: countGenotypes,
    phenotypeFor: phenotypeFor,
    zygosity: zygosity,
    probability: probability,
    PELAGEM: PELAGEM,
  };
});
