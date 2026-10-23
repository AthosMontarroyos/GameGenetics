---
paths:
  - "js/genetics.js"
  - "js/catalog.js"
  - "js/breeding.js"
  - "js/orders.js"
  - "docs/genetica.md"
---

# Genética e conteúdo

Detalhes completos em `docs/genetica.md`. Regras que não podem ser quebradas:

- Modelo didático **fictício**, não genética real. Nunca afirme na interface que descreve os animais reais.
- Cinco características por espécie (cor, olhos, orelhas, manchas, rabo) vindas de seis genes independentes `A B E O M T`. Cor usa dois genes (`A`, `B`).
- O jogador vê **só a aparência**. Não mostre genótipos, porcentagens nem quadro de Punnett nos pedidos ou na tela de jogo.
- Pedidos em linguagem natural, sem porcentagem. Todo pedido precisa ter ao menos um par de pais no catálogo capaz de gerá-lo (`PetBreeding.pairChance > 0`); o teste verifica isso.
- Filhote é sorteado (gerador com semente em `PetBreeding.seeded`). Estrelas: 3 até `par` cruzamentos, 2 até `par + 2`, senão 1.
- Dificuldade cresce dentro do nível: mais características pedidas e mais recessivas.
- Ao mudar catálogo, pedidos ou regras, atualize `tests/phase05.test.js` e `docs/genetica.md`.
