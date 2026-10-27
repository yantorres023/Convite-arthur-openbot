# Passe de arte 01 · AJUSTES

Páginas publicadas inspecionadas em 27/10/2026, **17:55–17:57 BRT**, no navegador OpenBot, com largura útil CSS **390 px**. Este passe corresponde à versão provisória enviada na mensagem c8b6f93f; não é uma avaliação de revisão posterior que Edward possa ter aplicado durante o trabalho:

- [4 — Acorde os bichinhos](https://yantorres023.github.io/Convite-arthur-openbot/conceito-4/)
- [5 — Caça aos ovos](https://yantorres023.github.io/Convite-arthur-openbot/conceito-5/)
- [6 — Monte o bolo](https://yantorres023.github.io/Convite-arthur-openbot/conceito-6/)

**Veredito: ajustes de arte antes de aprovação final.** As três mecânicas respondem ao primeiro toque; as letras atuais são infantis e têm boa presença. Manter **Baloo 2 + Fredoka (4), Chewy + Fredoka (5), Lilita One + Fredoka (6)**, com os arquivos/licenças que Edward já incluiu. Não é preciso trocar tipografia para seguir o rascunho de paleta original.

## Ajustes sugeridos

| ID | Tela | Severidade | Observação na página e correção |
|---|---|---|---|
| A01 | 4, 5, 6 | Média | Há bastante céu sem ação entre o nome e os atores, sobretudo no bolo vazio. Usar esse espaço para ambientação e convite ao toque, mantendo a cena em tela cheia. O SVG entregue inclui uma faixa superior para o título: não inseri-lo inteiro dentro do palco abaixo de outro cabeçalho, pois duplicaria o vazio. Recompor ambiente como fundo da cena e atores na mesma coordenada de referência. |
| A02 | 4, 5, 6 | Média | Os dados revelados entram numa lista abaixo da pista e alteram a altura disponível ao palco. Reservar uma área para a informação atual ou mostrá-la em balão sem empurrar os atores a cada toque. O histórico pode ficar depois da cena. O primeiro dado precisa ser visto sem procurar mais abaixo. |
| A03 | 4, 5, 6 | Baixa | Nome e letras estão bons. Manter a fonte e o tamanho aproximado atuais; transformar “1 aninho” em peso Fredoka 600/700 ou na fonte de título para ficar consistente com a chamada e o contador. Não engrossar todo o corpo do convite. |
| A04 | 4 | Alta | O filtro escuro e Zzz não fecham os olhos: o bichinho parece acordado antes do toque. Aplicar `#vaca/#galinha/#porco/#ovelha/#cavalo`, alternando `-dormindo` e `-acordado` reais. Remover o filtro quando houver os dois estados; preservar cor e expressão dos personagens. |
| A05 | 4 | Média | Sol atrás do cavalo disputa a silhueta e a cerca se mistura às áreas brancas dos animais. Usar o amanhecer enriquecido entregue; manter cercas/pomar/feno atrás e separar a posição do sol dos rostos. A comemoração pode elevar o sol sem cruzar o cabeçalho. |
| A06 | 5 | Alta | O pintinho é a galinha adulta reduzida, com crista. Trocar pelo `#pintinho` original (sem crista), já reutilizado em `#ovo-N-rachado`. Cada ovo tem inteiro/rachado para revelar casca + filhote com clareza. |
| A07 | 5 | Média | Os cinco ovos iguais se confundem com o fundo amarelo. Usar cores distintas, com contorno escuro, alvos ≥48 px e os novos fardos/ninho/cerca. Galinha central grande: preservar seu protagonismo, sem deixar ovo clicável coberto por feno/folhagem. |
| A08 | 6 inicial | Alta | O suporte sozinho deixa a primeira tela pouco expressiva. Usar `#artpass-silhueta-bolo` e `#artpass-bichinhos-convidando`: o primeiro some ao começar a montagem; os convidados laterais saem quando os bichinhos do topo aparecem. Há um desenho de bolo para descobrir já no primeiro quadro. |
| A09 | 6 montagem/final | Média | O bolo CSS é legível, mas a vela listrada e o “1” separado criam dois elementos. Usar o bolo SVG: `#suporte`, `#camada-1..3`, `#topo-bichinhos`, `#vela` e `#chama`; a própria vela já é numeral 1. O grupo da chama fica independente para apagar no toque final. Não acrescentar outro 1 em HTML ao lado. |
| A10 | RSVP comum | Baixa | O botão desabilitado ainda parece tão ativo quanto o da agenda. Dar tratamento visual inativo e pôr o aviso “Confirmação ainda não ativada” acima dele, com bom contraste. Manter componente e integração desligados. Não habilitar envio ou publicar Apps Script. |

O primeiro toque foi exercitado ao vivo nas três páginas. Os GIFs de Edward mostram também a conclusão; examinei quadros de início, meio e final. Não tratei isso como novo e2e de mapas, agenda, áudio ou reduced-motion. A barra de pular e o som começam visíveis; o primeiro gesto da brincadeira liga o som na versão atual, comportamento permitido pelo briefing atualizado. Não alterar essa decisão silenciosamente durante o passe de arte.

## Arte pronta para aplicar

Em cada `../conceito-N/`:

- **`assets/cena-interativa.svg`**: fonte canônica, cenário enriquecido e estados com ids; **sem `<text>` visual**. `#ceu` e `#chao` separados.
- **`assets/cenario-interativo.svg`**: ambiente sem os alvos principais; não sobrepor a cena completa com os mesmos atores outra vez.
- **`INTEGRACAO-EDWARD.md`**: contrato de estados e complementos deste passe.
- `hotspots.json`: posições de referência; adaptar ao enquadramento real, sem colar coordenadas se o viewBox/altura mudar.
- **`og-image.png`**: composição original 1200×630 já entregue, com Arthur, idade, data/hora e Casa da Árvore. Usar como novo `og.png` ou atualizar o meta para o nome correto; não deixar metadado apontando para o asset antigo por engano.
- `contraste.json`: inclui os novos gradientes do céu (todos os pares medidos AA).

No 4, a arte agora tem amanhecer com gradiente, pomar, feno e margaridas. No 5, cerca, ninho com palha, galinha ampliada, fardos e cinco ovos coloridos. No 6, quintal com árvores, cerca, balões, presentes, flores, convite visual à montagem e bolo completo em vetores. A chama/vela do bolo foi deslocada para fora da faixa reservada ao título (70–238 no viewBox 390×700).

## Evidências e escopo

- `passe-arte-anotado.png`: marcações sobre quadros das gravações próprias de Deidara (primeiro quadro, antes da nova arte).
- `390-conceito-N-antes.png` / `-final-antes.png`: capturas de Edward preservadas, largura exata 390.
- `gif-N-quadros.png`: quadros dos GIFs completos de Edward, não desenhos novos da interação.
- `live-N-primeiro-toque.webm` / `.gif`: primeiras interações gravadas por Deidara no OpenBot; viewport útil390 CSS. O WebM inclui escala/gutter do navegador; GIF reduzido a390 para apresentação.
- `evidencias.json`: ações observadas, fontes e limites.

**Aviso técnico ao Edward:** nas três páginas, o navegador registrou GET404 de `comum/rsvp-config.local.js`. O formulário corretamente continuou inativo. Evitar a requisição a um arquivo deliberadamente ausente na versão pública para cumprir o critério de console limpo; não resolver publicando a configuração local. As fontes tiveram falha de cache inicial e depois HTTP200; não classifiquei isso como falha permanente.

Não editei o código do app, não fiz push/publicação e não registrei presença. A próxima etapa é Edward aplicar a arte e os ajustes e enviar novas páginas/prints/GIFs para a conferência final. Nenhum conceito escolhido pelo designer.
