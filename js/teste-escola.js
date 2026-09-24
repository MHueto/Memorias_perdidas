(() => {
    const WORLD = { width: 3344, height: 1882 };
    const PLAYER_SIZE = 72;
    const CAMERA_ZOOM = 1.85;
    const MAP_TILES = {
        sizeInSourcePixels: 64,
        scale: 2,
        columns: 27,
        rows: 15,
        sourceWidth: 1672,
        sourceHeight: 941,
        folder: 'assets/images/mapa_escola_partes'
    };
    const NAVIGATION = {
        // Malha estável para manter cada porta desenhada como uma transição única.
        cellSize: 4,
        collisionImage: 'assets/images/cotil-mapa-marcacoes.png'
    };
    const FIXED_DOOR_TRANSITIONS = [
        {
            name: 'laboratorio-pc-norte',
            anchor: { x: 170, y: 252 },
            axis: 'y',
            negativeExit: { x: 170, y: 205 },
            positiveExit: { x: 170, y: 305 }
        },
        {
            name: 'laboratorio-pc-leste',
            anchor: { x: 329, y: 335 },
            axis: 'x',
            negativeExit: { x: 292, y: 335 },
            positiveExit: { x: 365, y: 335 }
        }
    ];

    const viewport = document.querySelector('#gameViewport');
    const world = document.querySelector('#schoolWorld');
    const mapTiles = document.querySelector('#mapTiles');
    const areaVeil = document.querySelector('#areaVeil');
    const awningLayer = document.querySelector('#awningLayer');
    const edric = document.querySelector('#edric');
    const playerState = document.querySelector('#playerState');
    const explorationStatus = document.querySelector('#explorationStatus');

    const sprites = {
        down: [
            'assets/images/edric-topdown-frames/edric-baixo-parado.png',
            'assets/images/edric-topdown-frames/edric-baixo-passo-esquerdo.png',
            'assets/images/edric-topdown-frames/edric-baixo-passo-direito.png'
        ],
        up: [
            'assets/images/edric-topdown-frames/edric-cima-parado.png',
            'assets/images/edric-topdown-frames/edric-cima-passo-esquerdo.png',
            'assets/images/edric-topdown-frames/edric-cima-passo-direito.png'
        ],
        left: [
            'assets/images/edric-topdown-frames/edric-esquerda-parado.png',
            'assets/images/edric-topdown-frames/edric-esquerda-passo-esquerdo.png',
            'assets/images/edric-topdown-frames/edric-esquerda-passo-direito.png'
        ],
        right: [
            'assets/images/edric-topdown-frames/edric-direita-parado.png',
            'assets/images/edric-topdown-frames/edric-direita-passo-esquerdo.png',
            'assets/images/edric-topdown-frames/edric-direita-passo-direito.png'
        ]
    };

    const directionNames = { down: 'baixo', up: 'cima', left: 'esquerda', right: 'direita' };
    const player = {
        // Caminho ao lado da árvore, acima do portão principal.
        x: 820,
        y: 1320,
        facing: 'up',
        moving: false,
        walkTime: 0,
        teleportCooldownUntil: 0
    };
    const navigation = {
        ready: false,
        columns: 0,
        rows: 0,
        cells: [],
        reachable: null,
        doors: [],
        openedDoors: new Set(),
        doorCount: 0
    };
    const heldKeys = new Set();
    const renderedTiles = new Map();
    let previousTime = performance.now();
    let displayedSprite = '';

    const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

    function isCollisionBlue(red, green, blue) {
        return red < 90 && green > 70 && blue > 170 && blue > green + 45;
    }

    function isDoorRed(red, green, blue) {
        return red > 180 && green < 105 && blue < 125 && red > green * 1.7;
    }

    function isAwningOrange(red, green, blue) {
        return red > 225 && green > 45 && green < 155 && blue < 95;
    }

    function loadImage(source) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Não foi possível carregar ${source}`));
            image.src = source;
        });
    }

    function makeTemporaryCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    function getAwningTilePositions(markerData) {
        const positions = new Map();
        for (let y = 0; y < MAP_TILES.sourceHeight; y += 1) {
            for (let x = 0; x < MAP_TILES.sourceWidth; x += 1) {
                const offset = (y * MAP_TILES.sourceWidth + x) * 4;
                if (!isAwningOrange(markerData.data[offset], markerData.data[offset + 1], markerData.data[offset + 2])) continue;
                const column = Math.floor(x / MAP_TILES.sizeInSourcePixels);
                const row = Math.floor(y / MAP_TILES.sizeInSourcePixels);
                positions.set(`${column}:${row}`, { column, row });
            }
        }
        return [...positions.values()];
    }

    async function prepareAwningLayer(markerData) {
        awningLayer.width = MAP_TILES.sourceWidth;
        awningLayer.height = MAP_TILES.sourceHeight;
        const sourceCanvas = makeTemporaryCanvas(MAP_TILES.sourceWidth, MAP_TILES.sourceHeight);
        const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
        const tilePositions = getAwningTilePositions(markerData);

        await Promise.all(tilePositions.map(async ({ column, row }) => {
            const tile = await loadImage(`${MAP_TILES.folder}/${tileFileName(row, column)}`);
            sourceContext.drawImage(
                tile,
                column * MAP_TILES.sizeInSourcePixels,
                row * MAP_TILES.sizeInSourcePixels
            );
        }));

        const originalData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);

        for (let offset = 0; offset < originalData.data.length; offset += 4) {
            const red = markerData.data[offset];
            const green = markerData.data[offset + 1];
            const blue = markerData.data[offset + 2];
            if (!isAwningOrange(red, green, blue)) {
                originalData.data[offset + 3] = 0;
            }
        }

        const context = awningLayer.getContext('2d');
        context.clearRect(0, 0, awningLayer.width, awningLayer.height);
        context.putImageData(originalData, 0, 0);
    }

    function cellIndex(column, row) {
        return row * navigation.columns + column;
    }

    function isValidCell(column, row) {
        return column >= 0 && column < navigation.columns && row >= 0 && row < navigation.rows;
    }

    function getCellAtWorldPosition(worldX, worldY) {
        const column = Math.floor((worldX / MAP_TILES.scale) / NAVIGATION.cellSize);
        const row = Math.floor((worldY / MAP_TILES.scale) / NAVIGATION.cellSize);
        if (!isValidCell(column, row)) return null;
        return navigation.cells[cellIndex(column, row)];
    }

    function isCellBlocked(cell) {
        if (!cell) return true;
        // Portas permanecem sólidas: o contato dispara a travessia instantânea.
        if (cell.doorId !== -1) return true;
        return cell.hasBlue;
    }

    function buildDoorComponents() {
        let nextDoorId = 0;
        navigation.doors = [];
        navigation.cells.forEach((cell) => { cell.doorId = -1; });

        for (let row = 0; row < navigation.rows; row += 1) {
            for (let column = 0; column < navigation.columns; column += 1) {
                const start = navigation.cells[cellIndex(column, row)];
                if (!start.hasRed || start.doorId !== -1) continue;

                const queue = [start];
                start.doorId = nextDoorId;

                for (let index = 0; index < queue.length; index += 1) {
                    const current = queue[index];
                    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
                        for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
                            if (columnOffset === 0 && rowOffset === 0) continue;
                            const nextColumn = current.column + columnOffset;
                            const nextRow = current.row + rowOffset;
                            if (!isValidCell(nextColumn, nextRow)) continue;
                            const next = navigation.cells[cellIndex(nextColumn, nextRow)];
                            if (!next.hasRed || next.doorId !== -1) continue;
                            next.doorId = nextDoorId;
                            queue.push(next);
                        }
                    }
                }

                const columns = queue.map((cell) => cell.column);
                const rows = queue.map((cell) => cell.row);
                const minColumn = Math.min(...columns);
                const maxColumn = Math.max(...columns);
                const minRow = Math.min(...rows);
                const maxRow = Math.max(...rows);
                navigation.doors[nextDoorId] = {
                    id: nextDoorId,
                    minX: minColumn * NAVIGATION.cellSize,
                    maxX: (maxColumn + 1) * NAVIGATION.cellSize,
                    minY: minRow * NAVIGATION.cellSize,
                    maxY: (maxRow + 1) * NAVIGATION.cellSize,
                    centerX: ((minColumn + maxColumn + 1) / 2) * NAVIGATION.cellSize,
                    centerY: ((minRow + maxRow + 1) / 2) * NAVIGATION.cellSize,
                    width: (maxColumn - minColumn + 1) * NAVIGATION.cellSize,
                    height: (maxRow - minRow + 1) * NAVIGATION.cellSize
                };
                nextDoorId += 1;
            }
        }
        navigation.doorCount = nextDoorId;
        configureFixedDoorTransitions();
    }

    function configureFixedDoorTransitions() {
        FIXED_DOOR_TRANSITIONS.forEach((transition) => {
            let closestDoor = null;
            let shortestDistance = Infinity;
            navigation.doors.forEach((door) => {
                const distance = Math.hypot(door.centerX - transition.anchor.x, door.centerY - transition.anchor.y);
                if (distance >= shortestDistance) return;
                closestDoor = door;
                shortestDistance = distance;
            });
            if (closestDoor && shortestDistance < 90) {
                closestDoor.fixedTransition = transition;
            }
        });
    }

    function shrinkFurnitureHitboxes() {
        const visited = new Uint8Array(navigation.cells.length);
        const maximumFurnitureWidth = Math.ceil(64 / NAVIGATION.cellSize);
        const maximumFurnitureHeight = Math.ceil(56 / NAVIGATION.cellSize);

        for (let row = 0; row < navigation.rows; row += 1) {
            for (let column = 0; column < navigation.columns; column += 1) {
                const startIndex = cellIndex(column, row);
                const start = navigation.cells[startIndex];
                if (visited[startIndex] || !start.hasBlue) continue;

                const queue = [startIndex];
                visited[startIndex] = 1;
                let minColumn = column;
                let maxColumn = column;
                let minRow = row;
                let maxRow = row;

                for (let index = 0; index < queue.length; index += 1) {
                    const currentIndex = queue[index];
                    const current = navigation.cells[currentIndex];
                    minColumn = Math.min(minColumn, current.column);
                    maxColumn = Math.max(maxColumn, current.column);
                    minRow = Math.min(minRow, current.row);
                    maxRow = Math.max(maxRow, current.row);

                    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
                        for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
                            const nextColumn = current.column + columnOffset;
                            const nextRow = current.row + rowOffset;
                            if (!isValidCell(nextColumn, nextRow)) continue;
                            const nextIndex = cellIndex(nextColumn, nextRow);
                            const next = navigation.cells[nextIndex];
                            if (visited[nextIndex] || !next.hasBlue) continue;
                            visited[nextIndex] = 1;
                            queue.push(nextIndex);
                        }
                    }
                }

                const width = maxColumn - minColumn + 1;
                const height = maxRow - minRow + 1;
                const isSmallFurniture = queue.length >= 4
                    && width <= maximumFurnitureWidth
                    && height <= maximumFurnitureHeight;
                if (!isSmallFurniture) continue;

                // Troca o contorno fechado da carteira por um núcleo compacto.
                // Assim ela continua sólida, mas não cria uma gaiola ao redor do Edric.
                queue.forEach((index) => { navigation.cells[index].hasBlue = false; });
                const coreWidth = Math.max(1, Math.round(width * 0.38));
                const coreHeight = Math.max(1, Math.round(height * 0.38));
                const coreStartColumn = Math.round((minColumn + maxColumn - coreWidth + 1) / 2);
                const coreStartRow = Math.round((minRow + maxRow - coreHeight + 1) / 2);

                for (let coreRow = coreStartRow; coreRow < coreStartRow + coreHeight; coreRow += 1) {
                    for (let coreColumn = coreStartColumn; coreColumn < coreStartColumn + coreWidth; coreColumn += 1) {
                        if (!isValidCell(coreColumn, coreRow)) continue;
                        const coreIndex = cellIndex(coreColumn, coreRow);
                        navigation.cells[coreIndex].hasBlue = true;
                        visited[coreIndex] = 1;
                    }
                }
            }
        }
    }

    function buildNavigationGrid(markerData) {
        navigation.columns = Math.ceil(MAP_TILES.sourceWidth / NAVIGATION.cellSize);
        navigation.rows = Math.ceil(MAP_TILES.sourceHeight / NAVIGATION.cellSize);
        navigation.cells = [];

        for (let row = 0; row < navigation.rows; row += 1) {
            for (let column = 0; column < navigation.columns; column += 1) {
                let bluePixelCount = 0;
                let hasRed = false;
                const startX = column * NAVIGATION.cellSize;
                const startY = row * NAVIGATION.cellSize;
                const endX = Math.min(startX + NAVIGATION.cellSize, MAP_TILES.sourceWidth);
                const endY = Math.min(startY + NAVIGATION.cellSize, MAP_TILES.sourceHeight);

                for (let y = startY; y < endY; y += 1) {
                    for (let x = startX; x < endX; x += 1) {
                        const offset = (y * MAP_TILES.sourceWidth + x) * 4;
                        const red = markerData.data[offset];
                        const green = markerData.data[offset + 1];
                        const blue = markerData.data[offset + 2];
                        if (isCollisionBlue(red, green, blue)) bluePixelCount += 1;
                        if (isDoorRed(red, green, blue)) hasRed = true;
                    }
                }
                // Ignora apenas pequenos pixels suavizados nas bordas do rabisco azul.
                navigation.cells.push({ column, row, hasBlue: bluePixelCount >= 2, hasRed, doorId: -1 });
            }
        }
        buildDoorComponents();
        shrinkFurnitureHitboxes();
    }

    function findReachableStartingCell() {
        const baseColumn = Math.floor((player.x / MAP_TILES.scale) / NAVIGATION.cellSize);
        const baseRow = Math.floor((player.y / MAP_TILES.scale) / NAVIGATION.cellSize);
        for (let radius = 0; radius < 10; radius += 1) {
            for (let row = baseRow - radius; row <= baseRow + radius; row += 1) {
                for (let column = baseColumn - radius; column <= baseColumn + radius; column += 1) {
                    if (!isValidCell(column, row)) continue;
                    const cell = navigation.cells[cellIndex(column, row)];
                    if (!isCellBlocked(cell)) return cell;
                }
            }
        }
        return null;
    }

    function refreshReachableArea() {
        const start = findReachableStartingCell();
        navigation.reachable = new Uint8Array(navigation.cells.length);
        if (!start) return;

        const queue = [start];
        navigation.reachable[cellIndex(start.column, start.row)] = 1;
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];

        for (let index = 0; index < queue.length; index += 1) {
            const current = queue[index];
            directions.forEach(([columnOffset, rowOffset]) => {
                const column = current.column + columnOffset;
                const row = current.row + rowOffset;
                if (!isValidCell(column, row)) return;
                const nextIndex = cellIndex(column, row);
                if (navigation.reachable[nextIndex]) return;
                const next = navigation.cells[nextIndex];
                if (isCellBlocked(next)) return;
                navigation.reachable[nextIndex] = 1;
                queue.push(next);
            });
        }
        drawReachableArea();
        updateRenderedTiles();
    }

    function drawReachableArea() {
        areaVeil.width = MAP_TILES.sourceWidth;
        areaVeil.height = MAP_TILES.sourceHeight;
        const context = areaVeil.getContext('2d');
        context.fillStyle = '#020712';
        context.fillRect(0, 0, areaVeil.width, areaVeil.height);
        context.globalCompositeOperation = 'destination-out';

        for (let row = 0; row < navigation.rows; row += 1) {
            let startColumn = -1;
            for (let column = 0; column <= navigation.columns; column += 1) {
                const reachable = column < navigation.columns
                    && navigation.reachable[cellIndex(column, row)] === 1;
                if (reachable && startColumn === -1) startColumn = column;
                if ((!reachable || column === navigation.columns) && startColumn !== -1) {
                    context.fillRect(
                        startColumn * NAVIGATION.cellSize,
                        row * NAVIGATION.cellSize,
                        (column - startColumn) * NAVIGATION.cellSize,
                        NAVIGATION.cellSize
                    );
                    startColumn = -1;
                }
            }
        }
        context.globalCompositeOperation = 'source-over';
    }

    function tileFileName(row, column) {
        return `bloco-${String(row + 1).padStart(2, '0')}-${String(column + 1).padStart(2, '0')}.png`;
    }

    function tileTouchesReachableArea(column, row) {
        const startColumn = Math.floor((column * MAP_TILES.sizeInSourcePixels) / NAVIGATION.cellSize);
        const startRow = Math.floor((row * MAP_TILES.sizeInSourcePixels) / NAVIGATION.cellSize);
        const endColumn = Math.min(
            navigation.columns,
            Math.ceil(((column + 1) * MAP_TILES.sizeInSourcePixels) / NAVIGATION.cellSize)
        );
        const endRow = Math.min(
            navigation.rows,
            Math.ceil(((row + 1) * MAP_TILES.sizeInSourcePixels) / NAVIGATION.cellSize)
        );
        for (let checkRow = startRow; checkRow < endRow; checkRow += 1) {
            for (let checkColumn = startColumn; checkColumn < endColumn; checkColumn += 1) {
                if (navigation.reachable[cellIndex(checkColumn, checkRow)]) return true;
            }
        }
        return false;
    }

    function updateRenderedTiles() {
        const wantedTiles = new Set();
        for (let row = 0; row < MAP_TILES.rows; row += 1) {
            for (let column = 0; column < MAP_TILES.columns; column += 1) {
                const key = `${column}:${row}`;
                wantedTiles.add(key);
                if (renderedTiles.has(key)) continue;

                const tile = document.createElement('img');
                tile.className = 'map-tile';
                tile.alt = '';
                tile.draggable = false;
                tile.decoding = 'async';
                tile.src = `${MAP_TILES.folder}/${tileFileName(row, column)}`;
                tile.style.left = `${column * MAP_TILES.sizeInSourcePixels * MAP_TILES.scale}px`;
                tile.style.top = `${row * MAP_TILES.sizeInSourcePixels * MAP_TILES.scale}px`;
                tile.style.width = `${MAP_TILES.sizeInSourcePixels * MAP_TILES.scale}px`;
                tile.style.height = `${MAP_TILES.sizeInSourcePixels * MAP_TILES.scale}px`;
                mapTiles.append(tile);
                renderedTiles.set(key, tile);
            }
        }

        renderedTiles.forEach((tile, key) => {
            if (wantedTiles.has(key)) return;
            tile.remove();
            renderedTiles.delete(key);
        });
    }

    function updateExplorationStatus() {
        explorationStatus.textContent = `${navigation.openedDoors.size} / ${navigation.doorCount} portas abertas`;
    }

    function getCollisionSamples(x, y) {
        const radius = PLAYER_SIZE * 0.13;
        return [
            [0, 0], [radius, 0], [-radius, 0], [0, radius], [0, -radius],
            [radius * 0.72, radius * 0.72], [radius * 0.72, -radius * 0.72],
            [-radius * 0.72, radius * 0.72], [-radius * 0.72, -radius * 0.72]
        ].map(([offsetX, offsetY]) => getCellAtWorldPosition(x + offsetX, y + offsetY));
    }

    function canStandAt(x, y) {
        return getCollisionSamples(x, y).every((cell) => !isCellBlocked(cell));
    }

    function getDoorContactAt(nextX, nextY, movement) {
        if (performance.now() < player.teleportCooldownUntil) return null;

        const currentSourceX = player.x / MAP_TILES.scale;
        const currentSourceY = player.y / MAP_TILES.scale;
        const nextSourceX = nextX / MAP_TILES.scale;
        const nextSourceY = nextY / MAP_TILES.scale;
        const horizontal = Math.abs(movement.x) > Math.abs(movement.y);
        const direction = horizontal ? Math.sign(movement.x) : Math.sign(movement.y);
        if (direction === 0) return null;

        const currentAlong = horizontal ? currentSourceX : currentSourceY;
        const nextAlong = horizontal ? nextSourceX : nextSourceY;
        const nextLateral = horizontal ? nextSourceY : nextSourceX;
        const contactRange = (PLAYER_SIZE * 0.24) / MAP_TILES.scale;
        let closestDoor = null;
        let closestFaceDistance = Infinity;

        navigation.doors.forEach((door) => {
            const nearFace = horizontal
                ? (direction > 0 ? door.minX : door.maxX)
                : (direction > 0 ? door.minY : door.maxY);
            const lateralMinimum = horizontal ? door.minY : door.minX;
            const lateralMaximum = horizontal ? door.maxY : door.maxX;
            const isAlignedWithDoor = nextLateral >= lateralMinimum - contactRange
                && nextLateral <= lateralMaximum + contactRange;
            const isApproachingFace = direction > 0
                ? currentAlong <= nearFace + contactRange && nextAlong >= nearFace - contactRange
                : currentAlong >= nearFace - contactRange && nextAlong <= nearFace + contactRange;
            if (!isAlignedWithDoor || !isApproachingFace) return;

            const faceDistance = Math.abs(nextAlong - nearFace);
            if (faceDistance >= closestFaceDistance) return;
            closestDoor = door;
            closestFaceDistance = faceDistance;
        });

        return closestDoor?.id ?? null;
    }

    function teleportThroughDoor(doorId, movement) {
        const door = navigation.doors[doorId];
        if (!door) return false;

        if (door.fixedTransition) {
            const fixed = door.fixedTransition;
            const axisMovement = fixed.axis === 'x' ? movement.x : movement.y;
            const exit = axisMovement > 0 ? fixed.positiveExit : fixed.negativeExit;
            const destinationX = exit.x * MAP_TILES.scale;
            const destinationY = exit.y * MAP_TILES.scale;
            if (canStandAt(destinationX, destinationY)) {
                player.x = destinationX;
                player.y = destinationY;
                player.teleportCooldownUntil = performance.now() + 260;
                if (!navigation.openedDoors.has(doorId)) {
                    navigation.openedDoors.add(doorId);
                    updateExplorationStatus();
                }
                return true;
            }
        }

        const horizontal = Math.abs(movement.x) > Math.abs(movement.y);
        const direction = horizontal
            ? { x: Math.sign(movement.x), y: 0 }
            : { x: 0, y: Math.sign(movement.y) };
        const doorDepth = (horizontal ? door.width : door.height) * MAP_TILES.scale;
        const currentAlong = horizontal ? player.x : player.y;
        const exitEdge = horizontal
            ? (direction.x > 0 ? door.maxX : door.minX) * MAP_TILES.scale
            : (direction.y > 0 ? door.maxY : door.minY) * MAP_TILES.scale;
        const safeDistance = Math.abs(exitEdge - currentAlong) + doorDepth * 0.08 + PLAYER_SIZE * 0.34;

        for (let step = 0; step < 10; step += 1) {
            const distance = safeDistance + step * 6;
            const destinationX = clamp(
                player.x + direction.x * distance,
                PLAYER_SIZE / 2,
                WORLD.width - PLAYER_SIZE / 2
            );
            const destinationY = clamp(
                player.y + direction.y * distance,
                PLAYER_SIZE / 2,
                WORLD.height - PLAYER_SIZE / 2
            );
            if (!canStandAt(destinationX, destinationY)) continue;

            player.x = destinationX;
            player.y = destinationY;
            player.teleportCooldownUntil = performance.now() + 260;
            if (!navigation.openedDoors.has(doorId)) {
                navigation.openedDoors.add(doorId);
                updateExplorationStatus();
            }
            return true;
        }
        return false;
    }

    function getMovement() {
        const movement = { x: 0, y: 0 };
        if (heldKeys.has('arrowup') || heldKeys.has('w')) movement.y -= 1;
        if (heldKeys.has('arrowdown') || heldKeys.has('s')) movement.y += 1;
        if (heldKeys.has('arrowleft') || heldKeys.has('a')) movement.x -= 1;
        if (heldKeys.has('arrowright') || heldKeys.has('d')) movement.x += 1;
        if (movement.x !== 0 && movement.y !== 0) {
            movement.x *= Math.SQRT1_2;
            movement.y *= Math.SQRT1_2;
        }
        return movement;
    }

    function updateFacing(movement) {
        if (Math.abs(movement.x) > Math.abs(movement.y)) {
            player.facing = movement.x < 0 ? 'left' : 'right';
        } else if (movement.y !== 0) {
            player.facing = movement.y < 0 ? 'up' : 'down';
        }
    }

    function updateSprite() {
        const frames = sprites[player.facing];
        const frameIndex = player.moving ? 1 + (Math.floor(player.walkTime / 125) % 2) : 0;
        const sprite = frames[frameIndex];
        if (sprite !== displayedSprite) {
            edric.style.backgroundImage = `url("${sprite}")`;
            displayedSprite = sprite;
        }
        edric.style.transform = `translate(${Math.round(player.x - PLAYER_SIZE / 2)}px, ${Math.round(player.y - PLAYER_SIZE / 2)}px)`;
        playerState.textContent = player.moving
            ? `Edric andando para ${directionNames[player.facing]}`
            : `Edric parado — olhando para ${directionNames[player.facing]}`;
    }

    function updateCamera() {
        const viewportWidth = viewport.clientWidth;
        const viewportHeight = viewport.clientHeight;
        const minX = viewportWidth - WORLD.width * CAMERA_ZOOM;
        const minY = viewportHeight - WORLD.height * CAMERA_ZOOM;
        const cameraX = clamp(viewportWidth / 2 - player.x * CAMERA_ZOOM, minX, 0);
        const cameraY = clamp(viewportHeight / 2 - player.y * CAMERA_ZOOM, minY, 0);
        world.style.transform = `translate(${Math.round(cameraX)}px, ${Math.round(cameraY)}px) scale(${CAMERA_ZOOM})`;
    }

    function update(deltaTime) {
        const movement = getMovement();
        player.moving = movement.x !== 0 || movement.y !== 0;

        if (player.moving && navigation.ready) {
            updateFacing(movement);
            const isRunning = heldKeys.has('shift');
            const distance = (isRunning ? 355 : 220) * (deltaTime / 1000);
            const nextX = clamp(player.x + movement.x * distance, PLAYER_SIZE / 2, WORLD.width - PLAYER_SIZE / 2);
            const nextY = clamp(player.y + movement.y * distance, PLAYER_SIZE / 2, WORLD.height - PLAYER_SIZE / 2);

            const doorId = getDoorContactAt(nextX, nextY, movement);
            if (doorId !== null) {
                teleportThroughDoor(doorId, movement);
            } else {
                if (canStandAt(nextX, player.y)) player.x = nextX;
                if (canStandAt(player.x, nextY)) player.y = nextY;
            }
            player.walkTime += deltaTime;
        }

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
        const controls = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'shift'];
        if (!controls.includes(key)) return;
        event.preventDefault();
        if (pressed) heldKeys.add(key);
        else heldKeys.delete(key);
    }

    function bindControls() {
        window.addEventListener('keydown', (event) => setKey(event, true));
        window.addEventListener('keyup', (event) => setKey(event, false));
        window.addEventListener('blur', () => heldKeys.clear());
        viewport.addEventListener('pointerdown', () => viewport.focus());

        document.querySelectorAll('[data-direction]').forEach((button) => {
            const key = `arrow${button.dataset.direction}`;
            button.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                heldKeys.add(key);
                button.setPointerCapture?.(event.pointerId);
            });
            ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
                button.addEventListener(eventName, () => heldKeys.delete(key));
            });
        });
    }

    async function initialiseMapRules() {
        try {
            const markerImage = await loadImage(NAVIGATION.collisionImage);
            const markerCanvas = makeTemporaryCanvas(MAP_TILES.sourceWidth, MAP_TILES.sourceHeight);
            const markerContext = markerCanvas.getContext('2d', { willReadFrequently: true });
            markerContext.drawImage(markerImage, 0, 0);
            const markerData = markerContext.getImageData(0, 0, markerCanvas.width, markerCanvas.height);

            buildNavigationGrid(markerData);
            await prepareAwningLayer(markerData);
            navigation.ready = true;
            updateRenderedTiles();
            updateExplorationStatus();
        } catch (error) {
            console.error(error);
            explorationStatus.textContent = 'Erro ao ler a marcação';
        }
    }

    bindControls();
    updateSprite();
    updateCamera();
    initialiseMapRules();
    requestAnimationFrame(animate);
})();
