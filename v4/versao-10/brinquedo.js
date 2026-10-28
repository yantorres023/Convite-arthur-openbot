// Versão 10 · Bloquinhos country — Arthur, 1 aninho.
// Toque num bloquinho: um laço de corda o pega, ele voa rolando como um dado, empilha na prateleira
// formando A-R-T-H-U-R e revela um dado da festa na placa. Depois cai o bloquinho dourado do "1",
// que também é laçado para o alto da torrinha e ganha o chapéu de cowboy.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const palco = $("#palco");
const chao = $(".chao", palco);
const monte = $("[data-monte]", palco);
const linhas = $$(".dado", palco);
const fim = $("[data-fim]", palco);
const mao = $(".mao", palco);
const chapeu = $(".chapeu-final", palco);
const balao = $(".balao-aninho", palco);
const anuncio = $("[data-anuncio]", palco);
const titulo = $("[data-placa-titulo]", palco);
const btnSom = $("[data-som]");
const btnPular = $("[data-pular]");
const convite = $("#convite");
const vagas = [];
$$(".vaga", palco).forEach((v) => { vagas[Number(v.dataset.vaga)] = v; });

const reduz = matchMedia("(prefers-reduced-motion: reduce)");
const semMov = () => reduz.matches;

// Cada bloquinho: letra, bichinho country, cor e o dado que ele revela (texto fica no HTML da placa).
const BLOCOS = [
  { letra: "A", bicho: "vaca", nome: "da vaquinha", cor: "#D8453F", clara: "#FDE2DE", nota: 523.25, x: "16%", y: "21%", pose: [-14, 197, -8] },
  { letra: "R", bicho: "porco", nome: "do porquinho", cor: "#D9620B", clara: "#FFE6CC", nota: 587.33, x: "48%", y: "12%", pose: [-17, 164, 6] },
  { letra: "T", bicho: "pintinho", nome: "do pintinho", cor: "#2E9450", clara: "#DDF2E1", nota: 659.25, x: "81%", y: "23%", pose: [-12, 203, 9] },
  { letra: "H", bicho: "ovelha", nome: "da ovelhinha", cor: "#2878CC", clara: "#DCEBFB", nota: 783.99, x: "35%", y: "70%", pose: [-15, 160, -5] },
  { letra: "U", bicho: "cavalo", nome: "do cavalinho", cor: "#8A55D0", clara: "#ECE2FA", nota: 880.0, x: "63%", y: "62%", pose: [-13, 193, -10] },
  { letra: "R", bicho: "pato", nome: "do patinho", cor: "#D2457F", clara: "#FCE1EC", nota: 1046.5, x: "87%", y: "76%", pose: [-16, 168, 7] },
];
const UM = { letra: "1", ouro: true, cor: "#FFC83D", clara: "#FFF1C4", nota: 1318.51, x: "50%", y: "44%", pose: [-12, -16, -5] };

