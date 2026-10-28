// Versão 07 — Pop-up de cartolina. Puxe a lingueta (ou toque na cena) e as camadas de papel se levantam em 3D.
import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

// RSVP primeiro: nada da cena pode impedir o formulário de ser ligado.
ligarRSVP(document.querySelector("form[data-rsvp]"), RSVP_ENDPOINT);

const $ = (s, r = document) => r.querySelector(s);
const reduz = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutBack = (t) => { const c1 = 1.85, c3 = c1 + 1; return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2; };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const palco = $("#palco"), diorama = $("#diorama"), lingueta = $("#lingueta"), trilho = $("#trilho");
const cheia = $("#fendaCheia"), dica = $("#dica"), verConvite = $("#verConvite"), btnSom = $("#som"), pular = $("#pular");
const convite = $("#convite");

/* ---------- textura de papel (gerada uma vez) ---------- */
(function texturaPapel() {
  try {
    const n = 160, c = document.createElement("canvas"); c.width = c.height = n;
    const g = c.getContext("2d"), img = g.createImageData(n, n);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 90 + Math.random() * 120;
      img.data[i] = v; img.data[i + 1] = v * 0.92; img.data[i + 2] = v * 0.8; img.data[i + 3] = Math.random() * 16;
    }
    g.putImageData(img, 0, 0);
    g.strokeStyle = "rgba(120,80,40,.07)"; g.lineWidth = 0.7;
    for (let k = 0; k < 26; k++) { // fibras
      const x = Math.random() * n, y = Math.random() * n, a = Math.random() * Math.PI;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * 6 + 3, y + Math.sin(a) * 6 - 2, x + Math.cos(a) * 14, y + Math.sin(a) * 14); g.stroke();
    }
    document.documentElement.style.setProperty("--papel", `url(${c.toDataURL()})`);
  } catch { /* sem textura, sem problema */ }
})();

/* ---------- som (WebAudio, mudo até o 1º toque) ---------- */
let ctx = null, mestre = null, ruido = null, somLigado = true;
function acordarAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    mestre = ctx.createGain(); mestre.gain.value = 0.55; mestre.connect(ctx.destination);
    ruido = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume();
}
const podeTocar = () => somLigado && ctx && ctx.state === "running";
function env(g, t, ataque, nivel, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(nivel, t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}
function osc(tipo, f0, f1, t, dur, nivel, filtro) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, 0.012, nivel, dur);
  let saida = o;
  if (filtro) { const f = ctx.createBiquadFilter(); f.type = filtro.tipo; f.frequency.value = filtro.f; f.Q.value = filtro.q || 1; o.connect(f); saida = f; }
  saida.connect(g); g.connect(mestre); o.start(t); o.stop(t + dur + 0.05);
  return o;
}
function vibrato(o, t, dur, freq, prof) {
  const l = ctx.createOscillator(), lg = ctx.createGain();
  l.frequency.value = freq; lg.gain.value = prof; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05);
}
function somPapel(i = 0) { // "flap" de papel levantando
  if (!podeTocar()) return;
  const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = ruido; f.type = "bandpass"; f.frequency.value = 900 + i * 260; f.Q.value = 0.8;
  env(g, t, 0.006, 0.5, 0.16); s.connect(f); f.connect(g); g.connect(mestre); s.start(t); s.stop(t + 0.2);
  osc("sine", 190 + i * 25, 70, t, 0.14, 0.35);
}
function somTique() {
  if (!podeTocar()) return;
  const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = ruido; f.type = "highpass"; f.frequency.value = 2800;
  env(g, t, 0.002, 0.18, 0.03); s.connect(f); f.connect(g); g.connect(mestre); s.start(t); s.stop(t + 0.05);
}
function somFesta() {
  if (!podeTocar()) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, k) => osc("triangle", f, 0, t + k * 0.09, 0.35, 0.22));
  [1567.98, 2093].forEach((f, k) => osc("sine", f, 0, t + 0.5 + k * 0.08, 0.3, 0.1));
}
const VOZES = {
  vaca() { const t = ctx.currentTime, o = osc("sawtooth", 170, 118, t, 1.0, 0.32, { tipo: "lowpass", f: 650, q: 3 }); vibrato(o, t, 1, 5, 5); },
  porco() { const t = ctx.currentTime; [0, 0.24].forEach((d) => osc("square", 300, 170, t + d, 0.16, 0.16, { tipo: "bandpass", f: 900, q: 2 })); },
  ovelha() { const t = ctx.currentTime, o = osc("sawtooth", 440, 400, t, 0.75, 0.2, { tipo: "bandpass", f: 1500, q: 1.2 }); vibrato(o, t, 0.75, 15, 32); },
  pintinho() { const t = ctx.currentTime; [0, 0.15].forEach((d) => osc("sine", 1900, 2900, t + d, 0.09, 0.22)); },
  cavalo() { const t = ctx.currentTime, o = osc("sawtooth", 760, 520, t, 0.8, 0.15, { tipo: "bandpass", f: 1700, q: 1.4 }); vibrato(o, t, 0.8, 19, 70); },
  um() { somFesta(); },
};
function vibra(p) { if (somLigado && navigator.vibrate) { try { navigator.vibrate(p); } catch {} } }

