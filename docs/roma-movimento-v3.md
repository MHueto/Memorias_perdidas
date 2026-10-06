# Roma — movimento e encontro da arena (v3)

## O que mudou

- NPCs usam 16 quadros: quatro personagens, quatro poses por personagem. O contêiner se desloca e o sprite vira separadamente: uma animação não anula mais a outra.
- Leões usam oito poses: quatro de locomoção e quatro de preparação/bote/contato/recuperação. Patrulham e trocam ataques sem sangue; após o lançamento dos bonecos, perseguem os alvos, atacam e espalham palha.
- Renato permanece no corredor de observação. A parte inferior da arena recebeu um piso separado; não há grade desenhada por cima do personagem.
- Os bonecos têm trajetória de arremesso. A distração dura aproximadamente 24 segundos, pode ser repetida e não bloqueia a saída. O laço preserva o ângulo durante a animação.
- Câmera com acompanhamento suave e enquadramento do encontro. Pequenas cenas da chegada e do arremesso podem ser puladas.
- Mapa de retorno aos locais já visitados, placas de saída, marcador do objetivo, controle de corrida com Shift e preservação do progresso.
- Diálogos reorganizados para celular em pé/deitado; botões sem seleção de texto ao segurar. A mira fica fora da faixa superior da interface.

## Arquivos do jogo

Pasta principal: `C:/Users/Matheus/Documents/memorias perdidas`.

- `js/roma.js`: comportamento, câmera, interação, estados dos leões e NPCs.
- `css/roma.css`: apresentação, sprites, diálogos, câmera visual e piso da arena.
- `roma.html`: estrutura da página e controles.
- `assets/images/roma/npcs-walk-v3.png`: 384 × 512; células de 96 × 128. Linhas: cidadã, comerciante, legionário, senador. Todos os quadros-base olham para a direita; o jogo espelha para a esquerda.
- `assets/images/roma/leao-walk-attack-v3.png`: 576 × 224; células de 144 × 112. Linha 1: caminhada/corrida; linha 2: preparação, bote, ataque, recuperação.

Os arquivos antigos de arte foram preservados. As novas imagens foram geradas com a ferramenta integrada de imagens, e depois recortadas/alinhadas em células transparentes. Não houve desenho manual de substitutos em SVG.

## Prompt da arte dos leões

Game animation production sprite sheet, 4 columns by 2 rows EXACTLY. Transparent PNG canvas, 1536 by 768, each frame occupies equal 384 by 384 square; all eight frames aligned on the SAME ground baseline in their cells. Eight poses of ONE identical very simple blocky retro pixel art tawny lion with a dark brown round mane, black outline, a chunky short body, 2-3 shades per color, NO realistic anatomy or fur detailing. The lion always faces RIGHT. Top row: four successive walk/run frames of a complete gait, paws alternately forward/back, passing pose, airborne running pose. Bottom row: attack anticipation crouch, forward pounce with front paw swinging, open-mouth bite/swipe contact, recovery to stance. Make poses distinctly different but body colors/shape consistent. Full tail, paws and ears inside each cell with ample transparent gutters; no cropping, no labels, no text, no panel lines, no shadows, no glow, no background whatsoever, transparent alpha. Intended displayed size about 110 pixels wide alongside a 90px human sprite in a 2D side-scrolling adventure. Deliberate low-resolution 48x40 sprite pixel clusters upscaled with hard square edges. Not a painting or realistic lion.

## Especificação resumida da geração dos NPCs

Folha transparente de pixel art lateral, 4 colunas × 4 linhas. Uma personagem com roupa teal, comerciante em ocre, legionário e senador, cada um com quatro poses sucessivas de caminhada para a direita, pés/braços alternados e alinhamento dos pés. Usar Renato e os NPCs anteriores como referência, com cabeça maior, contornos marcados e menos detalhes. Sem texto, quadros cortados ou cenário. Os quadros finais foram normalizados para células de 96 × 128.

## Verificações

Navegador Chrome em contextos isolados, sem alterar o save do usuário: movimento e parada, virada/quadros dos NPCs, ida/volta entre cidade e Foro, reentrada na arena em três checkpoints, perseguição/ataques, laço diagonal e coleta, celular 844 × 390 e 390 × 844. Também foi percorrida a missão inteira, desde a introdução até o encerramento, com recarregamento do save; e foi testada a expiração dos bonecos seguida de nova tentativa por toque.

Relatórios e capturas ficam no projeto de trabalho, em `work/roma-regression-artifacts`. Testes automatizados confirmam os comportamentos listados, não certificam acabamento equivalente a um jogo comercial. A referência a Celeste e Into the Pit orienta legibilidade e animação; não significa que esta versão tenha a mesma quantidade de conteúdo, direção artística ou polimento.
