// Versão 08 — Bandinha do Arthur.
// Mecânica: qualquer bichinho tocado toca a PRÓXIMA nota da melodia de "Parabéns a você"
// (melodia de "Good Morning to All", 1893, domínio público — só a melodia; a "letra" aqui é o próprio convite).
// Cada nota canta um pedacinho do convite; cada verso completo revela um dado; no fim a banda toca tudo junta.
import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";
import * as som from "./som.js";

// ---------- RSVP (estrutura de ../comum/rsvp.html; endpoint null => "Confirmação ainda não ativada") ----------
const form = document.querySelector("[data-rsvp]");
if (form) ligarRSVP(form, RSVP_ENDPOINT);

// ---------- dados ----------
const reduz = window.matchMedia("(prefers-reduced-motion: reduce)");
const $ = (s) => document.querySelector(s);
const sorteia = (a) => a[Math.floor(Math.random() * a.length)];

function freq(nome) {
  const m = /^([A-G])(\d)$/.exec(nome);
  const midi = 12 * (Number(m[2]) + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}
const PASSO = { E4: 0, F4: 1, G4: 2, A4: 3, B4: 4, C5: 5, D5: 6, E5: 7, F5: 8, G5: 9 }; // degraus a partir da 1ª linha (Mi)

// Pedaços terminados em "-" ou "/" grudam no seguinte (sem espaço).
const VERSOS = [
  { notas: ["G4", "G4", "A4", "G4", "C5", "B4"], tempos: [0.75, 0.25, 1, 1, 1, 2],
    letra: ["Ar-", "thur,", "1", "a-", "ni-", "nho"], texto: "Arthur, 1 aninho", classe: "v-nome" },
  { notas: ["G4", "G4", "A4", "G4", "D5", "C5"], tempos: [0.75, 0.25, 1, 1, 1, 2],
    letra: ["Domingo,", "29", "de novembro", "de 2026,", "às", "15h"], texto: "Domingo, 29 de novembro de 2026, às 15h", classe: "v-quando" },
  { notas: ["G4", "G4", "G5", "E5", "C5", "B4", "A4"], tempos: [0.75, 0.25, 1, 1, 1, 1, 1],
    letra: ["Casa da Árvore —", "Rua Castelo", "Branco,", "nº 31,", "Cidade Nova,", "Santana do", "Paraíso"],
    texto: "Casa da Árvore — Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso", classe: "v-onde" },
  { notas: ["F5", "F5", "E5", "C5", "D5", "C5"], tempos: [0.75, 0.25, 1, 1, 1, 3],
    letra: ["Venha", "caracte-", "rizado:", "country/", "fazen-", "dinha"], texto: "Venha caracterizado: country/fazendinha", classe: "v-traje" },
];
const INSTR = { vaca: "tambor", porco: "xilofone", ovelha: "sanfona", pintinho: "flauta", cavalo: "violao" };
const DUR = { sanfona: 0.38, flauta: 0.36 };

// Final em valsa (3/4): acordes por compasso, baixo no tambor, violão no 1º tempo, sanfona no 2º e 3º.
const BPM = 132;
const ACORDES = [["C"], ["G7"], ["G7"], ["C"], ["C"], ["F"], ["C", "G7"], ["C"]];
const ACORDE = {
  C: { baixo: "C3", mao: ["E4", "G4", "C5"], violao: ["C3", "G3", "C4", "E4", "G4"] },
  G7: { baixo: "G2", mao: ["D4", "F4", "B4"], violao: ["G2", "B2", "D3", "F3", "B3"] },
  F: { baixo: "F2", mao: ["C4", "F4", "A4"], violao: ["F2", "C3", "F3", "A3", "C4"] },
};
const MELODIA = [["porco"], ["pintinho"], ["porco", "pintinho"], ["porco", "pintinho", "ovelha"]];
const PALETA = ["#ff5f93", "#ffb000", "#3d8fd6", "#e5533d", "#d9822b"];
const CORES_CONFETE = ["#e5533d", "#ffc93c", "#3d8fd6", "#ff8fb0", "#fffdf6", "#f2a14a"];

// ---------- elementos ----------
const el = {
  notas: $("#notas"), pauta: $("#pauta"), letra: $("#letra"), versoN: $("#verso-n"), partitura: $("#partitura"),
  selos: [...document.querySelectorAll(".selo")], anuncio: $("#anuncio"), dica: $("#dica"), palco: $("#palco"),
  finalAcoes: $("#final-acoes"), instrucao: $("#instrucao"), bichos: [...document.querySelectorAll(".banda .bicho")],
};
const bicho = Object.fromEntries(el.bichos.map((b) => [b.dataset.bicho, b]));
const COR = Object.fromEntries(el.bichos.map((b) => [b.dataset.bicho, b.dataset.cor]));

const st = { verso: 0, nota: 0, cores: [], fase: "jogo", concluido: false, versoFinal: -1, timers: [] };

function agenda(fn, ms) {
  const id = setTimeout(() => { st.timers = st.timers.filter((x) => x !== id); fn(); }, ms);
  st.timers.push(id);
}
function limparAgenda() { st.timers.forEach(clearTimeout); st.timers = []; }

// ---------- pauta + letra ----------
const xNota = (i, n) => 62 + i * (262 / (n - 1));
const yNota = (nome) => 66 - PASSO[nome] * 5;

function desenharVerso({ todas = st.concluido } = {}) {
  const V = VERSOS[st.verso], n = V.notas.length;
  el.notas.innerHTML = V.notas.map((nome, i) => {
    const x = +xNota(i, n).toFixed(1), y = yNota(nome), sobe = PASSO[nome] < 4;
    const haste = sobe ? `M${x + 6.6} ${y - 1} V${y - 30}` : `M${x - 6.6} ${y + 1} V${y + 30}`;
    return `<g class="nota"><circle class="halo" cx="${x}" cy="${y}" r="13"/><path class="haste" d="${haste}"/>` +
      `<g class="cab"><ellipse cx="${x}" cy="${y}" rx="7.4" ry="5.4" transform="rotate(-20 ${x} ${y})"/></g></g>`;
  }).join("");
  st.cores.forEach((c, i) => c && pintarNota(i, c));
  marcarProxima();
  el.pauta.classList.toggle("ultimo", st.verso === 3);

  el.letra.className = `letra ${V.classe}`;
  const linha = document.createElement("span");
  linha.className = "linha";
  let palavra = null; // pedaços colados ("Ar-thur", "country/fazendinha") ficam num bloco que não quebra
  V.letra.forEach((pedaco, i) => {
    const s = document.createElement("span");
    s.className = "silaba";
    s.style.setProperty("--i", i);
    s.textContent = pedaco.endsWith("-") ? pedaco.slice(0, -1) : pedaco;
    if (todas || st.cores[i]) s.classList.add("vista");
    if (todas) novo(s);
    const cola = /[-/]$/.test(pedaco);
    if (cola && !palavra) { palavra = document.createElement("span"); palavra.className = "palavra"; linha.append(palavra); }
    (palavra || linha).append(s);
    if (!cola) { palavra = null; if (i < V.letra.length - 1) linha.append(" "); }
  });
  el.letra.replaceChildren(linha);
  if (st.fase !== "final") el.versoN.textContent = `Verso ${st.verso + 1} de 4`;
}

function pintarNota(i, cor) {
  const g = el.notas.children[i];
  if (!g) return;
  g.style.setProperty("--c", cor);
  g.classList.remove("proxima");
  g.classList.add("tocada");
}
function marcarProxima() {
  [...el.notas.children].forEach((g, i) => g.classList.toggle("proxima", st.fase !== "final" && i === st.nota && !st.cores[i]));
}
function novo(s) { // animação de entrada só uma vez (não reinicia quando outra classe sai)
  s.classList.add("nova");
  s.addEventListener("animationend", () => s.classList.remove("nova"), { once: true });
}
function cantar(i) {
  el.letra.querySelectorAll(".soando").forEach((s) => s.classList.remove("soando"));
  const s = el.letra.querySelectorAll(".silaba")[i];
  if (!s) return;
  if (!s.classList.contains("vista")) novo(s);
  s.classList.add("vista", "soando");
}

function trocarPara(v) {
  el.partitura.classList.add("virando");
  setTimeout(() => {
    st.verso = v; st.nota = 0; st.cores = [];
    desenharVerso();
    el.partitura.classList.remove("virando");
    st.fase = st.concluido ? "livre" : "jogo";
    marcarProxima();
  }, reduz.matches ? 0 : 230);
}

// ---------- efeitos ----------
function animar(b, leve = false) {
  if (!b) return;
  b.classList.remove("toca", "toca-leve");
  void b.getBoundingClientRect();
  b.classList.add(leve ? "toca-leve" : "toca");
  b.classList.add("feliz");
  clearTimeout(b._feliz);
  b._feliz = setTimeout(() => b.classList.remove("feliz"), 650);
}
function notinha(b, cor) {
  if (reduz.matches || !b) return;
  const s = document.createElement("span");
  s.className = "nota-voa";
  s.innerHTML = '<svg viewBox="0 0 24 32" aria-hidden="true" focusable="false"><use href="#i-nota"/></svg>';
  s.style.left = `${b.offsetLeft + b.offsetWidth * (0.3 + Math.random() * 0.4)}px`;
  s.style.top = `${b.offsetTop + b.offsetHeight * 0.12}px`;
  s.style.color = cor;
  s.style.setProperty("--dx", `${Math.round(Math.random() * 70 - 35)}px`);
  s.style.setProperty("--rot", `${Math.round(Math.random() * 50 - 25)}deg`);
  el.palco.append(s);
  s.addEventListener("animationend", () => s.remove());
}
function confete(o) {
  if (reduz.matches || typeof window.confetti !== "function") return;
  window.confetti({ disableForReducedMotion: true, colors: CORES_CONFETE, zIndex: 40, ...o });
}
function confeteCartao() {
  const r = el.partitura.getBoundingClientRect();
  confete({ particleCount: 46, spread: 80, startVelocity: 30, scalar: 0.8, ticks: 140,
    origin: { x: (r.left + r.width / 2) / innerWidth, y: Math.min(0.95, Math.max(0.05, (r.top + r.height * 0.7) / innerHeight)) } });
}
function confeteGrande() {
  confete({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.75 } });
  confete({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.75 } });
  setTimeout(() => confete({ particleCount: 110, spread: 120, startVelocity: 38, origin: { x: 0.5, y: 0.35 } }), 260);
}
function festejar() {
  el.partitura.classList.remove("festeja");
  el.letra.classList.remove("completa");
  void el.partitura.offsetWidth;
  el.partitura.classList.add("festeja");
  el.letra.classList.add("completa");
  setTimeout(() => el.letra.classList.remove("completa"), 1000);
}
function anunciar(t) {
  el.anuncio.textContent = "";
  setTimeout(() => { el.anuncio.textContent = t; }, 60);
}

