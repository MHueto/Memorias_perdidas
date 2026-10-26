# Como contribuir

Memórias Perdidas é um protótipo de aventura histórica educativa. Antes de propor uma mudança, [experimente o jogo](https://mhueto.github.io/Memorias_perdidas/) e consulte o [guia de desenvolvimento](docs/DESENVOLVIMENTO.md).

## Relatar um problema ou sugerir uma melhoria

Use os [formulários de issues](https://github.com/MHueto/Memorias_perdidas/issues/new/choose). Descreva a área do jogo, os passos até o problema e o navegador/aparelho utilizado. Imagens ajudam, mas não publique senhas, dados pessoais ou arquivos privados.

Para correções históricas, inclua a fonte e explique qual trecho do jogo precisa mudar. Diferencie fatos históricos, interpretações e elementos ficcionais.

## Alterar o projeto

1. Faça uma alteração de escopo pequeno e preserve os trabalhos existentes.
2. Não renomeie nem remova artes sem revisar todas as referências. Mantenha a estética pixel art e a legibilidade no celular.
3. Execute `node --test scripts/check-project.test.cjs scripts/check-learning.test.cjs scripts/check-campaign.test.cjs` e `node scripts/check-project.cjs` com Node.js 24.
4. Teste o trecho afetado no navegador, inclusive entradas, saídas e controles de toque quando aplicável.
5. Descreva no commit ou pull request o que mudou, como foi testado e qualquer limitação conhecida.

Confira o [escopo atual](docs/ESCOPO.md) antes de ampliar a campanha. Registre mudanças visíveis em [CHANGELOG.md](CHANGELOG.md) e use o [checklist de publicação](docs/PUBLICACAO.md) ao atualizar a demonstração.

O jogo não precisa de compilação nem de dependências npm. Não envie `node_modules`, senhas, credenciais, configurações pessoais ou relatórios temporários.

## Coerência educativa

- Renato compara pistas com registros originais; os livros não são reescritos pelo jogador.
- A fase investiga 475–476 d.C. e o fim convencional do Império Romano do Ocidente, sem tratar 476 como o desaparecimento de toda a vida romana ou do Império do Oriente.
- Nas origens, diferencie tradição lendária de evidência arqueológica. Na expansão, distinga domínio territorial de regime imperial; na Pax Romana, não confunda estabilidade relativa com paz universal ou igualdade de direitos.
- Moradores romanos não conhecem o Cofre ou as interferências na memória.
- Obstáculos ficcionais e deterioração visual da memória não devem ser apresentados como acontecimentos históricos documentados.
- Preserve as referências e acrescente fontes verificáveis ao alterar conteúdo histórico.

Não inclua arte, música ou texto de terceiros sem verificar a autorização de uso e registrar a origem. Este guia não adiciona uma licença ao projeto nem muda os direitos dos materiais existentes.
