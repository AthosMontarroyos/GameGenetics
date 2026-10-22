# Viabilidade dos assets — Pet Shop Mendel

Análise visual das 15 imagens e leitura de `index.html`, `css/style.css` e `js/main.js`, em 21/10/2026.

## Conclusão

Todos os arquivos têm uso possível no MVP. As folhas são ilustrações com múltiplas poses e variantes, mas não atlas regulares prontos para animação. O trabalho principal é preparar recortes com transparência e metadados; não é necessário redesenhar os personagens para ter um jogo funcional.

O código atual é apenas a estrutura inicial: HTML sem conteúdo no body e CSS/JS com comentários. Portanto, ainda será necessário implementar o carregamento, renderização e as mecânicas; não existe um motor de sprites ao qual apenas conectar as imagens.

## Inspeção de cada arquivo

| Arquivo em assets/ | Dimensões | Observação e adaptação proposta |
| --- | --- | --- |
| players/geneticista-01.jpg | 850 × 600 | Personagem com rabo de cavalo, detalhes roxos, poses frontais, laterais e de costas. Há cerca de sete posições nas primeiras faixas e mais poses na última. Usar recortes individuais; não dividir toda a imagem em uma grade única. |
| players/geneticista-02.jpg | 832 × 575 | Variante de cabelo curto e detalhes roxos. Cerca de oito posições por faixa superior, com outra distribuição na última. Pode ser uma opção visual do Geneticista; não é continuação da animação do arquivo 01. |
| players/laboratorista-01.jpg | 1024 × 1367 | Variante com rabo de cavalo e óculos. Seis posições por faixa aparente e poses extras. Selecionar frente, costas e lateral; conferir a lateral oposta e usar espelhamento quando necessário. Fundo quadriculado incorporado ao JPG. |
| players/laboratorista-02.jpg | 1024 × 1372 | Variante de cabelo curto e óculos. Sete posições por faixa aparente, incluindo perfis, costas, três quartos e ações. Organizar por direção e estado, sem animar cada faixa indiscriminadamente. Fundo quadriculado incorporado. |
| animals/mendelino.jpg | 1024 × 2021 | Folha com variantes roxas/marrons, manchas e diferenças nos olhos. Selecionar exemplares consistentes para representar os fenótipos. As colunas misturam vistas e variantes, não uma sequência uniforme de caminhada. Fundo claro e linhas de grade. |
| animals/gencko.jpg | 1024 × 1833 | Variantes azul, verde, laranja e amarela, além de diferenças de textura/olhos. As cores existentes permitem representar um gene de cor escolhendo dois fenótipos. Perfil pode ser espelhado para a direção oposta. Fundo claro e grade. |
| animals/nibbli.jpg | 1012 × 2026 | Variantes claras, cinza e marrons, com padrões nas orelhas e no corpo. Vistas frontais, traseiras e laterais estão em posições diferentes conforme a faixa. Exige seleção manual de recortes; evitar recorte automático por índice de coluna. |
| scenery/pet-shop.png | 1024 × 683 | Melhor candidato a fundo fixo. Já contém mobiliário, animais nas vitrines/gaiolas e um carro estacionado. Colisões, zonas interativas e trajetos devem ser definidos separadamente. Portas desenhadas exigem uma decisão de passagem/abertura no jogo. |
| npcs/cliente-12682.jpg | 654 × 674 | Homem adulto com casaco. Layout aparente de cinco poses por quatro faixas: frente, esquerda, direita, costas. Padronizar recortes e ponto dos pés. |
| npcs/cliente-12683.jpg | 643 × 670 | Estudante feminina com mochila rosa. Mesmo padrão geral de cinco poses e quatro direções; fundo quadriculado incorporado. |
| npcs/cliente-12684.jpg | 643 × 656 | Estudante masculino com mochila azul. Mesmo padrão geral; conferir margens e pés por recorte, sem presumir células iguais às dos outros clientes. |
| npcs/cliente-12685.jpg | 672 × 743 | Garota alternativa com cabelo roxo. Mesmo padrão geral. Símbolos da roupa e detalhes variam entre poses; usar uma seleção pequena e consistente para reduzir cintilação. |
| npcs/cliente-12686.jpg | 663 × 695 | Criança de boné e mochila. Mesmo padrão geral; manter altura menor no mundo para preservar a identidade infantil. |
| npcs/cliente-12687.jpg | 628 × 616 | Senhora idosa. Mesmo padrão geral de quatro direções; pequenas diferenças de desenho entre poses pedem seleção cuidadosa antes de animar. |
| cars/carros.png | 1024 × 683 | Três modelos, com vistas laterais, superiores e frontais/traseiras. Recortar apenas as vistas de cima para combinar melhor com o estacionamento do mapa. O quadriculado é parte da imagem, apesar da extensão PNG. |

