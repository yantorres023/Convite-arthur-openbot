// E2E dos 3 conceitos e do comparativo (Playwright/Chromium), servidos localmente em 127.0.0.1:4300.
// Nada sai da máquina: requisição para outra ORIGEM falha o teste, exceto o endpoint FALSO do RSVP configurado no
// teste (https://rsvp.teste.invalid), atendido por um servidor simulado (sucesso, erros, 429, lento, mudo).
// Em TODOS os cenários: sem requisições externas e sem erros de console/página.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const BASE = "http://127.0.0.1:4300";
const ORIGEM = new URL(BASE).origin;
const PRINTS = `${RAIZ}prints`;
const CONCEITOS = ["conceito-1", "conceito-2", "conceito-3"];
const LARGURAS = [390, 1440];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(PRINTS, { recursive: true });

let srv, browser;
before(async () => {
  srv = spawn("python3", ["-m", "http.server", "4300", "--bind", "127.0.0.1"], { cwd: RAIZ, stdio: "ignore" });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(BASE + "/")).ok) break; } catch {} await sleep(100); }
  browser = await chromium.launch();
});
after(async () => { await browser?.close(); srv?.kill(); });

const ENDPOINT = "https://rsvp.teste.invalid/exec"; // endpoint FALSO do teste (o real nunca vai para o repositório)

/**
 * Abre uma página com guarda de rede (por URL.origin). Devolve { ctx, p, envios, fim() }.
 * - servidor: "sucesso" | "erro" | "validacao" | "limite429" | "html" | "lento" | "mudo" (nunca responde) | null (sem config).
 * - Só o ENDPOINT configurado pode ser chamado; qualquer outra origem falha o teste.
 * fim() fecha e exige nenhuma requisição externa indevida e nenhum erro de console/página.
 */
async function abrir(url, { largura = 390, reduzir = false, js = true, bloquear = null, servidor = "sucesso" } = {}) {
  const ctx = await browser.newContext({ viewport: { width: largura, height: largura < 800 ? 844 : 900 }, reducedMotion: reduzir ? "reduce" : "no-preference", javaScriptEnabled: js });
  const externas = [], erros = [], envios = [], presas = [];
  await ctx.route(() => true, async (r) => {
    const u = new URL(r.request().url());
    if (bloquear && bloquear.test(u.pathname)) return r.fulfill({ status: 404, body: "" });
    if (u.origin === ORIGEM && u.pathname === "/comum/rsvp-config.local.js")
      return servidor ? r.fulfill({ status: 200, contentType: "text/javascript", body: `export const RSVP_ENDPOINT = ${JSON.stringify(ENDPOINT)};` }) : r.fulfill({ status: 404, body: "" });
    if (u.origin === ORIGEM) return r.continue();
    if (servidor && u.origin === new URL(ENDPOINT).origin) {
      envios.push({ metodo: r.request().method(), tipo: r.request().headers()["content-type"], corpo: r.request().postData() });
      const json = (o, status = 200) => r.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(o) });
      // Contrato do Rocky: honeypot preenchido → {ok:false, erro:"rejeitado"} (nada gravado, nunca sucesso).
      const isca = (() => { try { return JSON.parse(r.request().postData() || "{}").website; } catch { return ""; } })();
      if (isca) return json({ ok: false, erro: "rejeitado" });
      if (servidor === "sucesso") return json({ ok: true, id: "t1" });
      if (servidor === "nao_configurado") return json({ ok: false, erro: "nao_configurado" });
      if (servidor === "erro") return json({ ok: false, erro: "interno" });
      if (servidor === "validacao") return json({ ok: false, erro: "validacao", campos: { nome: "Nome recusado pelo servidor." } });
      if (servidor === "limite429") return json({}, 429);
      if (servidor === "html") return r.fulfill({ status: 200, contentType: "text/html", headers: { "access-control-allow-origin": "*" }, body: "<html>Fazer login</html>" });
      if (servidor === "lento") { await sleep(2000); return json({ ok: true, id: "t2" }); }
      if (servidor === "mudo") { presas.push(r); return; }
    }
    externas.push(u.href); return r.fulfill({ status: 204, body: "" });
  });
  const p = await ctx.newPage();
  // Avisos esperados do próprio navegador: config ausente / módulo bloqueado de propósito; 429 simulado.
  const ignorar = (t) => (/404|Failed to load|rsvp-config\.local\.js/i.test(t) && (!servidor || bloquear)) || (servidor === "limite429" && /status of 429/.test(t));
  p.on("pageerror", (e) => { if (!ignorar(String(e))) erros.push(String(e)); });
  p.on("console", (m) => { if (m.type() === "error" && !ignorar(m.text())) erros.push(m.text()); });
  await p.goto(url, { waitUntil: "networkidle" });
  return {
    ctx, p, envios,
    fim: async () => { for (const r of presas) await r.abort().catch(() => {}); await ctx.close(); assert.deepEqual(externas, [], "requisições externas indevidas"); assert.deepEqual(erros, [], "erros de console/página"); },
  };
}
async function preencher(p, nome = "Maria Silva", a = "2", c = "1") {
  await p.fill("input[name=nome]", nome); await p.fill("input[name=adultos]", a); await p.fill("input[name=criancas]", c);
}
const status = (p) => p.evaluate(() => { const s = document.querySelector("[data-status]"); return { estado: s.dataset.estado || "", texto: s.textContent.trim() }; });
const contraste = (fg, bg) => {
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x); return (a + 0.05) / (b + 0.05);
};
const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number).slice(0, 3);