// ---------- dica ----------
let ocio;
function posicionarDica(nome) {
  const b = bicho[nome];
  if (!b) return;
  el.dica.style.left = `${b.offsetLeft + b.offsetWidth / 2}px`;
  el.dica.style.top = `${b.offsetTop + b.offsetHeight * 0.08}px`;
  el.dica.dataset.alvo = nome;
}
function esconderDica() { el.dica.classList.add("escondida"); }
function vigiarOcio() {
  clearTimeout(ocio);
  ocio = setTimeout(() => {
    if (st.fase !== "jogo") return;
    posicionarDica(sorteia(Object.keys(bicho)));
    el.dica.classList.remove("escondida");
  }, 7000);
}

// ---------- jogo ----------
function tocarBicho(b) {
  som.preparar();
  const nome = b.dataset.bicho, cor = COR[nome], instr = INSTR[nome];
  animar(b);
  notinha(b, cor);
  esconderDica();
  vigiarOcio();
  if (st.fase === "final" || st.fase === "transicao") {
    som.tocar(instr, freq(sorteia(["C5", "E5", "G5", "E4", "G4"])), { v: 0.5, dur: DUR[instr] });
    return;
  }
  if (st.nota >= VERSOS[st.verso].notas.length) { // modo livre: começa o próximo verso
    st.verso = (st.verso + 1) % 4; st.nota = 0; st.cores = [];
    desenharVerso();
  }
  const V = VERSOS[st.verso], i = st.nota;
  som.tocar(instr, freq(V.notas[i]), { dur: DUR[instr] });
  st.cores[i] = cor;
  pintarNota(i, cor);
  cantar(i);
  st.nota++;
  marcarProxima();
  if (st.nota >= V.notas.length) completarVerso();
}