btnSom.addEventListener("click", () => {
  somLigado = !somLigado;
  btnSom.setAttribute("aria-pressed", String(somLigado));
  if (somLigado) { acordarAudio(); somTique(); }
});
addEventListener("pointerdown", acordarAudio, { capture: true, passive: true });
addEventListener("keydown", acordarAudio, { capture: true });

/* ---------- camadas ---------- */
const camadas = [...document.querySelectorAll("[data-camada]")].map((el, i) => ({
  el, i, a: +el.dataset.a, b: +el.dataset.b, prof: +el.dataset.prof || 0, subiu: false, dePe: null,
}));
const fundo = [...diorama.querySelectorAll(".sol, .nuvem, .chao")].map((el) => ({ el, prof: +el.dataset.prof || 0 }));

let p = 0;                  // progresso do pop-up 0..1
let montado = false, jaMontou = false;
let anim = null;            // {de, alvo, t0, dur}
let arrasto = null;         // {x0, p0, moveu}
let ignorarClique = false;
let respiro = 0;            // levantadinha do convite a interagir (antes do 1º toque)
let tocou = false;
let px = 0, py = 0, alvoX = 0, alvoY = 0, ultimaEntrada = 0, visivel = true, ultimoTique = 0;

const alcance = () => Math.max(40, trilho.clientWidth - lingueta.offsetWidth - 14);

function render(agora) {
  const parado = reduz.matches;
  // paralaxe suave + balanço leve quando ninguém está mexendo
  let ax = alvoX, ay = alvoY;
  if (parado) { ax = 0; ay = 0; }
  else if (montado && agora - ultimaEntrada > 2500) { ax = Math.sin(agora / 1900) * 0.45; ay = Math.sin(agora / 2700) * 0.2; }
  px += (ax - px) * 0.07; py += (ay - py) * 0.07;

  for (const c of camadas) {
    let q = clamp((p - c.a) / (c.b - c.a));
    if (respiro > 0) q = Math.max(q, respiro * (1 - c.i * 0.1));
    const e = parado ? q : easeOutBack(q);
    const ang = 90 * (1 - e);
    c.el.style.transform = `translate3d(${(px * c.prof).toFixed(2)}px,${(py * c.prof * 0.45).toFixed(2)}px,0) rotateX(${ang.toFixed(2)}deg)`;
    const luz = Math.round((0.8 + 0.2 * clamp(e)) * 100) / 100; // deitada = papel na sombra; em pé = acesa
    if (luz !== c.luz) { c.luz = luz; c.el.style.filter = `drop-shadow(0 5px 5px rgba(70,42,18,${(0.08 + 0.14 * clamp(e)).toFixed(2)})) brightness(${luz}) saturate(${(0.7 + 0.3 * clamp(e)).toFixed(2)})`; }
    if (q >= 0.8 && !c.subiu) { c.subiu = true; if (respiro === 0) { somPapel(c.i); vibra(7); } }
    else if (q < 0.25 && c.subiu) c.subiu = false;
    const dePe = q >= 0.97;
    if (dePe !== c.dePe) { c.dePe = dePe; c.el.inert = !dePe; }
  }
  for (const f of fundo) f.el.style.transform = `translate3d(${(px * f.prof).toFixed(2)}px,${(py * f.prof * 0.45).toFixed(2)}px,0)`;
  lingueta.style.transform = `translateX(${(p * alcance()).toFixed(1)}px)`;
  cheia.style.transform = `scaleX(${p.toFixed(4)})`;
}

