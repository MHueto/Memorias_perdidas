# Desenvolvimento e manutenção

[Índice dos guias](README.md) · [Apresentação do jogo](../README.md)

## Executar sem instalar dependências do jogo

Na pasta do projeto, use Python 3:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

No Windows também pode funcionar `py -3 -m http.server 8080 --bind 127.0.0.1`. Abra [o jogo local](http://localhost:8080/) e mantenha o terminal aberto. Para parar o servidor, pressione `Ctrl+C`. Se a porta estiver ocupada, use outra porta e ajuste o endereço.

Não é necessário executar `npm install`. HTML, CSS e JavaScript são servidos diretamente. Evite abrir os arquivos com `file://`: teste por um servidor HTTP, como na demonstração publicada.

## Onde alterar cada parte

| Parte | Arquivos principais |
| --- | --- |
| Menu e seleção de jogo | [index.html](../index.html), [js/main.js](../js/main.js), [css/style.css](../css/style.css) |
| Configurações | [js/configuracoes.js](../js/configuracoes.js), [css/configuracoes.css](../css/configuracoes.css) |
| Vídeo do menu | [js/menu-background.js](../js/menu-background.js) e o elemento de vídeo em `index.html` |
| Escola, cofre, diálogos iniciais e viagem | [teste-escola.html](../teste-escola.html), [js/teste-escola.js](../js/teste-escola.js), [css/teste-escola.css](../css/teste-escola.css) |
| Áreas, personagens, movimento e desafios de Roma | [js/roma.js](../js/roma.js), [roma.html](../roma.html), [css/roma.css](../css/roma.css) |
| Conteúdo histórico, perguntas e fontes | [js/roma-history-data.js](../js/roma-history-data.js) |
| Resumos, dicas, glossário e revisão educativa | [js/roma-learning.js](../js/roma-learning.js), [css/roma-learning.css](../css/roma-learning.css) |
| Consulta dos livros e comparação das pistas | [js/roma-history.js](../js/roma-history.js), [css/roma-mechanics.css](../css/roma-mechanics.css) |
| Mapa, rotas e interface compacta | [js/roma-map.js](../js/roma-map.js), [css/roma-interface.css](../css/roma-interface.css) |
| Linha do tempo e progresso das quatro etapas | [campanha-roma.html](../campanha-roma.html), [js/roma-campaign.js](../js/roma-campaign.js), [js/roma-campaign-ui.js](../js/roma-campaign-ui.js) |
| Fundação, expansão e Pax Romana | [roma-jornadas.html](../roma-jornadas.html), [js/roma-journey.js](../js/roma-journey.js), [js/roma-campaign-data.js](../js/roma-campaign-data.js), [css/roma-campaign.css](../css/roma-campaign.css) |
| Imagens, animações e cenários | [assets/images](../assets/images/) |

Os arquivos `enemy.js`, `game.js`, `player.js` e `utils.js` em `js/` estão reservados e vazios nesta versão. A lógica atual não está neles. Foram preservados, assim como as artes de versões anteriores.

## Ajustar a altura em relação ao chão

Isso é uma posição no cenário, não o tamanho do personagem.

- **Cofre:** no início de `js/teste-escola.js`, procure as constantes `COFRE_..._CHAO_Y`. Cada sala tem sua própria constante, comentada com a imagem correspondente.
- **Escola:** no mesmo arquivo, procure `scenes` e altere `floorY` somente da área desejada.
- **Roma:** em `js/roma.js`, procure `const areas` e o `floorY` da área desejada.
- **Três novas memórias:** em `js/roma-campaign-data.js`, cada capítulo possui seu próprio `floor`. A câmera, os objetos e os personagens usam essa mesma linha de chão.
- Diminuir `floorY` sobe a linha do chão; aumentar desce. Teste pequenos ajustes e confira as entradas e saídas.
- `playerSize`/`PLAYER_SIZE` alteram o tamanho. Não os use para corrigir apenas a altura em relação ao chão.

## Cuidados ao trocar imagens

Mantenha os nomes e caminhos existentes quando possível. Antes de renomear ou remover uma arte, procure seu nome em HTML, CSS, JavaScript e nos documentos. Nomes com maiúsculas e minúsculas diferentes podem funcionar no Windows e falhar no site publicado.

Use caminhos relativos: `assets/...` no HTML e nos caminhos de imagem usados pelo jogo, `../assets/...` dentro de CSS. Evite `/assets/...`: a demonstração está no subdiretório `/Memorias_perdidas/`.

Não apague arquivos antigos apenas porque parecem duplicados. Alguns são fontes de animação, referências ou recursos de versões anteriores. Uma limpeza dessas artes precisa de revisão separada.

## Verificação automática

Com Node.js 24 instalado, na raiz do repositório:

```bash
node --test scripts/check-project.test.cjs
node --test scripts/check-learning.test.cjs
node --test scripts/check-campaign.test.cjs
node scripts/check-project.cjs
```

Não há pacotes adicionais para instalar. A verificação procura:

- Erros de sintaxe em JavaScript e JSON.
- Referências locais estáticas ausentes em HTML, CSS, JavaScript e links Markdown.
- Diferenças entre maiúsculas/minúsculas nos caminhos e caminhos absolutos incompatíveis com o subdiretório do site.
- Cenários declarados no mapa `backgrounds` de Roma que não existam.

São verificados os arquivos rastreados pelo Git e os novos arquivos não ignorados. Arquivos removidos mas ainda rastreados são apontados como ausentes. O processo não executa a lógica do jogo, não testa serviços externos e não consegue resolver todas as imagens construídas dinamicamente. Por isso, também faça o teste manual abaixo.

A mesma verificação roda em alterações enviadas para `master` e em pull requests, pelo arquivo [.github/workflows/verify.yml](../.github/workflows/verify.yml). Ela apenas verifica: não publica, não modifica arquivos e não impede sozinha o GitHub Pages de publicar uma alteração enviada diretamente à branch.

## Roteiro de teste manual

Use uma janela privativa ou um perfil separado para não apagar seu progresso pessoal.

1. Abra o menu e inicie um jogo. Confirme que a escola, Renato e Lily aparecem.
2. Entre e saia da escola, da sala de aula e da quadra. Pegue o celular e avance as mensagens.
3. Veja a viagem ao cofre, percorra os corredores e entre na memória de Roma.
4. Em Roma, confira mercado, Foro, Coliseu, arena, rua dos artesãos, oficina, bairro, pátio e Senado. Ravena é liberada pela investigação.
5. Abra e feche mapa e livros. Marcar uma rota deve orientar, sem teletransportar Renato.
6. Confira os desafios e as cinco comparações históricas até o encerramento. Os registros originais não devem ser alterados.
7. Recarregue a fase de Roma e confira a retomada do progresso.
8. Repita as interações principais no celular: texto legível, botão Continuar acessível e setas sem selecionar texto ao segurar.
9. Na campanha v11, conclua as três novas etapas pela linha do tempo. Teste leitura obrigatória, tentativas incorretas, retomada após recarregar, entrega de materiais, rota do porto e canal de água.
10. Termine a queda e confira as quatro memórias concluídas no arquivo, inclusive após recarregar. Um save antigo apenas da queda não deve concluir as etapas novas.

## Publicação

A demonstração já usa a raiz da branch `master` no GitHub Pages. Confira as alterações, execute as verificações e só então envie o commit. Não é necessário criar outro site ou trocar a configuração de hospedagem.

Siga o [checklist de publicação](PUBLICACAO.md) e registre alterações visíveis no [histórico de mudanças](../CHANGELOG.md). Funcionalidades planejadas ficam no [escopo da campanha](ESCOPO.md), separadas das já jogáveis.

Após o envio, confira [Actions](https://github.com/MHueto/Memorias_perdidas/actions) e [Settings → Pages](https://github.com/MHueto/Memorias_perdidas/settings/pages). Teste também [a versão pública](https://mhueto.github.io/Memorias_perdidas/) depois da conclusão da publicação. O navegador pode manter recursos em cache; recarregue a página se ainda vir a versão anterior.

Referências da configuração: [formulários de issues](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms), [checkout](https://github.com/actions/checkout) e [setup-node](https://github.com/actions/setup-node).