function completarVerso() {
  const v = st.verso, V = VERSOS[v];
  som.tcharam(som.agora() + 0.3, st.concluido ? 0.45 : 0.75);
  festejar();
  if (st.concluido) return; // modo livre: só comemora
  st.fase = "transicao";
  el.selos[v].classList.add("ligado");
  anunciar(`Verso ${v + 1} de 4: ${V.texto}.`);
  confeteCartao();
  if (v === 3) { agenda(iniciarFinal, 1500); return; }
  agenda(() => trocarPara(v + 1), 1400);
}

function iniciarFinal() {
  limparAgenda();
  st.fase = "final"; st.versoFinal = -1;
  el.finalAcoes.hidden = true;
  el.versoN.textContent = "A banda toda junta!";
  anunciar("A banda toda vai tocar a música inteira.");
  som.preparar();
  const b = 60 / BPM, atraso = 0.4, T0 = som.agora() + atraso;
  let t = 0;
  VERSOS.forEach((V, v) => V.notas.forEach((nome, i) => {
    const quem = MELODIA[v], dur = V.tempos[i] * b, tt = t;
    quem.forEach((q) => som.tocar(INSTR[q], freq(nome), { t: T0 + tt * b, v: q === "ovelha" ? 0.45 : 0.8, dur: Math.min(dur * 0.9, 1.3) }));
    agenda(() => passoFinal(v, i, quem), (atraso + tt * b) * 1000);
    t += V.tempos[i];
  }));
  ACORDES.forEach((acs, k) => {
    const ini = 1 + 3 * k, A = ACORDE[acs[0]], ms = (x) => (atraso + x * b) * 1000;
    som.tocar("tambor", freq(A.baixo), { t: T0 + ini * b, v: 0.9 });
    som.dedilhar(A.violao.map(freq), T0 + ini * b, 0.4);
    agenda(() => { animar(bicho.vaca, true); animar(bicho.cavalo, true); }, ms(ini));
    if (k === 7) {
      A.mao.forEach((n) => som.tocar("sanfona", freq(n), { t: T0 + ini * b, v: 0.4, dur: b * 2.6 }));
      agenda(() => animar(bicho.ovelha, true), ms(ini));
      return;
    }
    [1, 2].forEach((d) => {
      const Ad = ACORDE[d === 2 && acs[1] ? acs[1] : acs[0]];
      Ad.mao.forEach((n) => som.tocar("sanfona", freq(n), { t: T0 + (ini + d) * b, v: 0.3, dur: b * 0.5 }));
      agenda(() => animar(bicho.ovelha, true), ms(ini + d));
    });
  });
  agenda(() => fimFinal(true), (atraso + 25 * b) * 1000);
}

