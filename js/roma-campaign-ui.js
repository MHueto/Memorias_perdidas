(() => {
'use strict';
const data=window.ROMA_CAMPAIGN_DATA,store=window.RomaCampaign;
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
const done=data.chapters.filter(c=>store.isComplete(c.id)).length;
document.querySelector('#campaignCount').textContent=done+' / 4';
document.querySelector('#campaignSaveWarning').hidden=store.writable;
document.querySelector('#campaignEnding').hidden=done!==4;
const next=store.next(),resume=document.querySelector('#campaignContinue');
resume.href=next?store.href(next):'#campaignTimeline';
resume.textContent=next?(store.read(next)?.started?'Continuar a jornada →':done?'Próxima memória →':'Começar a jornada →'):'Revisitar as memórias ↓';
for(const c of data.chapters){
 const item=el('li',null,'archive-chapter'),complete=store.isComplete(c.id),available=store.unlocked(c.id);
 item.dataset.era=c.id;item.dataset.status=complete?'complete':available?'available':'locked';
 const number=el('span',c.number,'archive-number');number.setAttribute('aria-hidden','true');
 const img=el('img');img.src=c.image;img.alt='';img.loading='lazy';img.width=900;img.height=300;
 const text=el('div',null,'archive-chapter-text');text.append(el('small',c.date,'eyebrow'),el('h2',c.period),el('p',c.title));
 const status=el('p',complete?'Restaurada':available?'Disponível':'Conclua a memória anterior','chapter-status');
 text.append(status);
 if(available){const a=el('a',complete?'Revisitar →':store.read(c.id)?.started?'Continuar →':'Entrar na memória →','primary');a.href=store.href(c.id);text.append(a);}
 else{const p=el('span','Ainda fechada','locked-label');text.append(p);}
 if(complete){const note=el('details');note.append(el('summary','O que esta memória ensina'),el('p',c.summary));text.append(note);}
 item.append(number,img,text);document.querySelector('#campaignTimeline').append(item);
}
for(const [name,url] of Object.values(data.sources)){const li=el('li'),a=el('a',name);a.href=url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);document.querySelector('#campaignSources').append(li);}
})();
