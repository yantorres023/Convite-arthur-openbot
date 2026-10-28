import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

ligarRSVP(document.querySelector("form[data-rsvp]"), RSVP_ENDPOINT);

const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
const cena = document.querySelector("[data-cena]");
const dica = document.querySelector("[data-dica]");
const final = document.querySelector("[data-final]");

/* ---------- Bichinhos (SVG originais) ---------- */
const olhos = (y = 50, dx = 11) => `<circle cx="${50 - dx}" cy="${y}" r="4.2" fill="#2b1a0c"/><circle cx="${50 + dx}" cy="${y}" r="4.2" fill="#2b1a0c"/><circle cx="${51.5 - dx}" cy="${y - 1.6}" r="1.5" fill="#fff"/><circle cx="${51.5 + dx}" cy="${y - 1.6}" r="1.5" fill="#fff"/>`;
const bochechas = (y = 60, dx = 19, c = "#ff8fa3") => `<ellipse cx="${50 - dx}" cy="${y}" rx="5" ry="3.4" fill="${c}" opacity=".75"/><ellipse cx="${50 + dx}" cy="${y}" rx="5" ry="3.4" fill="${c}" opacity=".75"/>`;
// chapéu de cowboy infantil (centro cx, base da aba y, escala s, cor da copa)
const chapeu = (cx, y, s = 1, cor = "#d79a5c") => `<g transform="translate(${cx} ${y}) scale(${s})" stroke="#3b2412" stroke-width="${(2 / s).toFixed(2)}" stroke-linejoin="round"><path d="M-36-4q4 8 36 9 32-1 36-9-2 12-36 13-34-1-36-13z" fill="#a8743f"/><path d="M-18 0q-3-19 7-24 9 5 11 5t11-5q10 5 7 24-18 5-36 0z" fill="${cor}"/><path d="M-18-6q18 5 36 0v6q-18 5-36 0z" fill="#d63a3a" stroke="none"/><circle cx="12" cy="-3" r="2.6" fill="#ffd84f" stroke-width="${(1.2 / s).toFixed(2)}"/></g>`;
// lencinho/bandana no pescoço (y = linha do pescoço, w = meia largura, cor)
const bandana = (y, w = 22, cor = "#d63a3a") => `<path d="M${50 - w} ${y}q${w} 7 ${2 * w} 0l-${w - 4} 15q-4 4-8 0z" fill="${cor}" stroke="#3b2412" stroke-width="2" stroke-linejoin="round"/><path d="M${50 + w - 3} ${y + 1}l7 7-3 3-7-6z" fill="${cor}" stroke="#3b2412" stroke-width="1.6"/><g fill="#fff"><circle cx="${50 - w / 2}" cy="${y + 5}" r="1.5"/><circle cx="50" cy="${y + 7}" r="1.5"/><circle cx="${50 + w / 2}" cy="${y + 5}" r="1.5"/><circle cx="50" cy="${y + 13}" r="1.4"/></g>`;
const V = `<svg viewBox="0 -2 100 112">`;
const BICHOS = {
  vaca: `${V}<path d="M24 44q-14-2-16 6 8 6 18 2z" fill="#f2c9a8" stroke="#3b2412" stroke-width="2"/><path d="M76 44q14-2 16 6-8 6-18 2z" fill="#f2c9a8" stroke="#3b2412" stroke-width="2"/><ellipse cx="50" cy="58" rx="28" ry="29" fill="#fff" stroke="#3b2412" stroke-width="2.4"/><path d="M28 44q8-6 14 2-2 10-12 8-6-4-2-10z" fill="#3b2412"/><circle cx="69" cy="68" r="5" fill="#3b2412"/><ellipse cx="50" cy="73" rx="20" ry="12" fill="#ffc2cf" stroke="#3b2412" stroke-width="2"/><ellipse cx="43" cy="73" rx="2.6" ry="3.4" fill="#a3445f"/><ellipse cx="57" cy="73" rx="2.6" ry="3.4" fill="#a3445f"/>${olhos(54, 11)}${bandana(86, 22)}${chapeu(50, 34, 1)}</svg>`,
  porco: `${V}<path d="M20 42 13 20l25 13z" fill="#f48aa6" stroke="#3b2412" stroke-width="2"/><path d="M80 42l7-22-25 13z" fill="#f48aa6" stroke="#3b2412" stroke-width="2"/><circle cx="50" cy="58" r="30" fill="#ffb3c6" stroke="#3b2412" stroke-width="2.4"/><ellipse cx="50" cy="68" rx="14" ry="10" fill="#f48aa6" stroke="#3b2412" stroke-width="2"/><ellipse cx="45" cy="68" rx="2.6" ry="3.4" fill="#a3445f"/><ellipse cx="55" cy="68" rx="2.6" ry="3.4" fill="#a3445f"/>${olhos(52, 12)}${bochechas(63, 21)}${bandana(86, 20, "#2f6fb5")}${chapeu(50, 34, .9, "#c98a4f")}</svg>`,
  pintinho: `${V}<circle cx="50" cy="58" r="30" fill="#ffe14d" stroke="#3b2412" stroke-width="2.4"/><path d="M21 62q-8 4-6 12 8 0 12-6z" fill="#ffd21f" stroke="#3b2412" stroke-width="2"/><path d="M79 62q8 4 6 12-8 0-12-6z" fill="#ffd21f" stroke="#3b2412" stroke-width="2"/>${olhos(53, 11)}${bochechas(64, 20)}<path d="M42 62l8 9 8-9q-8-4-16 0z" fill="#ff8a1e" stroke="#3b2412" stroke-width="2" stroke-linejoin="round"/>${bandana(84, 20)}${chapeu(50, 35, .85, "#e7b46c")}</svg>`,
  ovelha: `${V}<g fill="#fff" stroke="#3b2412" stroke-width="2.2"><circle cx="30" cy="42" r="12"/><circle cx="70" cy="42" r="12"/><circle cx="22" cy="60" r="12"/><circle cx="78" cy="60" r="12"/><circle cx="30" cy="78" r="11"/><circle cx="70" cy="78" r="11"/></g><circle cx="50" cy="60" r="26" fill="#fff"/><path d="M29 54q-12-2-14 6 8 5 16 0z" fill="#8a6650" stroke="#3b2412" stroke-width="2"/><path d="M71 54q12-2 14 6-8 5-16 0z" fill="#8a6650" stroke="#3b2412" stroke-width="2"/><ellipse cx="50" cy="62" rx="18" ry="20" fill="#b48b70" stroke="#3b2412" stroke-width="2.2"/>${olhos(59, 8)}${bochechas(68, 13)}<path d="M45 72q5 4 10 0" fill="none" stroke="#3b2412" stroke-width="2.2" stroke-linecap="round"/>${bandana(84, 18, "#ff8a3d")}${chapeu(50, 42, .85, "#d79a5c")}</svg>`,
  cavalo: `${V}<path d="M32 34l-5-14 13 8z" fill="#b2733c" stroke="#3b2412" stroke-width="2"/><path d="M68 34l5-14-13 8z" fill="#b2733c" stroke="#3b2412" stroke-width="2"/><path d="M50 28c17 0 24 12 24 27 0 9-2 16-4 21H30c-2-5-4-12-4-21 0-15 7-27 24-27z" fill="#c98a4f" stroke="#3b2412" stroke-width="2.4"/><path d="M40 36q6 8 2 16-6-6-2-16z" fill="#5a3a1c"/><ellipse cx="50" cy="73" rx="20" ry="13" fill="#f0c9a0" stroke="#3b2412" stroke-width="2.2"/><ellipse cx="43" cy="73" rx="2.6" ry="3.4" fill="#7a4a2a"/><ellipse cx="57" cy="73" rx="2.6" ry="3.4" fill="#7a4a2a"/>${olhos(53, 12)}${bandana(86, 22)}${chapeu(50, 34, 1, "#efe3c8")}</svg>`,
  pato: `${V}<circle cx="50" cy="58" r="29" fill="#fff" stroke="#3b2412" stroke-width="2.4"/>${olhos(53, 12)}${bochechas(62, 21)}<path d="M34 66q16-9 32 0-4 11-16 11T34 66z" fill="#ff9a1f" stroke="#3b2412" stroke-width="2.2" stroke-linejoin="round"/><path d="M37 68q13 4 26 0" fill="none" stroke="#3b2412" stroke-width="1.8"/>${bandana(85, 20, "#2f6fb5")}${chapeu(50, 35, .95, "#c98a4f")}</svg>`,
};
const IC = {
  coracao: `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z" fill="#e2433a"/></svg>`,
  vela: `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2q3 3 0 6-3-3 0-6z" fill="#ff9a1f"/><rect x="9" y="9" width="6" height="13" rx="2" fill="#2f6fb5"/><path d="M9 13l6-2M9 17l6-2" stroke="#fff" stroke-width="1.4"/></svg>`,
  cal: `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" fill="#fff" stroke="#3b2412" stroke-width="1.8"/><path d="M3 9h18" stroke="#3b2412" stroke-width="1.8"/><rect x="3" y="5" width="18" height="4" rx="2" fill="#e2433a"/><circle cx="12" cy="15" r="2.4" fill="#e2433a"/></svg>`,
  relogio: `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#ffd84f" stroke="#3b2412" stroke-width="1.8"/><path d="M12 7v5l3 2" stroke="#3b2412" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>`,
  arvore: `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="10.5" y="13" width="3" height="9" rx="1" fill="#a8743f"/><circle cx="12" cy="9" r="7" fill="#6bbf59"/><rect x="9" y="7" width="6" height="5" rx="1" fill="#d79a5c" stroke="#3b2412" stroke-width="1"/></svg>`,
  chapeu: `<svg class="ic" viewBox="0 0 64 40" aria-hidden="true"><path d="M6 30q26 12 52 0-4 6-26 7T6 30z" fill="#a8743f"/><path d="M18 30q-2-18 6-24 8 4 8 4t8-4q8 6 6 24-14 5-28 0z" fill="#c8894b"/><path d="M18 26q14 5 28 0v4q-14 5-28 0z" fill="#d63a3a"/></svg>`,
};

