// Gera conceito-N/og.png (1200×630) a partir da cena resolvida de cada conceito interativo.
// Uso: servidor local na raiz (python3 -m http.server 4301 --bind 127.0.0.1) e: node scripts/og.mjs
import { chromium } from "playwright";
const BASE = process.env.BASE || "http://127.0.0.1:4301";
const b = await chromium.launch();
for (const c of ["conceito-4", "conceito-5", "conceito-6"]) {
  const p = await (await b.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: "reduce" })).newPage();
  await p.goto(`${BASE}/${c}/`, { waitUntil: "networkidle" });
  await p.click("[data-pular]"); await p.waitForTimeout(300);
  await p.addStyleTag({ content: `.barra,.dica,.revelados,.seta-baixo,.acao{display:none !important}
    .cena{min-height:630px;height:630px;flex-direction:row;align-items:center;justify-content:center;gap:10px;padding:0 40px}
    .titulo{flex:0 0 470px;text-align:center}.titulo h1{font-size:150px}.idade{font-size:34px}
    .palco{flex:0 0 600px;height:600px;min-height:0;margin:0}` });
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
  await p.screenshot({ path: `${c}/og.png`, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(c, "og.png");
}
await b.close();
