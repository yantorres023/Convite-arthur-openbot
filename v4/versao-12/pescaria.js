// Versão 12 — Pescaria dos patinhos (convite do Arthur, 1 aninho).
// Os patinhos boiam em roda no laguinho da fazendinha. Tocar (ou Enter/Espaço) num patinho faz a varinha de bambu
// fisgar a argolinha, tirar o patinho da água (respingos, ondinhas e as botinhas country balançando), virar o patinho
// e mostrar o número escrito embaixo dele — cada número é um dado da festa. Os pescados vão para as argolas de corda do placar.
// Movimento reduzido: tudo aparece na hora, sem deriva nem confete. Som: mudo até o 1º toque; botão liga/desliga.

const SVGNS = "http://www.w3.org/2000/svg";
const $ = (s, el = document) => el.querySelector(s);
const palco = $("[data-palco]");
const lago = $("[data-lago]");
const agua = $("[data-agua]");
const ondasG = $("[data-ondas]");
const camadaVoo = $("[data-voo]");
const bilhete = $("[data-bilhete]");
const anuncio = $("[data-anuncio]");
const dica = $("[data-dica]");
const placar = $("[data-placar]");
const somBtn = $("[data-som]");
const V = { linha: $("[data-v-linha]"), cana: $("[data-v-cana]"), nos: $("[data-v-nos]"), cabo: $("[data-v-cabo]"), boia: $("[data-v-boia]"), gancho: $("[data-v-gancho]") };
const B = { rotulo: $("[data-b-rotulo]"), titulo: $("[data-b-titulo]"), texto: $("[data-b-texto]"), lista: $("[data-b-lista]"), seguir: $("[data-b-seguir]"), convite: $("[data-b-convite]"), denovo: $("[data-b-denovo]") };

const mq = matchMedia("(prefers-reduced-motion: reduce)");
let semMov = mq.matches;
mq.addEventListener?.("change", (e) => { semMov = e.matches; });

// Dados da festa (exatos). Cada patinho tem um número embaixo; o de chapéu marrom tem um chapéu desenhado.
const DADOS = {
  idade: { numero: "1", rotulo: "Patinho nº 1", titulo: "1 aninho!", texto: "O Arthur vai fazer 1 aninho.", fala: "Arthur, 1 aninho" },
  dia: { numero: "29", rotulo: "Patinho nº 29", titulo: "29 de novembro", texto: "Domingo, 29 de novembro de 2026", fala: "Domingo, 29 de novembro de 2026" },
  hora: { numero: "15", rotulo: "Patinho nº 15", titulo: "às 15h", texto: "Domingo, às 15h", fala: "às 15h" },
  local: { numero: "31", rotulo: "Patinho nº 31", titulo: "Casa da Árvore", texto: "Rua Castelo Branco, nº\u00a031 · Cidade Nova, Santana do Paraíso", fala: "Casa da Árvore, Rua Castelo Branco, nº\u00a031, Cidade Nova, Santana do Paraíso" },
  tema: { numero: null, rotulo: "Patinho premiado", titulo: "Venha caracterizado:", texto: "country/fazendinha", fala: "Venha caracterizado: country/fazendinha" },
};
const ORDEM = ["idade", "dia", "hora", "local", "tema"];

// ---------- geometria (unidades do viewBox da cena: 390 × 560) ----------
const VB = 390;
const CENTRO = { x: 195, y: 388 }, RAIO = { x: 120, y: 76 };
const ANCORA = { x: 414, y: 612 };            // cabo da vara, fora da tela (canto de baixo, à direita)
const PONTA_REPOUSO = { x: 254, y: 150 };
const COMP = Math.hypot(PONTA_REPOUSO.x - ANCORA.x, PONTA_REPOUSO.y - ANCORA.y);
const ANG_REPOUSO = Math.atan2(ANCORA.y - PONTA_REPOUSO.y, PONTA_REPOUSO.x - ANCORA.x);
const LINHA_REPOUSO = 62;
const PEGA = { x: -6, y: 19 };                // do olho do anzol até a curvinha que segura a argola
const PATO = { w: 84, vbW: 124, vbH: 140, topo: -32, agua: 124 / 140 };
const OMEGA = (Math.PI * 2) / 46;             // uma volta no laguinho a cada 46 s
const CENTRO_VERSO = (50 - PATO.topo) / PATO.vbH; // altura (fração) do centro do fundo do patinho

