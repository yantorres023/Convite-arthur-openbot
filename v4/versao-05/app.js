import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

ligarRSVP(document.querySelector("[data-rsvp]"), RSVP_ENDPOINT);

const $ = (s, r = document) => r.querySelector(s);
const cena = $("[data-cena]");
const regador = $("[data-regador]");
const balao = $("[data-balao]");
const coelho = $("[data-coelho]");
const contador = $("[data-contador]");
const progresso = $("[data-progresso]");
const botaoVer = $("[data-ver]");
const botaoSom = $("[data-som]");
const canteiros = [...document.querySelectorAll("[data-canteiro]")];
const reduzido = matchMedia("(prefers-reduced-motion: reduce)");

const FALAS = {
  girassol: "Brotou um girassol! É o Arthur, 1 aninho!",
  cenouras: "Cenourinhas! Domingo, 29/11, às 15h.",
  abobora: "Que abóbora! A festa é na Casa da Árvore.",
  fim: "Venha caracterizado: country/fazendinha!",
};
const ROTULOS = {
  girassol: "Girassol: Arthur, 1 aninho",
  cenouras: "Cenouras: domingo, 29 de novembro, às 15h",
  abobora: "Abóbora: Casa da Árvore",
};

/* ---------------- som (WebAudio, só depois do 1º toque) ---------------- */
let ac = null;
let somLigado = true;
function audio() {
  if (!somLigado) return null;
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
  }
  if (ac.state === "suspended") ac.resume();
  return ac;
}
function tom(freq, quando = 0, dur = 0.18, tipo = "sine", vol = 0.12, freqFim) {
  const c = audio(); if (!c) return;
  const t = c.currentTime + quando;
  const o = c.createOscillator(), g = c.createGain();
  o.type = tipo; o.frequency.setValueAtTime(freq, t);
  if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
}
function somAgua() {
  const c = audio(); if (!c) return;
  const dur = 0.9, buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.08 ? 1 : 0.25);
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 2600; f.Q.value = 0.9;
  const g = c.createGain(), t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(c.destination); src.start(t);
  [0.1, 0.32, 0.55].forEach((q, i) => tom(900 + i * 180, q, 0.09, "sine", 0.05, 1500 + i * 200));
}
function somBrotar(i) {
  tom(260, 0, 0.35, "triangle", 0.14, 780);
  const base = [523.25, 587.33, 659.25][i] || 523.25;
  [1, 1.25, 1.5, 2].forEach((m, k) => tom(base * m, 0.32 + k * 0.08, 0.22, "sine", 0.09));
}
function somFim() {
  [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, k) => tom(f, k * 0.13, 0.3, "triangle", 0.11));
}
function somPulo() { tom(330, 0, 0.25, "sine", 0.13, 880); }

botaoSom.addEventListener("click", () => {
  somLigado = !somLigado;
  botaoSom.setAttribute("aria-pressed", String(somLigado));
  botaoSom.setAttribute("aria-label", somLigado ? "Som ligado (toque para desligar)" : "Som desligado (toque para ligar)");
  if (!somLigado && ac) ac.suspend(); else tom(660, 0, 0.12, "sine", 0.08);
});

/* ---------------- confete ---------------- */
const CORES = ["#FFC928", "#FF8A2A", "#E2452F", "#5AB0EA", "#FFFFFF", "#8ED081"];
function confete(opts) {
  if (reduzido.matches || typeof window.confetti !== "function") return;
  window.confetti({ disableForReducedMotion: true, colors: CORES, zIndex: 40, ...opts });
}

/* ---------------- fala do coelho ---------------- */
function falar(texto) {
  balao.textContent = texto;
  balao.classList.remove("troca"); void balao.offsetWidth; balao.classList.add("troca");
}
function pular() {
  coelho.classList.remove("pula"); void coelho.offsetWidth; coelho.classList.add("pula");
}
coelho.addEventListener("click", () => { pular(); somPulo(); });

/* ---------------- regador ---------------- */
let pos = { x: 0, y: 0 };
function posicaoDescanso() {
  const rc = cena.getBoundingClientRect();
  const ceu = $(".ceu").getBoundingClientRect();
  const horta = $(".horta").getBoundingClientRect();
  // nunca em cima do balão nem do coelho: fica abaixo da conversa, centralizado no espaço livre até a horta
  const h = regador.offsetHeight || 94, w = regador.offsetWidth || 112;
  const conversaFim = Math.max(coelho.getBoundingClientRect().bottom, balao.getBoundingClientRect().bottom) - rc.top + 10;
  const hortaTopo = horta.top - rc.top + 30;
  const y = Math.max(Math.round((conversaFim + hortaTopo) / 2 - h / 2), conversaFim);
  const x = Math.round(rc.width / 2 - w / 2 + 14);
  return { x, y };
}
function colocar(p) { pos = p; regador.style.transform = `translate(${p.x}px, ${p.y}px)`; }
function moverPara(p, dur = 650) {
  const antes = pos;
  const de = `translate(${antes.x}px, ${antes.y}px)`, para = `translate(${p.x}px, ${p.y}px)`;
  pos = p;
  if (reduzido.matches) { regador.style.transform = para; return Promise.resolve(); }
  const meio = `translate(${(antes.x + p.x) / 2}px, ${Math.min(antes.y, p.y) - 40}px)`;
  const a = regador.animate(
    [{ transform: de }, { transform: meio, offset: 0.5 }, { transform: para }],
    { duration: dur, easing: "cubic-bezier(.45,.05,.35,1)" });
  regador.style.transform = para;
  return a.finished.catch(() => {});
}
const espera = (ms) => new Promise((r) => setTimeout(r, reduzido.matches ? 0 : ms));

