# Pet Shop Mendel — rodada 4: finalizar e validar a entrega

## Instrução para o agente

Execute este plano no repositório atual. Este documento é autossuficiente: não depende de planos ou prompts anteriores. Primeiro confira o que já está implementado; execute somente o que estiver faltando ou falhando. Não devolva apenas outro plano e não reescreva o jogo do zero.

Objetivo: fechar uma versão solo confiável do Pet Shop Mendel para apresentação em 23/10/2026, com interface legível, três atendimentos completos, genética correta e documentação para entregar.

## 1. Estado atual e limites

O projeto usa HTML, CSS e JavaScript puro. `index.html` carrega `js/assets.js`, `js/genetics.js` e `js/main.js`; o estilo está em `css/style.css`. Não há backend, framework, dependências ou etapa de build. Deve continuar abrindo diretamente por `index.html`.

O código atual já contém:

- Mapa fixo em Canvas, personagem controlável, colisões básicas e três clientes.
- HUD compacto, diálogo curto com o cliente, ajuda e laboratório.
- Seleção de dois pais, Punnett calculado e aprovação conforme a chance exigida.
- Bancada com três colunas em telas largas, duas em telas intermediárias e uma em telas estreitas.
- Ações do laboratório separadas do conteúdo, com rodapé aderente em telas estreitas.
- Confirmação desabilitada até selecionar dois pais.
- Controle por teclas físicas, isolamento de foco dos painéis e reinício.

A versão anterior concluiu os três pedidos em teste real de navegador. A versão atual passou em verificações de sintaxe, genética e funções selecionadas, mas ainda precisa de uma partida completa e validação visual após as últimas alterações. Não afirmar que a versão atual já foi integralmente testada.

### Restrições obrigatórias

- Não instalar nem baixar ferramentas, bibliotecas, imagens, fontes ou pacotes.
- Não gerar, alterar, substituir ou excluir imagens. Usar os PNGs existentes.
- Não adicionar coop, espécies, níveis, moedas, contas, áudio ou novos sistemas.
- Não publicar, fazer push ou commit.
- Preservar cenário, sprites, regras genéticas e fluxo aprovado.
- Não alterar o mapa de colisões ou a velocidade sem comprovar um problema durante o teste.
- Corrigir problemas concretos; não iniciar outra reformulação visual.

## 2. Fluxo que deve funcionar

1. Abrir o jogo e clicar em **Jogar**.
2. Caminhar com WASD/setas até a marca roxa e pressionar E para receber o pedido.
3. Fechar o diálogo, caminhar até a marca azul e pressionar E para abrir o laboratório.
4. Selecionar dois indivíduos distintos, analisar o Punnett e confirmar.
5. Rejeitar uma combinação abaixo da chance exigida, preservando a seleção e permitindo corrigir.
6. Aprovar uma combinação adequada, mostrar um descendente possível e orientar a entrega.
7. Voltar ao cliente e pressionar E para entregar. Só essa ação avança o pedido.
8. Após três entregas, mostrar conclusão e permitir reiniciar sem recarregar.

### Regras genéticas fixas

Um gene fictício: A dominante produz pelo roxo; aa produz pelo marrom. AA e Aa devem compartilhar a mesma aparência roxa para esse gene.

| Pedido | Exigência | Escolha rejeitada | Escolha aceita |
| --- | --- | --- | --- |
| 1 — estudante | Roxo, chance maior que 0% | aa × aa: 0% roxo | AA × aa: 100% roxo |
| 2 — homem adulto | Marrom, mínimo de 25% | AA × Aa: 0% marrom | Aa × Aa: 25% marrom |
| 3 — senhora idosa | Marrom, 100% | Aa × aa: 50% marrom | aa × aa: 100% marrom |

Quadro, probabilidades e aprovação precisam usar o mesmo cálculo. Não codificar proporções universais nem sortear até obter um filhote desejado. A imagem de resultado é um exemplo de descendente possível, não um sorteio nem uma garantia de nascimento.

## 3. Conferir e finalizar a interface

Inspecionar o laboratório com dois pais selecionados, com uma escolha rejeitada e com o resultado aprovado.

### Layout esperado

- A partir de 1100px: Pais, Cruzamento e Resultado em três colunas.
- Entre 900px e 1099px: Pais à esquerda; Cruzamento e Resultado empilhados à direita.
- Abaixo de 900px: Pais → Cruzamento → Resultado em uma coluna, com ações acessíveis durante a rolagem.
- Em 1366×768 e 1024×768, os pais, o Punnett, a chance e a confirmação devem aparecer sem rolagem vertical do painel quando as explicações estiverem fechadas.
- Em 390×844, permitir rolagem vertical sem transbordamento horizontal, texto cortado ou botões cobrindo conteúdo. Não é necessário implementar controle por toque.

Se os critérios falharem, ajustar somente o necessário: espaços, altura dos cartões, distribuição das colunas e repetição de textos. Não diminuir a fonte para forçar o conteúdo a caber. A explicação completa fica em **Entender o cálculo** ou na ajuda.

### Interação e foco