function quadro(agora) {
  if (anim) {
    const t = anim.dur ? clamp((agora - anim.t0) / anim.dur) : 1;
    p = anim.de + (anim.alvo - anim.de) * easeInOut(t);
    if (t >= 1) { p = anim.alvo; const alvo = anim.alvo; anim = null; chegou(alvo); }
  }
  if (provocacao) {
    const t = (agora - provocacao.t0) / 1100;
    respiro = t >= 1 ? 0 : Math.sin(Math.PI * t) * 0.13;
    if (t >= 1) provocacao = null;
  }
  if (visivel || anim || arrasto) render(agora);
  requestAnimationFrame(quadro);
}

function animarPara(alvo) {
  marcarToque();
  const dur = reduz.matches ? 0 : 350 + 1700 * Math.abs(alvo - p);
  anim = { de: p, alvo, t0: performance.now(), dur };
}

function chegou(alvo) {
  if (alvo === 1) montar(); else desmontar();
}

function montar() {
  if (montado) return;
  montado = true;
  palco.classList.add("montado");
  dica.textContent = "Toque nos bichinhos!";
  if (!jaMontou) {
    jaMontou = true;
    verConvite.hidden = false;
    if (!reduz.matches) verConvite.classList.add("surge");
  }
  somFesta(); vibra([12, 50, 12]);
  confete({ particleCount: 110, spread: 85, startVelocity: 38, origin: origemDe(diorama, 0.45) });
}
function desmontar() {
  if (p > 0.001) return;
  montado = false;
  palco.classList.remove("montado");
  dica.innerHTML = 'Puxe a lingueta <span aria-hidden="true">→</span>';
}

function origemDe(el, fy = 0.5) {
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * fy) / innerHeight };
}
const CORES = ["#E85A4F", "#FFC93C", "#6EC6F0", "#F7A8BA", "#8ACF8E", "#FFFDF7", "#C2834A"];
function confete(opcoes) {
  if (reduz.matches || typeof window.confetti !== "function") return;
  window.confetti({ colors: CORES, shapes: ["square", "circle"], scalar: 1.05, ticks: 220, gravity: 0.9, disableForReducedMotion: true, zIndex: 40, ...opcoes });
}

/* ---------- a provocação antes do 1º toque: o cartão "respira" ---------- */
let provocacao = null, timerProvoca = 0;
function agendarProvocacao(ms) {
  clearTimeout(timerProvoca);
  if (tocou || reduz.matches) return;
  timerProvoca = setTimeout(() => {
    if (tocou || p > 0) return;
    provocacao = { t0: performance.now() };
    agendarProvocacao(3400);
  }, ms);
}
function marcarToque() {
  if (tocou) return;
  tocou = true; respiro = 0; provocacao = null; clearTimeout(timerProvoca);
  palco.classList.add("tocou");
}

/* ---------- lingueta: arrastar, tocar, teclado ---------- */
lingueta.addEventListener("pointerdown", (e) => {
  if (e.button !== 0 && e.pointerType === "mouse") return;
  marcarToque(); anim = null;
  arrasto = { x0: e.clientX, p0: p, moveu: false };
  try { lingueta.setPointerCapture(e.pointerId); } catch {}
  lingueta.classList.add("segurando");
});
lingueta.addEventListener("pointermove", (e) => {
  if (!arrasto) return;
  const dx = e.clientX - arrasto.x0;
  if (Math.abs(dx) > 5) arrasto.moveu = true;
  if (!arrasto.moveu) return;
  const novo = clamp(arrasto.p0 + dx / alcance());
  if (Math.abs(novo - ultimoTique) > 0.06) { ultimoTique = novo; somTique(); }
  p = novo;
});
function soltar() {
  if (!arrasto) return;
  const { moveu, p0 } = arrasto;
  arrasto = null; lingueta.classList.remove("segurando");
  if (!moveu) return; // vira clique
  ignorarClique = true;
  setTimeout(() => { ignorarClique = false; }, 0);
  if (p >= p0) animarPara(p > 0.22 ? 1 : 0);
  else animarPara(p < 0.8 ? 0 : 1);
}
lingueta.addEventListener("pointerup", soltar);
lingueta.addEventListener("pointercancel", soltar);
lingueta.addEventListener("lostpointercapture", soltar);
lingueta.addEventListener("click", () => {
  if (ignorarClique) { ignorarClique = false; return; }
  animarPara(p >= 0.999 ? 0 : 1);
});
lingueta.addEventListener("keydown", (e) => {
  const passo = { ArrowRight: 0.1, ArrowUp: 0.1, ArrowLeft: -0.1, ArrowDown: -0.1 }[e.key];
  if (passo !== undefined) {
    e.preventDefault(); marcarToque(); anim = null;
    p = clamp(Math.round((p + passo) * 10) / 10); somTique();
    if (p === 1) montar(); else if (p === 0) desmontar();
  } else if (e.key === "Home") { e.preventDefault(); animarPara(0); }
  else if (e.key === "End") { e.preventDefault(); animarPara(1); }
});

