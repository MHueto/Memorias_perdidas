(() => {
    const SCENE_WIDTH = 1916;
    const SCENE_HEIGHT = 821;
    const CORRIDOR_WIDTH = SCENE_WIDTH;
    const COMPACT_ROOM_WIDTH = 1054;
    const DEFAULT_PLAYER_SIZE = 90;
    const PLAYER_VERTICAL_OFFSET = 6;
    const SPEED = 310;
    const JUMP_SPEED = 690;
    const GRAVITY = 1850;
    const PEDRO_WALK_DURATION = 2800;
    const MEMORY_CORE_X = 850;
    const MEMORY_CORE_RANGE = 138;

    // COFRE DAS MEMÓRIAS — ALTURA DO RENATO POR ÁREA
    // Cada corredor tem sua própria linha de piso. Diminua o valor para subir
    // Renato; aumente para descer. Altere só a variável da sala que deseja ajustar.
    const COFRE_ARQUIVO_INICIAL_CHAO_Y = 577; // corredor2.png
    const COFRE_ESTANTES_NORTE_CHAO_Y = 560; // corredor1.png
    const COFRE_SALA_REGISTROS_CHAO_Y = 565; // corredor4.png
    const COFRE_ENCRUZILHADA_CHAO_Y = 564; // corredor6.png
    const COFRE_PASSAGEM_CENTRAL_CHAO_Y = 563; // corredor3.png
    const COFRE_ALA_LATERAL_CHAO_Y = 587; // corredor5.png
    const COFRE_NUCLEO_FINAL_CHAO_Y = 576; // area_final_sem_cerca.png

    const scenes = {
        outside: {
            width: SCENE_WIDTH,
            floorY: 680,
            playerSize: DEFAULT_PLAYER_SIZE,
            startX: 360,
            label: 'Lado de fora — portão principal',
            entry: { x: 960, range: 118, label: 'Em frente à escada — ↑ para entrar' }
        },
        inside: {
            width: CORRIDOR_WIDTH,
            floorY: 504,
            playerSize: DEFAULT_PLAYER_SIZE,
            startX: 1040,
            label: 'Corredor da escola',
            classroomDoor: { x: 1800, range: 68, label: 'Última porta — ↑ para entrar na sala' }
        },
        gym: {
            width: COMPACT_ROOM_WIDTH,
            floorY: 544,
            playerSize: DEFAULT_PLAYER_SIZE,
            startX: 130,
            label: 'Quadra da escola'
        },
        classroom: {
            width: COMPACT_ROOM_WIDTH,
            floorY: 558,
            playerSize: DEFAULT_PLAYER_SIZE,
            startX: 145,
            label: 'Sala de aula'
        },
        vault: {
            width: CORRIDOR_WIDTH,
            floorY: COFRE_ARQUIVO_INICIAL_CHAO_Y,
            playerSize: DEFAULT_PLAYER_SIZE,
            startX: 138,
            label: 'Cofre das Memórias — encontre a saída'
        },
        vaultFinal: {
            width: 1672,
            floorY: COFRE_NUCLEO_FINAL_CHAO_Y,
            playerSize: DEFAULT_PLAYER_SIZE,
            startX: 172,
            label: 'Núcleo do Cofre das Memórias'
        }
    };

    // A sequência é propositalmente diferente da ordem dos nomes dos arquivos.
    // Cada ponta de corredor é uma escolha: algumas retornam ao caminho anterior
    // e outras levam mais perto da sala final.
    const VAULT_START_ROOM = 'arquivo-inicial';
    const vaultRooms = {
        'arquivo-inicial': {
            asset: 'assets/images/cofre/corredor2.png',
            left: 'estantes-norte',
            right: 'sala-de-registros',
            floorY: COFRE_ARQUIVO_INICIAL_CHAO_Y
        },
        'estantes-norte': {
            asset: 'assets/images/cofre/corredor1.png',
            left: 'arquivo-inicial',
            right: 'ala-lateral',
            floorY: COFRE_ESTANTES_NORTE_CHAO_Y
        },
        'sala-de-registros': {
            asset: 'assets/images/cofre/corredor4.png',
            left: 'arquivo-inicial',
            right: 'encruzilhada',
            floorY: COFRE_SALA_REGISTROS_CHAO_Y
        },
        encruzilhada: {
            asset: 'assets/images/cofre/corredor6.png',
            left: 'sala-de-registros',
            right: 'passagem-central',
            floorY: COFRE_ENCRUZILHADA_CHAO_Y,
            backgroundSize: '1916px auto',
            backgroundPosition: '0 90px'
        },
        'passagem-central': {
            asset: 'assets/images/cofre/corredor3.png',
            left: 'encruzilhada',
            right: 'ala-lateral',
            floorY: COFRE_PASSAGEM_CENTRAL_CHAO_Y
        },
        'ala-lateral': {
            asset: 'assets/images/cofre/corredor5.png',
            left: 'passagem-central',
            right: 'final',
            floorY: COFRE_ALA_LATERAL_CHAO_Y
        }
    };

    const viewport = document.querySelector('#gameViewport');
    const gameShell = document.querySelector('.game-shell');
    const world = document.querySelector('#schoolWorld');
    const renato = document.querySelector('#renato');
    const playerState = document.querySelector('#playerState');
    const explorationStatus = document.querySelector('#explorationStatus');
    const introDialogue = document.querySelector('#introDialogue');
    const introDialogueSpeaker = document.querySelector('#introDialogueSpeaker');
    const introDialogueText = document.querySelector('#introDialogueText');
    const introDialogueContinue = document.querySelector('#introDialogueContinue');
    const phoneMessage = document.querySelector('#phoneMessage');
    const phoneMessageText = document.querySelector('#phoneMessageText');
    const phoneMessageContinue = document.querySelector('#phoneMessageContinue');
    const travelCutscene = document.querySelector('#travelCutscene');
    const memoryTransition = document.querySelector('#memoryTransition');

    // Folha 2 × 8: oito poses para cada direção deixam o passo contínuo.
    const RENATO_SPRITE_SHEET = 'assets/images/renato/renato-walk-spritesheet-v4.png';
    const ROME_ENTRY_IMAGE = 'assets/images/roma/entrada-roma-pixelart-v1.png';
    const SCENE_IMAGE_PATHS = [
        'assets/images/escola/lado_de_fora_escola.png',
        'assets/images/escola/escola_por_dentro_completa.png',
        'assets/images/escola/quadra.png',
        'assets/images/escola/sala_de_aula.png',
        'assets/images/cofre/corredor1.png',
        'assets/images/cofre/corredor2.png',
        'assets/images/cofre/corredor3.png',
        'assets/images/cofre/corredor4.png',
        'assets/images/cofre/corredor5.png',
        'assets/images/cofre/corredor6.png',
        'assets/images/cofre/area_final_sem_cerca.png',
        'assets/images/pedro-neves-sem-jaleco-v1.png',
        'assets/images/pedro-neves-walk-right-v2.png',
        'assets/images/pedro-neves-computador-costas-v1.png',
        RENATO_SPRITE_SHEET
    ];
    const VAULT_IMAGE_PATHS = SCENE_IMAGE_PATHS.filter((path) => path.includes('/cofre/'));
    const imagePreloadCache = new Map();

    function preloadSceneImage(source) {
        if (imagePreloadCache.has(source)) return imagePreloadCache.get(source);

        const preload = new Promise((resolve) => {
            const image = new Image();
            const finish = () => resolve();
            image.addEventListener('load', () => {
                // decode evita revelar um PNG parcialmente desenhado em conexões lentas.
                if (typeof image.decode === 'function') image.decode().catch(() => {}).finally(finish);
                else finish();
            }, { once: true });
            image.addEventListener('error', finish, { once: true });
            image.src = source;
        });

        imagePreloadCache.set(source, preload);
        return preload;
    }

    const sceneImagesReady = Promise.all(SCENE_IMAGE_PATHS.map(preloadSceneImage));
    const vaultImagesReady = Promise.all(VAULT_IMAGE_PATHS.map(preloadSceneImage));
    const sprites = {
        right: [
            { id: 'right-idle', position: '0% 0%' },
            { id: 'right-step-contact-a', position: '14.2857% 0%' },
            { id: 'right-step-down-a', position: '28.5714% 0%' },
            { id: 'right-step-passing-a', position: '42.8571% 0%' },
            { id: 'right-step-contact-b', position: '57.1429% 0%' },
            { id: 'right-step-down-b', position: '71.4286% 0%' },
            { id: 'right-step-passing-b', position: '85.7143% 0%' },
            { id: 'right-step-return', position: '100% 0%' }
        ],
        left: [
            { id: 'left-idle', position: '0% 100%' },
            { id: 'left-step-contact-a', position: '14.2857% 100%' },
            { id: 'left-step-down-a', position: '28.5714% 100%' },
            { id: 'left-step-passing-a', position: '42.8571% 100%' },
            { id: 'left-step-contact-b', position: '57.1429% 100%' },
            { id: 'left-step-down-b', position: '71.4286% 100%' },
            { id: 'left-step-passing-b', position: '85.7143% 100%' },
            { id: 'left-step-return', position: '100% 100%' }
        ]
    };

    const player = {
        x: scenes.outside.startX,
        height: 0,
        velocityY: 0,
        facing: 'right',
        moving: false,
        grounded: true,
        walkTime: 0
    };

    const heldKeys = new Set();
    let currentArea = 'outside';
    let jumpRequested = false;
    let previousTime = performance.now();
    let displayedSprite = '';
    let previousZoneLabel = '';
    let changeTimer = 0;
    const testParameters = new URLSearchParams(window.location.search);
    const requestedArea = Object.prototype.hasOwnProperty.call(scenes, testParameters.get('debugArea'))
        ? testParameters.get('debugArea')
        : 'outside';
    const requestedPosition = testParameters.has('debugPosition') ? Number(testParameters.get('debugPosition')) : null;
    const shouldPlayIntro = !testParameters.has('debugArea') && !testParameters.has('debugPosition') && testParameters.get('intro') !== 'off';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let introPhase = shouldPlayIntro ? 'lily-dialogue-pending' : 'complete';
    const lilyDialogue = [
        { speaker: 'LILY', text: 'Oi, Renato! Indo embora?' },
        { speaker: 'RENATO', text: 'Oi, Lily. Eu estava… espera. Meu celular! Deixei ele na sala.' },
        { speaker: 'LILY', text: 'Antes de voltar: você ficou sabendo do que aconteceu no Cofre das Memórias?' },
        { speaker: 'RENATO', text: 'Cofre das Memórias? Nem sei o que é isso.' },
        { speaker: 'LILY', text: 'É um lugar que preserva lembranças importantes. Disseram que alguém invadiu e algumas memórias foram alteradas.' },
        { speaker: 'RENATO', text: 'Isso parece sério. Vou buscar meu celular primeiro.' },
        { speaker: 'LILY', text: 'Vai lá. Talvez ele tenha alguma explicação.' }
    ];
    const pedroBriefing = [
        { speaker: 'PEDRO NEVES', text: 'Renato. Ainda bem que você chegou.' },
        { speaker: 'RENATO', text: 'Você é Pedro Neves? O que é este lugar?' },
        { speaker: 'PEDRO NEVES', text: 'Este é o Cofre das Memórias. Aqui preservamos fragmentos de momentos históricos para que eles não se percam.' },
        { speaker: 'PEDRO NEVES', text: 'A invasão alterou alguns fragmentos. Quando uma memória muda, o passado começa a se desfazer.' },
        { speaker: 'RENATO', text: 'E o que eu tenho que fazer?' },
        { speaker: 'PEDRO NEVES', text: 'Você vai entrar nas memórias instáveis, encontrar o ponto alterado e restaurá-lo sem mudar o resto da história.' },
        { speaker: 'PEDRO NEVES', text: 'A primeira ruptura está na queda de Roma. Quando estiver pronto, use o núcleo para atravessar.' },
        { speaker: 'RENATO', text: 'Entendi. Vou consertar isso.' }
    ];
    let storyDialogueOpen = false;
    let storyDialogueLines = [];
    let storyDialogueStep = 0;
    let storyDialogueOnClose = null;
    let finalBriefingStarted = false;
    const PHONE_POSITION_X = 535;
    const PHONE_INTERACTION_RANGE = 88;
    const phoneMessages = [
        'O cofre das memórias foi invadido. Algumas memórias foram alteradas.',
        'Devido à falta de tempo e ao sorteio, você foi selecionado para fazer as memórias voltarem a ser o que eram.'
    ];
    let phoneMessageStep = 0;
    let phoneMessageOpen = false;
    let phoneCollected = false;
    let cutsceneActive = false;
    let cutsceneRevealTimer = 0;
    let cutsceneEndTimer = 0;
    let cutsceneFinishTimer = 0;
    let pedroWalkTimer = 0;
    let memoryTransitionTimer = 0;
    let memoryCoreReady = false;
    let memoryTransitionActive = false;
    let vaultRoomId = VAULT_START_ROOM;

    // URLs antigos de teste podiam abrir diretamente uma sala. O jogo sempre
    // começa na entrada; os parâmetros debugArea/debugPosition ficam reservados
    // apenas para testes técnicos.
    if (testParameters.has('area') || testParameters.has('position')) {
        window.history.replaceState({}, '', window.location.pathname);
    }

    const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
    const currentScene = () => {
        if (currentArea !== 'vault') return scenes[currentArea];

        return {
            ...scenes.vault,
            floorY: vaultRooms[vaultRoomId].floorY
        };
    };

    function getHorizontalMovement() {
        let direction = 0;
        if (heldKeys.has('arrowleft') || heldKeys.has('a')) direction -= 1;
        if (heldKeys.has('arrowright') || heldKeys.has('d')) direction += 1;
        return direction;
    }

    function updateStoryDialogue() {
        const line = storyDialogueLines[storyDialogueStep];
        if (!line) return;

        introDialogueSpeaker.textContent = line.speaker;
        introDialogueText.textContent = line.text;
        introDialogueContinue.innerHTML = storyDialogueStep === storyDialogueLines.length - 1
            ? 'Entendi <span aria-hidden="true">↵</span>'
            : 'Continuar <span aria-hidden="true">↵</span>';
    }

    function openStoryDialogue(lines, onClose = null) {
        storyDialogueLines = lines;
        storyDialogueStep = 0;
        storyDialogueOnClose = onClose;
        storyDialogueOpen = true;
        player.moving = false;
        heldKeys.clear();
        jumpRequested = false;
        updateStoryDialogue();
        introDialogue.hidden = false;
        introDialogueContinue.focus({ preventScroll: true });
    }

    function closeStoryDialogue() {
        if (!storyDialogueOpen) return;
        storyDialogueOpen = false;
        introDialogue.hidden = true;
        const onClose = storyDialogueOnClose;
        storyDialogueOnClose = null;
        onClose?.();
        viewport.focus({ preventScroll: true });
    }

    function continueStoryDialogue() {
        if (!storyDialogueOpen) return;

        if (storyDialogueStep < storyDialogueLines.length - 1) {
            storyDialogueStep += 1;
            updateStoryDialogue();
            return;
        }

        closeStoryDialogue();
    }

    function startLilyDialogue() {
        introPhase = 'dialogue';
        openStoryDialogue(lilyDialogue, () => {
            introPhase = 'complete';
        });
    }

    function startPedroBriefing() {
        if (finalBriefingStarted) return;
        finalBriefingStarted = true;
        openStoryDialogue(pedroBriefing, startPedroWalkToConsole);
    }

    function startPedroWalkToConsole() {
        if (currentArea !== 'vaultFinal') return;

        window.clearTimeout(pedroWalkTimer);
        world.classList.remove('pedro-walking', 'pedro-at-console');

        if (prefersReducedMotion) {
            world.classList.add('pedro-at-console');
            unlockMemoryCore();
            return;
        }

        // Garante que a primeira pose seja exibida antes de iniciar o ciclo.
        requestAnimationFrame(() => world.classList.add('pedro-walking'));
        pedroWalkTimer = window.setTimeout(() => {
            world.classList.remove('pedro-walking');
            world.classList.add('pedro-at-console');
            unlockMemoryCore();
        }, PEDRO_WALK_DURATION);
    }

    function unlockMemoryCore() {
        memoryCoreReady = true;
        world.classList.add('is-memory-ready');
        updateSceneLabel();
    }

    function startMemoryTransition() {
        if (memoryTransitionActive || !memoryCoreReady || currentArea !== 'vaultFinal') return;

        memoryTransitionActive = true;
        player.moving = false;
        heldKeys.clear();
        jumpRequested = false;
        memoryTransition.hidden = false;
        world.classList.add('is-entering-memory');
        requestAnimationFrame(() => memoryTransition.classList.add('is-active'));
        updateSprite();

        // O próximo cenário é carregado enquanto o núcleo cresce. Assim a página
        // de Roma não aparece com fundo preto se a imagem ainda estiver decodificando.
        const minimumTransition = new Promise((resolve) => {
            window.clearTimeout(memoryTransitionTimer);
            memoryTransitionTimer = window.setTimeout(resolve, prefersReducedMotion ? 180 : 1700);
        });

        Promise.all([preloadSceneImage(ROME_ENTRY_IMAGE), minimumTransition]).finally(() => {
            window.location.assign('roma.html?intro=1');
        });
    }

    function updatePhoneMessage() {
        phoneMessageText.textContent = phoneMessages[phoneMessageStep];
        phoneMessageContinue.innerHTML = phoneMessageStep === phoneMessages.length - 1
            ? 'Entendi <span aria-hidden="true">↵</span>'
            : 'Continuar <span aria-hidden="true">↵</span>';
    }

    function openPhoneMessage() {
        phoneMessageStep = 0;
        phoneMessageOpen = true;
        player.moving = false;
        heldKeys.clear();
        jumpRequested = false;
        updatePhoneMessage();
        phoneMessage.hidden = false;
        phoneMessageContinue.focus({ preventScroll: true });
    }

    function startTravelCutscene() {
        cutsceneActive = true;
        player.moving = false;
        heldKeys.clear();
        jumpRequested = false;
        travelCutscene.hidden = false;
        travelCutscene.classList.add('is-black');

        window.clearTimeout(cutsceneRevealTimer);
        window.clearTimeout(cutsceneEndTimer);
        window.clearTimeout(cutsceneFinishTimer);
        cutsceneRevealTimer = window.setTimeout(() => travelCutscene.classList.remove('is-black'), 1100);
        cutsceneEndTimer = window.setTimeout(() => travelCutscene.classList.add('is-black'), 6100);
        cutsceneFinishTimer = window.setTimeout(() => {
            // A tela preta só sai depois de todas as imagens do labirinto estarem
            // prontas. Isso evita que Renato chegue a um cenário vazio.
            vaultImagesReady.finally(beginVaultMaze);
        }, 6900);
    }

    function beginVaultMaze() {
        vaultRoomId = VAULT_START_ROOM;
        cutsceneActive = false;
        setArea('vault', scenes.vault.startX);
        travelCutscene.hidden = true;
        travelCutscene.classList.remove('is-black');
        viewport.focus({ preventScroll: true });
    }

    function continuePhoneMessage() {
        if (!phoneMessageOpen) return;

        if (phoneMessageStep < phoneMessages.length - 1) {
            phoneMessageStep += 1;
            updatePhoneMessage();
            return;
        }

        phoneMessageOpen = false;
        phoneCollected = true;
        phoneMessage.hidden = true;
        world.classList.add('has-collected-phone');
        startTravelCutscene();
    }

    function updateSprite() {
        const scene = currentScene();
        const playerSize = scene.playerSize;
        const frames = sprites[player.facing];
        // Sete poses de passo, além da pose parada, completam o ciclo sem saltos.
        // Cada pose fica 130 ms na tela: um passo legível sem parecer lento.
        const frameIndex = player.moving && player.grounded ? 1 + (Math.floor(player.walkTime / 130) % 7) : 0;
        const sprite = frames[frameIndex];
        if (sprite.id !== displayedSprite) {
            renato.style.backgroundImage = `url("${RENATO_SPRITE_SHEET}")`;
            renato.style.backgroundPosition = sprite.position;
            displayedSprite = sprite.id;
        }

        renato.style.width = `${playerSize}px`;
        renato.style.height = `${playerSize}px`;

        const drawX = Math.round(player.x - playerSize / 2);
        const drawY = Math.round(scene.floorY - playerSize - player.height - PLAYER_VERTICAL_OFFSET);
        renato.style.transform = `translate(${drawX}px, ${drawY}px)`;

        if (memoryTransitionActive) {
            playerState.textContent = 'Renato está entrando na memória de Roma';
        } else if (cutsceneActive) {
            playerState.textContent = 'Renato está a caminho do Cofre das Memórias';
        } else if (phoneMessageOpen) {
            playerState.textContent = 'Renato está lendo uma mensagem';
        } else if (phoneCollected) {
            playerState.textContent = 'Renato encontrou o celular';
        } else if (storyDialogueOpen) {
            playerState.textContent = 'Renato está conversando';
        } else if (!player.grounded) {
            playerState.textContent = `Renato pulando para ${player.facing === 'right' ? 'direita' : 'esquerda'}`;
        } else if (player.moving) {
            playerState.textContent = `Renato andando para ${player.facing === 'right' ? 'direita' : 'esquerda'}`;
        } else {
            playerState.textContent = `Renato parado — olhando para ${player.facing === 'right' ? 'direita' : 'esquerda'}`;
        }
    }

    function updateCamera() {
        const scene = currentScene();
        const viewportWidth = viewport.clientWidth;
        const viewportHeight = viewport.clientHeight;
        const worldScale = Math.min(1, viewportHeight / 640);
        const scaledWidth = scene.width * worldScale;
        const cameraX = scaledWidth <= viewportWidth
            ? (viewportWidth - scaledWidth) / 2
            : clamp(viewportWidth / 2 - player.x * worldScale, viewportWidth - scaledWidth, 0);
        const worldTop = (viewportHeight - SCENE_HEIGHT * worldScale) / 2;

        world.style.top = `${Math.round(worldTop)}px`;
        world.style.transform = `translate3d(${Math.round(cameraX)}px, 0, 0) scale(${worldScale})`;
    }

    function getSceneLabel() {
        const scene = currentScene();

        if (currentArea === 'outside') {
            return Math.abs(player.x - scene.entry.x) <= scene.entry.range ? scene.entry.label : scene.label;
        }

        if (currentArea === 'inside' && Math.abs(player.x - scene.classroomDoor.x) <= scene.classroomDoor.range) {
            return scene.classroomDoor.label;
        }

        if (currentArea === 'classroom' && !phoneCollected && Math.abs(player.x - PHONE_POSITION_X) <= PHONE_INTERACTION_RANGE) {
            return 'Celular no chão — ↑ para pegar';
        }

        if (currentArea === 'vaultFinal' && memoryCoreReady && Math.abs(player.x - MEMORY_CORE_X) <= MEMORY_CORE_RANGE) {
            return 'Núcleo da memória — ↑ para entrar em Roma';
        }

        return scene.label;
    }

    function updateSceneLabel() {
        const label = getSceneLabel();
        const nearEntry = currentArea === 'outside' && label === currentScene().entry.label;
        world.classList.toggle('is-near-entry', nearEntry);

        if (label === previousZoneLabel) return;
        previousZoneLabel = label;
        explorationStatus.textContent = label;
    }

    function updateVaultBackdrop() {
        // A imagem é escolhida no CSS por atributo, em vez de depender de
        // URLs guardadas em variáveis CSS. Assim o caminho dos PNGs continua
        // correto mesmo quando a página é servida por outro endereço local.
        world.dataset.vaultRoom = vaultRoomId;
    }

    function setArea(nextArea, spawnX = scenes[nextArea].startX, preserveHeldKeys = false) {
        currentArea = nextArea;
        if (nextArea !== 'vaultFinal') {
            window.clearTimeout(pedroWalkTimer);
            world.classList.remove('pedro-walking', 'pedro-at-console', 'is-memory-ready', 'is-entering-memory');
            memoryCoreReady = false;
        }
        if (nextArea === 'vault') updateVaultBackdrop();
        else delete world.dataset.vaultRoom;
        const scene = currentScene();
        player.x = spawnX;
        player.height = 0;
        player.velocityY = 0;
        player.grounded = true;
        player.moving = false;
        if (!preserveHeldKeys) heldKeys.clear();
        previousZoneLabel = '';
        world.dataset.area = nextArea;
        world.style.width = `${scene.width}px`;

        viewport.classList.add('is-changing-scene');
        window.clearTimeout(changeTimer);
        changeTimer = window.setTimeout(() => viewport.classList.remove('is-changing-scene'), 230);

        updateSceneLabel();
        updateSprite();
        updateCamera();
    }

    function travelVault(exitSide) {
        const nextRoom = vaultRooms[vaultRoomId][exitSide];

        if (nextRoom === 'final') {
            setArea('vaultFinal');
            window.setTimeout(startPedroBriefing, prefersReducedMotion ? 0 : 260);
            return;
        }

        vaultRoomId = nextRoom;
        const nextScene = currentScene();
        const edgeInset = nextScene.playerSize / 2 + 100;
        const spawnX = exitSide === 'right'
            ? edgeInset
            : nextScene.width - edgeInset;

        // Mantém a direção pressionada: o corredor seguinte já começa fluido,
        // sem exigir que a pessoa solte e aperte a tecla de novo.
        setArea('vault', spawnX, true);
    }

    function trySceneAction() {
        if (introPhase !== 'complete' || storyDialogueOpen || phoneMessageOpen || cutsceneActive) return;
        const scene = currentScene();

        if (currentArea === 'vaultFinal' && memoryCoreReady && Math.abs(player.x - MEMORY_CORE_X) <= MEMORY_CORE_RANGE) {
            startMemoryTransition();
            return;
        }

        if (currentArea === 'classroom' && !phoneCollected && Math.abs(player.x - PHONE_POSITION_X) <= PHONE_INTERACTION_RANGE) {
            openPhoneMessage();
            return;
        }

        if (currentArea === 'outside' && Math.abs(player.x - scene.entry.x) <= scene.entry.range) {
            setArea('inside');
            return;
        }

        if (currentArea === 'inside' && Math.abs(player.x - scene.classroomDoor.x) <= scene.classroomDoor.range) {
            setArea('classroom');
        }
    }

    function update(deltaTime) {
        if (introPhase === 'lily-dialogue-pending') {
            startLilyDialogue();
            updateSceneLabel();
            updateSprite();
            updateCamera();
            return;
        }

        const scene = currentScene();
        const playerSize = scene.playerSize;

        if (storyDialogueOpen) {
            player.moving = false;
            jumpRequested = false;
            updateSceneLabel();
            updateSprite();
            updateCamera();
            return;
        }

        if (phoneMessageOpen) {
            player.moving = false;
            jumpRequested = false;
            updateSceneLabel();
            updateSprite();
            updateCamera();
            return;
        }

        if (cutsceneActive || memoryTransitionActive) {
            player.moving = false;
            jumpRequested = false;
            updateSceneLabel();
            updateSprite();
            updateCamera();
            return;
        }

        const direction = getHorizontalMovement();
        player.moving = direction !== 0;

        if (direction !== 0) {
            player.facing = direction > 0 ? 'right' : 'left';
            player.x = clamp(
                player.x + direction * SPEED * (deltaTime / 1000),
                playerSize / 2,
                scene.width - playerSize / 2
            );
            player.walkTime += deltaTime;
        }

        const reachedLeftEdge = player.x <= playerSize / 2;
        const reachedRightEdge = player.x >= scene.width - playerSize / 2;

        if (currentArea === 'inside') {
            if (direction < 0 && reachedLeftEdge) {
                setArea('outside', scenes.outside.entry.x);
                return;
            }

            if (direction > 0 && reachedRightEdge) {
                setArea('gym');
                return;
            }
        }

        if (currentArea === 'gym' && direction < 0 && reachedLeftEdge) {
            setArea('inside', scenes.inside.width - scenes.inside.playerSize / 2 - 110);
            return;
        }

        if (currentArea === 'classroom' && direction < 0 && reachedLeftEdge) {
            setArea('inside', scenes.inside.classroomDoor.x - 130);
            return;
        }

        if (currentArea === 'vault') {
            if (direction < 0 && reachedLeftEdge) {
                travelVault('left');
                return;
            }

            if (direction > 0 && reachedRightEdge) {
                travelVault('right');
                return;
            }
        }

        if (jumpRequested && player.grounded) {
            player.velocityY = JUMP_SPEED;
            player.grounded = false;
        }
        jumpRequested = false;

        if (!player.grounded) {
            player.velocityY -= GRAVITY * (deltaTime / 1000);
            player.height += player.velocityY * (deltaTime / 1000);
            if (player.height <= 0) {
                player.height = 0;
                player.velocityY = 0;
                player.grounded = true;
            }
        }

        updateSceneLabel();
        updateSprite();
        updateCamera();
    }

    function animate(now) {
        const deltaTime = Math.min(now - previousTime, 50);
        previousTime = now;
        update(deltaTime);
        requestAnimationFrame(animate);
    }

    function setKey(event, pressed) {
        const key = event.key.toLowerCase();
        const movementKeys = ['arrowleft', 'arrowright', 'a', 'd'];
        const entryKeys = ['arrowup', 'w'];
        const jumpKeys = [' '];

        if (cutsceneActive || memoryTransitionActive) {
            if (movementKeys.includes(key) || entryKeys.includes(key) || jumpKeys.includes(key) || key === 'enter' || key === 'escape') {
                event.preventDefault();
            }
            return;
        }

        if (phoneMessageOpen && pressed && !event.repeat && (key === 'enter' || key === 'escape' || jumpKeys.includes(key))) {
            event.preventDefault();
            continuePhoneMessage();
            return;
        }

        if (storyDialogueOpen && pressed && !event.repeat && (key === 'enter' || key === 'escape' || jumpKeys.includes(key))) {
            event.preventDefault();
            continueStoryDialogue();
            return;
        }

        if (!movementKeys.includes(key) && !entryKeys.includes(key) && !jumpKeys.includes(key)) return;
        event.preventDefault();

        if (introPhase !== 'complete') return;

        if (entryKeys.includes(key)) {
            if (pressed && !event.repeat) trySceneAction();
            return;
        }

        if (jumpKeys.includes(key)) {
            if (pressed && !event.repeat && player.grounded) jumpRequested = true;
            return;
        }

        if (pressed) heldKeys.add(key);
        else heldKeys.delete(key);
    }

    function bindControls() {
        window.addEventListener('keydown', (event) => setKey(event, true));
        window.addEventListener('keyup', (event) => setKey(event, false));
        window.addEventListener('blur', () => {
            heldKeys.clear();
            jumpRequested = false;
        });
        viewport.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            viewport.focus({ preventScroll: true });
        });
        gameShell.addEventListener('contextmenu', (event) => event.preventDefault());
        gameShell.addEventListener('selectstart', (event) => event.preventDefault());
        introDialogueContinue.addEventListener('click', continueStoryDialogue);
        phoneMessageContinue.addEventListener('click', continuePhoneMessage);

        document.querySelectorAll('[data-direction]').forEach((button) => {
            const direction = button.dataset.direction;
            button.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                button.setPointerCapture?.(event.pointerId);

                if (introPhase !== 'complete' || storyDialogueOpen || phoneMessageOpen || cutsceneActive || memoryTransitionActive) return;

                if (direction === 'enter') trySceneAction();
                else heldKeys.add(`arrow${direction}`);
            });
            ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
                button.addEventListener(eventName, () => {
                    if (direction !== 'enter') heldKeys.delete(`arrow${direction}`);
                });
            });
        });
    }

    bindControls();
    setArea(requestedArea);
    if (Number.isFinite(requestedPosition)) {
        const playerSize = currentScene().playerSize;
        player.x = clamp(requestedPosition, playerSize / 2, currentScene().width - playerSize / 2);
        updateSceneLabel();
        updateSprite();
        updateCamera();
    }
    requestAnimationFrame(animate);
})();
