// Versão 12 — liga o RSVP comum (endpoint null = "Confirmação ainda não ativada") e os atalhos para o convite.
// Fica separado da brincadeira: se a pescaria falhar, o convite e o RSVP continuam funcionando.
import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

ligarRSVP(document.querySelector("form[data-rsvp]"), RSVP_ENDPOINT);

const alvo = document.getElementById("convite");
const semMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// "Pular e ver o convite" e "Ver o convite completo": rolagem suave + foco no convite (sem JS, o link #convite já funciona).
document.addEventListener("click", (ev) => {
  const link = ev.target.closest?.('a[href="#convite"]');
  if (!link || !alvo) return;
  ev.preventDefault();
  alvo.scrollIntoView({ behavior: semMovimento() ? "auto" : "smooth", block: "start" });
  alvo.focus({ preventScroll: true });
});
