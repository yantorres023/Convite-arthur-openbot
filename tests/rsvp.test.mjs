// Regras do RSVP (sem navegador): validação, corpo da requisição (contrato do Rocky) e interpretação da resposta.
// Nenhum "sucesso" sem HTTP 200 + JSON {ok:true}.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validar, corpo, enviar } from "../comum/rsvp.js";

const D = { nome: "Maria Silva", adultos: 2, criancas: 1 };
const resp = (status, body) => async () => ({ ok: status >= 200 && status < 300, status, text: async () => (typeof body === "string" ? body : JSON.stringify(body)) });

test("corpo: JSON com nome, adultos, crianças e o honeypot vazio", () => {
  assert.deepEqual(JSON.parse(corpo(D)), { nome: "Maria Silva", adultos: 2, criancas: 1, website: "" });
  assert.equal(JSON.parse(corpo(D, "spam")).website, "spam");
});
test("validação: nome obrigatório (2–80), espaços normalizados", () => {
  assert.equal(validar({ nome: " ", adultos: "1", criancas: "0" }).erros.nome, "Informe seu nome.");
  assert.ok(validar({ nome: "x".repeat(81), adultos: "1", criancas: "0" }).erros.nome);
  assert.equal(validar({ nome: "  Maria   Silva ", adultos: "1", criancas: "0" }).dados.nome, "Maria Silva");
});
test("validação: adultos e crianças inteiros de 0 a 20; entrada inválida do navegador é erro", () => {
  for (const ruim of ["-1", "21", "1.5", "abc", "2e1", "100", "1 2", "inválido"]) {
    assert.ok(validar({ nome: "Ana", adultos: ruim, criancas: "0" }).erros.adultos, `adultos ${ruim}`);
    assert.ok(validar({ nome: "Ana", adultos: "1", criancas: ruim }).erros.criancas, `crianças ${ruim}`);
  }
  for (const bom of ["0", "1", "20", " 7 "]) assert.equal(validar({ nome: "Ana", adultos: bom, criancas: "1" }).erros.adultos, undefined);
});
test("validação: vazio conta como 0; pelo menos 1 pessoa", () => {
  const v = validar({ nome: "Ana", adultos: "2", criancas: "" });
  assert.equal(v.ok, true); assert.equal(v.dados.criancas, 0);
  assert.ok(validar({ nome: "Ana", adultos: "", criancas: "" }).erros.total);
  assert.ok(validar({ nome: "Ana", adultos: "0", criancas: "0" }).erros.total);
});
test("enviar: só {ok:true} com HTTP 200 é sucesso", async () => {
  assert.deepEqual(await enviar("https://x.invalid/e", D, "", { fetchFn: resp(200, { ok: true, id: "1" }) }), { estado: "sucesso" });
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: resp(200, { ok: "true" }) })).estado, "erro", "ok como texto não vale");
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: resp(200, {}) })).estado, "erro");
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: resp(200, "<html>login</html>") })).estado, "erro", "HTML (ex.: tela de login) não é sucesso");
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: resp(500, { ok: true }) })).estado, "erro", "HTTP 500 com ok:true não é sucesso");
});
test("enviar: validação, limite e erros do servidor", async () => {
  const v = await enviar("https://x.invalid/e", D, "", { fetchFn: resp(200, { ok: false, erro: "validacao", campos: { nome: "Nome curto." } }) });
  assert.deepEqual(v, { estado: "validacao", campos: { nome: "Nome curto." } });
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: resp(200, { ok: false, erro: "limite" }) })).estado, "limite");
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: resp(429, "") })).estado, "limite");
  for (const e of ["tamanho", "formato", "interno", "rejeitado", "nao_configurado"]) assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: resp(200, { ok: false, erro: e }) })).estado, "erro");
});
test("enviar: rede fora e prazo esgotado = resultado desconhecido", async () => {
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: async () => { throw new TypeError("Failed to fetch"); } })).estado, "desconhecido");
  const lento = (url, { signal }) => new Promise((_, rej) => signal.addEventListener("abort", () => rej(new DOMException("abort", "AbortError"))));
  const t0 = Date.now();
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: lento, prazoMs: 200 })).estado, "desconhecido");
  assert.ok(Date.now() - t0 < 2000, "respeita o prazo");
});
test("enviar: POST text/plain, sem credenciais", async () => {
  let req;
  await enviar("https://x.invalid/e", D, "", { fetchFn: async (u, o) => { req = { u, ...o }; return resp(200, { ok: true })(); } });
  assert.equal(req.method, "POST"); assert.equal(req.headers["content-type"], "text/plain;charset=utf-8"); assert.equal(req.credentials, "omit");
  assert.deepEqual(JSON.parse(req.body), { nome: "Maria Silva", adultos: 2, criancas: 1, website: "" });
});

test("enviar: cabeçalhos chegam mas o corpo trava até o prazo = desconhecido (não erro)", async () => {
  const corpoPreso = async (u, { signal }) => ({ ok: true, status: 200,
    text: () => new Promise((_, rej) => signal.addEventListener("abort", () => rej(new DOMException("abort", "AbortError")))) });
  const t0 = Date.now();
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: corpoPreso, prazoMs: 200 })).estado, "desconhecido");
  assert.ok(Date.now() - t0 < 2000);
  const corpoCai = async () => ({ ok: true, status: 200, text: async () => { throw new TypeError("network error"); } });
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: corpoCai })).estado, "desconhecido", "conexão caiu no meio do corpo");
  assert.equal((await enviar("https://x.invalid/e", D, "", { fetchFn: resp(200, "{quebrado") })).estado, "erro", "corpo completo inválido = erro");
});
