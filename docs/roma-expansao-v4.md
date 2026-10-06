# Roma — expansão explorável v4

## O que foi implementado

Roma passou de quatro para oito áreas: mercado, Foro, exterior do Coliseu, arena, rua dos artesãos, oficina, bairro residencial e pátio da fonte. Os quatro cenários novos têm arte própria.

- No mercado, a entrada sob o grande portão leva à rua dos artesãos.
- A porta com a bigorna leva à oficina. A bancada de fabricação fica dentro dela.
- O Foro tem acesso ao bairro residencial; o arco do bairro leva ao pátio.
- A rua dos artesãos e o bairro também se conectam pelas extremidades, formando um caminho alternativo.
- Entrar usa ↑, E ou o botão de interação. As portas e as saídas retornam a posições explícitas, sem adivinhação de destino.
- O mapa mostra lugares descobertos e o caminho do objetivo, sem liberar teleporte para locais ainda desconhecidos.
- Há três descobertas opcionais por conversa/observação, preservadas no save.
- O fim da memória tem “Continuar explorando Roma”, sem apagar a conclusão ou os itens.

## Personagens e luta

Oito modelos de NPCs com quatro quadros cada: cidadã teal, vendedor ocre, legionário, senador, ferreiro, cidadã terracota, mensageiro e idosa violeta. As artes seguem as proporções simplificadas do Renato: cabeça grande, contornos grossos, poucos tons, um olho lateral retangular. Direção e troca de quadros são independentes.

Os leões ganharam deslocamento mais rápido, botes mais curtos, contra-ataques, recuo, poeira/palha e marcas rápidas de impacto. O tremor de câmera e a pausa de impacto são pequenos e desativados quando o navegador pede movimento reduzido. Renato permanece no corredor seguro. O tempo útil da distração e a possibilidade de tentar outra vez foram mantidos.

## Arquivos finais

Pasta: C:/Users/Matheus/Documents/memorias perdidas

- js/roma.js — áreas, portas, moradores, objetivos, exploração e combate.
- css/roma.css — apresentação, sprites e efeitos.
- roma.html — mapa e controles.
- assets/images/roma/rua-dos-artesaos-v4.png — 1536 × 768.
- assets/images/roma/oficina-artesao-v5.png — 1536 × 768; versão final com escala dos móveis corrigida.
- assets/images/roma/bairro-residencial-v4.png — 1536 × 768.
- assets/images/roma/patio-romano-v4.png — 1536 × 768.
- assets/images/roma/npcs-simple-a-v4.png — 384 × 512, quatro linhas/células de 96 × 128.
- assets/images/roma/npcs-simple-b-v4.png — 384 × 512, quatro linhas/células de 96 × 128.

As imagens foram produzidas com a geração integrada de imagens. A preparação local só recortou/alinhou sprites e normalizou dimensões. Os originais e as artes anteriores foram preservados. Na versão A, a divisão automática por células cortava pequenas pontas dos pés: o empacotamento final usa o contorno de cada silhueta para não misturar quadros vizinhos.

## Prompts e especificações de geração

### Oficina final — prompt integral

Use case: stylized-concept. Final playable 2D side-scrolling game background, EXACT aspect 2:1. Roman artisan workshop interior that is WIDE and seen from FAR AWAY, NOT a closeup of furniture. Composition is a cutaway of an ENTIRE large warehouse, including a high roof and an upper storage gallery/balcony, with small ground-floor tools. Canvas 1536x768. A continuous clear stone walkway at y=600-650. This numerical layout is essential for an existing 90px-tall character: entrance doorway at x140 must be ONLY 150px tall and end at y600; a wooden crafting workbench at x980 must be ONLY 55px tall and 170px wide, with tabletop y545 and bottom y600; a SMALL forge at x520 with base y600 and fire opening only 80px tall, chimney continuing up to roof; SMALL anvil at x730 height50px. Do NOT make the table taller than a 90px game character! Most of the upper canvas is high brick wall, wooden gallery at y300, rafters and hanging supplies, which establishes the room's scale. The lower objects appear small within the huge room. Warm terracotta and amber light, teal gray shadows. ORIGINAL simple chunky pixel art, thick outlines, large flat color clusters, two shades per material, intended low resolution game aesthetic, not realistic rendering. One side-on plane, no isometric perspective. Entrance far left, crafting station around x980, a few small crates and shelves near right. Keep walking lane unobstructed. No people, no ghost silhouettes, no animals, no labels or text, no UI, no watermark. Show the whole warehouse from a distant camera; preserve all the exact object scale instructions above.

