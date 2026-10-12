# Roma — cenários simplificados v6

Referência escolhida pelo usuário: **bairro com casas e arco**, arquivo `bairro-residencial-v4.png`, preservado sem alterações.

## Resultado

Sete cenários substituídos no jogo local: entrada, Foro, exterior do Coliseu, arena, rua dos artesãos, oficina e pátio. Paleta quente, formas maiores, contornos escuros e menos textura, próximos ao bairro de referência. O interior do Senado também está salvo como arte preparada, mas **não faz parte das áreas jogáveis nesta versão publicada**.

Os originais permanecem na pasta de imagens. Nenhuma imagem original foi apagada. Foram preservadas as alterações existentes do usuário no CSS. As mudanças de código desta atualização ficam limitadas aos caminhos das artes, alinhamento de camadas e pisos e ao desenho/posição da folha na areia da arena.

A expansão narrativa v5 (interior do Senado, estrada imperial, livro e perguntas históricas) continua em rascunhos separados no workspace. Não foi publicada por esta atualização visual. Os arquivos `work/roma.js` e `work/roma.html` não são a versão ativa.

## Arquivos ativos

- Jogo: `C:/Users/Matheus/Documents/memorias perdidas/roma.html`
- Estilos: `C:/Users/Matheus/Documents/memorias perdidas/css/roma.css`
- Lógica: `C:/Users/Matheus/Documents/memorias perdidas/js/roma.js`
- Artes: `C:/Users/Matheus/Documents/memorias perdidas/assets/images/roma/`
- Cópia de segurança anterior à troca visual: `C:/Users/Matheus/Documents/Codex/2026-09-24/https-github-com-mhueto-memorias-perdidas/work/art-v6-backup/`
- Espelhos da versão ativa no workspace: `work/roma-live-art-v6.html`, `work/roma-live-art-v6.css`, `work/roma-live-art-v6.js`.