test("comparativo: index com link para os 3 conceitos", async () => {
  for (const w of LARGURAS) {
    const { p, fim } = await abrir(`${BASE}/`, { largura: w });
    for (const c of CONCEITOS) assert.equal(await p.locator(`a[href$="${c}/"]`).count() >= 1, true, `link para ${c}`);
    await p.screenshot({ path: `${PRINTS}/${w}-comparativo.png`, fullPage: true });
    await fim();
  }
});

const ENDERECO_BUSCA = "Casa da Árvore, Rua Castelo Branco, 31, Cidade Nova, Santana do Paraíso - MG";
const MAPAS = { google: ["https://www.google.com", "/maps/search/", "query"], apple: ["https://maps.apple.com", "/", "q"], waze: ["https://waze.com", "/ul", "q"] };
async function conferirMapas(p, onde) {
  for (const [k, [origem, caminho, param]] of Object.entries(MAPAS)) {
    const a = p.locator(`[data-mapa=${k}]`);
    assert.equal(await a.count(), 1, `${onde}: botão ${k}`);
    const u = new URL(await a.getAttribute("href"));
    assert.equal(u.origin, origem, `${onde}: domínio oficial do ${k}`); assert.equal(u.pathname, caminho);
    assert.equal(u.searchParams.get(param), ENDERECO_BUSCA, `${onde}: endereço decodificado do ${k}`);
    if (k === "google") assert.equal(u.searchParams.get("api"), "1");
    if (k === "waze") assert.equal(u.searchParams.get("navigate"), "yes");
    assert.equal(await a.getAttribute("target"), "_blank"); assert.equal(await a.getAttribute("rel"), "noopener noreferrer");
    assert.match(await a.getAttribute("aria-label"), /Abrir o endereço da festa no .+ \(abre em nova aba\)/);
    const box = await a.boundingBox(); assert.ok(box.height >= 44, `${onde}: alvo do ${k} ≥ 44 px`);
  }
}

test("botões de mapa (Google Maps, Apple Maps, Waze): 3 páginas e comparativo, 390 e 1440, sem requisição externa no carregamento", async () => {
  for (const pagina of ["", ...CONCEITOS.map((c) => `${c}/`)]) for (const w of LARGURAS) {
    const { p, fim } = await abrir(`${BASE}/${pagina}`, { largura: w });
    await conferirMapas(p, `${pagina || "comparativo"} ${w}`);
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "sem rolagem horizontal");
    await fim(); // fim() falha se houve qualquer requisição a outra origem
  }
});

