// Teste local do planilha-rsvp.gs com simuladores do Apps Script, no contexto de WEB APP
// (sem planilha ativa: getActiveSpreadsheet() devolve null; a planilha só abre por openById).
// Uso: node integracao/teste-planilha-rsvp.cjs   → sai com código ≠ 0 se qualquer cenário falhar.
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const src = fs.readFileSync(path.join(__dirname, 'planilha-rsvp.gs'), 'utf8');

function ambiente({ editor = false } = {}) {
  const st = { rows: [], props: {}, falhaConfirmacao: false, abertoPorId: 0, agora: Date.UTC(2026, 10, 29, 15, 0, 0), aoTravar: null };
  class Relogio extends Date { constructor(...a) { super(...(a.length ? a : [st.agora])); } static now() { return st.agora; } }
  const sheet = {
    setName() {}, setFrozenRows() {}, getLastRow: () => st.rows.length, appendRow: (r) => st.rows.push(r),
    getRange: (r, c) => ({ getValue: () => (st.falhaConfirmacao ? 'outro' : st.rows[r - 1][c - 1]) }),
  };
  const ss = { getId: () => 'ID-SECRETO', getSheetByName: () => sheet, getSheets: () => [sheet] };
  const g = {
    Utilities: { newBlob: (s) => ({ getBytes: () => Buffer.from(s) }), getUuid: () => 'id-' + (st.rows.length + 1) },
    LockService: { getScriptLock: () => ({ waitLock() { if (st.aoTravar) { const f = st.aoTravar; st.aoTravar = null; f(); } }, releaseLock() {} }) },
    Date: Relogio,
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => st.props[k] ?? null, setProperty: (k, v) => { st.props[k] = v; } }) },
    SpreadsheetApp: {
      flush() {},
      getActiveSpreadsheet: () => (editor ? ss : null),               // Web App: sem planilha ativa
      openById: (id) => { assert.equal(id, 'ID-SECRETO'); st.abertoPorId++; return ss; },
    },
    ContentService: { MimeType: { JSON: 'j' }, createTextOutput: (s) => ({ setMimeType() { return { getContent: () => s }; } }) },
    console: { log() {}, error() {} },
  };
  const api = new Function(...Object.keys(g), src + ';return { doPost, doGet, prepararPlanilha };')(...Object.values(g));
  const post = (o) => JSON.parse(api.doPost({ postData: { contents: typeof o === 'string' ? o : JSON.stringify(o) } }).getContent());
  return { st, api, post, g };
}

const cenarios = [];
const t = (nome, fn) => cenarios.push([nome, fn]);
// prepara no "editor" e devolve um Web App que compartilha as propriedades
function webAppConfigurado() {
  const ed = ambiente({ editor: true });
  ed.api.prepararPlanilha();
  const web = ambiente({ editor: false });
  web.st.props = ed.st.props; web.st.rows = ed.st.rows;
  return web;
}

