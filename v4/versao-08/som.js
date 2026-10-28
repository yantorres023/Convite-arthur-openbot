// Som da bandinha — WebAudio puro, sem arquivos. Mudo até o 1º toque (o navegador só libera áudio com gesto).
let ctx = null, saida = null, comp = null, ruidoBuf = null, ligado = true;
const VOL = 0.85;
const cordas = new Map();

export const estaLigado = () => ligado;
export const agora = () => (ctx ? ctx.currentTime : 0);
export const ativo = () => !!ctx && ligado && ctx.state === "running";

/** Cria/retoma o contexto. Chamar dentro de um gesto do usuário. */
export function preparar() {
  if (!ligado) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC({ latencyHint: "interactive" }); } catch { return null; }
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 3.5; comp.attack.value = 0.003; comp.release.value = 0.25;
    saida = ctx.createGain(); saida.gain.value = VOL;
    saida.connect(comp); comp.connect(ctx.destination);
    ruidoBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = ruidoBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function alternar() {
  ligado = !ligado;
  if (ctx) {
    if (ligado) { ctx.resume().catch(() => {}); saida.gain.setTargetAtTime(VOL, ctx.currentTime, 0.03); }
    else saida.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
  }
  return ligado;
}

/** Corta tudo o que estiver agendado (ex.: pular para o convite no meio do final). */
export function silenciar() {
  if (!ctx) return;
  const antiga = saida;
  antiga.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
  setTimeout(() => antiga.disconnect(), 400);
  saida = ctx.createGain(); saida.gain.value = ligado ? VOL : 0; saida.connect(comp);
}

// ---------- utilidades ----------
const ganho = (v = 0) => { const g = ctx.createGain(); g.gain.value = v; return g; };
function osc(tipo, f, t, fim) { const o = ctx.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(fim); return o; }
function perc(g, t, pico, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(pico, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dec); }
function ruido(t, dur) { const s = ctx.createBufferSource(); s.buffer = ruidoBuf; s.start(t, Math.random() * 0.8); s.stop(t + dur); return s; }
function filtro(tipo, f, q = 0.8) { const b = ctx.createBiquadFilter(); b.type = tipo; b.frequency.value = f; b.Q.value = q; return b; }

// Corda dedilhada (Karplus-Strong), com afinação fina por playbackRate.
function corda(f) {
  const k = f.toFixed(2);
  if (cordas.has(k)) return cordas.get(k);
  const sr = ctx.sampleRate, P = sr / f, N = Math.max(2, Math.floor(P - 0.5)), len = Math.floor(sr * 1.5);
  const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
  for (let i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
  for (let i = 1; i < N; i++) d[i] = (d[i] + d[i - 1]) * 0.5; // ataque mais macio
  for (let i = N; i < len; i++) d[i] = 0.5 * (d[i - N] + (i - N - 1 >= 0 ? d[i - N - 1] : 0)) * 0.996;
  const r = { buf, rate: (N + 0.5) / P };
  cordas.set(k, r);
  return r;
}

const instrumentos = {
  xilofone(f, t, v) {
    const g = ganho(), g2 = ganho();
    osc("sine", f, t, t + 1.2).connect(g);
    osc("sine", f * 4, t, t + 0.3).connect(g2);
    perc(g, t, 0.5 * v, 1.1); perc(g2, t, 0.16 * v, 0.14);
    g.connect(saida); g2.connect(saida);
  },
  tambor(f, t, v) {
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(f * 1.9, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
    o.start(t); o.stop(t + 0.7);
    const g = ganho(); perc(g, t, 0.75 * v, 0.55); o.connect(g); g.connect(saida);
    const g2 = ganho(); perc(g2, t, 0.32 * v, 0.3); osc("triangle", f / 2, t, t + 0.4).connect(g2); g2.connect(saida);
    const bp = filtro("bandpass", 1600, 0.9), g3 = ganho(); perc(g3, t, 0.3 * v, 0.07);
    ruido(t, 0.12).connect(bp); bp.connect(g3); g3.connect(saida);
  },
  sanfona(f, t, v, dur = 0.42) {
    const lp = filtro("lowpass", Math.min(3200, f * 5), 0.8);
    const trem = ganho(1), lg = ganho(0.12);
    osc("sine", 5.6, t, t + dur + 0.3).connect(lg); lg.connect(trem.gain);
    const g = ganho();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16 * v, t + 0.03);
    g.gain.setValueAtTime(0.16 * v, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.18);
    [f * 1.004, f * 0.996].forEach((fr) => osc("sawtooth", fr, t, t + dur + 0.25).connect(lp));
    const gs = ganho(0.35); osc("square", f / 2, t, t + dur + 0.25).connect(gs); gs.connect(lp);
    lp.connect(trem); trem.connect(g); g.connect(saida);
  },
  flauta(f, t, v, dur = 0.4) {
    const g = ganho();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32 * v, t + 0.05);
    g.gain.setValueAtTime(0.3 * v, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.16);
    const o = osc("sine", f, t, t + dur + 0.2), o2 = osc("triangle", f, t, t + dur + 0.2), g2 = ganho(0.25);
    const vg = ganho(f * 0.007); osc("sine", 5.2, t, t + dur + 0.2).connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(saida);
    const bp = filtro("bandpass", f * 2, 2), gn = ganho(); perc(gn, t, 0.08 * v, 0.1);
    ruido(t, 0.12).connect(bp); bp.connect(gn); gn.connect(saida);
  },
  violao(f, t, v) {
    const { buf, rate } = corda(f);
    const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
    const lp = filtro("lowpass", 4200, 0.7), g = ganho(0.55 * v);
    src.connect(lp); lp.connect(g); g.connect(saida); src.start(t);
  },
};

/** Toca uma nota. instr: xilofone|tambor|sanfona|flauta|violao */
export function tocar(instr, f, { t, v = 1, dur } = {}) {
  if (!ctx || !ligado || !instrumentos[instr]) return;
  instrumentos[instr](f, t ?? ctx.currentTime + 0.01, v, dur);
}

export function dedilhar(freqs, t, v = 0.55) {
  if (!ctx || !ligado) return;
  freqs.forEach((f, i) => instrumentos.violao(f, (t ?? ctx.currentTime) + i * 0.022, v));
}

/** "Tcharam!" de fim de verso: arpejo no xilofone + brilho de prato. */
export function tcharam(t, v = 0.75) {
  if (!ctx || !ligado) return;
  const tt = t ?? ctx.currentTime + 0.02;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => instrumentos.xilofone(f, tt + i * 0.075, v));
  const hp = filtro("highpass", 7000, 0.7), g = ganho();
  g.gain.setValueAtTime(0.0001, tt + 0.3); g.gain.exponentialRampToValueAtTime(0.12 * v, tt + 0.31); g.gain.exponentialRampToValueAtTime(0.0001, tt + 1.2);
  ruido(tt + 0.3, 1).connect(hp); hp.connect(g); g.connect(saida);
}
