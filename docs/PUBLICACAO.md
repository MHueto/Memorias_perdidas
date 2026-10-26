# Publicar e conferir uma atualização

[Índice dos guias](README.md) · [Guia de desenvolvimento](DESENVOLVIMENTO.md)

Destino: **MHueto/Memorias_perdidas**, branch **master**, pasta **raiz** no GitHub Pages. Link público: [jogar Memórias Perdidas](https://mhueto.github.io/Memorias_perdidas/).

Não é necessário compilar, instalar pacotes ou contratar outro serviço. Este guia não cria uma hospedagem nova nem altera a configuração existente.

## Antes de enviar

1. Confira `git status --short` e `git diff`. Inclua somente arquivos relacionados à atualização; preserve alterações de outras pessoas.
2. Não envie credenciais, arquivos pessoais, relatórios temporários ou dependências. A lista de arquivos ignorados ajuda, mas não substitui a revisão.
3. Atualize o [histórico de mudanças](../CHANGELOG.md) e os guias afetados. Não anuncie etapas planejadas como prontas.
4. Com Node.js 24, execute na raiz do projeto:

   ```bash
   node --test scripts/check-project.test.cjs scripts/check-learning.test.cjs
   node scripts/check-project.cjs
   git diff --check
   ```

5. Teste no navegador o trecho alterado e suas entradas e saídas. Se houver mudanças na interface, teste teclado e tela pequena.
6. Crie um commit com descrição clara e envie-o para `master` quando a publicação estiver autorizada. Não use envio forçado para contornar conflitos; revise as diferenças primeiro.

## Depois do envio

1. Abra [Actions](https://github.com/MHueto/Memorias_perdidas/actions). Confira tanto **Verificar projeto** quanto a publicação do **Pages** para o commit enviado.
2. Aguarde a publicação terminar e abra o [site público](https://mhueto.github.io/Memorias_perdidas/). O teste local não confirma que o site já atualizou.
3. Teste menu → novo jogo → escola e o [atalho para Roma](https://mhueto.github.io/Memorias_perdidas/roma.html?intro=1). Confira o cenário, movimento, mapa, livros e ajuda da missão.
4. Se o navegador mostrar conteúdo antigo, recarregue ignorando o cache ou teste em janela privativa. **Não limpe os dados do site sem necessidade:** isso pode apagar o progresso.

O progresso fica no navegador. Uma janela privativa permite testar um jogo novo sem apagar o save normal; ela não compartilha esse progresso com outras janelas ou aparelhos.

## Se aparecer um problema

- **Não atualizou:** confira se a publicação corresponde ao último commit. Uma publicação pode ainda estar em andamento.
- **Imagem ou arquivo ausente:** confira nomes, extensão e maiúsculas/minúsculas. Use caminhos relativos; o jogo está sob `/Memorias_perdidas/`.
- **Teste automático falhou:** leia a etapa que falhou e corrija o problema. A verificação não bloqueia sozinha uma publicação direta pelo Pages.
- **Precisa desfazer uma atualização publicada:** identifique o commit responsável e prepare uma reversão revisada, preservando o histórico. Não apague arquivos nem force a branch como tentativa de correção.

O teste do projeto cobre sintaxe e referências estáticas. Não substitui uma partida, não verifica todos os caminhos montados dinamicamente e não garante compatibilidade com todo dispositivo.
