# Próximas fases — Pet Shop Mendel

Plano registrado em 21/10/2026 para iniciar em 22/10/2026. Entrega prevista para 23/10/2026.

## Objetivo

Ampliar o jogo que já funciona: receber pedido, caminhar até o laboratório, analisar um cruzamento, confirmar e voltar ao cliente. Preservar o mapa em primeiro plano, o HUD discreto e a bancada compacta. O plano não autoriza reescrever o projeto inteiro nem baixar recursos.

As fases abaixo representam a direção desejada. Não há evidência suficiente para prometer todas antes do dia 23; a versão atual deve permanecer disponível para apresentação enquanto as melhorias são verificadas.

## Revisão do estado atual

- `js/genetics.js`: modelo correto para um gene com dominância completa, AA/Aa/aa, dois fenótipos e quadro 2×2. Ainda não representa dois genes nem outras regras de herança.
- `js/assets.js`: carrega apenas seis arquivos: cenário, um jogador, Mendelino e três clientes. Dos pets existentes, Gencko e Nibbli ainda não estão integrados. Os recortes são manuais; não presumir uma grade regular.
- `js/main.js`: catálogo de cinco indivíduos, três pedidos e textos da genética estão no mesmo arquivo da interface e do mundo. A renderização dos pets usa sempre `images.mendelino` e `frames.mendelino`.
- Espécie, nomes dos fenótipos, genótipos da tabela e progresso de três pedidos aparecem fixos em vários pontos. Apenas adicionar imagens ao carregador não resolve essa ampliação.
- Clientes aparecem parados no balcão e são substituídos quando o índice do pedido muda. Não existe ciclo de entrada, espera, atendimento e saída.
- O jogador tem uma pose por direção. Não existe seleção de personagem nem ciclo de caminhada.
- `ANALISE_ASSETS.md` descreve arquivos JPG e o esqueleto inicial; serve como registro histórico, não como inventário atual dos PNGs.
- Corrigir a explicação no `RELATORIO.md`: cada gameta recebe um alelo de cada gene; um indivíduo não produz exatamente dois gametas. Revisar também as explicações da interface quando ampliar o modelo.

### Verificações executadas nesta revisão

Sintaxe dos três JavaScripts; nove combinações de AA/Aa/aa; soma de probabilidades; normalização de aA; rejeição de genótipos inválidos; limites dos pedidos; existência dos seis arquivos usados pelo carregador. Todos passaram.

Em simulação do código em memória, os três pedidos rejeitaram escolhas inadequadas, aprovaram escolhas corretas, preservaram aprovação ao reabrir e avançaram na entrega. Reinício e W + seta para cima, soltando W e deslocando em área livre, também passaram. Nenhum gancho de teste foi salvo no jogo. Esses resultados não substituem testes visuais no navegador.

## Próxima fase — pets, genética e pedidos

Esta é a prioridade de amanhã. Entregar em partes pequenas, cada uma jogável, antes de iniciar a próxima.

### 1. Catálogo de espécies e variantes

Criar dados separados para espécies, indivíduos, variantes visuais e pedidos, por exemplo em `js/catalog.js` e `js/orders.js`, sem mudar a tecnologia do projeto. Continuar funcionando por abertura local, sem fetch obrigatório, pacotes ou build.

Cada indivíduo precisa de ID próprio, espécie, nome, genótipo e referência visual. Cada espécie precisa indicar genes, regras de fenótipo e sprites compatíveis. Duas instâncias podem ter o mesmo genótipo; o mesmo indivíduo continua proibido nas duas posições de pai.

Inspecionar os PNGs atuais de Mendelino, Gencko e Nibbli e catalogar todas as variantes distintas e utilizáveis. Registrar arquivo, retângulo, pose, ponto de apoio e escala; separar variantes de poses repetidas. Identificar recortes defeituosos, sem inventar coordenadas ou afirmar que toda célula é uma variante válida.

