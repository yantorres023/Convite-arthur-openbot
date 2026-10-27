/**
 * RSVP do Convite do Arthur → planilha privada "Convite Arthur 1 ano — confirmações".
 *
 * Onde colar: na PRÓPRIA planilha, em Extensões → Apps Script (script vinculado).
 * Não há ID de planilha neste arquivo: prepararPlanilha(), executada uma vez NO EDITOR (onde a planilha
 * vinculada está ativa), grava o ID nas Propriedades do script (PropertiesService, fora do repositório).
 * O Web App não tem "planilha ativa", então doPost abre a planilha por esse ID salvo.
 *
 * Publicar (só com aprovação do Yan): Implantar → Nova implantação → Tipo "App da Web"
 *   Executar como: Eu (dono da planilha) · Quem pode acessar: Qualquer pessoa.
 * Isso cria um ENDPOINT PÚBLICO de escrita ANÔNIMA: qualquer pessoa com a URL pode enviar confirmações,
 * e a URL fica visível no navegador de quem abre o convite. A planilha continua privada: o endpoint não a lê.
 *
 * Contrato (POST, corpo JSON enviado como text/plain para evitar preflight CORS):
 *   { "nome": string 2–80, "adultos": int 0–20, "criancas": int 0–20, "website": "" (honeypot) }
 * Resposta sempre HTTP 200 (limitação do Apps Script) com JSON:
 *   { "ok": true,  "id": "<id do envio>" }                     → gravado e confirmado
 *   { "ok": false, "erro": "validacao", "campos": {campo: msg} } → nada gravado
 *   { "ok": false, "erro": "limite" }                           → muitas confirmações em pouco tempo; tente depois
 *   { "ok": false, "erro": "rejeitado" }                        → envio recusado (ex.: honeypot); nada gravado
 *   { "ok": false, "erro": "nao_configurado" }                  → prepararPlanilha() não foi executada
 *   { "ok": false, "erro": "tamanho" | "formato" | "interno" }  → nada gravado
 */

const ABA = 'Confirmações';
const CABECALHO = ['Recebido em', 'Nome', 'Adultos', 'Crianças', 'Total', 'ID do envio'];
const MAX_CORPO = 2048;          // bytes
const LIMITE_JANELA = 30;        // confirmações aceitas por janela (global; o Apps Script não expõe o IP)
const JANELA_SEG = 600;          // 10 minutos

function doPost(e) {
  try {
    const bruto = (e && e.postData && e.postData.contents) || '';
    if (Utilities.newBlob(bruto).getBytes().length > MAX_CORPO) return resposta({ ok: false, erro: 'tamanho' });

    let dados;
    try { dados = JSON.parse(bruto); } catch (_) { return resposta({ ok: false, erro: 'formato' }); }
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return resposta({ ok: false, erro: 'formato' });

    // Honeypot: robô preencheu o campo escondido → recusa sem gravar (nunca "ok": não existe sucesso falso).
    if (typeof dados.website === 'string' && dados.website.trim() !== '') return resposta({ ok: false, erro: 'rejeitado' });

    const v = validar(dados);
    if (v.erros) return resposta({ ok: false, erro: 'validacao', campos: v.erros });

    if (!dentroDoLimite()) return resposta({ ok: false, erro: 'limite' });

    const ss = planilhaConfigurada();
    if (!ss) return resposta({ ok: false, erro: 'nao_configurado' });

    const id = Utilities.getUuid();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const aba = abaConfirmacoes(ss);
      aba.appendRow([new Date(), protegerFormula(v.nome), v.adultos, v.criancas, v.adultos + v.criancas, id]);
      SpreadsheetApp.flush();                       // grava agora, antes de responder
      const ultima = aba.getRange(aba.getLastRow(), 6).getValue();
      if (ultima !== id) return resposta({ ok: false, erro: 'interno' }); // confirmação da gravação
    } finally {
      lock.releaseLock();
    }
    return resposta({ ok: true, id: id });
  } catch (err) {
    console.error(err);
    return resposta({ ok: false, erro: 'interno' });
  }
}