function chuva(alvo) {
  if (reduzido.matches) return;
  const rc = cena.getBoundingClientRect();
  const r = alvo.getBoundingClientRect();
  const bico = { x: pos.x + 10, y: pos.y + 58 };
  const chao = r.bottom - rc.top - 30;
  for (let k = 0; k < 16; k++) {
    const g = document.createElement("span");
    g.className = "gota";
    cena.appendChild(g);
    const dx = (Math.random() - 0.5) * 34;
    const destinoX = r.left - rc.left + r.width / 2 + (Math.random() - 0.5) * r.width * 0.6;
    g.animate([
      { transform: `translate(${bico.x + dx * 0.2}px, ${bico.y}px) scale(.6)`, opacity: 0 },
      { opacity: 1, offset: 0.1 },
      { transform: `translate(${destinoX}px, ${chao}px) scale(1)`, opacity: 0.9, offset: 0.92 },
      { transform: `translate(${destinoX}px, ${chao + 6}px) scale(1.6, .3)`, opacity: 0 },
    ], { duration: 640 + Math.random() * 260, delay: k * 55, fill: "backwards", easing: "cubic-bezier(.5,0,.9,.6)" }).finished.then(() => g.remove(), () => g.remove());
  }
}

/* ---------------- regar ---------------- */
let ocupado = false;
let brotados = 0;
const total = canteiros.length;

function brotar(btn, i, silencioso = false) {
  btn.classList.add("brotou");
  const planta = btn.dataset.planta;
  btn.setAttribute("aria-label", ROTULOS[planta]);
  brotados = canteiros.filter((c) => c.classList.contains("brotou")).length;
  contador.textContent = brotados;
  if (silencioso) return;
  somBrotar(i);
  falar(FALAS[planta]); pular();
  const rc = btn.getBoundingClientRect();
  setTimeout(() => confete({
    particleCount: 26, spread: 70, startVelocity: 24, scalar: 0.8, ticks: 120, shapes: ["star", "circle"],
    origin: { x: (rc.left + rc.width / 2) / innerWidth, y: Math.max(0.1, (rc.top + rc.height * 0.3) / innerHeight) },
  }), 650);
}

function concluir(silencioso = false) {
  cena.classList.add("completa");
  progresso.hidden = true; botaoVer.hidden = false;
  if (silencioso) { balao.textContent = FALAS.fim; return; }
  setTimeout(() => {
    falar(FALAS.fim); pular(); somFim();
    confete({ particleCount: 120, spread: 100, startVelocity: 40, origin: { x: 0.5, y: 0.45 } });
    setTimeout(() => {
      confete({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
      confete({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    }, 350);
  }, reduzido.matches ? 0 : 1500);
}

async function regar(btn) {
  const i = Number(btn.dataset.canteiro);
  if (btn.classList.contains("brotou")) {
    btn.classList.remove("mexe"); void btn.offsetWidth; btn.classList.add("mexe"); somPulo();
    return;
  }
  if (ocupado) return;
  ocupado = true;
  audio();
  const rc = cena.getBoundingClientRect(), r = btn.getBoundingClientRect();
  const largura = regador.offsetWidth;
  const alvo = {
    x: Math.min(Math.max(r.left - rc.left + r.width / 2 - 14, 4), rc.width - largura - 4),
    y: Math.max(r.top - rc.top - 30, 60),
  };
  regador.classList.remove("balanca");
  await moverPara(alvo);
  regador.classList.add("rega");
  somAgua(); chuva(btn);
  await espera(1050);
  regador.classList.remove("rega");
  brotar(btn, i);
  await espera(250);
  if (brotados === total) {
    await moverPara(posicaoDescanso(), 700);
    regador.classList.add("balanca");
    concluir();
  } else {
    moverPara(posicaoDescanso(), 700).then(() => regador.classList.add("balanca"));
  }
  ocupado = false;
}
canteiros.forEach((b) => b.addEventListener("click", () => regar(b)));

/* ---------------- pular / ver convite ---------------- */
function irParaConvite(ev) {
  ev?.preventDefault();
  if (brotados < total) {
    canteiros.forEach((b, i) => { if (!b.classList.contains("brotou")) brotar(b, i, true); });
    concluir(true);
  }
  const h = $("#titulo-convite");
  $("#convite").scrollIntoView({ behavior: reduzido.matches ? "auto" : "smooth", block: "start" });
  h.focus({ preventScroll: true });
}
$("[data-pular]").addEventListener("click", irParaConvite);
botaoVer.addEventListener("click", irParaConvite);

/* o botão "Pular" some quando o convite já está à vista */
const obs = new IntersectionObserver(([e]) => document.body.classList.toggle("no-convite", e.isIntersecting), { threshold: 0.12 });
obs.observe($("#convite"));

/* posição inicial do regador */
function iniciar() { colocar(posicaoDescanso()); regador.classList.add("balanca"); }
iniciar();
addEventListener("resize", () => { if (!ocupado) colocar(posicaoDescanso()); });
if (document.fonts?.ready) document.fonts.ready.then(() => { if (!ocupado) colocar(posicaoDescanso()); });