const POSE_FILEIRA = "rotateX(-13deg) rotateY(-24deg) rotateZ(0deg)";
const POSE_GIRO = "rotateX(-13deg) rotateY(336deg) rotateZ(0deg)";
const POSE_ROLOU = "rotateX(347deg) rotateY(336deg) rotateZ(0deg)";
const CORACAO = '<svg class="bq-coracao" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.2-4.4-9.4-8.8C1 8.4 3.2 5 6.6 5c2.2 0 3.9 1.2 5.4 3.2C13.5 6.2 15.2 5 17.4 5 20.8 5 23 8.4 21.4 11.7 19.2 16.1 12 20.5 12 20.5z"/></svg>';
const pose = ([x, y, z]) => `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;

// ---------------- som (WebAudio, mudo até o 1º toque) ----------------
const som = (() => {
  let ctx = null, mestre = null, ruido = null, ligado = false;
  function iniciar() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    mestre = ctx.createGain();
    mestre.gain.value = ligado ? 0.9 : 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4;
    mestre.connect(comp).connect(ctx.destination);
    ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
  }
  function setLigado(v) {
    ligado = v;
    if (mestre) mestre.gain.setTargetAtTime(v ? 0.9 : 0, ctx.currentTime, 0.02);
  }
  const pronto = () => ctx && ligado && ctx.state === "running";
  const env = (g, t, pico, dur) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pico, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  };
  // xilofone/marimba: fundamental + parcial 4x + estalo de ataque
  function nota(f, atraso = 0, dur = 0.9, vol = 0.3) {
    if (!pronto()) return;
    const t = ctx.currentTime + atraso;
    const teto = ctx.sampleRate * 0.45;
    [[f, "sine", vol, dur], [f * 4, "sine", vol * 0.45, dur * 0.22], [f * 9.2, "triangle", vol * 0.12, 0.05]].forEach(([fr, tipo, v, du]) => {
      if (fr > teto) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = tipo; o.frequency.value = fr; env(g, t, v, du);
      o.connect(g).connect(mestre); o.start(t); o.stop(t + du + 0.05);
    });
  }
  // "toc" de madeira
  function toc(atraso = 0) {
    if (!pronto()) return;
    const t = ctx.currentTime + atraso;
    const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = ruido; bp.type = "bandpass"; bp.frequency.value = 1500; bp.Q.value = 3.2; env(g, t, 0.55, 0.07);
    src.connect(bp).connect(g).connect(mestre); src.start(t); src.stop(t + 0.1);
    const o = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.08); env(g2, t, 0.4, 0.1);
    o.connect(g2).connect(mestre); o.start(t); o.stop(t + 0.13);
  }
  // "fiu-fiu" do laço girando
  function laco() {
    if (!pronto()) return;
    const t0 = ctx.currentTime;
    [0, 0.11].forEach((d, k) => {
      const t = t0 + d;
      const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = ruido; bp.type = "bandpass"; bp.Q.value = 2.4;
      bp.frequency.setValueAtTime(800 + k * 350, t); bp.frequency.exponentialRampToValueAtTime(2300 + k * 600, t + 0.1);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.13, t + 0.035); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      src.connect(bp).connect(g).connect(mestre); src.start(t); src.stop(t + 0.13);
    });
  }
  // "fuuu" do pulo
  function zum() {
    if (!pronto()) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = ruido; bp.type = "bandpass"; bp.Q.value = 1.3;
    bp.frequency.setValueAtTime(450, t); bp.frequency.exponentialRampToValueAtTime(2600, t + 0.32);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.15, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
    src.connect(bp).connect(g).connect(mestre); src.start(t); src.stop(t + 0.4);
  }
  function boing() {
    if (!pronto()) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(430, t + 0.09); o.frequency.exponentialRampToValueAtTime(250, t + 0.38);
    lfo.frequency.value = 17; lg.gain.value = 24; lfo.connect(lg).connect(o.frequency);
    env(g, t, 0.28, 0.45);
    o.connect(g).connect(mestre); o.start(t); lfo.start(t); o.stop(t + 0.5); lfo.stop(t + 0.5);
  }
  // assobio de queda (o dourado vindo do céu)
  function assobio() {
    if (!pronto()) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(1750, t); o.frequency.exponentialRampToValueAtTime(620, t + 0.62);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.05); g.gain.setValueAtTime(0.08, t + 0.52); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.66);
    o.connect(g).connect(mestre); o.start(t); o.stop(t + 0.7);
  }
  function brilho(atraso = 0) {
    for (let k = 0; k < 7; k++) nota(1800 + Math.random() * 1500, atraso + k * 0.07, 0.25, 0.06);
  }
  function fanfarra() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, k) => nota(f, k * 0.1, 0.8, 0.26));
    [1046.5, 1318.51, 1567.98].forEach((f) => nota(f, 0.46, 1.5, 0.18));
    brilho(0.62);
  }
  return { iniciar, setLigado, nota, toc, laco, zum, boing, assobio, fanfarra, brilho, get ligado() { return ligado; } };
})();

let tocou = false, mexeuNoSom = false, viaTeclado = false;
function atualizarBotaoSom() {
  btnSom.setAttribute("aria-pressed", String(som.ligado));
  btnSom.setAttribute("title", som.ligado ? "Som ligado (toque para desligar)" : "Som desligado (toque para ligar)");
}
function primeiroToque(ev) {
  som.iniciar();
  if (tocou) return;
  tocou = true;
  if (ev && btnSom.contains(ev.target)) return; // o próprio botão decide
  if (!mexeuNoSom) { som.setLigado(true); atualizarBotaoSom(); }
}
document.addEventListener("click", primeiroToque, true);
document.addEventListener("keydown", (ev) => {
  viaTeclado = true;
  if (ev.key === "Enter" || ev.key === " ") primeiroToque(ev);
}, true);
document.addEventListener("pointerdown", () => { viaTeclado = false; }, true);
btnSom.addEventListener("click", () => {
  som.iniciar();
  mexeuNoSom = true;
  som.setLigado(!som.ligado);
  atualizarBotaoSom();
  if (som.ligado) som.nota(783.99, 0.02, 0.5, 0.22);
});
atualizarBotaoSom();

// ---------------- construção dos cubos ----------------
function criarCubo(b, i) {
  const bq = document.createElement("span");
  bq.className = "bq" + (b.ouro ? " ouro" : "");
  bq.style.setProperty("--cor", b.cor);
  bq.style.setProperty("--clara", b.clara);
  bq.style.setProperty("--pisca", `${(-Math.random() * 4.6).toFixed(2)}s`);
  const estrela = '<span class="bq-estrela"></span>';
  const frente = `<span class="bq-face f-frente"><span class="bq-painel"><span class="bq-letra">${b.letra}</span></span></span>`;
  const tras = b.ouro
    ? `<span class="bq-face f-tras">${estrela}</span>`
    : `<span class="bq-face f-tras"><span class="bq-painel claro"><svg viewBox="0 0 100 100" aria-hidden="true"><use href="#${b.bicho}"/></svg></span></span>`;
  const dir = b.ouro ? `<span class="bq-face f-dir">${estrela}</span>` : '<span class="bq-face f-dir"><span class="bq-xadrez"></span></span>';
  const esq = b.ouro ? `<span class="bq-face f-esq">${estrela}</span>` : `<span class="bq-face f-esq"><span class="bq-pintas pintas-${i + 1}">${"<i></i>".repeat(9)}</span></span>`;
  bq.innerHTML = `<span class="bq-sombra"></span><span class="bq-cubo">${frente}${tras}${dir}${esq}<span class="bq-face f-topo">${estrela}</span><span class="bq-face f-base">${b.ouro ? estrela : CORACAO}</span></span>`;
  return bq;
}

function criarBotao(b, i) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "bloco" + (b.ouro ? " dourado" : "");
  btn.dataset.i = String(i);
  btn.setAttribute("aria-label", b.ouro ? "Bloquinho dourado do 1: tocar para pôr no alto da torrinha" : `Bloquinho ${b.nome}: tocar para empilhar`);
  btn.style.setProperty("--x", b.x);
  btn.style.setProperty("--y", b.y);
  const bq = criarCubo(b, i);
  $(".bq-cubo", bq).style.transform = pose(b.pose);
  btn.append(bq);
  btn.addEventListener("click", () => (b.ouro ? empilharUm() : empilhar(i)));
  return btn;
}

// ---------------- estado ----------------
let fase = "letras";             // letras → um → fim
let geracao = 0;                 // invalida continuações antigas (pular / montar de novo)
const colocados = new Set();
const voando = new Set();
let umVoando = false;

function atualizarTitulo() {
  const falta = BLOCOS.length - colocados.size;
  const texto = fase === "fim" ? "Você está convidado!"
    : fase === "um" ? "Agora, o bloquinho do 1!"
    : colocados.size === 0 ? "Toque nos bloquinhos!"
    : falta === 1 ? "Falta 1 bloquinho!" : `Faltam ${falta} bloquinhos!`;
  if (titulo.textContent === texto) return;
  titulo.textContent = texto;
  titulo.classList.remove("muda");
  void titulo.offsetWidth;
  titulo.classList.add("muda");
}

function anunciar(texto) {
  anuncio.textContent = "";
  setTimeout(() => { anuncio.textContent = texto; }, 60);
}

// queda inicial: os bloquinhos chovem na toalha xadrez
function cair(btn, k) {
  if (semMov()) return;
  const r = btn.getBoundingClientRect();
  const queda = Math.max(320, r.top + r.height + 60);
  const atraso = 280 + k * 120;
  btn.animate([
    { transform: `translateY(${-queda}px)`, easing: "cubic-bezier(.55,0,1,.55)" },
    { transform: "translateY(0)", offset: 0.58, easing: "cubic-bezier(0,.45,.45,1)" },
    { transform: "translateY(-26px)", offset: 0.76, easing: "cubic-bezier(.55,0,1,.55)" },
    { transform: "translateY(0)", offset: 0.9, easing: "cubic-bezier(0,.45,.45,1)" },
    { transform: "translateY(-5px)", offset: 0.95 },
    { transform: "translateY(0)" },
  ], { duration: 1050, delay: atraso, fill: "backwards" });
  const cubo = $(".bq-cubo", btn);
  const [x, y, z] = BLOCOS[k] ? BLOCOS[k].pose : UM.pose;
  cubo.animate([
    { transform: `rotateX(${x - 220}deg) rotateY(${y - 110}deg) rotateZ(${z + 50}deg)` },
    { transform: pose([x, y, z]), offset: 0.58 },
    { transform: pose([x, y, z]) },
  ], { duration: 1050, delay: atraso, fill: "backwards", easing: "ease-out" });
  setTimeout(() => som.toc(), atraso + 600);
}

function montarMonte(entrada) {
  monte.replaceChildren();
  BLOCOS.forEach((b, i) => {
    const btn = criarBotao(b, i);
    monte.append(btn);
  });
  if (entrada) $$(".bloco", monte).forEach((btn, k) => cair(btn, k));
}

// ---------------- laço de corda: cai sobre o bloquinho, aperta e o leva junto no voo ----------------
// Anel em perspectiva: o arco de trás fica atrás do cubo e o da frente (com nó e ponta da corda) na frente.
const corda = (d) => `<path class="cd-borda" d="${d}"/><path class="cd-miolo" d="${d}"/><path class="cd-fio" d="${d}"/>`;
const ARCO_TRAS = "M-13 63A63 14 0 0 1 113 63";
const ARCO_FRENTE = "M-13 63A63 14 0 0 0 113 63";
const PONTA = "M77 75c14 2 27-6 30-20s9-34 26-48";

function criarLaco(bq) {
  const tmp = document.createElement("span");
  tmp.innerHTML =
    `<svg class="laco laco-tras" viewBox="0 0 100 100" aria-hidden="true">${corda(ARCO_TRAS)}</svg>` +
    `<svg class="laco laco-frente" viewBox="0 0 100 100" aria-hidden="true">${corda(ARCO_FRENTE)}<g class="ponta">${corda(PONTA)}</g><ellipse class="cd-no" cx="73" cy="76" rx="7.5" ry="5.8"/></svg>`;
  const [tras, frente] = [...tmp.children];
  bq.insertBefore(tras, $(".bq-cubo", bq));
  bq.append(frente);
  return [tras, frente];
}

// devolve uma promessa que resolve quando o laço apertou (hora de voar)
function lacar(btn, bq) {
  if (semMov()) return Promise.resolve();
  som.laco();
  const lacos = criarLaco(bq);
  const queda = [
    { transform: "translateY(-105%) scale(1.5, 1.7)", opacity: 0, easing: "cubic-bezier(.4,0,.9,.6)" },
    { transform: "translateY(-50%) scale(1.32, 1.45)", opacity: 1, offset: 0.3, easing: "cubic-bezier(.3,.4,.6,1)" },
    { transform: "translateY(0) scale(1.16, 1.12)", offset: 0.6, easing: "cubic-bezier(.5,0,.5,1)" },
    { transform: "translateY(0) scale(.86, .95)", offset: 0.8, easing: "ease-out" },
    { transform: "none" },
  ];
  lacos.forEach((el) => el.animate(queda, { duration: 300 }));
  btn.style.transformOrigin = "50% 80%";
  btn.animate([
    { transform: "none" },
    { transform: "none", offset: 0.58 },
    { transform: "scale(.93, 1.06)", offset: 0.8 },
    { transform: "none" },
  ], { duration: 300, easing: "ease-out" });
  return new Promise((ok) => setTimeout(ok, 250));
}

// ao pousar: o laço afrouxa e some
function soltarLaco(bq) {
  $$(".laco", bq).forEach((el) => {
    el.animate([
      { transform: "none", opacity: 1 },
      { transform: "translateY(8%) scale(1.5, 1.3)", opacity: 0 },
    ], { duration: 380, easing: "ease-out", fill: "forwards" }).finished.then(() => el.remove(), () => el.remove());
  });
}

// ---------------- voo FLIP em arco, rolando como dado ----------------
function voar(bq, vaga, { dur = 820, extra = 110 } = {}) {
  const de = bq.getBoundingClientRect();
  vaga.append(bq);
  vaga.classList.add("cheia");
  const cubo = $(".bq-cubo", bq);
  const poseAntes = cubo.style.transform || POSE_FILEIRA;
  cubo.style.transform = POSE_FILEIRA;
  if (semMov()) return Promise.resolve();
  const para = bq.getBoundingClientRect();
  const dx = de.left + de.width / 2 - (para.left + para.width / 2);
  const dy = de.top + de.height / 2 - (para.top + para.height / 2);
  const s0 = de.width / para.width;
  const H = Math.max(80, dy / 4 + extra); // o arco passa acima da vaga e desce em cima dela
  const N = 32, kf = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const x = dx * (1 - t);
    const y = dy * (1 - t) - H * 4 * t * (1 - t);
    const s = s0 + (1 - s0) * t;
    kf.push({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})` });
  }
  cubo.animate([{ transform: poseAntes }, { transform: POSE_ROLOU }], { duration: dur, easing: "cubic-bezier(.25,.6,.3,1)" });
  return bq.animate(kf, { duration: dur, easing: "linear" }).finished.catch(() => {});
}

