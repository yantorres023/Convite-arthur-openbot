// Versão 11 — Teatrinho de fantoches country. Toque na cortina de chita: ela abre e os fantoches
// (chapéu de cowboy, lencinho e perninhas de botinha) sobem pela tábua do palco, um a um, sentam
// na beira, balançam as botinhas e anunciam um dado da festa. No final, dança das botinhas.
import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

// 1) RSVP primeiro — independe do teatrinho.
const formRSVP = document.querySelector("[data-rsvp]");
if (formRSVP) ligarRSVP(formRSVP, RSVP_ENDPOINT);

// 2) Som (WebAudio): nada toca antes do primeiro toque; o botão de som liga/desliga.
const Som = (() => {
  let ctx = null, mestre = null, ruidoBuf = null, ligado = true;
  const VOLUME = 0.3;
  function iniciar() {
    if (!ligado) return;
    if (ctx) { if (ctx.state === "suspended") ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      mestre = ctx.createGain(); mestre.gain.value = VOLUME; mestre.connect(ctx.destination);
      ruidoBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.2), ctx.sampleRate);
      const d = ruidoBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch { ctx = null; }
  }
  function ligar(v) {
    ligado = v;
    if (mestre) mestre.gain.setTargetAtTime(v ? VOLUME : 0, ctx.currentTime, 0.02);
  }
  function nota({ tipo = "sine", f, f2 = f, t = 0, dur = 0.2, vol = 0.4, ataque = 0.012, filtro = null, vib = null, trem = null }) {
    const t0 = ctx.currentTime + t;
    const o = ctx.createOscillator(); o.type = tipo;
    o.frequency.setValueAtTime(f, t0);
    if (f2 !== f) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let entrada = o;
    if (filtro) { const fl = ctx.createBiquadFilter(); fl.type = filtro.tipo; fl.frequency.value = filtro.f; fl.Q.value = filtro.q ?? 1; o.connect(fl); entrada = fl; }
    entrada.connect(g);
    let saida = g;
    if (trem) {
      const tg = ctx.createGain(); tg.gain.value = 1 - trem.a;
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = trem.f; lg.gain.value = trem.a; l.connect(lg).connect(tg.gain);
      g.connect(tg); saida = tg; l.start(t0); l.stop(t0 + dur + 0.05);
    }
    if (vib) {
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = vib.f; lg.gain.value = vib.a; l.connect(lg).connect(o.frequency);
      l.start(t0); l.stop(t0 + dur + 0.05);
    }
    saida.connect(mestre);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function ruido({ t = 0, dur = 0.5, f1 = 400, f2 = 2400, vol = 0.3, q = 1.2 }) {
    const t0 = ctx.currentTime + t;
    const s = ctx.createBufferSource(); s.buffer = ruidoBuf;
    const fl = ctx.createBiquadFilter(); fl.type = "bandpass"; fl.Q.value = q;
    fl.frequency.setValueAtTime(f1, t0); fl.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(fl).connect(g).connect(mestre);
    s.start(t0); s.stop(t0 + dur + 0.05);
  }
  const caixinha = (f, t, dur) => { nota({ f, t, dur, vol: 0.3, ataque: 0.006 }); nota({ f: f * 2, t, dur: dur * 0.6, vol: 0.08, ataque: 0.006 }); };
  const sons = {
    cortina() {
      ruido({ dur: 0.75, f1: 300, f2: 2600, vol: 0.32 });
      [523.25, 659.25, 783.99].forEach((f, i) => nota({ tipo: "triangle", f, t: 0.28 + i * 0.12, dur: 0.16, vol: 0.32 }));
      nota({ tipo: "triangle", f: 1046.5, t: 0.64, dur: 0.55, vol: 0.34 });
    },
    fecha() { ruido({ dur: 0.6, f1: 2400, f2: 300, vol: 0.26 }); },
    sobe() { nota({ f: 300, f2: 720, dur: 0.2, vol: 0.32 }); },
    // toc-toc das botinhas na tábua do palco
    toc() {
      [0, 0.1].forEach((t) => {
        nota({ tipo: "triangle", f: 820, f2: 430, t, dur: 0.06, vol: 0.22, ataque: 0.002 });
        ruido({ t, dur: 0.05, f1: 2200, f2: 1300, vol: 0.12, q: 2.5 });
      });
    },
    // sapateado no compasso do "Parabéns" (12 tempos de 0,3 s, a partir de 0,15 s)
    sapateado() {
      for (let k = 0; k < 12; k++) {
        const t = 0.15 + k * 0.3;
        nota({ tipo: "triangle", f: k % 2 ? 700 : 900, f2: 380, t, dur: 0.05, vol: 0.13, ataque: 0.002 });
        ruido({ t, dur: 0.045, f1: 2400, f2: 1400, vol: 0.07, q: 2.5 });
      }
    },
    desce() { nota({ f: 560, f2: 230, dur: 0.18, vol: 0.2 }); },
    pop() { nota({ f: 520, f2: 940, dur: 0.11, vol: 0.28 }); },
    vaca() { nota({ tipo: "sawtooth", f: 196, f2: 140, dur: 0.95, vol: 0.5, ataque: 0.14, filtro: { tipo: "lowpass", f: 820, q: 5 }, vib: { f: 5, a: 5 } }); },
    porco() { [0, 0.2].forEach((t) => nota({ tipo: "square", f: 540, f2: 320, t, dur: 0.13, vol: 0.28, filtro: { tipo: "bandpass", f: 1200, q: 2.5 } })); },
    pinto() { [0, 0.15].forEach((t) => nota({ f: 2300, f2: 3200, t, dur: 0.09, vol: 0.26 })); },
    ovelha() { nota({ tipo: "sawtooth", f: 430, f2: 380, dur: 0.62, vol: 0.42, ataque: 0.04, filtro: { tipo: "bandpass", f: 1400, q: 1.6 }, trem: { f: 19, a: 0.6 } }); },
    cavalo() { [[0, 820], [0.15, 640], [0.32, 900]].forEach(([t, f]) => nota({ tipo: "square", f, f2: f * 0.7, t, dur: 0.07, vol: 0.3, filtro: { tipo: "bandpass", f: 1300, q: 3 } })); },
    parabens() {
      // "Parabéns a você" (melodia em domínio público), em caixinha de música
      const G = 392, A = 440, B = 493.88, C = 523.25, D = 587.33, bt = 0.3;
      const seq = [[G, 0.75], [G, 0.25], [A, 1], [G, 1], [C, 1], [B, 2], [G, 0.75], [G, 0.25], [A, 1], [G, 1], [D, 1], [C, 2]];
      let t = 0.15;
      for (const [f, n] of seq) { caixinha(f, t, Math.min(1.1, n * bt + 0.35)); t += n * bt; }
    },
  };
  return {
    iniciar, ligar,
    tocar(nome) { if (!ctx || !ligado) return; try { sons[nome]?.(); } catch { /* som é opcional */ } },
  };
})();

