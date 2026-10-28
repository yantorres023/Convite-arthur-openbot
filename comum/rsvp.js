// RSVP do convite do Arthur — comum às páginas. Grava a confirmação numa planilha privada do Yan por um endpoint
// configurado FORA do repositório (comum/rsvp-config.local.js, no .gitignore). Contrato: convite-arthur/INTEGRACAO-PLANILHA.md.
// Sem endpoint configurado: "Confirmação ainda não ativada" — nunca simula sucesso.
// "Presença registrada!" só aparece com a resposta {ok:true} do servidor (gravado e conferido).
export const LIMITE = 20;
export const PRAZO_MS = 15_000;

/** Valida os campos. Devolve { ok, erros: {nome?, adultos?, criancas?, total?}, dados }. */
export function validar({ nome, adultos, criancas }) {
  const erros = {};
  const n = String(nome ?? "").trim().replace(/\s+/g, " ");
  if (n.length < 2) erros.nome = "Informe seu nome.";
  else if (n.length > 80) erros.nome = "Use no máximo 80 caracteres.";
  const num = (v, campo, rotulo) => {
    const s = String(v ?? "").trim() || "0"; // vazio = 0 (os zeros do design são estado vazio, não resposta)
    if (!/^\d{1,2}$/.test(s) || Number(s) > LIMITE) { erros[campo] = `Use um número inteiro de 0 a ${LIMITE}.`; return null; }
    return Number(s);
  };
  const a = num(adultos, "adultos", "Adultos");
  const c = num(criancas, "criancas", "Crianças");
  if (a != null && c != null && a + c === 0) erros.total = "Informe pelo menos 1 convidado.";
  return { ok: Object.keys(erros).length === 0, erros, dados: { nome: n, adultos: a, criancas: c } };
}

/** Corpo da requisição (contrato do Rocky). `website` é o honeypot: vazio para pessoas. */
export function corpo(dados, website = "") {
  return JSON.stringify({ nome: dados.nome, adultos: dados.adultos, criancas: dados.criancas, website: String(website || "") });
}

// Textos dos estados (design v2 da Deidara + contrato do Rocky).
export const MSG = {
  inativo: "Confirmação ainda não ativada.",
  enviando: "Registrando sua presença… Aguarde a confirmação.",
  sucesso: "Presença registrada!",
  sucessoDetalhe: "Confirmação recebida.",
  erro: "Não conseguimos registrar agora; tente de novo",
  limite: "Muitas confirmações agora; tente de novo em alguns minutos.",
  desconhecido: "Não conseguimos confirmar se sua presença foi registrada. Tente de novo.",
  revisar: "Revise os campos indicados.",
};

/**
 * Envia e interpreta a resposta. Devolve { estado: "sucesso"|"validacao"|"limite"|"erro"|"desconhecido", campos? }.
 * Só "sucesso" com HTTP 200 + JSON {ok:true}. Rede fora ou prazo esgotado = "desconhecido" (pode ter gravado).
 */
export async function enviar(endpoint, dados, website = "", { prazoMs = PRAZO_MS, fetchFn = fetch } = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), prazoMs);
  let r, texto, j = null;
  try {
    // text/plain evita o preflight de CORS do Apps Script; o corpo é JSON.
    r = await fetchFn(endpoint, { method: "POST", headers: { "content-type": "text/plain;charset=utf-8" }, body: corpo(dados, website), signal: ac.signal, credentials: "omit", redirect: "follow" });
    // Ler o corpo também é transporte: cabeçalhos chegaram mas o corpo travou/caiu até o prazo → resultado desconhecido.
    texto = await r.text();
  } catch { return { estado: "desconhecido" }; }
  finally { clearTimeout(t); }
  try { j = JSON.parse(texto); } catch { j = null; } // corpo completo mas não é JSON → erro (não desconhecido)
  if (r.ok && j && j.ok === true) return { estado: "sucesso" };
  if (j && j.ok === false && j.erro === "validacao") return { estado: "validacao", campos: j.campos || {} };
  if (j && j.ok === false && j.erro === "limite") return { estado: "limite" };
  if (r.status === 429) return { estado: "limite" };
  return { estado: "erro" };
}