function aterrissar(bq, freq) {
  som.toc();
  som.nota(freq, 0.03);
  if (semMov()) return;
  bq.animate([
    { transform: "scale(1.18, .8)" },
    { transform: "scale(.93, 1.08)", offset: 0.45 },
    { transform: "scale(1.03, .97)", offset: 0.75 },
    { transform: "none" },
  ], { duration: 420, easing: "ease-out" });
}

function revelar(i) {
  palco.classList.add("jogando");
  const li = linhas[i];
  if (!li || li.classList.contains("revelado")) return;
  li.classList.add("revelado");
  const txt = $(".dado-txt", li).textContent;
  anunciar(`Letra ${BLOCOS[i].letra}: ${txt}`);
  setTimeout(() => som.nota(BLOCOS[i].nota * 2, 0, 0.3, 0.08), 160);
}

function focarProximo(atual) {
  const livres = $$(".bloco:not(.saiu):not(.pego)", monte).filter((b) => b !== atual);
  if (livres.length) livres[0].focus({ preventScroll: true });
}

async function empilhar(i) {
  if (fase !== "letras" || colocados.has(i) || voando.has(i)) return;
  const btn = $(`.bloco[data-i="${i}"]`, monte);
  if (!btn) return;
  voando.add(i);
  btn.classList.add("pego");
  esconderMao();
  const bq = $(".bq", btn);
  bq.getAnimations().forEach((a) => a.cancel());
  btn.getAnimations().forEach((a) => a.finish());
  if (document.activeElement === btn) focarProximo(btn);
  const g = geracao;
  await lacar(btn, bq);
  if (g !== geracao) return;
  btn.getAnimations().forEach((a) => a.finish());
  som.zum();
  const voo = voar(bq, vagas[i]);
  btn.classList.add("saiu");
  await voo;
  if (g !== geracao) return;
  btn.remove();
  voando.delete(i);
  colocados.add(i);
  aterrissar(bq, BLOCOS[i].nota);
  soltarLaco(bq);
  revelar(i);
  atualizarTitulo();
  if (fase === "letras" && colocados.size === BLOCOS.length) setTimeout(() => { if (g === geracao) chamarUm(); }, 700);
  else agendarMao(5200);
}

