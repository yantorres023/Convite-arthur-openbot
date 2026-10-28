import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

// RSVP primeiro: com endpoint null mostra "Confirmação ainda não ativada".
ligarRSVP(document.querySelector("[data-rsvp]"), RSVP_ENDPOINT);

const reduz = matchMedia("(prefers-reduced-motion: reduce)");
const $ = (s, r = document) => r.querySelector(s);

// Encaixes no tabuleiro (coordenadas do viewBox 400x380) e o dado que cada bichinho revela.
const BICHOS = {
  vaca:     { nome: "Vaquinha",  x: 226, y: 148, w: 150, h: 115, base: "#fffdf7", pino: [58, 64], cor: "#e63946", fala: "Muuu!",   voz: "vaca",
              rotulo: "A vaquinha conta o dia:", dado: "Domingo, 29 de novembro de 2026" },
  pintinho: { nome: "Pintinho",  x: 158, y: 114, w: 70,  h: 70,  base: "#ffd23f", pino: [26, 46], cor: "#ffd23f", fala: "Piu piu!", voz: "pintinho",
              rotulo: "O pintinho piou a hora:", dado: "Às 15h" },
  porco:    { nome: "Porquinho", x: 40,  y: 264, w: 115, h: 85,  base: "#f9b4c4", pino: [44, 46], cor: "#f9b4c4", fala: "Óinc!",   voz: "porco",
              rotulo: "O porquinho sabe o lugar:", dado: "Casa da Árvore" },
  cavalo:   { nome: "Cavalinho", x: 26,  y: 110, w: 130, h: 130, base: "#e0a96d", pino: [57, 74], cor: "#2f6fd0", fala: "Iirrí!",  voz: "cavalo",
              rotulo: "O cavalinho mostra o caminho:", dado: "Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso" },
  ovelha:   { nome: "Ovelhinha", x: 200, y: 270, w: 110, h: 90,  base: "#fff7e8", pino: [42, 48], cor: "#f4c542", fala: "Béé!",    voz: "ovelha",
              rotulo: "A ovelhinha avisa:", dado: "Venha caracterizado: country/fazendinha" },
};
const ORDEM = ["vaca", "pintinho", "porco", "cavalo", "ovelha"];

function arte(id, { pino = true } = {}) {
  const b = BICHOS[id], m = 8;
  const p = pino ? `<g class="pino"><circle cx="${b.pino[0]}" cy="${b.pino[1] + 2.5}" r="8.5" fill="#8f1f2b"/><circle cx="${b.pino[0]}" cy="${b.pino[1]}" r="8.5" fill="#e63946"/><ellipse cx="${b.pino[0] - 2.6}" cy="${b.pino[1] - 3}" rx="3" ry="2" fill="#fff" opacity=".7"/></g>` : "";
  return `<svg viewBox="${-m} ${-m} ${b.w + 2 * m} ${b.h + 2 * m}" aria-hidden="true" focusable="false"><g class="arte">` +
    `<use href="#s-${id}" class="lado" transform="translate(0 6)"/><use href="#s-${id}" class="contorno"/>` +
    `<use href="#s-${id}" fill="${b.base}"/><use href="#d-${id}"/>${p}</g></svg>`;
}

// Monta encaixes, peças e progresso.
const mesa = $("[data-mesa]"), tab = $("[data-tabuleiro]"), gEnc = $("[data-encaixes]");
const placa = $("[data-placa]"), rotulo = $(".placa-rotulo"), dado = $(".placa-dado"), btVer = $("[data-ver]");
const progresso = $("[data-progresso]");
gEnc.innerHTML = ORDEM.map((id) => `<g class="encaixe" data-encaixe="${id}" transform="translate(${BICHOS[id].x} ${BICHOS[id].y})">` +
  `<use href="#s-${id}" class="borda"/><use href="#s-${id}" class="fundo"/><use href="#s-${id}" class="veio"/><use href="#d-${id}" class="dica"/></g>`).join("");

