// Versão 06 — "Siga as patinhas". Um cãozinho farejador segue pegadas num caminho de terra;
// cada parada revela um bichinho com um dado da festa, até a Casa da Árvore.
import { ligarRSVP } from "../comum/rsvp.js";
import { RSVP_ENDPOINT } from "../comum/rsvp-config.js";

ligarRSVP(document.querySelector("[data-rsvp]"), RSVP_ENDPOINT);

const $ = (id) => document.getElementById(id);
const html = document.documentElement;
const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
const L = `stroke="#4A2C17" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
const L2 = `stroke="#4A2C17" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"`;
const olho = (x, y, r = 2.7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3B2416"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.38}" r="${r * 0.36}" fill="#fff"/>`;
const bochecha = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FF7F9A" opacity=".55"/>`;
const sombra = (rx = 18) => `<ellipse cx="0" cy="1" rx="${rx}" ry="3.6" fill="#7A4A2A" opacity=".16"/>`;

// Chapéu de cowboy (aba virada), bandana xadrez e botinha: o country de cada bichinho.
const chapeu = (x, y, s = 1, rot = 0, cor = "#E0A458", copa = "#F2C063") => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <path d="M-11 -3 C-12 -14 -8 -21 -3 -17.5 C-1 -19.5 1 -19.5 3 -17.5 C8 -21 12 -14 11 -3 Z" fill="${copa}" stroke="#4A2C17" stroke-width="${(2.4 / s).toFixed(2)}" stroke-linejoin="round"/>
  <path d="M-11 -7 Q0 -4 11 -7" stroke="#C93A26" stroke-width="${(3.2 / s).toFixed(2)}" fill="none"/>
  <path d="M-23 -6 C-25 -11 -20 -11 -16 -6 C-8 -1 8 -1 16 -6 C20 -11 25 -11 23 -6 C19 3 -19 3 -23 -6 Z" fill="${cor}" stroke="#4A2C17" stroke-width="${(2.4 / s).toFixed(2)}" stroke-linejoin="round"/></g>`;
const bandana = (y, larg = 13, alt = 15) => `<path d="M${-larg} ${y} Q0 ${y + 4} ${larg} ${y} L0 ${y + alt} Z" fill="url(#xadrez)" stroke="#4A2C17" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M${-larg} ${y} Q0 ${y + 4} ${larg} ${y}" stroke="#C93A26" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
const bota = (x, lado, cor = "#A0522D") => `<path d="M${x - 3} -9 H${x + 3} V-3 H${x + 3 + lado * 4} Q${x + 3 + lado * 7} -3 ${x + 3 + lado * 7} 0 V1.5 H${x - 3} Z" transform="${lado < 0 ? `translate(${2 * x} 0) scale(-1 1)` : ""}" fill="${cor}" stroke="#4A2C17" stroke-width="1.8" stroke-linejoin="round"/><path d="M${x - 3} -6.5 H${x + 3}" stroke="#FFC93C" stroke-width="1.6"/>`;

// ---------- Bichinhos (origem = pés, centro; desenham para cima) ----------
const BICHO = {
  pintinho: () => `${sombra(15)}
    ${bota(-6, -1, "#C93A26")}${bota(6, 1, "#C93A26")}
    
    <path d="M-13 -27 C-25 -24 -23 -12 -13 -13 Z" fill="#FFC21A" ${L}/><path d="M13 -27 C25 -24 23 -12 13 -13 Z" fill="#FFC21A" ${L}/>
    <circle cx="0" cy="-23" r="17" fill="#FFD84D" ${L}/>
    <ellipse cx="-6" cy="-32" rx="6" ry="3.6" fill="#FFF0AD"/>
    ${olho(-6, -26)}${olho(6, -26)}
    <path d="M-4.5 -21 L4.5 -21 L0 -15.5 Z" fill="#F7931E" ${L2}/>
    ${bochecha(-11, -19)}${bochecha(11, -19)}
    ${chapeu(1, -36, 0.68, -8)}`,
  vaca: () => `${sombra(26)}
    <path d="M-28 0 C-30 -18 -20 -28 0 -28 C20 -28 30 -18 28 0 Z" fill="#fff" ${L}/>
    <path d="M9 -24 C19 -26 24 -15 19 -9 C13 -5 6 -12 9 -24 Z" fill="#3E3433"/>
    ${bandana(-28, 15, 16)}
    <path d="M-12 -61 C-16 -68 -14 -74 -8 -72 C-10 -68 -8 -65 -5 -63 Z" fill="#F6E7C1" ${L2}/>
    <path d="M12 -61 C16 -68 14 -74 8 -72 C10 -68 8 -65 5 -63 Z" fill="#F6E7C1" ${L2}/>
    <ellipse cx="-24" cy="-53" rx="9" ry="4.6" transform="rotate(-22 -24 -53)" fill="#fff" ${L}/>
    <ellipse cx="24" cy="-53" rx="9" ry="4.6" transform="rotate(22 24 -53)" fill="#fff" ${L}/>
    <ellipse cx="-24" cy="-53" rx="5" ry="2.2" transform="rotate(-22 -24 -53)" fill="#F9B9C4"/>
    <ellipse cx="24" cy="-53" rx="5" ry="2.2" transform="rotate(22 24 -53)" fill="#F9B9C4"/>
    <ellipse cx="0" cy="-48" rx="19" ry="18" fill="#fff" ${L}/>
    <path d="M-4 -65 C-13 -66 -18 -59 -17.5 -53 C-13 -53.5 -7 -57 -4 -65 Z" fill="#3E3433"/>
    <path d="M-4 -67 C-3 -72 1 -72 0.5 -67 C2 -72 6 -71 4.5 -66" fill="none" stroke="#7A4A2A" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="0" cy="-36" rx="15" ry="10" fill="#F9B9C4" ${L}/>
    <ellipse cx="-5" cy="-36" rx="2" ry="3" fill="#B5536B"/><ellipse cx="5" cy="-36" rx="2" ry="3" fill="#B5536B"/>
    ${olho(-7, -49, 2.9)}${olho(7, -49, 2.9)}${bochecha(-14, -42)}${bochecha(14, -42)}
    ${chapeu(2, -63, 0.72, 6, "#C98B4F", "#E0A458")}`,
  porquinho: () => `${sombra(24)}
    <ellipse cx="0" cy="-15" rx="25" ry="15.5" fill="#F8B4C4" ${L}/>
    <ellipse cx="-11" cy="-1.5" rx="6" ry="3.4" fill="#E98AA2" ${L2}/><ellipse cx="11" cy="-1.5" rx="6" ry="3.4" fill="#E98AA2" ${L2}/>
    <path d="M-15 -48 L-21 -63 L-5 -54 Z" fill="#F49AB0" ${L}/><path d="M15 -48 L21 -63 L5 -54 Z" fill="#F49AB0" ${L}/>
    <circle cx="0" cy="-38" r="18" fill="#F8B4C4" ${L}/>
    <ellipse cx="0" cy="-32.5" rx="9" ry="6.5" fill="#F28BA3" ${L}/>
    <ellipse cx="-3.2" cy="-32.5" rx="1.6" ry="2.6" fill="#A8455E"/><ellipse cx="3.2" cy="-32.5" rx="1.6" ry="2.6" fill="#A8455E"/>
    ${olho(-7, -43)}${olho(7, -43)}${bochecha(-12.5, -35)}${bochecha(12.5, -35)}
    ${bandana(-24, 12, 13)}${chapeu(3, -53, 0.7, 10, "#F2C063", "#FFD84D")}<g transform="translate(12 -60) scale(.6)"><circle cx="0" cy="-4" r="3.2" fill="#fff" ${L2}/><circle cx="3.8" cy="-1.2" r="3.2" fill="#fff" ${L2}/><circle cx="2.4" cy="3.2" r="3.2" fill="#fff" ${L2}/><circle cx="-2.4" cy="3.2" r="3.2" fill="#fff" ${L2}/><circle cx="-3.8" cy="-1.2" r="3.2" fill="#fff" ${L2}/><circle r="2.6" fill="#FFC93C"/></g>`,
  ovelha: () => {
    const fofo = [];
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; fofo.push([Math.cos(a) * 17, -27 + Math.sin(a) * 15]); }
    return `${sombra(22)}
    <rect x="-12" y="-12" width="6.5" height="12.5" rx="3.2" fill="#5A4442"/><rect x="5.5" y="-12" width="6.5" height="12.5" rx="3.2" fill="#5A4442"/>
    ${fofo.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10.5" fill="#FFFDF8" ${L}/>`).join("")}
    ${fofo.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8.6" fill="#FFFDF8"/>`).join("")}
    <circle cx="0" cy="-27" r="17" fill="#FFFDF8"/>
    <ellipse cx="-14" cy="-37" rx="7.5" ry="3.6" transform="rotate(-25 -14 -37)" fill="#5A4442" ${L2}/>
    <ellipse cx="14" cy="-37" rx="7.5" ry="3.6" transform="rotate(25 14 -37)" fill="#5A4442" ${L2}/>
    <ellipse cx="0" cy="-31" rx="10.5" ry="13" fill="#6E5653" ${L}/>
    <circle cx="-5.5" cy="-44" r="5" fill="#FFFDF8" ${L2}/><circle cx="5.5" cy="-44" r="5" fill="#FFFDF8" ${L2}/><circle cx="0" cy="-46.5" r="5.6" fill="#FFFDF8" ${L2}/>
    <circle cx="-4.5" cy="-32.5" r="3" fill="#fff"/><circle cx="4.5" cy="-32.5" r="3" fill="#fff"/>
    <circle cx="-4" cy="-32" r="1.8" fill="#2B1B12"/><circle cx="5" cy="-32" r="1.8" fill="#2B1B12"/>
    <ellipse cx="0" cy="-24.5" rx="2.6" ry="1.7" fill="#F49AB0"/>
    <circle cx="-7.5" cy="-26" r="2" fill="#FF8FA3" opacity=".7"/><circle cx="7.5" cy="-26" r="2" fill="#FF8FA3" opacity=".7"/>
    ${bandana(-19, 12, 12)}${chapeu(0, -48, 0.6, -6, "#7CC6F2", "#A9DBF6")}`;
  },
  cavalo: () => `${sombra(24)}
    <path d="M-24 0 C-24 -16 -15 -24 -10 -36 L10 -36 C15 -24 24 -16 24 0 Z" fill="#B9774A" ${L}/>
    ${bandana(-30, 13, 16)}
    <path d="M-11 -66 L-25 -75 L-11 -75 Z" fill="#B9774A" ${L}/><path d="M11 -66 L25 -75 L11 -75 Z" fill="#B9774A" ${L}/>
    <ellipse cx="0" cy="-54" rx="15" ry="20" fill="#B9774A" ${L}/>
    <path d="M-2.4 -68 Q0 -60 -1.4 -50 L1.4 -50 Q0 -60 2.4 -68 Z" fill="#FFF6E8"/>
    <ellipse cx="0" cy="-40" rx="12.5" ry="10" fill="#E8BE93" ${L}/>
    <ellipse cx="-4.5" cy="-40" rx="1.6" ry="2.5" fill="#7A4A2A"/><ellipse cx="4.5" cy="-40" rx="1.6" ry="2.5" fill="#7A4A2A"/>
    <path d="M-4 -34.5 Q0 -32 4 -34.5" fill="none" stroke="#7A4A2A" stroke-width="1.6" stroke-linecap="round"/>
    ${olho(-7, -56)}${olho(7, -56)}${bochecha(-11, -47, 2.6)}${bochecha(11, -47, 2.6)}
    <path d="M-9 -71 C-7 -63 -1 -64 0 -69 C2 -63 9 -64 9 -72 Z" fill="#6B3F22" ${L2}/>
    <path d="M-23 -74 C-14 -69 14 -69 23 -74 C19 -80 -19 -80 -23 -74 Z" fill="#E0A458" ${L}/>
    <path d="M-11 -76.5 C-12 -86 -8 -92 -3 -89 C-1 -91 1 -91 3 -89 C8 -92 12 -86 11 -76.5 Z" fill="#F2C063" ${L}/>
    <path d="M-11 -79 Q0 -76 11 -79" stroke="#C93A26" stroke-width="3" fill="none"/>`,
};

const CAO = `<ellipse cx="4" cy="1" rx="25" ry="4" fill="#7A4A2A" opacity=".16"/>
  <g class="cao-salto"><g class="cao-vira"><g class="cao-corpo">
    <g class="cao-rabo"><path d="M-21 -27 C-30 -30 -34 -40 -30 -48" fill="none" stroke="#4A2C17" stroke-width="9" stroke-linecap="round"/><path d="M-21 -27 C-30 -30 -34 -40 -30 -48" fill="none" stroke="#E9A55C" stroke-width="4.4" stroke-linecap="round"/></g>
    <g class="cao-perna b"><rect x="-15" y="-16" width="8" height="16.5" rx="4" fill="#C9833F" ${L}/><path d="M-16 -6 H-6 V-1 H-3 Q-1 -1 -1 1.5 V2 H-16 Z" fill="#9A5326" stroke="#4A2C17" stroke-width="1.8" stroke-linejoin="round"/><path d="M-16 -4 H-6" stroke="#FFC93C" stroke-width="1.4"/></g>
    <g class="cao-perna a"><rect x="13" y="-16" width="8" height="16.5" rx="4" fill="#C9833F" ${L}/><path d="M12 -6 H22 V-1 H25 Q27 -1 27 1.5 V2 H12 Z" fill="#9A5326" stroke="#4A2C17" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 -4 H22" stroke="#FFC93C" stroke-width="1.4"/></g>
    <ellipse cx="0" cy="-22" rx="23" ry="12.5" fill="#E9A55C" ${L}/>
    <path d="M-13 -32 C-5 -36 3 -34 5 -30.5 C-1 -27.5 -9 -28 -13 -32 Z" fill="#C9833F"/>
    <ellipse cx="2" cy="-14" rx="12" ry="3.8" fill="#FCE3C0"/>
    <g class="cao-perna a"><rect x="-21" y="-16" width="8" height="16.5" rx="4" fill="#E9A55C" ${L}/><path d="M-22 -6 H-12 V-1 H-9 Q-7 -1 -7 1.5 V2 H-22 Z" fill="#9A5326" stroke="#4A2C17" stroke-width="1.8" stroke-linejoin="round"/><path d="M-22 -4 H-12" stroke="#FFC93C" stroke-width="1.4"/></g>
    <g class="cao-perna b"><rect x="7" y="-16" width="8" height="16.5" rx="4" fill="#E9A55C" ${L}/><path d="M6 -6 H16 V-1 H19 Q21 -1 21 1.5 V2 H6 Z" fill="#9A5326" stroke="#4A2C17" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 -4 H16" stroke="#FFC93C" stroke-width="1.4"/></g>
    <g class="cao-cabeca">
      <path d="M9 -33 C14 -27 20 -26 26 -29 L18 -14 Z" fill="url(#xadrez)" ${L2}/><path d="M9 -33 C14 -27 20 -26 26 -29" stroke="#C93A26" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="22" cy="-40" r="14" fill="#E9A55C" ${L}/>
      <ellipse cx="33" cy="-35" rx="9" ry="7" fill="#FCE3C0" ${L}/>
      <ellipse cx="41" cy="-37.5" rx="3.6" ry="2.8" fill="#3B2416"/><circle cx="40" cy="-38.6" r=".9" fill="#fff"/>
      <path d="M34 -30 Q37 -28 40 -30.5" stroke="#4A2C17" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      ${olho(25, -43)}${bochecha(28, -35.5, 2.6)}
      <g class="cao-orelha"><path d="M15 -49 C7 -48 5 -38 9 -31 C13 -30 16 -36 19 -45 Z" fill="#B8682F" ${L}/></g>
      <path d="M8 -51 C14 -48.5 30 -48.5 37 -52 C34 -56.5 10 -56.5 8 -51 Z" fill="#E0A458" ${L2}/>
      <path d="M14 -53 C13 -61 17 -66 21 -63 C23 -65 25 -65 27 -63 C31 -66 33 -60 31 -53 Z" fill="#F2C063" ${L2}/>
      <path d="M14 -55 Q22.5 -53 31 -55" stroke="#C93A26" stroke-width="2.6" fill="none"/>
    </g>
  </g></g></g>
  <g transform="translate(-6 -96)"><g class="balao-cao"><path d="M-14 -12 h28 a8 8 0 0 1 8 8 v12 a8 8 0 0 1 -8 8 h-9 l-5 7 l-5 -7 h-9 a8 8 0 0 1 -8 -8 v-12 a8 8 0 0 1 8 -8 z" fill="#FFFDF7" ${L}/><text x="0" y="10" text-anchor="middle" font-family="Chewy, sans-serif" font-size="21" fill="#C93A26">?</text></g></g>`;

// ---------- Esconderijos ----------
const moita = (largura = 1, flores = "#F28BA3") => {
  const c = [[-15, -8, 12], [0, -15, 14.5], [15, -8, 12], [-26, -2, 8], [26, -2, 8]].map(([x, y, r]) => [x * largura, y, r * (0.85 + largura * 0.15)]);
  return `${c.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#A8D08D" ${L}/>`).join("")}
    ${c.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 2.3}" fill="#A8D08D"/>`).join("")}
    <rect x="${-32 * largura}" y="-4" width="${64 * largura}" height="7" rx="3.5" fill="#A8D08D"/>
    <path d="M${-33 * largura} 3 H${33 * largura}" ${L} fill="none"/>
    <path d="M-6 -18 q2 -4 4 0 M8 -10 q2 -4 4 0" stroke="#6E9E52" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${[[-14, -12], [6, -20], [16, -5], [-22, 0]].map(([x, y]) => `<circle cx="${x * largura}" cy="${y}" r="2.8" fill="${flores}" stroke="#4A2C17" stroke-width="1.2"/><circle cx="${x * largura}" cy="${y}" r="1" fill="#FFC93C"/>`).join("")}`;
};
const cerca = (cor = "#E0A458") => `
  ${[-36, 0, 36].map((x) => `<path d="M${x - 5} 4 V-24 L${x} -30 L${x + 5} -24 V4 Z" fill="${cor}" ${L}/>`).join("")}
  <rect x="-46" y="-21" width="92" height="7" rx="3" fill="${cor}" ${L}/>
  <rect x="-46" y="-8" width="92" height="7" rx="3" fill="${cor}" ${L}/>
  ${[-36, 0, 36].map((x) => `<path d="M${x - 5} -14 h10 M${x - 5} -1 h10" stroke="${cor}" stroke-width="3"/>`).join("")}
  <path d="M-30 4 q3 -9 5 0 M22 4 q2 -8 4 0 M42 4 q2 -7 4 0" stroke="#6E9E52" stroke-width="2" fill="none" stroke-linecap="round"/>`;
const feno = () => `
  <rect x="-32" y="-26" width="64" height="30" rx="11" fill="#F4C95D" ${L}/>
  <path d="M-24 -18 h10 M-4 -20 h12 M14 -14 h10 M-26 -8 h8 M-6 -6 h14 M16 -4 h8" stroke="#D49A2A" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M-13 -26 V4 M13 -26 V4" stroke="#C93A26" stroke-width="2.6"/>
  <path d="M-36 4 l4 -7 l3 6 M30 4 l3 -6 l4 6" stroke="#D49A2A" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;

// ---------- Paradas (dados exatos do briefing) ----------
const PARADAS = [
  { bicho: "pintinho", sobe: 17, pe: "pe-pinto", escala: 1, esconde: () => moita(0.9, "#F28BA3"), placa: "1 aninho!",
    quem: "Pintinho", fala: "Piu piu! Sabia que o <strong>Arthur</strong> vai fazer <strong>1 aninho</strong>?",
    pista: "Três dedinhos fininhos no chão… de quem será?", voz: "pintinho" },
  { bicho: "vaca", sobe: 0, pe: "pe-vaca", escala: 1.45, esconde: () => cerca(), placa: "Domingo 29/11",
    quem: "Vaquinha", fala: "Muuu! A festa é no <strong>domingo, 29 de novembro de 2026</strong>.",
    pista: "Pegadas grandonas de casco… quem passou aqui?", voz: "vaca" },
  { bicho: "porquinho", sobe: 6, pe: "pe-porco", escala: 1.2, esconde: feno, placa: "às 15h",
    quem: "Porquinho", fala: "Oinc oinc! Começa <strong>às 15h</strong>.",
    pista: "Casquinhos pequenos com dois pontinhos… hmm!", voz: "porco" },
  { bicho: "ovelha", sobe: 16, pe: "pe-ovelha", escala: 1.15, esconde: () => moita(1.15, "#FFFDF7"), placa: "Country!",
    quem: "Ovelhinha", fala: "Méééé! <strong>Venha caracterizado: country/fazendinha</strong>.",
    pista: "Pegadinhas pontudas e fofas… quem será?", voz: "ovelha" },
  { bicho: "cavalo", sobe: 2, pe: "pe-cavalo", escala: 1.35, esconde: () => cerca("#FFF2DC"), placa: "Casa da Árvore",
    quem: "Cavalinho", fala: "Iirrí! A festa é na <strong>Casa da Árvore</strong> — Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso.",
    pista: "Marcas de ferradura! Vamos atrás?", voz: "cavalo" },
];
const INTRO = { quem: "Cãozinho farejador", fala: "Au au! Achei pegadinhas no caminho de terra… Vamos descobrir quem deixou?" };
const PISTA_FINAL = "Agora todas as pegadas vão para o mesmo lugar…";
const FINAL = { quem: "A turma toda", fala: "Chegamos na <strong>Casa da Árvore</strong>! A festa do <strong>Arthur</strong> é aqui. Vem com a gente?" };

// ---------- Geometria do caminho ----------
const PONTOS = [[200, 300], [205, 430], [288, 560], [178, 740], [112, 900], [226, 1050], [272, 1220], [176, 1390], [110, 1550], [146, 1710],
  [278, 1870], [288, 2030], [232, 2190], [120, 2350], [112, 2510], [168, 2660], [262, 2810], [236, 2960], [168, 3058], [124, 3124]];
const I_INICIO = 1, I_PARADAS = [3, 6, 9, 12, 15], I_FIM = PONTOS.length - 1;
const ARVORE = [268, 3122];
const VB_H = 3420, FOCO_FIM = 2990;

function caminhoD(p) {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// Gerador pseudoaleatório com semente: o cenário é sempre o mesmo.
let semente = 7;
const rnd = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);

const NS = "http://www.w3.org/2000/svg";
const svg = $("mundo");
const camadas = { fundo: $("camada-fundo"), caminho: $("camada-caminho"), pegadas: $("camada-pegadas"), paradas: $("camada-paradas"), cao: $("camada-cao"), frente: $("camada-frente") };

const D = caminhoD(PONTOS);
camadas.caminho.innerHTML = `
  <path d="${D}" fill="none" stroke="#C98B4F" stroke-width="66" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${D}" fill="none" stroke="#EDBE86" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${D}" fill="none" stroke="#F4CF9F" stroke-width="22" stroke-linecap="round" stroke-dasharray="40 26" opacity=".55"/>
  <path id="trilho" d="${D}" fill="none" stroke="none"/>`;
const trilho = $("trilho");
const TOTAL = trilho.getTotalLength();
const amostras = [];
for (let l = 0; l <= TOTAL; l += 2) { const p = trilho.getPointAtLength(l); amostras.push([l, p.x, p.y]); }
const Lde = ([x, y]) => amostras.reduce((m, a) => ((a[1] - x) ** 2 + (a[2] - y) ** 2 < m.d ? { d: (a[1] - x) ** 2 + (a[2] - y) ** 2, l: a[0] } : m), { d: Infinity, l: 0 }).l;
const L_INICIO = Lde(PONTOS[I_INICIO]);
const L_PARADA = I_PARADAS.map((i) => Lde(PONTOS[i]));
const L_FIM = TOTAL - 2;
const pertoDoCaminho = (x, y, folga) => amostras.some((a) => (a[1] - x) ** 2 + (a[2] - y) ** 2 < folga * folga);
const ponto = (l) => { const p = trilho.getPointAtLength(Math.max(0, Math.min(TOTAL, l))); return [p.x, p.y]; };
const angulo = (l) => { const a = ponto(l - 3), b = ponto(l + 3); return Math.atan2(b[1] - a[1], b[0] - a[0]); };

// ---------- Cenário ----------
const ocupados = [];
let fundo = `
  <g class="sol" transform="translate(338 92)"><g class="sol-raios">${Array.from({ length: 12 }, (_, i) => `<path d="M0 -44 L5 -56 L-5 -56 Z" fill="#FFD45F" transform="rotate(${i * 30})"/>`).join("")}</g>
    <circle r="36" fill="url(#g-sol)" ${L}/>${olho(-11, -4, 2.6)}${olho(11, -4, 2.6)}<path d="M-8 8 Q0 15 8 8" stroke="#4A2C17" stroke-width="2.4" fill="none" stroke-linecap="round"/>${bochecha(-19, 6, 4)}${bochecha(19, 6, 4)}</g>
  ${[[60, 128, 1], [255, 228, .8], [-150, 90, 1.1], [520, 160, .9]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><g class="nuvem"><path d="M-36 10 C-48 10 -48 -8 -34 -8 C-32 -24 -10 -26 -4 -14 C2 -26 26 -24 26 -8 C42 -10 44 10 30 10 Z" fill="#FFFDF7" ${L}/></g></g>`).join("")}
  <path d="M-1200 312 C-600 270 -300 250 -40 300 C40 236 150 246 214 296 C290 240 400 250 470 296 C800 250 1200 270 1600 300 V380 H-1200 Z" fill="#B9D99A" ${L}/>
  <path d="M-1200 330 C-500 310 -200 300 60 316 C140 296 260 298 330 318 C700 300 1200 310 1600 326 V420 H-1200 Z" fill="#CFE6B4"/>
  <path d="M-1200 410 C-400 396 0 380 200 392 C420 380 900 396 1600 404 V430 H-1200 Z" fill="#FFF1D6"/>`;
// cerca nas colinas, com uma porteira aberta no caminho
for (const [a, b] of [[-200, 160], [242, 600]]) {
  for (let x = a; x <= b; x += 30) fundo += `<path d="M${x - 3.5} 352 V326 L${x} 321 L${x + 3.5} 326 V352 Z" fill="#E0A458" ${L2}/>`;
  fundo += `<rect x="${a - 6}" y="330" width="${b - a + 12}" height="5" rx="2.5" fill="#E0A458" ${L2}/><rect x="${a - 6}" y="341" width="${b - a + 12}" height="5" rx="2.5" fill="#E0A458" ${L2}/>`;
}
// placa de entrada
fundo += `<g transform="translate(118 372)"><rect x="-3" y="-6" width="6" height="26" fill="#A86B3C" ${L2}/><rect x="-44" y="-30" width="88" height="28" rx="9" fill="#FFF2DC" ${L}/><text x="0" y="-10" text-anchor="middle" font-family="Chewy, sans-serif" font-size="15" fill="#4A2C17">Pra festa →</text></g>`;
ocupados.push([118, 360, 50]);
// laço de corda pendurado na placa
fundo += `<g transform="translate(118 384)"><ellipse cx="0" cy="0" rx="9" ry="12" fill="none" stroke="#4A2C17" stroke-width="5"/><ellipse cx="0" cy="0" rx="9" ry="12" fill="none" stroke="#E0A458" stroke-width="2.6"/><ellipse cx="2" cy="2" rx="6" ry="9" fill="none" stroke="#4A2C17" stroke-width="4.4"/><ellipse cx="2" cy="2" rx="6" ry="9" fill="none" stroke="#E0A458" stroke-width="2.2"/></g>`;
// toalha xadrez de piquenique com cestinha
fundo += `<g transform="translate(312 478) rotate(-8)"><path d="M-44 -18 L40 -24 L48 18 L-40 24 Z" fill="url(#xadrez-g)" ${L}/><g transform="translate(4 -2)"><path d="M-14 -4 H14 L10 12 H-10 Z" fill="#E0A458" ${L2}/><path d="M-10 -4 C-10 -18 10 -18 10 -4" fill="none" stroke="#4A2C17" stroke-width="2.4"/><path d="M-12 2 H12 M-11 7 H11" stroke="#C98B4F" stroke-width="1.6"/><circle cx="-5" cy="-6" r="4" fill="#E5533D" ${L2}/><circle cx="4" cy="-7" r="4" fill="#FFC93C" ${L2}/></g></g>`;
ocupados.push([312, 478, 62]);
// roda de carroça encostada na cerca
fundo += `<g transform="translate(46 360)"><circle r="20" fill="none" stroke="#4A2C17" stroke-width="7"/><circle r="20" fill="none" stroke="#C98B4F" stroke-width="3.6"/>${[0, 45, 90, 135].map((a) => `<path d="M0 -18 V18" transform="rotate(${a})" stroke="#4A2C17" stroke-width="4"/><path d="M0 -18 V18" transform="rotate(${a})" stroke="#E0A458" stroke-width="1.8"/>`).join("")}<circle r="5" fill="#E0A458" ${L2}/></g>`;

// pedrinhas dentro do caminho
for (let i = 0; i < 70; i++) {
  const [x, y] = ponto(rnd() * TOTAL), a = angulo(rnd() * TOTAL);
  const off = (rnd() - 0.5) * 44;
  fundo += `<ellipse cx="${(x + Math.cos(a + Math.PI / 2) * off).toFixed(1)}" cy="${(y + Math.sin(a + Math.PI / 2) * off).toFixed(1)}" rx="${(1.6 + rnd() * 2.2).toFixed(1)}" ry="${(1.2 + rnd() * 1.4).toFixed(1)}" fill="#D7A46D"/>`;
}

// ---------- Paradas no mundo ----------
const paradasEl = [];
I_PARADAS.forEach((ip, k) => {
  const [wx, wy] = PONTOS[ip];
  const lado = wx < 200 ? 1 : -1;
  const ax = Math.max(64, Math.min(336, wx + lado * 128)), ay = wy - 6;
  const p = PARADAS[k];
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "parada");
  const larg = Math.max(70, p.placa.length * 8.6 + 24);
  g.innerHTML = `
    <g transform="translate(${ax} ${ay + 64})" class="placa-pos"><g class="placa"><rect x="-3" y="-12" width="6" height="16" fill="#A86B3C" ${L2}/><rect x="${-larg / 2}" y="-38" width="${larg}" height="28" rx="9" fill="#FFF2DC" ${L}/><text x="0" y="-18" text-anchor="middle" font-family="Chewy, sans-serif" font-size="16" fill="#4A2C17">${p.placa}</text></g></g>
    <g transform="translate(${ax} ${ay})"><g transform="translate(0 ${-p.sobe})"><g class="bicho-pop"><g class="bicho-mexe">${BICHO[p.bicho]()}</g></g></g>
      <g transform="translate(${lado * 22} -70)"><g class="coracao"><path d="M0 4 C-8 -2 -8 -10 -3 -10 C-1 -10 0 -8 0 -7 C0 -8 1 -10 3 -10 C8 -10 8 -2 0 4 Z" fill="#F28BA3" ${L2}/></g></g>
      <g class="esconderijo">${p.esconde()}</g></g>`;
  camadas.paradas.appendChild(g);
  paradasEl.push({ g, lado, ax, ay });
  ocupados.push([ax, ay - 20, 66], [ax, ay + 44, 60]);
});

// ---------- Casa da Árvore ----------
function casaDaArvore() {
  const copa = [[-96, -214, 46], [96, -210, 48], [-52, -268, 54], [52, -272, 56], [0, -296, 50], [0, -214, 74], [-76, -250, 40], [78, -252, 40]];
  const bandeiras = ["url(#xadrez)", "#FFC93C", "#7CC6F2", "url(#xadrez)", "#F28BA3", "#FFC93C", "url(#xadrez)", "#7CC6F2"];
  const pts = bandeiras.map((_, i) => { const t = (i + 0.5) / bandeiras.length; const x = -82 + 164 * t; const y = -150 + 4 * 30 * t * (1 - t) + 6; return [x, y]; });
  return `
  ${copa.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#9CCB7A" ${L}/>`).join("")}
  ${copa.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 2.3}" fill="#9CCB7A"/>`).join("")}
  ${[[-110, -230], [-70, -300], [92, -232], [40, -320], [-20, -330], [110, -190]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#F28BA3" ${L2}/><circle cx="${x}" cy="${y}" r="1.8" fill="#FFC93C"/>`).join("")}
  <path d="M-34 4 C-22 -8 -17 -60 -17 -152 L17 -152 C17 -60 22 -8 34 4 Z" fill="#B87A45" ${L}/>
  <path d="M-6 -40 q4 -10 0 -22 M8 -96 q-4 -10 0 -20" stroke="#8A5530" stroke-width="2" fill="none" stroke-linecap="round"/>
  <g><path d="M-74 4 L-48 -150 M-58 4 L-32 -150" stroke="#4A2C17" stroke-width="7" stroke-linecap="round"/><path d="M-74 4 L-48 -150 M-58 4 L-32 -150" stroke="#E0A458" stroke-width="3.4" stroke-linecap="round"/>
    ${Array.from({ length: 8 }, (_, i) => { const t = (i + 0.6) / 8.4; const y = 4 - 154 * t; return `<path d="M${-74 + 26 * t} ${y} H${-58 + 26 * t}" stroke="#4A2C17" stroke-width="5.4" stroke-linecap="round"/><path d="M${-74 + 26 * t} ${y} H${-58 + 26 * t}" stroke="#E0A458" stroke-width="2.4" stroke-linecap="round"/>`; }).join("")}</g>
  <rect x="-58" y="-224" width="116" height="70" rx="9" fill="#F6CF8E" ${L}/>
  <path d="M-58 -206 H58 M-58 -188 H58 M-58 -170 H58" stroke="#E0A458" stroke-width="2"/>
  <circle cx="-26" cy="-192" r="14" fill="#CDEBFA" ${L}/><path d="M-26 -206 V-178 M-40 -192 H-12" stroke="#4A2C17" stroke-width="2"/>
  <path d="M12 -156 V-194 a13 13 0 0 1 26 0 V-156 Z" fill="#C93A26" ${L}/><circle cx="32" cy="-174" r="2.2" fill="#FFC93C"/>
  <path d="M-72 -218 L0 -268 L72 -218 Z" fill="#E5533D" ${L}/>
  <path d="M-52 -228 L0 -258 L52 -228" stroke="#F49A8A" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="0" cy="-238" r="8" fill="#FFF2DC" ${L2}/><path d="M0 -243 C-3 -246 -6 -242 0 -236 C6 -242 3 -246 0 -243Z" fill="#F28BA3"/>
  <rect x="-84" y="-160" width="168" height="12" rx="5" fill="#C98B4F" ${L}/>
  ${[-76, -56, -36, 36, 56, 76].map((x) => `<path d="M${x} -160 V-176" stroke="#4A2C17" stroke-width="5" stroke-linecap="round"/><path d="M${x} -160 V-176" stroke="#E0A458" stroke-width="2" stroke-linecap="round"/>`).join("")}
  <path d="M-80 -176 H-32 M32 -176 H80" stroke="#4A2C17" stroke-width="5" stroke-linecap="round"/><path d="M-80 -176 H-32 M32 -176 H80" stroke="#E0A458" stroke-width="2" stroke-linecap="round"/>
  <path d="M-82 -148 Q0 -110 82 -148" stroke="#4A2C17" stroke-width="1.8" fill="none"/>
  ${pts.map(([x, y], i) => `<path d="M${x - 8} ${y - 5} L${x + 8} ${y - 5} L${x} ${y + 10} Z" fill="${bandeiras[i]}" ${L2}/>`).join("")}
  <g transform="translate(0 -84)"><rect x="-40" y="-16" width="80" height="30" rx="9" fill="#FFF2DC" ${L}/><text x="0" y="7" text-anchor="middle" font-family="Chewy, sans-serif" font-size="21" fill="#C93A26">Arthur</text></g>
  ${[[-104, -128, "#F28BA3", 0], [-124, -100, "#7CC6F2", 0.6], [118, -108, "#C93A26", 0.3]].map(([x, y, c, d]) => `<path d="M${x} ${y + 22} Q${x + 6} ${y + 50} ${x > 0 ? 82 : -82} -150" stroke="#4A2C17" stroke-width="1.4" fill="none"/><g class="balao-festa" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="15" ry="19" fill="${c}" ${L}/><path d="M${x - 3} ${y + 19} h6 l-3 4z" fill="${c}" ${L2}/><ellipse cx="${x - 5}" cy="${y - 7}" rx="3.5" ry="5.5" fill="#fff" opacity=".55"/></g>`).join("")}
  <g class="balao-festa" style="animation-delay:1s"><path d="M126 -150 Q120 -126 112 -100" stroke="#4A2C17" stroke-width="1.4" fill="none"/></g>`;
}
const arvore = document.createElementNS(NS, "g");
arvore.setAttribute("transform", `translate(${ARVORE[0]} ${ARVORE[1]})`);
arvore.innerHTML = casaDaArvore();
camadas.paradas.appendChild(arvore);
ocupados.push([ARVORE[0], ARVORE[1] - 160, 175], [ARVORE[0] - 60, ARVORE[1] - 40, 70]);

// turma da festa (aparece no fim)
const TURMA = [["cavalo", 44, 3150, .8], ["vaca", 102, 3190, .8], ["pintinho", 214, 3196, .95], ["porquinho", 296, 3192, .85], ["ovelha", 360, 3168, .85]];
const turmaEl = document.createElementNS(NS, "g");
turmaEl.innerHTML = TURMA.map(([b, x, y, s], i) => `<g class="festa-bicho" style="--d:${(i * 0.18).toFixed(2)}s" transform="translate(${x} ${y}) scale(${s})"><g class="bicho-pop"><g class="bicho-mexe">${BICHO[b]()}</g></g></g>`).join("");
camadas.frente.appendChild(turmaEl);
TURMA.forEach(([, x, y]) => ocupados.push([x, y - 20, 42]));

// matinhos, flores e girassóis espalhados (longe do caminho e das paradas)
const livre = (x, y, folga) => !pertoDoCaminho(x, y, folga) && !ocupados.some(([ox, oy, r]) => (ox - x) ** 2 + (oy - y) ** 2 < r * r);
// fardinhos de feno espalhados pelo sítio
const fenos = [];
for (let i = 0, n = 0; i < 400 && n < 9; i++) {
  const x = 40 + rnd() * 320, y = 560 + rnd() * 2400;
  if (!livre(x, y, 70) || fenos.some(([fx, fy]) => (fx - x) ** 2 + (fy - y) ** 2 < 260 ** 2)) continue;
  fenos.push([x, y]); n++;
  ocupados.push([x, y - 10, 46]);
}
const fenosSvg = fenos.map(([x, y]) => `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(.72)">${feno()}</g>`).join("");

let decor = "";
for (let i = 0, n = 0; i < 900 && n < 150; i++) {
  const x = 12 + rnd() * 376, y = 420 + rnd() * 3000;
  if (!livre(x, y, 48)) continue;
  n++;
  const t = rnd();
  if (t < 0.45) decor += `<path d="M${(x - 5).toFixed(1)} ${y.toFixed(1)} q-1 -7 -4 -10 M${x.toFixed(1)} ${y.toFixed(1)} q0 -9 1 -13 M${(x + 5).toFixed(1)} ${y.toFixed(1)} q1 -7 4 -10" stroke="#93C171" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  else if (t < 0.82) {
    const cor = ["#F28BA3", "#FFFDF7", "#7CC6F2", "#FFC93C", "#F6A6C8"][Math.floor(rnd() * 5)];
    decor += `<g class="flor" style="animation-delay:-${(rnd() * 3).toFixed(1)}s"><path d="M${x} ${y} V${y - 10}" stroke="#7FB25C" stroke-width="2" stroke-linecap="round"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + Math.cos((a * Math.PI) / 180) * 3.6).toFixed(1)}" cy="${(y - 13 + Math.sin((a * Math.PI) / 180) * 3.6).toFixed(1)}" r="3" fill="${cor}" stroke="#4A2C17" stroke-width="1.1"/>`).join("")}<circle cx="${x}" cy="${y - 13}" r="2.2" fill="${cor === "#FFC93C" ? "#C93A26" : "#FFC93C"}"/></g>`;
  } else if (t < 0.9) {
    decor += `<g class="flor" style="animation-delay:-${(rnd() * 3).toFixed(1)}s"><path d="M${x} ${y} V${y - 30}" stroke="#6E9E52" stroke-width="3" stroke-linecap="round"/><path d="M${x} ${y - 12} q8 -8 12 -2 q-6 6 -12 2z" fill="#93C171" stroke="#4A2C17" stroke-width="1.2"/>${Array.from({ length: 10 }, (_, j) => { const a = (j / 10) * Math.PI * 2; return `<ellipse cx="${(x + Math.cos(a) * 7.5).toFixed(1)}" cy="${(y - 34 + Math.sin(a) * 7.5).toFixed(1)}" rx="4.4" ry="2.6" transform="rotate(${((a * 180) / Math.PI).toFixed(0)} ${(x + Math.cos(a) * 7.5).toFixed(1)} ${(y - 34 + Math.sin(a) * 7.5).toFixed(1)})" fill="#FFC93C" stroke="#4A2C17" stroke-width="1.1"/>`; }).join("")}<circle cx="${x}" cy="${y - 34}" r="5" fill="#8A4B1E" stroke="#4A2C17" stroke-width="1.2"/></g>`;
  } else decor += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(4 + rnd() * 4).toFixed(1)}" ry="${(3 + rnd() * 2).toFixed(1)}" fill="#E4CFAE" stroke="#C9A97F" stroke-width="1.2"/>`;
}
camadas.fundo.innerHTML = fundo + decor + fenosSvg;