- Ao abrir o laboratório, começar no primeiro animal, sem saltar para o fim.
- Selecionar/remover pais não pode perder foco ou provocar rolagem inesperada.
- Cada botão de ação deve existir uma única vez, sem IDs duplicados.
- Confirmar fica desabilitado sem dois pais; com dois pais inadequados, permite tentar e mostra por que não atende.
- Mostrar chance calculada e exigência juntas, com aprovação/rejeição também em texto.
- Após aprovação, deixar a mensagem e **Voltar ao cliente** perceptíveis.
- Cabeçalho e rodapé aderentes não podem esconder controles focados ou células do quadro.
- Fechar/reabrir o resultado preserva a aprovação. Limpar ou alterar pais invalida a aprovação anterior.
- Tab/Shift+Tab ficam na superfície ativa; Esc fecha o painel e devolve o foco ao jogo.
- Enquanto um painel estiver aberto, o personagem permanece parado.

## 4. Verificações obrigatórias

### Genética e funções

Usar apenas o runtime já disponível. Não instalar um framework de testes.

- Validar as nove combinações entre AA, Aa e aa.
- Resultados de referência: AA × AA → 100% AA; AA × Aa → 50% AA e 50% Aa; AA × aa → 100% Aa; Aa × Aa → 25% AA, 50% Aa e 25% aa; Aa × aa → 50% Aa e 50% aa; aa × aa → 100% aa. A inversão dos pais mantém as probabilidades.
- Confirmar soma de 100%, normalização de aA para Aa e rejeição de genótipos inválidos.
- Confirmar os limites de aprovação dos três pedidos da tabela acima.
- Confirmar que dois indivíduos do mesmo genótipo são permitidos e o mesmo indivíduo não ocupa as duas posições.
- Confirmar que segurar W e seta para cima e soltar apenas W mantém o movimento pela seta.
- Confirmar bloqueio da rolagem pelas setas durante o jogo e ausência de interação repetida ao manter E pressionado.

### Partida real

Quando houver navegador permitido, executar o percurso completo dos três pedidos. Em cada pedido, primeiro tentar a escolha rejeitada da tabela, depois corrigir, confirmar e entregar.

Durante essa partida:

1. Fechar e reabrir um resultado aprovado antes da entrega.
2. Revisar os pais, alterar a seleção e conferir que é necessário aprovar novamente.
3. Abrir e fechar a ajuda, testar Esc e navegação por Tab/Shift+Tab.
4. Conferir que E repetido não pula atendimento nem entrega duas vezes.
5. Concluir os três pedidos, reiniciar e receber o primeiro pedido novamente.
6. Conferir ausência de erros JavaScript e falhas no carregamento dos assets usados.

Testar os três tamanhos de janela definidos na seção anterior e restaurar a janela ao tamanho normal após os testes.

Registrar capturas do laboratório e da conclusão se a ferramenta disponível permitir. Não modificar imagens do jogo para criar essas evidências.

Se o navegador estiver indisponível ou bloquear acesso, não contornar a restrição e não afirmar que jogou. Registrar exatamente os testes de código executados e deixar o percurso visual marcado como pendente.

## 5. Preparar a documentação da entrega

### README

Conferir se as instruções atuais correspondem aos controles e botões reais. Manter instruções curtas para abrir e jogar. Explicar que a pasta assets e as pastas de scripts/estilos devem acompanhar o HTML.

### Relatório

Criar `RELATORIO.md`, em português, com:

- Objetivo educacional do jogo.
- Explicação de genótipo, fenótipo, alelos, dominância, recessividade, homozigose e heterozigose.
- Aplicação desses conceitos nos três pedidos, com os cruzamentos e percentuais corretos.
- Descrição breve do cálculo de gametas e Punnett.
- Explicação de que o gene do Mendelino é fictício e a entrega demonstra um resultado possível sem sorteio.
- Tecnologias utilizadas e instruções para executar.
- Resultados dos testes realmente realizados e limitações da versão.
- Identificação honesta de que as imagens foram preparadas com auxílio de geração de imagens e o desenvolvimento teve auxílio de IA.
- Referências teóricas verificáveis. Não inventar URLs, autores ou fontes consultadas. Se não puder verificar uma referência, registrar essa pendência para o autor completar.
- Capturas somente se realmente produzidas; não inserir links para arquivos inexistentes.

Não inventar nome de aluno, turma, escola, professor ou exigências de avaliação. Esses dados ficam para o usuário preencher. Não produzir ZIP nem publicar sem solicitação.

O inventário `assets/notion-assets.json` descreve os arquivos originais do Notion, anteriores às edições. Ele não é carregado pelo jogo; não usá-lo como fonte dos caminhos atuais e não transformar sua atualização em uma nova tarefa.

## 6. Critério de conclusão e resposta final

Esta rodada termina quando os testes disponíveis passarem, os problemas confirmados tiverem sido corrigidos e README/relatório estiverem coerentes com a versão real. Não adicionar funcionalidades depois disso.

Entregar uma resposta curta com:

1. Arquivos alterados e motivo.
2. Testes executados e resultados.
3. Confirmação explícita de se os três pedidos foram jogados em navegador real.
4. Pendências concretas, incluindo qualquer validação visual ou referência teórica que não pôde ser concluída.

Se a interface já cumprir os critérios, preservá-la e concentrar o trabalho em validação e documentação. Não chamar uma verificação simulada de partida real.
