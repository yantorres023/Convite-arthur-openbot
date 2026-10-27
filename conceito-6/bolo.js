// Conceito 6 — "Um bolinho pro Arthur" (arte v3 da Deidara): o botão mostra #c6-camada-1..3, depois
// #c6-topo-bichinhos e #c6-vela/#c6-chama; cada passo revela um dado. "Assopre a vela!" esconde a chama e solta confete.
import { prepararSom, som, confete, prepararPular, revelar, reduzido } from "../comum/festa.js";

const PASSOS = [
  ["c6-camada-1", "bum", "🍓", "1ª camada: domingo, 29 de novembro de 2026, às 15h.", "🍰 Colocar a 2ª camada"],
  ["c6-camada-2", "bum", "🍋", "2ª camada: Casa da Árvore — Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso.", "🍰 Colocar a 3ª camada"],
  ["c6-camada-3", "bum", "🫐", "3ª camada: venha caracterizado de country/fazendinha!", "🐮 Colocar os bichinhos"],
  ["c6-topo-bichinhos", "muu", "🐷", "Os bichinhos chegaram para a festa!", "🕯️ Acender a vela"],
  ["c6-vela", "pop", "🕯️", "A vela é de 1 aninho! Agora assopre.", "💨 Assopre a vela!"],
];
const $ = (id) => document.getElementById(id);
const cena = document.querySelector("[data-cena]");
const lista = document.querySelector("[data-revelados]");
const contador = document.querySelector("[data-contador]");
const dica = document.querySelector("[data-dica]");
const acao = document.querySelector("[data-acao]");
let etapa = 0, terminou = false;

function avancar({ silencioso = false } = {}) {
  if (terminou) return;
  if (etapa < PASSOS.length) {
    const [id, s, emoji, texto, proximo] = PASSOS[etapa];
    $(id).style.display = "inline"; $(id).classList.add("caiu");
    if (id === "c6-camada-1") $("c6-artpass-silhueta-bolo")?.style.setProperty("display", "none");   // some ao começar
    if (id === "c6-topo-bichinhos") $("c6-artpass-bichinhos-convidando")?.style.setProperty("display", "none"); // saem quando o topo entra
    if (id === "c6-vela") { $("c6-chama").style.display = "inline"; $("c6-chama").classList.add("acesa"); }
    etapa++; cena.dataset.etapa = String(etapa);
    if (!silencioso) som(s);
    revelar(lista, emoji, texto);
    contador.textContent = `${etapa}/5`; acao.textContent = proximo;
    if (etapa === PASSOS.length) dica.firstChild.textContent = "🕯️ A vela está acesa! ";
    return;
  }
  terminou = true;
  $("c6-chama").style.display = "none";
  cena.dataset.etapa = "assoprou";
  acao.textContent = "🎉 Parabéns, Arthur!"; acao.disabled = true;
  dica.firstChild.textContent = "🎂 Parabéns, Arthur! Te esperamos na festa! ";
  if (!silencioso) { som("sopro"); setTimeout(() => som("festa"), 450); setTimeout(() => confete({ colors: ["#F09BBA", "#FFE08A", "#BFE1AB", "#FFFFFF", "#97435E"] }), reduzido ? 0 : 500); }
}
acao.addEventListener("click", () => avancar());
prepararSom();
prepararPular(() => { while (!terminou) avancar({ silencioso: true }); });