function passoFinal(v, i, quem) {
  if (st.versoFinal !== v) {
    st.versoFinal = v; st.verso = v; st.nota = 0;
    st.cores = VERSOS[v].notas.map((_, j) => PALETA[(j + v) % PALETA.length]);
    desenharVerso({ todas: true });
  }
  el.notas.querySelectorAll(".soando").forEach((g) => g.classList.remove("soando"));
  el.notas.children[i]?.classList.add("soando");
  cantar(i);
  quem.forEach((q) => { animar(bicho[q]); notinha(bicho[q], COR[q]); });
}

function fimFinal(comFesta) {
  limparAgenda();
  st.fase = "livre"; st.concluido = true;
  if (st.versoFinal === -1) { st.verso = 3; st.cores = VERSOS[3].notas.map((_, j) => PALETA[(j + 3) % PALETA.length]); desenharVerso({ todas: true }); }
  st.nota = VERSOS[st.verso].notas.length; // o próximo toque recomeça a música
  el.notas.querySelectorAll(".soando").forEach((g) => g.classList.remove("soando"));
  el.letra.querySelectorAll(".soando").forEach((s) => s.classList.remove("soando"));
  el.letra.querySelectorAll(".silaba").forEach((s) => s.classList.add("vista"));
  marcarProxima();
  el.versoN.textContent = "Convite completo!";
  el.selos.forEach((s) => s.classList.add("ligado"));
  el.finalAcoes.hidden = false;
  el.instrucao.textContent = "Agora é só tocar à vontade! O convite completo está logo abaixo.";
  if (comFesta) {
    som.tcharam();
    confeteGrande();
    festejar();
    anunciar("A banda tocou o convite inteiro! Use o botão Ver o convite completo para ver data, local e confirmação.");
  }
}

// ---------- navegação ----------
function irParaConvite(e) {
  e?.preventDefault();
  if (st.fase === "final") { som.silenciar(); fimFinal(false); }
  document.getElementById("convite").scrollIntoView({ behavior: reduz.matches ? "auto" : "smooth", block: "start" });
  document.getElementById("convite-titulo").focus({ preventScroll: true });
}
$("#btn-pular").addEventListener("click", irParaConvite);
$("#btn-ver").addEventListener("click", irParaConvite);
$("#btn-bis").addEventListener("click", () => { if (st.fase !== "final") { som.preparar(); iniciarFinal(); } });

// ---------- som ----------
const btnSom = $("#btn-som");
btnSom.addEventListener("click", () => {
  const ligado = som.alternar();
  if (ligado) som.preparar();
  btnSom.setAttribute("aria-pressed", String(ligado));
  btnSom.setAttribute("aria-label", ligado ? "Som ligado. Toque para desligar" : "Som desligado. Toque para ligar");
});
// Navegadores só liberam áudio após gesto: tenta preparar em qualquer gesto (o 1º toque num bicho já soa).
["pointerdown", "pointerup", "touchend", "keydown"].forEach((ev) =>
  document.addEventListener(ev, () => { if (som.estaLigado()) som.preparar(); }, { capture: true, passive: true }));

// ---------- bichinhos ----------
el.bichos.forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    b._pd = performance.now();
    tocarBicho(b);
  });
  b.addEventListener("click", () => {
    if (b._pd && performance.now() - b._pd < 2000) { b._pd = 0; return; } // já tocou no pointerdown
    b._pd = 0;
    tocarBicho(b); // teclado (Enter/Espaço) ou leitor de tela
  });
  b.addEventListener("contextmenu", (e) => e.preventDefault());
});

// ---------- início ----------
desenharVerso();
posicionarDica("vaca");
window.addEventListener("resize", () => posicionarDica(el.dica.dataset.alvo || "vaca"));
