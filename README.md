# Memórias Perdidas

**Uma aventura histórica em pixel art sobre investigar o passado e restaurar memórias.**

### [Jogar no navegador →](https://mhueto.github.io/Memorias_perdidas/)

[Testar diretamente a fase de Roma](https://mhueto.github.io/Memorias_perdidas/roma.html?intro=1) · [Relatar um problema](https://github.com/MHueto/Memorias_perdidas/issues/new/choose) · [Guias do projeto](docs/README.md)

[![Verificar projeto](https://github.com/MHueto/Memorias_perdidas/actions/workflows/verify.yml/badge.svg)](https://github.com/MHueto/Memorias_perdidas/actions/workflows/verify.yml)

> **Protótipo em desenvolvimento.** A versão disponível reúne a introdução na escola, o Cofre das Memórias e a primeira fase histórica, ambientada em 475–476 d.C. É possível jogar sem instalar o projeto ou criar uma conta.

![Cenário em pixel art da entrada de Roma, com muralhas, um arco e bancas de mercado ao pôr do sol.](assets/images/roma/entrada-roma-simples-v6.png)

## Sobre o jogo

Renato está indo embora da escola quando percebe que esqueceu o celular. O que parecia uma volta rápida à sala de aula o leva ao **Cofre das Memórias**, um lugar que preserva fragmentos de momentos históricos.

Algumas dessas memórias foram alteradas. Na primeira missão, Renato chega a uma Roma cujo passado não segue o caminho esperado: cabe a ele conversar com moradores, explorar os ambientes e comparar as pistas com os registros originais que carrega.

O objetivo é **aprender história por meio da investigação**. Os livros não são reescritos pelo jogador: eles ajudam a descobrir o que foi alterado na memória e a restaurar o curso dos acontecimentos.

## Como testar

1. Abra **[Jogar no navegador](https://mhueto.github.io/Memorias_perdidas/)**.
2. No menu, escolha **Jogar → Novo Jogo → Jogo 1** (ou outro espaço disponível).
3. Avance a conversa inicial e explore a escola.
4. Se quiser experimentar apenas a parte histórica, use o **[atalho para Roma](https://mhueto.github.io/Memorias_perdidas/roma.html?intro=1)**.

**No celular:** use os botões na tela. A orientação horizontal oferece mais espaço para enxergar os cenários. O carregamento inicial pode demorar conforme a conexão.

**Progresso:** a fase de Roma salva o avanço no próprio navegador. Ele não é sincronizado entre aparelhos, entre navegadores ou com a versão em `localhost`. O atalho para Roma respeita um progresso existente; para recomeçar essa fase, abra **Mapa → Reiniciar Roma** e confirme.

## Controles

| Ação | Escola e cofre | Roma |
| --- | --- | --- |
| Andar | `A` / `D` ou `←` / `→` | `A` / `D` ou `←` / `→` |
| Entrar ou interagir | `W` ou `↑` | `E`, `W` ou `↑` |
| Pular | `Espaço` | — |
| Usar a ação do desafio | — | `Espaço`, quando solicitado |
| Abrir o mapa | — | `M` |
| Consultar os livros | — | `B` |
| Avançar uma conversa | Botão **Continuar** ou `Enter` | Botão **Continuar** ou `Enter` |

Em dispositivos de toque, os controles de movimento e interação aparecem na tela.

## O que já está disponível

- Introdução na escola, encontro com Lily e busca pelo celular.
- Viagem até o Cofre das Memórias, corredores conectados e encontro com Pedro Neves.
- Entrada na memória de Roma, com mercado, Foro, Coliseu, oficina, bairro residencial, pátio e Senado.
- Investigação sobre o fim do Império Romano do Ocidente, com livros, pistas, diálogos e viagem a Ravena.
- Mapa de orientação: mostra a posição e os caminhos, **sem teletransportar o personagem**.
- Desafios de exploração, coleta de objetos e recuperação de uma memória na arena.
- Efeitos visuais de deterioração da memória ao longo da partida.

### Próximas memórias

As fases sobre **as Cruzadas** e **a Peste Negra** estão planejadas. Elas ainda **não estão disponíveis nesta demonstração**.

## História e ficção

A primeira fase começa em **475 d.C.** e investiga os acontecimentos que levam à deposição de Rômulo Augústulo em **476 d.C.**, marco convencional do fim do Império Romano do Ocidente.

A viagem temporal, os personagens do presente, os obstáculos da investigação e o desafio dos leões são elementos de ficção. A deterioração visual representa uma **memória instável**: não significa que a cidade de Roma tenha sido completamente destruída em 476, nem que o Império Romano do Oriente tenha terminado nessa data.

Os livros de Renato apresentam referências para consulta. Veja também:

- [Pesquisa histórica para o jogo](docs/Pesquisa_historica_para_o_jogo.md).
- [Estrutura da investigação de Roma](docs/roma-investigacao-v8.md).
- [Mapa e orientação na fase](docs/roma-orientacao-v9.md).

Esses documentos fazem parte do desenvolvimento e podem conter spoilers ou ideias de versões anteriores.

## Executar no computador

O jogo usa **HTML, CSS e JavaScript**, sem etapa de compilação.

1. Baixe o projeto em **Code → Download ZIP** e extraia a pasta, ou clone o repositório:

   ```bash
   git clone https://github.com/MHueto/Memorias_perdidas.git
   cd Memorias_perdidas
   ```

2. Com Python 3 instalado, abra um terminal nessa pasta e inicie um servidor local:

   ```bash
   python -m http.server 8080 --bind 127.0.0.1
   ```

   No Windows, se o comando `python` não estiver disponível, use `py -3` no lugar de `python`. Também é possível usar a extensão Live Server do VS Code.

3. Abra **http://localhost:8080/** no navegador. Mantenha o terminal aberto enquanto joga; para encerrar, pressione `Ctrl+C`.

## Organização dos arquivos

```text
Memorias_perdidas/
├── index.html             Menu principal
├── teste-escola.html      Escola, cofre e introdução
├── roma.html              Primeira memória histórica
├── css/                   Estilos e interface
├── js/                    Movimento, diálogos, investigação e mapa
├── assets/                Cenários, sprites e outros recursos
├── docs/                  Pesquisa histórica e documentação
├── scripts/               Verificação de arquivos e testes do verificador
├── .github/               Formulários de problemas e verificação automática
├── CONTRIBUTING.md        Orientações para contribuir
└── .nojekyll              Publicação estática pelo GitHub Pages
```

Para localizar a lógica de cada cena, ajustar a altura do chão ou trocar imagens, consulte o **[guia de desenvolvimento](docs/DESENVOLVIMENTO.md)**. O **[índice da documentação](docs/README.md)** separa o funcionamento atual dos registros de versões anteriores.

Com Node.js 24 instalado, é possível conferir o projeto sem instalar pacotes:

```bash
node --test scripts/check-project.test.cjs
node scripts/check-project.cjs
```

A verificação confere sintaxe e referências locais, incluindo diferenças de maiúsculas/minúsculas nos nomes. Ela também roda no GitHub, mas não substitui jogar e testar as interações. Veja [como contribuir](CONTRIBUTING.md).

## Publicação da demonstração

A demonstração usa **GitHub Pages**, configurado para publicar a raiz da branch `master`. Depois que uma alteração é enviada para essa branch, o GitHub prepara uma nova publicação; o link do jogo permanece o mesmo.

Consulte [Settings → Pages](https://github.com/MHueto/Memorias_perdidas/settings/pages) para verificar a configuração e [Actions](https://github.com/MHueto/Memorias_perdidas/actions) para acompanhar a publicação. Esses ajustes exigem permissão no repositório.

## Encontrou um problema?

[Abra uma issue usando os formulários](https://github.com/MHueto/Memorias_perdidas/issues/new/choose) com:

- O ambiente em que aconteceu: escola, cofre ou nome da área de Roma.
- O que você fez antes do problema.
- O que esperava acontecer e o que aconteceu.
- Seu navegador e se estava jogando no computador ou celular.
- Uma captura de tela, se possível.

Por ser um protótipo, a arte, os controles, a apresentação e o conteúdo ainda podem mudar. O foco atual é tornar a primeira memória jogável, compreensível e educativa.

---

Projeto de **[MHueto](https://github.com/MHueto)**.