// ---------------- fase 2: o bloquinho dourado do "1" ----------------
async function chamarUm() {
  if (fase !== "letras") return;
  fase = "um";
  palco.dataset.fase = "um";
  const btn = criarBotao(UM, 6);
  monte.append(btn);
  atualizarTitulo();
  anunciar("Falta o bloquinho dourado do 1. Toque nele para completar a torrinha.");
  const g = geracao;
  if (!semMov()) {
    const r = btn.getBoundingClientRect();
    const queda = Math.max(420, r.top + r.height + 80);
    som.assobio();
    await btn.animate([
      { transform: `translateY(${-queda}px)`, easing: "cubic-bezier(.5,0,1,.6)" },
      { transform: "translateY(0)", offset: 0.6, easing: "cubic-bezier(0,.4,.5,1)" },
      { transform: "translateY(-34px)", offset: 0.79, easing: "cubic-bezier(.5,0,1,.6)" },
      { transform: "translateY(0)", offset: 0.92, easing: "ease-out" },
      { transform: "translateY(-6px)", offset: 0.96 },
      { transform: "translateY(0)" },
    ], { duration: 1150 }).finished.catch(() => {});
    if (g !== geracao) return;
    som.boing();
  }
  if (fase !== "um" || !btn.isConnected) return;
  btn.classList.add("chama");
  if (viaTeclado) btn.focus({ preventScroll: true });
  agendarMao(900);
}

