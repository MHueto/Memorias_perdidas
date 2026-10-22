# Roma — investigação histórica, versão 8

## Intenção educativa

O jogador começa em 475 d.C. e investiga interferências fictícias que impedem a memória de chegar ao desfecho de 476. Os registros que Renato trouxe são originais e não editáveis. Os moradores não conhecem o Cofre, a viagem temporal ou a alteração da memória: relatam apenas o que vivem.

A história liga três questões: disputa pelo comando, recursos para sustentar o governo e lealdade militar. Não apresenta um único povo, a origem dos soldados ou um defeito moral como causa suficiente da queda.

## Percurso implementado

1. Recuperar a folha na arena, sem entrar junto dos leões.
2. Ouvir Lúcio e confrontar o salvo-conduto local com o capítulo sobre o poder em 475. Remover o selo falso que bloqueia as ordens.
3. Ouvir a mercadora, relacionar território, receita e defesa e liberar o demonstrativo lacrado. A memória avança explicitamente para 476.
4. Ouvir o mensageiro e compreender a reivindicação dos soldados. Liberar a petição retida.
5. Consultar Lúcio e distinguir Roma de Ravena. Reabrir o destino do despacho e viajar com o mensageiro.
6. Conversar com Rômulo Augústulo, consultar o desfecho original e desfazer a última interferência. A encenação termina com a deposição e explica as continuidades.

Cada comparação exige anotar a evidência do capítulo correspondente. Respostas incorretas permitem nova tentativa; fechar uma pergunta não perde o progresso. As conversas ficam disponíveis no caderno dentro dos livros.

Todos os moradores próximos podem conversar. Cada pessoa pergunta pelas roupas de Renato no primeiro encontro; o jogo salva essa apresentação. O artesão é a mesma pessoa na rua e na oficina.

## O que é ficção e o que é história

As falas, o desafio dos leões, os documentos locais bloqueados, as intervenções de Renato e a condensação espacial são ficcionais. O salão de Ravena reaproveita uma arte estilizada: não representa uma reconstituição arqueológica. As fontes estão nos capítulos. As ruínas progressivas representam erosão da memória e não uma destruição total de Roma em 476; não bloqueiam os caminhos e se estabilizam ao concluir.

## Fontes consultadas

- Ralph W. Mathisen e Geoffrey S. Nathan, *Romulus Augustulus (475–476 A.D.) — Two Views*, De Imperatoribus Romanis, hospedado pela Loyola University Chicago: https://roman-emperors.sites.luc.edu/auggiero.htm
- Peter Heather, *Empire and development: the fall of the Roman west*, History & Policy / Institute of Historical Research: https://historyandpolicy.org/policy-papers/papers/empire-and-development-the-fall-of-the-roman-west/
- Joshua J. Mark, *Odoacer*, World History Encyclopedia: https://www.worldhistory.org/Odoacer/
- Sarah T. Brooks, *Byzantium (ca. 330–1453)*, Metropolitan Museum of Art: https://www.metmuseum.org/essays/byzantium-ca-330-1453

Os textos do jogo são sínteses autorais curtas. A discussão de Heather é uma interpretação historiográfica identificada, não a alegação de consenso sobre uma causa única.

## Arquivos de manutenção

- `js/roma-history-data.js`: capítulos, fontes, perguntas, pistas e consequências.
- `js/roma-history.js`: leitura, comparação e caderno de conversas.
- `js/roma.js`: moradores, primeiras apresentações, etapas, viagem, migração de progresso e conclusão.
- `css/roma-mechanics.css`: integração visual do personagem, sombra de contato e legibilidade.
- `roma.html`: estrutura e texto final.

Não foi necessário substituir `css/roma.css`, `index.html` ou os cenários e sprites existentes.

## Verificação

O teste `work/roma-v8-test.cjs` usa contextos isolados de navegador e um servidor de prévia. Verifica o percurso com os leões e as cinco investigações, livros imutáveis, falas romanas sem conhecimento da alteração, primeiras apresentações persistentes, evidência obrigatória, migração de saves, pausa da erosão durante a leitura, retomada da conclusão e telas de 375×812 e 812×375. O relatório detalhado está em `work/roma-v8-artifacts/report.json`. Saves reais do jogador não são usados nos testes.