/**
 * Liga o formulário (comum/rsvp.html). Estados (design v2): inicial → enviando → sucesso | erro; inválido.
 * - Sem JavaScript: campos desabilitados e nenhum botão de envio nativo (nada vai para a URL).
 * - Sem endpoint: "Confirmação ainda não ativada"; nada é enviado; nunca simula sucesso.
 * - Enviando: botão "Enviando…" desabilitado, campos só leitura, aria-busy (duplo clique = 1 envio).
 * - Sucesso SÓ com {ok:true}: "Presença registrada!" (role=status), botão "Confirmado", campos só leitura.
 * - Erro/limite/desconhecido: caixa role=alert; dados mantidos; botão volta para nova tentativa.
 * - Inválido: erro junto ao campo, aria-invalid, foco no primeiro inválido; badInput ("e" num número) é erro.
 */
export function ligarRSVP(form, endpoint) {
  const $ = (sel) => form.querySelector(sel);
  const status = $("[data-status]"), botao = $("[data-enviar]"), campos = $("[data-rsvp-campos]");
  const nota = $("[data-nota]"), notaOriginal = nota.innerHTML, sucesso = $("[data-sucesso]"), alerta = $("[data-alerta]"), geral = $("[data-erro=total]");
  const isca = form.elements.website;
  const nomes = ["nome", "adultos", "criancas"];
  const inputs = nomes.map((k) => form.elements[k]);
  const estado = (e, texto = "") => { status.dataset.estado = e; status.textContent = texto; form.dataset.estado = e; };
  const somenteLeitura = (sim) => inputs.forEach((i) => { i.readOnly = sim; });
  const limparCaixas = () => { sucesso.hidden = true; sucesso.replaceChildren(); alerta.hidden = true; alerta.textContent = ""; };
  $("[data-sem-js]").hidden = true;
  if (!endpoint) { // tudo continua desabilitado; o aviso vai ACIMA do botão
    estado("inativo", MSG.inativo); nota.textContent = MSG.inativo; botao.before(nota); form.classList.add("inativo"); return;
  }
  campos.disabled = false;
  let enviando = false, concluido = false;
  const marcarErros = (erros) => {
    for (const k of nomes) {
      $(`[data-erro=${k}]`).textContent = erros[k] || "";
      form.elements[k].setAttribute("aria-invalid", erros[k] ? "true" : "false");
    }
    const algum = nomes.some((k) => erros[k]) || erros.total;
    geral.replaceChildren(...(algum ? [MSG.revisar, ...(erros.total ? [erros.total] : [])].map((t) => Object.assign(document.createElement("p"), { textContent: t })) : []));
    const primeiro = nomes.find((k) => erros[k]);
    if (primeiro) form.elements[primeiro].focus(); else if (erros.total) form.elements.adultos.focus();
    return algum;
  };
  const valor = (k) => { const el = form.elements[k]; return el.validity?.badInput ? "inválido" : el.value; };
  const confirmar = async () => {
    if (enviando || concluido) return;
    limparCaixas();
    const v = validar(Object.fromEntries(nomes.map((k) => [k, valor(k)])));
    if (marcarErros(v.erros) || !v.ok) { estado("invalido", MSG.revisar); return; }
    enviando = true; botao.disabled = true; botao.textContent = "Enviando…"; form.setAttribute("aria-busy", "true");
    somenteLeitura(true); nota.textContent = MSG.enviando; estado("enviando", MSG.enviando);
    const r = await enviar(endpoint, v.dados, isca?.value);
    enviando = false; form.removeAttribute("aria-busy");
    if (r.estado === "sucesso") {
      concluido = true; botao.textContent = "Confirmado"; botao.classList.add("confirmado"); nota.hidden = true;
      const t = document.createElement("strong"); t.textContent = MSG.sucesso;
      const d = document.createElement("p"); d.textContent = MSG.sucessoDetalhe;
      sucesso.replaceChildren(t, d); sucesso.hidden = false; estado("sucesso", MSG.sucesso);
      return;
    }
    somenteLeitura(false); botao.disabled = false; botao.textContent = "Confirmar presença"; nota.innerHTML = notaOriginal;
    if (r.estado === "validacao") marcarErros(r.campos);
    const texto = r.estado === "limite" ? MSG.limite : r.estado === "desconhecido" ? MSG.desconhecido : MSG.erro;
    alerta.textContent = texto; alerta.hidden = false;
    estado(r.estado === "desconhecido" ? "desconhecido" : "erro", texto);
  };
  botao.addEventListener("click", confirmar);
  form.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && ev.target.tagName === "INPUT") { ev.preventDefault(); confirmar(); } });
  form.addEventListener("submit", (ev) => ev.preventDefault());
}