const BANDEIRAS = [
  { bicho: "vaca", nome: "vaquinha", cor: "#e2433a", est: "e-xadrez", ic: "coracao", verso: `<span class="t g">Arthur</span>`, fala: "Arthur" },
  { bicho: "pintinho", nome: "pintinho", cor: "#ffb21e", est: "e-poa", ic: "vela", verso: `<span class="t g">1 aninho</span>`, fala: "1 aninho" },
  { bicho: "porco", nome: "porquinho", cor: "#f48aa6", est: "e-listra", ic: "cal", verso: `<span class="t">Domingo</span><span class="s">29 de novembro de 2026</span>`, fala: "Domingo, 29 de novembro de 2026" },
  { bicho: "ovelha", nome: "ovelhinha", cor: "#5aa4e6", est: "e-xadrez", ic: "relogio", verso: `<span class="t g">às 15h</span>`, fala: "às 15h" },
  { bicho: "cavalo", nome: "cavalinho", cor: "#8f6bd1", est: "e-poa", ic: "arvore", verso: `<span class="t p">Casa da Árvore</span><span class="s">Rua Castelo Branco, nº 31, Cidade Nova</span>`, fala: "Casa da Árvore, Rua Castelo Branco, nº 31, Cidade Nova" },
  { bicho: "pato", nome: "patinho", cor: "#ff8a3d", est: "e-listra", ic: "chapeu", verso: `<span class="s">Venha caracterizado:</span><span class="t p">country/<br>fazendinha</span>`, fala: "Venha caracterizado: country/fazendinha" },
];

