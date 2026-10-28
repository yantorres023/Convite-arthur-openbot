import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

ligarRSVP(document.querySelector("[data-rsvp]"), RSVP_ENDPOINT);

const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Bichinhos (SVG original) ---------- */
const olhos = (y, d = 12) => `<g fill="#3b2412"><circle cx="${55 - d}" cy="${y}" r="4.2"/><circle cx="${55 + d}" cy="${y}" r="4.2"/></g><g fill="#fff"><circle cx="${56.5 - d}" cy="${y - 1.5}" r="1.5"/><circle cx="${56.5 + d}" cy="${y - 1.5}" r="1.5"/></g>`;
const bochechas = (y, d = 19, c = "#ff8fb1") => `<g fill="${c}" opacity=".75"><ellipse cx="${55 - d}" cy="${y}" rx="5" ry="3.2"/><ellipse cx="${55 + d}" cy="${y}" rx="5" ry="3.2"/></g>`;
const sorriso = (y, w = 6) => `<path d="M${55 - w} ${y} q${w} ${w} ${w * 2} 0" fill="none" stroke="#3b2412" stroke-width="2.6" stroke-linecap="round"/>`;
const chapeu = (y, cor = "#c98a4b", fita = "#d93c3c") => `<g><ellipse cx="55" cy="${y}" rx="30" ry="7" fill="${cor}" stroke="#7a4b22" stroke-width="2.5"/><path d="M39 ${y - 1} q2 -20 16 -20 q14 0 16 20z" fill="${cor}" stroke="#7a4b22" stroke-width="2.5"/><path d="M40 ${y - 6} h30" stroke="${fita}" stroke-width="4"/></g>`;
const bandana = (y, xadrez = "xv") => `<g><path d="M31 ${y} q24 11 48 0 l-24 20z" fill="url(#${xadrez})" stroke="#3b2412" stroke-width="2.2" stroke-linejoin="round"/><path d="M50 ${y + 6} l-7 7 4 2z M60 ${y + 6} l7 7 -4 2z" fill="url(#${xadrez})" stroke="#3b2412" stroke-width="1.8"/></g>`;
const botas = (cor = "#9a5a2a") => `<g transform="translate(0 15)"><g stroke="#3b2412" stroke-width="2.4" stroke-linejoin="round"><path d="M35 172 h13 v16 q9 1 10 9 h-25 l1 -4z" fill="${cor}"/><path d="M75 172 h-13 v16 q-9 1 -10 9 h25 l-1 -4z" fill="${cor}"/><path d="M35 172 h13 v5 h-13z M62 172 h13 v5 h-13z" fill="#ffc93c"/></g><g fill="#ffc93c"><path d="M41.5 181 l1.2 2.6 2.8 .3 -2.1 1.9 .6 2.8 -2.5 -1.4 -2.5 1.4 .6 -2.8 -2.1 -1.9 2.8 -.3z"/><path d="M68.5 181 l1.2 2.6 2.8 .3 -2.1 1.9 .6 2.8 -2.5 -1.4 -2.5 1.4 .6 -2.8 -2.1 -1.9 2.8 -.3z"/></g></g>`;
const pernas = () => botas();
const mastro = (id) => `<defs><linearGradient id="ouro-${id}" x1="0" x2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#ffc93c"/><stop offset="1" stop-color="#e0a21b"/></linearGradient></defs><rect x="51" y="-80" width="8" height="320" rx="4" fill="url(#ouro-${id})"/>`;

