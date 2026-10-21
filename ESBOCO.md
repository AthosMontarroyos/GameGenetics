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

As folhas do Notion foram recortadas para `assets/sprites/`.

- Geneticista: quatro direções da faixa superior da folha (`front`, `back`, `left`, `right`).
- Laboratorista: a mesma silhueta, com os detalhes roxos puxados para o azul. A faixa inferior da folha é legenda, não um segundo corpo limpo.
- Mendelino, Gencko e Nibbli: um recorte por variante. No nível 1 só o Mendelino entra no cruzamento. O pelo preto usa o recorte escuro; o pelo branco é o mesmo desenho clareado, para o fenótipo não virar outro bicho. O cinza fica só como referência.
- Clientes: quatro direções de cada NPC. Na loja eles usam a frente.
- Cenário: `assets/shop/cenario-1.png`.

`tools/extract_sprites.py` refaz o recorte se as folhas forem baixadas de novo.

## Fora deste corte

Colisão do cenário, diibridismo, moedas, animações de passo e o relatório para o professor ficam para depois. Gencko e Nibbli aparecem no menu para travar o visual, sem gene próprio.
