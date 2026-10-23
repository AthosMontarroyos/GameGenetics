# Pet Shop

Jogo educacional no navegador sobre modelos fictícios de herança para gatinho, cachorrinho e coelhinho.
São três níveis para um jogador (um por espécie), com um único atendente e quatro pedidos por nível.

## Como abrir

Abra `index.html` no navegador (Chrome, Edge ou Firefox). Dê um duplo clique no arquivo ou arraste-o para uma janela do navegador.

Não é preciso instalar programas, baixar pacotes nem usar um servidor. O jogo usa HTML, CSS, JavaScript e as imagens PNG da pasta `assets`. Mantenha juntas, ao lado de `index.html`, as pastas `assets`, `css` e `js`.

Se uma imagem necessária não abrir, a tela inicial mostra o caminho que falhou.

## Como jogar

1. Clique em **Jogar**.
2. Ande com **WASD** ou as **setas**. O HUD mostra o pedido e a próxima ação. **Ajuda** reúne os controles.
3. Aguarde o cliente chegar ao balcão. Aproxime-se e pressione **E** para ouvir o pedido (por exemplo, "um gatinho marrom, de olhos verdes").
4. Siga a seta branca até o laboratório e pressione **E**. Você vê só a **aparência** dos bichos disponíveis: os genes ficam escondidos.
5. Escolha **dois pais** e clique em **Cruzar**. Nasce um **filhote sorteado**. O **caderno** guarda todos os cruzamentos.
6. Se o filhote tem tudo o que o cliente pediu, escolha **Entregar este filhote**, leve até o cliente e pressione **E**. Se não tem, o cliente diz o que está errado: cruze de novo ou troque os pais.

Quanto menos cruzamentos, mais estrelas (até 3 por pedido). Cada nível tem uma espécie, com quatro pedidos de dificuldade crescente.

## O que o jogo mostra

- Cinco características nas três espécies: cor, olhos, orelhas, manchas e rabo, herdadas por seis genes independentes (dois para a cor).
- Dominância e recessividade, sem mostrar genótipos, porcentagens ou quadros de Punnett: o jogador deduz pelos filhotes e pelo caderno.
- Portadores: um bicho pode ter uma característica escondida e passá-la adiante.
- Sorte e raciocínio: cada filhote é um sorteio, mas todo pedido tem pais no catálogo que o geram.

É um modelo didático fictício, não uma descrição da genética real desses animais.

## Arquivos do protótipo

- `index.html`: telas, painéis e canvas.
- `css/style.css`: layout, painéis e botões.
- `js/assets.js`: caminhos e recortes dos sprites usados.
- `js/catalog.js`: espécies, indivíduos e regras visuais (genótipo → aparência).
- `js/orders.js`: níveis e pedidos em linguagem natural, sem porcentagens.
- `js/breeding.js`: o cruzamento do jogo (pais do catálogo, filhote sorteado, caderno e estrelas).
- `js/genetics.js`: gametas e cruzamentos usados pelo catálogo e pelos testes.
- `js/main.js`: mundo, teclado, pedidos, animação do atendente e interface.
- `js/customers.js`: chegada pela borda da rua, entrada pela porta, espera e saída dos clientes.
- `js/sprites.js`: desenhos completos e frontais de cada família com variações genéticas; `js/pet-art-data.js` permite usar a arte também sem servidor.
- `assets/animals/familias-anime.png`: atlas compartilhado de gato, cachorro e coelho.
- `assets/players/atendente-walk.png`: um personagem, três quadros por direção.
- `tests/phase05.test.js`: genética, cruzamento e filhote sorteado, pedidos, entrega, estrelas e trajeto dos clientes. Execute `node tests/phase05.test.js`.

## Para quem desenvolve

- `CLAUDE.md` e `.claude/rules/`: instruções para o Claude Code. `.cursor/rules/`: as mesmas regras para o Cursor.
- `docs/arquitetura.md`: módulos e fluxo do jogo. `docs/genetica.md`: genes, pedidos e estrelas.

## Fora deste protótipo

Cooperativo e seleção de personagem não fazem parte do escopo. Os seis clientes usam 16 quadros cada: quatro passos para cada direção, na entrada e na saída. Os recortes e apoios estão em `js/client-frames.js`, gerados por `node tools/build-client-frames.js`. O atendente também possui caminhada em quatro direções.