const BICHOS = [
  { nome: "Pintinho", texto: "Arthur faz <strong>1 aninho!</strong>", nota: 523, svg: `
    <path d="M30 160 q-10 -8 -2 -18" fill="#ffd34d" stroke="#3b2412" stroke-width="2.5"/>
    <ellipse cx="55" cy="160" rx="34" ry="30" fill="#ffd34d" stroke="#3b2412" stroke-width="3"/>
    <path d="M72 158 q14 -6 12 10 q-8 6 -14 -2" fill="#ffc21a" stroke="#3b2412" stroke-width="2.5"/>
    <circle cx="55" cy="118" r="26" fill="#ffd34d" stroke="#3b2412" stroke-width="3"/>
    <path d="M50 92 q2 -10 8 -6 q4 -6 6 2" fill="#ffd34d" stroke="#3b2412" stroke-width="2.5"/>
    ${olhos(116, 10)}${bochechas(126, 17)}
    <path d="M48 124 l7 -6 7 6 -7 6z" fill="#ff8a1f" stroke="#3b2412" stroke-width="2"/>${bandana(138, "xa")}${chapeu(98)}
    ${botas("#d93c3c")}` },
  { nome: "Vaquinha", texto: "Domingo, <strong>29 de novembro</strong> de 2026", nota: 587, svg: `
    <ellipse cx="55" cy="162" rx="36" ry="27" fill="#fff" stroke="#3b2412" stroke-width="3"/>
    <path d="M30 150 q10 -6 14 6 q-6 12 -16 6z M70 166 q12 -4 14 6 q-6 10 -16 2z" fill="#3b2412"/>
    ${pernas("#fff")}
    <path d="M30 104 q-14 -6 -16 4 q8 8 20 4z M80 104 q14 -6 16 4 q-8 8 -20 4z" fill="#fff" stroke="#3b2412" stroke-width="2.5"/>
    <path d="M38 96 q-6 -12 2 -14 M72 96 q6 -12 -2 -14" fill="none" stroke="#e0a21b" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="55" cy="114" rx="27" ry="25" fill="#fff" stroke="#3b2412" stroke-width="3"/>
    <path d="M62 92 q14 2 16 16 q-12 2 -16 -16z" fill="#3b2412"/>
    ${olhos(110, 11)}
    <ellipse cx="55" cy="129" rx="19" ry="11" fill="#ffb3c7" stroke="#3b2412" stroke-width="2.5"/>
    <g fill="#c2577a"><ellipse cx="48" cy="128" rx="2.5" ry="3.2"/><ellipse cx="62" cy="128" rx="2.5" ry="3.2"/></g>
    ${bandana(138, "xa")}${chapeu(92, "#ffc93c", "#d93c3c")}` },
  { nome: "Porquinho", texto: "Começa <strong>às 15h</strong> — não se atrase!", nota: 659, svg: `
    <ellipse cx="55" cy="162" rx="35" ry="27" fill="#ffb3c7" stroke="#3b2412" stroke-width="3"/>
    <path d="M88 158 q10 -2 6 -8 q-6 -2 -4 6" fill="none" stroke="#3b2412" stroke-width="2.5"/>
    ${pernas("#ffb3c7")}
    <path d="M32 100 l-6 -16 18 8z M78 100 l6 -16 -18 8z" fill="#ff9ab6" stroke="#3b2412" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="55" cy="116" r="27" fill="#ffb3c7" stroke="#3b2412" stroke-width="3"/>
    ${olhos(110, 12)}${bochechas(124, 20, "#ff6b8f")}
    <ellipse cx="55" cy="125" rx="12" ry="9" fill="#ff8fb1" stroke="#3b2412" stroke-width="2.5"/>
    <g fill="#9e3a5a"><ellipse cx="51" cy="125" rx="2" ry="3"/><ellipse cx="59" cy="125" rx="2" ry="3"/></g>
    ${bandana(139)}${chapeu(92)}` },
  { nome: "Ovelhinha", texto: "Venha caracterizado: <strong>country/fazendinha</strong>", nota: 698, svg: `
    <g fill="#fff" stroke="#3b2412" stroke-width="3"><circle cx="34" cy="152" r="14"/><circle cx="76" cy="152" r="14"/><circle cx="40" cy="174" r="14"/><circle cx="70" cy="174" r="14"/><circle cx="55" cy="146" r="16"/><circle cx="55" cy="176" r="14"/></g>
    <ellipse cx="55" cy="162" rx="30" ry="20" fill="#fff"/>
    ${pernas("#5a4a40")}
    <path d="M28 112 q-14 2 -12 10 q10 4 16 -4z M82 112 q14 2 12 10 q-10 4 -16 -4z" fill="#8a7466" stroke="#3b2412" stroke-width="2.5"/>
    <ellipse cx="55" cy="118" rx="23" ry="25" fill="#8a7466" stroke="#3b2412" stroke-width="3"/>
    <g fill="#fff" stroke="#3b2412" stroke-width="2.5"><circle cx="42" cy="96" r="9"/><circle cx="55" cy="91" r="10"/><circle cx="68" cy="96" r="9"/></g>
    <g fill="#fff"><circle cx="43" cy="117" r="6"/><circle cx="67" cy="117" r="6"/></g>
    <g fill="#3b2412"><circle cx="44" cy="118" r="3.6"/><circle cx="66" cy="118" r="3.6"/></g>
    ${bochechas(129, 15)}${sorriso(130, 5)}
    ${bandana(140)}${chapeu(88, "#e6a46a", "#4fb3ff")}` },
  { nome: "Cavalinho", texto: "Casa da Árvore<small>Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso</small>", nota: 784, svg: `
    <ellipse cx="55" cy="164" rx="35" ry="25" fill="#e6a46a" stroke="#3b2412" stroke-width="3"/>
    <path d="M20 156 q-14 10 -6 26 q6 -10 10 -14" fill="#7a4b22" stroke="#3b2412" stroke-width="2.5"/>
    <path d="M30 148 h50 v13 h-50z" fill="url(#xv)" stroke="#3b2412" stroke-width="2.5"/>
    ${pernas("#e6a46a")}
    <path d="M38 92 l-4 -16 14 10z M72 92 l4 -16 -14 10z" fill="#e6a46a" stroke="#3b2412" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M32 112 q0 -26 23 -26 q23 0 23 26 v12 q0 18 -23 18 q-23 0 -23 -18z" fill="#e6a46a" stroke="#3b2412" stroke-width="3"/>
    <path d="M44 86 q6 -10 12 -2 q6 -10 12 2 q-4 8 -12 6 q-8 4 -12 -6z" fill="#7a4b22" stroke="#3b2412" stroke-width="2"/>
    ${olhos(108, 11)}
    <ellipse cx="55" cy="130" rx="17" ry="11" fill="#f6c99a" stroke="#3b2412" stroke-width="2.5"/>
    <g fill="#7a4b22"><circle cx="49" cy="129" r="2.4"/><circle cx="61" cy="129" r="2.4"/></g>
    ${sorriso(134, 4)}${bandana(141, "xa")}${chapeu(86)}` },
  { nome: "Patinho", texto: "Confirme sua presença <strong>lá embaixo!</strong>", nota: 880, svg: `
    <ellipse cx="55" cy="162" rx="34" ry="27" fill="#fff" stroke="#3b2412" stroke-width="3"/>
    <path d="M34 156 q10 -10 22 0 q-10 14 -22 0z" fill="#e8f4ff" stroke="#3b2412" stroke-width="2"/>
    ${botas("#d93c3c")}
    <circle cx="55" cy="116" r="26" fill="#fff" stroke="#3b2412" stroke-width="3"/>
    ${olhos(110, 10)}${bochechas(122, 17)}
    <path d="M40 124 q15 -8 30 0 q-15 12 -30 0z" fill="#ff9a2e" stroke="#3b2412" stroke-width="2.5"/>
    ${bandana(136)}${chapeu(94, "#ffc93c", "#4fb3ff")}` },
];