let atraso = 0;
for (const id of ORDEM) {
  const b = BICHOS[id];
  b.id = id; b.ok = false; b.tx = 0; b.ty = 0; b.s = 1;
  b.enc = gEnc.querySelector(`[data-encaixe="${id}"]`);
  b.vaga = $(`[data-vaga="${id}"]`);
  const el = document.createElement("button");
  el.type = "button"; el.className = "peca"; el.dataset.peca = id;
  el.setAttribute("aria-label", `${b.nome}: encaixar no tabuleiro`);
  el.innerHTML = arte(id);
  el.style.setProperty("--atraso", `${(atraso += 0.55)}s`);
  b.el = el;
  b.ponto = Object.assign(document.createElement("i"), { title: b.nome });
  b.ponto.style.setProperty("--c", b.cor);
  progresso.append(b.ponto);
}
// Ordem de tabulação = ordem visual da bandeja.
for (const v of document.querySelectorAll("[data-vaga]")) mesa.append(BICHOS[v.dataset.vaga].el);
for (const alvo of document.querySelectorAll("[data-arte]")) alvo.innerHTML = arte(alvo.dataset.arte);

// ---------- geometria ----------
let u = 1, arrasto = null;
function pos(b, x, y, s) {
  b.tx = x; b.ty = y; b.s = s;
  b.el.style.translate = `${x}px ${y}px`;
  b.el.style.scale = String(s);
}
function medir() {
  const m = mesa.getBoundingClientRect(), t = tab.getBoundingClientRect();
  u = t.width / 400;
  const ox = t.left - m.left, oy = t.top - m.top;
  for (const id of ORDEM) {
    const b = BICHOS[id], el = b.el;
    const W = (b.w + 16) * u, H = (b.h + 16) * u, L = ox + (b.x - 8) * u, T = oy + (b.y - 8) * u;
    Object.assign(el.style, { width: `${W}px`, height: `${H}px`, left: `${L}px`, top: `${T}px` });
    const v = b.vaga.getBoundingClientRect();
    b.casa = { x: v.left - m.left + v.width / 2 - (L + W / 2), y: v.top - m.top + v.height / 2 - (T + H / 2) };
    b.escala = Math.min((v.width + 6) / W, (v.height - 4) / H, 0.62);
    if (!b.ok && arrasto?.b !== b) semTransicao(b, () => pos(b, b.casa.x, b.casa.y, b.escala));
  }
}
function semTransicao(b, fn) {
  b.el.style.transition = "none"; fn(); void b.el.offsetWidth; b.el.style.transition = "";
}
new ResizeObserver(medir).observe(mesa);
addEventListener("resize", medir);
document.fonts?.ready.then(medir);

// ---------- som (WebAudio, só depois do 1º toque) ----------
let ac = null, saida = null, somQuer = null;
const btSom = $("[data-som]");
function atualizarBotaoSom() {
  const on = somQuer === true;
  btSom.setAttribute("aria-pressed", String(on));
  btSom.setAttribute("aria-label", on ? "Som ligado. Desligar som" : "Som desligado. Ligar som");
}
function acordarAudio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC(); saida = ac.createGain(); saida.gain.value = 0.8; saida.connect(ac.destination);
  }
  if (ac.state === "suspended") ac.resume();
}
function primeiroGesto(e) {
  if (e.target.closest?.("[data-som]")) return;
  if (somQuer === null) { somQuer = true; atualizarBotaoSom(); }
  if (somQuer) acordarAudio();
}
addEventListener("pointerdown", primeiroGesto, true);
addEventListener("keydown", primeiroGesto, true);
btSom.addEventListener("click", () => {
  somQuer = somQuer !== true; atualizarBotaoSom();
  if (somQuer) { acordarAudio(); toc(); }
});
const tocando = () => somQuer === true && ac && ac.state !== "closed";

