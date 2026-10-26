# Padrão visual — Pet Shop

Regra de ouro: todo bicho do jogo (gato, cachorro, coelho) segue este documento. Se uma imagem não bate com ele, não entra.

## 1. Estilo de arte

- Pixel art fofa (chibi), vista frontal, bicho sentado.
- Tela de 64x64 px. Exibição sempre em múltiplo inteiro (2x, 3x, 4x), sem suavização.
- Fundo transparente. Sem sombra no chão dentro da imagem (o jogo desenha a sombra).
- Cabeça grande: a cabeça ocupa cerca de 55% da altura do bicho; o corpo é curto e arredondado.
- Contorno de 1 px na cor "contorno" do pelo (mais escura que a sombra), nunca preto puro.
- 3 tons por pelo: luz, base, sombra. Luz vem de cima à esquerda; sombra embaixo à direita.
- Sem degradê, sem serrilhado, sem tracejado (dithering), sem brilho extra.
- Rosto: 2 olhos grandes de 4x4 px com brilho branco de 1 px, nariz rosa, boca em "w" pequena.
- 3 patinhas visíveis na frente, cada uma com uma divisão de dedos de 1 px.

## 2. Paleta (as 4 cores do jogo)

| Cor (genética) | Contorno | Sombra | Base | Luz | Mancha |
|---|---|---|---|---|---|
| preto | #1b1b24 | #272732 | #3d3d4a | #5a5a6e | #f1e6d2 |
| cinza | #565a69 | #7b7f8e | #9ca0ad | #bec2cd | #f4eadb |
| marrom | #4a2c17 | #6b4024 | #8c5a34 | #ab774a | #f1e1c6 |
| claro | #9c8454 | #cbb386 | #ead6ab | #f8ecce | #9a6a40 |

Cores comuns a todos:

- Olhos: azuis #2f86ff, verdes #35c768. Pupila #101820, brilho #ffffff.
- Interior da orelha e almofadinhas: rosa #e98ea0.
- Nariz: #c2566b. Focinho: #f4ead6.

## 3. Silhueta de cada espécie

| | Gato | Cachorro | Coelho |
|---|---|---|---|
| Cabeça | larga e achatada, bochechas | redonda, focinho grande | redonda e pequena |
| Corpo | esguio | robusto, peito largo | bola fofa, sentado |
| Orelhas eretas | triângulos pontudos | triângulos tortos para frente | longas e finas, 2x a cabeça |
| Orelhas caídas | dobradas para os lados | longas, caem ao lado do rosto | caídas ao lado da cabeça |
| Rabo longo | fino, curvo, sobe pela lateral | grosso, balança para o alto | pompom grande de algodão |
| Rabo curto | toco pequeno | toco pequeno | pompom pequeno |
| Marca de identidade | bigodes (3 traços por lado) | focinho largo e claro | nariz em "Y", bochechas cheias |

## 4. Características e como aparecem

Cada característica troca só a sua camada. Nada mais muda de uma combinação para outra.

- Cor: troca a paleta inteira (corpo, cabeça, orelhas, rabo).
- Olhos: azuis ou verdes, só a cor.
- Orelhas: eretas ou caídas.
- Manchas: sem manchas, ou mancha na cor "mancha": uma no rosto (olho esquerdo) e uma no peito.
- Rabo: longo ou curto.

## 5. Camadas (ordem de baixo para cima)

1. Rabo
2. Orelhas de trás
3. Corpo
4. Cabeça
5. Orelhas da frente
6. Manchas
7. Focinho, nariz e boca
8. Olhos

## 6. Prompt-base para gerar imagem

```
Cute chibi pixel art {ESPECIE}, front view, sitting, 64x64 pixel grid,
big head, 1px outline in a darker shade of the fur color (no pure black),
3-tone flat shading (light top-left, shadow bottom-right), {COR} fur,
{ORELHAS} ears, {RABO} tail, {MANCHAS}, large {OLHOS} eyes with a 1px white
highlight, small pink nose, transparent background, no shadow on the floor,
no gradients, no dithering, no anti-aliasing, limited palette.
```

Negativos: realistic, 3D, blurry, gradient, glow, text, watermark, background, anti-aliasing.

## 7. Checklist de aprovação

- Tem 64x64 (ou reduz exato para isso) e fundo transparente.
- Usa só as cores da paleta (tolerância de 1 tom).
- O contorno não é preto puro e tem 1 px.
- A espécie se reconhece só pela silhueta.
- Trocar uma característica não muda mais nada na imagem.
- Ao lado dos outros bichos, a altura da cabeça, o tamanho dos olhos e o contorno batem.

## 8. Fora do escopo visual (decidir depois)

Sistema de procriação com filhotes que crescem, cuidar dos animais (comida, brincar, humor) e estados do bicho (filhote, adulto, feliz, com fome). Isso muda o que precisa ser desenhado (filhote, expressões), então definimos antes de gerar a arte final.
