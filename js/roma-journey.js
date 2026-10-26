(() => {
'use strict';
const data=window.ROMA_CAMPAIGN_DATA,store=window.RomaCampaign;
const requested=new URLSearchParams(location.search).get('epoca')||store.next()||'foundation';
const era=data.chapters.find(c=>c.id===requested&&c.missions);
if(!era||!store.unlocked(era.id)){location.replace('campanha-roma.html');return;}
document.title=era.period+' · Memórias Perdidas';
const $=s=>document.querySelector(s),world=$('#journeyWorld'),viewport=$('#journeyViewport'),player=$('#journeyRenato'),dialog=$('#journeyDialog'),body=$('#journeyDialogBody'),actions=$('#journeyDialogActions');
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(text,fn,cls)=>{const b=el('button',text,cls);b.type='button';b.addEventListener('click',fn);return b;};
let state=store.read(era.id)||{x:180,facing:'right',started:false,answers:[],found:[],noted:[],greeted:[],delivered:[],carrying:null,puzzle:false};
for(const key of ['answers','found','noted'])state[key]=state[key].filter(id=>era.missions.some(m=>m.id===id));
state.delivered=state.delivered.filter(id=>era.practical.items?.some(i=>i[0]===id));
const keys=new Set(),actors=[],props=[],glitches=[];
let ready=false,lastTime=performance.now(),walkClock=0,saveClock=0,lastPrompt='',lastFocus=null,toastTimer,loadAttempt=0;
let scale=1,viewWidth=0,viewHeight=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const current=()=>era.missions.find(m=>!state.answers.includes(m.id));
const complete=()=>state.answers.length===era.missions.length&&state.puzzle;
const save=()=>{store.save(era.id,state);};
const say=text=>{const n=$('#journeyToast');clearTimeout(toastTimer);n.textContent=text;n.hidden=false;toastTimer=setTimeout(()=>n.hidden=true,4000);};
const clearKeys=()=>{keys.clear();};
function modal(title,eyebrow='REGISTROS DO COFRE · TEMPO PAUSADO'){
 clearKeys();if(!dialog.open){lastFocus=document.activeElement;dialog.showModal();}
 $('#journeyDialogTitle').textContent=title;$('#journeyDialogEyebrow').textContent=eyebrow;body.replaceChildren();actions.replaceChildren();body.scrollTop=0;
 $('#journeyDialogTitle').tabIndex=-1;$('#journeyDialogTitle').focus();
}
function close(){if(dialog.open)dialog.close();clearKeys();lastTime=performance.now();if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});else viewport.focus({preventScroll:true});}
$('#journeyClose').addEventListener('click',close);
dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
function paragraphs(...texts){for(const text of texts)body.append(el('p',text));}
function lines(items,done){let i=0;const show=()=>{modal(items[i][0],'CONVERSA · '+era.date);paragraphs(items[i][1]);actions.append(button(i===items.length-1?'Continuar':'Próximo',()=>{if(++i<items.length)show();else{close();done?.();}},'primary'));};show();}
function sources(book){const details=el('details');details.append(el('summary','Fontes deste registro'));const list=el('ul');for(const id of book.sources){const [label,url]=data.sources[id];const li=el('li'),a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);list.append(li);}details.append(list);body.append(details);}
function readBook(m=current()||era.missions[0],returnTo){
 modal(m.book.title,'LIVRO ORIGINAL · '+era.date);const tabs=el('nav',null,'journey-book-tabs');tabs.setAttribute('aria-label','Capítulos do livro');
 for(const other of era.missions){const b=button(other.book.title,()=>readBook(other,returnTo));if(other.id===m.id)b.setAttribute('aria-current','page');tabs.append(b);}body.append(tabs);
 paragraphs(m.book.summary);const evidence=el('p',m.book.evidence,'journey-evidence');evidence.dataset.evidence=m.id;body.append(evidence);sources(m.book);
 const note=button(state.noted.includes(m.id)?'Evidência anotada':'Anotar a evidência',()=>{if(!state.noted.includes(m.id)){state.noted.push(m.id);save();}readBook(m,returnTo);},'primary');note.disabled=state.noted.includes(m.id);note.id='journeyNote';actions.append(note);
 if(returnTo)actions.append(button('Voltar à pista',returnTo));
 else actions.append(button('Voltar ao cenário',close));
}
function compare(m){
 modal('O que foi alterado?','PISTA '+(era.missions.indexOf(m)+1)+' / 3');dialog.dataset.mission=m.id;
 paragraphs(m.observation);body.append(el('p',m.question,'journey-evidence'));
 const consult=button('Ler: '+m.book.title,()=>readBook(m,()=>compare(m)));consult.id='journeyConsult';body.append(consult);
 const unlocked=state.noted.includes(m.id)&&state.found.includes(m.id);
 if(!unlocked)paragraphs('Leia e anote a evidência correspondente antes de comparar.');else body.append(el('p',m.book.evidence,'journey-evidence'));
 const options=el('div',null,'journey-options');body.append(options);
 for(const [id,text,why] of m.options){
  const b=button(text,()=>{
   body.querySelector('#journeyFeedback')?.remove();actions.replaceChildren();
   const good=id===m.correct,feedback=el('div',good?m.lesson:why+' Consulte o registro e tente novamente.','journey-feedback'+(good?' is-correct':''));feedback.id='journeyFeedback';feedback.setAttribute('role','status');body.append(feedback);feedback.tabIndex=-1;feedback.focus();
   if(good){options.querySelectorAll('button').forEach(n=>n.disabled=true);const apply=button(m.restore,()=>{if(!state.answers.includes(m.id))state.answers.push(m.id);save();close();refresh();say('Interferência desfeita · '+state.answers.length+'/3');},'primary');apply.id='journeyRestore';actions.append(apply);}
  });b.disabled=!unlocked;b.dataset.answer=id;options.append(b);
 }
}
function greet(actor,after){
 const items=[];if(!state.greeted.includes(actor.id)){state.greeted.push(actor.id);save();items.push([actor.name,actor.greeting||'Que tipo de roupas são essas? Nunca vi alguém vestido assim.'],['RENATO','Venho de longe. Estou tentando entender o que acontece por aqui.']);}
 items.push([actor.name,actor.speech]);lines(items,after);
}
function talk(actor){
 const m=actor.mission;
 if(!m){greet(actor);return;}
 greet(actor,()=>{
  if(state.answers.includes(m.id)){lines([['RENATO',m.lesson]]);return;}
  if(current()?.id!==m.id){say('Renato: vou concluir a pista atual antes de comparar esta.');return;}
  if(!state.found.includes(m.id)){say('Procure: '+m.clue+'. O roteiro mostra a direção.');return;}
  compare(m);
 });
}
function observe(m){
 if(!state.found.includes(m.id))state.found.push(m.id);save();refresh();
 modal(m.clue,'OBSERVAÇÃO DE RENATO');paragraphs(m.observation,'Vou conversar com '+m.npc+' e comparar esta pista com o registro original.');
 actions.append(button('Consultar o livro',()=>readBook(m,()=>observe(m))),button('Voltar ao cenário',close,'primary'));
}
function guide(){
 modal('Por onde investigar?','ROTEIRO · '+era.period);
 const m=current();
 if(m){
  paragraphs(state.found.includes(m.id)?'Converse com '+m.npc+' para comparar a pista.':'Procure '+m.clue.toLowerCase()+', depois converse com '+m.npc+'.');
  const target=state.found.includes(m.id)?m.x:m.clueX;
  paragraphs('A direção é '+(target<state.x?'à esquerda':'à direita')+' de Renato. Use A/D ou as setas para andar; E ou o botão Interagir para examinar.');
  const list=el('ol',null,'journey-step-list');for(const item of era.missions)list.append(el('li',(state.answers.includes(item.id)?'Concluída · ':'')+item.book.title));body.append(list);
  actions.append(button('Abrir o registro',()=>readBook(m,guide)),button('Seguir a pista',close,'primary'));
 }else{paragraphs(era.practical.hint);actions.append(button('Voltar ao cenário',close,'primary'));}
}
function practical(){
 if(complete()){ending();return;}
 if(current()){say('Primeiro investigue as três interferências.');return;}
 if(era.practical.type==='building'){
  if(state.carrying){const name=era.practical.items.find(i=>i[0]===state.carrying)[1];state.delivered.push(state.carrying);state.carrying=null;save();refresh();say(name+' entregue · '+state.delivered.length+'/3');if(state.delivered.length===3){state.puzzle=true;finish();}return;}
  lines([[era.practical.npc,'Agora sabemos que materiais pertencem à cabana. Preciso de madeira, argila e palha. Traga um de cada vez, por favor.']]);
 }else if(era.practical.type==='route')routePuzzle();else waterPuzzle();
}
function pickMaterial(id){
 if(state.carrying){say('Leve primeiro '+era.practical.items.find(i=>i[0]===state.carrying)[1].toLowerCase()+' à cabana.');return;}
 if(state.delivered.includes(id))return;state.carrying=id;save();refresh();say('Material recolhido. Leve à cabana indicada.');
}
function routePuzzle(){
 let index=0;const route=[['Armazém','Ostia, o porto','Uma montanha sem cais'],['Ostia','Rota pelo Mediterrâneo','Caminho terrestre pelo mar'],['Portos de destino','Distribuir os mantimentos','Apagar as pessoas das listas']];
 const show=()=>{
  modal('Reconectar o abastecimento','MODELO DIDÁTICO · SEM LIMITE DE TENTATIVAS');paragraphs('As conquistas não se sustentavam apenas com vitórias. Pessoas, mantimentos e informações precisavam circular. Reconstitua uma rota simplificada de abastecimento.');
  body.append(el('p',['Armazém',index>0?'Ostia':null,index>1?'Mediterrâneo':null].filter(Boolean).join(' → '),'journey-route-progress'));
  paragraphs('Etapa '+(index+1)+'/3 · '+route[index][0]);const choices=el('div',null,'journey-options');body.append(choices);
  const good=button(route[index][1],()=>{index++;if(index===3){state.puzzle=true;finish();}else show();});good.dataset.route='correct';
  const wrong=button(route[index][2],()=>{body.querySelector('#routeFeedback')?.remove();const p=el('p','Confira o destino e o meio de transporte. Precisamos ligar armazenamento, porto e circulação marítima, sem apagar quem faz o trabalho.','journey-feedback');p.id='routeFeedback';p.setAttribute('role','status');body.append(p);});wrong.dataset.route='wrong';
  if(index===1)choices.append(wrong,good);else choices.append(good,wrong);
  actions.append(button('Consultar os registros',()=>readBook(era.missions[1],routePuzzle)));
 };show();
}
function waterPuzzle(){
 const heights=[2,4,3],desired=[3,2,1];
 modal('Ligar a fonte ao canal','MODELO SIMPLIFICADO · ESCOAMENTO POR GRAVIDADE');
 paragraphs('A nascente está na altura 4. Organize os três trechos em uma descida contínua: 3, 2 e 1. Toque em cada trecho para mudar sua altura. Este esquema não reproduz uma obra romana específica.');
 body.append(el('p','Nascente: 4 → canais → fonte','journey-route-progress'));
 const grid=el('div',null,'journey-puzzle'),flow=el('div',null,'journey-water-flow');flow.setAttribute('aria-hidden','true');body.append(grid,flow);
 for(let i=0;i<3;i++){const b=button('',()=>{heights[i]=heights[i]%4+1;render();});b.dataset.channel=String(i);grid.append(b);}
 function render(){[...grid.children].forEach((b,i)=>{b.replaceChildren(el('small','Trecho '+(i+1)),el('span',String(heights[i])));b.setAttribute('aria-label','Trecho '+(i+1)+', altura '+heights[i]+'. Clique para alterar.');});}
 render();const feedback=el('p');feedback.setAttribute('role','status');body.append(feedback);
 const check=button('Testar o fluxo',()=>{const ok=heights.every((h,i)=>h===desired[i]);feedback.textContent=ok?'A água percorre a descida e alcança a fonte. Obra e manutenção fazem parte do abastecimento.':'Há uma subida ou um trecho fora da sequência. Organize 3 → 2 → 1, a partir da nascente na altura 4.';feedback.className='journey-feedback'+(ok?' is-correct':'');flow.classList.toggle('is-flowing',ok);if(ok){check.disabled=true;actions.append(button('Restaurar o abastecimento',()=>{state.puzzle=true;finish();},'primary'));}});check.id='journeyWaterCheck';actions.append(check);
}
function finish(){save();store.complete(era.id);refresh();ending();}
function ending(){
 modal('Memória restaurada','FRAGMENTO '+era.number+' · '+era.period);paragraphs(era.summary);
 const list=el('ul');for(const m of era.missions)list.append(el('li',m.lesson));body.append(list);
 paragraphs('A passagem para o próximo período comprime muitos séculos. Não é uma mudança que ocorreu de um dia para outro.',era.bridge);
 const next=data.chapters[data.chapters.indexOf(era)+1];const link=el('a','Continuar: '+next.period+' →','primary');link.href=store.href(next.id);actions.append(link,button('Revisitar este cenário',close));
}
function icon(kind){
 const shapes={
  posts:'<path d="M4 25h24v5H4z" fill="#96734e"/><path d="M7 8h4v20H7zm14 0h4v20h-4z" fill="#443b35"/><path d="M9 5h14v4H9z" fill="#c5a26c"/>',
  pot:'<path d="M11 4h10v5h-2v4h6v14H7V13h6V9h-2z" fill="#b7683d"/><path d="M10 17h13v3H10z" fill="#f2bf79"/>',
  map:'<path d="M3 5h26v23H3z" fill="#ddc58e"/><path d="M6 15h6v5h7v-9h6" fill="none" stroke="#437b89" stroke-width="3"/><path d="M5 7h6v3H5zm17 16h5v3h-5z" fill="#776345"/>',
  fragment:'<path d="M8 3h16v6h5v17H9v-5H3V9h5z" fill="#cab58c"/><path d="M9 12h12v4H9zm4 7h12v3H13z" fill="#745e51"/>',
  scroll:'<path d="M4 5h25v5h-3v18H7V10H4z" fill="#dfc999"/><path d="M9 13h13v2H9zm0 6h10v2H9z" fill="#746148"/>',
  wood:'<path d="M4 12h24v6H4zm2 7h21v6H6z" fill="#805137"/><path d="M7 13h19v2H7z" fill="#d3a06a"/>',
  clay:'<path d="M6 25V14h5V9h10v5h6v11z" fill="#bd774e"/><path d="M11 13h8v4h-8z" fill="#e1a374"/>',
  straw:'<path d="M7 28L11 4h3l-1 24zm8 0V3h3v25zm5 0L22 5h3v23z" fill="#e6bd63"/><path d="M5 17h23v4H5z" fill="#997044"/>'
 };
 const span=el('span');span.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true">'+(shapes[kind]||shapes.scroll)+'</svg>';return span.firstChild;
}
function addProp(x,kind,id,onUse,label){const n=el('div',null,'journey-prop');n.style.left=(x-24)+'px';n.style.top=(era.floor-42)+'px';n.append(icon(kind));world.querySelector('#journeyProps').append(n);const prop={x,node:n,id,onUse,label};props.push(prop);return prop;}
function addActor(x,variant,name,id,speech,greeting,mission,walking=false){
 const variants={citizen:['a',0],merchant:['a',1],neighbor:['b',1],messenger:['b',2],elder:['b',3]};
 const [sheet,row]=variants[variant]||variants.citizen,n=el('div',null,'journey-person'),sprite=el('div',null,'journey-person-sprite');sprite.style.backgroundImage="url('assets/images/roma/npcs-simple-"+sheet+"-v4.png')";n.append(sprite);$('#journeyPeople').append(n);
 const a={x,home:x,variant,name,id,speech,greeting,mission,walking,row,node:n,sprite,dir:1,clock:0};actors.push(a);return a;
}
function refresh(){
 const m=current();world.dataset.era=era.id;world.dataset.step=m?m.id:complete()?'complete':'practical';
 $('#journeyEra').textContent=era.number+' · '+era.period+' · '+state.answers.length+'/3';
 $('#journeyObjective').textContent=m?(state.found.includes(m.id)?'Fale com '+m.npc+' e compare a pista.':'Examine '+m.clue.toLowerCase()+'.'):complete()?'Memória restaurada. Você pode revisitar ou seguir para a próxima.':era.practical.hint;
 $('#journeyPlace').textContent=era.date+(state.carrying?' · levando '+era.practical.items.find(i=>i[0]===state.carrying)[1].toLowerCase():'');
 for(const g of glitches)g.node.classList.toggle('is-fixed',state.answers.includes(g.id));
 const helper=actors.find(a=>a.name===era.practical.npc);if(helper&&!m){helper.x=era.practical.x;helper.practical=true;}
 for(const p of props){if(p.mission)p.node.classList.toggle('is-found',state.found.includes(p.mission.id));if(p.material)p.node.hidden=!!current()||state.delivered.includes(p.id)||state.carrying===p.id;}
 props.filter(p=>p.practical).forEach(p=>p.node.hidden=!!current());
 world.querySelectorAll('.journey-target').forEach(n=>n.remove());
 let target;
 if(m)target=state.found.includes(m.id)?actors.find(a=>a.mission?.id===m.id):props.find(p=>p.mission?.id===m.id);
 else if(state.carrying||era.practical.type!=='building'||complete())target=props.find(p=>p.practical);
 else target=props.find(p=>p.material&&!state.delivered.includes(p.id));
 if(target){const marker=el('span',m?(state.found.includes(m.id)?m.npc:m.clue):state.carrying?'Entregar material':complete()?'Próxima memória':target.label,'journey-target');target.node.append(marker);}
}
function candidates(){return [
 ...actors.map(a=>({x:a.x,label:a.practical?era.practical.title:'Falar com '+a.name,use:()=>a.practical?practical():talk(a)})),
 ...props.filter(p=>!p.node.hidden&&(!p.mission||!state.found.includes(p.id))).map(p=>({x:p.x,label:p.label,use:p.onUse}))
 ];}
