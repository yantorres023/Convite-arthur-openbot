import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

// ---------- RSVP ----------
const form = document.querySelector("[data-rsvp]");
if (form) ligarRSVP(form, RSVP_ENDPOINT);

// ---------- Cena ----------
const palco = document.getElementById("palco");
const enxame = document.getElementById("enxame");
const letras = [...document.querySelectorAll("#nome text")];
const dados = [...document.querySelectorAll("#dados li")];
const contador = document.getElementById("contador");
const dica = document.getElementById("dica");
const ver = document.getElementById("ver");
const anuncio = document.getElementById("anuncio");
const btnPular = document.getElementById("pular");
const btnSom = document.getElementById("som");
const lampadasG = document.getElementById("lampadas");

const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
const NOMES_LETRAS = ["A", "R", "T", "H", "U", "R"];
// o que cada vaga-lume revela (índice do dado a mostrar; o 6º faz amanhecer)
const REVELA = [0, 1, 2, 3, 4, null];
const TOTAL = letras.length;
let acesas = 0;
let terminou = false;

// varal de luzinhas da cerca (14 lâmpadas, acendem junto com as letras)
const NS = "http://www.w3.org/2000/svg";
const lampadas = [];
for (let k = 0; k < 14; k++) {
  const c = document.createElementNS(NS, "circle");
  c.setAttribute("cx", String(38 + 60 * k));
  c.setAttribute("cy", "694");
  c.setAttribute("r", "5");
  lampadasG.append(c);
  lampadas.push(c);
}
const acenderLampadas = (n) => {
  const alvo = Math.round((lampadas.length * n) / TOTAL);
  lampadas.forEach((c, i) => c.classList.toggle("acesa", i < alvo));
};

// ---------- Som (WebAudio, mudo até o 1º toque) ----------
let ctx = null;
let somLigado = false;
const NOTAS = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
function garantirAudio() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  somLigado = true;
  atualizarBotaoSom();
}
function atualizarBotaoSom() {
  btnSom.setAttribute("aria-pressed", String(somLigado));
  btnSom.querySelector(".som-txt").textContent = somLigado ? "Som ligado" : "Som desligado";
}
function tocar(freq, quando = 0, dur = 0.6, vol = 0.18, tipo = "sine") {
  if (!ctx || !somLigado) return;
  if (ctx.state === "suspended") ctx.resume();
  const t = ctx.currentTime + quando;
  const o = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipo; o.frequency.value = freq;
  o2.type = "sine"; o2.frequency.value = freq * 2;
  const g2 = ctx.createGain(); g2.gain.value = 0.25;
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
}
const plim = (i) => { tocar(NOTAS[i % NOTAS.length], 0, 0.7, 0.16, "triangle"); tocar(NOTAS[i % NOTAS.length] * 1.5, 0.08, 0.5, 0.06); };
const melodiaAmanhecer = () => [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) => tocar(f, i * 0.16, 0.7, 0.14, "triangle"));

window.addEventListener("pointerdown", garantirAudio, { once: true, capture: true });
window.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") garantirAudio(); }, { once: true, capture: true });
btnSom.addEventListener("click", () => {
  if (!ctx) { garantirAudio(); }
  else { somLigado = !somLigado; atualizarBotaoSom(); }
  if (somLigado) tocar(784, 0, 0.3, 0.12, "triangle");
});

