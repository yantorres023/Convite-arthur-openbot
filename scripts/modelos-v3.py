#!/usr/bin/env python3
"""Gera modelos/conceito-{4,5,6}.html (convites interativos) a partir da arte v3 da Deidara:
design/v3/conceito-N/assets/cena-interativa.svg (cena 390×700 com os estados) + hotspots.json (alvos).
Os alvos viram <button> HTML transparentes posicionados em % sobre a cena (acessíveis, foco visível).
Depois: python3 scripts/montar.py."""
import json, pathlib
RAIZ = pathlib.Path(__file__).resolve().parent.parent

CONCEITOS = {
  4: dict(nome="Bom dia, bichinhos!", js="bichinhos.js", cor="#C0DFFA",
          chamada="Shhh… a fazendinha ainda está dormindo", dica="👆 Toque nos bichinhos para acordar!",
          descricao="Toque nos bichinhos para acordar a fazendinha!",
          alvo=lambda h: f'Acordar {dict(vaca="a vaquinha", galinha="a galinha", porco="o porquinho", ovelha="a ovelhinha", cavalo="o cavalinho")[h["id"]]}',
          extra=lambda h: '<span class="zz" aria-hidden="true">Zzz</span><span class="fala" aria-hidden="true">' + dict(vaca="Muuu!", galinha="Có-có!", porco="Oinc!", ovelha="Méé!", cavalo="Iiirrí!")[h["id"]] + '</span>'),
  5: dict(nome="Cadê os ovinhos?", js="ovos.js", cor="#FFE9AF",
          chamada="A galinha escondeu o convite do", dica="🥚 Toque nos ovinhos!",
          descricao="Ache os 5 ovinhos para descobrir o convite!",
          alvo=lambda h: f'Abrir o ovinho {h["id"].split("-")[1]}', extra=lambda h: ""),
  6: dict(nome="Um bolinho pro Arthur", js="bolo.js", cor="#DCD5F4",
          chamada="Vamos montar o bolo do", dica="👆 Toque no botão para montar o bolo!",
          descricao="Monte o bolinho da fazendinha e assopre a vela!", alvo=None, extra=None),
}

def pct(v, total): return f"{v / total * 100:.2f}%"

for n, c in CONCEITOS.items():
    hs = json.loads((RAIZ / f"design/v3/conceito-{n}/hotspots.json").read_text(encoding="utf-8"))
    W, H = hs["viewBox"][2], hs["viewBox"][3]
    botoes = ""
    if c["alvo"]:
        attr = "data-bicho" if n == 4 else "data-ovo"
        for h in hs["hotspots"]:
            x1, y1, x2, y2 = h["bounds"]
            valor = h["id"] if n == 4 else h["id"].split("-")[1]
            botoes += (f'    <button type="button" class="alvo" {attr}="{valor}" data-alvo="{h["id"]}" '
                       f'style="left:{pct(x1, W)};top:{pct(y1, H)};width:{pct(x2 - x1, W)};height:{pct(y2 - y1, H)}" '
                       f'aria-label="{c["alvo"](h)}">{c["extra"](h)}</button>\n')
    else:
        botoes = '    <button type="button" class="acao" data-acao>🍰 Colocar a 1ª camada</button>\n'
    html = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{c["nome"]} — Arthur, 1 aninho</title>
<meta name="description" content="Aniversário de 1 aninho do Arthur: domingo, 29/11/2026, às 15h, na Casa da Árvore. {c["descricao"]}">
<meta property="og:type" content="website">
<meta property="og:title" content="{c["nome"]} — Arthur, 1 aninho">
<meta property="og:description" content="Domingo, 29/11, às 15h · Casa da Árvore · Venha caracterizado de country/fazendinha">
<meta property="og:image" content="https://yantorres023.github.io/Convite-arthur-openbot/conceito-{n}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="theme-color" content="{c["cor"]}">
<link rel="stylesheet" href="../comum/v2.css">
<link rel="stylesheet" href="../comum/festa.css">
<link rel="stylesheet" href="estilo.css">
<script src="../comum/vendor/canvas-confetti-1.9.3.min.js" defer></script>
<script type="module" src="../comum/pagina.js"></script>
<script type="module" src="{c["js"]}"></script>
</head>
<body class="festa">
<div class="barra">
  <button type="button" class="btn-som" data-som aria-pressed="false" aria-label="Ligar o som">🔇</button>
  <a class="btn-pular" href="#convite" data-pular>Pular e ver o convite</a>
</div>

<header class="cena cena-v3" data-cena data-estado="inicio">
  <div class="palco-v3">
    <!--SVG design/v3/conceito-{n}/assets/cena-interativa.svg cena-arte c{n}-->
    <div class="titulo">
      <p class="chamada">{c["chamada"]}</p>
      <h1>Arthur</h1>
      <p class="idade">1 aninho</p>
      <p class="nome-brincadeira">{c["nome"]}</p>
    </div>
{botoes}  </div>

  <p class="dica" data-dica role="status">{c["dica"]} <span class="dica-contador" data-contador>0/5</span></p>
  <ol class="revelados" data-revelados aria-live="polite" aria-label="O que a brincadeira revelou"></ol>
  <a class="seta-baixo" href="#convite" data-ver>Ver o convite completo ↓</a>
</header>

<!--DETALHES-->
</body>
</html>
'''
    (RAIZ / f"modelos/conceito-{n}.html").write_text(html, encoding="utf-8")
    print(f"modelos/conceito-{n}.html")