let geo = { ox: 0, oy: 0, u: 1, W: 390, H: 844 };
function medir() {
  const hp = palco.getBoundingClientRect(), lr = lago.getBoundingClientRect();
  geo = { ox: lr.left - hp.left, oy: lr.top - hp.top, u: lr.width / VB || 1, W: hp.width, H: hp.height };
}
const emPx = (p) => ({ x: geo.ox + p.x * geo.u, y: geo.oy + p.y * geo.u });

// ---------- utilidades de animação ----------
const lerp = (a, b, k) => a + (b - a) * k;
const suave = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const sai = (k) => 1 - Math.pow(1 - k, 3);
const volta = (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const dur = (ms) => (semMov ? 0 : ms);
const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
function anim(ms, fn) {
  return new Promise((ok) => {
    if (ms <= 0) { fn(1); ok(); return; }
    const t0 = performance.now();
    const passo = (t) => { const k = Math.min(1, Math.max(0, (t - t0) / ms)); fn(k); if (k < 1) requestAnimationFrame(passo); else ok(); };
    requestAnimationFrame(passo);
  });
}

// ---------- som (WebAudio; mudo até o primeiro toque) ----------
const Som = (() => {
  let ctx = null, mestre = null, ligado = false, ruido = null;
  const pronto = () => ctx && ligado;
  function iniciar() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch { ctx = null; return; }
    mestre = ctx.createGain(); mestre.gain.value = 0.5; mestre.connect(ctx.destination);
    ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.6), ctx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function tom(f0, f1, dura, { tipo = "sine", vol = 0.2, em = 0, ataque = 0.01 } = {}) {
    if (!pronto()) return;
    const t = ctx.currentTime + em, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dura);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + ataque); g.gain.exponentialRampToValueAtTime(0.0001, t + dura);
    o.connect(g).connect(mestre); o.start(t); o.stop(t + dura + 0.03);
  }
  function chiado(dura, freq, { q = 0.8, vol = 0.3, em = 0, f1 = freq } = {}) {
    if (!pronto()) return;
    const t = ctx.currentTime + em, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = ruido; f.type = "bandpass"; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(f1, t + dura);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dura);
    s.connect(f).connect(g).connect(mestre); s.start(t); s.stop(t + dura + 0.03);
  }
  function fom(em, f) { // apertão de patinho de borracha
    if (!pronto()) return;
    const t = ctx.currentTime + em, o = ctx.createOscillator(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f * 0.75, t); o.frequency.linearRampToValueAtTime(f * 1.3, t + 0.05); o.frequency.linearRampToValueAtTime(f, t + 0.16);
    bp.type = "bandpass"; bp.frequency.value = f * 1.6; bp.Q.value = 2.2;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.012); g.gain.setValueAtTime(0.25, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(bp).connect(g).connect(mestre); o.start(t); o.stop(t + 0.2);
  }
  return {
    get iniciado() { return !!ctx; },
    get ligado() { return ligado; },
    set ligado(v) { ligado = !!v; if (ligado) iniciar(); },
    plip() { tom(1400, 380, 0.12, { vol: 0.22 }); },
    plop() { tom(700, 180, 0.16, { vol: 0.2 }); chiado(0.18, 1400, { vol: 0.08 }); },
    splash() { chiado(0.5, 1600, { vol: 0.32, f1: 500, q: 0.6 }); [0.04, 0.1, 0.17, 0.24].forEach((em, i) => tom(1700 - i * 230, 520, 0.09, { vol: 0.1, em })); },
    fom() { fom(0, 1050); fom(0.2, 960); },
    ding() { [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tom(f, f, 0.55, { vol: 0.12, em: i * 0.075, ataque: 0.006 })); },
    pop() { tom(520, 1040, 0.09, { tipo: "triangle", vol: 0.14 }); },
    toque() { tom(880, 1320, 0.06, { tipo: "triangle", vol: 0.08 }); },
    festa() {
      [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) => tom(f, f, 0.26, { tipo: "triangle", vol: 0.16, em: i * 0.11 }));
      [1046.5, 1318.5, 1568].forEach((f) => tom(f, f, 0.9, { vol: 0.1, em: 0.82 }));
    },
  };
})();
function pintarSom() {
  somBtn.setAttribute("aria-pressed", String(Som.ligado));
  somBtn.title = Som.ligado ? "Som ligado" : "Som desligado";
}
somBtn.addEventListener("click", () => { Som.ligado = Som.iniciado ? !Som.ligado : true; pintarSom(); Som.toque(); });
const primeiroToque = (e) => { if (Som.iniciado || somBtn.contains(e.target)) return; Som.ligado = true; pintarSom(); };
document.addEventListener("pointerdown", primeiroToque, true);
document.addEventListener("keydown", primeiroToque, true);

