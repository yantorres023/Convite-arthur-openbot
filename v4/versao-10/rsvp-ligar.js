// RSVP comum (não alterar ../comum/). Endpoint null = "Confirmação ainda não ativada".
import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

ligarRSVP(document.querySelector("form[data-rsvp]"), RSVP_ENDPOINT);
