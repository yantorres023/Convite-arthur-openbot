// Comum às páginas: carrega a configuração do endpoint (comum/rsvp-config.js; null = inativo), liga o RSVP
// e dispara a entrada uma vez, quando o bloco aparece na tela. Sem config: "Confirmação ainda não ativada".
// Sem JavaScript tudo fica visível (o estado inicial escondido só vale com html.js e sem movimento reduzido).
import { ligarRSVP } from "./rsvp.js";
document.documentElement.classList.add("js");
let endpoint = null;
try {
  const cfg = await import("./rsvp-config.js"); // comprometido no repo; null enquanto o RSVP não for ativado
  const u = new URL(cfg.RSVP_ENDPOINT);
  if (u.protocol === "https:") endpoint = u.href;
} catch { endpoint = null; }
ligarRSVP(document.querySelector("form[data-rsvp]"), endpoint);
const alvos = document.querySelectorAll("[data-entrada]");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } }), { threshold: 0.15 });
  alvos.forEach((a) => io.observe(a));
} else alvos.forEach((a) => a.classList.add("visto"));
