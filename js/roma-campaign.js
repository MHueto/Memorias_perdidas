(() => {
'use strict';
const KEY='memoriasPerdidasRomaCampaignV1',ids=['foundation','expansion','pax','fall'];
let writable=true;
const fresh=()=>({version:1,completed:[],eras:{}});
function parse(text){try{return JSON.parse(text);}catch{return null;}}
function clean(raw){
 const next=fresh();if(!raw||raw.version!==1)return next;
 next.completed=ids.filter(id=>Array.isArray(raw.completed)&&raw.completed.includes(id));
 for(const id of ids.slice(0,3)){
  const r=raw.eras?.[id];if(!r||typeof r!=='object')continue;
  const list=k=>Array.isArray(r[k])?[...new Set(r[k].filter(x=>typeof x==='string'))].slice(0,30):[];
  next.eras[id]={x:Number.isFinite(r.x)?Math.max(80,Math.min(2380,r.x)):180,facing:r.facing==='left'?'left':'right',started:r.started===true,answers:list('answers'),found:list('found'),noted:list('noted'),greeted:list('greeted'),delivered:list('delivered'),carrying:['wood','clay','straw'].includes(r.carrying)?r.carrying:null,puzzle:r.puzzle===true};
 }
 return next;
}
let state;
try{state=clean(parse(localStorage.getItem(KEY)));}catch{state=fresh();writable=false;}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));writable=true;}catch{writable=false;}return writable;}
function complete(id){if(ids.includes(id)&&!state.completed.includes(id)){state.completed.push(id);persist();}}
function importFall(){try{const r=parse(localStorage.getItem('memoriasPerdidasRomaV1'));const answers=r?.history?.answers;if(r?.finished===true&&Array.isArray(answers)&&['power475','resources','army476','ravenna476','legacy476'].every(id=>answers.includes(id)))complete('fall');}catch{/* A partida pode continuar em memória. */}}
importFall();
window.RomaCampaign={key:KEY,ids,clean,get writable(){return writable;},snapshot:()=>JSON.parse(JSON.stringify(state)),isComplete:id=>state.completed.includes(id),unlocked:id=>ids.includes(id)&&(ids.indexOf(id)===0||state.completed.includes(id)||ids.slice(0,ids.indexOf(id)).every(x=>state.completed.includes(x))),next:()=>ids.find(id=>!state.completed.includes(id))||null,read:id=>state.eras[id]?JSON.parse(JSON.stringify(state.eras[id])):null,
 save(id,value){if(!ids.includes(id))return false;state=clean({...state,eras:{...state.eras,[id]:value}});return persist();},complete,importFall,
 href:id=>id==='fall'?'roma.html?intro=1':'roma-jornadas.html?epoca='+encodeURIComponent(id),
 reset(id){if(!ids.slice(0,3).includes(id))return;delete state.eras[id];state.completed=state.completed.filter(x=>x!==id);persist();}
};
})();