for (const c of CONCEITOS) {
  test(`${c}: dados exatos, sem rede externa, sem foto, sem rolagem lateral (390 e 1440, prints)`, async () => {
    for (const w of LARGURAS) {
      const { p, fim } = await abrir(`${BASE}/${c}/`, { largura: w });
      const txt = (await p.textContent("body")).replace(/\s+/g, " ");
      for (const s of ["Arthur", "1 ano", "15h", "Casa da Árvore", "Rua Castelo Branco, nº 31", "Cidade Nova, Santana do Paraíso"]) assert.ok(txt.includes(s), `${c} ${w}: falta "${s}"`);
      assert.match(txt, /29 de novembro de 2026/, "data por extenso");
      assert.match(txt, /domingo/i, "dia da semana");
      assert.match(txt, /country/i, "tema country");
      assert.match(txt, /caracterizad/i, "convidados caracterizados");
      assert.equal(await p.locator("img[src$='.jpg'], img[src$='.jpeg']").count(), 0, "sem foto");
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${c} ${w}: rolagem horizontal`);
      assert.equal(await p.isVisible("[data-sem-js]"), false, "aviso de sem-JS escondido com JS");
      // rola a página inteira (a entrada de cada bloco acontece ao aparecer na tela) e espera a animação acabar
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
      await sleep(900);
      assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll("[data-entrada]")].filter((e) => +getComputedStyle(e).opacity < 1).map((e) => e.className)), [], "bloco invisível depois de rolar");
      await p.screenshot({ path: `${PRINTS}/${w}-${c}.png`, fullPage: true });
      await fim();
    }
  });

  test(`${c}: RSVP valida os campos e não envia nada com dados inválidos`, async () => {
    const { p, envios, fim } = await abrir(`${BASE}/${c}/`);
    const f = p.locator("form[data-rsvp]");
    await f.locator("[data-enviar]").click();
    assert.ok((await f.locator("[data-erro=nome]").textContent()).trim(), "erro do nome");
    assert.equal(await p.evaluate(() => document.activeElement?.name), "nome", "foco no primeiro campo inválido");
    assert.equal(await f.locator("input[name=nome]").getAttribute("aria-invalid"), "true");
    await f.locator("input[name=nome]").fill("Ana");
    for (const [a, k] of [["21", "0"], ["-1", "0"], ["1", "1.5"], ["0", "0"]]) {
      await f.locator("input[name=adultos]").fill(a); await f.locator("input[name=criancas]").fill(k);
      await f.locator("[data-enviar]").click();
      assert.ok((await f.locator("[data-erro]").allTextContents()).join(" ").trim(), `erro para adultos=${a} crianças=${k}`);
    }
    await sleep(300);
    assert.equal(envios.length, 0, "nada enviado com dados inválidos");
    assert.equal((await status(p)).estado, "invalido");
    assert.match(await p.textContent("[data-erro=total]"), /Revise os campos indicados/);
    await fim();
  });

  test(`${c}: digitar "e" (entrada inválida em número) é erro acessível, não vira 0`, async () => {
    const { p, envios, fim } = await abrir(`${BASE}/${c}/`);
    await p.click("input[name=nome]"); await p.keyboard.type("Ana");
    await p.click("input[name=adultos]"); await p.keyboard.type("1");
    await p.click("input[name=criancas]"); await p.keyboard.type("e");
    assert.equal(await p.evaluate(() => document.querySelector("input[name=criancas]").validity.badInput), true, "o navegador marca badInput");
    await p.click("[data-enviar]"); await sleep(300);
    assert.match(await p.textContent("[data-erro=criancas]"), /0 a 20/);
    assert.equal(await p.getAttribute("input[name=criancas]", "aria-invalid"), "true");
    assert.equal(await p.getAttribute("input[name=criancas]", "aria-describedby"), "erro-criancas");
    assert.equal(envios.length, 0, "não enviou Crianças: 0 silencioso");
    await fim();
  });

  test(`${c}: sucesso só com {ok:true}: POST text/plain com o corpo do contrato; duplo clique = 1 envio`, async () => {
    const { p, envios, fim } = await abrir(`${BASE}/${c}/`, { servidor: "lento" });
    await preencher(p);
    await p.evaluate(() => { const b = document.querySelector("[data-enviar]"); b.click(); b.click(); });
    await sleep(300);
    assert.deepEqual(await status(p), { estado: "enviando", texto: "Registrando sua presença… Aguarde a confirmação." });
    assert.equal(await p.isDisabled("[data-enviar]"), true, "botão desabilitado enquanto envia");
    assert.equal(await p.textContent("[data-enviar]"), "Enviando…");
    assert.equal(await p.getAttribute("form[data-rsvp]", "aria-busy"), "true");
    assert.equal(await p.evaluate(() => document.querySelector("input[name=nome]").readOnly), true, "campos só leitura enquanto envia");
    assert.equal(await p.inputValue("input[name=nome]"), "Maria Silva", "valores mantidos");
    assert.equal(await p.isVisible("[data-sucesso]"), false, "nenhum sucesso antes da resposta");
    await p.waitForFunction(() => document.querySelector("[data-status]").dataset.estado === "sucesso", null, { timeout: 8000 });
    assert.equal((await status(p)).texto, "Presença registrada!");
    assert.match(await p.textContent("[data-sucesso]"), /Presença registrada!\s*Confirmação recebida\./);
    assert.equal(await p.getAttribute("[data-sucesso]", "role"), "status");
    assert.equal(await p.textContent("[data-enviar]"), "Confirmado"); assert.equal(await p.isDisabled("[data-enviar]"), true);
    assert.equal(envios.length, 1, "duplo clique = 1 envio");
    assert.equal(envios[0].metodo, "POST"); assert.equal(envios[0].tipo, "text/plain;charset=utf-8");
    assert.deepEqual(JSON.parse(envios[0].corpo), { nome: "Maria Silva", adultos: 2, criancas: 1, website: "" });
    assert.equal(await p.evaluate(() => document.querySelector("input[name=nome]").readOnly), true, "depois do sucesso os campos ficam só leitura");
    await p.keyboard.press("Enter"); await sleep(200); assert.equal(envios.length, 1, "sem reenvio acidental");
    assert.deepEqual(await p.evaluate(() => [Object.keys(localStorage).length, Object.keys(sessionStorage).length]), [0, 0], "nada gravado no navegador");
    await p.locator("#rsvp").screenshot({ path: `${PRINTS}/390-${c}-rsvp-sucesso.png` });
    await fim();
  });

  for (const [servidor, estado, texto] of [
    ["erro", "erro", "Não conseguimos registrar agora; tente de novo"],
    ["html", "erro", "Não conseguimos registrar agora; tente de novo"],
    ["limite429", "erro", "Muitas confirmações agora; tente de novo em alguns minutos."],
    ["validacao", "erro", "Não conseguimos registrar agora; tente de novo"],
    ["nao_configurado", "erro", "Não conseguimos registrar agora; tente de novo"],
  ]) {
    test(`${c}: servidor responde "${servidor}" → mensagem certa, sem "Presença registrada", botão volta`, async () => {
      const { p, envios, fim } = await abrir(`${BASE}/${c}/`, { servidor });
      await preencher(p); await p.click("[data-enviar]");
      await p.waitForFunction(() => !["", "enviando"].includes(document.querySelector("[data-status]").dataset.estado || ""), null, { timeout: 8000 });
      assert.deepEqual(await status(p), { estado, texto });
      assert.doesNotMatch(await p.textContent("body"), /Presença registrada/);
      assert.equal(await p.isDisabled("[data-enviar]"), false, "pode tentar de novo");
      assert.equal(await p.textContent("[data-enviar]"), "Confirmar presença");
      assert.equal(await p.getAttribute("[data-alerta]", "role"), "alert"); assert.equal((await p.textContent("[data-alerta]")).trim(), texto);
      assert.equal(await p.inputValue("input[name=nome]"), "Maria Silva", "dados mantidos");
      assert.equal(await p.isVisible("[data-sucesso]"), false);
      if (servidor === "validacao") assert.match(await p.textContent("[data-erro=nome]"), /recusado pelo servidor/);
      assert.equal(envios.length, 1);
      await fim();
    });
  }

  test(`${c}: sem endpoint configurado: "Confirmação ainda não ativada", nada enviado, nenhum sucesso simulado`, async () => {
    const { p, envios, fim } = await abrir(`${BASE}/${c}/`, { servidor: null });
    assert.deepEqual(await status(p), { estado: "inativo", texto: "Confirmação ainda não ativada." });
    assert.match(await p.textContent("[data-nota]"), /Confirmação ainda não ativada/, "aviso visível");
    assert.equal(await p.isDisabled("[data-enviar]"), true);
    await p.locator("[data-enviar]").click({ force: true }).catch(() => {});
    await sleep(300);
    assert.equal(envios.length, 0); assert.doesNotMatch(await p.textContent("body"), /Presença registrada/);
    await fim();
  });

  test(`${c}: honeypot fora da tela e do teclado; preenchido → servidor rejeita e a tela NUNCA mostra "Presença registrada"`, async () => {
    const { p, envios, fim } = await abrir(`${BASE}/${c}/`);
    const box = await p.locator("input[name=website]").boundingBox();
    assert.ok(!box || box.x < -1000 || box.width <= 1, "isca fora da tela");
    assert.equal(await p.getAttribute("input[name=website]", "tabindex"), "-1");
    await preencher(p); await p.evaluate(() => { document.querySelector("input[name=website]").value = "robô"; });
    await p.click("[data-enviar]");
    await p.waitForFunction(() => !["", "enviando"].includes(document.querySelector("[data-status]").dataset.estado || ""), null, { timeout: 8000 });
    assert.equal(JSON.parse(envios[0].corpo).website, "robô");
    assert.deepEqual(await status(p), { estado: "erro", texto: "Não conseguimos registrar agora; tente de novo" });
    assert.doesNotMatch(await p.textContent("body"), /Presença registrada/);
    assert.equal(await p.isVisible("[data-sucesso]"), false);
    await fim();
  });

  test(`${c}: sem JavaScript o RSVP não envia nada (nem pela URL) e explica`, async () => {
    const { p, envios, fim } = await abrir(`${BASE}/${c}/`, { js: false });
    assert.ok(await p.isVisible("[data-sem-js]"), "aviso visível");
    assert.equal(await p.isDisabled("input[name=nome]"), true, "campos desabilitados");
    assert.equal(await p.isDisabled("[data-enviar]"), true, "botão desabilitado");
    assert.equal(await p.locator("form[data-rsvp] [type=submit]").count(), 0, "sem botão de envio nativo");
    await p.locator("[data-enviar]").click({ force: true }).catch(() => {});
    await p.locator("input[name=nome]").press("Enter").catch(() => {});
    await sleep(300);
    assert.equal(new URL(p.url()).search, "", "nada foi para a URL"); assert.equal(envios.length, 0);
    await fim();
  });

  test(`${c}: com o módulo do RSVP indisponível, o formulário continua travado e explica`, async () => {
    const { p, envios, fim } = await abrir(`${BASE}/${c}/`, { bloquear: /\/comum\/pagina\.js$/ });
    assert.ok(await p.isVisible("[data-sem-js]"), "aviso visível");
    assert.equal(await p.isDisabled("[data-enviar]"), true);
    await p.locator("[data-enviar]").click({ force: true }).catch(() => {});
    await sleep(300);
    assert.equal(new URL(p.url()).search, "", "nada foi para a URL"); assert.equal(envios.length, 0);
    await fim();
  });

  for (const w of LARGURAS) {
    test(`${c} ${w}: percurso completo de teclado (campos e botão; isca fora) com foco visível e movimento reduzido`, async () => {
      const { p, envios, fim } = await abrir(`${BASE}/${c}/`, { largura: w, reduzir: true });
      const focoVisivel = () => p.evaluate(() => { const e = document.activeElement, s = getComputedStyle(e);
        return { nome: e.getAttribute("name") || (e.dataset.enviar !== undefined && "enviar") || e.tagName,
          visivel: (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2) || s.boxShadow !== "none" }; });
      const ordem = [];
      for (let i = 0; i < 40 && !ordem.includes("enviar"); i++) {
        await p.keyboard.press("Tab"); const f = await focoVisivel(); ordem.push(f.nome);
        assert.ok(f.visivel, `foco visível em ${f.nome}`);
        if (f.nome === "nome") await p.keyboard.type("Maria Silva");
        if (f.nome === "adultos") await p.keyboard.type("2");
        if (f.nome === "criancas") await p.keyboard.type("1");
      }
      const i = (n) => ordem.indexOf(n);
      assert.ok(i("nome") >= 0 && i("nome") < i("adultos") && i("adultos") < i("criancas") && i("criancas") < i("enviar"), `ordem: ${ordem.join(" → ")}`);
      assert.ok(!ordem.includes("website"), "a isca não recebe foco");
      await p.keyboard.press("Enter");
      await p.waitForFunction(() => document.querySelector("[data-status]").dataset.estado === "sucesso", null, { timeout: 8000 });
      assert.equal(envios.length, 1);
      const lentas = await p.evaluate(() => [...document.querySelectorAll("*")].filter((e) => { const s = getComputedStyle(e);
        const d = (v) => Math.max(...v.split(",").map((x) => parseFloat(x) * (x.trim().endsWith("ms") ? 1 : 1000)));
        return d(s.animationDuration) > 10 || d(s.transitionDuration) > 10; }).map((e) => e.tagName + "." + e.className));
      assert.deepEqual(lentas, [], "animações/transições com movimento reduzido");
      await fim();
    });

    test(`${c} ${w}: contraste AA de textos, campos, placeholders, erros e estados do envio`, async () => {
      const { p, fim } = await abrir(`${BASE}/${c}/`, { largura: w, servidor: "erro" });
      await p.click("[data-enviar]"); // erros de campo visíveis
      await p.fill("input[name=nome]", "Ana"); await p.fill("input[name=adultos]", "0"); await p.fill("input[name=criancas]", "0");
      await p.click("[data-enviar]"); await p.fill("input[name=nome]", ""); await p.click("[data-enviar]");
      const medir = () => p.evaluate(() => {
        const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
        const fundo = (e) => { for (let x = e; x; x = x.parentElement) { const s = getComputedStyle(x); const c = rgb(s.backgroundColor); if (s.backgroundImage !== "none") return null; if (c.length === 3 || (c[3] ?? 1) > 0.95) return c.slice(0, 3); } return [255, 255, 255]; };
        const out = [];
        for (const e of document.querySelectorAll("h1,h2,h3,p,li,label,button,a,span,dt,dd,small,strong,time,input,div")) {
          if (!e.offsetParent || e.closest(".isca") || e.classList.contains("sr-only")) continue;
          const s = getComputedStyle(e); const bg = fundo(e); if (!bg) continue;
          const grande = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700);
          if (e.tagName === "INPUT") {
            out.push({ q: `input ${e.name} (texto)`, fg: rgb(s.color), bg, grande: false });
            if (!e.value) out.push({ q: `input ${e.name} (placeholder)`, fg: rgb(getComputedStyle(e, "::placeholder").color), bg, grande: false });
            continue;
          }
          if (!e.textContent.trim() || [...e.childNodes].every((n) => n.nodeType !== 3 || !n.textContent.trim())) continue;
          out.push({ q: `${e.tagName}${e.dataset.erro ? `[erro ${e.dataset.erro}]` : ""}${e.dataset.estado ? `[${e.dataset.estado}]` : ""} "${e.textContent.trim().slice(0, 24)}"`, fg: rgb(s.color), bg, grande });
        }
        return out;
      });
      let medidas = await medir();
      await p.fill("input[name=nome]", "Ana"); await p.fill("input[name=adultos]", "1"); await p.click("[data-enviar]");
      await p.waitForFunction(() => document.querySelector("[data-status]").dataset.estado === "erro");
      medidas = medidas.concat(await medir());
      assert.ok(medidas.some((m) => /erro (nome|total)/.test(m.q)), "mediu as mensagens de erro de campo");
      assert.ok(medidas.some((m) => /placeholder/.test(m.q)), "mediu os placeholders");
      assert.ok(medidas.some((m) => /Não conseguimos regist/.test(m.q)), "mediu a caixa de erro do envio");
      const ruins = medidas.map((m) => ({ ...m, r: contraste(m.fg, m.bg) })).filter((m) => m.r < (m.grande ? 3 : 4.5)).map((m) => `${m.q} ${m.r.toFixed(2)}`);
      assert.deepEqual([...new Set(ruins)], [], "abaixo do contraste AA");
      await fim();
    });
  }
}

test("conceito-1: servidor mudo → prazo de 15 s esgota → 'não conseguimos confirmar', sem sucesso", async () => {
  const { p, envios, fim } = await abrir(`${BASE}/conceito-1/`, { servidor: "mudo" });
  await preencher(p); const t0 = Date.now(); await p.click("[data-enviar]");
  await p.waitForFunction(() => document.querySelector("[data-status]").dataset.estado === "desconhecido", null, { timeout: 25000 });
  const dt = Date.now() - t0;
  assert.ok(dt >= 14000 && dt < 22000, `prazo aplicado (${dt} ms)`);
  assert.equal((await status(p)).texto, "Não conseguimos confirmar se sua presença foi registrada. Tente de novo.");
  assert.equal((await p.textContent("[data-alerta]")).trim(), "Não conseguimos confirmar se sua presença foi registrada. Tente de novo.");
  assert.doesNotMatch(await p.textContent("body"), /Presença registrada/);
  assert.equal(await p.isDisabled("[data-enviar]"), false); assert.equal(envios.length, 1);
  await fim();
});
