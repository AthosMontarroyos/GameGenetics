# Pet Shop Mendel

Projeto escolar de um jogo educacional de genética mendeliana em pixel art.
Base em HTML, CSS e JavaScript puro, sem dependências, frameworks ou backend.

## Como abrir

Abra `index.html` diretamente no navegador. Nesta etapa, a página fica em branco:
ela apenas referencia o CSS e o JavaScript locais. Não é necessário instalar nada.

## Estrutura

- `index.html`: documento inicial com os links para CSS e JavaScript.
- `css/style.css`: arquivo reservado para os estilos.
- `js/main.js`: ponto de entrada reservado para a implementação futura.
- `assets/scenery/`: cenário fixo.
- `assets/players/`: sprite sheets do Geneticista e do Laboratorista.
- `assets/npcs/`: sprite sheets dos clientes e demais NPCs.
- `assets/animals/`: sprites e sheets de Mendelino, Gencko e Nibbli.
- `assets/cars/`: carros decorativos do exterior.
- `.gitkeep`: arquivos vazios que mantêm as pastas de assets no Git.

Os assets serão fornecidos separadamente. Dimensões, frames e layouts das sheets
serão definidos somente após receber os arquivos reais.

## Próxima etapa

Receber e conferir os assets antes de iniciar a implementação. O planejamento
prevê modo solo completo e coop local opcional, com o fluxo:
cliente → pedido → escolha dos pais → genética/Punnett → cruzamento → resultado → entrega.

Esta base ainda não contém interface de jogo, mecânicas, movimentação, sistema
genético ou assets.