[Visualizar o jogo](http://localhost:8080/roma.html?art=v6)

## Verificação

- 11 verificações de regressão aprovadas: movimento, animações, retorno entre cenários, estados salvos da arena, luta dos leões, mira/laço e controles/diálogos em celular.
- 10 verificações de exploração aprovadas: rotas, oficina, pátio, migração de saves, NPCs, combate, celular e percurso completo da missão da versão atual.
- 8 verificações visuais e de carregamento aprovadas: todas as áreas ativas, imagens decodificadas, sem erros de página ou recursos faltando, camadas alinhadas. Capturas revisadas com personagens em cena.
- Testes usam contextos isolados e não alteram o progresso do jogador.
- Relatórios no workspace: `work/roma-regression-artifacts/report.json`, `work/roma-expansion-artifacts/report.json`, `work/roma-art-v6-artifacts/report.json`.

## Produção das imagens

Modo: **builtin image_gen**, edição/restilização com referências visuais. O bairro foi usado como referência de estilo e cada cenário original como referência de composição. Sem uso de API externa ou cobrança via chave de API. Apenas normalização técnica das dimensões finais com nearest-neighbor após a geração, mantendo o tamanho de cada mapa.

Os prompts abaixo são os prompts efetivos enviados para as versões selecionadas. A numeração de imagens em cada prompt refere-se ao conjunto de referências visuais fornecido naquela geração.

### Entrada de Roma

Arquivo final: `C:/Users/Matheus/Documents/memorias perdidas/assets/images/roma/entrada-roma-simples-v6.png`  
Dimensões: 2172 × 724 px.  
Original gerado: `C:/Users/Matheus/.codex/generated_images/01a0d183-1f4c-7272-8e1e-976e48351287/exec-110fb7b8-5104-468e-be4b-7a748306a7f1.png`

Prompt:

```text
Use case: style-transfer. Asset type: production 2D side-scroller background for Memórias Perdidas. INPUT ROLES: Image 1 (the simple neighborhood houses with a large arch) is the EXACT STYLE REFERENCE. Image 2 (the wide entry gate and market) is the ONLY EDIT TARGET for this output. The remaining images are unrelated game backgrounds, do not combine them.
Redraw the entire edit target to look like it belongs in the SAME game and was drawn by the SAME pixel artist as Image 1. Major simplification: clean large rectangular pixel clusters, dark 2-3 pixel contours, flat warm ochre/plaster/terracotta planes, only 2-3 stepped shadow values per material, small muted palette. Flat geometric sky, blocky stylized plants, large readable stone slabs. Eliminate photorealistic texture, hundreds of tiny masonry marks, intricate ornament, smooth gradients, complex lighting and painterly shading. It should be as SIMPLE as the neighborhood reference, not a detailed painting with a pixel filter.
CRITICAL GEOMETRY INVARIANTS: preserve the target scene's camera framing, aspect ratio 2172x724, 3:1, exact horizontal positions and heights of all doors/gates, major building silhouettes and columns, same sand/road/floor elevations and clear continuous walkable foreground. Keep the gate, cart and market props recognizable in their original positions where present. Keep the scale of buildings. No new obstacles or characters. For the arena retain the foreground low parapet, empty sand, arena architecture and tiny blocky crowd only; no lion, no collectible, no blue crystal. No text/HUD, no border, no watermark. OUTPUT ONLY the redrawn edit target, not a comparison sheet.
```

### Foro e exterior do Senado

Arquivo final: `C:/Users/Matheus/Documents/memorias perdidas/assets/images/roma/foro-senado-simples-v6.png`  
Dimensões: 2079 × 756 px.  
Original gerado: `C:/Users/Matheus/.codex/generated_images/01a0d183-1f4c-7272-8e1e-976e48351287/exec-d636de5f-f7e3-4306-9515-44e016ef9f07.png`

Prompt:

```text
Use case: style-transfer. Asset type: production 2D side-scroller background for Memórias Perdidas. INPUT ROLES: Image 1 (the simple neighborhood houses with a large arch) is the EXACT STYLE REFERENCE. Image 3 (Roman forum and senate exterior) is the ONLY EDIT TARGET for this output. The remaining images are unrelated game backgrounds, do not combine them.
Redraw the entire edit target to look like it belongs in the SAME game and was drawn by the SAME pixel artist as Image 1. Major simplification: clean large rectangular pixel clusters, dark 2-3 pixel contours, flat warm ochre/plaster/terracotta planes, only 2-3 stepped shadow values per material, small muted palette. Flat geometric sky, blocky stylized plants, large readable stone slabs. Eliminate photorealistic texture, hundreds of tiny masonry marks, intricate ornament, smooth gradients, complex lighting and painterly shading. It should be as SIMPLE as the neighborhood reference, not a detailed painting with a pixel filter.
CRITICAL GEOMETRY INVARIANTS: preserve the target scene's camera framing, aspect ratio 2079x756, 2.75:1, exact horizontal positions and heights of all doors/gates, major building silhouettes and columns, same sand/road/floor elevations and clear continuous walkable foreground. Keep the gate, cart and market props recognizable in their original positions where present. Keep the scale of buildings. No new obstacles or characters. For the arena retain the foreground low parapet, empty sand, arena architecture and tiny blocky crowd only; no lion, no collectible, no blue crystal. No text/HUD, no border, no watermark. OUTPUT ONLY the redrawn edit target, not a comparison sheet.
```

### Exterior do Coliseu

Arquivo final: `C:/Users/Matheus/Documents/memorias perdidas/assets/images/roma/coliseu-exterior-simples-v6.png`  
Dimensões: 2079 × 756 px.  
Original gerado: `C:/Users/Matheus/.codex/generated_images/01a0d183-1f4c-7272-8e1e-976e48351287/exec-f1860b37-ad96-43e3-ba79-2f6eadfe89f5.png`

Prompt:

```text
Use case: style-transfer. Image 1 (simple neighborhood houses, giant arch) is STYLE REFERENCE ONLY. Image 2 (close exterior facade of COLOSSEUM with huge multiple arched gates, red banners, cart loaded with hay on LEFT) is the ONLY EDIT TARGET. Redraw IMAGE TWO, NOT the houses or the city gateway. Must still show the same massive Colosseum curved facade filling upper frame with repeated two/three-tier arcades and gates, foreground haycart at x22%, arena entrance at x76%, paved horizontal road in lower 20%. Preserve original camera, cropping, locations, proportions and walkable road elevation. Output wide 2079x756 panorama. Apply identical SIMPLE pixel art language of Image1: thick dark pixel edges, broad flat ochre planes, limited palette, two-three shade levels per object, large blocky stone slabs, stylized straw mass and flames. Eliminate fine stone noise, ornate realistic reliefs, complicated highlights, gradients, intricate texture and realistic lighting. Do not replace scene with a city gate or move the haycart/gates. No characters or HUD or lettering. This is a retouch/restyle of Image2's geometry to match Image1's simplicity. No border or watermark.
```

### Arena do Coliseu

Arquivo final: `C:/Users/Matheus/Documents/memorias perdidas/assets/images/roma/arena-coliseu-simples-v6.png`  
Dimensões: 2079 × 756 px.  
Original gerado: `C:/Users/Matheus/.codex/generated_images/01a0d183-1f4c-7272-8e1e-976e48351287/exec-ff7927f8-7a48-4f78-a63c-f1a341222e10.png`

Prompt:

```text
Use case: style-transfer. Asset type: production 2D side-scroller background for Memórias Perdidas. INPUT ROLES: Image 1 (the simple neighborhood houses with a large arch) is the EXACT STYLE REFERENCE. Image 5 (arena interior with sand) is the ONLY EDIT TARGET for this output. The remaining images are unrelated game backgrounds, do not combine them.
Redraw the entire edit target to look like it belongs in the SAME game and was drawn by the SAME pixel artist as Image 1. Major simplification: clean large rectangular pixel clusters, dark 2-3 pixel contours, flat warm ochre/plaster/terracotta planes, only 2-3 stepped shadow values per material, small muted palette. Flat geometric sky, blocky stylized plants, large readable stone slabs. Eliminate photorealistic texture, hundreds of tiny masonry marks, intricate ornament, smooth gradients, complex lighting and painterly shading. It should be as SIMPLE as the neighborhood reference, not a detailed painting with a pixel filter.
CRITICAL GEOMETRY INVARIANTS: preserve the target scene's camera framing, aspect ratio 2079x756, 2.75:1, exact horizontal positions and heights of all doors/gates, major building silhouettes and columns, same sand/road/floor elevations and clear continuous walkable foreground. Keep the gate, cart and market props recognizable in their original positions where present. Keep the scale of buildings. No new obstacles or characters. For the arena retain the foreground low parapet, empty sand, arena architecture and tiny blocky crowd only; no lion, no collectible, no blue crystal. No text/HUD, no border, no watermark. OUTPUT ONLY the redrawn edit target, not a comparison sheet.
```

### Rua dos artesãos

Arquivo final: `C:/Users/Matheus/Documents/memorias perdidas/assets/images/roma/rua-dos-artesaos-simples-v6.png`  
Dimensões: 1536 × 768 px.  
Original gerado: `C:/Users/Matheus/.codex/generated_images/01a0d183-1f4c-7272-8e1e-976e48351287/exec-39890b0d-72cf-41b6-a34b-8b9f6d980aa4.png`

Prompt:

```text
Use case: style-transfer. The FIRST image is ONLY the pixel-art style reference (houses and arch). The SECOND image, an OUTDOOR STREET with a shop facade and anvil sign, is the EDIT TARGET. Redraw only the SECOND image's OUTDOOR ARTISAN STREET. Keep outdoor sky, tile roofs, three shop facades, alley on left, anvil sign over open workshop at 63% width, shelves/pots, exact positions, same pavement height and side-on camera. DO NOT draw an indoor workshop or a cutaway interior. Output 1536x768 panorama. Match the FIRST image's very simple game pixel art: flat ochre and terracotta wall planes, dark blocky outlines, restrained palette with 2 or 3 tones per material, large tile clusters, geometric sky clouds, no fine noisy stone texture. Dramatically reduce the realistic material shading of the second image without altering geometry. No characters/text/border/watermark. Keep wide unobstructed sidewalk at the original elevation.
```

### Oficina do artesão

Arquivo final: `C:/Users/Matheus/Documents/memorias perdidas/assets/images/roma/oficina-artesao-simples-v6.png`  
Dimensões: 1536 × 768 px.  
Original gerado: `C:/Users/Matheus/.codex/generated_images/01a0d183-1f4c-7272-8e1e-976e48351287/exec-a05502d5-f488-4d38-a644-4871ebb2cc48.png`

Prompt:

```text
Use case: style-transfer. IMAGE ROLES: Image 1 (neighborhood of houses with a big arch) is the exact style reference. Image 2 (the workshop interior) is the ONLY EDIT TARGET. Other images are not to be combined. Output a single edited full the workshop interior background, 1536x768 2:1 panorama.
Redraw target with the VERY SAME simple chunky pixel art as the neighborhood. Make major simplification: broad flat colored shapes, dark blocky contours, 2-3 colors per material, clean readable pixel clusters, plain plaster, restrained brick patterns. Simplify ornate capitals, tile highlights, trees and tiny textures. Geometric sunset clouds if sky visible. Remove painterly/photorealistic lighting and smooth gradient noise. This must look like an actual low-resolution sprite game, not high-detail concept art.
LOCK COMPOSITION: keep exact doorway locations, building outlines, furniture locations/scales, floor elevation and wide clear horizontal walkable strip; preserve the target camera, framing and 2:1 ratio. Do not move the workshop table or forge, senate entrance/steps, courtyard fountain or the artisan shop door. The furnishings should stay behind the open walking lane. No people, game UI, lettering, extra objects, border, blur or watermark. The neighborhood is the style anchor, not the new scene subject.
```

### Pátio da fonte

Arquivo final: `C:/Users/Matheus/Documents/memorias perdidas/assets/images/roma/patio-romano-simples-v6.png`  
Dimensões: 1536 × 768 px.  
Original gerado: `C:/Users/Matheus/.codex/generated_images/01a0d183-1f4c-7272-8e1e-976e48351287/exec-32847bab-1c34-49ba-ae38-1708d2e038ab.png`

Prompt:

```text
Use case: style-transfer. IMAGE ROLES: Image 1 (neighborhood of houses with a big arch) is the exact style reference. Image 3 (the fountain courtyard) is the ONLY EDIT TARGET. Other images are not to be combined. Output a single edited full the fountain courtyard background, 1536x768 2:1 panorama.
Redraw target with the VERY SAME simple chunky pixel art as the neighborhood. Make major simplification: broad flat colored shapes, dark blocky contours, 2-3 colors per material, clean readable pixel clusters, plain plaster, restrained brick patterns. Simplify ornate capitals, tile highlights, trees and tiny textures. Geometric sunset clouds if sky visible. Remove painterly/photorealistic lighting and smooth gradient noise. This must look like an actual low-resolution sprite game, not high-detail concept art.
LOCK COMPOSITION: keep exact doorway locations, building outlines, furniture locations/scales, floor elevation and wide clear horizontal walkable strip; preserve the target camera, framing and 2:1 ratio. Do not move the workshop table or forge, senate entrance/steps, courtyard fountain or the artisan shop door. The furnishings should stay behind the open walking lane. No people, game UI, lettering, extra objects, border, blur or watermark. The neighborhood is the style anchor, not the new scene subject.
```

### Interior do Senado (arte preparada)

Arquivo final: `C:/Users/Matheus/Documents/memorias perdidas/assets/images/roma/senado-interior-simples-v6.png`  
Dimensões: 1536 × 768 px.  
Original gerado: `C:/Users/Matheus/.codex/generated_images/01a0d183-1f4c-7272-8e1e-976e48351287/exec-110913db-b88f-4c21-8f0b-9bd38a8c38c4.png`

Prompt:

```text
Use case: style-transfer. Image 1 (neighborhood houses and arch) is STYLE ONLY. Image 2 (Roman SENATE HALL with columns, tiered red benches, speaker's podium) is ONLY EDIT TARGET. Redraw image2 to the exact simple pixel art of Image1. It must remain a SENATE hall, not a workshop. Preserve wooden coffered ceiling, large columns, tiered red benches in background, central-right speaker's marble podium, doorway at far left ~12% width, wide completely clear front walking aisle at original elevation. Simplify stone capitals and fine ornament into large blocky geometric clusters. Flat warm ochre/beige walls, red cloth, 2-3 tones per surface, thick dark stepped pixel contours. Remove marble reflections, tiny random texture, elaborate carved details, realistic gradients. Keep exact camera/framing/proportions and feature positions. Single panorama 1536x768, no characters, no writing, no UI, no borders/watermark.
```