Mostrar as três espécies no jogo com seus recortes existentes. Filtrar os pais pela espécie do pedido e impedir cruzamento entre espécies diferentes. A relação entre genótipo e aparência deve vir do catálogo, substituindo as funções que hoje assumem apenas roxo/marrom e Mendelino.

Critérios: escolher pais e ver um descendente possível das três espécies; nenhuma imagem de outra espécie; nenhum recorte cortado; AA e Aa continuam visualmente iguais quando a regra for dominância completa. Preservar o funcionamento dos três pedidos originais.

### 2. Aumentar a complexidade genética com progressão

Manter os três pedidos atuais como introdução. Depois acrescentar desafios de dois genes independentes com dominância completa, explicitamente apresentados como modelo fictício. Uma característica pode ser cor e a outra padrão, somente se os sprites realmente permitirem distinguir as combinações.

Antes de implementar, definir a tabela de cada gene e o mapeamento das combinações para os sprites disponíveis. Não deduzir genótipos da posição da imagem na folha. Se faltarem imagens para uma combinação, usar apenas a característica suportada nessa espécie e registrar a limitação; não apresentar um resultado visual incompatível.

Representar os genes separadamente, por exemplo `{ cor: 'Aa', padrao: 'Bb' }`, em vez de ampliar a validação atual aceitando qualquer texto de quatro letras. Gerar gametas com probabilidades e combinar os resultados por peso. A independência dos genes precisa ser uma hipótese declarada do modelo.

O quadro deixa de ter quatro células fixas. AaBb pode gerar AB, Ab, aB e ab, com 25% cada; AaBb × AaBb pode ter 16 combinações de 6,25%. Gametas únicos podem ser agrupados, desde que seus pesos sejam mantidos. Não manter o texto global “cada célula vale 25%”. Mostrar primeiro o resumo e deixar o quadro maior em uma área expansível para preservar a bancada compacta.

Critérios: conservar os nove cruzamentos de um gene; AA BB × aa bb produz 100% AaBb; AaBb × AaBb produz proporções fenotípicas 9:3:3:1 sob essas hipóteses; AaBb × aabb produz 1:1:1:1; a soma é 100%. Recusar genótipos e combinações de espécies inválidos. Não adicionar ligação gênica, mutações ou outras regras nesta entrega.

### 3. Pedidos mais complexos e compreensíveis

Pedidos devem conter espécie, características desejadas, operador de comparação, limite e pais disponíveis. Usar operadores claros (`>`, `>=`, `=`) no lugar de depender apenas do booleano `exclusive`.

Progredir de uma característica para duas simultâneas; depois pedir limites diferentes ou comparação entre possibilidades. Um pedido de duas características exige a probabilidade conjunta, não a soma das chances isoladas. Exemplo: duas características recessivas em AaBb × AaBb têm chance conjunta de 6,25% neste modelo.

Selecionar combinações que tenham sprites correspondentes e garantir automaticamente que cada pedido tenha ao menos uma solução entre dois indivíduos distintos disponíveis. Para cada desafio, conferir uma resposta válida e outra inválida. Evitar pedidos aleatórios impossíveis; começar com uma sequência escrita e revisada.

Mostrar claramente espécie, aparência pedida, exigência e chance obtida. Explicar a rejeição de forma específica. Continuar aprovando o plano de cruzamento pela probabilidade, sem introduzir sorteio na entrega. Se futuramente houver filhotes sorteados, isso será uma mudança de mecânica separada.

Remover o total fixo de três do HUD e da conclusão: calcular pelo conjunto de pedidos ativo. Atualizar ajuda, tela final, README e relatório conforme o conteúdo implementado.

## Depois da próxima fase — clientes e conversas

Implementar estados explícitos: entrando → aguardando → conversando → aguardando entrega → saindo. Manter um atendimento ativo por vez. Não trocar instantaneamente o sprite no balcão.