As quantidades e distribuições acima são observações visuais, não coordenadas finais de um atlas validado.

## Fundos e transparência

- Os 13 JPGs não têm canal alfa. Quadriculado, branco, sombras e grade fazem parte dos pixels.
- Os dois PNGs foram verificados pixel a pixel: ambos são RGB de 24 bits, com zero pixels transparentes ou semitransparentes.
- O cenário pode permanecer opaco. Os carros e as entidades móveis precisam de versões recortadas com alfa para sobrepor ao mapa.
- Remover todos os pixels brancos globalmente apagaria partes dos jalecos e dos pets. O fundo quadriculado também não sai com uma única cor de chroma key.
- Preparação recomendada: recorte por pose, máscara de fundo com revisão de contorno e exportação em PNG transparente. Manter os arquivos originais.
- Converter JPG para PNG sem criar uma máscara não remove o fundo nem recupera detalhes perdidos pela compressão.

## Adaptação no JavaScript

1. Carregar o cenário como fundo de um Canvas 2D, mantendo as coordenadas lógicas de 1024 × 683 e a proporção ao redimensionar.
2. Usar um catálogo de recortes explícitos por asset, com `x`, `y`, `width`, `height`, direção, estado e ponto de apoio nos pés. Não usar largura da folha dividida pelo número de colunas como regra global.
3. Normalizar a altura de jogadores e clientes no mundo, preservando a proporção de cada recorte. Avaliar inicialmente adultos com aproximadamente 44–52 pixels de altura no mapa; ajustar visualmente em uma composição real.
4. Começar com um sprite parado por direção. Ativar caminhada somente com poses que mantenham roupa, tamanho, desenho e apoio consistentes. As folhas não garantem ciclos completos e suaves.
5. Renderizar entidades por posição dos pés no eixo Y. Para passar atrás de balcões ou outros móveis, criar uma camada de primeiro plano/máscara; ordenar apenas os personagens não resolve a oclusão por mobiliário já pintado no fundo.
6. Definir obstáculos e áreas caminháveis em dados separados. Usar uma pequena caixa de colisão nos pés, não o retângulo inteiro do desenho.
7. Marcar atendimento, cruzamento, saída e spawn com coordenadas. Validar um percurso contínuo do exterior ao balcão e ao laboratório; tratar as portas fechadas desenhadas com sobreposição de abertura ou transição de área.
8. Relacionar o fenótipo calculado a um sprite disponível, independentemente da animação. Em dominância completa, AA e Aa devem compartilhar o mesmo fenótipo visual para o gene modelado.
9. Preferir variantes de cor já existentes nos pets. Filtros globais também alteram olhos, partes brancas e contornos; mudanças seletivas exigem máscaras de região ou paleta preparada.

## Limitações visuais e escopo recomendado

O cenário tem uma aparência pixelada mais definida que os personagens, que usam desenho chibi com bordas suavizadas e compressão JPEG. A combinação é viável em escala pequena, mas não constitui um conjunto uniforme de pixel art. Desligar suavização ao desenhar pode ser avaliado na integração; isso não transforma a arte original em pixel art nativa.

Para o MVP: um Geneticista, um Laboratorista, seis clientes, um sprite por direção e variantes de pets suficientes para os genes de cada fase. As demais versões dos jogadores podem ficar como opções visuais. Carros extras são opcionais, pois o mapa já inclui um.

Não há evidência de que as linhas das folhas dos pets representem genótipos específicos. Cor, manchas e olhos precisam receber uma regra explícita do jogo; não inferir relações genéticas a partir da posição da imagem na folha.

## Próximo passo técnico

Preparar um conjunto mínimo transparente e montar uma composição sobre o cenário para validar escala, contornos e circulação. Só então consolidar o atlas e os ciclos de animação. Esta análise não altera os assets nem implementa o jogo.
