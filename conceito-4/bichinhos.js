// Conceito 4 — "Acorde os bichinhos": cada toque acorda um bichinho, que faz o som e conta um dado da festa.
// Com os 5 acordados, o sol nasce sorrindo e sai confete. "Pular" acorda todos de uma vez.
import { prepararSom, som, confete, prepararPular, revelar, reduzido } from "../comum/festa.js";

const FALAS = {
  vaca: ["muu", "🐮", "Muuu! A festa é no domingo, 29 de novembro de 2026!"],
  galinha: ["co", "🐔", "Có-có! Começa às 15h."],
  porco: ["oinc", "🐷", "Oinc! É na Casa da Árvore — Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso."],
  ovelha: ["mee", "🐑", "Méé! Venha caracterizado de country/fazendinha!"],
  cavalo: ["rinch", "🐴", "Iiirrí! Confirme sua presença lá embaixo."],
};
const cena = document.querySelector("[data-cena]");
const lista = document.querySelector("[data-revelados]");
const contador = document.querySelector("[data-contador]");
const dica = document.querySelector("[data-dica]");
const bichos = [...document.querySelectorAll("[data-bicho]")];
let acordados = 0, terminou = false;

function acordar(b, { silencioso = false } = {}) {
  if (b.classList.contains("acordado")) return;
  const [nomeSom, emoji, texto] = FALAS[b.dataset.bicho];
  b.classList.add("acordado");
  b.setAttribute("aria-label", b.getAttribute("aria-label").replace("Acordar", "Acordado:"));
  b.setAttribute("aria-pressed", "true");
  if (!silencioso) som(nomeSom);
  revelar(lista, emoji, texto);
  acordados++;
  contador.textContent = `${acordados}/5`;
  if (acordados === bichos.length) fim(silencioso);
}
function fim(silencioso) {
  if (terminou) return; terminou = true;
  cena.dataset.estado = "acordado";
  document.querySelector(".chamada").textContent = "Você está convidado para o aniversário do";
  dica.firstChild.textContent = "☀️ Bom dia, fazendinha! Todo mundo acordou para o 1 aninho do Arthur! ";
  document.querySelector("[data-ver]").hidden = false;
  if (!silencioso) { som("festa"); setTimeout(() => confete(), reduzido ? 0 : 250); }
}
bichos.forEach((b) => { b.setAttribute("aria-pressed", "false"); b.addEventListener("click", () => acordar(b)); });
prepararSom();
prepararPular(() => bichos.forEach((b) => acordar(b, { silencioso: true })));