Definir uma rota curta e caminhável entre entrada e atendimento; conferir os pontos contra as colisões existentes. Durante transições, impedir interação antecipada e entrega duplicada. O próximo cliente só chega quando o anterior libera o atendimento. Evitar implementar navegação genérica se uma rota fixa resolver o mapa atual.

Criar conversas curtas por cliente: saudação, pedido, lembrete e agradecimento. O texto deve refletir o estado real, sem repetir a apresentação inteira ao rever o pedido. Uma rejeição deve orientar o raciocínio, sem revelar automaticamente os pais corretos. Preservar fechamento por Esc, navegação por Tab, foco e pausa do movimento com painel aberto.

Critérios: chegada e saída completas; nenhuma colisão visual evidente; pedido e cliente sincronizados; jogador pode rever o pedido; reiniciar limpa clientes e diálogos pendentes.

## Depois — menu, personagem e animações

- Criar menu com título, botão Jogar destacado, seleção de personagem e ajuda. A experiência deve continuar entrando rapidamente na partida.
- Vídeo de fundo: usar apenas um arquivo local existente e autorizado. Não há vídeo no inventário revisado. Enquanto não houver esse material, usar o cenário atual como fundo. Não baixar nem gerar vídeo como dependência da entrega. Quando disponível, prever vídeo mudo em loop, imagem de fallback e redução de movimento; falha de reprodução não pode impedir Jogar.
- Integrar as quatro folhas de jogador existentes como opções visuais, após verificar recortes, direções e escala. A escolha troca a aparência, sem alterar velocidade ou colisão, e permanece ao reiniciar a partida durante a sessão.
- Adicionar caminhada por direção somente com poses consistentes. Separar direção, estado parado/andando e tempo da animação. Fixar o apoio dos pés para evitar tremor; não presumir que todas as colunas formam um ciclo válido.

Critérios: todas as opções caminham sem cortes; pés e colisões permanecem alinhados; parada congela a caminhada; abrir painel pausa o movimento; o menu funciona mesmo sem vídeo.

## Finalização — detalhes e entrega

Congelar novas funcionalidades com tempo para uma partida completa em 22/10 e uma conferência final em 23/10. Corrigir bloqueios antes de adicionar decoração.

Repetir a partida do início ao fim, com erros propositais, revisão de pais, reabertura, ajuda, reinício e todas as espécies implementadas. Conferir 1366×768, 1024×768 e 390×844; a interface estreita pode rolar verticalmente, mas controles por toque ainda precisam de trabalho caso sejam exigidos. Layout responsivo sozinho não torna o jogo jogável no celular.

Conferir abertura com a pasta completa em outro local, caminhos relativos e ausência de erros de carregamento. Atualizar relatório e instruções com o escopo real, autoria, referências e limites. Preencher identificação escolar. Salvar capturas úteis se exigidas e ensaiar uma demonstração curta com uma escolha errada e outra correta.

## Ordem para proteger a entrega

1. Preservar uma cópia jogável da versão atual usando os recursos locais disponíveis.
2. Catálogo e três espécies, conservando a genética simples e os pedidos originais.
3. Dois genes e pedidos conjuntos, somente depois de validar o catálogo e a representação visual.
4. Clientes e diálogos.
5. Escolha de personagem e animações verificadas.
6. Menu com vídeo quando houver material local; não deve bloquear a finalização.
7. Ensaio, documentação, capturas, conferência do pacote e preparação da publicação por link.

Se faltar tempo, entregar o último estágio completo e testado. Não deixar funcionalidades parciais acessíveis nem trocar um fluxo aprovado por uma expansão quebrada. Trabalhar por etapa e informar exatamente o que foi implementado, testado e adiado, para controlar o uso dos créditos.

## Complemento após conferir o planejamento original no Notion

