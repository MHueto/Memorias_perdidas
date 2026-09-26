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
            floorY: 538,
            playerSize: DEFAULT_PLAYER_SIZE,
            startX: 130,
            label: 'Quadra da escola'
        },
        classroom: {
            width: COMPACT_ROOM_WIDTH,
            floorY: 547,
            playerSize: DEFAULT_PLAYER_SIZE,
            startX: 145,
            label: 'Sala de aula'
        }
    };

    const viewport = document.querySelector('#gameViewport');
    const gameShell = document.querySelector('.game-shell');
    const world = document.querySelector('#schoolWorld');
    const renato = document.querySelector('#renato');
    const playerState = document.querySelector('#playerState');
    const explorationStatus = document.querySelector('#explorationStatus');
    const introDialogue = document.querySelector('#introDialogue');
    const introDialogueContinue = document.querySelector('#introDialogueContinue');
    const phoneMessage = document.querySelector('#phoneMessage');
    const phoneMessageText = document.querySelector('#phoneMessageText');
    const phoneMessageContinue = document.querySelector('#phoneMessageContinue');
    const travelCutscene = document.querySelector('#travelCutscene');

    const RENATO_SPRITE_SHEET = 'assets/images/renato/renato-walk-spritesheet-v2.png';
    const sprites = {
        right: [
            { id: 'right-idle', position: '0% 100%' },
            { id: 'right-step-passing-a', position: '25% 100%' },
            { id: 'right-step-left', position: '50% 100%' },
            { id: 'right-step-passing-b', position: '75% 100%' },
            { id: 'right-step-right', position: '100% 100%' }
        ],
        left: [
            { id: 'left-idle', position: '0% 0%' },
            { id: 'left-step-passing-a', position: '25% 0%' },
            { id: 'left-step-left', position: '50% 0%' },
            { id: 'left-step-passing-b', position: '75% 0%' },
            { id: 'left-step-right', position: '100% 0%' }
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
    let introPhase = shouldPlayIntro ? (prefersReducedMotion ? 'dialogue-pending' : 'walking-away') : 'complete';
    let introWalkTime = 0;
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

    // URLs antigos de teste podiam abrir diretamente uma sala. O jogo sempre
    // começa na entrada; os parâmetros debugArea/debugPosition ficam reservados
    // apenas para testes técnicos.
    if (testParameters.has('area') || testParameters.has('position')) {
        window.history.replaceState({}, '', window.location.pathname);
    }

    const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
    const currentScene = () => scenes[currentArea];

    function getHorizontalMovement() {
        let direction = 0;
        if (heldKeys.has('arrowleft') || heldKeys.has('a')) direction -= 1;
        if (heldKeys.has('arrowright') || heldKeys.has('d')) direction += 1;
        return direction;
    }

    function showIntroDialogue() {
        introPhase = 'dialogue';
        player.moving = false;
        heldKeys.clear();
        jumpRequested = false;
        introDialogue.hidden = false;
        introDialogueContinue.focus({ preventScroll: true });
    }

    function closeIntroDialogue() {
        if (introPhase !== 'dialogue') return;
        introPhase = 'complete';
        introDialogue.hidden = true;
        viewport.focus({ preventScroll: true });
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
        cutsceneRevealTimer = window.setTimeout(() => travelCutscene.classList.remove('is-black'), 1100);
        cutsceneEndTimer = window.setTimeout(() => travelCutscene.classList.add('is-black'), 6100);
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
        const frameIndex = player.moving && player.grounded ? 1 + (Math.floor(player.walkTime / 105) % 4) : 0;
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

        if (cutsceneActive) {
            playerState.textContent = 'Renato está a caminho do Cofre das Memórias';
        } else if (phoneMessageOpen) {
            playerState.textContent = 'Renato está lendo uma mensagem';
        } else if (phoneCollected) {
            playerState.textContent = 'Renato encontrou o celular';
        } else if (introPhase === 'dialogue') {
            playerState.textContent = 'Renato lembrou do celular';
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

    function setArea(nextArea, spawnX = scenes[nextArea].startX) {
        currentArea = nextArea;
        const scene = currentScene();
        player.x = spawnX;
        player.height = 0;
        player.velocityY = 0;
        player.grounded = true;
        player.moving = false;
        heldKeys.clear();
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

    function trySceneAction() {
        if (introPhase !== 'complete' || phoneMessageOpen || cutsceneActive) return;
        const scene = currentScene();

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
    if (introPhase === 'dialogue-pending') {
        showIntroDialogue();
        updateSceneLabel();
        updateSprite();
        updateCamera();
        return;
    }

        const scene = currentScene();
        const playerSize = scene.playerSize;

        if (introPhase === 'walking-away') {
            const introDirection = -1;
            player.moving = true;
            player.facing = 'left';
            player.x = clamp(
                player.x + introDirection * SPEED * (deltaTime / 1000),
                playerSize / 2,
                scene.width - playerSize / 2
            );
            player.walkTime += deltaTime;
            introWalkTime += deltaTime;

            if (introWalkTime >= 700) showIntroDialogue();

            updateSceneLabel();
            updateSprite();
            updateCamera();
            return;
        }

        if (introPhase === 'dialogue') {
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

        if (cutsceneActive) {
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

        if (cutsceneActive) {
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

    if (introPhase === 'dialogue' && pressed && !event.repeat && (key === 'enter' || key === 'escape' || jumpKeys.includes(key))) {
            event.preventDefault();
            closeIntroDialogue();
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
        introDialogueContinue.addEventListener('click', closeIntroDialogue);
        phoneMessageContinue.addEventListener('click', continuePhoneMessage);

        document.querySelectorAll('[data-direction]').forEach((button) => {
            const direction = button.dataset.direction;
            button.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                button.setPointerCapture?.(event.pointerId);

                if (introPhase !== 'complete' || phoneMessageOpen || cutsceneActive) return;

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
