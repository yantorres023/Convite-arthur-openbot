# Convite do Arthur — 1 ano (3 conceitos v2 para escolha)

Páginas estáticas (HTML, CSS e JS, sem dependências externas) com os 3 conceitos **v2** da Deidara, tema **country/fazendinha, bem infantil** (pedido do Yan). O Yan escolhe uma direção; só a escolhida segue.

- `index.html`: comparativo com links para os 3 conceitos e os mockups.
- `conceito-1/`: **Um dia na fazendinha** (livro ilustrado, céu azul e bichinhos).
- `conceito-2/`: **Retalhos de carinho** (colcha pastel, janelinhas e costuras).
- `conceito-3/`: **Piquenique dos bichinhos** (xadrez de morango, flores e cercadinho).
- `design/v2/`: entrega da Deidara (mockups 390/1440, 5 estados do RSVP, SVGs originais, fontes, `contraste.json`, `motion.json`).

## Status real
- **Integração preparada; o Web App não está publicado.** A publicação depende de aprovação do Yan; veja `INTEGRACAO-PLANILHA.md`.
- **Sem endpoint configurado,** a página mostra "Confirmação ainda não ativada" e não envia nada. Ela nunca simula sucesso.
- **Repositório público:** não contém ID de planilha, URL do Web App, credencial nem dado de convidado. O endpoint fica em `comum/rsvp-config.local.js`, que está no `.gitignore`.
- **GitHub Pages:** não está ativo. A prévia é local.

## Dados do convite

Arthur, 1 ano ("1 aninho" na capa) · **domingo, 29/11/2026, 15h** · venha caracterizado: **country/fazendinha** · **Casa da Árvore — Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso** · sem foto.

**Como chegar:** junto ao endereço há 3 botões, "Abrir no Google Maps", "Abrir no Apple Maps" e "Abrir no Waze". São links oficiais de **busca** pelo endereço "Casa da Árvore, Rua Castelo Branco, 31, Cidade Nova, Santana do Paraíso - MG", sem coordenadas, e abrem numa nova aba (`noopener noreferrer`).

## Prévia local

```
python3 -m http.server 4300 --bind 127.0.0.1     # ou: npm run previa
```

Na pasta do projeto, abra http://127.0.0.1:4300/. O GitHub Pages não está ativo.

## RSVP → planilha privada

O destino é uma planilha privada do Yan, autorizado por ele. A integração e o contrato são do Rocky: `INTEGRACAO-PLANILHA.md`.

- **Endpoint:** fica fora do repositório. O arquivo `comum/rsvp-config.local.js` está no `.gitignore` e segue o modelo `comum/rsvp-config.exemplo.js`. Nenhum ID de planilha, URL do Apps Script ou credencial entra no git.
- **Sem endpoint configurado:** a página mostra "Confirmação ainda não ativada" com o botão desabilitado, e **nunca simula sucesso**.
- **Campos:**
  - **Nome:** 2 a 80 caracteres.
  - **Nº de adultos** e **Nº de crianças:** inteiros de 0 a 20; vazio conta como 0.
  - É preciso pelo menos 1 pessoa.
  - Entrada que o navegador não entende num número (ex.: "e") é erro, nunca 0.
  - Os erros aparecem em texto junto ao campo (com ⚠, não só pela cor), e o foco vai para o primeiro campo inválido.
- **Honeypot:** campo `website` fora da tela e do teclado, enviado no corpo; quando vem preenchido, o servidor responde `{ok:false, erro:"rejeitado"}` sem gravar, e a tela mostra o erro genérico (nunca "Presença registrada!").
- **Envio:** `POST` `text/plain` com o JSON `{nome, adultos, criancas, website}` e prazo de 15 s. Enquanto envia, o botão fica desabilitado, então um clique duplo gera 1 envio só.
- **Respostas:**
  - **"Presença registrada! Obrigado."** só com HTTP 200 + `{"ok":true}`. Depois disso, o formulário trava.
  - **Validação recusada pelo servidor:** os erros aparecem nos campos.
  - **Limite ou 429:** "Muitas confirmações agora; tente de novo em alguns minutos."
  - **Outros erros ou HTML:** "Não foi possível confirmar agora. Tente de novo."
  - **Rede fora ou prazo esgotado:** "Não conseguimos confirmar se sua presença foi registrada. Tente de novo." Como o contrato não tem chave idempotente, reenviar pode duplicar uma linha; o Yan resolve na planilha.
