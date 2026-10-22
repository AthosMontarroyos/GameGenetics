# Relatório — Pet Shop Mendel

Protótipo educacional de um nível solo, em português, para apresentação em 23/10/2026. Nome, turma, escola e professor ficam em branco para preenchimento de quem entrega o trabalho.

## Objetivo educacional

O jogador atende três clientes de um pet shop fictício. Cada pedido pede um Mendelino de pelo roxo ou marrom e uma chance mínima. Para entregar, é preciso escolher dois pais, ler o quadro de Punnett e confirmar um cruzamento que atinja a exigência. A chance muda conforme os pais; não existe uma proporção única decorada para todos os pedidos.

## Conceitos usados

- **Genótipo** é o par de alelos: AA, Aa ou aa.
- **Fenótipo** é a característica visível. Neste modelo, o pelo roxo ou o pelo marrom.
- **Alelo** é cada forma do gene. A é o alelo dominante. a é o alelo recessivo.
- **Dominância:** a presença de A produz pelo roxo. AA e Aa têm o mesmo fenótipo roxo.
- **Recessividade:** o pelo marrom só aparece em aa, quando não há alelo A.
- **Homozigose:** os dois alelos são iguais (AA ou aa).
- **Heterozigose:** os alelos são diferentes (Aa).

O gene da cor do Mendelino é fictício. O jogo não descreve a genética real dos gatos.

## Os três pedidos

| Pedido | Cliente | Exigência | Cruzamento que não atende | Cruzamento que atende |
| --- | --- | --- | --- | --- |
| 1 | Estudante | Pelo roxo, chance maior que 0% | aa × aa: 0% roxo | AA × aa: 100% Aa, pelo roxo |
| 2 | Homem adulto | Pelo marrom, no mínimo 25% | AA × Aa: 0% marrom | Aa × Aa: 25% aa, pelo marrom |
| 3 | Senhora idosa | Pelo marrom, 100% | Aa × aa: 50% marrom | aa × aa: 100% aa, pelo marrom |

Dois Mendelinos diferentes podem ter o mesmo genótipo. O mesmo indivíduo não ocupa as duas posições de pai. AA e Aa usam a mesma figura de pelo roxo. aa usa a figura marrom.

## Como a chance é calculada

Cada pai forma dois gametas, um com cada alelo. O quadro de Punnett é 2×2: cada célula junta um gameta do pai 1 com um gameta do pai 2 e vale 25%. As quatro células somam 100%. A chance do pedido é a soma das células cujo fenótipo é o pedido. A aprovação usa essa soma, comparada com a exigência daquele cliente.

Referência calculada pelo mesmo módulo do jogo:

- AA × AA → 100% AA
- AA × Aa → 50% AA e 50% Aa
- AA × aa → 100% Aa
- Aa × Aa → 25% AA, 50% Aa e 25% aa
- Aa × aa → 50% Aa e 50% aa
- aa × aa → 100% aa

Inverter os pais mantém as probabilidades. A notação aA é tratada como Aa. Um genótipo fora de A e a é rejeitado.

A imagem mostrada depois da aprovação é um exemplo de descendente possível. A entrega não faz sorteio e não garante um nascimento.

## Tecnologias e como executar

HTML, CSS e JavaScript, sem biblioteca, sem servidor e sem etapa de build. O mapa é um Canvas 2D.

Abra `index.html` no Chrome, Edge ou Firefox. Mantenha ao lado dele as pastas `assets`, `css` e `js`. Se uma imagem usada pelo jogo não carregar, a tela inicial mostra o caminho que falhou.

Controles: WASD ou setas para andar, E para interagir, Esc para fechar um painel sem entregar. **Ajuda** reúne os controles e o lembrete do gene. **Jogar novamente** reinicia o nível sem recarregar a página.

## Testes realizados em 21/10/2026

Genética, no runtime Node já instalado na máquina, sem framework de teste: as combinações acima, a soma de 100%, a normalização de aA, a rejeição de genótipos inválidos e os limites dos três pedidos passaram.