const listas = document.querySelectorAll("[data-bandeiras]");
const botoes = [];
BANDEIRAS.forEach((b, i) => {
  const li = document.createElement("li");
  li.className = "pendurada";
  li.innerHTML = `<button type="button" class="bandeira" aria-pressed="false" style="--i:${i};--cor:${b.cor};--dur:${(3.1 + (i % 3) * 0.45).toFixed(2)}s;--atraso:${(-i * 0.7).toFixed(1)}s;--amp:${2.5 + (i % 2) * 1.5}deg">
    <span class="prendedor e" aria-hidden="true"></span><span class="prendedor d" aria-hidden="true"></span>
    <span class="miolo" aria-hidden="true"><span class="face frente ${b.est}">${BICHOS[b.bicho]}</span><span class="face verso">${IC[b.ic]}${b.verso}</span></span>
    <span class="sr-only" data-rotulo></span>
  </button>`;
  listas[i < 3 ? 0 : 1].append(li);
  const btn = li.querySelector("button");
  btn.querySelector("[data-rotulo]").textContent = `Bandeirinha ${i + 1} de 6, do ${b.nome}. Virar para ler.`;
  botoes.push(btn);
  btn.addEventListener("click", () => virar(i));
});

// mãozinha indicando a primeira
if (!calmo) {
  const mao = document.createElement("span");
  mao.className = "vira-dica";
  mao.setAttribute("aria-hidden", "true");
  mao.innerHTML = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#fff" stroke="#3b2412" stroke-width="2.5"/><path d="M17 28v-13a2.4 2.4 0 0 1 4.8 0v7l4 .8a3 3 0 0 1 2.4 3.3L27.6 31H18z" fill="#ffd9b8" stroke="#3b2412" stroke-width="2" stroke-linejoin="round"/></svg>`;
  botoes[0].parentElement.append(mao);
}