// ---------- Pegadas ----------
// Trecho k: da posição anterior até a parada k (k = 5: até a Casa da Árvore, com pegadas de todos).
const trechos = [];
const MISTAS = ["pe-pinto", "pe-vaca", "pe-porco", "pe-ovelha", "pe-cavalo"];
const ESCALA_PE = { "pe-pinto": 1.4, "pe-vaca": 1.25, "pe-porco": 1.25, "pe-ovelha": 1.25, "pe-cavalo": 1.15 };
for (let k = 0; k <= 5; k++) {
  const la = k === 0 ? L_INICIO : L_PARADA[k - 1], lb = k === 5 ? L_FIM : L_PARADA[k];
  const g = document.createElementNS(NS, "g");
  const lista = [];
  let i = 0;
  for (let l = la + 34; l < lb - 30; l += 27, i++) {
    const [x, y] = ponto(l), a = angulo(l), lado = i % 2 ? 1 : -1;
    const ox = Math.cos(a + Math.PI / 2) * 7 * lado, oy = Math.sin(a + Math.PI / 2) * 7 * lado;
    const pe = k === 5 ? MISTAS[i % 5] : PARADAS[k].pe;
    const holder = document.createElementNS(NS, "g");
    holder.setAttribute("transform", `translate(${(x + ox).toFixed(1)} ${(y + oy).toFixed(1)}) rotate(${((a * 180) / Math.PI + 90).toFixed(1)}) scale(${ESCALA_PE[pe]})`);
    holder.innerHTML = `<use href="#${pe}" class="pegada${k === 5 ? " pegada-mista" : ""}"/>`;
    g.appendChild(holder);
    lista.push({ l, el: holder.firstChild });
  }
  camadas.pegadas.appendChild(g);
  trechos.push({ la, lb, pegadas: lista });
}

