# Esboço — Pet Shop Mendel

Protótipo do nível 1 a partir da página [Game Bio](https://app.notion.com/p/3f8f122a9b1b808fb18cf447892d40d6). Abra `index.html` por um servidor local (`python3 -m http.server`). Não há instalação.

## O que já dá para jogar

Uma pessoa, ou duas no mesmo teclado, atende três pedidos de Mendelino. O fluxo é pedido, escolha dos pais, quadro de Punnett e entrega.

O gene do nível é a pelagem, com dominância completa:

| Genótipo | Zigosidade | Fenótipo |
| --- | --- | --- |
| CC | homozigoto dominante | pelo preto |
| Cc | heterozigoto | pelo preto |
| cc | homozigoto recessivo | pelo branco |

A chance mostrada na tela é a fração das quatro células do Punnett. `CC × cc` dá 100% `Cc`. `Cc × Cc` dá 25% `CC`, 50% `Cc` e 25% `cc`. `cc × cc` dá 100% `cc`. Um cruzamento com 0% não completa o pedido. A pontuação soma a chance escolhida, sem sorteio.

No solo, a pessoa vê as duas etapas. No coop local, o jogador 1 trava os pais e o jogador 2 confirma o quadro. A conta não muda com o modo.

O plantel tem Noir (`CC`), Mina e Pingo (`Cc`), Nuvem e Algodão (`cc`). Com dois pets brancos, o pedido de pelo branco pode chegar a 100%. Com um único `CC`, o pedido de homozigoto preto chega no máximo a 50% (`CC × Cc`).

## Sprites

As folhas do Notion foram recortadas para `assets/sprites/`. O nome de cada arquivo segue a legenda da folha. Nenhum sprite foi recolorido.

Personagens, da esquerda para a direita: geneticista masculino, geneticista feminino, laboratorista masculino e laboratorista feminino. Cada pasta tem `retrato.png` e, embaixo, as direções `front`, `back`, `left` e `right`. Cada direção traz três quadros de passo (`front-1.png`, `front-2.png`, `front-3.png`). O arquivo sem número é o quadro do meio. `geneticista/` e `laboratorista/` repetem o par masculino, que é o usado no protótipo.

Pets, uma espécie por coluna: Mendelino, Gencko e Nibbli. A primeira faixa é `frente`, `costas`, `esquerda` e `direita`. As cores desenhadas ficam ao lado: Mendelino branco, cinza, preto e marrom; Gencko azul, verde, vermelho e amarelo; Nibbli branco, cinza, marrom e rosa. Orelhas, padrão e olhos estão na mesma pasta. No nível 1 o cruzamento usa o Mendelino branco e o preto da folha.

Clientes, da esquerda para a direita: `estudante-f`, `estudante-m`, `senhora`, `homem`, `alternativa` e `crianca`. As faixas, de cima para baixo, são `front`, `left`, `right` e `back`, com três quadros cada. Na loja eles usam a frente.

O cenário continua em `assets/shop/cenario-1.png`. `tools/extract_sprites.py` refaz o recorte a partir das folhas.

## Fora deste corte

Colisão do cenário, diibridismo, moedas, animações de passo e o relatório para o professor ficam para depois. Gencko e Nibbli aparecem no menu para travar o visual, sem gene próprio.