/* ---------- Som (mudo até o 1º toque) ---------- */
const btnSom = document.querySelector("[data-som]");
let ac = null, somLigado = false, tocou = false;
const atualizaSom = () => { btnSom.setAttribute("aria-pressed", String(somLigado)); btnSom.setAttribute("aria-label", somLigado ? "Som ligado. Desligar som" : "Som desligado. Ativar som"); };
function garanteAudio() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } }
  if (ac && ac.state === "suspended") ac.resume().catch(() => {});
}
addEventListener("pointerdown", (e) => {
  if (tocou) return; tocou = true;
  if (e.target.closest("[data-som]")) return; // o próprio botão decide
  garanteAudio(); somLigado = !!ac; atualizaSom();
}, { capture: true });
btnSom.addEventListener("click", () => { tocou = true; garanteAudio(); somLigado = !somLigado && !!ac; atualizaSom(); if (somLigado) nota(784, 0, .15); });

function nota(freq, quando = 0, dur = .22, tipo = "sine", vol = .18) {
  if (!somLigado || !ac) return;
  const t = ac.currentTime + quando, o = ac.createOscillator(), g = ac.createGain();
  o.type = tipo; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .05);
}
function sopro() {
  if (!somLigado || !ac) return;
  const n = ac.sampleRate * 1.4, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n);
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = buf; f.type = "bandpass"; f.Q.value = .8;
  const t = ac.currentTime; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(1300, t + .5); f.frequency.linearRampToValueAtTime(500, t + 1.4);
  g.gain.value = .22; s.connect(f).connect(g).connect(ac.destination); s.start();
}
const ESCALA = [523, 587, 659, 784, 880, 1047];