No navegador, em `http://127.0.0.1` com um servidor local temporário só para a ferramenta de teste, uma partida percorreu os três pedidos:

- Pedido 1: aa × aa mostrou 0% de pelo roxo e **Não atende ao pedido**, sem avançar o atendimento. AA × aa mostrou 100% de pelo roxo, foi aprovado e entregue.
- Pedido 2: o cruzamento aprovado lido na tela foi Aa × Aa, com AA 25%, Aa 50% e aa 25%. A entrega levou ao pedido 3. A frase de rejeição de AA × Aa não foi relida na tela; o cálculo de 0% de marrom foi conferido no módulo de genética, que é o mesmo usado pelo botão.
- Pedido 3: Aa × aa mostrou 50% de pelo marrom e não atendeu. aa × aa mostrou 100% e concluiu o nível.
- Fechar e reabrir o resultado aprovado manteve a aprovação. Trocar os pais removeu a aprovação e exigiu confirmar de novo.
- **Ajuda**, Tab e Esc mantiveram o foco no painel e devolveram o foco ao mapa. Com a ajuda aberta, o personagem não andou.
- E repetido não abriu o diálogo nem entregou duas vezes. **Jogar novamente** voltou ao pedido 1, na porta, e o primeiro cliente pôde ser atendido outra vez.
- Não houve erro de JavaScript nem aviso de imagem ausente.

Layouts medidos com a explicação **Entender o cálculo** fechada:

- 1366×768: Pais, Cruzamento e Resultado em três colunas, sem rolagem do painel.
- 1024×768: Pais à esquerda e as outras duas seções empilhadas à direita. A tela de aprovação tinha 1 px a mais e abria uma barra de rolagem; a margem do aviso de aprovação foi reduzida e a barra deixou de aparecer. Chance e **Confirmar cruzamento** ficaram visíveis.
- 390×844: uma coluna, na ordem Pais, Cruzamento, Resultado, com rolagem vertical e sem rolagem horizontal. O quadro, quando trazido à área visível, não ficou coberto pelo cabeçalho nem pelo rodapé de ações.

Segurar W junto com a seta para cima, e soltar só o W, manteve a seta registrada. O deslocamento só com a seta foi medido encostado em um obstáculo, então a posição não mudou nesse instante. O percurso até o balcão e até o laboratório foi feito com WASD. As setas não rolaram a página durante o controle do personagem.

## Limitações

Um gene, uma espécie, um nível e um jogador. Não há som, moedas, contas, animação completa de caminhada nem controle por toque. O caminho até o laboratório contorna o balcão e os móveis; o mapa de colisão não foi alterado. As capturas feitas na ferramenta de teste não foram copiadas para o repositório.

## Imagens e autoria do código

As ilustrações dos personagens, clientes, pets e do cenário foram preparadas com auxílio de geração de imagens e depois recortadas para o jogo. O desenvolvimento deste protótipo teve auxílio de IA. O código do nível, a regra do gene fictício e os textos de interface estão nos arquivos HTML, CSS e JavaScript do projeto.

## Referências conferidas

- Mendel, Gregor. 1866. “Versuche über Pflanzen-Hybriden”. *Verhandlungen des naturforschenden Vereines in Brünn*, Band IV (1865), pp. 3–47. Exemplar digital consultado: [Internet Archive](https://archive.org/details/versucheberpflan00mend).
- Tradução para o inglês conferida: Abbott, Scott, e Daniel J. Fairbanks. 2016. “Experiments on Plant Hybrids by Gregor Mendel”. *Genetics* 204 (2). [PMC5068836](https://pmc.ncbi.nlm.nih.gov/articles/PMC5068836/).

Se a escola exigir um livro didático ou uma página de material do curso, essa referência ainda precisa ser completada por quem assina o trabalho. Nenhuma outra fonte foi inventada para preencher a bibliografia.
