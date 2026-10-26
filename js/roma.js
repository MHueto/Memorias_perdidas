(() => {
    const SAVE_KEY = 'memoriasPerdidasRomaV1';
    const PLAYER_SIZE = 90;
    const PLAYER_VERTICAL_OFFSET = 4;
    const SPEED = 270;
    const MEMORY_X = 1338;
    const MEMORY_Y = 560;
    const ARENA_GATE_X = 1500;
    let historyUI;
    let atlas;
    let mapInert=[];
    let compassClock=0;
    let decaySaveClock = 0;
    const RENATO_SPRITE_SHEET = 'assets/images/renato/renato-walk-spritesheet-v4.png';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const areas = {
        city: { width: 2172, height: 724, floorY: 584, startX: 280, label: 'Entrada e mercado de Roma' },
        forum: { width: 2079, height: 756, floorY: 620, startX: 150, label: 'Foro Romano e Cúria' },
        colosseum: { width: 2079, height: 756, floorY: 666, startX: 150, label: 'Exterior do Coliseu' },
        arena: { width: 2079, height: 756, floorY: 708, startX: 240, label: 'Corredor de observação da arena' },
        artisans: { width:1536,height:768,floorY:578,startX:180,label:'Rua dos artesãos' },
        workshop: { width:1536,height:768,floorY:638,startX:180,label:'Oficina do artesão' },
        residential: { width:1536,height:768,floorY:578,startX:180,label:'Bairro residencial' },
        courtyard: { width:1536,height:768,floorY:636,startX:180,label:'Pátio da fonte' },
        senateHall: {width:1536,height:768,floorY:606,startX:180,label:'Senado de Roma'},
        ravennaCourt: {width:1536,height:768,floorY:606,startX:300,label:'Ravena · corte imperial (reconstituição)'}
    };

    // Every doorway has an explicit destination and return position; no guessed room pairing.
    const portals = {
        city:[{x:500,to:'artisans',spawn:180,label:'RUA DOS ARTESÃOS'}],
        forum:[{x:1040,to:'residential',spawn:180,label:'BAIRRO RESIDENCIAL'},{x:1590,to:'senateHall',spawn:190,label:'SENADO'}],
        senateHall:[{x:170,to:'forum',spawn:1590,label:'VOLTAR AO FORO'}],
        ravennaCourt:[{x:170,to:'forum',spawn:310,label:'VIAJAR DE VOLTA A ROMA'}],
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
        courtyard:{left:{to:'residential',spawn:1110,label:'BAIRRO'}},
        senateHall:{left:{to:'forum',spawn:1590,label:'FORO'}},
        ravennaCourt:{left:{to:'forum',spawn:310,label:'VOLTAR A ROMA'}}
    };

    const sprites = {
        right: ['0% 0%','14.2857% 0%','28.5714% 0%','42.8571% 0%','57.1429% 0%','71.4286% 0%','85.7143% 0%','100% 0%'],
        left: ['0% 100%','14.2857% 100%','28.5714% 100%','42.8571% 100%','57.1429% 100%','71.4286% 100%','85.7143% 100%','100% 100%']
    };

    const briefing = [
        {speaker:'PEDRO NEVES',text:'Renato, você chegou a Roma em 475 d.C. A memória deveria avançar até a deposição de Rômulo Augústulo em 476, mas está presa: alguma interferência impede esse desfecho.'},
        {speaker:'PEDRO NEVES',text:'Seus livros contêm os registros originais. Converse com os moradores e compare as pistas. A Ajuda da missão indica onde procurar; cada comparação abre o trecho certo do livro. Leia, anote e escolha o que combina com a história.'},
        {speaker:'PEDRO NEVES',text:'Os moradores não sabem nada sobre o Cofre. Para eles, esta é a vida cotidiana. Só você pode comparar o que vê com a história registrada nos livros.'},
        {speaker:'PEDRO NEVES',text:'A folha perdida no Coliseu é a primeira pista. O desafio dos leões é ficcional, assim como nossa viagem. As rachaduras que surgirem mostram a memória se desfazendo, não Roma inteira sendo destruída em 476.'},
        {speaker:'RENATO',text:'Vou recuperar a folha sem entrar na arena e descobrir por que essa memória não chega ao fim.'}
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
        { speaker: 'CORDOEIRO', text: 'Esse laço é resistente o bastante para puxar cargas, mas não desperdice: ele sempre volta para quem souber lançar.' },
        { speaker: 'RENATO', text: 'É exatamente o que preciso para alcançar a memória sem entrar na areia.' }
    ];
    const storyObjectives = {
        senate:'Entre no Senado pelo Foro e fale com Lúcio sobre a assinatura exigida no documento.',
        supplyInquiry:'Volte ao mercado e fale com a mercadora: a lista de receitas não combina com as remessas.',
        militaryPetition:'Procure o mensageiro no lado esquerdo do Foro: há uma petição retida.',
        routeInquiry:'Volte a Lúcio no Senado para conferir o endereço da corte no despacho.',
        travelRavenna:'Volte ao mensageiro no Foro para viajar até Ravena.',
        aftermath:'Em Ravena, converse com Rômulo e confronte a última ordem com seus livros.',
        deposition:'Acompanhe o desfecho de 476.'
    };
    const historySteps = Object.keys(storyObjectives);
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
    state.navigationTarget=areas[state.navigationTarget]?state.navigationTarget:null;
    state.visitedAreas = [...new Set(['city', state.area, ...(Array.isArray(state.visitedAreas) ? state.visitedAreas.filter(key => areas[key]) : [])])];
    // Old saves can resume safely: a distraction is replayed, never restored halfway through a timer.
    if (state.step === 'lassoAim' && !state.items.rope) state.step = 'distract';
    state.lionsDistracted = state.step === 'lassoAim';

    // Version 8 replaces the old 378–410 story, never the player's collected resources.
    const historicalIds=['power475','resources','army476','ravenna476','legacy476'];
    const chapterIds=['west475','resources','army476','ravenna476','legacy476'];
    const oldHistory=state.history && typeof state.history==='object'?state.history:{};
    const currentHistory=oldHistory.version===8;
    state.encounters=state.encounters&&typeof state.encounters==='object'?state.encounters:{};
    state.testimonies=Array.isArray(state.testimonies)?state.testimonies.filter(n=>n&&typeof n.id==='string'&&typeof n.text==='string').slice(-50):[];
    state.history={
        version:8,
        noted:currentHistory&&Array.isArray(oldHistory.noted)?[...new Set(oldHistory.noted.filter(id=>chapterIds.includes(id)))]:[],
        answers:currentHistory&&Array.isArray(oldHistory.answers)?[...new Set(oldHistory.answers.filter(id=>historicalIds.includes(id)))]:[],
        activeMs:currentHistory?Math.max(0,Math.min(Number(oldHistory.activeMs)||0,900000)):0,
        stage:currentHistory?Math.max(1,Math.min(Number(oldHistory.stage)||1,5)):1,
        epoch:currentHistory&&oldHistory.epoch==='476'?'476':'475',
        attempts:currentHistory?Math.max(0,Number(oldHistory.attempts)||0):0
    };
    if(!currentHistory && (state.items.memory||state.finished||historySteps.includes(state.step)||['emperorAudience','treatyDispatch','warnMarket','siegeCouncil','witness410','deliverOrder','finalSenate'].includes(state.step))){
        state.items.memory=true;state.items.dispatch=false;state.finished=false;
        state.step='senate';state.history.stage=2;
    }
    if(state.finished && state.history.answers.length<5){state.finished=false;state.step='senate';}
    // If the tab closed during the ending, replay the short scene instead of stranding the player.
    if(!state.finished&&state.history.answers.includes('legacy476')){state.step='deposition';state.area='ravennaCourt';state.x=1020;}
    state.cityState=state.finished?1:Math.max(state.history.stage,Math.min(4,1+Math.floor(state.history.activeMs/150000)));
    const player = { x: state.x, facing: 'right', moving: false, walkTime: 0 };
    let objectiveStep=state.step;
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
    const arenaFloor = 570;
    const mapPanel = document.querySelector('#romaMapPanel');
    const mapButton = document.querySelector('#romaMap');
    const combatStatus = document.querySelector('#romaCombatStatus');
    const routeStatus = document.querySelector('#romaRoute');
    const transition = document.querySelector('#romaTransition');
    const cinemaCaption = document.querySelector('#romaCinemaCaption');
    const backgrounds = { city:'entrada-roma-simples-v6.png', forum:'foro-senado-simples-v6.png', colosseum:'coliseu-exterior-simples-v6.png', arena:'arena-coliseu-simples-v6.png',artisans:'rua-dos-artesaos-simples-v6.png',workshop:'oficina-artesao-simples-v6.png',residential:'bairro-residencial-v4.png',courtyard:'patio-romano-simples-v6.png',senateHall:'senado-interior-simples-v6.png',ravennaCourt:'senado-interior-simples-v6.png' };
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
        if(objectiveStep!==state.step)state.navigationTarget=null;
        objectiveStep=state.step;
        objective.textContent = text;
    }

    function setStep(nextStep, objectiveText, checkpointMessage) {
        if(state.step!==nextStep)state.navigationTarget=null;
        state.step = nextStep;
        if (objectiveText) setObjective(objectiveText);
        if (checkpointMessage) setCheckpoint(checkpointMessage);
        else saveGame();
        renderScene();
    }

    // Residents know their own troubles, not the Cofre or the altered timeline.
    const people={
        'LÚCIO':{id:'lucio',greeting:'Que tipo de roupa é essa, viajante? Nunca vi um tecido assim nos arquivos.'},
        'MERCADORA':{id:'merchant',greeting:'Que roupas são essas? Esse casaco veio de algum mercado distante?'},
        'MENSAGEIRO':{id:'messenger',greeting:'Antes de tudo: que roupas são essas? E que calçados estranhos!'},
        'ARTESÃO':{id:'artisan',greeting:'Que costura diferente! Que tipo de roupa você está usando?'},
        'TRABALHADOR':{id:'worker',greeting:'Ei, que roupas são essas? Não parecem as de quem trabalha por aqui.'},
        'CORDOEIRO':{id:'ropemaker',greeting:'Que roupas curiosas! De onde veio esse casaco?'},
        'RÔMULO AUGÚSTULO':{id:'romulus',greeting:'Que tipo de roupa é essa? Não conheço esse traje. Quem o trouxe à corte?'},
        'ODOACRO':{id:'odoacer',greeting:'Que roupas são essas, viajante? Não reconheço esse uniforme.'}
    };
    function openDialogue(lines, onClose = null, person = null) {
        const roman=person||lines.map(line=>people[line.speaker]&&({...people[line.speaker],name:line.speaker})).find(Boolean);
        const first=roman&&!state.encounters[roman.id];
        shell.classList.add('has-modal');
        dialogueLines=first?[
            {speaker:roman.name,text:roman.greeting||'Que tipo de roupas são essas? Você veio de longe?'},
            {speaker:'RENATO',text:'Sou Renato. Vim de muito longe; estas são as roupas que usamos por lá.'},
            ...lines
        ]:lines;
        dialogueStep = 0;
        dialogueOnClose=()=>{
            if(roman){
                state.encounters[roman.id]=true;
                const line=lines.find(l=>l.speaker===roman.name);
                if(line&&!state.testimonies.some(t=>t.id===roman.id&&t.text===line.text)){
                    state.testimonies.push({id:roman.id,name:roman.name,text:line.text,epoch:state.history.epoch});
                    state.testimonies=state.testimonies.slice(-50);
                }
                saveGame();
            }
            onClose?.();
        };
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
        if(!historyUI?.isOpen()&&!dialogueOpen&&!craftOpen&&endingPanel.hidden)viewport.focus({ preventScroll: true });
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
        return ({ straw: 'Palha', dolls: 'Bonecos de palha', rope: 'Laço', memory: 'Memória de Roma', dispatch: 'Petição dos soldados' })[item];
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
        const id=options.id||state.area+'-'+type+'-'+x;
        const name=options.name||({citizen:'MORADOR',merchant:'COMERCIANTE',soldier:'SOLDADO',senator:'ESCRIVÃO',smith:'FERREIRO',neighbor:'MORADORA',messenger:'VIAJANTE',elder:'MORADOR IDOSO'})[type];
        node.dataset.npcId=id;node.dataset.name=name;
        node.append(sprite);
        const distance = Math.abs(options.distance || 80) * 2;
        npcActors.push({ node, sprite, x, row, id, name, type,
            min: Math.max(80,x-distance), max: Math.min(area().width-80,x+distance),
            direction: options.distance < 0 ? -1 : 1, walking: !!options.walk,
            clock: npcActors.length*143, pause: 0, speed: options.speed || (state.cityState>=4 ? 125 : type==='elder'?35:type==='messenger'?76:46+npcActors.length%4*6),
            floor:area().floorY - (options.lift || 0) - 1 });
        npcsLayer.append(node);
        if(options.emperor)node.classList.add('is-emperor');
        if(options.invader)node.classList.add('is-invader');
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
        const node = addProp('doll', x-27, arenaFloor-78, 'is-thrown-doll');
        node.dataset.hits='0';
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
                if(npc.x===npc.min || npc.x===npc.max) { if(npc.deposition){npc.walking=false;}else{npc.direction*=-1;npc.pause=450;} }
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
                const y=area().floorY-78+(arenaFloor-area().floorY)*t-Math.sin(t*Math.PI)*190;
                doll.node.style.left=`${x-27}px`; doll.node.style.top=`${y}px`;
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
                        doll.hits++;doll.node.dataset.hits=String(doll.hits);
                        doll.node.classList.toggle('is-frayed',doll.hits>=3);
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
            combatStatus.textContent=`DISTRAÇÃO ${Math.ceil(distractionTime/1000)}s · ${Math.abs(aimX-MEMORY_X)<52?'AGORA: AÇÃO / ESPAÇO':'Espere a mira alcançar a folha'}`;
            combatStatus.classList.toggle('is-ready',Math.abs(aimX-MEMORY_X)<52);
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
        (crowds[state.area]||[]).filter((_,i)=>state.cityState<4||i%2===0).forEach(([x,type],i)=>addNpc(x,type,{walk:true,distance:i%2?-65:85}));
        if(state.area==='city')addNpc(1050,'merchant',{id:'merchant',name:'MERCADORA'});
        if(state.area==='forum') {
            addNpc(1540,'senator',{talk:true});
            if(state.cityState>=3)[345,1660].forEach(x=>addNpc(x,'soldier',{walk:true,distance:45}));
        }
        if(state.area==='colosseum'){addNpc(1660,'soldier',{talk:true});addNpc(390,'smith',{id:'worker',name:'TRABALHADOR'});}
        if(state.area==='senateHall')addNpc(780,'senator',{id:'lucio',name:'LÚCIO'});
        if(state.area==='ravennaCourt'){
            addNpc(1150,'citizen',{id:'romulus',name:'RÔMULO AUGÚSTULO',emperor:!state.finished});
            addNpc(780,'soldier',{id:'odoacer',name:'ODOACRO'});
        }
        if(state.area==='forum'){addNpc(310,'messenger',{id:'messenger',name:'MENSAGEIRO'});addNpc(700,'smith',{id:'ropemaker',name:'CORDOEIRO'});}

        if(state.area==='artisans')addNpc(340,'smith',{id:'artisan',name:'ARTESÃO'});
        if(state.area==='workshop')addNpc(1070,'smith',{id:'artisan',name:'ARTESÃO'});
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
        if(state.area==='senateHall'&&!state.history.answers.includes('power475'))addProp('false-seal',865,area().floorY-60);
        if(state.area==='city'&&!state.history.answers.includes('resources'))addProp('sealed-accounts',1115,area().floorY-45);
        if(state.area==='ravennaCourt'&&!state.finished)addProp('false-seal',1220,area().floorY-60);
        if (state.area === 'city') {
            if (state.cityState >= 3) addProp('barricade', 640, area().floorY - 35);
            if (state.cityState >= 4) addProp('barricade', 1510, area().floorY - 35);
        }
        if (state.area === 'forum') {
            if (!has('rope')) addProp('rope', 593, area().floorY - 40);
            if (state.cityState >= 3) addProp('barricade', 720, area().floorY - 35);
            if (state.cityState >= 4) addProp('barricade', 1190, area().floorY - 35);
        }
        if (state.area === 'colosseum') {
            if (!has('straw')) addProp('straw-glint', 310, 600);
            const gate=addProp('arena-entry', ARENA_GATE_X-75, area().floorY-74);
            const label=document.createElement('span');label.textContent='COLISEU · ↑ ENTRAR';gate.append(label);
        }
        if(state.area==='workshop')addProp('forge-glow',520,510);
        if(state.area==='courtyard'&&!state.discoveries.fountain)addProp('echo',690,area().floorY-90);
        if (state.area === 'arena') {
            if (!has('memory')) {
                memoryNode=addProp('memory',MEMORY_X-20,MEMORY_Y-10);
                memoryNode.dataset.targetX=String(MEMORY_X);
                memoryNode.dataset.targetY=String(MEMORY_Y);
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
        renderDecay();
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
        if(historySteps.includes(state.step))return ({senate:['senateHall',780],supplyInquiry:['city',1050],militaryPetition:['forum',310],routeInquiry:['senateHall',780],travelRavenna:['forum',310],aftermath:['ravennaCourt',1150],deposition:['ravennaCourt',1150]})[state.step];
        return ({travelColosseum:['colosseum',1500],observeArena:['arena',1410],needStraw:['colosseum',330],craftDolls:['workshop',980],findRope:['forum',640],distract:['arena',1200],lassoAim:['arena',1200]})[state.step];
    }

    function navigationEdges(key) {
        const links=(portals[key]||[]).map(entry=>({...entry,kind:key==='ravennaCourt'?'journey':'door'}));
        Object.entries(exits[key]||{}).forEach(([side,exit])=>links.push({...exit,kind:key==='ravennaCourt'?'journey':'street',side,x:side==='left'?60:areas[key].width-60}));
        if(key==='colosseum')links.push({to:'arena',x:1500,kind:'door'});
        if(key==='forum'&&state.history.answers.includes('ravenna476'))links.push({to:'ravennaCourt',x:310,kind:'journey'});
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
        const target=state.navigationTarget?[state.navigationTarget,state.navigationTarget===state.area?(destination()?.[0]===state.area?destination()[1]:player.x):areas[state.navigationTarget].startX]:destination();if(!target)return null;
        if(from===target[0])return target;
        const path=pathTo(from,target[0]);
        return path?.path.length?[from,path.path[0].x]:null;
    }

    function renderRoute() {
        routeStatus.textContent=atlas?atlas.name(state.area):area().label;
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
        if(!mapOpen)return;
        mapOpen=false;atlas.close();mapPanel.hidden=true;shell.classList.remove('has-modal');
        mapInert.forEach(([node,previous])=>node.inert=previous);mapInert=[];
        heldKeys.clear();previousTime=performance.now();
        document.querySelector('#romaCompass').textContent=atlas.compass().text;
        mapButton.focus({preventScroll:true});
    }

    function openMap() {
        if(mapOpen||dialogueOpen||craftOpen||historyUI?.isOpen()||cutscene||sceneLoading||portalEntering||!endingPanel.hidden||lassoResolving)return;
        mapOpen=true;heldKeys.clear();player.moving=false;mapPanel.hidden=false;shell.classList.add('has-modal');
        mapInert=[...shell.children].filter(node=>node!==mapPanel).map(node=>[node,node.inert]);
        mapInert.forEach(([node])=>node.inert=true);
        atlas.open();
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
            if (state.step === 'needStraw' && within(330, 110)) return { x: 330, text: 'PALHA CAÍDA DA CARROÇA\n↑ / E RECOLHER', action: 'straw' };
            if (within(ARENA_GATE_X, 100)) return { x: ARENA_GATE_X, text: 'PORTÃO DO COLISEU\n↑ / E ENTRAR', action: 'arena' };
        }
        if (state.area === 'arena') {
            if (state.step === 'observeArena' && within(1410, 130)) return { x: 1410, y: 400, text: 'FOLHA NA AREIA\n↑ OBSERVAR', action: 'observe' };
            if (state.step === 'distract' && within(1100, 470)) return { x: player.x, text: 'BONECOS DE PALHA\n↑ LANÇAR', action: 'dolls' };
            if (state.step === 'lassoAim') return { x: player.x, text: 'MIRE NO FRAGMENTO\nAÇÃO / ESPAÇO', action: 'lasso' };
        }
        if(state.area==='senateHall'&&within(780,105))return {x:780,text:'LÚCIO · ARQUIVOS\n↑ / E CONVERSAR',action:state.step==='senate'?'senate':state.step==='routeInquiry'?'routeInquiry':'senateInfo'};
        if(state.area==='city'&&within(1050,110))return {x:1050,text:'MERCADORA\n↑ / E CONVERSAR',action:state.step==='supplyInquiry'?'merchant':'merchantInfo'};
        if(state.area==='ravennaCourt'&&within(1150,95))return {x:1150,text:'RÔMULO AUGÚSTULO\n↑ / E CONVERSAR',action:state.step==='aftermath'?'aftermath':'romulusInfo'};
        if(state.area==='workshop'&&within(980,120))return {x:980,text:'BANCADA DO ARTESÃO\n↑ '+(state.step==='craftDolls'?'FABRICAR':'EXAMINAR'),action:state.step==='craftDolls'?'craft':'workshopInfo'};
        if(state.area==='artisans'&&within(340,70))return {x:340,text:'ARTESÃO\n↑ CONVERSAR',action:'artisanTip'};
        if(state.area==='residential'&&within(530,70))return {x:530,text:'VIZINHANÇA\n↑ OBSERVAR',action:'neighborhood'};
        if(state.area==='courtyard'&&within(700,110))return {x:700,text:'FONTE DO PÁTIO\n↑ EXAMINAR',action:'fountain'};
        if (state.area === 'forum') {
            if (state.step === 'findRope' && within(640, 118)) return { x: 640, text: 'LAÇO DO CORDOEIRO\n↑ PEGAR', action: 'rope' };
            if(within(310,110))return {x:310,text:'MENSAGEIRO\n↑ / E '+(state.history.answers.includes('ravenna476')?'VIAJAR / CONVERSAR':'CONVERSAR'),action:state.step==='militaryPetition'?'messenger':state.history.answers.includes('ravenna476')?'travelRavenna':'messengerInfo'};
        }
        const npc=npcActors.filter(n=>within(n.x,68)).sort((a,b)=>Math.abs(x-a.x)-Math.abs(x-b.x))[0];
        if(npc)return {x:npc.x,text:npc.name+'\n↑ / E CONVERSAR',action:'citizen',npc};
        return null;
    }

    function updatePrompt() {
        propsLayer.querySelector('.roma-prop--arena-entry')?.classList.toggle('is-near',Math.abs(player.x-ARENA_GATE_X)<=100);
        propsLayer.querySelectorAll('.roma-prop--entrance').forEach(door=>door.classList.toggle('is-near',Math.abs(player.x-Number(door.dataset.x))<=85));
        const interaction = currentInteraction();
        if (!interaction || dialogueOpen || craftOpen || mapOpen || historyUI?.isOpen() || cutscene || !endingPanel.hidden || state.step==='lassoAim') { prompt.classList.remove('is-visible'); return; }
        const y = interaction.y ?? area().floorY - 205;
        prompt.style.left = `${interaction.x - 85}px`;
        prompt.style.top = `${y}px`;
        if(lastPrompt!==interaction.text) {prompt.querySelector('span').textContent=interaction.text;lastPrompt=interaction.text;}
        prompt.classList.add('is-visible');
    }

    async function startArenaVisit() {
        if(portalEntering)return;
        const firstVisit=state.step==='travelColosseum';
        await enterPortal({to:'arena',spawn:250});
        if(state.area!=='arena')return;
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
        setObjective('Mire na folha sobre a areia e pressione ESPAÇO ou AÇÃO para lançar o laço.');
        saveGame();
        addDoll(900);addDoll(1130);
        throwTime=900;distractionTime=24900;
        createAim();
        beginCutscene('dolls',2200,'Os bonecos chamam a atenção. Prepare o laço.');
    }

    function throwLasso() {
        if (state.area!=='arena' || state.step !== 'lassoAim' || lassoResolving || !reticle || throwTime>0) return;
        lassoResolving = true;
        const success = Math.abs(aimX - MEMORY_X) < 52;
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
            state.history.stage=2;state.cityState = Math.max(2,state.cityState);
            state.step = 'senate';
            state.lionsDistracted = false;
            setObjective('Entre no Senado e compare a folha com os livros de Renato.');
            setCheckpoint('Memória do Coliseu recuperada');
            showToast('ITEM ADQUIRIDO — MEMÓRIA DE ROMA');
            await setArea('colosseum', 1510);
            openDialogue([{ speaker: 'PEDRO NEVES', text: 'A folha é um salvo-conduto que interfere nas ordens do governo. Lúcio trabalha nos arquivos do Senado. Ouça o que ele diz e compare com os seus registros originais.' }]);
            lassoResolving = false;
        }, prefersReducedMotion ? 40 : 1120);
    }

    function handleInteraction() {
        if (dialogueOpen || craftOpen || mapOpen || historyUI?.isOpen() || cutscene || sceneLoading || portalEntering || lassoResolving || !endingPanel.hidden) return;
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
        if (interaction.action === 'craft') openDialogue([{speaker:'ARTESÃO',text:'Quer usar a bancada? Com essa palha e alguns suportes, consigo ajudá-lo a montar bonecos leves.'}],openCraft);
        if (interaction.action === 'rope') openDialogue(ropeHint, () => {
            state.items.rope = true;
            setStep('distract', 'Retorne à arena e use os bonecos de palha para distrair os leões.', 'Laço encontrado');
            showToast('ITEM ADQUIRIDO — LAÇO');
        });
        if (interaction.action === 'dolls') throwDolls();
        if (interaction.action === 'lasso') showToast('Use ESPAÇO ou o botão AÇÃO para lançar o laço.');
        if(interaction.action==='citizen'){
            const npc=interaction.npc,known=Object.values(people).find(p=>p.id===npc.id);
            const talk={
                citizen:'A cada mudança no comando, esperamos novas ordens. Eu só quero poder trabalhar e voltar para casa em segurança.',
                merchant:'Não basta ter mercadoria. Preciso pagar o transporte e saber quais rotas continuam seguras.',
                soldier:state.history.epoch==='475'?'Servimos ao governo, mas também precisamos sustentar nossas famílias. As promessas dos comandantes importam.':'Há soldados exigindo terras. Sem acordo com Orestes, muitos procuram outro comandante.',
                senator:'O nome do imperador aparece nos documentos. Fazer uma ordem ser obedecida depende também dos homens que comandam as tropas.',
                smith:'Conserto ferramentas e equipamento militar. Quando os pagamentos atrasam, o problema chega até a minha oficina.',
                neighbor:'Ainda há água na fonte e gente cuidando das casas. Nossa vida não se resume às decisões da corte.',
                messenger:'Levar uma carta exige estradas, abrigo e alguém disposto a recebê-la. Uma ordem distante não chega sozinha.',
                elder:'Já ouvi muitos governantes prometerem tranquilidade. Não consigo prever o que virá; espero que meus netos tenham dias melhores.'
            };
            const text=npc.id==='odoacer'?'Os soldados que me seguem querem que suas reivindicações sejam atendidas. Ter o título imperial não basta para conservar o comando.':talk[npc.type];
            openDialogue([{speaker:npc.name,text}],null,{id:npc.id,name:npc.name,greeting:known?.greeting});
        }
        if(interaction.action==='merchantInfo')openDialogue([{speaker:'MERCADORA',text:'Pago pelo transporte e pelas mercadorias antes de vendê-las. Quando as remessas atrasam, não sei como cobrir as cobranças.'}]);
        if(interaction.action==='messengerInfo')openDialogue([{speaker:'MENSAGEIRO',text:'Carrego pedidos e ordens entre os postos. Quando uma carta volta sem resposta, sou eu que tenho de explicar o atraso.'}]);
        if(interaction.action==='romulusInfo')openDialogue([{speaker:'RÔMULO AUGÚSTULO',text:state.finished?'Já não governo. Disseram que partirei para viver na Campânia.':'As ordens da corte ainda levam meu nome, mas são os comandantes que dispõem das tropas.'}]);
        if(interaction.action==='senateInfo')openDialogue([{speaker:'LÚCIO',text:has('memory')?'Tenho permissões que ninguém aceita e remessas sem confirmação. Você trouxe o salvo-conduto?':'Trabalho com os despachos da administração. Uma folha se perdeu perto do Coliseu; preciso dela para conferir as autorizações.'}]);
        if(interaction.action==='senate')openDialogue([
            {speaker:'LÚCIO',text:'Este salvo-conduto exige a assinatura de Nepos, em Ravena. Sem ela, o escrivão recusa até as ordens que chegam de Orestes. É o procedimento que recebi.'},
            {speaker:'RENATO',text:'Vou conferir quem está no poder nesta data. Talvez esse selo esteja impedindo as ordens de circular.'}
        ],()=>askHistory('power475',()=>{
            advanceHistory('supplyInquiry','475',2);
            openDialogue([{speaker:'RENATO',text:'O selo não combina com meus registros. As ordens agora podem circular. Preciso descobrir se há outras interferências; a mercadora conhece as contas do mercado.'}]);
        }));
        if(interaction.action==='merchant')openDialogue([
            {speaker:'MERCADORA',text:'As cobranças contam com remessas de todas as antigas províncias. Mas várias não chegam. Há um demonstrativo lacrado aqui; mandaram usar apenas esta lista.'},
            {speaker:'RENATO',text:'Quem controla as províncias também controla suas receitas. Vou conferir essa relação nos meus livros antes de abrir o demonstrativo.'}
        ],()=>askHistory('resources',()=>{
            advanceHistory('militaryPetition','476',3);
            beginCutscene('timeline',3800,'476 d.C. · Meses se passam na memória. O governo enfrenta limites de recursos, disputas pelo comando e exigências de suas tropas.');
        }));
        if(interaction.action==='messenger')openDialogue([
            {speaker:'MENSAGEIRO',text:'Os soldados pedem terras. Levo a petição, mas o posto a devolve como resolvida antes de ela chegar ao comando. Eles dizem que ainda não receberam resposta.'},
            {speaker:'RENATO',text:'A petição continua retida. Preciso entender por que essa reivindicação foi importante, não apenas entregar um papel.'}
        ],()=>askHistory('army476',()=>{
            state.items.dispatch=true;advanceHistory('routeInquiry','476',3);
            openDialogue([{speaker:'MENSAGEIRO',text:'Posso levar a petição agora. Consulte Lúcio sobre o endereço; os últimos despachos voltaram sem confirmação.'}]);
        }));
        if(interaction.action==='routeInquiry')openDialogue([
            {speaker:'LÚCIO',text:'Este despacho manda entregar a petição ao imperador, no Coliseu. Não recebi confirmação de nenhuma das entregas. Sem destino confirmado, o mensageiro não parte.'},
            {speaker:'RENATO',text:'O nome Roma está me confundindo. A cidade e a residência do imperador não precisam ser o mesmo lugar. Meus registros podem esclarecer isso.'}
        ],()=>askHistory('ravenna476',()=>{
            advanceHistory('travelRavenna','476',4);
            openDialogue([{speaker:'LÚCIO',text:'Ravena, então. Vou avisar o mensageiro. Ele pode acompanhá-lo até a corte.'}]);
        }));
        if(interaction.action==='travelRavenna')openDialogue([
            {speaker:'MENSAGEIRO',text:'Partiremos para Ravena. As notícias são graves: Orestes foi derrotado, e as tropas de Odoacro avançam para a corte.'},
            {speaker:'RENATO',text:'É uma viagem para outra cidade, não uma passagem dentro de Roma. Quero ouvir o que está acontecendo na corte.'}
        ],async()=>{
            const arrived=await setArea('ravennaCourt',1020);
            if(!arrived)return;
            if(!state.finished)advanceHistory('aftermath','476',4);
            beginCutscene('timeline',3200,'ROMA → RAVENA · Viagem resumida. Interior de corte estilizado, não uma reprodução arqueológica.');
        });
        if(interaction.action==='aftermath')openDialogue([
            {speaker:'RÔMULO AUGÚSTULO',text:'Meu pai não está mais aqui para comandar as tropas. Odoacro chegou, mas continuam exigindo que toda decisão conserve meu poder. Não sei quem fez essa ordem.'},
            {speaker:'RENATO',text:'Essa exigência mantém tudo parado. Vou comparar o desfecho com meus registros; não posso confundir a queda do governo com o fim de toda a vida romana.'}
        ],()=>askHistory('legacy476',()=>{
            state.step='deposition';saveGame();startDeposition();
        }));
    }

    function startDeposition(){
        if(state.area!=='ravennaCourt')return;
        world.dataset.step='deposition';
        const ruler=npcActors.find(n=>n.id==='romulus'),commander=npcActors.find(n=>n.id==='odoacer');
        ruler?.node.classList.remove('is-emperor');
        propsLayer.querySelector('.roma-prop--false-seal')?.remove();
        if(commander){commander.walking=true;commander.min=780;commander.max=1020;commander.direction=1;commander.speed=55;commander.deposition=true;}
        beginCutscene('deposition',6200,'RAVENA, 476 · Odoacro depõe Rômulo Augústulo. A cena é uma encenação. O Oriente e muitos aspectos da vida romana continuam.',finishHistory);
    }

    function askHistory(id,callback){
        historyUI.ask(id,()=>{
            if(!state.history.answers.includes(id))state.history.answers.push(id);
            saveGame();shell.classList.remove('is-restoring');void shell.offsetWidth;shell.classList.add('is-restoring');
            callback();
        });
    }
    function advanceHistory(step,epoch,stage){
        state.history.epoch=epoch;state.history.stage=stage;
        state.cityState=Math.max(stage,Math.min(4,1+Math.floor(state.history.activeMs/150000)));
        setStep(step,storyObjectives[step],'Interferência desfeita · '+epoch);updateHistoryStatus();
    }
    function finishHistory(){
        state.step='complete';state.finished=true;state.history.stage=1;state.cityState=1;state.history.epoch='476';
        window.RomaCampaign.complete('fall');
        saveGame();setObjective('Memória estabilizada: cinco interferências desfeitas. Releia os livros e as conversas.');
        renderScene();endingPanel.hidden=false;endingPanel.querySelector('a').focus();
    }
    function updateHistoryStatus(){
        world.dataset.epoch=state.history.epoch;world.dataset.erosion=String(state.cityState);
        world.dataset.activeMs=String(Math.floor(state.history.activeMs));
        document.querySelector('#romaQuestCount').textContent=state.history.answers.length+'/5';
        const status=document.querySelector('#romaMemoryStatus');
        status.textContent=state.history.epoch+' d.C. · '+state.history.answers.length+'/5 pistas · '+(state.finished?'memória estável':['','memória íntegra','memória: fissuras','memória: desgaste','memória: erosão','memória: erosão'][state.cityState]);
    }
    function renderDecay(){
        const layer=document.querySelector('#romaDecay');layer.replaceChildren();
        world.dataset.cityState=String(state.cityState);updateHistoryStatus();
        const level=state.cityState;if(level<2||state.area==='ravennaCourt')return;
        const positions={city:[160,700,1360,1850],forum:[190,840,1390,1860],colosseum:[95,875,1240,1910],arena:[210,650,1800],artisans:[260,610,1270],workshop:[410,1150],residential:[280,740,1390],courtyard:[370,1040,1320],senateHall:[340,930,1380]};
        const prop=(kind,x,y)=>{const n=document.createElement('i');n.className='roma-decay roma-decay--'+kind;n.style.left=x+'px';n.style.top=y+'px';layer.append(n);};
        (positions[state.area]||[]).forEach((x,i)=>{
            prop('crack',x,area().floorY-215-(i%2)*105);
            if(level>=3)prop('rubble',x-25,area().floorY-20);
            if(level>=4&&(i===1||level===5)&&state.area!=='arena'){
                prop('smoke',x-24,area().floorY-244);
                prop('fire',x+10,area().floorY-72);
            }
            if(level>=5)prop('rubble',x+110,area().floorY-23);
        });
        if(level>=3&&['city','artisans','residential'].includes(state.area))prop('boards',state.area==='city'?850:410,area().floorY-190);
    }
    function updateDecay(delta){
        if(state.finished)return;
        state.history.activeMs+=delta;decaySaveClock+=delta;
        const level=Math.max(state.history.stage,Math.min(4,1+Math.floor(state.history.activeMs/150000)));
        if(level!==state.cityState){state.cityState=level;renderDecay();npcActors.forEach(n=>{if(n.walking)n.speed=Math.min(125,n.speed+18);});}
        if(decaySaveClock>=5000){decaySaveClock=0;saveGame();updateHistoryStatus();}
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
        document.querySelector('#renatoShadow').style.transform=`translate(${Math.round(player.x-19)}px, ${area().floorY-8}px)`;
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
        if(cutscene?.kind==='deposition')focus=1020;
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
        aimX = MEMORY_X + (prefersReducedMotion ? 0 : Math.sin(aimClock / 850) * 115);
        reticle.style.left = `${aimX}px`;
        reticle.style.top = `${MEMORY_Y}px`;
        reticle.classList.toggle('is-on-target',Math.abs(aimX-MEMORY_X)<52);
    }

    function update(delta) {
        world.dataset.step=state.step;
        const paused=dialogueOpen||craftOpen||mapOpen||historyUI?.isOpen()||sceneLoading||portalEntering||!endingPanel.hidden||document.hidden;
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
            if(!cutscene&&!lassoResolving)updateDecay(delta);
            updateNpcs(delta);updateLions(delta);updateEffects(delta);
            if(!cutscene&&!lassoResolving)updateAim(delta);
            if(cutscene){cutscene.clock+=delta;if(cutscene.clock>=cutscene.duration)endCutscene();}
        }
        compassClock+=delta;
        if(compassClock>160&&atlas){compassClock=0;const guidance=atlas.compass();const n=document.querySelector('#romaCompass');if(n.textContent!==guidance.text)n.textContent=guidance.text;}
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
        if (dialogueOpen || craftOpen || mapOpen || historyUI?.isOpen() || cutscene || sceneLoading || portalEntering || !endingPanel.hidden) return;
        if (state.step === 'lassoAim') throwLasso();
    }

    function setKey(event, pressed) {
        if(event.defaultPrevented||historyUI?.isOpen())return;
        const key = event.key.toLowerCase();
        if(key==='tab' && pressed && (dialogueOpen||craftOpen||mapOpen||!endingPanel.hidden)) {
            const modal=dialogueOpen?dialogue:craftOpen?craftPanel:mapOpen?mapPanel:endingPanel;
            const buttons=[...modal.querySelectorAll('button:not(:disabled),a[href],summary')].filter(node=>node.getClientRects().length);
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
        document.querySelector('#romaReviewEnd').addEventListener('click',()=>{endingPanel.hidden=true;heldKeys.clear();historyUI.review();});
        mapButton.addEventListener('click',openMap);
        document.querySelector('#romaCloseMap').addEventListener('click',closeMap);
        document.querySelector('#atlasBook').addEventListener('click',()=>{closeMap();historyUI.open();});
        document.querySelector('#romaSkip').addEventListener('click',endCutscene);
        resetButton.addEventListener('click', () => { if(confirm('Reiniciar apenas o progresso de Roma?'))window.location.assign('roma.html?reset=1'); });
        document.querySelectorAll('[data-direction]').forEach((button) => {
            const direction = button.dataset.direction;
            button.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                button.setPointerCapture?.(event.pointerId);
                if (dialogueOpen || craftOpen || mapOpen || historyUI?.isOpen() || cutscene || sceneLoading || portalEntering || !endingPanel.hidden) return;
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
        chapter.textContent = 'MEMÓRIA IV — OCIDENTE · 475–476 d.C.';
        if (state.finished) { state.cityState = 1; setObjective('Memória de Roma concluída.'); endingPanel.hidden = false; }
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
                lassoAim: 'Mire na folha sobre a areia e pressione ESPAÇO ou AÇÃO para lançar o laço.',
            };
            setObjective(storyObjectives[state.step] || labels[state.step] || 'Explore a memória de Roma.');
        }
        renderScene();
        updateSprite();
        updateCamera();
        if(state.step==='deposition')startDeposition();
        requestAnimationFrame(animate);
    }

    historyUI=window.RomaHistory.create({
        getState:()=>({step:state.step,noted:state.history.noted,answers:state.history.answers,testimonies:state.testimonies,canOpen:!dialogueOpen&&!craftOpen&&!mapOpen&&!cutscene&&!sceneLoading&&!portalEntering&&!lassoResolving&&endingPanel.hidden}),
        onPause:()=>{heldKeys.clear();player.moving=false;},
        onResume:()=>{heldKeys.clear();previousTime=performance.now();},
        onNote:id=>{if(!state.history.noted.includes(id))state.history.noted.push(id);saveGame();},
        onMistake:()=>{state.history.attempts++;saveGame();},
        onGuideRoute:()=>{
            const target=destination();if(!target)return;
            state.navigationTarget=target[0];saveGame();
            propsLayer.querySelectorAll('.roma-prop--route,.roma-prop--entrance,.roma-prop--destination').forEach(node=>node.remove());
            renderRoute();document.querySelector('#romaCompass').textContent=atlas.compass().text;
        }
    });
    atlas=window.RomaAtlas.create({
        areas,names:areas,edges:navigationEdges,
        getState:()=>({area:state.area,x:player.x,epoch:state.history.epoch,visited:state.visitedAreas,answers:state.history.answers.length,
            objective:destination(),objectiveText:objective.textContent,pinned:state.navigationTarget,unlockedRavenna:state.history.answers.includes('ravenna476'),
            items:Object.keys(state.items).filter(key=>has(key)).map(itemLabel)}),
        onMark:key=>{
            state.navigationTarget=key;saveGame();
            propsLayer.querySelectorAll('.roma-prop--route,.roma-prop--entrance,.roma-prop--destination').forEach(node=>node.remove());
            renderRoute();
        }
    });
    bindControls();
    start();
})();
