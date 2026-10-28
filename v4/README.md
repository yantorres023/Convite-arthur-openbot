# Convite do Arthur — v4 (12 versões por nível de esforço)

Doze convites-brinquedo country/fazendinha, cada um feito de ponta a ponta por uma execução separada do **Claude Opus 5.5** (`claude-opus-5-5`), três por nível de esforço. A página de comparação fica em [`index.html`](index.html), publicada em <https://yantorres023.github.io/Convite-arthur-openbot/v4/>.

## Matriz de modelo e esforço

| Versão | Conceito | Modelo declarado | Esforço pedido | Esforço declarado no RUN.json | Fonte declarada | Retomada |
|---|---|---|---|---|---|---|
| 01 | Carrossel country da fazendinha | claude-opus-5-5 | medium | `10` | não registrada | não |
| 02 | Varal de bandeirinhas | claude-opus-5-5 | medium | `10` | não registrada | não |
| 03 | Noite de vaga-lumes | claude-opus-5-5 | medium | `10` | não registrada | não |
| 04 | Quebra-cabeça de bichinhos | claude-opus-5-5 | high | `15` | não registrada | não |
| 05 | Hortinha mágica | claude-opus-5-5 | high | `15` | não registrada | não |
| 06 | Siga as patinhas | claude-opus-5-5 | high | `high` | não registrada | não |
| 07 | Pop-up de cartolina | claude-opus-5-5 | xhigh | `xhigh` | não registrada | não |
| 08 | Bandinha do Arthur | claude-opus-5-5 | xhigh | `xhigh` | não registrada | não |
| 09 | Balões da festa | claude-opus-5-5 | xhigh | `xhigh` | `CLAUDE_EFFORT=xhigh`; o contexto também trazia `reasoning_effort=40` | não |
| 10 | Bloquinhos de madeira | claude-opus-5-5 | max | `max` | `CLAUDE_EFFORT=max` (printenv) | sim |
| 11 | Teatrinho de fantoches country | claude-opus-5-5 | max | `max` | `CLAUDE_EFFORT=max` (printenv); contexto com `reasoning_effort=max` | sim |
| 12 | Pescaria de patinhos | claude-opus-5-5 | max | `max` | `CLAUDE_EFFORT=max` (printenv) | sim |

"Esforço pedido" é o nível com que cada execução foi lançada. "Declarado" é o que a própria execução gravou em `versao-NN/RUN.json`, sem alteração. A mecânica de cada versão e a verificação que ela declarou estão no mesmo arquivo.

## O que cada execução declarou

Todas as 12 declararam no `RUN.json`: 0 erro de console, interação principal "ok", RSVP inativo e os 3 links de mapa. As versões 05 e 09 a 12 detalham mais a verificação (teclado, movimento reduzido, contraste, outros tamanhos de tela). Esses resultados são autodeclarados por cada execução; a publicação conferiu de novo só o carregamento (HTTP 200, sem erro de console e sem recurso 4xx).

## Ajuste de rótulo nas versões 01 a 05

Nas versões 01 a 05 o runtime informou o esforço como número (`10` ou `15`), e o rótulo da página saiu como "esforço 10" / "esforço 15". O valor gravado no `RUN.json` **não foi trocado**. Só o texto do rótulo (rodapé e `<title>`) mudou, para mostrar o nível pedido e o valor informado:

- 01, 02, 03: "Versão NN · Claude Opus 5.5 · esforço pedido medium (runtime informou 10)"
- 04, 05: "Versão NN · Claude Opus 5.5 · esforço pedido high (runtime informou 15)"

As versões 06 a 12 já usavam o nome do nível e não foram mexidas.

## Retomada das versões 10, 11 e 12

As execuções de 10, 11 e 12 foram interrompidas pelo limite de uso. Cada uma foi terminada numa retomada que partiu dos arquivos parciais; o `RUN.json` delas registra `"retomada": true` e o que mudou.

## RSVP inativo

Todas as versões usam `comum/rsvp.js` com `comum/rsvp-config.js`, onde `RSVP_ENDPOINT = null`. Por isso o formulário aparece desativado com "Confirmação ainda não ativada" e nada é enviado.

## Arquivos

- `versao-NN/`: a página da versão, os arquivos dela, o `RUN.json` e `print-390.png` (usado como miniatura). Ficaram de fora os prints extras e os scripts de verificação (`verificar.cjs`); a lista `arquivos` do `RUN.json` ainda os cita porque o registro original foi mantido. A versão 05 mantém `print-390-interacao.png` (é o `og:image` dela) e a 10 mantém `og.png`.
- `comum/`: cópia do `comum/` usado na geração da v4 (igual ao `comum/` da raiz neste commit), para que `../comum/` resolva dentro de `v4/`.
