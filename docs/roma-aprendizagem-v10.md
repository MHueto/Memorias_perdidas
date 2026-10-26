# Investigação guiada e aprendizagem — versão 10

Objetivo: facilitar a descoberta das interferências e ajudar o jogador a explicar a queda do Império Romano do Ocidente, sem transformar os registros originais em documentos alteráveis.

## Como jogar a investigação

1. Abra **Investigação → Ajuda da missão**. A ajuda identifica o lugar, a pessoa ou o objeto a procurar. **Marcar o caminho** usa a orientação existente, sem teletransportar Renato.
2. Converse com a pessoa indicada. Os moradores continuam falando sobre seu cotidiano; não conhecem o Cofre. O primeiro encontro mantém o comentário sobre as roupas modernas.
3. Observe a pista e escolha **Ler: nome do capítulo**. O livro abre no trecho pertinente, com resumo curto, evidência, glossário e acesso à explicação completa e às fontes.
4. Anote a evidência e compare com a pista. As respostas só ficam disponíveis depois da anotação. A evidência permanece visível na comparação.
5. Uma escolha incorreta recebe uma explicação específica e permite tentar novamente, sem perder a investigação. A resposta correta explica o aprendizado histórico e, separadamente, a ação ficcional de Renato.
6. O botão para aplicar a correção fica no rodapé visível. Fechar antes de aplicar não conclui a pista; conversar novamente retoma a comparação.

## O que a fase ensina

| Descoberta | Conceito trabalhado |
| --- | --- |
| Autoridade em 475 | O título de Rômulo, o comando de Orestes e a posição de Nepos não são a mesma coisa. |
| Contas e remessas | Perdas de territórios e receitas dificultavam sustentar a defesa. Não houve o desaparecimento instantâneo de toda a economia. |
| Petição dos soldados | Reivindicações por terras, recusa de Orestes e mudança de lealdade das tropas ajudam a entender o avanço de Odoacro. |
| Endereço da corte | A cidade de Roma não é todo o Império; a corte de Rômulo ficava em Ravena. |
| Desfecho de 476 | A deposição é um marco político convencional do Ocidente; o Oriente e muitos aspectos da vida romana continuaram. |

As descobertas concluídas ficam em **Livros → Minhas descobertas**. O encerramento oferece **Rever o que aprendi**, com uma síntese das relações e três perguntas de revisão, sem limite de tentativas. A revisão não bloqueia a exploração após a conclusão.

O desafio dos leões, os documentos adulterados e as rachaduras são ficção do jogo. A fase não apresenta 476 como uma destruição total de Roma. Os resumos e as explicações remetem aos capítulos originais e suas fontes: [Mathisen/Nathan — Rômulo](https://roman-emperors.sites.luc.edu/auggiero.htm), [Heather — recursos e crise ocidental](https://historyandpolicy.org/policy-papers/papers/empire-and-development-the-fall-of-the-roman-west/), [Mark — Odoacro](https://www.worldhistory.org/Odoacer/) e [Brooks — continuidade oriental](https://www.metmuseum.org/essays/byzantium-ca-330-1453).

## Arquivos

- `js/roma-learning.js`: resumos, glossário, dicas, explicações e revisão. Dados congelados, separados dos registros originais.
- `js/roma-history.js`: ajuda, leitura, comparação e revisão; pausa da partida e controle do foco.
- `css/roma-learning.css`: apresentação dos novos recursos, respeitando o caderno existente e o celular.
- `js/roma.js` e `roma.html`: ligação com a etapa atual, marcação de caminho e revisão no encerramento.
- `js/roma-history-data.js`: registros originais e fontes, preservados nesta atualização.

## Verificação

Teste de conteúdo e estrutura, sem pacotes extras:

```bash
node --test scripts/check-learning.test.cjs
node scripts/check-project.cjs
```

O teste acima verifica cobertura das pistas, capítulos, explicações, ajuda por etapa e imutabilidade dos dados. Não substitui o navegador: teste também uma partida completa, respostas incorretas e novas tentativas, pausa durante a leitura, fechamento e retomada, progresso após recarregar, teclado e telas pequenas.

A interface foi desenhada para ensinar com comparação, explicação e revisão. Isso não equivale a medir a aprendizagem de pessoas reais: essa avaliação exige testes com jogadores.