/* tocar em qualquer ponto da cena também monta */
diorama.addEventListener("click", (e) => {
  if (e.target.closest(".bicho")) return;
  if (p < 0.999 && !arrasto) animarPara(1);
});

/* ---------- bichinhos ---------- */
for (const b of document.querySelectorAll(".bicho")) {
  let timer = 0;
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    acordarAudio();
    const tipo = b.dataset.bicho;
    if (!reduz.matches) { b.classList.remove("pula"); void b.offsetWidth; b.classList.add("pula"); }
    b.classList.add("fala");
    clearTimeout(timer); timer = setTimeout(() => b.classList.remove("fala"), 1500);
    if (podeTocar() && VOZES[tipo]) VOZES[tipo]();
    vibra(10);
    const r = b.getBoundingClientRect();
    confete({ particleCount: tipo === "um" ? 70 : 22, spread: tipo === "um" ? 100 : 60, startVelocity: tipo === "um" ? 30 : 20, scalar: 0.9,
      shapes: tipo === "um" ? ["star", "circle"] : ["star"], origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * 0.3) / innerHeight } });
  });
  b.addEventListener("animationend", (e) => { if (e.animationName === "pula") b.classList.remove("pula"); });
}

/* ---------- paralaxe: mouse, toque na cena, inclinação do celular ---------- */
addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  alvoX = clamp((e.clientX / innerWidth - 0.5) * 2, -1, 1);
  alvoY = clamp((e.clientY / innerHeight - 0.5) * 2, -1, 1);
  ultimaEntrada = performance.now();
}, { passive: true });
diorama.addEventListener("touchmove", (e) => {
  const t = e.touches[0]; if (!t) return;
  const r = diorama.getBoundingClientRect();
  alvoX = clamp(((t.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
  ultimaEntrada = performance.now();
}, { passive: true });
let betaBase = null;
addEventListener("deviceorientation", (e) => {
  if (e.gamma == null || e.beta == null) return;
  if (betaBase == null) betaBase = e.beta;
  alvoX = clamp(e.gamma / 22, -1, 1);
  alvoY = clamp((e.beta - betaBase) / 22, -1, 1);
  ultimaEntrada = performance.now();
}, { passive: true });

if ("IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0 }).observe(palco);
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } }), { threshold: 0.35 });
  document.querySelectorAll("[data-entrada]").forEach((el) => io.observe(el));
} else document.querySelectorAll("[data-entrada]").forEach((el) => el.classList.add("visto"));

/* ---------- pular e ver o convite ---------- */
pular.addEventListener("click", (e) => {
  e.preventDefault();
  marcarToque(); anim = null; p = 1; render(performance.now());
  if (!montado) { montado = true; jaMontou = true; palco.classList.add("montado"); dica.textContent = "Toque nos bichinhos!"; verConvite.hidden = false; }
  convite.scrollIntoView({ behavior: reduz.matches ? "auto" : "smooth", block: "start" });
  convite.focus({ preventScroll: true });
});
verConvite.addEventListener("click", (e) => {
  e.preventDefault();
  convite.scrollIntoView({ behavior: reduz.matches ? "auto" : "smooth", block: "start" });
  convite.focus({ preventScroll: true });
});

reduz.addEventListener?.("change", () => { if (reduz.matches) { provocacao = null; respiro = 0; } });

render(performance.now());
requestAnimationFrame(quadro);
agendarProvocacao(1500);

// gancho de teste/depuração (somente leitura do estado)
window.__popup = { get progresso() { return p; }, get montado() { return montado; } };