const N = BICHOS.length, PASSO = (Math.PI * 2) / N;
const anel = document.getElementById("anel");
const els = BICHOS.map((b, i) => {
  const d = document.createElement("div");
  d.className = "bicho";
  d.innerHTML = `<svg viewBox="0 0 110 240">${mastro(i)}<g class="corpo">${b.svg}</g></svg>`;
  anel.append(d);
  return d;
});

/* ---------- Placa e pontinhos ---------- */
const placa = document.getElementById("placa"), placaBicho = document.getElementById("placa-bicho"), placaTexto = document.getElementById("placa-texto");
const pontos = document.getElementById("pontos");
BICHOS.forEach((b) => { const li = document.createElement("li"); li.innerHTML = `<span class="sr-only">${b.nome}</span>`; pontos.append(li); });
const vistos = new Set();
let frente = -1, completou = false;

function revelar(i) {
  if (i === frente) return;
  if (frente >= 0) els[frente].classList.remove("frente");
  frente = i;
  const b = BICHOS[i];
  placaBicho.textContent = b.nome;
  placaTexto.innerHTML = `<span>${b.texto}</span>`;
  placa.classList.remove("troca"); void placa.offsetWidth; placa.classList.add("troca");
  els[i].classList.remove("frente"); void els[i].offsetWidth; els[i].classList.add("frente");
  vistos.add(i);
  [...pontos.children].forEach((li, k) => { li.classList.toggle("visto", vistos.has(k)); li.classList.toggle("atual", k === i); });
  tocar(b.nota);
  if (!completou && vistos.size === N) {
    completou = true;
    document.getElementById("ver-convite").classList.add("pronto");
    festa();
  }
}

