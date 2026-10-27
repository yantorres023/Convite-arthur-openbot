// Conceito 5 — "Caça aos ovos": 5 ovos escondidos na cena; cada toque racha o ovo, sai um pintinho e um dado da festa.
// Com os 5 achados, os pintinhos fazem festa e sai confete. "Pular" racha todos de uma vez.
import { prepararSom, som, confete, prepararPular, revelar, reduzido } from "../comum/festa.js";

const DADOS = [
  ["🐣", "É o aniversário de 1 aninho do Arthur!"],
  ["📅", "Domingo, 29 de novembro de 2026."],
  ["⏰", "Às 15h."],
  ["📍", "Casa da Árvore — Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso."],
  ["🤠", "Venha caracterizado de country/fazendinha!"],
];
const cena = document.querySelector("[data-cena]");
const lista = document.querySelector("[data-revelados]");
const contador = document.querySelector("[data-contador]");
const dica = document.querySelector("[data-dica]");
const ovos = [...document.querySelectorAll("[data-ovo]")];
let achados = 0, terminou = false;

function rachar(o, { silencioso = false } = {}) {
  if (o.classList.contains("rachado")) return;
  o.classList.add("rachado");
  o.setAttribute("aria-pressed", "true");
  o.setAttribute("aria-label", `Ovo ${o.dataset.ovo} achado`);
  if (!silencioso) { som("craque"); setTimeout(() => som("pio"), reduzido ? 0 : 280); }
  const [emoji, texto] = DADOS[achados];
  revelar(lista, emoji, texto);
  achados++;
  contador.textContent = `${achados}/5`;
  if (achados === ovos.length) fim(silencioso);
}
function fim(silencioso) {
  if (terminou) return; terminou = true;
  cena.dataset.estado = "achou";
  document.querySelector(".fala-galinha").textContent = "Có-có! Te espero na festa!";
  dica.firstChild.textContent = "🎉 Você achou todos os ovos! ";
  document.querySelector("[data-ver]").hidden = false;
  if (!silencioso) { som("co"); setTimeout(() => som("festa"), 350); setTimeout(() => confete({ colors: ["#FFD24A", "#FF8FB1", "#86C454", "#FFFFFF", "#7EC8F0"] }), reduzido ? 0 : 400); }
}
ovos.forEach((o) => { o.setAttribute("aria-pressed", "false"); o.addEventListener("click", () => rachar(o)); });
prepararSom();
prepararPular(() => ovos.forEach((o) => rachar(o, { silencioso: true })));