// ---------- Cãozinho ----------
const cao = document.createElementNS(NS, "g");
cao.innerHTML = CAO;
camadas.cao.appendChild(cao);
const caoVira = cao.querySelector(".cao-vira"), balaoCao = cao.querySelector(".balao-cao"), balaoCaoTexto = balaoCao.querySelector("text");
let olhando = 1;
function porCao(l, dir) {
  const [x, y] = ponto(l);
  cao.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  if (dir) { olhando = dir; caoVira.setAttribute("transform", dir < 0 ? "scale(-1 1)" : ""); }
  return y;
}
const falaCao = (t) => { if (t) { balaoCaoTexto.textContent = t; balaoCao.classList.add("ve"); } else balaoCao.classList.remove("ve"); };

// ---------- Cartão: fila de bichinhos e porquinho do RSVP ----------
$("fila-bichos").innerHTML = [["pintinho", 30, .78], ["vaca", 86, .66], ["porquinho", 148, .72], ["ovelha", 210, .74], ["cavalo", 270, .6]]
  .map(([b, x, s]) => `<g transform="translate(${x} 66) scale(${s})">${BICHO[b]()}</g>`).join("")
  + `<g transform="translate(312 66) scale(.6) scale(-1 1)">${CAO.replace(/class="[^"]*"/g, "").replace(/<g\s+transform="translate\(-6 -96\)">[\s\S]*$/, "")}</g>`;
