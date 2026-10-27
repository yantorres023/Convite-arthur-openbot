#!/usr/bin/env python3
"""Monta conceito-N/index.html a partir de modelos/conceito-N.html (v2, fazendinha).
Marcadores:
  <!--SVG caminho.svg classe prefixo-->  SVG original da Deidara embutido como decorativo (aria-hidden), com os ids
                                         prefixados (prefixo-id) para não repetir ids na página;
  <!--RSVP-->                            bloco comum do RSVP (comum/rsvp.html), que pode conter marcadores SVG.
Uso: python3 scripts/montar.py   (rodar de novo depois de editar um modelo)."""
import re, pathlib
RAIZ = pathlib.Path(__file__).resolve().parent.parent
rsvp = (RAIZ / "comum/rsvp.html").read_text(encoding="utf-8").strip()

def svg(caminho, classe, prefixo):
    s = (RAIZ / caminho).read_text(encoding="utf-8")
    s = re.sub(r"<title[^>]*>.*?</title>", "", s, flags=re.S)
    s = s.replace('role="img" aria-labelledby="title"', f'class="{classe}" aria-hidden="true" focusable="false"', 1)
    assert 'aria-hidden="true"' in s, caminho
    assert "url(#" not in s and 'href="#' not in s, f"{caminho}: referência interna; prefixar ids quebraria"
    vistos = {}
    def novo(m):  # prefixa e numera repetições (o SVG original pode repetir um id, ex.: "remendos")
        i = m.group(1); vistos[i] = vistos.get(i, 0) + 1
        return f' id="{prefixo}-{i}"' if vistos[i] == 1 else f' id="{prefixo}-{i}-{vistos[i]}"'
    return re.sub(r' id="([^"]+)"', novo, s)

for n in (1, 2, 3):
    m = (RAIZ / f"modelos/conceito-{n}.html").read_text(encoding="utf-8")
    m = m.replace("<!--RSVP-->", rsvp.replace("{N}", str(n)))
    m = re.sub(r"<!--SVG (\S+) (\S+) (\S+)-->", lambda x: svg(x.group(1), x.group(2), x.group(3)), m)
    assert "<!--" not in m, f"marcador sobrando em conceito-{n}"
    ids = re.findall(r' id="([^"]+)"', m)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    assert not dup, f"conceito-{n}: ids repetidos {dup}"
    m = m.replace("<!doctype html>\n", "<!doctype html>\n<!-- gerado por scripts/montar.py a partir de modelos/; não editar à mão -->\n", 1)
    (RAIZ / f"conceito-{n}/index.html").write_text(m, encoding="utf-8")
    print(f"conceito-{n}/index.html")