async function empilharUm() {
  if (fase !== "um" || umVoando) return;
  const btn = $(".bloco.dourado", monte);
  if (!btn) return;
  umVoando = true;
  btn.classList.remove("chama");
  btn.classList.add("pego");
  btn.getAnimations().forEach((a) => a.finish());
  esconderMao();
  const bq = $(".bq", btn);
  bq.getAnimations().forEach((a) => a.cancel());
  const g = geracao;
  await lacar(btn, bq);
  if (g !== geracao) return;
  btn.getAnimations().forEach((a) => a.finish());
  som.zum();
  const voo = voar(bq, vagas[6], { dur: 900, extra: 85 });
  btn.classList.add("saiu");
  await voo;
  if (g !== geracao) return;
  btn.remove();
  aterrissar(bq, UM.nota);
  soltarLaco(bq);
  final();
}

// ---------------- final: chapéu, confete e "ola" musical ----------------
function pular(bq, freq, girar) {
  som.nota(freq);
  if (semMov()) return;
  bq.animate([
    { transform: "none" },
    { transform: "translateY(-24px)", offset: 0.4, easing: "ease-in" },
    { transform: "translateY(0)", offset: 0.78 },
    { transform: "scale(1.08, .92)", offset: 0.9 },
    { transform: "none" },
  ], { duration: 560, easing: "ease-out" });
  if (girar) $(".bq-cubo", bq).animate([{ transform: POSE_FILEIRA }, { transform: POSE_GIRO }], { duration: 560, easing: "ease-in-out" });
}