$("fila-bichos").parentNode.setAttribute("viewBox", "0 0 340 72");
$("rsvp-porco").innerHTML = BICHO.porquinho();

// ---------- Som (WebAudio, mudo até o 1º toque) ----------
const som = { ctx: null, ligado: false, master: null };
const botaoSom = $("som");
botaoSom.hidden = false;
function iniciarSom() {
  if (som.ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  som.ctx = new AC();
  som.master = som.ctx.createGain();
  som.master.gain.value = 0.9;
  som.master.connect(som.ctx.destination);
}
function marcarSom(v) { som.ligado = v; botaoSom.setAttribute("aria-pressed", String(v)); $("som-rotulo").textContent = v ? "Som ligado" : "Som desligado"; }
marcarSom(false);
function tom(f0, f1, dur, { tipo = "sine", vol = 0.18, quando = 0, filtro = 0, vib = null } = {}) {
  if (!som.ligado || !som.ctx) return;
  const c = som.ctx, t = c.currentTime + 0.02 + quando;
  const o = c.createOscillator(), g = c.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur / 4));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let saida = o;
  if (filtro) { const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filtro; o.connect(f); saida = f; }
  if (vib) { const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = vib.rate; lg.gain.value = vib.depth; lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 0.05); }
  saida.connect(g).connect(som.master);
  o.start(t); o.stop(t + dur + 0.05);
}
const SONS = {
  passo: (i) => tom(240 + (i % 2) * 40, 150, 0.07, { tipo: "triangle", vol: 0.12 }),
  pop: () => tom(480, 1150, 0.14, { vol: 0.16 }),
  au: () => { tom(640, 380, 0.1, { tipo: "square", vol: 0.06, filtro: 1400 }); tom(660, 390, 0.12, { tipo: "square", vol: 0.06, filtro: 1400, quando: 0.16 }); },
  pintinho: () => [0, 0.14, 0.28].forEach((q) => tom(1900, 2800, 0.09, { vol: 0.1, quando: q })),
  vaca: () => tom(160, 118, 1.0, { tipo: "sawtooth", vol: 0.16, filtro: 520, vib: { rate: 5, depth: 4 } }),
  porco: () => [0, 0.2].forEach((q) => tom(340, 250, 0.15, { tipo: "square", vol: 0.07, filtro: 1100, quando: q })),
  ovelha: () => tom(440, 400, 0.75, { tipo: "sawtooth", vol: 0.1, filtro: 1500, vib: { rate: 11, depth: 28 } }),
  cavalo: () => tom(980, 430, 0.85, { tipo: "sawtooth", vol: 0.08, filtro: 2200, vib: { rate: 16, depth: 70 } }),
  festa: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tom(f, f, 0.22, { tipo: "triangle", vol: 0.14, quando: i * 0.11 })); [523, 659, 784].forEach((f) => tom(f, f, 0.8, { tipo: "triangle", vol: 0.08, quando: 0.62 })); },
};
botaoSom.addEventListener("click", () => {
  if (!som.ctx) { iniciarSom(); marcarSom(true); } else marcarSom(!som.ligado);
  if (som.ctx?.state === "suspended") som.ctx.resume();
  if (som.ligado) SONS.au();
});
const primeiroToque = (e) => {
  if (e.target.closest && e.target.closest("#som")) return;
  if (!som.ctx) { iniciarSom(); if (som.ctx) marcarSom(true); }
  if (som.ctx?.state === "suspended") som.ctx.resume();
  removeEventListener("pointerdown", primeiroToque, true);
  removeEventListener("keydown", primeiroToque, true);
};
addEventListener("pointerdown", primeiroToque, true);
addEventListener("keydown", primeiroToque, true);

