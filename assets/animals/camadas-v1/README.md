# Camadas derivadas da arte v1

Cada JSON contém seis camadas de 64 linhas com 64 caracteres. Os PNGs correspondentes são visualizações transparentes dessas mesmas camadas. `*-reduzido.png` é uma prévia 4× da redução antes da separação das camadas.

| Símbolo | Papel |
|---|---|
| `.` | Transparente |
| `o`, `s`, `b`, `l` | Contorno, sombra, base, luz do pelo |
| `e` | Íris recolorível |
| `p`, `w` | Pupila, brilho branco |
| `i`, `n`, `m` | Interior rosa, nariz, focinho creme |
| `t` | Pigmentação opcional de manchas |

`body` mantém a arte de corpo e rosto da v1, com peito/patas recoloridos para o pelo. `eyes` preserva o desenho das íris/pupilas/brilhos; no coelho o recorte dos olhos é ampliado e o brilho perdido na redução é restaurado. `earsErect`/`earsFallen` e `tailLong`/`tailShort` são recortes independentes. Pequenas áreas da testa antes ocultas pelas orelhas são completadas durante a preparação.

Fontes em `../referencias-padrao-visual/`: os três PNGs `*-marrom-azul-v1.png` e as duas edições `cachorro-orelhas-caidas-v1-edit.png` e `coelho-orelhas-caidas-v1-edit.png`. Os prompts das edições estão em `PROMPTS-ORELHAS.md` nessa pasta.

Edite os caracteres nos JSONs para retocar pixels sem redesenhar o animal por código. Depois rode `node tools/build-pet-sprites.js`. Use `node tools/extract-pet-layers.js` somente quando quiser refazer a extração das fontes, pois ele substitui os JSONs preparados.

## Retoques manuais

Os JSONs foram retocados depois da extração: pixels soltos removidos do corpo, topo da cabeça do gato redesenhado, orelhas eretas do cachorro arredondadas e olhos do coelho redesenhados. Refazer a extração apaga esses retoques.
