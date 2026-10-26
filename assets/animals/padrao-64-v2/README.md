# Proposta de sprites — grade fixa 64×64

Composição de recortes das referências v1 do GPT, reduzidos para uma grade de 64×64 e quantizados para a paleta do documento. Substitui a proposta anterior de corpos e cabeças geométricos, mantendo os mesmos nomes, diretório, manifest e comando de geração.

- 192 PNGs: 3 espécies × 4 cores × 2 olhos × 2 orelhas × 2 manchas × 2 rabos.
- Cada arquivo tem 64×64 pixels RGBA, transparência binária (0 ou 255), sem suavização e apenas as cores exatas do documento.
- Corpo, focinho, bigodes, dedos, sombras e desenho dos olhos vêm da arte v1. Orelhas caídas do cachorro e do coelho vêm de edições dessas referências pela ferramenta integrada `image_gen`; apenas os recortes das orelhas são usados. Orelhas do gato são recortes transformados da v1.
- Creme permanente apenas no focinho. Peito e patas acompanham o pelo; a variante manchada acrescenta uma mancha no olho à esquerda da imagem e outra no peito.
- Rabo longo é extraído da referência. O curto é o mesmo recorte reduzido em torno da raiz: gato (44,55), cachorro (46,52), coelho (43,54). Coordenadas a partir do canto superior esquerdo, constantes entre as variantes.
- Camadas indexadas editáveis em `../camadas-v1/`: corpo/rosto, olhos, orelhas eretas/caídas, rabo longo/curto. Manchas são máscaras de pigmentação sobre a arte. Alterar olhos recolore apenas a íris; pupilas e brilhos são preservados.

## Revisão visual

`comparacao-4x.png` mostra as linhas gato, cachorro e coelho. As seis colunas são: marrom eretas sem manchas; marrom caídas sem manchas; marrom caídas manchado; preto eretas sem manchas; preto caídas sem manchas; preto caídas manchado. Olhos azuis e rabo longo em toda a prancha. Ampliação 4× por repetição exata de pixels.

Os nomes individuais seguem `especie-cor-olhos-orelhas-manchas-rabo.png`. `manifest.json` lista as combinações e paletas. Também existem olhos verdes, pelo claro/cinza e rabo curto nos arquivos individuais.

`cores-rabos-4x.png` compara, em cada linha, marrom, preto, cinza e claro, cada um com rabo longo e curto. Usa olhos verdes e orelhas caídas.

As pranchas usam fundo neutro para facilitar a revisão; os 192 sprites individuais mantêm fundo transparente. `comparacao-fonte-v1-4x.png` é uma cópia da prancha principal para identificar esta revisão.

## Reprodução e verificações

Execute `node tools/build-pet-sprites.js` na raiz do projeto para gerar os 192 arquivos a partir das camadas salvas. Usa apenas módulos nativos do Node. Verifica dimensões e alpha do PNG decodificado, cores permitidas, margens transparentes, pupilas/brilhos, independência de máscaras e conectividade em oito direções (sem partes soltas, inclusive rabos).

Para refazer a preparação das camadas a partir dos PNGs originais, execute antes `node tools/extract-pet-layers.js`. Esse comando substitui os JSONs; guarde edições manuais antes de executá-lo. O extrator usa voto de área por célula, classificação de cores, recortes e ajustes de pixels nas regiões antes ocultas pelas orelhas. Não cria corpos ou cabeças por elipses/polígonos.

Os arquivos continuam como proposta para revisão visual, sem integração no renderizador do jogo. A v1 continua determinando proporções e detalhes da anatomia; por exemplo, o cachorro conserva as quatro patas visíveis da referência. Os testes técnicos não equivalem à aprovação de todos os itens do documento visual.