// ---------- Câmera ----------
const cena = $("cena"), balao = $("balao");
let escala = 1, camY = 0, camAnim = 0;
const medir = () => { const w = svg.getBoundingClientRect().width || 400; escala = w / 400; svg.style.height = `${(w * VB_H) / 400}px`; };
function focoPx() {
  const vh = cena.clientHeight, bh = balao.offsetHeight;
  return 64 + Math.max(120, vh - bh - 64 - 16) * 0.48;
}
const camPara = (worldY) => Math.max(0, worldY * escala - focoPx());
const camInicial = () => Math.max(0, ponto(L_INICIO)[1] * escala - (cena.clientHeight - balao.offsetHeight - 90));
function aplicarCam(y) { camY = y; svg.style.transform = `translate3d(0, ${(-y).toFixed(1)}px, 0)`; }
function moverCam(worldY, dur = 700) {
  cancelAnimationFrame(camAnim);
  const alvo = camPara(worldY), de = camY;
  if (reduzido.matches || dur <= 0) return aplicarCam(alvo);
  const t0 = performance.now();
  const passo = (t) => {
    const p = Math.min(1, (t - t0) / dur), e = 0.5 - Math.cos(Math.PI * p) / 2;
    aplicarCam(de + (alvo - de) * e);
    if (p < 1) camAnim = requestAnimationFrame(passo);
  };
  camAnim = requestAnimationFrame(passo);
}