// 3) Teatrinho
const ELENCO = [
  { id: "vaca", nome: "Vaquinha", som: "Muuu!", cor: "#2D6CC0", marca: "#4A8AE0",
    html: '<span class="b-pre">É o aniversário do</span><strong class="b-grande">Arthur</strong><span class="b-pos">1 aninho!</span>',
    fala: "É o aniversário do Arthur: 1 aninho!" },
  { id: "porco", nome: "Porquinho", som: "Oinc, oinc!", cor: "#C2185B", marca: "#FF8FB1",
    html: '<span class="b-pre">Domingo,</span><strong class="b-grande">29 de novembro</strong><span class="b-pos">de 2026</span>',
    fala: "Domingo, 29 de novembro de 2026." },
  { id: "pinto", nome: "Pintinho", som: "Piu, piu!", cor: "#B45309", marca: "#FFD43B",
    html: '<span class="b-pre">às</span><strong class="b-gigante">15h</strong>',
    fala: "Às 15h!" },
  { id: "ovelha", nome: "Ovelhinha", som: "Méé!", cor: "#7B4FD1", marca: "#B79CF0",
    html: '<strong class="b-grande">Casa da Árvore</strong><span class="b-end">Rua Castelo Branco, nº 31</span><span class="b-end">Cidade Nova, Santana do Paraíso</span>',
    fala: "Na Casa da Árvore: Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso." },
  { id: "cavalo", nome: "Cavalinho", som: "Pocotó!", cor: "#A0461F", marca: "#E0A066",
    html: '<span class="b-pre">Venha caracterizado:</span><strong class="b-grande">country/fazendinha</strong>',
    fala: "Venha caracterizado: country/fazendinha!" },
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const teatro = $("#teatro");
const palco = $("#palco"), balao = $("#balao"), balaoSom = $("#balao-som"), balaoTxt = $("#balao-txt");
const faixa = $("#faixa"), fila = $("#fila"), dica = $("#dica"), anuncio = $("#anuncio");
const btnPular = $("#pular"), btnBis = $("#bis"), btnSom = $("#som");
const progresso = $$(".progresso circle");
const movsCortina = $$(".cortina-mov");

const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
let reduz = mq.matches;
mq.addEventListener?.("change", (e) => { reduz = e.matches; });

const bichos = ELENCO.map((b, i) => {
  const el = document.getElementById("f-" + b.id);
  const pernas = document.getElementById("p-" + b.id);
  return { ...b, i, el, sobe: el.querySelector(".f-sobe"), pernas, pSobe: pernas.querySelector(".p-sobe") };
});

const SOLO = { x: 200, y: 524, s: 1 };
const NA_FILA = (i) => ({ x: 102 + i * 49, y: 494, s: 0.64 });
const ESCONDIDO = "translateY(270px)";
const PERNAS_ESCONDIDAS = "translateY(-64px)"; // acima da beira do palco = recortadas
const BEIRA_DO_PALCO = 456;
const DICA = {
  fechado: "Respeitável público: o show vai começar!",
  show: "Toque no palco para chamar o próximo bichinho",
  final: "Toque nos bichinhos para ouvir de novo!",
};

let rodada = 0;            // muda a cada abertura/pulo/bis: cancela sequências antigas
let avancar = null;        // resolve a espera do bichinho atual ("próximo")
let timerBalao = 0;

const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));
const fim = (a) => a.finished.then(() => {}, () => {});
const cancelar = (el) => el.getAnimations().forEach((a) => a.cancel());
const tempoLeitura = (b) => Math.min(6000, 1900 + b.fala.length * 38);

