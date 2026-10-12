# Roma v7 — mecânicas e investigação histórica

Atualização local de 09/10/2026. [Abrir o jogo](http://localhost:8080/roma.html?v=7).

## O que mudou

- Palha: o quadrado artificial foi removido. A coleta usa o monte já desenhado abaixo da carroça, com um pequeno brilho antes de recolher.
- Coliseu: interação alinhada ao centro do portão (x = 1500), indicação discreta e transição de entrada/saída. Renato continua no corredor seguro da arena.
- Laço: desenho contínuo de corda enrolada, com ponta solta. A mira oscila mais devagar, com uma faixa um pouco mais tolerante e indicação de acerto. Quem prefere movimento reduzido recebe mira estável.
- Bonecos: silhueta com cabeça, braços, pernas, feixes de palha, amarrações e desgaste após ataques. Lançamento em arco, perseguição e ataques dos leões mantidos.
- Senado: interior disponível, com retorno ao Foro pelo portal à esquerda.
- Livros: botão **Livros · B**, dois volumes, cinco capítulos e fontes acessíveis dentro de cada capítulo.
- Investigação: cada registro apresenta uma afirmação adulterada. É obrigatório anotar a evidência do capítulo correspondente antes de escolher a correção. Anotar outra página não libera a resposta. Erros dão orientação e permitem tentar novamente sem perder itens.
- Encerramento: cinco registros corrigidos, projeção do saque de 410 e distinção entre 410 e 476. É possível continuar explorando ou voltar ao Cofre.

## Percurso

Chegada → observar arena → recolher palha caída → fabricar bonecos na oficina → pegar laço no Foro → distrair leões e recuperar folha → entrar no Senado → conferir 378 com Lúcio → conferir 382 com a projeção de Teodósio → corrigir o mapa de 395 com o mensageiro do Foro → conversar com a mercadora → conferir a corte de Honório no Senado → observar o portão do mercado em 410 → separar 410 e 476 na última página.

Renato corrige registros adulterados, não inventa as causas dos acontecimentos. A audiência no Senado e os diálogos são encenações fictícias do Cofre. Os saltos temporais são explicitamente anunciados.

## Deterioração e tempo

A erosão da memória cresce enquanto o jogo está ativo: depois de 2min30s aparecem fissuras; depois de 5min, destroços e tábuas; depois de 7min30s, fumaça e focos de fogo. O progresso narrativo também estabelece um estágio mínimo. A cena de 410 usa o estágio final.

O relógio pausa em livros, perguntas, diálogos, fabricação, mapa, cenas, transições e aba oculta. Não há prazo de derrota, perda por demorar a ler, nem colisões novas bloqueando as rotas. Ao concluir, o relógio para.

As camadas de deterioração são estilizadas. Elas representam a instabilidade da memória; não afirmam que a cidade inteira foi destruída historicamente.

## Progresso salvo

O mesmo armazenamento local é mantido. Palha, bonecos, laço, folha e locais descobertos são preservados. Um save antigo que já tinha a folha — inclusive o final antigo — passa a continuar na nova investigação do Senado; o antigo despacho é substituído pelo decreto obtido na nova sequência. Evidências, correções, tempo ativo e tentativas ficam salvos. Não é necessário reiniciar Roma.

## Arquivos para ajustar

Todos os caminhos abaixo ficam em C:/Users/Matheus/Documents/memorias perdidas/.

- js/roma.js: áreas e floorY, portais, posição do portão, movimento, coleta, mira, trama, relógio e camadas de deterioração. Procurar por areas, ARENA_GATE_X, storyObjectives, updateDecay e renderDecay.
- js/roma-history-data.js: conteúdo dos dois volumes, fontes, registros adulterados e alternativas.
- js/roma-history.js: abertura do livro, anotação de evidências, comparação, feedback e navegação por teclado.
- css/roma-mechanics.css: novos objetos, livro responsivo, deterioração e indicadores.
- css/roma.css: base anterior preservada, sem alterações nesta rodada.
- roma.html: botão Livros, camadas e carregamento dos novos módulos.
- assets/images/roma/laco-v7.svg, boneco-palha-v7.svg e roma-fire-v7.svg: desenhos em grade de pixels feitos em código, sem editar os fundos.
- assets/images/roma/senado-interior-simples-v6.png: arte preparada anteriormente, agora integrada.

Backup anterior à atualização:
C:/Users/Matheus/Documents/Codex/2026-09-24/https-github-com-mhueto-memorias-perdidas/work/art-v7-backup/

Não foram alterados index.html nem os originais das imagens nesta rodada. Nenhum commit ou envio ao GitHub foi feito.

## Validação

22 cenários aprovados:
- 11 de regressão: movimento, animações, direção dos NPCs, retorno entre áreas, estados salvos de arena, luta, laço e controles em celular.
- 10 de mecânicas/história: coleta única, entrada/retorno, objetos, cinco correções, erro recuperável, evidência de página errada bloqueada, retomada após recarregar, teclado, timer/pausa, ruínas transitáveis, save legado e celular 375×812 e 844×390.
- 1 percurso completo desde a chegada, passando por materiais, fabricação, recuperação da folha e todas as correções até o encerramento.

Testes em navegadores isolados, sem sobrescrever o progresso do usuário. Sem erros de script ou recursos HTTP ausentes nos cenários testados. Telas dos objetos, livro, Senado, deterioração e encerramento revisadas visualmente.

Relatórios no workspace:
- work/roma-regression-artifacts/report.json
- work/roma-v7-artifacts/report.json
- work/roma-v7-journey-artifacts/report-journey.json

## Fontes do livro

Textos curtos e autorais; as fontes abaixo também aparecem em “Fontes deste capítulo” dentro do jogo.

- Adrianópolis e Valente: [A. D. Lee — Adrianople, battle of, The Encyclopedia of Ancient History](https://onlinelibrary.wiley.com/doi/full/10.1002/9781444338386.wbeah19003).
- Acordo de 382 e debate sobre seus termos: [Alenka Cedilnik — The Conclusion of the Roman-Gothic Peace Treaty in 382, Universidade de Ljubljana](https://journals.uni-lj.si/keria/article/view/3873), com [registro na Biblioteca Nacional e Universitária da Eslovênia](https://www.dlib.si/details/URN:NBN:SI:doc-ZK838JS2). Referência complementar reaproveitada da pesquisa anterior: [Melinda Székely — Theodosius and the Goths, Universidade de Szeged](https://acta.bibl.u-szeged.hu/49924/1/chronica_017_079-090.pdf). A consulta automatizada ao PDF de Szeged não respondeu nesta revisão; não foram extraídas novas citações dele.
- Duas cortes após Teodósio: [Christopher S. Lightfoot — The Roman Empire, Metropolitan Museum of Art](https://www.metmuseum.org/essays/the-roman-empire-27-b-c-393-a-d).
- Continuidade romana oriental: [Sarah T. Brooks — Byzantium, Metropolitan Museum of Art](https://www.metmuseum.org/essays/byzantium-ca-330-1453).
- Cercos, Ravena e saque de 410: [Donald L. Wasson — Sack of Rome 410 CE, World History Encyclopedia](https://www.worldhistory.org/article/1449/sack-of-rome-410-ce/).
- Odoacro e deposição de 476: [Joshua J. Mark — Odoacer, World History Encyclopedia](https://www.worldhistory.org/Odoacer/).

Direção da interface: paleta do jogo, páginas de manuscrito e comparação com registros; as orientações de frontend-design e UI/UX Pro Max guiaram a legibilidade, foco, controles de toque, rolagem e redução de movimento.

