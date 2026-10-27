// Conceito 4 — "Bom dia, bichinhos!" (arte v3 da Deidara): cada toque acorda um bichinho (troca #c4-{id}-dormindo
// por #c4-{id}-acordado), que faz o som e conta um dado da festa. Com os 5 acordados, o sol sorri e sai confete.
import { prepararSom, som, confete, prepararPular, revelar, reduzido } from "../comum/festa.js";

const FALAS = {
  vaca: ["muu", "🐮", "Muuu! É no domingo, 29 de novembro de 2026."],
  galinha: ["co", "🐔", "Có-có! Às 15h."],
  porco: ["oinc", "🐷", "Oinc! Na Casa da Árvore — Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso."],
  ovelha: ["mee", "🐑", "Méé! Venha caracterizado de country/fazendinha!"],
  cavalo: ["rinch", "🐴", "Iiirrí! A confirmação de presença ainda não está ativada — o convite completo está logo abaixo."],
};
const $ = (id) => document.getElementById(id);
const cena = document.querySelector("[data-cena]");
const lista = document.querySelector("[data-revelados]");
const contador = document.querySelector("[data-contador]");
const dica = document.querySelector("[data-dica]");
const alvos = [...document.querySelectorAll("[data-bicho]")];
let acordados = 0, terminou = false;

function acordar(b, { silencioso = false } = {}) {
  if (b.classList.contains("feito")) return;
  const id = b.dataset.bicho, [nomeSom, emoji, texto] = FALAS[id];
  b.classList.add("feito"); b.setAttribute("aria-pressed", "true");
  b.setAttribute("aria-label", b.getAttribute("aria-label").replace("Acordar", "Acordado:"));
  $(`c4-${id}-dormindo`).style.display = "none";
  $(`c4-${id}-acordado`).style.display = "inline";
  $(`c4-${id}`).classList.add("pulou");
  if (!silencioso) som(nomeSom);
  revelar(lista, emoji, texto);
  acordados++; contador.textContent = `${acordados}/5`;
  if (acordados === alvos.length) fim(silencioso);
}
function fim(silencioso) {
  if (terminou) return; terminou = true;
  cena.dataset.estado = "fim";
  document.querySelector(".chamada").textContent = "☀️ Bom dia, fazendinha!";
  dica.firstChild.textContent = "☀️ Todo mundo acordou para o 1 aninho do Arthur! ";
  if (!silencioso) { som("festa"); setTimeout(() => confete(), reduzido ? 0 : 250); }
}
alvos.forEach((b) => { b.setAttribute("aria-pressed", "false"); b.addEventListener("click", () => acordar(b)); });
prepararSom();
prepararPular(() => alvos.forEach((b) => acordar(b, { silencioso: true })));