/* ---------- Virar ---------- */
const viradas = new Set();
function virar(i, { silencioso = false } = {}) {
  const btn = botoes[i], b = BANDEIRAS[i];
  const vai = btn.getAttribute("aria-pressed") !== "true";
  btn.setAttribute("aria-pressed", String(vai));
  btn.querySelector("[data-rotulo]").textContent = vai ? `Bandeirinha ${i + 1} de 6: ${b.fala}.` : `Bandeirinha ${i + 1} de 6, do ${b.nome}. Virar para ler.`;
  if (!calmo) { btn.classList.remove("puxa"); void btn.offsetWidth; btn.classList.add("puxa"); }
  document.querySelector(".vira-dica")?.remove();
  if (!vai) return;
  if (!silencioso) { nota(ESCALA[i], 0, .18, "triangle"); nota(ESCALA[i] * 1.5, .08, .25); }
  viradas.add(i);
  if (!silencioso) dica.textContent = viradas.size < 6 ? `${viradas.size} de 6 bandeirinhas viradas` : "Varal completo!";
  if (viradas.size === 6 && final.hidden) completar(silencioso);
}

function completar(silencioso) {
  final.hidden = false; cena.classList.add("festa", "terminou");
  if (silencioso) return;
  [523, 659, 784, 1047, 1319].forEach((f, k) => nota(f, k * .1, .3, "triangle", .16));
  if (!calmo) {
    rajada();
    if (typeof window.confetti === "function") {
      const cores = ["#e2433a", "#ffd84f", "#5aa4e6", "#f48aa6", "#ff8a3d", "#ffffff"];
      window.confetti({ particleCount: 90, spread: 80, origin: { y: .35 }, colors: cores, disableForReducedMotion: true });
      setTimeout(() => window.confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: .6 }, colors: cores, disableForReducedMotion: true }), 250);
      setTimeout(() => window.confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: .6 }, colors: cores, disableForReducedMotion: true }), 400);
    }
  }
}

/* ---------- Vento ---------- */
const folhas = document.querySelector("[data-folhas]");
let rajadaAtiva = false;
function rajada() {
  if (calmo || rajadaAtiva) return;
  rajadaAtiva = true; cena.classList.add("rajada"); sopro();
  const cores = ["#ff8fab", "#ffd84f", "#9fd06e", "#ffffff", "#ff8a3d"];
  for (let k = 0; k < 7; k++) {
    const f = document.createElement("span");
    f.className = "folha";
    f.style.cssText = `top:${20 + Math.random() * 55}%;--c:${cores[k % cores.length]};--dy:${(Math.random() * 160 - 100).toFixed(0)}px;--r:${(300 + Math.random() * 500).toFixed(0)}deg;animation-delay:${k * 90}ms`;
    folhas.append(f); setTimeout(() => f.remove(), 2600);
  }
  setTimeout(() => { cena.classList.remove("rajada"); rajadaAtiva = false; }, 1600 + 6 * 60);
}
if (!calmo) {
  setTimeout(rajada, 1200); // primeira lufada logo na chegada
  setInterval(() => { if (!document.hidden && !matchMedia("(prefers-reduced-motion: reduce)").matches) rajada(); }, 9000);
  // deslizar o dedo pelo céu sopra o vento
  let x0 = null, y0 = 0;
  cena.addEventListener("pointerdown", (e) => { if (e.target.closest("button,a")) return; x0 = e.clientX; y0 = e.clientY; });
  cena.addEventListener("pointerup", (e) => { if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) rajada(); });
}

/* ---------- Pular ---------- */
const convite = document.getElementById("convite");
function irParaConvite(ev) {
  ev?.preventDefault();
  botoes.forEach((_, i) => { if (botoes[i].getAttribute("aria-pressed") !== "true") virar(i, { silencioso: true }); });
  convite.scrollIntoView({ behavior: calmo ? "auto" : "smooth" });
  convite.focus({ preventScroll: true });
}
document.querySelector("[data-pular]").addEventListener("click", irParaConvite);
final.querySelector("a").addEventListener("click", (ev) => { ev.preventDefault(); convite.scrollIntoView({ behavior: calmo ? "auto" : "smooth" }); convite.focus({ preventScroll: true }); });
new IntersectionObserver(([e]) => document.body.classList.toggle("rolou", !e.isIntersecting), { threshold: 0.05 }).observe(cena);
