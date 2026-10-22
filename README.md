# Pet Shop Mendel

Jogo educacional no navegador sobre um gene fictício da cor do Mendelino.
Este protótipo tem um nível solo, em português, com três atendimentos.

## Como abrir

Abra `index.html` no navegador (Chrome, Edge ou Firefox). Dê um duplo clique no arquivo ou arraste-o para uma janela do navegador.

Não é preciso instalar programas, baixar pacotes nem usar um servidor. O jogo usa HTML, CSS, JavaScript e as imagens PNG da pasta `assets`. Mantenha juntas, ao lado de `index.html`, as pastas `assets`, `css` e `js`.

Se uma imagem necessária não abrir, a tela inicial mostra o caminho que falhou.

## Como jogar

1. Clique em **Jogar**.
2. Ande com **WASD** ou as **setas**. O HUD mostra o pedido e a próxima ação. **Ajuda** reúne os controles e a teoria.
3. Fale com o cliente na marca roxa e pressione **E**. O diálogo traz o pedido. **Ir ao laboratório** só fecha a conversa.
4. Vá à marca azul e pressione **E**. A bancada mostra os pais, o quadro de Punnett e a chance.
5. Confirme um cruzamento que atenda ao pedido e volte ao cliente para entregar.
6. Repita nos três clientes. **Jogar novamente** reinicia o nível sem recarregar a página.

Uma escolha abaixo da chance pedida não avança o pedido. **Limpar seleção** ou **Rever os pais** permite corrigir. Fechar o painel não entrega o pedido.

## O que o nível mostra

- Genótipo (AA, Aa, aa) e fenótipo (pelo roxo ou marrom).
- Alelo **A** dominante e alelo **a** recessivo.
- Homozigose (AA ou aa) e heterozigose (Aa). AA e Aa têm a mesma aparência roxa.
- Gametas de cada pai e o quadro de Punnett 2×2, com 25% por célula.
- A chance calculada a partir dos pais escolhidos, não de uma proporção fixa.

É um modelo didático fictício, não uma descrição da genética real dos gatos. O exemplo de descendente mostra um resultado possível; a entrega não faz um sorteio.

## Arquivos do protótipo

- `index.html`: telas, painéis e canvas.
- `css/style.css`: layout, painéis e botões.
- `js/assets.js`: caminhos e recortes dos sprites usados.
- `js/genetics.js`: gametas, cruzamento, fenótipo e validação do pedido.
- `js/main.js`: mundo, teclado, pedidos e interface.

## Fora deste protótipo

Cooperativo, outros níveis, outras espécies, genética de dois genes, sons, animação completa de caminhada, moedas e contas de jogador.
