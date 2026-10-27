# Conceito 3 · v2

Piquenique dos bichinhos — xadrez de morango, flores e uma festa no cercadinho.

## Direção

Festa infantil de **1 ano**, tema **country/fazendinha**. Animais simpáticos e arredondados: vaquinha, porquinho, ovelhinha, galinha/pintinho e cavalinho. Chapéu, bandana, cerca e celeiro entram como complementos. Sem foto, criança ilustrada ou rosto de Arthur. Esta é uma das três alternativas para escolha do Yan; nenhuma foi escolhida pelo designer. Os conceitos anteriores ficam preservados no diretório pai como histórico.

## Paleta e tipografia

Fundo `#FFFAF2`; texto `#583A35`; acento funcional `#9A3F47`; secundário `#6F524C`; apoio `#F7E1DC`; rosa decorativo `#F3BDBE`; amarelo decorativo `#F3D994`; verde decorativo `#DEE6C5`. Pastéis são fundos/ilustração; não usar pastéis como cor de texto. Erros: `#A1273A` sobre `#FFF2F2` ou fundo da página.

Noto Serif Bold para Arthur e títulos, Noto Sans Regular/Bold para informações e interface. Fontes livres, **SIL Open Font License 1.1**, originais sem alteração em `fontes/`, com licença e proveniência do pacote Noto local. Origem do projeto indicada no arquivo de licença. Não depender de carregamento remoto de fontes.

| Uso | Texto / fundo | Contraste |
|---|---|---|
| Texto principal | `#583A35` / `#FFFAF2` | 9.76:1 |
| Texto secundário | `#6F524C` / `#FFFAF2` | 6.77:1 |
| Acento | `#9A3F47` / `#FFFAF2` | 6.36:1 |
| Botão | `#FFFAF2` / `#9A3F47` | 6.36:1 |
| Texto em apoio | `#583A35` / `#F7E1DC` | 8.09:1 |
| Secundário em apoio | `#6F524C` / `#F7E1DC` | 5.61:1 |
| Texto nos campos | `#6F524C` / `#FFFFFF` | 7.03:1 |
| Erro | `#A1273A` / `#FFF2F2` | 6.71:1 |
| Erro junto ao campo | `#A1273A` / `#FFFAF2` | 7.05:1 |

Pares calculados por luminância sRGB, AA para texto normal (≥4,5:1). `contraste.json` contém as medições. Textos em superfícies opacas; padrões sem função de informação. A documentação de contraste não certifica a futura implementação. Bordas e foco usam acento escuro; foco visível de 2 px + afastamento 3 px; não depender só de cor nos estados.

## Arquivos e composição

- `celular-390.png`: página completa, largura 390 px, referência principal.
- `desktop-1440.png`: página completa, largura 1440 px.
- `*-topo-*.png`: recortes de apresentação, altura 1000 px.
- `estados-rsvp-1440.png`: prancha com cinco estados, cada cartão de 390 px; `estados-rsvp/` traz os cinco PNGs individuais em 390 × 670.
- `assets/fazendinha.svg`: composição principal. `cow.svg`, `pig.svg`, `sheep.svg`, `hen.svg`, `horse.svg`: bichinhos separados; `padrao.svg`: padrão decorativo. Todos **vetores originais desenhados por Deidara para este convite**, mesma geometria usada nos PNGs. Sem imagem de banco, marca, personagem licenciado ou imagem gerada de criança. Autoria nos metadados. Entregues para uso e adaptação neste projeto.
- Preservar proporção dos SVGs; não cortar rostinhos/orelhas. No celular, ilustração se mantém inteira; no desktop, área maior com respiro. Corpo do texto, título e formulário devem ser HTML real, não imagem. SVG decorativo com `aria-hidden=true` quando os bichinhos não acrescentam informação ao convite.
- Na largura intermediária, empilhar capa e formulário antes de apertar colunas. Margem mínima 24 px a 390 px. Campos 54 px e botão 56 px; corpo 15–18 px. Evitar reduzir o formulário para caber.

## Dados exatos

**Arthur, 1 ano. Domingo, 29 de novembro de 2026, às 15h. Local a confirmar. Venha caracterizado: country/fazendinha.** “1 aninho” é apenas a forma afetiva do mesmo dado na capa. Não foi acrescentado local, contato, prazo de confirmação ou nome de responsável.

## RSVP em planilha privada

Campos: **Nome**, **Nº de adultos**, **Nº de crianças**. Botão: **Confirmar presença**. Os zeros dos mockups são estado inicial ilustrativo; não são presença já enviada. Destino: planilha **privada**, com gravação via integração a ser implementada por Edward; este pacote é somente design, sem conexão ou envio.

Estados desenhados:

1. **Inicial**: formulário e botão ativos.
2. **Enviando**: botão “Enviando…”, controles temporariamente desabilitados, indicação textual de espera. Evitar duplicidade de submissão. Não limpar os valores antes de concluir.
3. **Sucesso**: **“Presença registrada!”**, exclusivamente após confirmação real de gravação persistida. No mockup, o estado mantém os campos visíveis como contexto e troca o botão pelo estado inativo “Confirmado”; na página, tornar os campos somente leitura e bloquear novo envio acidental após sucesso. Nunca disparar por clique, temporizador, resposta pendente ou estado apenas local. Mensagem com `role=status`/`aria-live=polite`.
4. **Erro**: **“Não conseguimos registrar agora; tente de novo”**; manter os dados e permitir tentativa. O botão volta a “Confirmar presença”; nenhuma indicação de sucesso. Mensagem com `role=alert`.
5. **Campos inválidos**: nome obrigatório; números inteiros ≥0; soma adultos + crianças ≥1. Texto de erro junto ao campo, borda de erro, `aria-invalid` e associação por `aria-describedby`. Foco no primeiro inválido. Erro de soma próximo ao grupo de quantidades. Os dados inválidos mostrados são ilustrativos.

Não expor link público da planilha, credenciais ou respostas de outros convidados. Nenhum número ou serviço de conversa faz parte desta versão. Pendências para implementação: integração de gravação privada e local do evento; não inventar esses dados.

## Motion

`motion.json` especifica alvos, duração, easing, execução única e **prefers-reduced-motion**. Com redução de movimento, todos os elementos ficam imediatamente no estado final, sem fades, translação, rotação ou escala. Feedback de envio, sucesso e erro é textual e imediato em ambos os modos. Sem movimento nos campos; sem loops, áudio ou efeitos piscantes.

## Estado da entrega

Mockups estáticos completos, não implementação. Formulários ilustrativos, nenhuma presença registrada ou planilha criada. Não publicado; ninguém contatado.