/* ---------- Som (WebAudio, mudo até o 1º toque; botão liga/desliga) ---------- */
let ctx = null, somLigado = false;
const botaoSom = document.getElementById("som");
function atualizaSom() {
  botaoSom.textContent = somLigado ? "🔊" : "🔇";
  botaoSom.setAttribute("aria-pressed", String(somLigado));
  botaoSom.setAttribute("aria-label", somLigado ? "Som ligado. Desativar som" : "Som desligado. Ativar som");
}
function abreAudio() {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; } }
  if (ctx && ctx.state === "suspended") ctx.resume();
}
function primeiroToque() { abreAudio(); somLigado = true; atualizaSom(); }
function tocar(freq) {
  if (!somLigado || !ctx) return;
  const t = ctx.currentTime;
  [1, 1.25, 1.5].forEach((m, k) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = freq * m;
    g.gain.setValueAtTime(0, t + k * 0.08); g.gain.linearRampToValueAtTime(0.12, t + k * 0.08 + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + k * 0.08 + 0.5);
    o.connect(g).connect(ctx.destination); o.start(t + k * 0.08); o.stop(t + k * 0.08 + 0.55);
  });
}
function clique() {
  if (!somLigado || !ctx) return;
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(1200, t); o.frequency.exponentialRampToValueAtTime(500, t + 0.05);
  g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.07);
}
botaoSom.addEventListener("click", () => { abreAudio(); somLigado = !somLigado; atualizaSom(); });
let tocou = false;
addEventListener("pointerdown", (e) => { if (tocou || e.target === botaoSom) return; tocou = true; primeiroToque(); }, { capture: true });
addEventListener("keydown", () => { if (!tocou) { tocou = true; primeiroToque(); } }, { capture: true, once: true });

function festa() {
  if (reduz || typeof window.confetti !== "function") return;
  const cores = ["#ff6b6b", "#ffc93c", "#4fb3ff", "#ff8fb1", "#ffffff"];
  window.confetti({ particleCount: 110, spread: 80, origin: { y: 0.45 }, colors: cores, scalar: 1.1 });
  setTimeout(() => window.confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors: cores }), 250);
  setTimeout(() => window.confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors: cores }), 400);
}

/* ---------- Física do carrossel ---------- */
// rot: ângulo do carrossel. Bicho i fica em θ = rot + i·PASSO; θ ≡ 0 é a frente.
let rot = 0, vel = 0, alvo = 0, modo = "parado"; // parado | livre | encaixe | arrasto | volta
let volta = null; // {de, ate, t0, dur}
const carrossel = document.getElementById("carrossel");
let largura = carrossel.clientWidth;
addEventListener("resize", () => { largura = carrossel.clientWidth; });

function indiceFrente(r) { return ((Math.round(-r / PASSO) % N) + N) % N; }
let ultimoTic = indiceFrente(0);

function desenha(t) {
  const Rx = Math.min(largura * 0.38, 150), Ry = 36;
  els.forEach((el, i) => {
    const th = rot + i * PASSO, z = Math.cos(th);
    const x = Math.sin(th) * Rx;
    const sobe = reduz ? 0 : Math.sin(th * 2 + t / 600 + i) * (6 + Math.min(Math.abs(vel) * 60, 10));
    const y = z * Ry - 30 + sobe;
    const s = 0.55 + 0.45 * (z + 1) / 2;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
    el.style.zIndex = String(Math.round((z + 1) * 50) + (z > 0 ? 30 : 0));
    el.style.filter = z < -0.2 ? `saturate(.75) brightness(${(0.92 + z * 0.06).toFixed(2)})` : "";
  });
  const tic = indiceFrente(rot);
  if (tic !== ultimoTic) { ultimoTic = tic; if (modo !== "parado") clique(); }
}