function ola() {
  const g = geracao;
  [0, 1, 2, 3, 4, 5, 6].forEach((k) => setTimeout(() => {
    if (g !== geracao) return;
    const bq = $(".bq", vagas[k]);
    if (bq) pular(bq, k < 6 ? BLOCOS[k].nota : UM.nota, k < 6);
  }, 150 * k));
}

function confete() {
  if (semMov() || typeof window.confetti !== "function") return;
  const r = vagas[6].getBoundingClientRect();
  const origin = { x: (r.left + r.width / 2) / innerWidth, y: Math.max(0.05, (r.top + r.height / 2) / innerHeight) };
  const colors = ["#D8453F", "#D9620B", "#2E9450", "#2878CC", "#8A55D0", "#D2457F", "#FFC83D", "#F5D5A1"];
  const base = { colors, disableForReducedMotion: true, zIndex: 40 };
  window.confetti({ ...base, particleCount: 110, spread: 80, startVelocity: 40, origin, shapes: ["square"], scalar: 1.2, ticks: 240 });
  setTimeout(() => window.confetti({ ...base, particleCount: 55, angle: 62, spread: 58, origin: { x: 0, y: 0.72 }, shapes: ["square", "circle"] }), 260);
  setTimeout(() => window.confetti({ ...base, particleCount: 55, angle: 118, spread: 58, origin: { x: 1, y: 0.72 }, shapes: ["square", "circle"] }), 420);
}

