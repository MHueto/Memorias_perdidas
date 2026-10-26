# Guias do projeto

[Jogar a demonstração](https://mhueto.github.io/Memorias_perdidas/) · [Voltar à apresentação](../README.md)

## Para começar

- [Guia de desenvolvimento](DESENVOLVIMENTO.md): executar, localizar cada parte do jogo, ajustar o chão e verificar os arquivos antes de publicar.
- [Como contribuir](../CONTRIBUTING.md): mudanças, relatos de problemas e cuidados com conteúdo histórico e arte.
- [Escopo da campanha](ESCOPO.md): o que está jogável e o que ainda está planejado.
- [Publicar e conferir uma atualização](PUBLICACAO.md): checklist do GitHub Pages e cuidados com os saves.
- [Novidades](../CHANGELOG.md): histórico das atualizações do repositório.
- [Pesquisa histórica](Pesquisa_historica_para_o_jogo.md): referências e material de estudo. Contém ideias de desenvolvimento, não apenas conteúdo já implementado.

## Funcionamento atual de Roma

Leia estes documentos junto com o código atual. Os sufixos `v8`, `v9` e `v10` indicam a etapa em que cada guia foi escrito, não versões diferentes para instalar.

- [Investigação histórica — v8](roma-investigacao-v8.md): registros originais, pistas e comparações sobre 475–476 d.C.
- [Mapa e orientação — v9](roma-orientacao-v9.md): rotas, localização, controles e consulta aos livros.
- [Investigação guiada e aprendizagem — v10](roma-aprendizagem-v10.md): ajuda por etapa, trecho indicado dos livros, explicações das respostas e revisão final.

## Histórico do desenvolvimento

Estes registros ajudam a entender decisões anteriores. Detalhes podem ter sido substituídos pelas versões seguintes; não são uma lista de funcionalidades garantidas na demonstração atual.

| Etapa | Registro |
| --- | --- |
| Movimento e animações | [Versão 3](roma-movimento-v3.md) |
| Novas ruas e ambientes | [Versão 4](roma-expansao-v4.md) |
| Simplificação dos cenários | [Versão 6](roma-artes-simples-v6.md) |
| Objetos e mecânicas de investigação | [Versão 7](roma-mecanicas-investigacao-v7.md) |

Alguns guias antigos mencionam testes em `work/`. Essa pasta pertence ao ambiente local de desenvolvimento e não acompanha o repositório. A verificação reproduzível disponível aqui é `node scripts/check-project.cjs`; o roteiro de teste manual está no guia de desenvolvimento.

Os guias de investigação contêm spoilers. O escopo atual é somente Roma; referências a Cruzadas e Peste Negra nos registros antigos não representam fases disponíveis ou ainda previstas para esta campanha.
