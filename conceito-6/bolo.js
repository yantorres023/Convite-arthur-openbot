// Conceito 6 — "Monte o bolo": cada toque coloca uma camada (3), depois os bichinhos e a vela "1"; cada passo revela
// um dado da festa. No fim, "Assopre a vela!": o toque apaga a vela, sai confete e uma fanfarra curta.
// "Pular" monta tudo e assopra de uma vez.
import { prepararSom, som, confete, prepararPular, revelar, reduzido } from "../comum/festa.js";

const PASSOS = [
  ["bum", "🍓", "1ª camada: domingo, 29 de novembro de 2026.", "🍰 Colocar a 2ª camada"],
  ["bum", "🍋", "2ª camada: às 15h.", "🍰 Colocar a 3ª camada"],
  ["bum", "🫐", "3ª camada: na Casa da Árvore — Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso.", "🐮 Colocar os bichinhos"],
  ["muu", "🤠", "Os bichinhos chegaram: venha caracterizado de country/fazendinha!", "🕯️ Acender a vela"],
  ["pop", "🕯️", "A vela é de 1 aninho! Agora assopre.", "💨 Assopre a vela!"],
];
const cena = document.querySelector("[data-cena]");
const lista = document.querySelector("[data-revelados]");
const contador = document.querySelector("[data-contador]");
const dica = document.querySelector("[data-dica]");
const acao = document.querySelector("[data-acao]");
let etapa = 0, terminou = false;

function avancar({ silencioso = false } = {}) {
  if (terminou) return;
  if (etapa < PASSOS.length) {
    const [s, emoji, texto, proximo] = PASSOS[etapa];
    etapa++;
    cena.dataset.etapa = String(etapa);
    if (!silencioso) som(s);
    revelar(lista, emoji, texto);
    contador.textContent = `${etapa}/5`;
    acao.textContent = proximo;
    if (etapa === PASSOS.length) dica.firstChild.textContent = "🕯️ A vela está acesa! ";
    return;
  }
  assoprar(silencioso);
}
function assoprar(silencioso) {
  terminou = true;
  cena.dataset.etapa = "assoprou";
  acao.textContent = "🎉 Parabéns, Arthur!"; acao.disabled = true;
  dica.firstChild.textContent = "🎂 Parabéns, Arthur! Te esperamos na festa! ";
  document.querySelector("[data-ver]").hidden = false;
  if (!silencioso) { som("sopro"); setTimeout(() => som("festa"), 450); setTimeout(() => confete({ colors: ["#FF8FB1", "#FFD24A", "#7EC8F0", "#86C454", "#FFFFFF"] }), reduzido ? 0 : 500); }
}
acao.addEventListener("click", () => avancar());
prepararSom();
prepararPular(() => { while (!terminou) avancar({ silencioso: true }); });
