(() => {
'use strict';
window.RomaHistory = { create(config) {
  const data=window.ROMA_HISTORY_DATA, shell=document.querySelector('.roma-shell');
  const modal=document.createElement('section');
  modal.className='roma-study';modal.id='romaStudy';modal.hidden=true;
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','romaStudyTitle');
  modal.innerHTML='<div class="roma-study__desk"><header class="roma-study__header"><div><small id="romaStudyEyebrow">LIVROS DE RENATO · TEMPO PAUSADO</small><h2 id="romaStudyTitle">Biblioteca de campo</h2></div><button id="romaStudyClose" type="button">Fechar · Esc</button></header><div id="romaStudyBody" class="roma-study__body"></div><footer class="roma-study__footer"><span id="romaStudyProgress"></span><span>Leia, compare e restaure.</span></footer></div>';
  shell.append(modal);
  const body=modal.querySelector('#romaStudyBody'),title=modal.querySelector('h2'),progress=modal.querySelector('#romaStudyProgress');
  let question=null,onCorrect=null,mode='book',pageIndex=0,returnFocus=null,inertNodes=[],answered=false;
  const button=(label,fn,cls='')=>{const n=document.createElement('button');n.type='button';n.textContent=label;n.className=cls;n.addEventListener('click',fn);return n;};
  const el=(tag,text,cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
  function focusHeading(){title.tabIndex=-1;title.focus({preventScroll:true});}
  function activate(){
    if(!modal.hidden)return;
    returnFocus=document.activeElement;
    modal.hidden=false;shell.classList.add('has-modal');config.onPause();
    inertNodes=[...shell.children].filter(n=>n!==modal).map(n=>[n,n.inert]);inertNodes.forEach(([n])=>n.inert=true);
  }
  function close(){
    if(modal.hidden)return;
    modal.hidden=true;inertNodes.forEach(([n,previous])=>n.inert=previous);inertNodes=[];
    shell.classList.remove('has-modal');question=null;onCorrect=null;answered=false;
    config.onResume();if(returnFocus?.isConnected&&!returnFocus.inert)returnFocus.focus({preventScroll:true});
  }
  function updateProgress(){progress.textContent=config.getState().answers.length+' / '+data.questions.length+' registros restaurados';}
  function renderBook(){
    mode='book';body.replaceChildren();body.className='roma-study__body is-book';
    title.textContent='Livros de Renato';updateProgress();
    const nav=el('nav','','roma-study__index');nav.setAttribute('aria-label','Volumes e capítulos');
    data.books.forEach((name,book)=>{
      nav.append(el('h3',name));
      data.chapters.forEach((c,i)=>{if(c.book!==book)return;const b=button(c.date+' · '+c.title,()=>{pageIndex=i;renderBook();focusHeading();});
        b.dataset.chapter=c.id;b.setAttribute('aria-current',i===pageIndex?'page':'false');nav.append(b);});
    });
    const c=data.chapters[pageIndex],article=el('article','','roma-study__page');
    article.append(el('small','VOLUME '+(c.book+1)+' · '+c.date,'roma-study__date'),el('h3',c.title));
    c.paragraphs.forEach(p=>article.append(el('p',p)));
    article.append(el('blockquote',c.evidence,'roma-study__evidence'));
    const noted=config.getState().noted.includes(c.id);
    const note=button(noted?'Evidência anotada ✓':'Anotar esta evidência',()=>{config.onNote(c.id);renderBook();modal.querySelector('#romaEvidenceNote')?.focus();},'roma-study__primary');
    note.id='romaEvidenceNote';note.dataset.evidence=c.id;article.append(note);
    if(question){
      const ready=config.getState().noted.includes(question.chapterId);
      const back=button('Voltar à comparação',()=>{renderQuestion();focusHeading();});back.id='romaReturnQuestion';article.append(back);
      article.append(el('p',ready?'A página necessária está anotada. Compare com o registro alterado.':'Encontre a página que ajuda a conferir a data e o acontecimento do registro.','roma-study__hint'));
    }
    const sources=el('details','','roma-study__sources');sources.append(el('summary','Fontes deste capítulo'));
    c.sources.forEach(source=>{const a=el('a',source.title);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';sources.append(a);});
    article.append(sources,el('p',data.note,'roma-study__disclaimer'));
    const pages=el('div','','roma-study__paging');
    const prev=button('← Página anterior',()=>{pageIndex--;renderBook();focusHeading();});prev.disabled=pageIndex===0;
    const next=button('Próxima página →',()=>{pageIndex++;renderBook();focusHeading();});next.disabled=pageIndex===data.chapters.length-1;
    pages.append(prev,el('span',(pageIndex+1)+' / '+data.chapters.length),next);article.append(pages);
    body.append(nav,article);body.scrollTop=0;
  }
  function renderQuestion(){
    mode='question';body.replaceChildren();body.className='roma-study__body is-question';answered=false;
    title.textContent=question.title;modal.dataset.question=question.id;updateProgress();
    const evidence=el('section','','roma-study__record');evidence.append(el('small','REGISTRO ALTERADO'),el('blockquote',question.claim));
    const consult=button('Consultar meus livros',()=>{renderBook();focusHeading();},'roma-study__primary');consult.id='romaConsultBook';
    evidence.append(consult);
    const ready=config.getState().noted.includes(question.chapterId);
    const c=data.chapters.find(c=>c.id===question.chapterId);
    evidence.append(el('p',ready?'Evidência disponível: '+c.date+' · '+c.title:'Antes de decidir, anote uma evidência dos seus livros.','roma-study__hint'));
    const choices=el('section','','roma-study__choices');choices.append(el('h3',question.prompt));
    const feedback=el('p','','roma-study__feedback');feedback.id='romaQuestionFeedback';feedback.setAttribute('role','status');
    const buttons=[];
    question.options.forEach(([id,label])=>{
      const b=button(label,()=>{
        if(answered||!config.getState().noted.includes(question.chapterId))return;
        if(id!==question.correct){
          b.setAttribute('aria-pressed','true');b.classList.add('is-wrong');
          feedback.textContent='Essa opção ainda não combina com a evidência. Reabra os livros e compare '+c.date+' com o registro. Você pode tentar novamente.';
          config.onMistake?.(question.id);return;
        }
        answered=true;buttons.forEach(n=>n.disabled=true);b.classList.add('is-correct');b.setAttribute('aria-pressed','true');
        feedback.textContent=question.explanation;
        const finish=button('Restaurar registro e continuar',()=>{const cb=onCorrect;close();cb?.();},'roma-study__primary');
        finish.id='romaRestoreRecord';choices.append(finish);finish.focus({preventScroll:false});
      });
      b.dataset.answer=id;b.disabled=!ready;b.setAttribute('aria-pressed','false');buttons.push(b);choices.append(b);
    });
    choices.append(feedback);body.append(evidence,choices);body.scrollTop=0;
  }
  const api={
    isOpen:()=>!modal.hidden,
    open(){if(!config.getState().canOpen&&!api.isOpen())return;question=null;onCorrect=null;delete modal.dataset.question;activate();renderBook();focusHeading();},
    ask(id,callback){
      question=data.questions.find(q=>q.id===id);if(!question)throw new Error('Pergunta histórica desconhecida: '+id);
      onCorrect=callback;activate();renderQuestion();focusHeading();
    },close
  };
  modal.querySelector('#romaStudyClose').addEventListener('click',close);
  document.querySelector('#romaBook').addEventListener('click',()=>api.open());
  window.addEventListener('keydown',event=>{
    if(modal.hidden){if(event.key.toLowerCase()==='b'&&!event.repeat&&config.getState().canOpen){event.preventDefault();api.open();}return;}
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();return;}
    if(event.key==='Tab'){
      const nodes=[...modal.querySelectorAll('button:not(:disabled),a[href],summary')].filter(n=>n.getClientRects().length);
      const index=nodes.indexOf(document.activeElement);
      if(index<0||(!event.shiftKey&&index===nodes.length-1)||(event.shiftKey&&index===0)){
        event.preventDefault();nodes[event.shiftKey?nodes.length-1:0]?.focus();
      }
    }
    event.stopImmediatePropagation();
  },true);
  return api;
}};
})();