// ---------- Interface ----------
const seguir = $("seguir"), seguirRotulo = $("seguir-rotulo"), quem = $("quem"), fala = $("fala"), dica = $("dica"), gesto = $("gesto");
const progresso = $("progresso"), titulo = $("titulo"), pular = $("pular"), deNovo = $("de-novo");
progresso.innerHTML = PARADAS.map((p) => `<li><svg viewBox="-12 -12 24 24" aria-hidden="true" focusable="false"><use href="#${p.pe}"/></svg><span class="sr-only">${p.quem}: ainda escondido</span></li>`).join("");
seguir.hidden = false;
gesto.hidden = false;

const estado = { achados: 0, andando: false, fim: false, raf: 0 };
const esperar = (ms) => new Promise((r) => setTimeout(r, reduzido.matches ? Math.min(ms, 60) : ms));

function balaoDiz({ quem: q, fala: f }, pista) {
  quem.textContent = q;
  fala.innerHTML = f;
  dica.textContent = pista || "";
  balao.classList.remove("pulsa"); void balao.offsetWidth; balao.classList.add("pulsa");
}
function mostrarPegadas(k, chamar = true) {
  if (!trechos[k]) return;
  trechos[k].pegadas.forEach(({ el }, i) => {
    el.style.transitionDelay = reduzido.matches ? "0s" : `${(i * 0.07).toFixed(2)}s`;
    el.classList.add("vista");
    if (chamar) el.classList.add("chama");
  });
}
function ocupado(sim) {
  estado.andando = sim;
  seguir.setAttribute("aria-disabled", String(sim));
  seguir.classList.toggle("chama", !sim && !estado.fim);
}