- **Sem JavaScript:** campos desabilitados e nenhum botão de envio nativo, então nada é enviado nem vai para a URL. Um aviso explica isso.
- **Navegador:** nada é gravado (sem localStorage nem sessionStorage); sem analytics.

## Estados do RSVP (design v2)

| Estado | O que a tela faz |
|---|---|
| Inicial | Formulário ativo e a nota "Sua confirmação vai para uma planilha privada." |
| Enviando | O botão vira "Enviando…" e fica desabilitado; os campos ficam só leitura e mantêm os valores; `aria-busy`; nota "Registrando sua presença… Aguarde a confirmação." |
| Sucesso | **"Presença registrada!"** + "Confirmação recebida." (`role=status`), só com `{ok:true}` do servidor. O botão vira "Confirmado", os campos ficam só leitura e não há novo envio. |
| Erro | "Não conseguimos registrar agora; tente de novo" (`role=alert`). Os dados ficam e o botão volta. Limite e resultado desconhecido usam os textos do contrato do Rocky. |
| Inválido | Erro junto ao campo, `aria-invalid` e `aria-describedby`; foco no primeiro campo inválido; abaixo do botão, "Revise os campos indicados." e "Informe pelo menos 1 convidado." |
| Sem endpoint | "Confirmação ainda não ativada.", com tudo desabilitado. |

## Acessibilidade e movimento

- **Layout:** base mobile first, com margem de 24 px; troca para o desktop a partir de 900 px.
- **Teclado:** link "Pular para a confirmação"; foco visível de 2 px com afastamento de 3 px.
- **Medidas do RSVP:** campos de 54 px e botão de 56 px.
- **Contraste AA:** pares documentados em `design/v2/conceito-N/contraste.json` e medidos no e2e (textos, campos, placeholders, erros e estados).
- **SVGs:** são os originais da Deidara, embutidos como decorativos (`aria-hidden`). Os ids recebem prefixo e são deduplicados pelo `scripts/montar.py`.
- **Movimento:** cada conceito segue o seu `motion.json`.
  - Capa: entrada única.
  - Conceito 1: nuvens.
  - Conceito 2: janelinhas.
  - Conceito 3: flores.
  - Com `prefers-reduced-motion: reduce`, tudo fica no estado final desde o início.
  - Sem JavaScript ou na impressão, todo o conteúdo fica visível.

## Fontes

Noto Sans, Noto Sans Display (conceito 1) e Noto Serif (conceito 3), sob **SIL Open Font License 1.1**. Os arquivos estão em `conceito-N/fontes/`, junto com a licença, e são servidos localmente, sem CDN.

## Montagem

`conceito-N/index.html` é gerado a partir de `modelos/conceito-N.html`, com os SVGs da Deidara e o bloco comum do RSVP (`comum/rsvp.html`): `python3 scripts/montar.py`. O CSS comum fica em `comum/v2.css`, e o de cada conceito, em `conceito-N/estilo.css`.

## Testes

```
npm install                 # só o Playwright (devDependency)
npm test                    # regras do RSVP (node --test)
npm run test:e2e            # Playwright em 390 e 1440: dados, rede, RSVP (servidor simulado), teclado, reduced-motion, contraste; prints em prints/
```

O e2e (54 testes) falha se a página fizer requisição para outra origem que não o endpoint **falso** configurado no teste. Esse endpoint é atendido por um servidor simulado. Em todos os cenários exige nenhum erro de console.

Cobre:
- **Dados e páginas:** dados exatos, sem foto, sem rolagem horizontal.
- **Validação:** inclusive "e" digitado num número.
- **Envio:** sucesso só com `{ok:true}`; um clique duplo gera 1 envio; o botão fica desabilitado e com `aria-busy` enquanto envia.
- **Respostas de erro:** erro interno, HTML, 429, validação recusada pelo servidor e servidor mudo (prazo de 15 s).
- **Sem endpoint:** "Confirmação ainda não ativada".
- **Honeypot:** fora da tela e fora do teclado.
- **Sem JavaScript e com o módulo fora do ar:** nada é enviado.
- **Teclado:** percurso completo com foco visível.
- **Movimento reduzido.**
- **Contraste AA:** textos, campos, placeholders, erros e estados do envio, em 390 e 1440.

## Pendências

- Conceitos v2 (fazendinha) da Deidara: implementar quando o Woody avisar.
- Ativar o endpoint (Web App do Apps Script): só com aprovação do Yan (`INTEGRACAO-PLANILHA.md`).
- Escolha do conceito (Yan).