function tom(f, t0, dur, { tipo = "sine", vol = 0.2, f2, filtro, vib } = {}) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let no = o;
  if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = vib[0]; lg.gain.value = vib[1]; l.connect(lg).connect(o.frequency); l.start(t0); l.stop(t0 + dur + 0.05); }
  if (filtro) { const fl = ac.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = filtro; no.connect(fl); no = fl; }
  no.connect(g).connect(saida);
  o.start(t0); o.stop(t0 + dur + 0.05);
}
function toc() {
  if (!tocando()) return;
  const t = ac.currentTime;
  tom(900, t, 0.07, { tipo: "triangle", vol: 0.35, f2: 260 });
  tom(190, t, 0.14, { vol: 0.3, f2: 90 });
}
function voz(qual) {
  if (!tocando()) return;
  const t = ac.currentTime + 0.05;
  if (qual === "vaca") tom(170, t, 0.95, { tipo: "sawtooth", vol: 0.16, f2: 118, filtro: 650, vib: [5, 6] });
  if (qual === "porco") { tom(430, t, 0.12, { tipo: "square", vol: 0.07, f2: 260, filtro: 1300 }); tom(400, t + 0.17, 0.14, { tipo: "square", vol: 0.07, f2: 230, filtro: 1300 }); }
  if (qual === "ovelha") tom(500, t, 0.75, { tipo: "sawtooth", vol: 0.09, f2: 440, filtro: 1900, vib: [11, 38] });
  if (qual === "pintinho") { tom(2300, t, 0.1, { vol: 0.14, f2: 3100 }); tom(2400, t + 0.16, 0.1, { vol: 0.14, f2: 3200 }); }
  if (qual === "cavalo") tom(950, t, 0.7, { tipo: "sawtooth", vol: 0.07, f2: 560, filtro: 2200, vib: [17, 90] });
}
function plim(n) {
  if (!tocando()) return;
  const t = ac.currentTime + 0.02, f = [523.3, 587.3, 659.3, 784, 880][n] || 880;
  tom(f, t, 0.5, { tipo: "triangle", vol: 0.18 }); tom(f * 2, t + 0.07, 0.4, { vol: 0.06 });
}
function boop() {
  if (!tocando()) return;
  tom(320, ac.currentTime, 0.2, { vol: 0.14, f2: 200 });
}
function fanfarra() {
  if (!tocando()) return;
  const t = ac.currentTime + 0.05;
  [523.3, 659.3, 784, 1046.5].forEach((f, i) => tom(f, t + i * 0.13, 0.35, { tipo: "triangle", vol: 0.2 }));
  [523.3, 659.3, 784, 1046.5].forEach((f) => tom(f, t + 0.6, 1.2, { tipo: "triangle", vol: 0.1 }));
}

// ---------- encaixe ----------
let feitos = 0, completo = false, viaTeclado = false;
const DURACAO = () => (reduz.matches ? 0 : 480);

function mostrarDado(b) {
  rotulo.textContent = b.rotulo; dado.textContent = b.dado;
  placa.classList.remove("novo"); void placa.offsetWidth; placa.classList.add("novo");
}
function fala(b) {
  if (reduz.matches) return;
  const m = mesa.getBoundingClientRect(), r = b.el.getBoundingClientRect();
  const f = Object.assign(document.createElement("span"), { className: "fala", textContent: b.fala });
  f.setAttribute("aria-hidden", "true");
  f.style.left = `${Math.min(Math.max(r.left - m.left + r.width / 2, 50), m.width - 50)}px`;
  f.style.top = `${r.top - m.top + 6}px`;
  mesa.append(f); setTimeout(() => f.remove(), 1700);
}
function proximaPeca(depoisDe) {
  const lista = [...mesa.querySelectorAll(".peca")];
  const i = lista.indexOf(depoisDe);
  return [...lista.slice(i + 1), ...lista.slice(0, i)].find((el) => !BICHOS[el.dataset.peca].ok);
}

function encaixar(b, { silencioso = false } = {}) {
  if (b.ok) return;
  b.ok = true; feitos++;
  const n = feitos - 1, el = b.el, tinhaFoco = document.activeElement === el;
  if (silencioso) semTransicao(b, () => pos(b, 0, 0, 1)); else pos(b, 0, 0, 1);
  el.classList.remove("erro");
  el.setAttribute("aria-disabled", "true"); el.tabIndex = -1;
  el.setAttribute("aria-label", `${b.nome} encaixado: ${b.dado}`);
  b.enc.classList.add("cheio"); b.ponto.classList.add("ok");
  if (tinhaFoco) { const prox = proximaPeca(el); if (prox) prox.focus(); }
  const chegou = () => {
    el.classList.add("encaixada");
    if (silencioso) return;
    toc(); voz(b.voz); setTimeout(() => plim(n), 380);
    fala(b); mostrarDado(b);
    if (feitos === ORDEM.length) setTimeout(festa, reduz.matches ? 0 : 900);
  };
  if (silencioso || !DURACAO()) chegou(); else setTimeout(chegou, DURACAO() * 0.75);
}
function voltar(b) {
  pos(b, b.casa.x, b.casa.y, b.escala);
  b.el.classList.add("erro"); boop();
  setTimeout(() => b.el.classList.remove("erro"), 450);
}

