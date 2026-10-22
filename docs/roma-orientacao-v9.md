# Mapa e interface — versão 9

O mapa deixou de mover Renato. Selecionar um lugar mostra as conexões e o caminho; marcar uma rota muda somente a orientação na tela. A mudança de área acontece ao caminhar até uma passagem, interagir com uma porta ou viajar com o mensageiro.

## Orientação

- Local atual destacado por cor e pelo texto “Você está aqui”.
- Lugares visitados e objetivo identificados por texto, não apenas por cor.
- Ruas, portas e viagem entre cidades representadas no esquema.
- Instruções com esquerda/direita calculadas em relação à posição de Renato.
- Esquema horizontal do trecho atual com posição de Renato, saídas numeradas e próxima passagem.
- Marcação de caminho persistente; uma nova etapa da investigação remove a marcação anterior.
- Ravena continua indisponível até a investigação abrir a rota. O mapa não faz a viagem.
- Mapa explicitamente sem escala geográfica: representa as conexões da fase, não a planta arqueológica de Roma.

## Interface e aprendizagem

O objetivo pode ser recolhido para liberar o cenário. Mapa e Livros continuam acessíveis. Inventário, progresso e reinício ficaram dentro do caderno. O mapa pausa o tempo da memória e captura o foco do teclado; ao fechá-lo, os controles voltam a funcionar.

Cada lugar apresenta uma pergunta de observação e uma sugestão de investigação. O botão “Consultar meus livros” abre os registros sem liberar respostas ou resolver etapas. As cinco comparações históricas continuam exigindo a leitura e a anotação da evidência correta. Os moradores continuam sem conhecimento da memória alterada.

## Arquivos

- `js/roma-map.js`: desenho do mapa e orientação, sem função capaz de transportar o personagem.
- `css/roma-interface.css`: caderno, mapa responsivo e interface simplificada.
- `js/roma.js`: integração com o estado real, passagens e controles.
- `roma.html`: estrutura dos painéis.

O conteúdo histórico de `js/roma-history-data.js`, com suas fontes, foi preservado.

## Testes

`work/roma-v9-test.cjs` verifica seleção e marcação sem teletransporte, posição atual, direções após caminhar, entradas e retornos, pausa da erosão, foco, consulta dos livros, bloqueio da rota de Ravena e telas de celular. O percurso completo começa no mercado com apenas essa área descoberta e termina após os cinco desafios históricos, usando caminhada, portas e a viagem contextual com o mensageiro. Os contextos de teste não usam o save real do jogador.
