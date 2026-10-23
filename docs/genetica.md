# Genética do jogo

Modelo **didático e fictício**. Não descreve a genética real de gatos, cachorros ou coelhos.

## Genes

Seis locos independentes, cada um com alelo dominante (maiúscula) e recessivo (minúscula):

| Loco | Característica | Dominante | Recessivo |
|---|---|---|---|
| `A`, `B` | Cor (dois genes) | ver tabela abaixo | ver tabela abaixo |
| `E` | Olhos | azuis | verdes |
| `O` | Orelhas | eretas | dobradas (gato) / caídas (cachorro, coelho) |
| `M` | Manchas | com manchas | sem manchas |
| `T` | Rabo | longo | curto |

Cor = `colors[(A_ ? 0 : 2) + (B_ ? 0 : 1)]`, com a lista de cores de cada espécie em `catalog.js`:

| Espécie | `A_B_` | `A_bb` | `aaB_` | `aabb` |
|---|---|---|---|---|
| Gatinho | preto | cinza | marrom | claro |
| Cachorrinho | marrom | preto | cinza | claro |
| Coelhinho | cinza | marrom | claro | preto |

## O que o jogador vê

- Só aparência. Genótipos, porcentagens e quadro de Punnett não aparecem durante o jogo.
- Deduz a herança pelos filhotes e pelo **caderno** de cruzamentos.
- Portadores: um bicho pode esconder uma característica recessiva e passá-la adiante.

## Cruzamento e pontuação

- Cada filhote é sorteado: um gameta de cada pai por loco (`PetBreeding.cross`, gerador com semente).
- `PetBreeding.pairChance` calcula a chance de um par gerar o pedido; todo pedido tem par com chance > 0.
- `planFor` define o `par` (cruzamentos esperados) de cada pedido. Estrelas: 3 se `tentativas <= par`, 2 se `<= par + 2`, senão 1.

## Pedidos

Quatro por nível, dificuldade crescente (em `orders.js`). Exemplo do gato: `cinza` → `marrom + olhos verdes` → `claro + orelhas dobradas + rabo curto` → cinco características.

## Mudando o conteúdo

1. Edite `catalog.js` (indivíduos/regras) ou `orders.js` (pedidos).
2. Rode `node tests/phase05.test.js`.
3. Atualize este documento e o `README.md`.