function festa({ silenciosa = false } = {}) {
  if (completo) return;
  completo = true;
  mesa.classList.add("festa");
  rotulo.textContent = "Fazendinha completa!";
  dado.textContent = "Arthur, 1 aninho — a festa está montada!";
  btVer.hidden = false;
  placa.classList.remove("novo"); void placa.offsetWidth; placa.classList.add("novo");
  $("#instrucao").textContent = "Todos os bichinhos estão no lugar. Veja o convite completo abaixo.";
  if (silenciosa) return;
  fanfarra();
  if (window.confetti && !reduz.matches) {
    const cores = ["#e63946", "#ffd23f", "#2f6fd0", "#ff8fab", "#ffffff", "#f4a261"];
    const t = tab.getBoundingClientRect(), y = (t.top + t.height * 0.35) / innerHeight;
    confetti({ particleCount: 120, spread: 80, startVelocity: 40, origin: { x: 0.5, y }, colors: cores, disableForReducedMotion: true });
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: y + 0.1 }, colors: cores, disableForReducedMotion: true });
      confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: y + 0.1 }, colors: cores, disableForReducedMotion: true });
    }, 280);
  }
  if (viaTeclado || mesa.contains(document.activeElement) || document.activeElement === document.body) btVer.focus({ preventScroll: true });
}

// ---------- arrastar / tocar / teclado ----------
let suprimirClique = false;
const LIMIAR = () => 62 * u;

for (const id of ORDEM) {
  const b = BICHOS[id], el = b.el;
  el.addEventListener("pointerdown", (e) => {
    if (b.ok || arrasto || (e.pointerType === "mouse" && e.button !== 0)) return;
    viaTeclado = false;
    el.setPointerCapture(e.pointerId);
    arrasto = { b, id: e.pointerId, sx: e.clientX, sy: e.clientY, bx: b.tx, by: b.ty, moveu: false, perto: false };
    el.classList.add("arrastando");
    b.s = 1; el.style.scale = "1";
  });
  el.addEventListener("pointermove", (e) => {
    if (!arrasto || arrasto.b !== b || e.pointerId !== arrasto.id) return;
    const dx = e.clientX - arrasto.sx, dy = e.clientY - arrasto.sy;
    if (!arrasto.moveu && Math.hypot(dx, dy) < 7) return;
    arrasto.moveu = true;
    pos(b, arrasto.bx + dx, arrasto.by + dy, 1);
    arrasto.perto = Math.hypot(b.tx, b.ty) < LIMIAR();
    b.enc.classList.toggle("alvo", arrasto.perto);
  });
  const soltar = (e, cancelou) => {
    if (!arrasto || arrasto.b !== b || e.pointerId !== arrasto.id) return;
    const a = arrasto; arrasto = null;
    el.classList.remove("arrastando"); b.enc.classList.remove("alvo");
    if (!a.moveu && !cancelou) return; // toque simples: o "click" encaixa
    suprimirClique = true; setTimeout(() => (suprimirClique = false), 400);
    if (a.perto && !cancelou) encaixar(b); else voltar(b);
  };
  el.addEventListener("pointerup", (e) => soltar(e, false));
  el.addEventListener("pointercancel", (e) => soltar(e, true));
  el.addEventListener("click", (e) => {
    if (suprimirClique) { suprimirClique = false; return; }
    if (b.ok) return;
    if (e.detail === 0) viaTeclado = true; // Enter/Espaço
    encaixar(b);
  });
  el.addEventListener("focus", () => b.enc.classList.add("alvo"));
  el.addEventListener("blur", () => b.enc.classList.remove("alvo"));
}

// ---------- pular / ver convite ----------
function irParaConvite(e) {
  e.preventDefault();
  if (!completo) {
    for (const id of ORDEM) encaixar(BICHOS[id], { silencioso: true });
    festa({ silenciosa: true });
  }
  const h = $("#convite-titulo");
  $("#convite").scrollIntoView({ behavior: reduz.matches ? "auto" : "smooth", block: "start" });
  h.focus({ preventScroll: true });
}
$("[data-pular]").addEventListener("click", irParaConvite);
btVer.addEventListener("click", irParaConvite);

medir();