// ---------- Vaga-lumes ----------
const VAGALUME_SVG = `
<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <circle class="halo" cx="32" cy="40" r="26" fill="url(#vl-brilho)"/>
  <defs><radialGradient id="vl-brilho"><stop offset="0" stop-color="#fff7b8" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd43b" stop-opacity=".45"/><stop offset="1" stop-color="#ffd43b" stop-opacity="0"/></radialGradient></defs>
  <g class="asa"><ellipse cx="21" cy="24" rx="10" ry="6.5" fill="#e3f0ff" opacity=".85" transform="rotate(-30 21 24)"/><ellipse cx="43" cy="24" rx="10" ry="6.5" fill="#e3f0ff" opacity=".85" transform="rotate(30 43 24)"/></g>
  <ellipse cx="32" cy="40" rx="9" ry="10.5" fill="#ffe14d"/>
  <circle cx="32" cy="25" r="10" fill="#3b3570"/>
  <circle cx="28.3" cy="24" r="2" fill="#fff"/><circle cx="35.7" cy="24" r="2" fill="#fff"/>
  <path d="M28.5 29 q3.5 3 7 0" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  <path d="M28 16 q-3 -6 -6 -6 M36 16 q3 -6 6 -6" stroke="#3b3570" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;

// posições-base (fração da tela) e órbitas suaves
const BASE = [
  { x: 0.18, y: 0.44 }, { x: 0.52, y: 0.38 }, { x: 0.82, y: 0.47 },
  { x: 0.28, y: 0.6 }, { x: 0.66, y: 0.58 }, { x: 0.45, y: 0.7 },
];
const voadores = BASE.map((b, i) => {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "vagalume";
  el.setAttribute("aria-label", `Vaga-lume ${i + 1} de ${TOTAL}: tocar para acender uma letra`);
  el.innerHTML = VAGALUME_SVG.replaceAll("vl-brilho", `vl-brilho-${i}`);
  enxame.append(el);
  const v = { el, b, fase: Math.random() * Math.PI * 2, w1: 0.45 + Math.random() * 0.35, w2: 0.6 + Math.random() * 0.4, ax: 0.07 + Math.random() * 0.04, ay: 0.045 + Math.random() * 0.03, livre: true, x: 0, y: 0 };
  el.addEventListener("click", () => pegar(v));
  return v;
});

function posicionar(v, t) {
  const W = palco.clientWidth, H = palco.clientHeight;
  const mexe = reduzido.matches ? 0 : 1;
  let x = (v.b.x + mexe * v.ax * Math.sin(t * v.w1 + v.fase)) * W;
  let y = (v.b.y + mexe * v.ay * Math.sin(t * v.w2 + v.fase * 1.7)) * H;
  x = Math.max(34, Math.min(W - 34, x));
  v.x = x; v.y = y;
  v.el.style.transform = `translate(${x}px, ${y}px)`;
}
let rafId = 0;
function loop(ms) {
  const t = ms / 1000;
  for (const v of voadores) if (v.livre) posicionar(v, t);
  if (voadores.some((v) => v.livre)) rafId = requestAnimationFrame(loop);
}
rafId = requestAnimationFrame(loop);
voadores.forEach((v) => posicionar(v, 0));

function centroLetra(i) {
  const r = letras[i].getBoundingClientRect();
  const p = palco.getBoundingClientRect();
  return { x: r.left + r.width / 2 - p.left, y: r.top + r.height / 2 - p.top };
}

function faiscas(x, y, n = 10) {
  if (reduzido.matches) return;
  for (let k = 0; k < n; k++) {
    const f = document.createElement("span");
    f.className = "faisca";
    const ang = (k / n) * Math.PI * 2;
    const d = 26 + Math.random() * 22;
    f.style.left = `${x}px`; f.style.top = `${y}px`;
    f.style.setProperty("--dx", `${Math.cos(ang) * d}px`);
    f.style.setProperty("--dy", `${Math.sin(ang) * d}px`);
    palco.append(f);
    setTimeout(() => f.remove(), 800);
  }
}

function acenderLetra(i, { instantaneo = false } = {}) {
  letras[i].classList.add("acesa");
  const d = REVELA[i];
  if (d != null && dados[d]) dados[d].classList.add("visivel");
  acenderLampadas(i + 1);
  contador.textContent = `${i + 1}/${TOTAL}`;
  if (!instantaneo) {
    plim(i);
    const c = centroLetra(i);
    faiscas(c.x, c.y);
    const extra = d != null && dados[d] ? ` ${dados[d].textContent}.` : "";
    anuncio.textContent = `Letra ${NOMES_LETRAS[i]} acesa.${extra}`;
  }
}

function proximoFoco(atual) {
  const resto = voadores.filter((v) => v.livre && v !== atual);
  if (resto.length && document.activeElement === atual.el) resto[0].el.focus();
}

function pegar(v) {
  if (!v.livre || terminou) return;
  garantirAudio();
  v.livre = false;
  const i = acesas++;
  proximoFoco(v);
  const alvo = centroLetra(i);
  v.el.classList.add("voando");
  v.el.setAttribute("tabindex", "-1");
  v.el.setAttribute("aria-hidden", "true");
  // força o navegador a registrar a posição atual antes de voar
  void v.el.offsetWidth;
  v.el.style.transform = `translate(${alvo.x}px, ${alvo.y}px) scale(.55)`;
  const espera = reduzido.matches ? 0 : 800;
  setTimeout(() => {
    v.el.classList.add("chegou");
    acenderLetra(i);
    if (acesas === TOTAL) setTimeout(amanhecer, reduzido.matches ? 200 : 700);
  }, espera);
}

function amanhecer({ rapido = false } = {}) {
  if (terminou) return;
  terminou = true;
  cancelAnimationFrame(rafId);
  palco.classList.add("festa");
  dica.hidden = true;
  if (!rapido) {
    melodiaAmanhecer();
    if (!reduzido.matches && typeof window.confetti === "function") {
      const cores = ["#ffd43b", "#fff3b0", "#ff8c42", "#ff6b6b", "#ffffff"];
      window.confetti({ particleCount: 90, spread: 80, startVelocity: 38, origin: { y: 0.22 }, colors: cores, shapes: ["star", "circle"], scalar: 1.1, disableForReducedMotion: true });
      setTimeout(() => window.confetti({ particleCount: 70, spread: 120, startVelocity: 30, origin: { y: 0.3 }, colors: cores, shapes: ["star"], disableForReducedMotion: true }), 1700);
    }
  }
  setTimeout(() => palco.classList.add("dia"), rapido ? 0 : 500);
  setTimeout(() => {
    ver.hidden = false;
    anuncio.textContent = "Amanheceu! Arthur, 1 aninho. O convite está logo abaixo.";
    if (!rapido) ver.focus({ preventScroll: true });
  }, rapido ? 0 : 1800);
}

function pular() {
  garantirAudio();
  for (const v of voadores) {
    if (!v.livre) continue;
    v.livre = false;
    v.el.classList.add("chegou");
    v.el.setAttribute("tabindex", "-1");
    v.el.setAttribute("aria-hidden", "true");
  }
  for (let i = acesas; i < TOTAL; i++) acenderLetra(i, { instantaneo: true });
  acesas = TOTAL;
  amanhecer({ rapido: true });
  const convite = document.getElementById("convite");
  convite.scrollIntoView({ behavior: reduzido.matches ? "auto" : "smooth" });
  convite.focus({ preventScroll: true });
}
btnPular.addEventListener("click", pular);

// se a tela mudar de tamanho, os vaga-lumes livres se reposicionam no próximo quadro
addEventListener("resize", () => { for (const v of voadores) if (v.livre) posicionar(v, performance.now() / 1000); });
