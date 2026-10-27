// Conceito 5 — "Cadê os ovinhos?" (arte v3 da Deidara): cada toque racha um ovinho (troca #c5-ovo-N-inteiro por
// #c5-ovo-N-rachado, com o pintinho) e revela um dado da festa, em qualquer ordem. Com os 5, festa e confete.
import { prepararSom, som, confete, prepararPular, revelar, reduzido } from "../comum/festa.js";

const DADOS = {
  1: ["📅", "Domingo, 29 de novembro de 2026."],
  2: ["⏰", "Às 15h."],
  3: ["📍", "Casa da Árvore — Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso."],
  4: ["🤠", "Venha caracterizado de country/fazendinha!"],
  5: ["💌", "A confirmação de presença ainda não está ativada — o convite completo está logo abaixo."],
};
const $ = (id) => document.getElementById(id);
const cena = document.querySelector("[data-cena]");
const lista = document.querySelector("[data-revelados]");
const contador = document.querySelector("[data-contador]");
const dica = document.querySelector("[data-dica]");
const alvos = [...document.querySelectorAll("[data-ovo]")];
let achados = 0, terminou = false;

function rachar(b, { silencioso = false } = {}) {
  if (b.classList.contains("feito")) return;
  const n = b.dataset.ovo, [emoji, texto] = DADOS[n];
  b.classList.add("feito"); b.setAttribute("aria-pressed", "true"); b.setAttribute("aria-label", `Ovinho ${n} aberto`);
  $(`c5-ovo-${n}-inteiro`).style.display = "none";
  $(`c5-ovo-${n}-rachado`).style.display = "inline";
  $(`c5-ovo-${n}`).classList.add("pulou");
  if (!silencioso) { som("craque"); setTimeout(() => som("pio"), reduzido ? 0 : 260); }
  revelar(lista, emoji, texto);
  achados++; contador.textContent = `${achados}/5`;
  if (achados === alvos.length) fim(silencioso);
}
function fim(silencioso) {
  if (terminou) return; terminou = true;
  cena.dataset.estado = "fim";
  dica.firstChild.textContent = "🎉 Você achou todos os ovinhos! ";
  if (!silencioso) { setTimeout(() => som("festa"), 300); setTimeout(() => confete({ colors: ["#FFD261", "#F4A98B", "#9FCC84", "#FFFFFF", "#A24925"] }), reduzido ? 0 : 350); }
}
alvos.forEach((b) => { b.setAttribute("aria-pressed", "false"); b.addEventListener("click", () => rachar(b)); });
prepararSom();
prepararPular(() => alvos.forEach((b) => rachar(b, { silencioso: true })));