function esperarOuProximo(ms) {
  return new Promise((ok) => {
    const pronto = () => { clearTimeout(t); avancar = null; ok(); };
    const t = setTimeout(pronto, ms);
    avancar = pronto;
  });
}

function posicionar(b, p) {
  b.el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.s})`;
  b.pernas.style.transform = `translate(${p.x}px, ${BEIRA_DO_PALCO}px) scale(${p.s})`;
}

// o fantoche (e as perninhas) ficam visíveis já no lugar final
function mostrarParado(b) {
  cancelar(b.sobe); cancelar(b.pSobe);
  b.sobe.style.transform = "translateY(0px)"; b.sobe.style.opacity = "1";
  b.pSobe.style.transform = "translateY(0px)"; b.pSobe.style.opacity = "1";
}

function falando(b, sim) {
  b.el.classList.toggle("falando", sim);
  b.pernas.classList.toggle("falando", sim);
}

function subir(b, atraso = 0) {
  const s = b.sobe, ps = b.pSobe;
  cancelar(s); cancelar(ps);
  s.style.transform = "translateY(0px)"; s.style.opacity = "1";
  ps.style.transform = "translateY(0px)"; ps.style.opacity = "1";
  if (reduz) {
    ps.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: atraso, fill: "backwards" });
    return fim(s.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: atraso, fill: "backwards" }));
  }
  const r = rodada;
  setTimeout(() => { if (r === rodada) Som.tocar("sobe"); }, atraso);
  // quando o corpo passa da tábua, as perninhas caem por cima da beira: toc-toc!
  ps.animate([
    { transform: PERNAS_ESCONDIDAS },
    { transform: "translateY(7px)", offset: 0.62 },
    { transform: "translateY(-3px)", offset: 0.82 },
    { transform: "translateY(0px)" },
  ], { duration: 380, delay: atraso + 360, easing: "cubic-bezier(.3,.7,.4,1)", fill: "backwards" });
  if (atraso === 0) setTimeout(() => { if (r === rodada) Som.tocar("toc"); }, 600);
  return fim(s.animate([
    { transform: ESCONDIDO },
    { transform: "translateY(-18px)", offset: 0.66 },
    { transform: "translateY(5px)", offset: 0.85 },
    { transform: "translateY(0px)" },
  ], { duration: 680, delay: atraso, easing: "cubic-bezier(.3,.7,.4,1)", fill: "backwards" }));
}

function descer(b) {
  const s = b.sobe, ps = b.pSobe;
  cancelar(s); cancelar(ps);
  falando(b, false);
  s.style.transform = ESCONDIDO;
  ps.style.transform = PERNAS_ESCONDIDAS;
  if (reduz) {
    ps.animate([{ opacity: 1, transform: "translateY(0px)" }, { opacity: 0, transform: "translateY(0px)" }], { duration: 200 });
    return fim(s.animate([{ opacity: 1, transform: "translateY(0px)" }, { opacity: 0, transform: "translateY(0px)" }], { duration: 200 }));
  }
  Som.tocar("desce");
  // recolhe as perninhas primeiro, depois desce
  ps.animate([{ transform: "translateY(0px)" }, { transform: "translateY(5px)", offset: 0.3 }, { transform: PERNAS_ESCONDIDAS }],
    { duration: 200, easing: "cubic-bezier(.5,0,.8,.4)" });
  return fim(s.animate([
    { transform: "translateY(0px)" },
    { transform: "translateY(-12px)", offset: 0.25 },
    { transform: ESCONDIDO },
  ], { duration: 440, delay: 60, easing: "cubic-bezier(.5,0,.8,.4)", fill: "backwards" }));
}

function marcar(b, sim = true) {
  const c = progresso[b.i];
  if (c) c.style.fill = sim ? b.marca : "";
}

function falar(b, modo) {
  clearTimeout(timerBalao);
  bichos.forEach((o) => falando(o, false));
  balao.dataset.modo = modo;
  balao.style.setProperty("--cor", b.cor);
  // na fila, o rabinho do balão aponta para o bichinho (balão vai de x=52 a x=348 no palco)
  balao.style.setProperty("--rabo", modo === "fila" ? `${((NA_FILA(b.i).x - 52) / 296) * 100}%` : "50%");
  balaoSom.textContent = b.som;
  balaoTxt.innerHTML = b.html;
  balao.classList.remove("visivel"); void balao.offsetWidth; balao.classList.add("visivel");
  teatro.dataset.falando = b.id;
  falando(b, true);
  anuncio.textContent = `${b.nome}: ${b.fala}`;
  Som.tocar(b.id);
  const r = rodada;
  setTimeout(() => { if (r === rodada && teatro.dataset.falando === b.id) falando(b, false); }, 1500);
}

function calar() {
  balao.classList.remove("visivel");
  delete teatro.dataset.falando;
  bichos.forEach((b) => falando(b, false));
}

async function abrirCortina() {
  Som.tocar("cortina");
  movsCortina.forEach((m) => { cancelar(m); m.style.transform = "scaleX(.14)"; });
  teatro.classList.add("aberto");
  if (reduz) return pausa(150);
  await Promise.all(movsCortina.map((m) => fim(m.animate([
    { transform: "scaleX(1)" },
    { transform: "scaleX(1.03)", offset: 0.12 },
    { transform: "scaleX(.1)", offset: 0.78 },
    { transform: "scaleX(.17)", offset: 0.9 },
    { transform: "scaleX(.14)" },
  ], { duration: 1050, easing: "cubic-bezier(.55,0,.3,1)" }))));
}

async function fecharCortina() {
  teatro.classList.remove("aberto");
  movsCortina.forEach((m) => { cancelar(m); m.style.transform = "scaleX(1)"; });
  if (reduz) return;
  Som.tocar("fecha");
  await Promise.all(movsCortina.map((m) => fim(m.animate(
    [{ transform: "scaleX(.14)" }, { transform: "scaleX(1)" }],
    { duration: 780, easing: "cubic-bezier(.5,0,.3,1)" }))));
}

function mostrarFila(focar) {
  palco.hidden = true;
  fila.hidden = false;
  if (focar) fila.querySelector(".fila-bicho")?.focus();
}

async function abrir() {
  if (teatro.dataset.fase !== "fechado") return;
  const r = ++rodada;
  teatro.dataset.fase = "abrindo";
  palco.setAttribute("aria-label", "Chamar o próximo bichinho");
  dica.textContent = DICA.show;
  anuncio.textContent = "A cortina abriu!";
  await abrirCortina();
  if (r !== rodada) return;
  teatro.dataset.fase = "show";
  for (const b of bichos) {
    posicionar(b, SOLO);
    await subir(b);
    if (r !== rodada) return;
    marcar(b);
    falar(b, "solo");
    await esperarOuProximo(tempoLeitura(b));
    if (r !== rodada) return;
    calar();
    const desceu = descer(b);
    await (b.i === bichos.length - 1 ? desceu : pausa(reduz ? 200 : 240));
    if (r !== rodada) return;
  }
  await final(r);
}

async function final(r) {
  teatro.dataset.fase = "final";
  const focar = document.activeElement === palco;
  bichos.forEach((b, i) => posicionar(b, NA_FILA(i)));
  await Promise.all(bichos.map((b, i) => subir(b, i * 120)));
  if (r !== rodada) return;
  bichos.forEach((b) => marcar(b));
  faixa.classList.add("visivel");
  anuncio.textContent = "Você está convidado! Toque nos bichinhos para ouvir de novo.";
  dica.textContent = DICA.final;
  mostrarFila(focar);
  btnBis.hidden = false;
  btnPular.firstChild.textContent = "Ver o convite";
  Som.tocar("parabens");
  confete();
  if (!reduz) {
    // grand finale: dança das botinhas no compasso do "Parabéns"
    teatro.classList.add("danca");
    Som.tocar("sapateado");
    setTimeout(() => { if (r === rodada) teatro.classList.remove("danca"); }, 3950);
    bichos.forEach((b, i) => {
      falando(b, true);
      b.sobe.animate([{ transform: "translateY(0px)" }, { transform: "translateY(26px)", offset: 0.45 }, { transform: "translateY(0px)" }],
        { duration: 820, delay: 300 + i * 90, easing: "ease-in-out" });
      setTimeout(() => { if (r === rodada && !teatro.dataset.falando) falando(b, false); }, 1700);
    });
  }
}

function irParaFinal() {
  rodada++;
  avancar = null;
  clearTimeout(timerBalao);
  movsCortina.forEach((m) => { cancelar(m); m.style.transform = "scaleX(.14)"; });
  teatro.classList.add("aberto");
  teatro.classList.remove("danca");
  calar();
  bichos.forEach((b, i) => {
    posicionar(b, NA_FILA(i));
    mostrarParado(b);
    marcar(b);
  });
  faixa.classList.remove("escondida");
  faixa.classList.add("visivel");
  teatro.dataset.fase = "final";
  dica.textContent = DICA.final;
  mostrarFila(false);
  btnBis.hidden = false;
  btnPular.firstChild.textContent = "Ver o convite";
}

function tocarBicho(b) {
  Som.iniciar();
  faixa.classList.add("escondida");
  falar(b, "fila");
  if (!reduz) {
    b.sobe.animate([
      { transform: "translateY(0px)" }, { transform: "translateY(-36px)", offset: 0.4 },
      { transform: "translateY(4px)", offset: 0.8 }, { transform: "translateY(0px)" },
    ], { duration: 560, easing: "ease-out" });
  }
  timerBalao = setTimeout(() => { calar(); faixa.classList.remove("escondida"); }, tempoLeitura(b));
}

async function bis() {
  const r = ++rodada;
  Som.iniciar();
  avancar = null;
  clearTimeout(timerBalao);
  calar();
  teatro.classList.remove("danca");
  faixa.classList.remove("visivel", "escondida");
  btnBis.hidden = true;
  fila.hidden = true;
  palco.hidden = false;
  palco.focus({ preventScroll: true });
  teatro.dataset.fase = "fechando";
  dica.textContent = DICA.fechado;
  await Promise.all(bichos.map(descer));
  if (r !== rodada) return;
  await fecharCortina();
  if (r !== rodada) return;
  bichos.forEach((b) => marcar(b, false));
  btnPular.firstChild.textContent = "Pular e ver o convite";
  teatro.dataset.fase = "fechado";
  palco.removeAttribute("aria-label");
  await pausa(reduz ? 100 : 450);
  if (r !== rodada) return;
  abrir();
}

// Confete de florzinhas de chita
let formaFlor = null;
function caminhoFlor() {
  const n = 5, r1 = 3.2, r2 = 11; let d = "";
  for (let k = 0; k < n; k++) {
    const a0 = (k / n) * Math.PI * 2 - Math.PI / 2, a1 = ((k + 1) / n) * Math.PI * 2 - Math.PI / 2, am = (a0 + a1) / 2;
    const p = (a, r) => `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
    if (k === 0) d += `M${p(a0, r1)}`;
    d += `C${p(am - 0.55, r2)} ${p(am + 0.55, r2)} ${p(a1, r1)}`;
  }
  return d + "Z";
}
function confete() {
  const c = window.confetti;
  if (typeof c !== "function" || reduz) return;
  try { if (!formaFlor && c.shapeFromPath) formaFlor = c.shapeFromPath({ path: caminhoFlor() }); } catch { formaFlor = null; }
  const r = teatro.getBoundingClientRect();
  const y = Math.min(0.9, Math.max(0.05, (r.top + r.height * 0.32) / window.innerHeight));
  const base = {
    particleCount: 55, spread: 64, startVelocity: 42, ticks: 260, gravity: 0.95, scalar: 1.15, zIndex: 60,
    colors: ["#D7263D", "#FFC83D", "#3E8EDE", "#FF8DB5", "#FFFFFF", "#B5652E"],
    shapes: formaFlor ? [formaFlor, formaFlor, "circle", "square"] : ["circle", "square"],
    disableForReducedMotion: true,
  };
  c({ ...base, angle: 62, origin: { x: (r.left + r.width * 0.16) / window.innerWidth, y } });
  c({ ...base, angle: 118, origin: { x: (r.left + r.width * 0.84) / window.innerWidth, y } });
  setTimeout(() => c({ ...base, particleCount: 45, angle: 90, spread: 110, startVelocity: 30, origin: { x: 0.5, y: Math.max(0.05, y - 0.06) } }), 420);
}

// Eventos
palco.addEventListener("click", () => {
  Som.iniciar();
  const fase = teatro.dataset.fase;
  if (fase === "fechado") abrir();
  else if (fase === "show" && avancar) { Som.tocar("pop"); avancar(); }
});
$$(".fila-bicho").forEach((btn) => btn.addEventListener("click", () => tocarBicho(bichos[Number(btn.dataset.i)])));
btnBis.addEventListener("click", bis);
btnPular.addEventListener("click", (ev) => {
  ev.preventDefault();
  if (teatro.dataset.fase !== "final") irParaFinal();
  const alvo = document.getElementById("convite");
  alvo.scrollIntoView({ behavior: reduz ? "auto" : "smooth", block: "start" });
  alvo.focus({ preventScroll: true });
});
btnSom.addEventListener("click", () => {
  const ligado = btnSom.getAttribute("aria-pressed") !== "true";
  btnSom.setAttribute("aria-pressed", String(ligado));
  Som.ligar(ligado);
  if (ligado) { Som.iniciar(); Som.tocar("pop"); }
});
dica.textContent = DICA.fechado;
