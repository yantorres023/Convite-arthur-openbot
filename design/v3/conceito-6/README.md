# 6 — Um bolinho pro Arthur

**Montar um bolo de fazendinha em três toques e fazer a festa.**

## Direção de arte para construção ao vivo

Cena de fazendinha ocupa a primeira tela, sem cartão branco em volta e sem longos vazios de céu. Bichinhos grandes, contornos suaves e festivos, sol com rosto, flores, bandeirinhas e letras grossas. A cena traz uma brincadeira visível nos primeiros 3 segundos; título **Arthur · 1 aninho** em HTML acima dos atores. Texto principal entre y=70 e y=238 no viewBox 390×700. Som/pular no topo, sem cobrir nome ou personagens. A arte é um ponto de partida editável: Edward tem liberdade de recompor enquadramento e intensidade olhando a página real. Não copiar uma página de PNG.

Paleta: sky #DCD5F4; bg #FFF1F0; ink #493652; accent #97435E; pink #F09BBA; yellow #FFE08A; green #BFE1AB. Texto em superfícies opacas / céu claro com pares AA em `contraste.json`; verde apenas em cenário, botões usam acento contrastante.

Tipografia **Fredoka + Lilita One**, livre SIL OFL 1.1. Arquivos oficiais locais e licenças em `../fontes/`. Nomes/títulos com Lilita One 400 (4), Baloo 2 800 (5), Fredoka 700 (6); UI Fredoka 450/600, mínimo 16px. Não usar Noto como fonte principal desta revisão. Nome com altura visual 64–76px a 390, contorno branco de 2px e sombra curta colorida de 3px, sem sombreado que tire legibilidade.

## Assets originais / integração

- `assets/cena-completa.svg` (rascunho de composição anterior, sem contrato de integração): cena total para referência de composição, 390×700. Grupos com ids nomeados para motion; não é mockup de página.
- `assets/cenario.svg`: ambiente sem os objetos principais interativos. Pode ser fundo absoluto que sangra até as bordas.
- `assets/*.svg`: atores e elementos recortados vetorialmente com origem consistente; bichinhos isolados cow/pig/sheep/hen/horse em 240×250.
- Conceito 4: `cow-sleep.svg`, `pig-sleep.svg`, `sheep-sleep.svg` são estados iniciais; após toque, trocar pelo respectivo SVG acordado. O cenário completo do 4 mostra o início, o do bolo mostra a montagem concluída.
- `hotspots.json`: coordenadas, alvos e dados revelados. Elementos interativos precisam de botão HTML nativo, texto acessível e foco; evitar clique só no SVG decorativo. Não duplicar atores ao sobrepor o cenário e a cena completa.
- `previa-cena-390.png`: somente prévia da ilustração, sem layout de site a copiar.
- `og-image.png`: arte original 1200×630, local/horário corretos; usar URL absoluta no og:image e dimensões declaradas, depois validar link publicado.

Autoria dos SVGs: Deidara, originais para o convite do Arthur, sem personagens licenciados, assets de banco ou rosto de criança. Uso e adaptação autorizados neste projeto. `fontes/` contém créditos e licenças das fontes Google Fonts; nenhuma biblioteca externa é exigida para a arte ou para o motion.

## Mecânica alinhada com Edward

1. Suporte vazio no primeiro quadro; botão Montar o bolo e prévia lúdica das camadas (fora da área de ação se necessário).
2. Toque 1 revela camada-1 + data/hora; toque 2 camada-2 + endereço; toque 3 camada-3 + tema.
3. Após terceira camada, entram topo-bichinhos, vela numeral 1 e chama. Botão passa a Assoprar a vela; toque dispensa microfone/permissão.
4. Toque final oculta chama, solta confete e toca melodia curta somente se som estiver habilitado. RSVP continua inativo.

**Pular brincadeira** e **Ver convite completo** não dependem de completar toques. Som começa desligado, botão de som explícito, opt-in após gesto. O significado está no feedback visual/textual; não depender do áudio. As onomatopeias podem aparecer como microfeedback, sem substituir os dados. Especificação no `motion.json`, incluindo reduced-motion e pausa das animações.

## Dados / utilidades no resumo

Arthur, **1 aninho**. **Domingo, 29/11/2026, 15h.** **Casa da Árvore — Rua Castelo Branco, nº 31, Cidade Nova, Santana do Paraíso.** **Venha caracterizado de country/fazendinha.** Reusar exatamente os links de Google Maps / Apple Maps / Waze já aprovados no projeto; não criar coordenadas novas. **Adicionar à agenda** entrega `.ics` com data/hora e endereço corretos; não inventar horário de término.

RSVP: reutilizar componente existente com a mensagem **“Confirmação ainda não ativada”**, campos/botão indisponíveis. Não ativar endpoint, não publicar Apps Script, não simular confirmação ou registro. A comemoração da brincadeira celebra o convite, não significa presença confirmada.

## Passe de arte seguinte

Avaliar a página rodando em 390: legibilidade na primeira tela, atores e botões grandes sem sobreposição, primeiro toque óbvio, reação visível, revelação de dados, pular/reduced-motion. A evidência final será print da página e GIF/vídeo de interação, depois dos ajustes de Edward.