/** GET não grava nada: só diz que o endpoint existe (útil para teste). */
function doGet() { return resposta({ servico: 'rsvp-arthur', aceita: 'POST' }); }

function validar(d) {
  const erros = {};
  const nome = typeof d.nome === 'string' ? d.nome.replace(/\s+/g, ' ').trim() : '';
  if (nome.length < 2 || nome.length > 80) erros.nome = 'Informe um nome entre 2 e 80 caracteres.';
  const adultos = inteiro(d.adultos), criancas = inteiro(d.criancas);
  if (adultos === null) erros.adultos = 'Use um número inteiro de 0 a 20.';
  if (criancas === null) erros.criancas = 'Use um número inteiro de 0 a 20.';
  if (adultos !== null && criancas !== null && adultos + criancas < 1) erros.total = 'Confirme pelo menos 1 pessoa.';
  return Object.keys(erros).length ? { erros: erros } : { nome: nome, adultos: adultos, criancas: criancas };
}

/** Aceita 0–20 como número ou texto de dígitos; vazio/ausente = 0 (mesma regra do formulário). */
function inteiro(x) {
  if (x === undefined || x === null || x === '') return 0;
  if (typeof x === 'string' && /^\d{1,2}$/.test(x.trim())) x = Number(x.trim());
  if (typeof x !== 'number' || !Number.isInteger(x) || x < 0 || x > 20) return null;
  return x;
}

/** Evita injeção de fórmula na planilha (nome começando com = + - @). */
function protegerFormula(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }

/**
 * Limite global por janela de 10 min, guardado em PropertiesService sob LockService (persistente; o
 * CacheService pode descartar a chave antes do prazo). Mantém só a janela atual.
 */
function dentroDoLimite() {
  const props = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    // A janela é calculada DEPOIS de obter o lock: uma requisição que esperou o lock não pode gravar o
    // contador de uma janela que já passou por cima do contador da janela atual.
    const janela = String(Math.floor(Date.now() / 1000 / JANELA_SEG));
    const salvo = JSON.parse(props.getProperty('rsvp_limite') || '{}');
    const n = salvo.janela === janela ? Number(salvo.n || 0) : 0;
    if (n >= LIMITE_JANELA) return false;
    props.setProperty('rsvp_limite', JSON.stringify({ janela: janela, n: n + 1 }));
    return true;
  } finally {
    lock.releaseLock();
  }
}

/** Planilha salva por prepararPlanilha(); null se ainda não configurada. */
function planilhaConfigurada() {
  const id = PropertiesService.getScriptProperties().getProperty('rsvp_planilha_id');
  return id ? SpreadsheetApp.openById(id) : null;
}

function abaConfirmacoes(ss) {
  let aba = ss.getSheetByName(ABA);
  if (!aba) {
    aba = ss.getSheets()[0];
    aba.setName(ABA);
  }
  if (aba.getLastRow() === 0) {
    aba.appendRow(CABECALHO);
    aba.setFrozenRows(1);
  }
  return aba;
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Rodar UMA vez no EDITOR (botão Executar): autoriza o acesso, salva o ID da planilha vinculada nas
 * Propriedades do script e cria o cabeçalho. No Web App não há planilha ativa; por isso o ID é salvo aqui.
 */
function prepararPlanilha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Execute prepararPlanilha no editor do Apps Script aberto a partir da planilha.');
  PropertiesService.getScriptProperties().setProperty('rsvp_planilha_id', ss.getId());
  abaConfirmacoes(ss);
}

/** Teste manual no editor, sem publicar: grava uma linha de TESTE e mostra a resposta no log. */
function testeLocal() {
  const r = doPost({ postData: { contents: JSON.stringify({ nome: 'TESTE — apagar', adultos: 1, criancas: 0, website: '' }) } });
  console.log(r.getContent());
}
