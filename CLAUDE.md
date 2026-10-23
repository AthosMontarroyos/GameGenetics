# Pet Shop (GameGenetics)

Jogo educacional no navegador sobre genética mendeliana fictícia. HTML + CSS + JavaScript puro, sem build nem dependências: abra `index.html`.

## Comandos

- Testes: `node tests/phase05.test.js` (deve imprimir `OK: ...`).
- Regenerar sprites de clientes: `node tools/build-client-frames.js`.
- Regenerar máscaras do cenário: `node tools/build-occluders.js`.

## Onde está cada coisa

- `docs/arquitetura.md`: módulos, fluxo de partida, ferramentas.
- `docs/genetica.md`: genes, regras de aparência, pedidos, estrelas.
- `README.md`: como abrir e jogar (para jogadores).

## Regras

Ficam em `.claude/rules/` (espelhadas em `.cursor/rules/*.mdc` para o Cursor; ao editar uma, atualize a outra):

- `projeto.md`: escopo e idioma (português do Brasil).
- `codigo.md`: padrão IIFE + globais `Pet*`, cache-bust `?v=` em `index.html`, arquivos gerados, acessibilidade.
- `genetica-e-conteudo.md`: jogador vê só aparência, pedidos sem porcentagem, todo pedido tem solução.

Regras que valem sempre: não adicionar build/framework; não editar arquivos gerados à mão; rodar o teste antes de commitar mudanças em `js/`; manter a documentação em sincronia com o código.
