(() => {
    const SAVE_KEY = 'memoriasPerdidasRomaV1';
    const PLAYER_SIZE = 90;
    const PLAYER_VERTICAL_OFFSET = 4;
    const SPEED = 270;
    const MEMORY_X = 1338;
    const MEMORY_Y = 274;
    const RENATO_SPRITE_SHEET = 'assets/images/renato/renato-walk-spritesheet-v4.png';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const areas = {
        city: { width: 2172, height: 724, floorY: 584, startX: 280, label: 'Entrada e mercado de Roma' },
        forum: { width: 2079, height: 756, floorY: 650, startX: 150, label: 'Foro Romano e Cúria' },
        colosseum: { width: 2079, height: 756, floorY: 666, startX: 150, label: 'Exterior do Coliseu' },
        arena: { width: 2079, height: 756, floorY: 708, startX: 240, label: 'Corredor de observação da arena' },
        artisans: { width:1536,height:768,floorY:604,startX:180,label:'Rua dos artesãos' },
        workshop: { width:1536,height:768,floorY:638,startX:180,label:'Oficina do artesão' },
        residential: { width:1536,height:768,floorY:578,startX:180,label:'Bairro residencial' },
        courtyard: { width:1536,height:768,floorY:636,startX:180,label:'Pátio da fonte' }
    };

    // Every doorway has an explicit destination and return position; no guessed room pairing.
    const portals = {
        city:[{x:500,to:'artisans',spawn:180,label:'RUA DOS ARTESÃOS'}],
        forum:[{x:1040,to:'residential',spawn:180,label:'BAIRRO RESIDENCIAL'}],
        artisans:[{x:960,to:'workshop',spawn:180,label:'OFICINA DO ARTESÃO'}],
        residential:[{x:1110,to:'courtyard',spawn:180,label:'PÁTIO DA FONTE'}],
        workshop:[{x:160,to:'artisans',spawn:960,label:'VOLTAR À RUA'}],
        courtyard:[{x:170,to:'residential',spawn:1110,label:'VOLTAR AO BAIRRO'}]
    };
    const exits = {
        city:{right:{to:'forum',spawn:120,label:'FORO'}},
        forum:{left:{to:'city',spawn:2032,label:'MERCADO'},right:{to:'colosseum',spawn:120,label:'COLISEU'}},
        colosseum:{left:{to:'forum',spawn:1939,label:'FORO'}},
        arena:{left:{to:'colosseum',spawn:1500,label:'SAÍDA'}},
        artisans:{left:{to:'city',spawn:500,label:'MERCADO'},right:{to:'residential',spawn:180,label:'BAIRRO'}},
        workshop:{left:{to:'artisans',spawn:960,label:'RUA DOS ARTESÃOS'}},
        residential:{left:{to:'forum',spawn:1040,label:'FORO'},right:{to:'artisans',spawn:1400,label:'RUA DOS ARTESÃOS',turnBack:true}},
        courtyard:{left:{to:'residential',spawn:1110,label:'BAIRRO'}}
    };

    const sprites = {
        right: ['0% 0%','14.2857% 0%','28.5714% 0%','42.8571% 0%','57.1429% 0%','71.4286% 0%','85.7143% 0%','100% 0%'],
        left: ['0% 100%','14.2857% 100%','28.5714% 100%','42.8571% 100%','57.1429% 100%','71.4286% 100%','85.7143% 100%','100% 100%']
    };

    const briefing = [
        { speaker: 'PEDRO NEVES', text: 'Renato, você atravessou a primeira memória instável. Esta é Roma, pouco antes de uma ruptura capaz de mudar tudo.' },
        { speaker: 'PEDRO NEVES', text: 'O fragmento perdido está dentro do Coliseu. Há um espetáculo em curso, e entrar na arena sem observar o ambiente seria perigoso.' },
        { speaker: 'PEDRO NEVES', text: 'Encontre um caminho seguro. Não tente resolver a memória à força: aqui, cada interferência deixa marcas.' },
        { speaker: 'RENATO', text: 'Vou entender o que está acontecendo no Coliseu antes de agir.' }
    ];
    const arenaWarning = [
        { speaker: 'RENATO', text: 'A memória está ali, mas os leões dominam a areia. Da grade eu consigo observar; entrar na jaula seria impossível.' },
        { speaker: 'PEDRO NEVES', text: 'Procure algo que possa mudar a atenção deles sem feri-los. A cidade costuma dar pistas para quem observa.' }
    ];
    const strawHint = [
        { speaker: 'TRABALHADOR', text: 'A carroça chegou cedo. Esta palha é para os animais e para limpar os estábulos depois do evento.' },
        { speaker: 'RENATO', text: 'Palha leve… talvez eu consiga montar alguma coisa que pareça um alvo de longe.' }
    ];
    const ropeHint = [
        { speaker: 'CORDEIRO', text: 'Esse laço é resistente o bastante para puxar cargas, mas não desperdice: ele sempre volta para quem souber lançar.' },
        { speaker: 'RENATO', text: 'É exatamente o que preciso para alcançar a memória sem entrar na areia.' }
    ];
    const senateBriefing = [
        { speaker: 'SENADOR LÚCIO', text: 'Você trouxe o fragmento? Ele expôs uma ordem que estava escondida entre os registros: retirar a guarda de pontos estratégicos.' },
        { speaker: 'SENADOR LÚCIO', text: 'Leve este despacho ao posto militar. A cidade precisa de uma decisão antes que os rumores se espalhem.' },
        { speaker: 'RENATO', text: 'Eu entrego. Mas essa ordem parece… instável.' }
    ];
    const militaryBriefing = [
        { speaker: 'COMANDANTE', text: 'Despacho recebido. A patrulha deixa os acessos e se concentra no Foro. Ninguém passa sem autorização.' },
        { speaker: 'RENATO', text: 'Espere, isso vai deixar outras ruas sem proteção!' },
        { speaker: 'COMANDANTE', text: 'A decisão do Senado já chegou tarde demais.' }
    ];
    const merchantBriefing = [
        { speaker: 'MERCADORA', text: 'Sem guardas nos acessos, todos ouviram que há saqueadores a caminho. As barracas estão fechando e as famílias estão fugindo.' },
        { speaker: 'RENATO', text: 'A ordem que entreguei começou isso… preciso voltar ao Senado.' }
    ];
    const fallBriefing = [
        { speaker: 'PEDRO NEVES', text: 'Renato, a memória reagiu às suas interferências. O despacho, a retirada da guarda e o pânico formaram uma cadeia que não existia antes.' },
        { speaker: 'RENATO', text: 'Eu queria consertar uma lembrança e empurrei Roma para o colapso.' },
        { speaker: 'PEDRO NEVES', text: 'Agora você entende o peso do Cofre. Recuperar um fragmento não basta: é preciso reconhecer o que foi alterado e o que você provocou.' }
    ];

    const viewport = document.querySelector('#romaViewport');
    const shell = document.querySelector('.roma-shell');
    const world = document.querySelector('#romaWorld');
    const renato = document.querySelector('#renatoRoma');
    const propsLayer = document.querySelector('#romaProps');
    const npcsLayer = document.querySelector('#romaNpcs');
    const actorsLayer = document.querySelector('#romaActors');
    const prompt = document.querySelector('#romaPrompt');
    const objective = document.querySelector('#romaObjective');
    const chapter = document.querySelector('#romaChapter');
    const inventory = document.querySelector('#inventory');
    const inventoryItems = document.querySelector('#inventoryItems');
    const toast = document.querySelector('#romaToast');
    const dialogue = document.querySelector('#romaDialogue');
    const dialogueSpeaker = document.querySelector('#romaSpeaker');
    const dialogueText = document.querySelector('#romaDialogueText');
    const dialogueContinue = document.querySelector('#romaDialogueContinue');
    const craftPanel = document.querySelector('#craftPanel');
    const craftDolls = document.querySelector('#craftDolls');
    const closeCraft = document.querySelector('#closeCraft');
    const endingPanel = document.querySelector('#endingPanel');
    const resetButton = document.querySelector('#romaReset');

    const parameters = new URLSearchParams(window.location.search);
    if (parameters.get('reset') === '1') {
        localStorage.removeItem(SAVE_KEY);
        parameters.delete('reset');
        history.replaceState(null, '', location.pathname + (parameters.size ? '?' + parameters : ''));
    }

    const defaultState = () => ({
        step: parameters.get('intro') === 'off' ? 'travelColosseum' : 'briefing',
        cityState: 1,
        area: 'city',
        x: areas.city.startX,
        items: { straw: false, dolls: false, rope: false, memory: false, dispatch: false },
        lionsDistracted: false,
        finished: false,
        visitedAreas: ['city'],
        discoveries: {}
    });

    let state;
    try { state = { ...defaultState(), ...JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') }; }
    catch { state = defaultState(); }
    state.items = { ...defaultState().items, ...(state.items || {}) };
    if (!areas[state.area]) { state.area = 'city'; state.x = areas.city.startX; }
    state.x=Number.isFinite(Number(state.x))?Math.min(areas[state.area].width-45,Math.max(45,Number(state.x))):areas[state.area].startX;
    state.discoveries={...(state.discoveries||{})};
    state.visitedAreas = [...new Set(['city', state.area, ...(Array.isArray(state.visitedAreas) ? state.visitedAreas.filter(key => areas[key]) : [])])];
    // Old saves can resume safely: a distraction is replayed, never restored halfway through a timer.
    if (state.step === 'lassoAim' && !state.items.rope) state.step = 'distract';
    state.lionsDistracted = state.step === 'lassoAim';

    const player = { x: state.x, facing: 'right', moving: false, walkTime: 0 };
    const heldKeys = new Set();
    let displayedSprite = '';
    let previousTime = performance.now();
    let dialogueOpen = false;
    let dialogueLines = [];
    let dialogueStep = 0;
    let dialogueOnClose = null;
    let craftOpen = false;
    let toastTimer = 0;
    let reticle = null;
    let lasso = null;
    let memoryNode = null;
    let lionNodes = [];
    let aimX = 0;
    let aimClock = 0;
    let lassoResolving = false;
    let npcActors = [];
    let lions = [];
    let dolls = [];
    let effects = [];
    let distractionTime = 0;
    let throwTime = 0;
    let mapOpen = false;
    let sceneLoading = false;
    let portalEntering = false;
    let sceneToken = 0;
    let cameraX = null;
    let cutscene = null;
    let cameraWidth = viewport.clientWidth;
    let cameraHeight = viewport.clientHeight;
    let footstepDistance = 0;
    let lastPrompt = '';
    let impactShake=0;
    let lionHitPause=0;
    const arenaFloor = 602;
    const mapPanel = document.querySelector('#romaMapPanel');
    const mapButton = document.querySelector('#romaMap');
    const combatStatus = document.querySelector('#romaCombatStatus');
    const routeStatus = document.querySelector('#romaRoute');
    const transition = document.querySelector('#romaTransition');
    const cinemaCaption = document.querySelector('#romaCinemaCaption');
    const backgrounds = { city:'entrada-roma-pixelart-v1.png', forum:'foro-senado-pixelart-v1.png', colosseum:'coliseu-exterior-pixelart-v1.png', arena:'arena-coliseu-pixelart-v1.png',artisans:'rua-dos-artesaos-v4.png',workshop:'oficina-artesao-v5.png',residential:'bairro-residencial-v4.png',courtyard:'patio-romano-v4.png' };
    const imageLoads = new Map();
    function preloadScene(key) {
        if (!imageLoads.has(key)) {
            const image = new Image();
            image.src = 'assets/images/roma/' + backgrounds[key];
            imageLoads.set(key, image.decode().catch(error => { imageLoads.delete(key); throw error; }));
        }
        return imageLoads.get(key);
    }

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const area = () => areas[state.area];
    const has = (item) => state.items[item];

    function saveGame() {
        state.x = Math.round(player.x);
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* Play remains available with storage disabled. */ }
    }

    function setCheckpoint(message) {
        saveGame();
        showToast(`CHECKPOINT — ${message}`);
    }

    function showToast(message, duration = 2600) {
        toast.textContent = message;
        toast.hidden = false;
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => { toast.hidden = true; }, duration);
    }

    function setObjective(text) {
        objective.textContent = text;
    }

    function setStep(nextStep, objectiveText, checkpointMessage) {
        state.step = nextStep;
        if (objectiveText) setObjective(objectiveText);
        if (checkpointMessage) setCheckpoint(checkpointMessage);
        else saveGame();
        renderScene();
    }

    function openDialogue(lines, onClose = null) {
        shell.classList.add('has-modal');
        dialogueLines = lines;
        dialogueStep = 0;
        dialogueOnClose = onClose;
        dialogueOpen = true;
        player.moving = false;
        heldKeys.clear();
        updateDialogue();
        dialogue.hidden = false;
        dialogueContinue.focus({ preventScroll: true });
    }

    function updateDialogue() {
        const line = dialogueLines[dialogueStep];
        dialogueSpeaker.textContent = line.speaker;
        dialogueText.textContent = line.text;
        dialogueContinue.innerHTML = dialogueStep === dialogueLines.length - 1 ? 'Entendi <span aria-hidden="true">↵</span>' : 'Continuar <span aria-hidden="true">↵</span>';
    }

    function continueDialogue() {
        if (!dialogueOpen) return;
        if (dialogueStep < dialogueLines.length - 1) { dialogueStep += 1; updateDialogue(); return; }
        dialogueOpen = false;
        shell.classList.remove('has-modal');
        dialogue.hidden = true;
        const callback = dialogueOnClose;
        dialogueOnClose = null;
        callback?.();
        viewport.focus({ preventScroll: true });
    }

    function openCraft() {
        if (!has('straw') || state.step !== 'craftDolls') return;
        craftOpen = true;
        shell.classList.add('has-modal');
        heldKeys.clear();
        craftPanel.hidden = false;
        craftDolls.focus({ preventScroll: true });
    }

    function closeCraftPanel() {
        craftOpen = false;
        shell.classList.remove('has-modal');
        craftPanel.hidden = true;
        viewport.focus({ preventScroll: true });
    }

    function craftStrawDolls() {
        if (!has('straw') || has('dolls')) return;
        state.items.dolls = true;
        closeCraftPanel();
        setStep('findRope', 'Encontre um laço resistente no Foro Romano.', 'Bonecos de palha preparados');
        showToast('ITEM ADQUIRIDO — BONECOS DE PALHA');
    }

    function itemLabel(item) {
        return ({ straw: 'Palha', dolls: 'Bonecos de palha', rope: 'Laço', memory: 'Memória de Roma', dispatch: 'Despacho do Senado' })[item];
    }

    function updateInventory() {
        const collected = Object.keys(state.items).filter((key) => has(key));
        inventory.hidden = collected.length === 0;
        inventoryItems.replaceChildren();
        collected.forEach((item) => {
            const line = document.createElement('div');
            line.className = 'inventory__item';
            line.style.setProperty('--item-color', ({ straw:'#d7a34a', dolls:'#deb666', rope:'#c49a56', memory:'#4cd8ff', dispatch:'#e2d8c4' })[item]);
            line.textContent = itemLabel(item);
            inventoryItems.append(line);
        });
    }

    function addProp(kind, x, y, extra = '') {
        const node = document.createElement('div');
        node.className = `roma-prop roma-prop--${kind} ${extra}`;
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        propsLayer.append(node);
        return node;
    }

    function addNpc(x, type, options = {}) {
        const node = document.createElement('div');
        node.className = `roma-npc roma-npc--${type}`;
        const sprite = document.createElement('div');
        sprite.className = 'roma-npc__sprite';
        const variants={citizen:['a',0],merchant:['a',1],soldier:['a',2],senator:['a',3],smith:['b',0],neighbor:['b',1],messenger:['b',2],elder:['b',3]};
        const [sheet,row]=variants[type]||variants.citizen;
        sprite.style.backgroundImage=`url('assets/images/roma/npcs-simple-${sheet}-v4.png')`;
        node.dataset.variant=type;
        node.dataset.sheet=sheet;
        node.append(sprite);
        const distance = Math.abs(options.distance || 80) * 2;
        npcActors.push({ node, sprite, x, row,
            min: Math.max(80,x-distance), max: Math.min(area().width-80,x+distance),
            direction: options.distance < 0 ? -1 : 1, walking: !!options.walk,
            clock: npcActors.length*143, pause: 0, speed: state.cityState>=4 ? 125 : type==='elder'?35:type==='messenger'?76:46+npcActors.length%4*6,
            floor:area().floorY - (options.lift || 0) - 1 });
        npcsLayer.append(node);
    }

    function addLion(x, faceLeft = false) {
        const node = document.createElement('div');
        node.className = 'roma-lion';
        const sprite = document.createElement('div');
        sprite.className = 'roma-lion__sprite';
        node.append(sprite);
        actorsLayer.append(node);
        lionNodes.push(node);
        lions.push({node,sprite,x,direction:faceLeft?-1:1,state:'patrol',clock:0,walk:0,
            home:x,min:x-115,max:x+115,target:x,attackCount:0,index:lions.length});
        return node;
    }

    function addDoll(x) {
        const node = addProp('doll', x-17, arenaFloor-52, 'is-thrown-doll');
        actorsLayer.append(node);
        dolls.push({node,x,from:player.x,hits:0});
        return node;
    }

    function updateNpcs(delta) {
        for (const npc of npcActors) {
            const oldX=npc.x;
            if (npc.walking && npc.pause<=0) {
                npc.x=clamp(npc.x+npc.direction*npc.speed*delta/1000,npc.min,npc.max);
                npc.clock+=Math.abs(npc.x-oldX)*8;
                if(npc.x===npc.min || npc.x===npc.max) { npc.direction*=-1; npc.pause=450; }
            } else npc.pause-=delta;
            const moving=Math.abs(npc.x-oldX)>.01;
            const frame=moving ? Math.floor(npc.clock/150)%4 : 1;
            const facing=npc.walking ? npc.direction : (player.x<npc.x?-1:1);
            npc.node.style.transform=`translate(${Math.round(npc.x-34)}px,${npc.floor-90}px)`;
            npc.sprite.style.backgroundPosition=`${frame*100/3}% ${npc.row*100/3}%`;
            npc.sprite.style.transform=`scaleX(${facing})`;
            Object.assign(npc.node.dataset,{x:npc.x.toFixed(1),facing:facing<0?'left':'right',frame:String(frame)});
        }
    }

    function burst(x,y,straw=false) {
        if (prefersReducedMotion) return;
        for(let i=0;i<8;i++) {
            const node=document.createElement('i');
            node.className='roma-particle'+(straw?' is-straw':'');
            actorsLayer.append(node);
            effects.push({node,x,y,vx:(i-3.5)*31,vy:-90-(i%3)*40,life:560,max:560});
        }
    }

    function setLionState(lion,next) {
        lion.state=next; lion.clock=0; lion.hit=false; lion.startX=lion.x;
    }

    function updateLions(delta) {
        if(state.area!=='arena') return;
        if(lionHitPause>0){lionHitPause-=delta;return;}
        if(throwTime>0) {
            throwTime=Math.max(0,throwTime-delta);
            const t=1-throwTime/900;
            dolls.forEach(doll=>{
                const x=doll.from+(doll.x-doll.from)*t;
                const y=area().floorY-55+(arenaFloor-area().floorY)*t-Math.sin(t*Math.PI)*190;
                doll.node.style.left=`${x-17}px`; doll.node.style.top=`${y}px`;
                doll.node.style.transform=`rotate(${t*360}deg)`;
            });
            if(throwTime===0) {
                dolls.forEach(doll=>{doll.node.style.transform='';burst(doll.x,arenaFloor,true);});
                lions.forEach(lion=>setLionState(lion,'chase'));
            }
        }
        if(state.lionsDistracted && !lassoResolving) {
            distractionTime=Math.max(0,distractionTime-delta);
            if(distractionTime===0) {
                state.lionsDistracted=false; state.step='distract';
                dolls.forEach(d=>d.node.remove()); dolls=[];
                reticle?.remove(); reticle=null; lasso?.remove(); lasso=null;
                lions.forEach(lion=>setLionState(lion,'recover'));
                setObjective('Os bonecos se desfizeram. Lance outros e tente novamente.');
                showToast('Sem perder progresso: você pode lançar novos bonecos.');
                saveGame();
            }
        }
        for(const lion of lions) {
            lion.clock+=delta;
            const rival=lions[1-lion.index];
            const doll=dolls[lion.index];
            let frame=0, offsetY=0;
            if(lion.state==='patrol') {
                lion.x+=lion.direction*82*delta/1000;
                if(lion.x<lion.min || lion.x>lion.max) lion.direction*=-1;
                lion.x=clamp(lion.x,lion.min,lion.max);
                lion.walk+=delta; frame=Math.floor(lion.walk/140)%4;
                if(rival && Math.abs(rival.x-lion.x)<205 && lion.clock>1250 && rival.state==='patrol') {
                    lion.direction=Math.sign(rival.x-lion.x)||1;
                    lion.target=rival.x-lion.direction*92;
                    rival.direction=-lion.direction;
                    setLionState(rival,'guard');
                    setLionState(lion,'windup');
                }
            } else if(lion.state==='chase') {
                if(!doll) {setLionState(lion,'patrol');continue;}
                const dx=doll.x-lion.x;
                lion.direction=Math.sign(dx)||lion.direction;
                lion.x+=Math.sign(dx)*Math.min(Math.abs(dx),245*delta/1000);
                lion.walk+=delta;frame=Math.floor(lion.walk/100)%4;
                if(Math.abs(dx)<75) {lion.target=doll.x-lion.direction*39;setLionState(lion,'windup');}
            } else if(lion.state==='guard') {
                frame=4;
                if(lion.clock>1800)setLionState(lion,'recover');
            } else if(lion.state==='windup') {
                frame=4;
                if(lion.clock>=420) setLionState(lion,'attack');
            } else if(lion.state==='attack') {
                const t=clamp(lion.clock/310,0,1);
                lion.x=lion.startX+(lion.target-lion.startX)*(1-Math.pow(1-t,3));
                offsetY=-Math.sin(t*Math.PI)*24;
                frame=lion.clock<150?5:6;
                if(lion.clock>=170 && !lion.hit) {
                    lion.hit=true; lion.attackCount++;
                    burst(lion.x+lion.direction*52,arenaFloor-25,!!doll);
                    if(!prefersReducedMotion){
                        impactShake=150;lionHitPause=38;
                        const slash=document.createElement('i');slash.className='roma-claw-impact';actorsLayer.append(slash);
                        effects.push({node:slash,x:lion.x+lion.direction*48,y:arenaFloor-53,vx:0,vy:0,life:180,max:180});
                    }
                    if(doll) {
                        doll.hits++;
                        doll.node.animate([{transform:'rotate(0deg)'},{transform:`rotate(${lion.direction*26}deg)`},{transform:'rotate(0deg)'}],{duration:330});
                    } else if(rival && !state.lionsDistracted) {
                        rival.direction=Math.sign(lion.x-rival.x)||-1;
                        setLionState(rival,'recoil');
                    }
                }
                if(lion.clock>=360) setLionState(lion,'recover');
            } else if(lion.state==='recover') {
                frame=7;
                if(doll && lion.clock<400)lion.x-=lion.direction*38*delta/1000;
                if(!doll)lion.x+=(clamp(lion.x,lion.min,lion.max)-lion.x)*Math.min(1,delta/120);
                if(lion.clock>=490) {
                    if(doll && state.lionsDistracted) {lion.target=doll.x-lion.direction*39;setLionState(lion,'windup');}
                    else {lion.direction=lion.index===0?-1:1;setLionState(lion,'patrol');}
                }
            } else if(lion.state==='recoil') {
                frame=7;
                lion.x-=lion.direction*88*delta/1000;
                if(lion.clock>360) {
                    if(rival&&!state.lionsDistracted&&['recover','patrol'].includes(rival.state)) {
                        lion.direction=Math.sign(rival.x-lion.x)||lion.direction;
                        lion.target=rival.x-lion.direction*92;
                        rival.direction=-lion.direction;setLionState(rival,'guard');setLionState(lion,'windup');
                    } else {lion.direction=lion.index===0?-1:1;setLionState(lion,'patrol');}
                }
            }
            lion.node.style.transform=`translate(${Math.round(lion.x-72)}px,${Math.round(arenaFloor-112+offsetY)}px)`;
            lion.sprite.style.backgroundPosition=`${(frame%4)*100/3}% ${frame>3?100:0}%`;
            lion.sprite.style.transform=`scaleX(${lion.direction})`;
            Object.assign(lion.node.dataset,{x:lion.x.toFixed(1),state:lion.state,facing:lion.direction<0?'left':'right',frame:String(frame),hits:String(lion.attackCount)});
        }
        combatStatus.hidden=state.step!=='lassoAim';
        if(!combatStatus.hidden) {
            combatStatus.textContent=`DISTRAÇÃO ${Math.ceil(distractionTime/1000)}s · ${Math.abs(aimX-MEMORY_X)<45?'AGORA: AÇÃO / ESPAÇO':'Espere a mira alcançar o fragmento'}`;
            combatStatus.classList.toggle('is-ready',Math.abs(aimX-MEMORY_X)<45);
        }
    }

    function updateEffects(delta) {
        effects=effects.filter(effect=>{
            effect.life-=delta;
            if(effect.life<=0){effect.node.remove();return false;}
            effect.x+=effect.vx*delta/1000; effect.vy+=380*delta/1000;effect.y+=effect.vy*delta/1000;
            effect.node.style.transform=`translate(${Math.round(effect.x)}px,${Math.round(effect.y)}px)`;
            effect.node.style.opacity=effect.life/effect.max;
            return true;
        });
    }

    function beginCutscene(kind,duration,caption,onEnd) {
        heldKeys.clear(); player.moving=false;
        cutscene={kind,clock:0,duration:prefersReducedMotion?400:duration,onEnd};
        shell.classList.add('is-cinematic');
        cinemaCaption.textContent=caption;
        cinemaCaption.hidden=false;
        document.querySelector('#romaSkip').hidden=false;
    }
    function endCutscene() {
        if(!cutscene)return;
        const callback=cutscene.onEnd;cutscene=null;
        shell.classList.remove('is-cinematic');
        cinemaCaption.hidden=true;document.querySelector('#romaSkip').hidden=true;
        callback?.();
    }

    function renderCitizens() {
        const crowds={
            city:[[180,'citizen'],[400,'messenger'],[650,'elder'],[900,'merchant'],[1290,'neighbor'],[1520,'smith'],[1740,'citizen'],[1980,'merchant']],
            forum:[[200,'soldier'],[430,'neighbor'],[790,'messenger'],[980,'merchant'],[1180,'elder'],[1390,'citizen'],[1810,'smith'],[1950,'soldier']],
            colosseum:[[170,'citizen'],[490,'merchant'],[750,'messenger'],[1050,'soldier'],[1310,'neighbor'],[1770,'elder'],[1930,'merchant']],
            artisans:[[200,'neighbor'],[520,'citizen'],[710,'merchant'],[1190,'messenger'],[1390,'elder']],
            residential:[[240,'messenger'],[490,'neighbor'],[710,'merchant'],[940,'elder'],[1300,'citizen']],
            courtyard:[[420,'elder'],[860,'neighbor'],[1190,'messenger']]
        };
        (crowds[state.area]||[]).forEach(([x,type],i)=>addNpc(x,type,{walk:true,distance:i%2?-65:85}));
        if(state.area==='city')addNpc(1050,'neighbor',{talk:true});
        if(state.area==='forum') {
            addNpc(1540,'senator',{talk:true});
            if(state.cityState>=3)[345,1660].forEach(x=>addNpc(x,'soldier',{walk:true,distance:45}));
        }
        if(state.area==='colosseum')addNpc(1500,'soldier',{talk:true});
        if(state.area==='artisans')addNpc(340,'smith',{talk:true});
        if(state.area==='workshop')addNpc(1070,'smith',{talk:true});
    }

    function renderScene() {
        world.dataset.area = state.area;
        world.dataset.step = state.step;
        world.dataset.cityState = String(state.cityState);
        world.style.width = `${area().width}px`;
        world.style.height = `${area().height}px`;
        document.querySelector('#romaBackground').style.backgroundImage=`url('assets/images/roma/${backgrounds[state.area]}')`;
        propsLayer.replaceChildren();
        npcsLayer.replaceChildren();
        actorsLayer.replaceChildren();
        lionNodes = [];
        lions = []; npcActors = []; dolls = []; effects = []; throwTime=0;
        impactShake=0;lionHitPause=0;
        reticle = null;
        lasso = null;
        memoryNode = null;

        renderCitizens();
        if (state.area === 'city') {
            if (state.cityState >= 3) addProp('barricade', 640, area().floorY - 35);
            if (state.cityState >= 4) addProp('barricade', 1510, area().floorY - 35);
        }
        if (state.area === 'forum') {
            if (!has('rope')) addProp('rope', 610, area().floorY - 54);
            if (state.cityState >= 3) addProp('barricade', 720, area().floorY - 35);
            if (state.cityState >= 4) addProp('barricade', 1190, area().floorY - 35);
        }
        if (state.area === 'colosseum') {
            if (!has('straw')) addProp('straw', 285, area().floorY - 46);
            addProp('gate', 1540, area().floorY - 110);
        }
        if(state.area==='workshop')addProp('forge-glow',520,510);
        if(state.area==='courtyard'&&!state.discoveries.fountain)addProp('echo',690,area().floorY-90);
        if (state.area === 'arena') {
            if (!has('memory')) {
                memoryNode=addProp('memory',MEMORY_X-21,MEMORY_Y-28);
                memoryNode.dataset.targetX=String(MEMORY_X);
            }
            addLion(1060, false);
            addLion(1450, true);
            if (state.lionsDistracted) {
                addDoll(900); addDoll(1130);
                distractionTime=24000;
                lions.forEach(lion=>setLionState(lion,'chase'));
            }
            if (state.step === 'lassoAim' && !has('memory')) {
                createAim();
            }
        }
        combatStatus.hidden=true;
        renderRoute();
        updateNpcs(0); updateLions(0);
        updateInventory();
        updatePrompt();
    }

    async function setArea(nextArea, spawnX, preserveDirection = false) {
        if(sceneLoading || !areas[nextArea]) return;
        sceneLoading=true;
        const token=++sceneToken;
        transition.hidden=false;
        transition.textContent='Carregando '+areas[nextArea].label+'…';
        try { await preloadScene(nextArea); }
        catch {
            sceneLoading=false; transition.hidden=true;
            showToast('Não foi possível carregar o cenário. Tente entrar novamente.');
            return;
        }
        if(token!==sceneToken)return;
        state.area = nextArea;
        player.x = clamp(spawnX ?? areas[nextArea].startX,45,areas[nextArea].width-45);
        if(!state.visitedAreas.includes(nextArea))state.visitedAreas.push(nextArea);
        if (!preserveDirection) heldKeys.clear();
        if(nextArea!=='arena' && state.step==='lassoAim') {state.step='distract';state.lionsDistracted=false;}
        cameraX=null;
        saveGame();
        renderScene();
        updateSprite();
        updateCamera();
        sceneLoading=false;
        transition.hidden=true;
        return true;
    }

    async function enterPortal(entry) {
        if(portalEntering)return;
        portalEntering=true;heldKeys.clear();player.moving=false;
        const fade=renato.animate([{opacity:1},{opacity:.15}],{duration:prefersReducedMotion?0:160,fill:'forwards'});
        try {
            await fade.finished;
            await setArea(entry.to,entry.spawn);
        } finally {
            fade.cancel();portalEntering=false;
            renato.animate([{opacity:.2},{opacity:1}],{duration:prefersReducedMotion?0:160});
        }
    }

    function destination() {
        if(state.finished)return null;
        return ({travelColosseum:['colosseum',1580],observeArena:['arena',1410],needStraw:['colosseum',330],craftDolls:['workshop',980],findRope:['forum',640],distract:['arena',1200],lassoAim:['arena',1200],senate:['forum',1590],deliverOrder:['forum',310],warnMarket:['city',1050],finalSenate:['forum',1590]})[state.step];
    }

    function navigationEdges(key) {
        const links=[...(portals[key]||[])];
        Object.entries(exits[key]||{}).forEach(([side,exit])=>links.push({...exit,x:side==='left'?60:areas[key].width-60}));
        if(key==='colosseum')links.push({to:'arena',x:1580});
        return links;
    }

    function pathTo(from,to) {
        const queue=[{key:from,path:[],names:[from]}],seen=new Set([from]);
        while(queue.length) {
            const current=queue.shift();
            if(current.key===to)return current;
            for(const edge of navigationEdges(current.key))if(!seen.has(edge.to)) {
                seen.add(edge.to);queue.push({key:edge.to,path:[...current.path,edge],names:[...current.names,edge.to]});
            }
        }
        return null;
    }

    function routeTarget(from=state.area) {
        const target=destination();if(!target)return null;
        if(from===target[0])return target;
        const path=pathTo(from,target[0]);
        return path?.path.length?[from,path.path[0].x]:null;
    }

    function renderRoute() {
        routeStatus.textContent=area().label;
        Object.entries(exits[state.area]||{}).forEach(([side,exit])=>{
            if(side==='left'&&(portals[state.area]||[]).some(entry=>entry.x<220&&entry.to===exit.to))return;
            const x=side==='left'?75:area().width-175,text=side==='left'?'← '+exit.label:exit.label+' →';
            const sign=addProp('route',x,area().floorY-138);
            sign.textContent=text;
        });
        for(const entry of portals[state.area]||[]) {
            const door=addProp('entrance',entry.x-34,area().floorY-99);
            door.dataset.destination=entry.to;
            door.dataset.x=String(entry.x);
            const label=document.createElement('span');label.textContent='↑ '+entry.label;door.append(label);
        }
        const target=routeTarget();
        if(target && target[0]===state.area) {
            const marker=addProp('destination',target[1]-12,area().floorY-170);
            marker.textContent='↓';
        }
    }

    function closeMap() {
        mapOpen=false;mapPanel.hidden=true;shell.classList.remove('has-modal');viewport.focus({preventScroll:true});
    }

    function openMap() {
        if(dialogueOpen||craftOpen||cutscene||sceneLoading||portalEntering||!endingPanel.hidden||lassoResolving)return;
        mapOpen=true;heldKeys.clear();mapPanel.hidden=false;shell.classList.add('has-modal');
        const list=mapPanel.querySelector('.roma-map__locations');list.replaceChildren();
        const target=destination();
        const path=target?pathTo(state.area,target[0]):null;
        document.querySelector('#romaMapHint').textContent=path?.names.length>1?'Caminho do objetivo: '+path.names.map(key=>areas[key].label).join(' → '):target?'O objetivo está nesta área.':'Explore as entradas marcadas com ↑. A memória principal já foi concluída.';
        document.querySelector('#romaMapCount').textContent=`${state.visitedAreas.length} / ${Object.keys(areas).length} lugares descobertos · ${Object.keys(state.discoveries).length} descobertas opcionais`;
        Object.entries(areas).forEach(([key,info])=>{
            const button=document.createElement('button');button.type='button';button.dataset.travel=key;
            button.disabled=!state.visitedAreas.includes(key);
            button.textContent=info.label+(key===state.area?' · você está aqui':'')+(button.disabled?' · não visitado':'');
            if(target?.[0]===key)button.textContent+=' · objetivo';
            button.addEventListener('click',()=>{
                closeMap();
                const spawn=routeTarget(key)?.[1]??({city:500,forum:1040,colosseum:1500,arena:1180,artisans:960,workshop:980,residential:1110,courtyard:680})[key];
                setArea(key,spawn);
            });
            list.append(button);
        });
        mapPanel.querySelector('button:not(:disabled)')?.focus();
    }

    function createAim() {
        reticle?.remove();lasso?.remove();
        reticle=document.createElement('div');reticle.className='roma-reticle';actorsLayer.append(reticle);
        lasso=document.createElement('div');lasso.className='roma-lasso';
        const line=document.createElement('i');lasso.append(line);actorsLayer.append(lasso);
    }

    function currentInteraction() {
        const x = player.x;
        const within = (target, range = 94) => Math.abs(x - target) <= range;
        const entry=(portals[state.area]||[]).find(portal=>within(portal.x,85));
        if(entry)return {x:entry.x,text:entry.label+'\n↑ / E ENTRAR',action:'portal',portal:entry};
        if (state.area === 'colosseum') {
            if (state.step === 'needStraw' && within(330, 110)) return { x: 330, text: 'PALHA\n↑ COLETAR', action: 'straw' };
            if (within(1580, 125)) return { x: 1580, text: 'PORTÃO DA ARENA\n↑ ENTRAR', action: 'arena' };
        }
        if (state.area === 'arena') {
            if (state.step === 'observeArena' && within(1410, 130)) return { x: 1410, y: 300, text: 'MEMÓRIA INSTÁVEL\n↑ OBSERVAR', action: 'observe' };
            if (state.step === 'distract' && within(1100, 470)) return { x: player.x, text: 'BONECOS DE PALHA\n↑ LANÇAR', action: 'dolls' };
            if (state.step === 'lassoAim') return { x: player.x, text: 'MIRE NO FRAGMENTO\nAÇÃO / ESPAÇO', action: 'lasso' };
        }
        if (state.area === 'city') {
            if (state.step === 'warnMarket' && within(1050, 120)) return { x: 1050, text: 'MERCADORA PREOCUPADA\n↑ CONVERSAR', action: 'merchant' };
        }
        if(state.area==='workshop'&&within(980,120))return {x:980,text:'BANCADA DO ARTESÃO\n↑ '+(state.step==='craftDolls'?'FABRICAR':'EXAMINAR'),action:state.step==='craftDolls'?'craft':'workshopInfo'};
        if(state.area==='artisans'&&within(340,70))return {x:340,text:'ARTESÃO\n↑ CONVERSAR',action:'artisanTip'};
        if(state.area==='residential'&&within(530,70))return {x:530,text:'VIZINHANÇA\n↑ OBSERVAR',action:'neighborhood'};
        if(state.area==='courtyard'&&within(700,110))return {x:700,text:'FONTE DO PÁTIO\n↑ EXAMINAR',action:'fountain'};
        if (state.area === 'forum') {
            if (state.step === 'findRope' && within(640, 118)) return { x: 640, text: 'LAÇO DO CORDEIRO\n↑ PEGAR', action: 'rope' };
            if (state.step === 'senate' && within(1590, 132)) return { x: 1590, text: 'CÚRIA DO SENADO\n↑ ENTRAR', action: 'senate' };
            if (state.step === 'deliverOrder' && within(310, 120)) return { x: 310, text: 'POSTO MILITAR\n↑ ENTREGAR', action: 'military' };
            if (!state.finished && state.step === 'finalSenate' && within(1590, 132)) return { x: 1590, text: 'SENADO EM CRISE\n↑ ENTRAR', action: 'final' };
        }
        return null;
    }

    function updatePrompt() {
        propsLayer.querySelectorAll('.roma-prop--entrance').forEach(door=>door.classList.toggle('is-near',Math.abs(player.x-Number(door.dataset.x))<=85));
        const interaction = currentInteraction();
        if (!interaction || dialogueOpen || craftOpen || mapOpen || cutscene || !endingPanel.hidden || state.step==='lassoAim') { prompt.classList.remove('is-visible'); return; }
        const y = interaction.y ?? area().floorY - 205;
        prompt.style.left = `${interaction.x - 85}px`;
        prompt.style.top = `${y}px`;
        if(lastPrompt!==interaction.text) {prompt.querySelector('span').textContent=interaction.text;lastPrompt=interaction.text;}
        prompt.classList.add('is-visible');
    }

    async function startArenaVisit() {
        const firstVisit=state.step==='travelColosseum';
        if(!await setArea('arena', 250))return;
        if (state.step === 'travelColosseum') {
            state.step = 'observeArena';
            setObjective('Aproxime-se da memória, mas mantenha distância dos leões.');
            saveGame();
            renderScene();
        }
        if(firstVisit)beginCutscene('arena',4200,'COLISEU · Observe os leões. Renato permanece no corredor seguro.');
    }

    function throwDolls() {
        if (!has('dolls')) return;
        state.lionsDistracted = true;
        state.step = 'lassoAim';
        world.dataset.step=state.step;
        setObjective('Mire no fragmento azul e pressione ESPAÇO ou AÇÃO para lançar o laço.');
        saveGame();
        addDoll(900);addDoll(1130);
        throwTime=900;distractionTime=24900;
        createAim();
        beginCutscene('dolls',2200,'Os bonecos chamam a atenção. Prepare o laço.');
    }

    function throwLasso() {
        if (state.area!=='arena' || state.step !== 'lassoAim' || lassoResolving || !reticle || throwTime>0) return;
        lassoResolving = true;
        const success = Math.abs(aimX - MEMORY_X) < 45;
        lasso.style.left = `${player.x + 32}px`;
        lasso.style.top = `${area().floorY - 40}px`;
        const dx = aimX - (player.x+32);
        const dy = MEMORY_Y - (area().floorY - 40);
        const distance = Math.sqrt(dx * dx + dy * dy);
        lasso.style.width = `${distance}px`;
        lasso.style.transform = `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`;
        lasso.classList.add('is-thrown');
        if (!success) {
            showToast('O LAÇO VOLTOU. AJUSTE A MIRA E TENTE DE NOVO.');
            window.setTimeout(() => { lassoResolving = false; lasso.classList.remove('is-thrown'); }, prefersReducedMotion ? 60 : 920);
            return;
        }
        showToast('O LAÇO PRENDEU A MEMÓRIA!');
        memoryNode?.classList.add('is-retrieved');
        memoryNode?.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${player.x-MEMORY_X}px, ${area().floorY-MEMORY_Y-40}px) scale(.45)` }], { duration: prefersReducedMotion ? 1 : 1100, easing: 'ease-in', fill: 'forwards' });
        window.setTimeout(async () => {
            state.items.memory = true;
            state.cityState = 2;
            state.step = 'senate';
            state.lionsDistracted = false;
            setObjective('Leve a memória restaurada ao Senado, no Foro Romano.');
            setCheckpoint('Memória do Coliseu recuperada');
            showToast('ITEM ADQUIRIDO — MEMÓRIA DE ROMA');
            await setArea('colosseum', 1510);
            openDialogue([{ speaker: 'PEDRO NEVES', text: 'Você recuperou o fragmento, mas ele revelou um despacho escondido. Leve-o ao Senado: precisamos entender por que foi alterado.' }]);
            lassoResolving = false;
        }, prefersReducedMotion ? 40 : 1120);
    }

    function handleInteraction() {
        if (dialogueOpen || craftOpen || mapOpen || cutscene || sceneLoading || portalEntering || lassoResolving || !endingPanel.hidden) return;
        const interaction = currentInteraction();
        if (!interaction) return;
        if(interaction.action==='portal') {enterPortal(interaction.portal);return;}
        if(interaction.action==='artisanTip')openDialogue([
            {speaker:'ARTESÃO',text:'Minha oficina é a porta com a bigorna, mais adiante nesta rua. Se precisar montar alguma coisa, pode usar a bancada.'},
            {speaker:'ARTESÃO',text:'Esta rua também sai no bairro residencial. O arco entre as casas leva a um pátio mais tranquilo.'}
        ],()=>{state.discoveries.artisan=true;saveGame();});
        if(interaction.action==='workshopInfo')openDialogue([{speaker:'ARTESÃO',text:has('dolls')?'Os bonecos ficaram firmes. Se os leões os destruírem, use a palha que sobrou para preparar outra distração.':'A bancada está à sua disposição. Madeira, corda, ferramentas… mas primeiro descubra de que material você precisa.'}]);
        if(interaction.action==='neighborhood')openDialogue([{speaker:'RENATO',text:'Ainda tem gente voltando para casa, roupas secando e água na fonte. Essa memória não é só sobre o Senado e o Coliseu.'}],()=>{state.discoveries.neighborhood=true;saveGame();});
        if(interaction.action==='fountain')openDialogue([
            {speaker:'RENATO',text:state.discoveries.fountain?'A lembrança continua aqui. Uma tarde comum, escondida no meio da confusão.':'O barulho da água me trouxe uma lembrança: uma família se reunindo neste pátio antes de anoitecer.'},
            {speaker:'RENATO',text:'Talvez proteger uma memória também seja não deixar essas pequenas coisas desaparecerem.'}
        ],()=>{state.discoveries.fountain=true;saveGame();renderScene();showToast('Descoberta: uma tarde no pátio.');});
        if (interaction.action === 'arena') startArenaVisit();
        if (interaction.action === 'observe') openDialogue(arenaWarning, () => {
            setStep('needStraw', 'Encontre palha perto das carroças, do lado de fora do Coliseu.', 'Leões observados');
        });
        if (interaction.action === 'straw') openDialogue(strawHint, () => {
            state.items.straw = true;
            setStep('craftDolls', 'Entre na rua dos artesãos, no mercado, e use a bancada dentro da oficina.', 'Palha coletada');
            showToast('ITEM ADQUIRIDO — PALHA');
        });
        if (interaction.action === 'craft') openCraft();
        if (interaction.action === 'rope') openDialogue(ropeHint, () => {
            state.items.rope = true;
            setStep('distract', 'Retorne à arena e use os bonecos de palha para distrair os leões.', 'Laço encontrado');
            showToast('ITEM ADQUIRIDO — LAÇO');
        });
        if (interaction.action === 'dolls') throwDolls();
        if (interaction.action === 'lasso') showToast('Use ESPAÇO ou o botão AÇÃO para lançar o laço.');
        if (interaction.action === 'senate') openDialogue(senateBriefing, () => {
            state.items.dispatch = true;
            setStep('deliverOrder', 'Entregue o despacho no posto militar à esquerda do Foro.', 'Despacho recebido');
            showToast('ITEM ADQUIRIDO — DESPACHO DO SENADO');
        });
        if (interaction.action === 'military') openDialogue(militaryBriefing, () => {
            state.cityState = 3;
            setStep('warnMarket', 'Volte ao mercado e fale com a comerciante preocupada.', 'Patrulhas deslocadas');
        });
        if (interaction.action === 'merchant') openDialogue(merchantBriefing, () => {
            state.cityState = 4;
            setStep('finalSenate', 'Retorne ao Senado. A cidade está entrando em colapso.', 'Pânico no mercado');
        });
        if (interaction.action === 'final') openDialogue(fallBriefing, () => {
            state.cityState = 5;
            state.finished = true;
            setObjective('Memória de Roma concluída.');
            setCheckpoint('Queda de Roma');
            renderScene();
            window.setTimeout(() => { endingPanel.hidden = false; }, prefersReducedMotion ? 0 : 450);
        });
    }

    function updateSprite() {
        const frame = player.moving ? 1 + Math.floor(player.walkTime / 130) % 7 : 0;
        const position = sprites[player.facing][frame];
        if (position !== displayedSprite) {
            renato.style.backgroundImage = `url("${RENATO_SPRITE_SHEET}")`;
            renato.style.backgroundPosition = position;
            displayedSprite = position;
        }
        const drawX = Math.round(player.x - PLAYER_SIZE / 2);
        const drawY = Math.round(area().floorY - PLAYER_SIZE - PLAYER_VERTICAL_OFFSET);
        renato.style.transform = `translate(${drawX}px, ${drawY}px)`;
        Object.assign(renato.dataset,{x:player.x.toFixed(2),facing:player.facing,frame:String(frame)});
    }

    function updateCamera(delta=16) {
        let scale = clamp(cameraHeight/650,.78,1.18);
        const combat=state.area==='arena' && (state.step==='lassoAim'||cutscene);
        const combatLeft=Math.min(player.x,state.lionsDistracted?900:1060);
        const combatRight=Math.max(player.x,MEMORY_X);
        if(combat)scale=Math.max(.35,Math.min(scale,(cameraHeight-210)/(area().floorY-MEMORY_Y),cameraWidth/(combatRight-combatLeft+280)));
        const scaledWidth = area().width * scale;
        let focus=player.x+(player.moving?(player.facing==='right'?75:-75):0);
        if(combat)focus=(combatLeft+combatRight)/2;
        if(cutscene?.kind==='arena')focus=1100;
        const x=scaledWidth<=cameraWidth?(cameraWidth-scaledWidth)/2:clamp(cameraWidth/2-focus*scale,cameraWidth-scaledWidth,0);
        if(cameraX===null||prefersReducedMotion)cameraX=x;
        else cameraX+=(x-cameraX)*(1-Math.exp(-delta/105));
        const floorScreen=cameraHeight-(cameraHeight<500?78:Math.min(115,cameraHeight*.16));
        const top=floorScreen-area().floorY*scale;
        impactShake=Math.max(0,impactShake-delta);
        const shake=prefersReducedMotion?0:Math.sin(impactShake*.2)*2.1*(impactShake/150);
        world.style.transform=`translate3d(${(cameraX+shake).toFixed(2)}px,${top.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;
    }

    function updateAim(delta) {
        if (state.area !== 'arena' || state.step !== 'lassoAim' || !reticle) return;
        aimClock += delta;
        aimX = MEMORY_X + Math.sin(aimClock / 600) * 115;
        reticle.style.left = `${aimX}px`;
        reticle.style.top = `${MEMORY_Y}px`;
        reticle.classList.toggle('is-on-target',Math.abs(aimX-MEMORY_X)<45);
    }

    function update(delta) {
        world.dataset.step=state.step;
        const paused=dialogueOpen||craftOpen||mapOpen||sceneLoading||portalEntering||!endingPanel.hidden||document.hidden;
        if (!paused && !lassoResolving && !cutscene) {
            let direction = 0;
            if (heldKeys.has('arrowleft') || heldKeys.has('a')) direction -= 1;
            if (heldKeys.has('arrowright') || heldKeys.has('d')) direction += 1;
            player.moving = direction !== 0;
            if (direction) {
                player.facing = direction > 0 ? 'right' : 'left';
                const distance=direction*SPEED*(heldKeys.has('shift')?1.4:1)*delta/1000;
                player.x = clamp(player.x + distance, PLAYER_SIZE / 2, area().width - PLAYER_SIZE / 2);
                player.walkTime += delta*(heldKeys.has('shift')?1.25:1);
                footstepDistance+=Math.abs(distance);
                if(footstepDistance>60){footstepDistance=0;if(!prefersReducedMotion)burst(player.x,area().floorY-2);}
            }
            const atLeft = player.x <= PLAYER_SIZE / 2;
            const atRight = player.x >= area().width - PLAYER_SIZE / 2;
            const exit=atLeft&&direction<0?exits[state.area]?.left:atRight&&direction>0?exits[state.area]?.right:null;
            if(exit){if(exit.turnBack)player.facing='left';setArea(exit.to,exit.spawn,!exit.turnBack);return;}
        } else player.moving = false;
        if(!paused) {
            updateNpcs(delta);updateLions(delta);updateEffects(delta);
            if(!cutscene&&!lassoResolving)updateAim(delta);
            if(cutscene){cutscene.clock+=delta;if(cutscene.clock>=cutscene.duration)endCutscene();}
        }
        updatePrompt();
        updateSprite();
        updateCamera(delta);
    }

    function animate(now) {
        const delta = Math.min(now - previousTime, 50);
        previousTime = now;
        update(delta);
        requestAnimationFrame(animate);
    }

    function useAction() {
        if (dialogueOpen || craftOpen || mapOpen || cutscene || sceneLoading || portalEntering || !endingPanel.hidden) return;
        if (state.step === 'lassoAim') throwLasso();
    }

    function setKey(event, pressed) {
        const key = event.key.toLowerCase();
        if(key==='tab' && pressed && (dialogueOpen||craftOpen||mapOpen)) {
            const modal=dialogueOpen?dialogue:craftOpen?craftPanel:mapPanel;
            const buttons=[...modal.querySelectorAll('button:not(:disabled),a[href]')];
            const index=buttons.indexOf(document.activeElement);
            event.preventDefault();buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();return;
        }
        const move = ['arrowleft','arrowright','a','d'];
        const interact = ['arrowup','w','e'];
        const action = [' ','f'];
        const advance = ['enter','escape',' '];
        if(pressed&&!event.repeat&&cutscene&&['escape','enter'].includes(key)){event.preventDefault();endCutscene();return;}
        if(mapOpen) {if(pressed&&key==='escape'){event.preventDefault();closeMap();}return;}
        if(pressed&&!event.repeat&&key==='m'){event.preventDefault();openMap();return;}
        if (dialogueOpen && pressed && !event.repeat && advance.includes(key)) { event.preventDefault(); continueDialogue(); return; }
        if (dialogueOpen || craftOpen || cutscene || sceneLoading || portalEntering || !endingPanel.hidden) { if (move.includes(key) || interact.includes(key) || action.includes(key)) event.preventDefault(); return; }
        if (![...move,...interact,...action,'shift'].includes(key)) return;
        event.preventDefault();
        if (interact.includes(key)) { if (pressed && !event.repeat) handleInteraction(); return; }
        if (action.includes(key)) { if (pressed && !event.repeat) useAction(); return; }
        if (pressed) heldKeys.add(key); else heldKeys.delete(key);
    }

    function bindControls() {
        window.addEventListener('keydown', (event) => setKey(event, true));
        window.addEventListener('keyup', (event) => setKey(event, false));
        window.addEventListener('blur', () => heldKeys.clear());
        document.addEventListener('visibilitychange',()=>{heldKeys.clear();previousTime=performance.now();if(document.hidden)saveGame();});
        window.addEventListener('pagehide',saveGame);
        new ResizeObserver(()=>{cameraWidth=viewport.clientWidth;cameraHeight=viewport.clientHeight;cameraX=null;updateCamera();}).observe(viewport);
        viewport.addEventListener('pointerdown', (event) => { event.preventDefault(); viewport.focus({ preventScroll: true }); });
        shell.addEventListener('contextmenu', (event) => event.preventDefault());
        shell.addEventListener('selectstart', (event) => event.preventDefault());
        dialogueContinue.addEventListener('click', continueDialogue);
        craftDolls.addEventListener('click', craftStrawDolls);
        closeCraft.addEventListener('click', closeCraftPanel);
        document.querySelector('#romaKeepExploring').addEventListener('click',()=>{endingPanel.hidden=true;heldKeys.clear();setObjective('Memória concluída. Explore as ruas, a oficina e o pátio.');viewport.focus({preventScroll:true});});
        mapButton.addEventListener('click',openMap);
        document.querySelector('#romaCloseMap').addEventListener('click',closeMap);
        document.querySelector('#romaSkip').addEventListener('click',endCutscene);
        resetButton.addEventListener('click', () => { if(confirm('Reiniciar apenas o progresso de Roma?'))window.location.assign('roma.html?reset=1'); });
        document.querySelectorAll('[data-direction]').forEach((button) => {
            const direction = button.dataset.direction;
            button.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                button.setPointerCapture?.(event.pointerId);
                if (dialogueOpen || craftOpen || mapOpen || cutscene || sceneLoading || portalEntering || !endingPanel.hidden) return;
                if (direction === 'interact') handleInteraction();
                else if (direction === 'action') useAction();
                else heldKeys.add(`arrow${direction}`);
            });
            ['pointerup','pointercancel','lostpointercapture'].forEach((name) => button.addEventListener(name, () => {
                if (direction === 'left' || direction === 'right') heldKeys.delete(`arrow${direction}`);
            }));
        });
    }

    async function start() {
        sceneLoading=true;transition.hidden=false;transition.textContent='Preparando Roma…';
        try {await preloadScene(state.area);} catch {showToast('O cenário não carregou. Recarregue para tentar novamente.',8000);}
        sceneLoading=false;transition.hidden=true;
        Object.keys(areas).forEach(key=>preloadScene(key).catch(()=>{}));
        chapter.textContent = 'MEMÓRIA 01 — QUEDA DE ROMA';
        if (state.finished) { state.cityState = 5; setObjective('Memória de Roma concluída.'); endingPanel.hidden = false; }
        else if (state.step === 'briefing') {
            setObjective('Aguarde as instruções de Pedro.');
            openDialogue(briefing, () => setStep('travelColosseum', 'Explore Roma e siga pela estrada até o Coliseu.', 'Roma — entrada'));
        } else {
            const labels = {
                travelColosseum: 'Explore Roma e siga pela estrada até o Coliseu.',
                observeArena: 'Aproxime-se da memória, mas mantenha distância dos leões.',
                needStraw: 'Encontre palha perto das carroças, do lado de fora do Coliseu.',
                craftDolls: 'Entre na rua dos artesãos, no mercado, e use a bancada dentro da oficina.',
                findRope: 'Encontre um laço resistente no Foro Romano.',
                distract: 'Retorne à arena e use os bonecos de palha para distrair os leões.',
                lassoAim: 'Mire no fragmento azul e pressione ESPAÇO ou AÇÃO para lançar o laço.',
                senate: 'Leve a memória restaurada ao Senado, no Foro Romano.',
                deliverOrder: 'Entregue o despacho no posto militar à esquerda do Foro.',
                warnMarket: 'Volte ao mercado e fale com a comerciante preocupada.',
                finalSenate: 'Retorne ao Senado. A cidade está entrando em colapso.'
            };
            setObjective(labels[state.step] || 'Explore a memória de Roma.');
        }
        renderScene();
        updateSprite();
        updateCamera();
        requestAnimationFrame(animate);
    }

    bindControls();
    start();
})();
