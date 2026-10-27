# Contrato SVG · conceito 5

**Usar `assets/cena-interativa.svg` como fonte canônica dos ids.** Os arquivos anteriores são estudo visual. Fontes, cores e og-image.png permanecem válidos; os novos estados ampliam a mecânica para cinco alvos nos conceitos 4/5.

ViewBox 390×700. Grupos `#ceu` e `#chao` separados; elementos ambientais dentro deles mantêm ids para motion. IDs principais: **ovo-1..ovo-5; cada um com {id}-inteiro e {id}-rachado; pintinho em defs, usado nas cascas abertas**.

`style="display:none"` marca estados inicialmente ocultos. Ao trocar estado, ocultar o anterior e mostrar o novo com display:inline (ou remover a propriedade). Não usar só opacity:0 se o objeto continuar recebendo foco/clique. SVG é arte: aplicar a interação num botão HTML correspondente, com nome, foco e alvo de pelo menos 48px. `hotspots.json` dá as áreas em coordenadas do viewBox. Para o bolo, botão sequencial é mais fácil no celular que arrastar peças.

Inicial: cinco animais dormindo no 4; cinco ovos inteiros no 5; suporte vazio no 6. No SVG do 5, `#pintinho` fica em defs como desenho reutilizável; cada `ovo-N-rachado` contém seu use e a casquinha. O PNG `previa-integracao-390.png` mostra animais/ovos iniciais e o bolo concluído para facilitar composição, não é página a copiar.

A sequência é a do `motion.json` e README atualizados. Dados/resumo sempre disponíveis por Pular brincadeira e Ver convite completo. Som começa desligado; só ligar com gesto e escolha explícita. Redução de movimento mantém revelação instantânea, sem loop/voos/confete.

A arte pode ser reposicionada olhando a página rodando, sem manter coordenadas cegamente. Manter Arthur e o primeiro toque visíveis nos primeiros 3 segundos. Sem esconder informações essenciais atrás de progresso.