Fonte: [Game Bio — planejamento de Pet Shop Mendel](https://app.notion.com/p/3f8f122a9b1b808fb18cf447892d40d6), consultado em 21/10/2026. A página mistura objetivos com afirmações de conclusão que não correspondem ao código atual. Checkboxes não são evidência de implementação.

As prioridades mais recentes do usuário continuam válidas: ampliar pets, cruzamentos e pedidos. Este complemento acrescenta requisitos de entrega e dependências que não podem ficar escondidos atrás dessas expansões.

### Cobertura dos requisitos e lacunas adicionais

| Requisito da fonte | Estado observado | Trabalho a acrescentar | Prioridade |
| --- | --- | --- | --- |
| Publicação como link para o professor | Só foi iniciado um servidor local; 127.0.0.1 não é acessível pelo professor em outro computador | Preparar hospedagem estática e testar a URL final em outra sessão; publicar quando solicitado | Essencial de entrega |
| HTML, CSS e JS em arquivo único | Fonte atual usa arquivos separados e imagens locais | Confirmar se a exigência é um HTML autossuficiente ou um pacote/site; preparar um artefato de entrega único se necessário, preservando os fontes organizados | Resolver antes de empacotar |
| Escolha entre Geneticista e Laboratorista no solo | Apenas geneticista-01 é carregado | Entregar primeiro a escolha visual básica entre os dois papéis com quatro direções; as quatro variantes e animações completas podem vir depois | Lacuna do MVP descrito |
| Prints no relatório | Relatório existe, mas não contém as capturas exigidas pelo planejamento | Incluir imagens do pedido, pais, Punnett/probabilidades, rejeição e conclusão da versão final | Essencial de entrega |
| Base teórica e aplicação dos conceitos | Relatório já apresenta boa parte do conteúdo, embora os itens no Notion estejam desmarcados | Corrigir a explicação dos gametas, ligar conceitos a telas e revisar referências; incluir segunda lei somente se implementada | Essencial de entrega |
| Três a cinco pedidos por nível | Há um nível com três pedidos | Preservar esse intervalo e definir conjuntos/níveis explícitos se a expansão tiver mais atendimentos | Dependência da expansão |
| Seis tipos de clientes e quatro direções | Só três clientes e uma pose por cliente estão cadastrados | Catalogar os seis NPCs e suas direções; reutilizá-los nos novos pedidos e na chegada/saída | Junto da fase de clientes |
| Entrada externa e saída da loja | Não existe ciclo do NPC; obstáculos atuais bloqueiam a área inferior inteira | Definir spawn/despawn, corredor externo e rota caminhável antes de animar clientes | Pré-requisito de chegada |
| Coop local por turnos, opcional | Marcado como feito no Notion, mas não há modo coop no código | Registrar como ausente; implementar apenas se houver tempo após garantir o solo e a entrega | Opcional |
| Progressão, moedas/pontuação | Existe avanço entre três pedidos, sem progressão entre níveis nem economia | Acrescentar transição entre níveis caso existam; pontuação educativa simples é opcional, moedas não são necessárias | Parte opcional |
| Codominância ou herança ligada ao sexo | Ausentes; descritas como bônus | Manter fora da entrega próxima, a menos que todas as prioridades já estejam testadas | Adiar |
| Carros decorativos | Cenário já tem decoração; folha de carros não é carregada | Usar somente se melhorar a composição; não criar trânsito ou vincular spawn a carros | Adiar |
| Tema obrigatório definido pelo professor | Não há confirmação nos arquivos | Conferir enunciado/rubrica e eventual exigência de genética humana/doenças antes de ampliar o conteúdo | Dependência externa |

### Ajustes técnicos para não descobrir problemas no último dia

1. **Acesso externo ao mapa:** `WORLD.blocks` inclui `{ x: 0, y: 760, w: 1536, h: 264 }`, além dos limites laterais. Um cliente não consegue usar a área inferior externa com essas colisões. Medir uma passagem específica, preservar paredes/móveis e testar a rota inteira. Não liberar o exterior inteiro removendo obstáculos indiscriminadamente.
2. **Direção dos NPCs:** `frames.clients[clientId]` contém um único retângulo, não quatro direções. A movimentação precisa de direção e recortes próprios por NPC, com apoio dos pés consistente. Sua área interativa deve acompanhar o estado do atendimento.
3. **Etapas e aprendizado:** explicitar na bancada as ações de escolher pais e interpretar o resultado, preservando o Punnett visível. O solo executa ambos os papéis independentemente da aparência escolhida; não exigir um segundo personagem presente no mapa.
4. **Uma conta para todas as telas:** quadro, resumo, aprovação, exemplo visual e eventual pontuação devem consumir o mesmo resultado calculado. Não criar uma segunda implementação das probabilidades na interface ou nos pedidos.
5. **Probabilidade não é promessa de filhote:** manter o texto de descendente possível e explicar na entrega que foi aprovado um cruzamento com aquela chance. Não transformar 25% de chance em garantia de nascimento nem em sorteio que impeça o aluno de avançar.
6. **Variantes de cor:** a fonte permite adaptação de paleta por código, sem novos arquivos de imagem. Só usar transformação seletiva que preserve olhos, áreas brancas e contornos; filtro global não comprova uma variante correta. Pedidos devem usar apenas fenótipos representáveis com clareza.
7. **Referências e estado do projeto:** o Notion cita `ESBOCO.md`, ausente na raiz atual, e declara coop/seleção como implementados. Atualizar a documentação para o estado real quando essa manutenção for solicitada. Este complemento foi salvo localmente; não altera checkboxes nem páginas remotas.

### Roteiro rápido para amanhã, com entregas verificáveis

**Pacote 1 — fechar pendências do MVP:** corrigir texto dos gametas; escolha básica Geneticista/Laboratorista; conferir formato exigido, rubrica e destino do link. Separar a decisão sobre hospedagem da implementação, sem fazer publicação externa apenas porque ela consta deste plano. A escolha básica não precisa esperar vídeo ou animações.

**Pacote 2 — próxima fase pedida pelo usuário:** catálogo das três espécies e variantes; depois dois genes e pedidos mais complexos. Separar essas mudanças em entregas jogáveis. Manter os três primeiros pedidos como introdução; distribuir desafios adicionais em níveis de três a cinco pedidos, com transição e conclusão corretas.

**Pacote 3 — clientes e conversa:** abrir e validar a rota externa; cadastrar seis clientes com direções; entrada, espera, diálogo, entrega e saída. Finalizar um cliente completo antes de aplicar o sistema aos seis.

**Pacote 4 — acabamento condicionado ao tempo:** melhorar menu, opções visuais e caminhada. Vídeo só com arquivo local disponível. Coop, economia e heranças bônus não entram como pré-requisitos desta rodada.

**Pacote 5 — entrega:** congelar versão, jogar todos os níveis, inserir prints e identificação no relatório, verificar abertura do pacote e do link público quando publicado. Fazer um ensaio usando o mesmo computador/navegador da apresentação, quando possível, e conservar uma versão local para apresentação sem rede.

### Como passar o trabalho para outra ferramenta sem gastar contexto à toa

Usar este arquivo como plano mestre e solicitar **um pacote por vez**. O agente deve ler os arquivos reais antes de editar, listar as dependências da etapa, implementar e validar. Não solicitar as cinco entregas em um único prompt nem repetir auditorias completas a cada pequena alteração.

Ao concluir cada pacote, exigir: arquivos alterados, funcionalidades entregues, verificação executada, limitações e próximo pacote. Não aceitar “testado no navegador” quando houve apenas testes de funções. Se não houver teste visual disponível, declarar isso e fornecer um roteiro curto para teste manual.

Regras persistentes: sem downloads/instalações, sem substituição ou geração de assets nesta rodada de código, sem migrar de stack, sem reescrever o mapa, sem alterar a genética para forçar uma resposta esperada. Reutilizar o que existe e manter a versão anterior jogável. A troca de ferramenta não muda o escopo nem elimina a necessidade de testar.
