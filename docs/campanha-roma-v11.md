# Campanha de Roma — v11

[Índice dos guias](README.md) · [Escopo](ESCOPO.md) · [Abrir a campanha](https://mhueto.github.io/Memorias_perdidas/campanha-roma.html)

Esta revisão reúne quatro memórias jogáveis em sequência. A escola e o Cofre continuam sendo a introdução; quem quiser testar diretamente pode escolher **Jogar → Memórias de Roma** no menu.

## Etapas e desafios

| Memória | Recorte da narrativa | Investigação | Desafio prático |
| --- | --- | --- | --- |
| I — Antes dos mármores | Origens, século VIII a.C. | Moradias, lenda e vestígios de ocupação | Recolher madeira, argila e palha, uma por vez, e entregar à construtora |
| II — Um mar de caminhos | Expansão republicana, 146 a.C. | Forma de governo, Mediterrâneo e custos das conquistas | Reconectar armazém, cais e transporte marítimo |
| III — A paz e suas margens | Pax Romana, 117 d.C. | Estabilidade relativa, redes urbanas e direitos desiguais | Organizar um modelo de canal com desnível para a água |
| IV — Queda do governo ocidental | 475–476 d.C. | Poder, recursos, exército, Ravena e continuidade histórica | Explorar Roma, recuperar o fragmento e concluir a investigação já existente |

Os recortes são separados por séculos. A expansão continuou durante o período chamado Pax Romana: a divisão em fases é didática, não significa que um processo tenha acabado quando o outro começou.

## Como a investigação funciona

Nas três primeiras memórias:

1. Caminhe até a pista indicada no roteiro e examine-a.
2. Converse com o morador relacionado. No primeiro encontro, ele estranha as roupas de Renato.
3. Consulte o capítulo pertinente nos livros e anote a evidência.
4. Compare as alternativas. Uma resposta incorreta explica o problema sem avançar a missão.
5. Escolha a resposta fundamentada e confirme a restauração.
6. Depois das três investigações, resolva o desafio prático da época.

Os registros originais são somente leitura. Ler um capítulo diferente não libera a comparação da pista atual. Fechar a janela depois de escolher uma resposta, mas antes de confirmar a restauração, não conclui a missão.

A quarta memória mantém seus próprios ambientes, livros, desafios e revisão final. Sua conclusão registra também o fim da campanha; a linha do tempo apresenta a síntese quando as quatro etapas estiverem concluídas.

## Controles e acessibilidade

- Andar: **A/D** ou **←/→**.
- Interagir: **E**, **W**, **↑** ou o botão de interação.
- Livros: **B** ou o botão **Livros**.
- Orientação: **M** abre o roteiro nas novas jornadas; na queda, abre o mapa.
- Fechar leitura ou conversa: botão de fechar ou **Esc**.
- No celular: controles na tela; as janelas de leitura têm corpo rolável e ações separadas do texto.

A leitura pausa o movimento. Os diálogos mantêm o foco do teclado dentro da janela aberta, e a preferência do sistema por movimento reduzido é respeitada. A indicação de destino orienta a caminhada; não teletransporta.

## Progresso e compatibilidade

O progresso fica no armazenamento local do navegador, sem conta ou sincronização. Cada origem tem seus próprios dados: o site público e o servidor local não compartilham partidas.

| Chave | Finalidade |
| --- | --- |
| `memoriasPerdidasRomaCampaignV1` | Etapas liberadas, pistas, anotações, materiais e posições das três novas memórias |
| `memoriasPerdidasRomaV1` | Progresso da fase da queda, preservado |
| `gameSaves` | Espaços de entrada do menu da introdução; não são três campanhas romanas independentes |

Uma partida antiga que realmente concluiu a queda é reconhecida. Isso não marca a fundação, a expansão ou a Pax Romana como concluídas. **Continuar** leva à linha do tempo quando existe progresso na campanha. Ao voltar a uma época, ela retoma seu estado salvo.

Se o navegador bloquear o armazenamento, o jogo mostra um aviso: a etapa pode ser explorada, mas o avanço não será mantido ao trocar ou fechar a página. Não apague os dados do site para resolver um problema de cache.

## Arquivos principais

| Arquivo | Responsabilidade |
| --- | --- |
| [campanha-roma.html](../campanha-roma.html) | Linha do tempo e encerramento |
| [roma-jornadas.html](../roma-jornadas.html) | Página comum das três novas épocas |
| [roma-campaign-data.js](../js/roma-campaign-data.js) | Textos, fontes, pistas, coordenadas e chão de cada época |
| [roma-journey.js](../js/roma-journey.js) | Movimento, conversas, investigação e desafios |
| [roma-campaign.js](../js/roma-campaign.js) | Salvamento, sequência e compatibilidade com a queda |
| [roma-campaign-ui.js](../js/roma-campaign-ui.js) | Apresentação da linha do tempo |
| [roma-campaign.css](../css/roma-campaign.css) | Interface e estilos das novas jornadas |
| [roma.js](../js/roma.js) | Fase da queda e registro de conclusão da quarta memória |

O chão tem uma configuração própria por época: `floor: 642` na fundação e `floor: 606` na expansão e na Pax Romana, em um mundo lógico de 2460 × 820. As coordenadas pertencem ao mundo do jogo, não aos pixels da tela. A câmera aplica a mesma transformação ao cenário e aos personagens.

## Fontes usadas nos novos livros

As referências também podem ser abertas nos livros do jogo. Os textos são sínteses didáticas, não transcrições.

- **Origens e arqueologia:** [Diana Kleiner, Open Yale Courses, aula 2](https://oyc.yale.edu/history-art/hsar-252/lecture-2), [Parco archeologico del Colosseo, Palatium](https://colosseo.it/sito/wp-content/uploads/2021/02/Abitare-sul-PALATINO.pdf) e [Sapienza, escavações do Palatino](https://dipantichita.web.uniroma1.it/index.php/it/node/280).
- **República e conquistas:** [The Met, The Roman Republic](https://www.metmuseum.org/essays/the-roman-republic) e [The Met, Western North Africa, 1000 B.C.–1 A.D.](https://www.metmuseum.org/toah/ht/04/afw.html).
- **Império e Pax Romana:** [Christopher Lightfoot, The Met, The Roman Empire](https://www.metmuseum.org/essays/the-roman-empire-27-b-c-393-a-d), [Hannah Cornwell, Pax and the Politics of Peace — resumo editorial consultado, não o livro integral](https://academic.oup.com/book/10568), [PBS, On the Frontiers](https://www.pbs.org/empires/romans/empire/frontiers.html) e [PBS, linha do tempo](https://www.pbs.org/empires/romans/special/timeline_30.html).
- **Queda:** referências preservadas nos livros da quarta memória e no [guia da investigação](roma-investigacao-v8.md).

753 a.C. aparece como data tradicional, não como comprovação literal da lenda. 146 a.C. pertence à República. A Pax Romana não implica ausência de guerras nem igualdade de direitos. O encerramento em 476 refere-se ao governo imperial do Ocidente, sem afirmar que toda a cidade tenha sido destruída ou que o Império do Oriente tenha terminado.

Renato, o Cofre, os moradores ficcionais, as interferências e os desafios são recursos narrativos. A rota de abastecimento e o canal são modelos didáticos, não reconstituições técnicas de um episódio documentado. Os [cenários gerados](artes-campanha-roma-v11.md) são ilustrações estilizadas, não evidência arqueológica.

## Verificação e limites

Na raiz do repositório, com Node.js 24:

```bash
node --test scripts/check-project.test.cjs scripts/check-learning.test.cjs scripts/check-campaign.test.cjs
node scripts/check-project.cjs
```

A verificação automática do GitHub executa os mesmos testes. O roteiro manual está no [guia de desenvolvimento](DESENVOLVIMENTO.md).

Os testes de navegador usados nesta revisão exercitaram o percurso das três novas épocas, respostas incorretas e corretas, desafios, salvamento, recuperação de falha de imagem, teclado, telas móveis emuladas e ligação com o encerramento da queda. Esses testes não representam certificação de todos os aparelhos nem avaliação da aprendizagem de jogadores reais. A campanha continua sendo um protótipo.