function final() {
  fase = "fim";
  palco.dataset.fase = "fim";
  palco.classList.add("jogando", "completo");
  linhas.forEach((li) => li.classList.add("revelado"));
  esconderMao();
  atualizarTitulo();
  fim.hidden = false;
  if (!semMov()) {
    chapeu.animate([
      { transform: "translateY(-300px) rotate(-40deg)", easing: "cubic-bezier(.5,0,1,.6)" },
      { transform: "translateY(0) rotate(-7deg)", offset: 0.6, easing: "ease-out" },
      { transform: "translateY(-16px) rotate(-3deg)", offset: 0.78, easing: "ease-in" },
      { transform: "translateY(0) rotate(-7deg)" },
    ], { duration: 950 });
    balao.animate([{ transform: "scale(0)" }, { transform: "scale(1.18)", offset: 0.7 }, { transform: "scale(1)" }], { duration: 520, delay: 700, fill: "backwards", easing: "ease-out" });
    const g = geracao;
    setTimeout(() => { if (g !== geracao) return; som.fanfarra(); confete(); ola(); }, 600);
  } else {
    som.fanfarra();
  }
  anunciar("Arthur, 1 aninho! O convite está montado.");
  if (viaTeclado) $("a", fim).focus({ preventScroll: true });
}

// ---------------- pular / montar de novo ----------------
function completarJa() {
  if (fase === "fim" && !umVoando && !voando.size) { palco.classList.add("instantaneo"); return; }
  geracao++;
  palco.classList.add("instantaneo");
  for (let i = 0; i < 7; i++) {
    const vaga = vagas[i];
    let bq = $(".bq", vaga);
    if (!bq) {
      const doMonte = $(`.bloco[data-i="${i}"] .bq`, monte);
      bq = doMonte || criarCubo(i < 6 ? BLOCOS[i] : UM, i);
      vaga.append(bq);
      vaga.classList.add("cheia");
    }
    bq.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    $$(".laco", bq).forEach((el) => el.remove());
    $(".bq-cubo", bq).style.transform = POSE_FILEIRA;
    if (i < 6) colocados.add(i);
  }
  monte.replaceChildren();
  voando.clear();
  umVoando = false;
  chapeu.getAnimations().forEach((a) => a.cancel());
  balao.getAnimations().forEach((a) => a.cancel());
  fase = "fim";
  palco.dataset.fase = "fim";
  palco.classList.add("jogando", "completo");
  linhas.forEach((li) => li.classList.add("revelado"));
  esconderMao();
  atualizarTitulo();
  fim.hidden = false;
}

