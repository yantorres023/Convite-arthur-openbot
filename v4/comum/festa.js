// Motor comum dos convites interativos (conceitos 4–6): som curto gerado por WebAudio (sem arquivos de áudio),
// botão de som, confete (canvas-confetti, ISC, copiado em comum/vendor), "Pular" e movimento reduzido.
// O som começa DESLIGADO e só pode tocar depois do 1º toque (regra dos navegadores); o botão liga/desliga.
export const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;

let ctx = null, ligado = false, tocouAlgo = false;
const botaoSom = () => document.querySelector("[data-som]");
function atualizarBotao() {
  const b = botaoSom(); if (!b) return;
  b.setAttribute("aria-pressed", String(ligado));
  b.setAttribute("aria-label", ligado ? "Desligar o som" : "Ligar o som");
  b.textContent = ligado ? "🔊" : "🔇";
}
function audio() {
  if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
/** 1º toque na página liga o som (se a pessoa não desligou de propósito). */
export function prepararSom() {
  atualizarBotao();
  botaoSom()?.addEventListener("click", (e) => { e.stopPropagation(); tocouAlgo = true; ligado = !ligado; if (ligado) audio(); atualizarBotao(); if (ligado) som("pop"); });
  const primeiro = () => { if (!tocouAlgo) { tocouAlgo = true; ligado = true; audio(); atualizarBotao(); } };
  addEventListener("pointerdown", primeiro, { once: true, capture: true });
  addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") primeiro(); }, { once: true, capture: true });
}

// Pequenos sintetizadores: cada som é uma sequência de "notas" (oscilador + envelope + filtro).
function nota(a, { tipo = "sine", f0, f1 = f0, ini = 0, dur = 0.2, vol = 0.18, vib = 0, vibHz = 6, filtro = 4000 }) {
  const t = a.currentTime + ini;
  const o = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter();
  o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 30), t + dur);
  if (vib) { const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = vibHz; lg.gain.value = vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur); }
  lp.type = "lowpass"; lp.frequency.value = filtro;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(lp).connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
function ruido(a, { ini = 0, dur = 0.06, vol = 0.25, passa = 2500 }) {
  const t = a.currentTime + ini, n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = a.createBufferSource(), hp = a.createBiquadFilter(), g = a.createGain();
  s.buffer = buf; hp.type = "highpass"; hp.frequency.value = passa; g.gain.value = vol;
  s.connect(hp).connect(g).connect(a.destination); s.start(t);
}
const SONS = {
  muu: (a) => nota(a, { tipo: "sawtooth", f0: 140, f1: 100, dur: 0.9, vol: 0.16, vib: 4, vibHz: 5, filtro: 700 }),
  oinc: (a) => { nota(a, { tipo: "square", f0: 320, f1: 210, dur: 0.13, vol: 0.12, filtro: 1200 }); nota(a, { tipo: "square", f0: 300, f1: 190, ini: 0.17, dur: 0.13, vol: 0.12, filtro: 1200 }); },
  mee: (a) => nota(a, { tipo: "triangle", f0: 520, f1: 470, dur: 0.75, vol: 0.16, vib: 30, vibHz: 9, filtro: 2500 }),
  co: (a) => [0, 0.11, 0.22].forEach((ini, i) => nota(a, { tipo: "square", f0: 650 + i * 60, f1: 900, ini, dur: 0.08, vol: 0.09, filtro: 2200 })),
  rinch: (a) => nota(a, { tipo: "sawtooth", f0: 520, f1: 760, dur: 0.8, vol: 0.11, vib: 60, vibHz: 14, filtro: 1800 }),
  pio: (a) => { nota(a, { f0: 2100, f1: 2700, dur: 0.09, vol: 0.12 }); nota(a, { f0: 2200, f1: 2900, ini: 0.13, dur: 0.09, vol: 0.12 }); },
  craque: (a) => { ruido(a, { dur: 0.05, vol: 0.3, passa: 3000 }); ruido(a, { ini: 0.07, dur: 0.04, vol: 0.2, passa: 3500 }); },
  pop: (a) => nota(a, { f0: 500, f1: 1200, dur: 0.12, vol: 0.15 }),
  bum: (a) => nota(a, { tipo: "triangle", f0: 180, f1: 90, dur: 0.25, vol: 0.22, filtro: 900 }),
  sopro: (a) => ruido(a, { dur: 0.45, vol: 0.18, passa: 900 }),
  // fanfarra curta original (dó–mi–sol–dó'), não é a melodia de "Parabéns"
  festa: (a) => [[523, 0], [659, 0.14], [784, 0.28], [1047, 0.42]].forEach(([f, ini]) => nota(a, { tipo: "triangle", f0: f, ini, dur: ini === 0.42 ? 0.5 : 0.16, vol: 0.14 })),
};
export function som(nome) {
  if (!ligado) return;
  const a = audio(); if (!a || !SONS[nome]) return;
  try { SONS[nome](a); } catch { /* sem áudio: segue sem som */ }
}

/** Confete (não roda com movimento reduzido). */
export function confete(opcoes = {}) {
  if (reduzido || typeof window.confetti !== "function") return;
  const base = { particleCount: 90, spread: 75, startVelocity: 38, origin: { y: 0.6 }, scalar: 1.05, ...opcoes };
  window.confetti(base);
  setTimeout(() => window.confetti({ ...base, particleCount: 60, angle: 60, origin: { x: 0, y: 0.7 } }), 180);
  setTimeout(() => window.confetti({ ...base, particleCount: 60, angle: 120, origin: { x: 1, y: 0.7 } }), 300);
}

/** Botão "Pular": revela tudo de uma vez e leva ao convite. */
export function prepararPular(revelarTudo) {
  document.querySelector("[data-pular]")?.addEventListener("click", (e) => {
    e.preventDefault(); revelarTudo({ pulou: true });
    const alvo = document.getElementById("convite");
    alvo?.scrollIntoView({ behavior: reduzido ? "auto" : "smooth" }); alvo?.focus({ preventScroll: true });
  });
}

/** Balão com o dado revelado (lista acessível, aria-live). */
export function revelar(lista, emoji, texto) {
  const atual = document.querySelector("[data-atual]");
  if (atual) { atual.textContent = `${emoji} ${texto}`; atual.hidden = false; atual.classList.remove("novo"); void atual.offsetWidth; atual.classList.add("novo"); }
  const li = document.createElement("li");
  li.className = "balao";
  const e = document.createElement("span"); e.className = "balao-emoji"; e.setAttribute("aria-hidden", "true"); e.textContent = emoji;
  const t = document.createElement("span"); t.textContent = texto;
  li.append(e, t); lista.append(li);
  return li;
}

/** Ativa um elemento por clique, Enter ou espaço (botões já fazem isso; serve para SVG com role=button). */
export function aoTocar(el, fn) {
  el.addEventListener("click", fn);
  if (el.tagName !== "BUTTON") el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(e); } });
}