let antes = performance.now();
function quadro(t) {
  const dt = Math.min(48, t - antes) / 16.67; antes = t;
  if (modo === "volta") {
    const k = Math.min(1, (t - volta.t0) / volta.dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const novo = volta.de + (volta.ate - volta.de) * e; vel = novo - rot; rot = novo;
    if (k >= 1) { rot = volta.ate; vel = 0; modo = "parado"; revelar(indiceFrente(rot)); }
  } else if (modo === "livre") {
    rot += vel * dt; vel *= Math.pow(0.965, dt);
    if (Math.abs(vel) < 0.012) { modo = "encaixe"; alvo = Math.round(rot / PASSO) * PASSO; }
  } else if (modo === "encaixe") {
    const f = (alvo - rot) * 0.12 - vel * 0.35; // mola amortecida
    vel += f * dt; rot += vel * dt;
    if (Math.abs(alvo - rot) < 0.002 && Math.abs(vel) < 0.002) { rot = alvo; vel = 0; modo = "parado"; revelar(indiceFrente(rot)); }
  }
  desenha(t);
  requestAnimationFrame(quadro);
}

function girar(passos) {
  const base = modo === "encaixe" ? alvo : Math.round(rot / PASSO) * PASSO;
  alvo = base - passos * PASSO;
  if (reduz) { rot = alvo; vel = 0; modo = "parado"; desenha(0); revelar(indiceFrente(rot)); return; }
  modo = "encaixe";
}

// Arrasto / toque
let px = 0, pt = 0, x0 = 0, moveu = false, idPonteiro = null, amostras = [];
carrossel.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".seta")) return;
  idPonteiro = e.pointerId; px = x0 = e.clientX; pt = performance.now(); moveu = false; amostras = [];
  modo = "arrasto"; vel = 0; carrossel.classList.add("arrastando");
  carrossel.setPointerCapture?.(e.pointerId);
});
carrossel.addEventListener("pointermove", (e) => {
  if (e.pointerId !== idPonteiro) return;
  const dx = e.clientX - px; px = e.clientX;
  if (Math.abs(e.clientX - x0) > 6) moveu = true;
  const d = dx / 170; rot += d;
  const agora = performance.now();
  amostras.push([agora, d]); amostras = amostras.filter(([a]) => agora - a < 90);
});
function solta(e) {
  if (e.pointerId !== idPonteiro) return;
  idPonteiro = null; carrossel.classList.remove("arrastando");
  if (!moveu) { // toque: gira para o próximo
    girar(e.clientX < carrossel.getBoundingClientRect().left + largura * 0.3 ? -1 : 1); return;
  }
  const soma = amostras.reduce((s, [, d]) => s + d, 0);
  vel = Math.max(-0.35, Math.min(0.35, soma / Math.max(1, amostras.length)));
  if (reduz) { vel = 0; girar(0); return; }
  modo = "livre";
}
carrossel.addEventListener("pointerup", solta);
carrossel.addEventListener("pointercancel", solta);

document.querySelectorAll("[data-girar]").forEach((b) => b.addEventListener("click", () => girar(Number(b.dataset.girar))));
carrossel.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") { e.preventDefault(); girar(1); }
  if (e.key === "ArrowLeft") { e.preventDefault(); girar(-1); }
});

// Pular / ver convite / girar de novo
function irConvite(e) {
  e.preventDefault();
  const c = document.getElementById("convite");
  c.scrollIntoView({ behavior: reduz ? "auto" : "smooth" });
  c.focus({ preventScroll: true });
}
document.querySelector("[data-pular]").addEventListener("click", irConvite);
document.getElementById("ver-convite").addEventListener("click", irConvite);
document.querySelector("[data-de-novo]").addEventListener("click", () => {
  document.getElementById("cena").scrollIntoView({ behavior: reduz ? "auto" : "smooth" });
  if (!reduz) { const b = Math.round(rot / PASSO) * PASSO; volta = { de: rot, ate: b - Math.PI * 2, t0: performance.now(), dur: 2600 }; modo = "volta"; }
  setTimeout(() => document.querySelector(".seta[data-girar='1']").focus({ preventScroll: true }), 400);
});

// Abertura: um giro de boas-vindas
revelar(0);
desenha(0);
requestAnimationFrame((t) => { antes = t; quadro(t); });
if (!reduz) setTimeout(() => { if (modo === "parado") { volta = { de: rot, ate: rot - Math.PI * 2, t0: performance.now(), dur: 2600 }; modo = "volta"; } }, 600);
