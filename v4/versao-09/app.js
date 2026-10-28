// Versão 09 — Balões da festa: toque estoura o balão, o bichinho abre o paraquedinha e pousa na placa com um recado.
import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

ligarRSVP(document.querySelector("form[data-rsvp]"), RSVP_ENDPOINT);

const reduz = matchMedia("(prefers-reduced-motion: reduce)");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const cena = $("[data-cena]");
const ceu = $("[data-ceu]");
const baloes = $$(".balao", ceu);
const vagas = $$("[data-vaga]");
const recados = $$("[data-recado]");
const contador = $("[data-contador]");
const anuncio = $("[data-anuncio]");
const dica = $("[data-dica] .dica-txt");
const final = $("[data-final]");
const convite = $("#convite");

const BICHOS = [
  { nome: "A vaquinha", recado: "Arthur faz 1 aninho!" },
  { nome: "O porquinho", recado: "Domingo, 29 de novembro de 2026." },
  { nome: "A ovelhinha", recado: "Às 15h." },
  { nome: "O cavalinho", recado: "Casa da Árvore, Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso." },
  { nome: "O pintinho", recado: "Venha caracterizado: country/fazendinha." },
];
const NOTAS = [523.25, 587.33, 659.25, 783.99, 880]; // dó ré mi sol lá: os 5 pousos formam uma melodia

vagas.forEach((v, n) => v.style.setProperty("--n", n));

/* ---------------- som (WebAudio, mudo até o 1º toque) ---------------- */
const botaoSom = $("[data-som]");
let ctx = null, mestre = null, somLigado = true;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    mestre = ctx.createGain();
    mestre.gain.value = somLigado ? 0.55 : 0;
    mestre.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function tom({ freq, freqFim, tipo = "sine", ini = 0, dur = 0.3, vol = 0.2, ataque = 0.008 }) {
  const a = audio(); if (!a || !somLigado) return;
  const t = a.currentTime + ini;
  const o = a.createOscillator(), g = a.createGain();
  o.type = tipo; o.frequency.setValueAtTime(freq, t);
  if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(mestre); o.start(t); o.stop(t + dur + 0.05);
}
let ruido = null;
function som(tipo, i = 0) {
  const a = audio(); if (!a || !somLigado) return;
  if (tipo === "pop") { // pop suave: sopro de ruído filtrado + "tum" descendo
    if (!ruido) {
      ruido = a.createBuffer(1, Math.floor(a.sampleRate * 0.12), a.sampleRate);
      const d = ruido.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / d.length, 3);
    }
    const s = a.createBufferSource(); s.buffer = ruido;
    const f = a.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1300; f.Q.value = 0.8;
    const g = a.createGain(); g.gain.value = 0.55;
    s.connect(f).connect(g).connect(mestre); s.start();
    tom({ freq: 420, freqFim: 110, dur: 0.09, vol: 0.32 });
  } else if (tipo === "abre") {
    tom({ freq: 260, freqFim: 620, tipo: "triangle", dur: 0.28, vol: 0.09, ataque: 0.06 });
  } else if (tipo === "pouso") {
    tom({ freq: NOTAS[i], tipo: "triangle", dur: 0.55, vol: 0.2 });
    tom({ freq: NOTAS[i] * 2, dur: 0.4, vol: 0.06 });
    tom({ freq: NOTAS[i] * 1.5, tipo: "triangle", ini: 0.11, dur: 0.45, vol: 0.12 });
  } else if (tipo === "festa") {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, k) => tom({ freq: f, tipo: "triangle", ini: k * 0.12, dur: 0.5, vol: 0.18 }));
    [523.25, 659.25, 783.99].forEach((f) => tom({ freq: f, tipo: "sine", ini: 0.5, dur: 1.2, vol: 0.1 }));
  }
}
botaoSom.addEventListener("click", () => {
  somLigado = !somLigado;
  botaoSom.setAttribute("aria-pressed", String(somLigado));
  audio();
  if (mestre) mestre.gain.setTargetAtTime(somLigado ? 0.55 : 0, ctx.currentTime, 0.02);
});
// destrava o áudio no primeiro gesto (fica mudo até lá)
const destrava = () => { audio(); removeEventListener("pointerdown", destrava); removeEventListener("keydown", destrava); };
addEventListener("pointerdown", destrava);
addEventListener("keydown", destrava);