function nearest(){return candidates().filter(c=>Math.abs(c.x-state.x)<105).sort((a,b)=>Math.abs(a.x-state.x)-Math.abs(b.x-state.x))[0];}
function interact(){if(!ready||dialog.open)return;clearKeys();const near=nearest();if(near)near.use();else say('Aproxime-se de uma pessoa ou da pista indicada.');}
function resize(){viewWidth=viewport.clientWidth;viewHeight=viewport.clientHeight;scale=Math.max(.55,viewHeight*.79/(era.floor-4));}
function paint(delta){
 const moving=ready&&!dialog.open&&!document.hidden&&(keys.has('right')!==keys.has('left'));
 if(moving){const dir=keys.has('right')?1:-1;state.facing=dir>0?'right':'left';state.x=Math.max(70,Math.min(era.width-70,state.x+dir*280*delta/1000));walkClock+=delta;saveClock+=delta;if(saveClock>1000){save();saveClock=0;}}
 const frame=moving?1+Math.floor(walkClock/145)%7:0;
 player.style.transform='translate('+Math.round(state.x-45)+'px,'+(era.floor-94)+'px)';player.style.backgroundPosition=(frame*100/7)+'% '+(state.facing==='right'?0:100)+'%';
 Object.assign(player.dataset,{x:state.x.toFixed(1),facing:state.facing,frame:String(frame)});
 $('#journeyShadow').style.transform='translate('+(state.x-19)+'px,'+(era.floor-7)+'px)';
 const max=Math.max(0,era.width*scale-viewWidth),camera=Math.max(0,Math.min(max,state.x*scale-viewWidth*.46));
 world.style.transform='translate('+(-Math.round(camera))+'px,'+Math.round(viewHeight*.79-era.floor*scale)+'px) scale('+scale+')';
 for(const a of actors){const movingNpc=a.walking&&ready&&!dialog.open&&!document.hidden&&!reduced.matches;if(movingNpc){a.x+=a.dir*32*delta/1000;a.clock+=delta;if(Math.abs(a.x-a.home)>65)a.dir*=-1;}
  const face=movingNpc?a.dir:(state.x<a.x?-1:1),f=movingNpc?Math.floor(a.clock/210)%4:1;
  a.node.style.transform='translate('+Math.round(a.x-45)+'px,'+(era.floor-91)+'px)';a.sprite.style.backgroundPosition=(f*100/3)+'% '+(a.row*100/3)+'%';a.sprite.style.transform='scaleX('+face+')';a.node.dataset.facing=face<0?'left':'right';
 }
 const n=nearest(),prompt=n?n.label+' · E':'Interagir · E';if(prompt!==lastPrompt){$('#journeyInteract').textContent=prompt;lastPrompt=prompt;}
}
function tick(now){const dt=Math.min(40,Math.max(0,now-lastTime));lastTime=now;paint(dt);requestAnimationFrame(tick);}
function build(){
 world.style.width=era.width+'px';world.style.height=era.height+'px';
 for(const m of era.missions){addActor(m.x,m.variant,m.npc,m.id,m.speech,m.greeting,m);const p=addProp(m.clueX,m.object,m.id,()=>observe(m),'Examinar '+m.clue);p.mission=m;
  const g=el('div',null,'journey-glitch');g.style.left=(m.clueX-100)+'px';g.style.top=(era.floor-190)+'px';$('#journeyGlitches').append(g);glitches.push({id:m.id,node:g});}
 addActor(900,'citizen','MORADOR','walker-a','Tenho tarefas para terminar antes do anoitecer. O caminho continua dos dois lados.',null,null,true);
 addActor(1940,'neighbor','MORADORA','walker-b','Estou voltando para casa. Se procura alguém, tente pelas moradias e pelo caminho.',null,null,true);
 const p=addProp(era.practical.x,era.practical.type==='building'?'posts':'map','practical',practical,complete()?'Rever memória':era.practical.title);p.practical=true;
 for(const [id,name,x] of era.practical.items||[]){const p=addProp(x,id,id,()=>pickMaterial(id),'Recolher '+name.toLowerCase());p.material=true;}
 refresh();resize();requestAnimationFrame(tick);
}
async function load(){
 const attempt=++loadAttempt;ready=false;clearKeys();$('#journeyLoading').hidden=false;$('#journeyRetry').hidden=true;$('#journeyLoading p').textContent='Reconstituindo '+era.period.toLowerCase()+'…';
 const image=$('#journeyBackground');image.src=era.image;image.alt='Cenário ilustrativo de '+era.period+'; caminhe pelo caminho em primeiro plano.';
 try{
  await Promise.all([image.decode(),...['assets/images/renato/renato-walk-spritesheet-v4.png','assets/images/roma/npcs-simple-a-v4.png','assets/images/roma/npcs-simple-b-v4.png'].map(src=>{const i=new Image();i.src=src;return i.decode();})]);
  if(attempt!==loadAttempt)return;ready=true;$('#journeyLoading').hidden=true;viewport.focus();
  if(!state.started){state.started=true;save();lines([['PEDRO NEVES',era.intro],['PEDRO NEVES',era.year],['RENATO','Vou observar as pistas, conversar e consultar meus livros. Os moradores não conhecem o Cofre.'],['PEDRO NEVES','Use as setas ou A/D para andar, E para interagir e B para ler. No celular, use os botões. O roteiro no alto indica a pista atual.']]);}
  if(!store.writable)say('Não foi possível salvar. O avanço desta etapa se perde ao trocar ou fechar a página.');
 }catch{if(attempt!==loadAttempt)return;$('#journeyLoading p').textContent='Não foi possível carregar o cenário. Confira a conexão e tente novamente.';$('#journeyRetry').hidden=false;}
}
$('#journeyRetry').addEventListener('click',load);$('#journeyInteract').addEventListener('click',interact);$('#journeyGuide').addEventListener('click',guide);$('#journeyBook').addEventListener('click',()=>readBook());
for(const b of document.querySelectorAll('[data-move]')){
 b.addEventListener('pointerdown',e=>{if(e.button!==0||dialog.open||!ready)return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.move);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>{keys.delete(b.dataset.move);save();});
}
$('.journey-controls').addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{
 if(dialog.open||e.ctrlKey||e.metaKey||e.altKey||!ready)return;
 if(e.target.closest('input,select,textarea'))return;
 const key=e.key.toLowerCase();if(e.target.closest('button,a,summary')&&[' ','enter'].includes(key))return;
 if(['arrowleft','a','arrowright','d','arrowup','w','e','b','m',' '].includes(key))e.preventDefault();
 if(['arrowleft','a'].includes(key))keys.add('left');if(['arrowright','d'].includes(key))keys.add('right');
 if(!e.repeat){if(['e','arrowup','w',' '].includes(key))interact();if(key==='b')readBook();if(key==='m')guide();}
});
window.addEventListener('keyup',e=>{if(['arrowleft','a'].includes(e.key.toLowerCase()))keys.delete('left');if(['arrowright','d'].includes(e.key.toLowerCase()))keys.delete('right');save();});
window.addEventListener('blur',()=>{clearKeys();save();});document.addEventListener('visibilitychange',()=>{clearKeys();save();});window.addEventListener('pagehide',save);window.addEventListener('resize',resize);
// Não expõe teletransporte nem altera os registros originais para resolver missões.
build();load();
})();