function irParaConvite() {
  completarJa();
  convite.scrollIntoView({ behavior: semMov() ? "auto" : "smooth", block: "start" });
  convite.focus({ preventScroll: true });
}

btnPular.addEventListener("click", (ev) => { ev.preventDefault(); irParaConvite(); history.replaceState(null, "", "#convite"); });
$("[data-ver]", fim).addEventListener("click", (ev) => { ev.preventDefault(); irParaConvite(); history.replaceState(null, "", "#convite"); });
$("[data-denovo]", fim).addEventListener("click", () => recomecar());

function recomecar() {
  geracao++;
  fase = "letras";
  palco.dataset.fase = "letras";
  colocados.clear(); voando.clear(); umVoando = false;
  palco.classList.remove("jogando", "completo", "instantaneo");
  linhas.forEach((li) => li.classList.remove("revelado"));
  vagas.forEach((v) => { v.replaceChildren(); v.classList.remove("cheia"); });
  fim.hidden = true;
  atualizarTitulo();
  montarMonte(true);
  anunciar("Bloquinhos de volta na toalha. Toque neles para montar o convite de novo.");
  if (viaTeclado) { const p = $(".bloco", monte); if (p) p.focus({ preventScroll: true }); }
  agendarMao(1900);
}

// tocar nos bloquinhos já empilhados = xilofone
palco.addEventListener("click", (ev) => {
  const vaga = ev.target.closest(".vaga.cheia");
  if (!vaga) return;
  const k = Number(vaga.dataset.vaga);
  if (voando.has(k) || (k === 6 && umVoando)) return;
  const bq = $(".bq", vaga);
  if (bq && !bq.getAnimations().length) pular(bq, k < 6 ? BLOCOS[k].nota : UM.nota, k < 6);
});

// ---------------- mãozinha de dica ----------------
let maoTimer = 0;
function apontar(alvo) {
  if (!alvo || !alvo.isConnected || fase === "fim") return;
  const rc = chao.getBoundingClientRect(), rb = alvo.getBoundingClientRect();
  mao.style.left = `${(rb.left - rc.left + rb.width * 0.62).toFixed(1)}px`;
  mao.style.top = `${(rb.top - rc.top + rb.height * 0.8).toFixed(1)}px`;
  mao.classList.add("ativa");
}
function esconderMao() { clearTimeout(maoTimer); mao.classList.remove("ativa"); }
function agendarMao(ms) {
  clearTimeout(maoTimer);
  maoTimer = setTimeout(() => {
    const alvo = fase === "um" ? $(".bloco.dourado:not(.pego)", monte) : $(".bloco:not(.saiu):not(.pego)", monte);
    apontar(alvo);
  }, ms);
}
addEventListener("resize", () => { if (mao.classList.contains("ativa")) agendarMao(150); });

// pulinho de chamada de vez em quando
setInterval(() => {
  if (document.hidden || semMov() || fase === "fim") return;
  const livres = $$(".bloco:not(.saiu):not(.pego):not(.dourado)", monte);
  if (!livres.length) return;
  const btn = livres[Math.floor(Math.random() * livres.length)];
  const bq = $(".bq", btn);
  if (btn.getAnimations().length || bq.getAnimations().length) return;
  bq.animate([
    { transform: "none" },
    { transform: "translateY(-13px) rotate(-4deg)", offset: 0.35, easing: "ease-in" },
    { transform: "translateY(0) rotate(0)", offset: 0.7 },
    { transform: "scale(1.06, .94)", offset: 0.85 },
    { transform: "none" },
  ], { duration: 620, easing: "ease-out" });
}, 2300);

// ---------------- início ----------------
montarMonte(true);
if (/^#(convite|rsvp)$/.test(location.hash)) completarJa();
else agendarMao(semMov() ? 400 : 2300);
