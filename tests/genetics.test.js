const genetics = require("../js/genetics.js");

const geneA = {
  dominant: "A",
  recessive: "a",
  dominantPhenotype: "dominante",
  recessivePhenotype: "recessivo",
};

let failed = 0;

function check(condition, message) {
  if (!condition) {
    failed += 1;
    console.error("FAIL", message);
  }
}

function countsOf(left, right) {
  return genetics.countGenotypes(genetics.punnett(left, right).cells);
}

const aaCross = countsOf("AA", "aa");
check(aaCross.Aa === 4, "AA × aa deve gerar 100% Aa");
check(aaCross.AA === undefined && aaCross.aa === undefined, "AA × aa não gera AA nem aa");

const hetero = countsOf("Aa", "Aa");
check(hetero.AA === 1 && hetero.Aa === 2 && hetero.aa === 1, "Aa × Aa é 1:2:1");

const recessive = countsOf("aa", "aa");
check(recessive.aa === 4, "aa × aa deve gerar 100% aa");

check(genetics.phenotypeFor("AA", geneA) === "dominante", "AA é fenótipo dominante");
check(genetics.phenotypeFor("Aa", geneA) === "dominante", "Aa é fenótipo dominante");
check(genetics.phenotypeFor("aa", geneA) === "recessivo", "aa é fenótipo recessivo");

const coat = genetics.PELAGEM;
const white = genetics.probability("Cc", "Cc", function (genotype) {
  return genetics.phenotypeFor(genotype, coat) === "pelo branco";
});
check(white.probability === 0.25, "Cc × Cc tem 25% de pelo branco");
check(white.hits === 1 && white.total === 4, "a chance sai das 4 células do Punnett");

const blackHomo = genetics.probability("CC", "Cc", function (genotype) {
  return genotype === "CC";
});
check(blackHomo.probability === 0.5, "CC × Cc tem 50% CC");

const allHetero = genetics.probability("CC", "cc", function (genotype) {
  return genotype === "Cc";
});
check(allHetero.probability === 1, "CC × cc tem 100% Cc");
check(allHetero.square.cells.every(function (cell) { return cell === "Cc"; }), "Punnett de CC × cc é só Cc");

check(genetics.zygosity("CC") === "homozigoto dominante", "CC homozigoto dominante");
check(genetics.zygosity("Cc") === "heterozigoto", "Cc heterozigoto");
check(genetics.zygosity("cc") === "homozigoto recessivo", "cc homozigoto recessivo");
check(genetics.normalizeGenotype("c", "C") === "Cc", "heterozigoto normaliza o dominante primeiro");

if (failed) {
  console.error(failed + " teste(s) falharam");
  process.exit(1);
}
console.log("genetics ok");
