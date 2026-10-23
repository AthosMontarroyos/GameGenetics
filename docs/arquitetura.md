# Arquitetura

Aplicação estática: `index.html` carrega CSS, scripts `defer` e PNGs locais. Sem build.

## Módulos (`js/`)

| Arquivo | Global | Papel |
|---|---|---|
| `genetics.js` | `PetGenetics` | Gametas e cruzamento por locos (`crossLoci`). Também guarda o modelo de um gene só, usado em testes antigos. |
| `catalog.js` | `PetCatalog` | Espécies, 16 indivíduos por espécie, regra genótipo → aparência, receita (código/genes) de cada variante, `suggestCross`. |
| `orders.js` | `PetOrders` | Níveis, pedidos em linguagem natural e os seis clientes. |
| `breeding.js` | `PetBreeding` | Partida: pais do catálogo, filhote sorteado, caderno, `pairChance`, `planFor` e estrelas. |
| `customers.js` | `PetCustomers` | Trajeto do cliente: chegada pela rua, porta, espera, saída. |
| `sprites.js` | | Desenho das famílias com variações genéticas; usa `pet-art-data.js`. |
| `assets.js` | | Caminhos e recortes das imagens; carregamento com relato de falha. |
| `main.js` | | Mundo, teclado, colisão, canvas, HUD, painéis (laboratório, ajuda, diálogo) e fluxo geral. |

Gerados: `client-frames.js`, `occluders.js`, `pet-art-data.js`.

## Fluxo de uma partida

1. Início → `resetPlay` cria a partida do nível (`PetBreeding.create`).
2. Cliente chega (`PetCustomers`), jogador conversa (**E**) e ouve o pedido.
3. Laboratório: escolhe dois pais, `doBreed` chama `PetBreeding.cross`, o filhote entra no caderno.
4. `tryDeliver` compara o filhote com o pedido (`meets`/`mismatches`); se atende, `completeOrder` calcula as estrelas.
5. Quatro pedidos terminam o nível; três níveis terminam o jogo.

## Ferramentas (`tools/`)

- `node tools/build-client-frames.js` → `js/client-frames.js` (recortes por pixels com alfa dos sprites de clientes).
- `node tools/build-occluders.js` → `js/occluders.js` (máscaras do cenário que cobrem o jogador).

## Testes

`node tests/phase05.test.js`: genética, cruzamento, pedidos, entrega, estrelas e trajeto dos clientes. Sem framework; falha lançando exceção.

## Assets

`assets/animals` (atlas), `assets/players` (atendente, 3 quadros por direção), `assets/npcs` (6 clientes), `assets/scenery` (loja).