function andar(k) {
  const { la, lb, pegadas } = trechos[k];
  pegadas.forEach(({ el }) => el.classList.remove("chama"));
  return new Promise((fim) => {
    if (reduzido.matches) {
      pegadas.forEach(({ el }) => { el.style.transitionDelay = "0s"; el.classList.add("vista", "pisada"); });
      const y = porCao(lb, Math.sign(ponto(lb)[0] - ponto(la)[0]) || olhando);
      moverCam(y, 0);
      return fim();
    }
    cao.classList.add("andando");
    const dur = Math.max(1500, ((lb - la) / 230) * 1000), t0 = performance.now();
    let proxima = 0;
    const quadro = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      const l = la + (lb - la) * e;
      const dx = ponto(l + 4)[0] - ponto(l - 4)[0];
      const y = porCao(l, Math.abs(dx) > 1.2 ? Math.sign(dx) : 0);
      aplicarCam(camPara(y));
      while (proxima < pegadas.length && pegadas[proxima].l <= l + 6) {
        pegadas[proxima].el.style.transitionDelay = "0s";
        pegadas[proxima].el.classList.add("vista", "pisada");
        SONS.passo(proxima);
        proxima++;
      }
      if (p < 1) estado.raf = requestAnimationFrame(quadro);
      else { cao.classList.remove("andando"); fim(); }
    };
    estado.raf = requestAnimationFrame(quadro);
  });
}