t('Web App sem prepararPlanilha → nao_configurado e nada gravado', () => {
  const w = ambiente(); const r = w.post({ nome: 'Ana', adultos: 1 });
  assert.deepEqual(r, { ok: false, erro: 'nao_configurado' }); assert.equal(w.st.rows.length, 0);
});
t('prepararPlanilha fora do editor (Web App) lança erro', () => {
  const w = ambiente(); assert.throws(() => w.api.prepararPlanilha(), /editor/);
});
t('prepararPlanilha salva o ID nas propriedades e cria o cabeçalho', () => {
  const w = webAppConfigurado();
  assert.equal(w.st.props.rsvp_planilha_id, 'ID-SECRETO'); assert.equal(w.st.rows[0][0], 'Recebido em');
});
t('Web App configurado: válido grava por openById e responde ok', () => {
  const w = webAppConfigurado(); const r = w.post({ nome: '  Ana   Souza ', adultos: 2, criancas: '1' });
  assert.equal(r.ok, true); assert.ok(r.id); assert.equal(w.st.abertoPorId, 1);
  assert.deepEqual(w.st.rows[1].slice(1), ['Ana Souza', 2, 1, 3, r.id]);
});
t('honeypot → erro "rejeitado", sem ok e sem gravar', () => {
  const w = webAppConfigurado(); const n = w.st.rows.length; const r = w.post({ nome: 'Bot', adultos: 1, website: 'x' });
  assert.deepEqual(r, { ok: false, erro: 'rejeitado' }); assert.equal(w.st.rows.length, n);
});
for (const [nome, corpo, campo] of [
  ['nome curto', { nome: 'A', adultos: 1 }, 'nome'], ['nome com 81', { nome: 'x'.repeat(81), adultos: 1 }, 'nome'],
  ['0 pessoas', { nome: 'Bia', adultos: 0, criancas: 0 }, 'total'], ['21 adultos', { nome: 'Bia', adultos: 21 }, 'adultos'],
  ['decimal', { nome: 'Bia', adultos: 1.5 }, 'adultos'], ['negativo em texto', { nome: 'Bia', criancas: '-1', adultos: 1 }, 'criancas'],
]) t(`validação: ${nome} → campo ${campo}, nada gravado`, () => {
  const w = webAppConfigurado(); const n = w.st.rows.length; const r = w.post(corpo);
  assert.equal(r.ok, false); assert.equal(r.erro, 'validacao'); assert.ok(r.campos[campo]); assert.equal(w.st.rows.length, n);
});
t('JSON inválido e array → formato', () => {
  const w = webAppConfigurado(); assert.equal(w.post('{oi').erro, 'formato'); assert.equal(w.post('[1]').erro, 'formato');
});
t('corpo > 2 KB → tamanho', () => { const w = webAppConfigurado(); assert.equal(w.post({ nome: 'a'.repeat(3000), adultos: 1 }).erro, 'tamanho'); });
t('fórmula no nome é neutralizada', () => {
  const w = webAppConfigurado(); w.post({ nome: '=HYPERLINK(1)', adultos: 1 }); assert.ok(w.st.rows.at(-1)[1].startsWith("'="));
});
t('falha ao confirmar a gravação → interno (nunca ok)', () => {
  const w = webAppConfigurado(); w.st.falhaConfirmacao = true; assert.deepEqual(w.post({ nome: 'Caio', adultos: 1 }), { ok: false, erro: 'interno' });
});
t('limite: 30 aceitos por janela, o 31º → limite (contador persistente nas propriedades)', () => {
  const w = webAppConfigurado(); const res = Array.from({ length: 31 }, (_, i) => w.post({ nome: 'Lote ' + i, adultos: 1 }));
  assert.equal(res.filter((r) => r.ok).length, 30); assert.equal(res[30].erro, 'limite');
  assert.match(w.st.props.rsvp_limite, /"n":30/);
});
t('limite: requisição que esperou o lock na virada da janela não zera o contador da janela nova', () => {
  const w = webAppConfigurado();
  const JANELA = 600_000;
  w.st.agora = Math.floor(w.st.agora / JANELA) * JANELA + JANELA - 1;     // fim da janela A
  // a requisição chega na janela A, mas só obtém o lock depois que a janela B já tem 30 confirmações
  w.st.aoTravar = () => {
    w.st.agora += 2;                                                       // agora estamos na janela B
    const janelaB = String(Math.floor(w.st.agora / 1000 / 600));
    w.st.props.rsvp_limite = JSON.stringify({ janela: janelaB, n: 30 });
  };
  assert.equal(w.post({ nome: 'Atrasada', adultos: 1 }).erro, 'limite');   // conta na janela B (cheia)
  assert.match(w.st.props.rsvp_limite, /"n":30/);                          // contador da janela B intacto
  assert.equal(w.post({ nome: 'Mais uma', adultos: 1 }).erro, 'limite');
});
t('doGet não diz ok nem grava', () => {
  const w = webAppConfigurado(); const r = JSON.parse(w.api.doGet().getContent()); assert.equal(r.ok, undefined);
});
t('nenhuma resposta de sucesso sem linha nova', () => {
  const w = webAppConfigurado();
  for (const c of [{ nome: 'Bot', adultos: 1, website: 'x' }, { nome: 'A' }, '{x', { nome: 'Ok', adultos: 0 }]) {
    const n = w.st.rows.length; const r = w.post(c); if (r.ok) assert.equal(w.st.rows.length, n + 1);
  }
});

let falhas = 0;
for (const [nome, fn] of cenarios) {
  try { fn(); console.log('ok   ' + nome); } catch (e) { falhas++; console.log('FAIL ' + nome + '\n     ' + e.message); }
}
console.log(`${cenarios.length - falhas}/${cenarios.length} cenários ok`);
process.exit(falhas ? 1 : 0);
