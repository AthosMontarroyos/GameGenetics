---
paths:
  - "js/**/*.js"
  - "css/**/*.css"
  - "index.html"
  - "tools/**/*.js"
  - "tests/**/*.js"
---

# Código

- JavaScript puro (ES5/ES2015 sem módulos). Cada arquivo de `js/` é uma IIFE `(function (root) { 'use strict'; ... })(typeof globalThis !== 'undefined' ? globalThis : this)` que publica um objeto global `Pet*` (`PetCatalog`, `PetBreeding`, `PetGenetics`, `PetCustomers`...). Isso permite o mesmo arquivo rodar no navegador e em `node`.
- Sem `import`/`export`. A ordem dos `<script defer>` em `index.html` é a ordem de dependência.
- Ao editar um arquivo de `js/` ou `css/`, incremente o `?v=` correspondente em `index.html` (cache do navegador).
- Lógica de jogo (genética, cruzamento, pedidos, clientes) fica fora de `main.js` e sem acesso a DOM, para ser testável em `node`. `main.js` só cuida de mundo, teclado, canvas e interface.
- Arquivos gerados NÃO se editam à mão: `js/client-frames.js` (`node tools/build-client-frames.js`) e `js/occluders.js` (`node tools/build-occluders.js`). `js/pet-art-data.js` é a arte embutida para uso sem servidor.
- Acessibilidade importa: foco gerenciado nos painéis (`trapTab`, `syncInert`), controles por teclado, textos legíveis. Não quebre isso ao mexer na interface.
- Siga o estilo do arquivo que está editando (aspas simples, indentação, densidade de comentário). Comentários explicam o porquê, não o quê.

## Verificação

```
node tests/phase05.test.js
```

Deve imprimir `OK: ...`. Rode antes de commitar mudanças em `js/`. Mudanças visuais: abra `index.html` no navegador e jogue o fluxo afetado.