/* ---------------- confete ---------------- */
function confete(opts) {
  if (reduz.matches || typeof window.confetti !== "function") return;
  window.confetti({ disableForReducedMotion: true, ticks: 160, gravity: 0.9, scalar: 0.9, ...opts });
}
function origemDe(el) {
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight };
}

/* ---------------- mecânica ---------------- */
let teclado = false, pousados = 0;
addEventListener("keydown", () => { teclado = true; }, true);
addEventListener("pointerdown", () => { teclado = false; }, true);

function estilhacos(btn) {
  const cor = getComputedStyle(btn).getPropertyValue("--cor");
  const svg = $("svg", btn).getBoundingClientRect(), base = ceu.getBoundingClientRect();
  const k = svg.width / 100;
  const cx = svg.left - base.left + 60 * k, cy = svg.top - base.top + 46 * k; // centro do balão
  const pop = document.createElement("span");
  pop.className = "pop-txt"; pop.textContent = "Pop!"; pop.setAttribute("aria-hidden", "true");
  pop.style.left = `${cx}px`; pop.style.top = `${cy}px`;
  ceu.append(pop);
  pop.animate([
    { transform: "translate(-50%,-50%) scale(.3) rotate(-12deg)", opacity: 0 },
    { transform: "translate(-50%,-60%) scale(1.15) rotate(-6deg)", opacity: 1, offset: 0.3 },
    { transform: "translate(-50%,-95%) scale(1) rotate(-4deg)", opacity: 0 },
  ], { duration: 750, easing: "ease-out" }).onfinish = () => pop.remove();
  for (let n = 0; n < 9; n++) {
    const c = document.createElement("span");
    c.className = "caco"; c.style.setProperty("--cor", cor);
    c.style.left = `${cx - 5}px`; c.style.top = `${cy - 4}px`;
    ceu.append(c);
    const ang = (n / 9) * Math.PI * 2 + Math.random() * 0.5, dist = 34 + Math.random() * 30;
    const rot = Math.random() * 540 - 270;
    c.animate([
      { transform: "translate(0,0) rotate(0) scale(1)", opacity: 1 },
      { transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist + 18}px) rotate(${rot}deg) scale(.6)`, opacity: 0 },
    ], { duration: 520 + Math.random() * 200, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => c.remove();
  }
}

function proximoBalao(atual) {
  const restantes = baloes.filter((b) => b !== atual && !b.classList.contains("estourado"));
  const depois = restantes.find((b) => baloes.indexOf(b) > baloes.indexOf(atual));
  return depois || restantes[0] || null;
}

function estourar(btn) {
  if (btn.classList.contains("estourado")) return;
  const i = Number(btn.dataset.i);
  cena.classList.add("jogou");
  som("pop");
  if (document.activeElement === btn) {
    const prox = proximoBalao(btn);
    // último balão: o foco espera na placa (onde os recados chegam) até o botão final aparecer
    (prox || $(".placa")).focus({ preventScroll: true });
  }
  btn.classList.add("estourado");
  btn.setAttribute("aria-hidden", "true");
  btn.tabIndex = -1;
  estilhacos(btn);

  if (reduz.matches) { btn.style.visibility = "hidden"; pousar(i); return; }

  // congela o balanço no ponto atual e mede a posição neutra
  const fl = $(".flutua", btn), svg = $("svg", btn), vaga = $("svg", vagas[i]);
  const m = getComputedStyle(fl).transform;
  fl.style.animation = "none";
  const rb = btn.getBoundingClientRect(), rs = svg.getBoundingClientRect(), rv = vaga.getBoundingClientRect();
  const k = rs.width / 100; // px por unidade do viewBox do balão
  // o bicho ocupa x 10–90, y 118–202 no viewBox; a vaga mostra o mesmo desenho 80×84
  const bx = rs.left + 50 * k, by = rs.top + 202 * k;
  const ox = bx - rb.left, oy = by - rb.top;
  const dx = rv.left + rv.width / 2 - bx, dy = rv.bottom - by;
  const s = rv.width / (80 * k);
  const h = (202 - 58) * k; // do pé do bicho até o topo do paraquedas (pivô do balanço)
  fl.style.transform = m === "none" ? "" : m;
  fl.getBoundingClientRect();
  fl.style.transition = "transform .45s ease-out";
  fl.style.transform = "none";

  btn.style.transformOrigin = `${ox}px ${oy}px`;
  setTimeout(() => { btn.classList.add("aberto"); som("abre"); }, 140);
  const T = (p, a, sc) => `translate(${dx * p}px,${dy * p}px) translate(0,${-h}px) rotate(${a}deg) translate(0,${h}px) scale(${sc})`;
  const S = (p) => 1 + (s - 1) * p;
  const voo = btn.animate([
    { transform: T(0, 0, 1) },
    { transform: T(-0.02, 0, 1), offset: 0.08 },
    { transform: T(0.16, -9, S(0.15)), offset: 0.24 },
    { transform: T(0.42, 8, S(0.4)), offset: 0.46 },
    { transform: T(0.68, -6, S(0.68)), offset: 0.68 },
    { transform: T(0.9, 3, S(0.9)), offset: 0.88 },
    { transform: T(1, 0, s) },
  ], { duration: 2700, delay: 180, easing: "cubic-bezier(.4,0,.6,1)", fill: "forwards" });
  voo.onfinish = () => {
    btn.classList.add("pousou");
    setTimeout(() => { btn.style.visibility = "hidden"; pousar(i); }, 200);
  };
}

function pousar(i) {
  vagas[i].classList.add("chegou");
  recados[i].classList.add("revelado");
  pousados += 1;
  contador.textContent = String(pousados);
  som("pouso", i);
  const cor = getComputedStyle(recados[i]).getPropertyValue("--cor").trim();
  confete({ particleCount: 26, spread: 70, startVelocity: 22, origin: origemDe(vagas[i]), colors: [cor, "#FFFFFF", "#FFD84D"] });
  anuncio.textContent = `${BICHOS[i].nome} trouxe o recado: ${BICHOS[i].recado}`;
  if (pousados === baloes.length) setTimeout(festa, 450);
}

function festa() {
  cena.classList.add("completa");
  dica.textContent = "Todos os recados chegaram!";
  final.hidden = false;
  som("festa");
  confete({ particleCount: 120, spread: 80, startVelocity: 45, angle: 60, origin: { x: 0, y: 0.75 } });
  confete({ particleCount: 120, spread: 80, startVelocity: 45, angle: 120, origin: { x: 1, y: 0.75 } });
  setTimeout(() => confete({ particleCount: 90, spread: 120, startVelocity: 30, origin: { x: 0.5, y: 0.35 }, colors: ["#FFC83D", "#FFE9A0", "#C2362F", "#4D9DE0", "#FF7EB6", "#9B7BEA"] }), 700);
  setTimeout(() => { anuncio.textContent = "Todos os recados chegaram! Viva o Arthur, 1 aninho!"; }, 900);
  if (teclado) setTimeout(() => $("[data-ver]").focus({ preventScroll: true }), 900);
}

baloes.forEach((b) => b.addEventListener("click", () => estourar(b)));

/* ---------------- pular / ver o convite ---------------- */
function irParaConvite() {
  convite.scrollIntoView({ behavior: reduz.matches ? "auto" : "smooth", block: "start" });
  convite.focus({ preventScroll: true });
}
$("[data-pular]").addEventListener("click", irParaConvite);
$("[data-ver]").addEventListener("click", irParaConvite);