async function revelar(k) {
  const { g, lado } = paradasEl[k];
  porCao(L_PARADA[k], lado);
  falaCao("?");
  g.classList.add("chegando");
  await esperar(650);
  g.classList.remove("chegando");
  g.classList.add("revelado");
  falaCao("!");
  SONS.pop();
  setTimeout(() => SONS[PARADAS[k].voz](), reduzido.matches ? 0 : 180);
  const li = progresso.children[k];
  li.classList.add("achou");
  li.querySelector(".sr-only").textContent = `${PARADAS[k].quem}: encontrado`;
  balaoDiz(PARADAS[k], k < 4 ? PARADAS[k + 1].pista : PISTA_FINAL);
  moverCam(paradasEl[k].ay + 26, 500);
  await esperar(900);
  falaCao("");
  mostrarPegadas(k + 1);
}

async function chegarNaFesta(instantaneo = false) {
  estado.fim = true;
  porCao(L_FIM, 1);
  turmaEl.querySelectorAll(".festa-bicho").forEach((b) => b.classList.add("revelado"));
  balaoDiz(FINAL, "");
  seguirRotulo.textContent = "Ver o convite";
  seguir.classList.remove("chama");
  gesto.hidden = true;
  pular.hidden = true;
  deNovo.hidden = false;
  html.classList.remove("jogando");
  moverCam(FOCO_FIM, instantaneo ? 0 : 900);
  if (instantaneo) return;
  cao.classList.add("pula");
  falaCao("♥");
  SONS.au();
  setTimeout(SONS.festa, 250);
  if (window.confetti && !reduzido.matches) {
    const cores = ["#FFC93C", "#F28BA3", "#7CC6F2", "#C93A26", "#A8D08D", "#FFFDF7"];
    confetti({ particleCount: 110, spread: 80, startVelocity: 42, origin: { y: 0.45 }, colors: cores, disableForReducedMotion: true, zIndex: 50 });
    setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors: cores, disableForReducedMotion: true, zIndex: 50 }), 300);
    setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors: cores, disableForReducedMotion: true, zIndex: 50 }), 450);
  }
  await esperar(1400);
  cao.classList.remove("pula");
  falaCao("");
}

async function avancar() {
  if (estado.andando) return;
  if (estado.fim) return irConvite();
  ocupado(true);
  titulo.classList.add("some");
  gesto.hidden = true;
  const k = estado.achados;
  if (k === 0) SONS.au();
  await andar(k);
  if (estado.fim) return; // pulou durante a caminhada
  if (k < 5) { await revelar(k); estado.achados = k + 1; }
  else await chegarNaFesta();
  ocupado(false);
}

function irConvite() {
  const alvo = $("convite");
  alvo.scrollIntoView({ behavior: reduzido.matches ? "auto" : "smooth", block: "start" });
  $("convite-titulo").focus({ preventScroll: true });
}

function pularTudo() {
  cancelAnimationFrame(estado.raf);
  cao.classList.remove("andando");
  trechos.forEach((t) => t.pegadas.forEach(({ el }) => { el.style.transitionDelay = "0s"; el.classList.add("vista", "pisada"); el.classList.remove("chama"); }));
  paradasEl.forEach(({ g }) => g.classList.add("revelado"));
  [...progresso.children].forEach((li, k) => { li.classList.add("achou"); li.querySelector(".sr-only").textContent = `${PARADAS[k].quem}: encontrado`; });
  titulo.classList.add("some");
  falaCao("");
  chegarNaFesta(true);
  ocupado(false);
  estado.achados = 5;
}

function recomecar() {
  cancelAnimationFrame(estado.raf);
  Object.assign(estado, { achados: 0, andando: false, fim: false });
  trechos.forEach((t) => t.pegadas.forEach(({ el }) => el.classList.remove("vista", "pisada", "chama")));
  paradasEl.forEach(({ g }) => g.classList.remove("revelado", "chegando"));
  turmaEl.querySelectorAll(".festa-bicho").forEach((b) => b.classList.remove("revelado"));
  [...progresso.children].forEach((li, k) => { li.classList.remove("achou"); li.querySelector(".sr-only").textContent = `${PARADAS[k].quem}: ainda escondido`; });
  titulo.classList.remove("some");
  pular.hidden = false; deNovo.hidden = true; gesto.hidden = false;
  seguirRotulo.textContent = "Seguir as patinhas";
  balaoDiz(INTRO, PARADAS[0].pista);
  html.classList.add("jogando");
  scrollTo({ top: 0, behavior: "auto" });
  porCao(L_INICIO, 1);
  aplicarCam(camInicial());
  mostrarPegadas(0);
  ocupado(false);
  seguir.focus();
}

// ---------- Eventos ----------
seguir.addEventListener("click", avancar);
pular.addEventListener("click", (e) => { e.preventDefault(); if (!estado.fim) pularTudo(); irConvite(); });
deNovo.addEventListener("click", recomecar);
cena.addEventListener("click", (e) => { if (!estado.fim && !e.target.closest("button, a, .balao")) avancar(); });
let ultimoGesto = 0;
const gestoAvanca = () => { const t = performance.now(); if (t - ultimoGesto > 700 && !estado.fim) { ultimoGesto = t; avancar(); } };
cena.addEventListener("wheel", (e) => { if (!estado.fim && e.deltaY > 6) gestoAvanca(); }, { passive: true });
let toqueY = null;
cena.addEventListener("touchstart", (e) => { toqueY = e.touches[0].clientY; }, { passive: true });
cena.addEventListener("touchend", (e) => { if (toqueY != null && toqueY - e.changedTouches[0].clientY > 40) gestoAvanca(); toqueY = null; }, { passive: true });
document.addEventListener("keydown", (e) => {
  if (estado.fim || e.target.closest?.("input, textarea, select, button, a")) return;
  if (["ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); gestoAvanca(); }
});
addEventListener("resize", () => { medir(); aplicarCam(estado.fim ? camPara(FOCO_FIM) : estado.achados === 0 ? camInicial() : camPara(ponto(L_PARADA[estado.achados - 1])[1])); });

// ---------- Início ----------
html.classList.add("jogando");
medir();
porCao(L_INICIO, 1);
aplicarCam(camInicial());
balaoDiz(INTRO, PARADAS[0].pista);
requestAnimationFrame(() => { medir(); aplicarCam(camInicial()); setTimeout(() => mostrarPegadas(0), reduzido.matches ? 0 : 350); ocupado(false); });