// ---------- confete e respingos (canvas-confetti local) ----------
function confete(o) {
  if (semMov || typeof window.confetti !== "function") return;
  try { window.confetti({ disableForReducedMotion: true, ...o }); } catch { /* sem confete, sem problema */ }
}
function origem(xp, yp) { const hp = palco.getBoundingClientRect(); return { x: (hp.left + xp) / innerWidth, y: (hp.top + yp) / innerHeight }; }
function respingos(xp, yp, n = 18, pingando = false) {
  confete({ particleCount: n, angle: pingando ? 270 : 90, spread: pingando ? 25 : 80, startVelocity: pingando ? 3 : 24, gravity: pingando ? 1.1 : 1.6,
    decay: 0.9, ticks: pingando ? 50 : 80, scalar: pingando ? 0.5 : 0.65, shapes: ["circle"], colors: ["#FFFFFF", "#CFF3FF", "#86D6F7", "#4FB6E8"], origin: origem(xp, yp) });
}
const CORES = ["#FFD23F", "#E8574A", "#4BA3E3", "#FFFFFF", "#FF9A1F", "#F48FB8"];
function ondinha(x, y, forca = 1) {
  if (semMov || !ondasG) return;
  for (let j = 0; j < 2; j++) {
    const e = document.createElementNS(SVGNS, "ellipse");
    e.setAttribute("cx", x.toFixed(1)); e.setAttribute("cy", (y + 2).toFixed(1));
    e.setAttribute("rx", (16 * forca).toFixed(1)); e.setAttribute("ry", (5.5 * forca).toFixed(1));
    ondasG.append(e);
    const a = e.animate([{ transform: "scale(.5)", opacity: 0.95 }, { transform: "scale(3)", opacity: 0 }], { duration: 1000 + j * 300, delay: j * 160, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" });
    a.onfinish = () => e.remove();
  }
}

// ---------- patinhos ----------
const patos = [...lago.querySelectorAll("[data-pato]")].map((el, i) => {
  const a = el.querySelector(".argola");
  return { el, i, id: el.dataset.pato, fase: Math.PI * 1.5 + i * ((Math.PI * 2) / 5), estado: "lago", face: 0, x: 0, y: 0, k: 1, rot: 0, dy: 0, queda: null,
    argola: { x: +a.getAttribute("cx"), y: +a.getAttribute("cy") } };
});
let tempo = 0;
function moverPato(p, t) {
  const fi = p.fase + OMEGA * tempo, s = Math.sin(fi), c = Math.cos(fi);
  p.x = CENTRO.x + RAIO.x * c; p.y = CENTRO.y + RAIO.y * s; p.k = 0.84 + 0.1 * (s + 1);
  let dy = 0, vis = true;
  if (!semMov) { dy = Math.sin(tempo * 2.1 + p.i * 1.7) * 1.8; p.rot = Math.sin(tempo * 1.6 + p.i * 1.1) * 4; } else p.rot = 0;
  if (p.queda) { const q = p.queda(t); dy += q.dy; vis = q.vis; }
  p.dy = dy;
  p.el.classList.toggle("no-ar", dy < -8);
  pintarPato(p, s > 0 ? -1 : 1, vis);
}
function pintarPato(p, face, vis = true) {
  const st = p.el.style;
  st.setProperty("--x", p.x.toFixed(2)); st.setProperty("--y", (p.y + p.dy).toFixed(2));
  st.setProperty("--k", p.k.toFixed(3)); st.setProperty("--r", p.rot.toFixed(2));
  st.zIndex = String(Math.round(p.y));
  if (face && face !== p.face) { p.face = face; p.el.classList.toggle("esq", face < 0); }
  p.el.classList.toggle("escondido", !vis);
}
function argolaVb(p) { // centro da argolinha (unidades da cena), com o patinho reto
  const w = PATO.w * p.k, h = (w * PATO.vbH) / PATO.vbW;
  const ax = ((p.face < 0 ? PATO.vbW - p.argola.x : p.argola.x) / PATO.vbW) * w;
  const ay = ((p.argola.y - PATO.topo) / PATO.vbH) * h;
  return { x: p.x - w / 2 + ax, y: p.y + p.dy - PATO.agua * h + ay };
}
function soltarPatos(atraso) { // entrada: os patinhos caem no laguinho, um a um, com "plop"
  if (semMov) { patos.forEach((p) => { p.queda = null; }); return; }
  const t0 = performance.now() / 1000 + atraso;
  patos.forEach((p, j) => {
    const ini = t0 + j * 0.17, ALT = 420, QUEDA = 0.55;
    let caiu = false;
    p.queda = (t) => {
      const d = t - ini;
      if (d < 0) return { dy: -ALT, vis: false };
      if (d < QUEDA) { const k = d / QUEDA; return { dy: -ALT * (1 - k * k), vis: true }; }
      if (!caiu) { caiu = true; aoCair(p); }
      const b = d - QUEDA;
      if (b < 0.75) return { dy: Math.sin(b * 13) * 10 * (1 - b / 0.75), vis: true };
      p.queda = null;
      return { dy: 0, vis: true };
    };
  });
}
function aoCair(p) { ondinha(p.x, p.y, 1.3); const c = emPx({ x: p.x, y: p.y }); respingos(c.x, c.y, 14); Som.plop(); }

// ---------- varinha de bambu ----------
const vara = { a: ANG_REPOUSO, g: { x: PONTA_REPOUSO.x, y: PONTA_REPOUSO.y + LINHA_REPOUSO }, v: { x: 0, y: 0 }, presa: false };
const ponta = (a = vara.a) => ({ x: ANCORA.x + COMP * Math.cos(a), y: ANCORA.y - COMP * Math.sin(a) });
const anguloPara = (x) => Math.acos(Math.max(-0.995, Math.min(0.995, (x - ANCORA.x) / COMP)));
function passoVara(dt, t) {
  if (vara.presa) return;
  const alvoA = semMov ? ANG_REPOUSO : ANG_REPOUSO + Math.sin(t * 0.9) * 0.012;
  vara.a = semMov || dt === 0 ? alvoA : vara.a + (alvoA - vara.a) * Math.min(1, dt * 5);
  const T = ponta(), alvo = { x: T.x + (semMov ? 0 : Math.sin(t * 1.3) * 2.5), y: T.y + LINHA_REPOUSO };
  if (semMov || dt === 0) { vara.g = alvo; return; }
  const K = 38, C = 5.2;
  vara.v.x += ((alvo.x - vara.g.x) * K - vara.v.x * C) * dt;
  vara.v.y += ((alvo.y - vara.g.y) * K - vara.v.y * C) * dt;
  vara.g = { x: vara.g.x + vara.v.x * dt, y: vara.g.y + vara.v.y * dt };
}
function desenharVara() {
  const A = emPx(ANCORA), T = emPx(ponta()), G = emPx(vara.g), u = geo.u, f = (n) => n.toFixed(1);
  const dx = T.x - A.x, dy = T.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const wA = 7 * u, wT = 2 * u;
  V.cana.setAttribute("d", `M${f(A.x + nx * wA)} ${f(A.y + ny * wA)}L${f(T.x + nx * wT)} ${f(T.y + ny * wT)}L${f(T.x - nx * wT)} ${f(T.y - ny * wT)}L${f(A.x - nx * wA)} ${f(A.y - ny * wA)}Z`);
  let d = "";
  for (const q of [0.2, 0.38, 0.55, 0.7, 0.83, 0.93]) {
    const cx = A.x + dx * q, cy = A.y + dy * q, w = wA + (wT - wA) * q + 0.8 * u;
    d += `M${f(cx + nx * w)} ${f(cy + ny * w)}L${f(cx - nx * w)} ${f(cy - ny * w)}`;
  }
  V.nos.setAttribute("d", d);
  V.cabo.setAttribute("d", `M${f(A.x)} ${f(A.y)}L${f(A.x + dx * 0.16)} ${f(A.y + dy * 0.16)}`);
  V.cabo.style.strokeWidth = f(wA * 2 + 3 * u);
  const sag = vara.presa ? 0 : 5 * u;
  V.linha.setAttribute("d", `M${f(T.x)} ${f(T.y)}Q${f((T.x + G.x) / 2 + sag)} ${f((T.y + G.y) / 2)} ${f(G.x)} ${f(G.y)}`);
  V.gancho.setAttribute("transform", `translate(${f(G.x)} ${f(G.y)}) scale(${u.toFixed(3)})`);
  const seg = Math.hypot(T.x - G.x, T.y - G.y) || 1, q = Math.min(0.6, (24 * u) / seg);
  V.boia.setAttribute("transform", `translate(${f(G.x + (T.x - G.x) * q)} ${f(G.y + (T.y - G.y) * q)}) scale(${u.toFixed(3)})`);
}

// ---------- laço principal ----------
let ultimo = 0, rodando = false, visivel = true;
function quadro(agora) {
  const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 0;
  ultimo = agora;
  if (!semMov) tempo += dt;
  const t = agora / 1000;
  for (const p of patos) if (p.estado === "lago") moverPato(p, t);
  passoVara(dt, t);
  desenharVara();
  if (visivel) requestAnimationFrame(quadro);
  else { rodando = false; ultimo = 0; }
}
function ligar() { if (!rodando) { rodando = true; requestAnimationFrame(quadro); } }

// ---------- o patinho pescado (clone que voa por cima de tudo) ----------
function criarVerso(id, viewBox, comBotas = false) {
  const s = document.createElementNS(SVGNS, "svg");
  s.setAttribute("viewBox", viewBox); s.setAttribute("aria-hidden", "true"); s.setAttribute("focusable", "false");
  if (comBotas) s.append(botinhas(id, true)); // virado de cabeça para baixo: as botinhas ficam para cima, chutando
  const base = document.createElementNS(SVGNS, "use");
  base.setAttribute("href", "#s-verso"); base.setAttribute("width", "124"); base.setAttribute("height", "100");
  s.append(base);
  const d = DADOS[id];
  if (d.numero) {
    const t = document.createElementNS(SVGNS, "text");
    t.setAttribute("x", "62"); t.setAttribute("y", "51");
    t.setAttribute("class", d.numero.length === 1 ? "verso-num um" : "verso-num");
    t.textContent = d.numero;
    s.append(t);
  } else {
    const c = document.createElementNS(SVGNS, "use");
    c.setAttribute("href", "#s-chapeu"); c.setAttribute("x", "40"); c.setAttribute("y", "37"); c.setAttribute("width", "44"); c.setAttribute("height", "26.4");
    c.setAttribute("style", "--ch:#9A5A2C;--ch2:#5E3215;--fita:#FFD23F");
    s.append(c);
  }
  return s;
}
// cada patinho tem botinhas country, que só aparecem quando ele sai da água
const BOTA_COR = { idade: "#C98B55", dia: "#3D8FD6", hora: "#F48FB8", local: "#B2733B", tema: "#9A5A2C" };
function botinhas(id, paraCima = false) {
  const g = document.createElementNS(SVGNS, "g");
  g.setAttribute("class", paraCima ? "voo-botas para-cima" : "voo-botas");
  for (const x of paraCima ? [46, 76] : [46, 68]) {
    const b = document.createElementNS(SVGNS, "g");
    b.setAttribute("class", "voo-bota");
    const perna = document.createElementNS(SVGNS, "path");
    perna.setAttribute("d", paraCima ? `M${x} 24V5` : `M${x} 96v12`);
    perna.setAttribute("stroke", "#F08A1E"); perna.setAttribute("stroke-width", "4.5"); perna.setAttribute("stroke-linecap", "round");
    const u = document.createElementNS(SVGNS, "use");
    u.setAttribute("href", "#s-bota"); u.setAttribute("x", String(x - 7.4)); u.setAttribute("y", paraCima ? "0" : "105");
    u.setAttribute("width", "17"); u.setAttribute("height", "19.8"); u.setAttribute("style", `--bota:${BOTA_COR[id] || "#B2733B"}`);
    if (paraCima) u.setAttribute("transform", "matrix(1 0 0 -1 0 7.4)"); // sola para cima
    b.append(perna, u);
    g.append(b);
  }
  return g;
}
function criarClone(p) {
  const w = PATO.w * p.k * geo.u, h = (w * PATO.vbH) / PATO.vbW;
  const ox = ((p.face < 0 ? PATO.vbW - p.argola.x : p.argola.x) / PATO.vbW) * w;
  const oy = ((p.argola.y - PATO.topo) / PATO.vbH) * h;
  const el = document.createElement("div");
  el.className = "pato-voo";
  el.style.width = `${w}px`; el.style.height = `${h}px`; el.style.transformOrigin = `${ox}px ${oy}px`;
  const giro = document.createElement("div");
  giro.className = "voo-giro";
  const frente = p.el.querySelector(".pato-corpo").cloneNode(true);
  frente.setAttribute("class", p.face < 0 ? "voo-frente esq" : "voo-frente");
  frente.querySelector(".pato-espelho")?.prepend(botinhas(p.id));
  const verso = criarVerso(p.id, "0 -32 124 140", true);
  verso.setAttribute("class", "voo-verso");
  giro.append(frente, verso);
  el.append(giro);
  camadaVoo.append(el);
  return { el, giro, w, h, ox, oy, P: { x: 0, y: 0 }, esc: 1, virar: 0 };
}
function porClone(c, P, rot = 0, esc = 1, virar = c.virar) { // posiciona pela argolinha (origem da rotação/escala)
  c.P = P; c.esc = esc; c.virar = virar;
  c.el.style.transform = `translate(${(P.x - c.ox).toFixed(1)}px, ${(P.y - c.oy).toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${esc.toFixed(3)})`;
  c.giro.style.transform = `perspective(700px) rotateX(${virar.toFixed(1)}deg)`;
}
function pontoPara(c, S, esc) { // posição da argola para que o centro do fundo do patinho fique em S
  return { x: S.x - (c.w / 2 - c.ox) * esc, y: S.y - (CENTRO_VERSO * c.h - c.oy) * esc };
}
function centroDe(c) { return { x: c.P.x + (c.w / 2 - c.ox) * c.esc, y: c.P.y + (CENTRO_VERSO * c.h - c.oy) * c.esc }; }

// ---------- bilhete ----------
const pegos = new Set();
let ocupado = false, atual = null, guardando = null;
function anunciar(msg) { anuncio.textContent = ""; setTimeout(() => { anuncio.textContent = msg; }, 40); }
function mostrarBilheteBase(modo) {
  bilhete.dataset.modo = modo;
  bilhete.hidden = false;
  bilhete.classList.remove("medindo", "entra");
  if (!semMov) { void bilhete.offsetWidth; bilhete.classList.add("entra"); }
  const r = bilhete.getBoundingClientRect();
  if (r.bottom > innerHeight || r.top < 0) bilhete.scrollIntoView({ block: "nearest", behavior: semMov ? "auto" : "smooth" });
}
function fecharBilhete() { bilhete.hidden = true; bilhete.classList.remove("entra", "medindo"); }
function preencher(id, botao) {
  const d = DADOS[id];
  B.rotulo.textContent = d.rotulo; B.titulo.textContent = d.titulo; B.texto.textContent = d.texto;
  B.texto.hidden = false; B.lista.hidden = true; B.convite.hidden = true; B.denovo.hidden = true; B.seguir.hidden = false;
  B.seguir.textContent = botao;
  bilhete.dataset.id = id;
}
function medirBilhete() { // topo do bilhete (px no palco) sem mostrá-lo ainda
  bilhete.hidden = false; bilhete.classList.add("medindo");
  const r = bilhete.getBoundingClientRect(), hp = palco.getBoundingClientRect();
  return r.top - hp.top;
}
function alvoPalco(c, topo) {
  const larg = Math.min(170, geo.W * 0.44);
  const esc = larg / ((108 / 124) * c.w);
  const S = { x: geo.W / 2, y: topo - (40 / 140) * c.h * esc - 14 };
  return { P: pontoPara(c, S, esc), esc };
}

// ---------- a pescaria ----------
async function pescar(p) {
  if (ocupado || p.estado !== "lago" || p.queda) return;
  ocupado = true;
  try {
    if (guardando) await guardando;
    if (atual) await guardar(false);
    p.estado = "fisgando"; p.el.setAttribute("aria-disabled", "true");
    esconderDica(); Som.toque();
    const r0 = p.rot, a0 = vara.a, g0 = { ...vara.g };
    vara.presa = true;
    p.rot = 0; const R = argolaVb(p); p.rot = r0;
    // 1) mira: a varinha gira até ficar sobre o patinho (que se endireita)
    const aAlvo = anguloPara(R.x - PEGA.x);
    await anim(dur(360), (k) => {
      const e = suave(k); vara.a = lerp(a0, aAlvo, e); const T = ponta();
      vara.g = { x: lerp(g0.x, T.x, e), y: lerp(g0.y, Math.min(T.y + 40, R.y - PEGA.y - 30), e) };
      p.rot = lerp(r0, 0, e); pintarPato(p, p.face);
    });
    // 2) o anzol desce até a argolinha e dá um puxãozinho
    const G1 = { x: R.x - PEGA.x, y: R.y - PEGA.y }, gi = { ...vara.g };
    await anim(dur(240), (k) => { const e = sai(k); vara.g = { x: lerp(gi.x, G1.x, e), y: lerp(gi.y, G1.y, e) }; });
    Som.plip(); ondinha(p.x, p.y, 0.8);
    const dy0 = p.dy;
    await anim(dur(150), (k) => { const b = Math.sin(k * Math.PI) * 4; vara.g = { x: G1.x, y: G1.y + b }; p.dy = dy0 + b; pintarPato(p, p.face); });
    // 3) sai da água (respingos, ondinhas e pinguinhos)
    const c = criarClone(p);
    const pega = () => emPx({ x: vara.g.x + PEGA.x, y: vara.g.y + PEGA.y });
    porClone(c, pega());
    p.el.classList.add("pescado"); p.estado = "pescado";
    Som.splash(); ondinha(p.x, p.y, 1.6);
    const w0 = emPx({ x: p.x, y: p.y }); respingos(w0.x, w0.y, 26);
    const aI = vara.a, aLift = anguloPara(214), li = vara.g.y - ponta().y;
    let proxPingo = 0.15;
    await anim(dur(600), (k) => {
      const e = suave(k); vara.a = lerp(aI, aLift, e); const T = ponta();
      vara.g = { x: T.x + Math.sin(k * 8) * (1 - k) * 4, y: T.y + lerp(li, 50, e) };
      porClone(c, pega(), Math.sin(k * 9) * 14 * (1 - k));
      if (k >= proxPingo) { proxPingo += 0.22; const b = emPx({ x: vara.g.x + PEGA.x, y: vara.g.y + PEGA.y + 52 * p.k }); respingos(b.x, b.y, 5, true); }
    });
    // 4) escapa do anzol, dá uma cambalhota e mostra o número de baixo
    Som.fom();
    preencher(p.id, pegos.size === patos.length - 1 ? "Guardar e ver o prêmio" : "Pescar outro patinho");
    const alvo = alvoPalco(c, medirBilhete());
    const P0 = { ...c.P };
    vara.presa = false; vara.v = { x: 0, y: -40 };
    await anim(dur(660), (k) => {
      const e = suave(k);
      const P = { x: lerp(P0.x, alvo.P.x, e), y: lerp(P0.y, alvo.P.y, e) - Math.sin(k * Math.PI) * 46 * geo.u };
      porClone(c, P, 0, lerp(1, alvo.esc, volta(k)), 180 * suave(Math.min(1, k * 1.15)));
    });
    atual = { p, c };
    mostrarBilheteBase("pesca");
    const d = DADOS[p.id];
    anunciar(`Você pescou o ${d.rotulo.toLowerCase()}! ${d.fala}.`);
    B.seguir.focus({ preventScroll: true });
    Som.ding();
    const cc = centroDe(c);
    confete({ particleCount: 36, spread: 75, startVelocity: 24, ticks: 110, scalar: 0.8, colors: CORES, origin: origem(cc.x, cc.y) });
  } finally { ocupado = false; }
}

function guardar(focarProximo = true) {
  if (!atual) return Promise.resolve();
  const { p, c } = atual;
  atual = null;
  fecharBilhete();
  guardando = (async () => {
    const vaga = $(`[data-vaga="${p.id}"]`, palco);
    const vr = vaga.getBoundingClientRect(), hp = palco.getBoundingClientRect();
    const S = { x: vr.left - hp.left + vr.width / 2, y: vr.top - hp.top + vr.height / 2 };
    const esc = (vr.width * 0.86) / ((108 / 124) * c.w);
    const P1 = pontoPara(c, S, esc), P0 = { ...c.P }, e0 = c.esc;
    await anim(dur(520), (k) => {
      const e = suave(k);
      porClone(c, { x: lerp(P0.x, P1.x, e), y: lerp(P0.y, P1.y, e) - Math.sin(k * Math.PI) * 50 * geo.u }, Math.sin(k * Math.PI) * -12, lerp(e0, esc, e), 180);
    });
    c.el.remove();
    encherVaga(p.id); Som.pop();
    pegos.add(p.id); atualizarPlacar();
    if (pegos.size === patos.length) { await esperar(dur(250)); fim(); }
    else if (focarProximo) patos.find((q) => q.estado === "lago")?.el.focus({ preventScroll: true });
  })();
  return guardando.finally(() => { guardando = null; });
}

function encherVaga(id) {
  const b = $(`[data-vaga="${id}"]`, palco);
  b.replaceChildren(criarVerso(id, "6 10 112 84"));
  b.disabled = false; b.classList.add("cheia");
  b.setAttribute("aria-label", `${DADOS[id].rotulo}: ${DADOS[id].fala}. Ver de novo`);
  if (!semMov) b.animate([{ transform: "scale(.5)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
}
function esvaziarVaga(b) {
  const s = document.createElement("span");
  s.setAttribute("aria-hidden", "true"); s.textContent = "?";
  b.replaceChildren(s);
  b.disabled = true; b.classList.remove("cheia");
  b.setAttribute("aria-label", "Patinho ainda no laguinho");
}
function atualizarPlacar() {
  const f = patos.length - pegos.size;
  placar.textContent = pegos.size === 0 ? "Pesque os 5 patinhos e descubra a festa!" : f === 0 ? "Você pescou todos os patinhos!" : f === 1 ? "Falta 1 patinho!" : `Faltam ${f} patinhos!`;
}
function consultar(id) { // tocar numa vaguinha cheia mostra o dado de novo
  if (ocupado || atual || guardando || !pegos.has(id)) return;
  preencher(id, "Fechar");
  mostrarBilheteBase("consulta");
  B.seguir.focus({ preventScroll: true });
}
function fim() {
  B.rotulo.textContent = "5 de 5 patinhos!";
  B.titulo.textContent = "Você pescou todos!";
  B.texto.hidden = true;
  B.lista.replaceChildren(...ORDEM.map((id) => {
    const li = document.createElement("li");
    li.append(criarVerso(id, "6 10 112 84"), document.createTextNode(DADOS[id].fala));
    return li;
  }));
  B.lista.hidden = false; B.seguir.hidden = true; B.convite.hidden = false; B.denovo.hidden = false;
  mostrarBilheteBase("fim");
  anunciar("Você pescou todos os patinhos! Arthur, 1 aninho: domingo, 29 de novembro de 2026, às 15h, na Casa da Árvore. Venha caracterizado: country/fazendinha.");
  B.convite.focus({ preventScroll: true });
  Som.festa();
  confete({ particleCount: 140, spread: 100, startVelocity: 45, ticks: 220, colors: CORES, origin: { x: 0.5, y: 0.55 } });
  setTimeout(() => {
    confete({ particleCount: 60, angle: 60, spread: 60, startVelocity: 50, colors: CORES, origin: { x: 0, y: 0.75 } });
    confete({ particleCount: 60, angle: 120, spread: 60, startVelocity: 50, colors: CORES, origin: { x: 1, y: 0.75 } });
  }, 280);
}
function reiniciar() {
  fecharBilhete(); pegos.clear();
  palco.querySelectorAll("[data-vaga]").forEach(esvaziarVaga);
  for (const p of patos) { p.estado = "lago"; p.el.classList.remove("pescado"); p.el.removeAttribute("aria-disabled"); }
  soltarPatos(0.05); atualizarPlacar(); mostrarDica(900);
  anunciar("Os patinhos voltaram para o laguinho.");
  patos[0].el.focus({ preventScroll: true });
}

// ---------- dica ----------
let timerDica = 0;
function mostrarDica(ms) { clearTimeout(timerDica); timerDica = setTimeout(() => { if (!pegos.size && !atual && !ocupado) dica.classList.add("mostra"); }, ms); }
function esconderDica() { clearTimeout(timerDica); dica.classList.remove("mostra"); }

// ---------- eventos ----------
for (const p of patos) p.el.addEventListener("click", () => { pescar(p); });
B.seguir.addEventListener("click", () => {
  if (bilhete.dataset.modo === "pesca") { guardar(true); return; }
  const id = bilhete.dataset.id;
  fecharBilhete();
  $(`[data-vaga="${id}"]`, palco)?.focus({ preventScroll: true });
});
B.denovo.addEventListener("click", reiniciar);
palco.querySelectorAll("[data-vaga]").forEach((b) => b.addEventListener("click", () => consultar(b.dataset.vaga)));
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || bilhete.hidden || bilhete.classList.contains("medindo")) return;
  if (bilhete.dataset.modo === "pesca") guardar(true);
  else { fecharBilhete(); patos.find((q) => q.estado === "lago")?.el.focus({ preventScroll: true }); }
});
agua.addEventListener("pointerdown", (e) => { // tocar na água faz ondinha
  const lr = lago.getBoundingClientRect(), x = (e.clientX - lr.left) / geo.u, y = (e.clientY - lr.top) / geo.u;
  if (((x - 195) / 168) ** 2 + ((y - 383) / 121) ** 2 > 1) return;
  ondinha(x, y, 0.9); Som.plip();
  const hp = palco.getBoundingClientRect();
  respingos(e.clientX - hp.left, e.clientY - hp.top, 8);
});

// ---------- início ----------
medir();
pintarSom();
new ResizeObserver(() => medir()).observe(palco);
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) ligar(); }).observe(palco);
}
for (const p of patos) moverPato(p, performance.now() / 1000);
soltarPatos(0.35);
mostrarDica(semMov ? 0 : 1900);
ligar();
