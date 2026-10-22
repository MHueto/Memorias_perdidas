/* The atlas only reads world state. It has no movement/teleport callback. */
(() => {
'use strict';
const places={
 city:{name:'Mercado',question:'O que as remessas e as cobranças revelam sobre os recursos do governo?',hint:'Ouça quem trabalha nas barracas e compare os relatos com seus registros.'},
 forum:{name:'Foro',question:'De que uma ordem precisa para chegar ao destino e ser obedecida?',hint:'Converse com o mensageiro. Pedidos e respostas também são pistas.'},
 colosseum:{name:'Coliseu',question:'Que diferença existe entre a vida de uma cidade e o poder de um império?',hint:'Observe os trabalhadores e o acesso à arena. A folha é uma pista da investigação.'},
 arena:{name:'Arena',question:'O que você consegue descobrir observando antes de agir?',hint:'Renato fica no corredor seguro. O desafio dos leões é uma situação ficcional do jogo.'},
 artisans:{name:'Rua dos artesãos',question:'Como problemas de pagamento chegam ao trabalho das pessoas?',hint:'Converse com o artesão e encontre a porta da oficina.'},
 workshop:{name:'Oficina',question:'Como aproveitar recursos disponíveis para resolver um problema?',hint:'A bancada permite preparar uma distração; não é necessário ferir os animais.'},
 residential:{name:'Bairro',question:'O que continua na vida cotidiana durante uma crise política?',hint:'Converse com moradores. Nem todas as experiências são iguais.'},
 courtyard:{name:'Pátio',question:'Quais histórias das pessoas comuns ficam fora dos decretos?',hint:'Observe a fonte e ouça os moradores. Registre também as pequenas lembranças.'},
 senateHall:{name:'Senado',question:'Quem assina as ordens e quem tem poder para fazê-las cumprir?',hint:'Ouça Lúcio e confronte o documento local com os livros originais.'},
 ravennaCourt:{name:'Ravena',question:'A queda de um governo significa que tudo desaparece?',hint:'A viagem até a corte é feita com o mensageiro. Compare o desfecho com seus livros.'}
};
const desktop={city:[110,350],forum:[330,350],colosseum:[550,350],arena:[710,350],artisans:[110,200],residential:[330,200],workshop:[110,65],courtyard:[330,65],senateHall:[550,65],ravennaCourt:[710,180]};
const mobile={workshop:[80,55],courtyard:[240,55],artisans:[80,170],residential:[240,170],city:[80,285],forum:[240,285],colosseum:[80,410],senateHall:[240,410],arena:[80,530],ravennaCourt:[240,620]};
const NS='http://www.w3.org/2000/svg';
window.RomaAtlas={create(config){
 const panel=document.querySelector('#romaMapPanel'),board=panel.querySelector('#atlasBoard'),nodes=panel.querySelector('#atlasNodes'),lines=panel.querySelector('#atlasLines');
 let selected=null,small=false,opened=false;
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const label=(key,s)=>key==='ravennaCourt'&&!s.unlockedRavenna?'Rota distante':places[key].name;
 function route(s,target){
   if(s.area===target)return [];
   const queue=[{area:s.area,edges:[]}],seen=new Set([s.area]);
   while(queue.length){const item=queue.shift();for(const e of config.edges(item.area)){
     if(seen.has(e.to))continue;const path=[...item.edges,{...e,from:item.area}];
     if(e.to===target)return path;seen.add(e.to);queue.push({area:e.to,edges:path});
   }}return null;
 }
 function direction(x,at){return Math.abs(x-at)<85?'Aqui':x<at?'À esquerda':'À direita';}
 function instruction(s,edge){
   const d=direction(edge.x,s.x),dest=label(edge.to,s);
   if(edge.kind==='journey')return s.area==='ravennaCourt'?d+' · use a saída sinalizada para voltar a Roma.':d+' · encontre o mensageiro para viajar a '+dest+'.';
   if(edge.kind==='door')return d+' · aproxime-se da entrada de '+dest+' e use ↑ / E.';
   return d+' · siga pela rua até a passagem para '+dest+'.';
 }
 function firstTarget(s,target){
   const edges=route(s,target);
   if(!edges)return null;
   if(edges.length)return {x:edges[0].x,edge:edges[0]};
   if(s.objective?.[0]===s.area)return {x:s.objective[1],objective:true};
   return null;
 }
 function drawPath(a,b,from,to){
   const p=document.createElementNS(NS,'path');
   let d='M '+a.join(' ')+' L '+b.join(' ');
   if(from==='ravennaCourt'||to==='ravennaCourt'){
     const start=from==='forum'?a:b,end=from==='ravennaCourt'?a:b;
     d=small?'M '+start.join(' ')+' L 312 '+start[1]+' L 312 '+end[1]+' L '+end.join(' '):
       'M '+start.join(' ')+' L '+start[0]+' 255 L '+end[0]+' 255 L '+end.join(' ');
   }else if((from==='forum'&&to==='senateHall')||(from==='senateHall'&&to==='forum')){
     if(!small){const start=from==='forum'?a:b,end=from==='senateHall'?a:b;d='M '+start.join(' ')+' L 440 350 L 440 65 L '+end.join(' ');}
   }
   p.setAttribute('d',d);p.setAttribute('fill','none');return p;
 }
 function render(){
   if(!opened)return;
   const s=config.getState();selected=selected||s.area;
   const coords=small?mobile:desktop,width=small?320:800,height=small?690:420;
   board.style.setProperty('--atlas-ratio',width+'/'+height);
   board.style.setProperty('--atlas-height',height+'px');
   lines.setAttribute('viewBox','0 0 '+width+' '+height);
   lines.replaceChildren();nodes.replaceChildren();
   const path=route(s,selected),active=new Set((path||[]).map(e=>[e.from,e.to].sort().join('|'))),seen=new Set();
   for(const key of Object.keys(places))for(const edge of config.edges(key)){
     if(!s.unlockedRavenna&&(key==='ravennaCourt'||edge.to==='ravennaCourt'))continue;
     const id=[key,edge.to].sort().join('|');if(seen.has(id))continue;seen.add(id);
     const p=drawPath(coords[key],coords[edge.to],key,edge.to);
     p.classList.add('atlas-road');if(edge.kind==='journey'||key==='ravennaCourt')p.classList.add('atlas-road--journey');
     if(active.has(id))p.classList.add('is-route');lines.append(p);
   }
   for(const [key,position] of Object.entries(coords)){
     const button=node('button','','atlas-place');button.type='button';button.dataset.place=key;
     button.style.left=(position[0]/width*100)+'%';button.style.top=(position[1]/height*100)+'%';
     button.setAttribute('aria-pressed',String(key===selected));if(key===s.area)button.setAttribute('aria-current','location');
     button.classList.toggle('is-visited',s.visited.includes(key));
     button.classList.toggle('is-objective',key===s.objective?.[0]);
     button.append(node('strong',label(key,s)),node('span',key===s.area?'● Você está aqui':(key===s.objective?.[0]?'◆ Objetivo · ':'')+(s.visited.includes(key)?'Visitado':'A explorar')));
     button.setAttribute('aria-label',label(key,s)+'. '+(key===s.area?'Você está aqui. ':s.visited.includes(key)?'Já visitado. ':'Ainda não visitado. ')+'Mostrar caminho');
     button.addEventListener('click',()=>{selected=key;render();nodes.querySelector('[data-place="'+key+'"]')?.focus({preventScroll:true});});
     nodes.append(button);
   }
   panel.querySelector('#atlasCurrent').textContent='Você está em '+label(s.area,s)+' · '+s.epoch+' d.C.';
   panel.querySelector('#atlasCount').textContent=s.visited.length+' lugares visitados · '+s.answers+'/5 pistas investigadas';
   panel.querySelector('#atlasLocationTitle').textContent=label(selected,s);
   const locked=selected==='ravennaCourt'&&!s.unlockedRavenna;
   panel.querySelector('#atlasQuestion').textContent=locked?'Que pista permitirá seguir para além da cidade?':places[selected].question;
   panel.querySelector('#atlasLearningHint').textContent=locked?'Continue investigando os documentos e as conversas.':places[selected].hint;
   panel.querySelector('#atlasPlaceStatus').textContent=selected===s.area?'LOCAL ATUAL':s.visited.includes(selected)?'LUGAR CONHECIDO':'AINDA NÃO VISITADO';
   const steps=panel.querySelector('#atlasSteps');steps.replaceChildren();
   if(path===null)steps.append(node('li','A rota ainda não está disponível. Avance na investigação.'));
   else if(!path.length)steps.append(node('li','Você já está neste lugar. Use o esquema do trecho abaixo para localizar portas e saídas.'));
   else path.forEach((edge,i)=>steps.append(node('li',i===0?instruction(s,edge):'Em '+label(edge.from,s)+': '+(edge.kind==='journey'?'fale com o mensageiro para viajar a ':edge.kind==='door'?'use a entrada de ':'siga pela rua até ')+label(edge.to,s)+'.')));
   const mark=panel.querySelector('#atlasMark');mark.disabled=path===null;
   mark.textContent=s.pinned===selected?'Caminho marcado ✓':'Marcar este caminho';
   mark.onclick=()=>{config.onMark(selected);render();panel.querySelector('#atlasNotice').textContent='Caminho marcado. Feche o mapa e siga andando.';};
   panel.querySelector('#atlasGoal').disabled=!s.objective;
   panel.querySelector('#atlasGoal').onclick=()=>{selected=s.objective?.[0]||s.area;render();nodes.querySelector('[data-place="'+selected+'"]')?.focus({preventScroll:true});};
   const items=panel.querySelector('#atlasItems');items.textContent=s.items.length?s.items.join(' · '):'Nenhum item recolhido ainda.';
   panel.querySelector('#atlasObjective').textContent=s.objectiveText;
   renderLocal(s);
 }
 function renderLocal(s){
   panel.querySelector('#atlasLocalTitle').textContent='Seu trecho · '+label(s.area,s);
   const rail=panel.querySelector('#atlasRail');rail.replaceChildren();
   const ratio=Math.min(.96,Math.max(.04,s.x/config.areas[s.area].width));
   const player=node('i','','atlas-local-player');player.style.left=ratio*100+'%';player.dataset.ratio=ratio.toFixed(4);player.append(node('span','Renato'));rail.append(player);
   const connections=panel.querySelector('#atlasExits');connections.replaceChildren();const seen=new Set();
   const edges=config.edges(s.area).filter(e=>{if(seen.has(e.to))return false;seen.add(e.to);return true;}).sort((a,b)=>a.x-b.x);
   edges.forEach((edge,index)=>{
     const marker=node('i','','atlas-local-door');marker.style.left=Math.min(.97,Math.max(.03,edge.x/config.areas[s.area].width))*100+'%';marker.textContent=index+1;rail.append(marker);
     connections.append(node('li',(index+1)+'. '+instruction(s,edge)));
   });
   const target=firstTarget(s,selected);
   if(target){const goal=node('i','','atlas-local-target');goal.style.left=Math.min(.97,Math.max(.03,target.x/config.areas[s.area].width))*100+'%';goal.title=target.objective?'Ponto de investigação':'Próxima passagem';rail.append(goal);}
   panel.querySelector('#atlasPosition').textContent=ratio<.33?'Renato está perto do começo deste trecho.':ratio>.67?'Renato está perto do fim deste trecho.':'Renato está na parte central deste trecho.';
 }
 function compass(){
   const s=config.getState(),target=s.pinned||s.objective?.[0],next=target&&firstTarget(s,target);
   if(!target)return {text:'Explore as entradas · Mapa: M',x:null};
   if(!next)return {text:'Você está em '+label(target,s),x:null};
   const d=direction(next.x,s.x),arrow=d==='Aqui'?'↑':next.x<s.x?'←':'→';
   const text=next.objective?(d==='Aqui'?'Investigue por aqui':d+' · ponto de investigação'):next.edge.kind==='journey'?(s.area==='ravennaCourt'?'Saída · volta a Roma':'Mensageiro · viagem'):label(next.edge.to,s)+(next.edge.kind==='door'?' · entrada':' · rua');
   return {text:arrow+' '+text,x:next.x};
 }
 const observer=new ResizeObserver(entries=>{const narrow=entries[0].contentRect.width<560;if(narrow!==small){small=narrow;render();}});
 observer.observe(board);
 return {
   open(){opened=true;selected=config.getState().area;panel.querySelector('#atlasNotice').textContent='';render();panel.querySelector('#romaCloseMap').focus({preventScroll:true});},
   close(){opened=false;},
   name:key=>places[key]?.name||key,
   compass,
   refresh:render
 };
}};
})();