### Pátio — prompt integral

Use case: stylized-concept. Asset type: original 2D side-scrolling adventure game background. 1536x768 wide Roman residential courtyard at amber sunset. LATERAL straight-on platform-adventure camera, horizontal unobstructed walkable stone ground in bottom 20 percent, ground contact baseline y630. Simplified low-resolution pixel art like a small 32x48 cartoon player sprite with thick dark outlines; drawn on a 384x192 logical grid with hard square pixels, clean chunky shapes, restrained 24-color palette, two or three shades per surface. Not photorealistic, not painterly, not isometric, no blur. Courtyard framed by plaster and terracotta Roman housing, modest low stone fountain with water in center BACKGROUND behind the playable lane, a couple of olive trees in simple planters, amphorae and folded linen near the right wall. An open arch doorway on far left clearly connects back to a street, a sheltered bench and a small household altar in the right background. Architecture scaled for a 90px-tall character in a 1536x768 playable scene: doors small relative to canvas, simple low props. No characters or animals, no text/letters/signboards, no HUD, no modern objects, no watermark. Quiet explorable place; keep foreground walkway entirely free from plants, pool or obstacles. Original game art filling canvas.

### Ruas — especificação repassada para geração

Duas imagens laterais 1536 × 768, pixel art de blocos claros e paleta terracota/ocre/teal ao entardecer. Caminho horizontal livre, sem personagens, animais, texto ou interface. Rua dos artesãos com pequenas lojas, forja e símbolo de bigorna, porta de oficina em aproximadamente 60% da largura e passagem ao fundo. Bairro residencial com casas de tijolo/reboco, varandas, roupas penduradas, fonte pequena e arco em aproximadamente 72% da largura levando ao pátio. Estes são resumos da especificação, não transcrições dos prompts internos da geração delegada.

### NPCs — especificação repassada para geração

Duas folhas com alpha verdadeiro, quatro colunas por quatro linhas. Referência visual: o sprite atual de Renato. Cabeça grande, contorno preto grosso, olho lateral simples, poucos tons e grandes agrupamentos de pixels. Quatro poses de caminhada à direita por personagem, com braços/pernas alternados e pés alinhados. Folha A: cidadã teal, vendedor ocre, legionário e senador idoso branco/vermelho. Folha B: ferreiro de avental/barba, cidadã negra de roupa terracota, mensageiro oliva e mulher idosa violeta. Sem cenário ou rótulos. Células finais de 96 × 128 e pés na linha 124. Resumo da especificação enviada à geração delegada.

## Verificação

Chrome em sessões isoladas, sem alterar o save do usuário. Foram verificados os quatro ramais, voltas, circuito de ruas, crafting com save antigo, exploração sem materiais, NPCs variados e viradas, leões e recuperação do fragmento, celular horizontal/vertical e a missão completa até o encerramento. Também foi testado continuar explorando com um save já concluído.

Relatórios e capturas: work/roma-expansion-artifacts no projeto de trabalho. Testes anteriores ficam em work/roma-regression-artifacts.

As orientações de interface foram usadas para manter entradas sinalizadas, destinos de retorno previsíveis, mapa com rolagem em telas pequenas e botões de interação acessíveis por toque e teclado.

