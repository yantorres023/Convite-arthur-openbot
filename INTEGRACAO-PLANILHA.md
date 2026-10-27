# RSVP → planilha privada do Google — integração

Data: 2026-10-27 · Autor: Rocky (integrações) · Pedido: Woody · Destino autorizado pelo Yan: "planilha no Google Sheets ou algo do tipo".

## Status real
| Item | Estado |
|---|---|
| Planilha "Convite Arthur 1 ano — confirmações" | **CRIADA**, **particular** e sem compartilhamento. O ID e a URL NÃO estão neste repositório. |
| Script de gravação (`integracao/planilha-rsvp.gs`) | **PREPARADO** e testado localmente com simuladores no contexto de Web App (19/19, sai ≠0 se falhar). **Não colado** na planilha e **não publicado**. Revisão Winry: P1 corrigidos (planilha aberta por ID salvo em Propriedades; honeypot sem sucesso falso). |
| Endpoint público (Web App) | **NÃO publicado.** Exige aprovação específica do Yan. |
| Cabeçalho e ID | `prepararPlanilha`, executada uma vez no editor, cria o cabeçalho e salva o ID da planilha nas Propriedades do script (fora do repositório). A planilha está vazia hoje. |

## Opções comparadas
| | (a) Apps Script vinculado → Web App | (b) Servidor local + Sheets API | (c) Google Forms ligado à planilha |
|---|---|---|---|
| Custo | 0 | 0 de API, mas exige servidor no ar | 0 |
| Validação no servidor (tipos, 2–80, 0–20, ≥1 pessoa) | ✓ | ✓ | — (o Forms valida campo a campo, mas não "≥1 pessoa" entre campos) |
| "Sucesso" só após gravar | ✓ (flush + releitura da linha) | ✓ | — (envio do site é opaco; só funciona embutindo o Forms) |
| Honeypot + limite + tamanho | ✓ (limite global, porque o Apps Script não expõe IP) | ✓ (limite por IP) | — (sem controle) |
| Credencial fora do front e do repo | ✓ (roda como o Yan, dentro do Google) | ✓ (chave só no servidor) | ✓ |
| Visual do convite preservado | ✓ | ✓ | — (formulário do Google) |
| **Único requisito que falta** | **Aprovação do Yan para publicar o Web App** (endpoint público de escrita) | **Projeto no Google Cloud + service account**, fora do setup, e um servidor publicado | Aceitar perder a validação "≥1 pessoa" e o visual próprio |

**Recomendação: (a).** É a mais simples, sem custo, sem credencial em lugar nenhum e dentro do que o Yan já usa. O risco é o endpoint público: "Qualquer pessoa" permite **escrita anônima**, e a URL do Web App fica **visível no navegador** de quem abre o convite, então qualquer um pode mandar confirmações falsas. Isso é mitigado com honeypot, limite global de 30 por 10 min (contador em PropertiesService sob LockService, persistente), corpo ≤ 2 KB, validação e proteção contra fórmula. A planilha nunca fica legível pelo endpoint.

## Contrato com o frontend (para o Edward)
- **Requisição:** `POST <URL do Web App>`, header `Content-Type: text/plain;charset=utf-8` (evita preflight CORS; o corpo é JSON), corpo:
  `{"nome":"Ana Souza","adultos":2,"criancas":1,"website":""}`
  - `website` é o honeypot: um campo escondido do usuário (fora da tela, `tabindex=-1`, `autocomplete=off`, `aria-hidden`), sempre vazio para pessoas.
  - `adultos`/`criancas`: inteiro 0–20, ou texto de 1–2 dígitos; vazio conta como 0.
- **Resposta:** sempre HTTP 200 (limitação do Apps Script), com JSON:
  - `{"ok":true,"id":"…"}` → mostrar "Presença registrada! Obrigado." (gravado e conferido).
  - `{"ok":false,"erro":"validacao","campos":{"nome"|"adultos"|"criancas"|"total": "mensagem"}}` → mostrar junto aos campos; nada foi gravado.
  - `{"ok":false,"erro":"limite"}` → "Muitas confirmações agora; tente de novo em alguns minutos."
  - `{"ok":false,"erro":"rejeitado"}` → envio recusado (honeypot preenchido); nada gravado. Mostrar o erro genérico; **nunca** "registrada".
  - `{"ok":false,"erro":"nao_configurado"}` → `prepararPlanilha` não foi executada; nada gravado. Mostrar o erro genérico.
  - `{"ok":false,"erro":"tamanho"|"formato"|"interno"}` → "Não foi possível confirmar agora. Tente de novo."
  - Regra: **só `ok:true` é sucesso**; nenhuma outra resposta tem `ok:true`, nem o GET.
  - **Rede/timeout** (sem JSON) → **resultado desconhecido**: "Não conseguimos confirmar se sua presença foi registrada. Tente de novo." Reenviar pode gerar linha duplicada; o Yan resolve na planilha, porque não há chave idempotente nesta versão.
- **Front:** timeout de 15 s com AbortController; botão desabilitado durante o envio; nada gravado no navegador.
- **URL do Web App:** fica em `comum/rsvp-config.local.js` (no `.gitignore`; modelo em `comum/rsvp-config.exemplo.js`, só `https:`). Sem o arquivo, a página mostra "Confirmação ainda não ativada" e não envia nada (front do Edward, commit `9ba3168`).

## Passos para ativar (só com aprovação do Yan)
1. Abrir a planilha "Convite Arthur 1 ano — confirmações" → Extensões → Apps Script → colar `integracao/planilha-rsvp.gs` → salvar.
2. Executar `prepararPlanilha` uma vez **no editor** e autorizar com a conta do Yan (o Google pede permissão para a planilha). Ela salva o ID da planilha nas Propriedades do script (o Web App não tem planilha ativa) e cria o cabeçalho.
3. Opcional: executar `testeLocal` depois do passo 2 (grava uma linha "TESTE — apagar") e apagar a linha.
4. **[APROVAÇÃO DO YAN]** Implantar → Nova implantação → App da Web → Executar como: Eu · Acesso: Qualquer pessoa → copiar a URL para a config local do site.
5. Teste ponta a ponta: 1 confirmação válida, 1 inválida (0 pessoas) e 1 com honeypot preenchido → só a válida aparece na planilha.

Para desfazer: **arquivar a implantação** (Implantar → Gerenciar implantações → Arquivar), e o endpoint para de aceitar. **A planilha e os registros são preservados**; não apagar.

## Evidências
- Teste local do script: `node integracao/teste-planilha-rsvp.cjs` → 19/19 ok, código de saída 0 (≠0 se algum falhar). Roda no contexto de **Web App** (getActiveSpreadsheet = null). Cobre: limite com a janela calculada dentro do lock (requisição atrasada na virada da janela não zera o contador); sem configuração → nao_configurado; prepararPlanilha fora do editor → erro; ID salvo + cabeçalho; válido grava por openById; honeypot → rejeitado sem gravar; 6 validações; formato; tamanho; fórmula; falha de confirmação → interno; limite 30/10 min persistente; GET sem ok; nenhuma resposta ok sem linha nova.
- Prova de que o teste falha: com a janela calculada antes do lock → 18/19, exit=1; com o honeypot devolvendo `ok:true` → 16/18; com o script voltando a usar a planilha ativa → 14/18 e exit=1.
