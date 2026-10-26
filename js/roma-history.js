(() => {
'use strict';
window.RomaHistory = { create(config) {
    const data = window.ROMA_HISTORY_DATA, learning = window.ROMA_LEARNING;
    const shell = document.querySelector('.roma-shell');
    const modal = document.createElement('section');
    modal.className = 'roma-study'; modal.id = 'romaStudy'; modal.hidden = true;
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'romaStudyTitle');
    modal.innerHTML = '<div class="roma-study__desk"><header class="roma-study__header"><div><small>REGISTROS ORIGINAIS · TEMPO PAUSADO</small><h2 id="romaStudyTitle">Caderno de Renato</h2></div><button id="romaStudyClose" type="button">Fechar · Esc</button></header><div id="romaStudyBody" class="roma-study__body"></div><footer class="roma-study__footer"><span id="romaStudyProgress"></span><span>Pode ler com calma. O tempo está pausado.</span></footer></div>';
    shell.append(modal);
    const body = modal.querySelector('#romaStudyBody'), title = modal.querySelector('h2'), progress = modal.querySelector('#romaStudyProgress');
    const footer = modal.querySelector('.roma-study__footer');
    let question = null, onCorrect = null, pageIndex = 0, returnFocus = null, inertNodes = [], answered = false;
    let bookReturn = null, reviewIndex = 0;
    const state = () => config.getState();
    const el = (tag, text, cls = '') => { const n = document.createElement(tag); n.textContent = text; n.className = cls; return n; };
    const button = (label, fn, cls = '') => { const n = el('button', label, cls); n.type = 'button'; n.addEventListener('click', fn); return n; };
    const focus = node => { if (!node.matches('button,a[href],summary')) node.tabIndex = -1; node.focus({preventScroll: false}); };
    const ready = () => question && state().noted.includes(question.chapterId);
    const chapter = id => data.chapters.find(c => c.id === id);
    const currentGuide = () => learning.steps[state().step] || learning.steps.travelColosseum;
    function clearFooter() { footer.querySelector('button')?.remove(); footer.classList.remove('has-action'); }
    function footerAction(control) { clearFooter(); footer.classList.add('has-action'); footer.append(control); }
    function activate() {
        if (!modal.hidden) return;
        returnFocus = document.activeElement;
        modal.hidden = false; shell.classList.add('has-modal'); config.onPause();
        inertNodes = [...shell.children].filter(n => n !== modal).map(n => [n, n.inert]);
        inertNodes.forEach(([n]) => n.inert = true);
    }
    function close() {
        if (modal.hidden) return;
        modal.hidden = true; inertNodes.forEach(([n, previous]) => n.inert = previous); inertNodes = [];
        shell.classList.remove('has-modal'); question = null; onCorrect = null; answered = false; bookReturn = null;
        delete modal.dataset.question; clearFooter(); config.onResume();
        if (returnFocus?.isConnected && !returnFocus.inert && returnFocus.getClientRects().length) returnFocus.focus({preventScroll: true});
        else document.querySelector('#romaBook').focus({preventScroll: true});
    }
    function screen(label, mode) {
        clearFooter();
        title.textContent = label; body.replaceChildren(); body.className = 'roma-study__body is-' + mode;
        modal.dataset.mode = mode; body.scrollTop = 0;
        progress.textContent = state().answers.length + ' / ' + data.questions.length + ' interferências desfeitas';
    }
    function steps(active) {
        const list = el('ol', '', 'roma-study__steps'); list.setAttribute('aria-label', 'Etapas da investigação');
        ['Observar a pista', 'Ler e anotar', 'Comparar e agir'].forEach((label, i) => {
            const item = el('li', (i + 1) + ' · ' + label);
            if (i === active) item.setAttribute('aria-current', 'step');
            if (i < active) item.classList.add('is-done'); list.append(item);
        });
        return list;
    }
    function openChapter(id, back) {
        pageIndex = Math.max(0, data.chapters.findIndex(c => c.id === id));
        bookReturn = back || null; renderBook(); focus(title);
    }
    function actionRow() {
        const row = el('div', '', 'roma-study__tools');
        row.append(button('Ajuda da missão', () => { question = null; onCorrect = null; renderGuide(); focus(title); }),
            button('Minhas descobertas', () => { question = null; onCorrect = null; renderReview(); focus(title); }));
        return row;
    }
    function renderGuide() {
        screen('Por onde investigar?', 'guide'); delete modal.dataset.question;
        const [heading, instruction, questionId] = currentGuide();
        const page = el('article', '', 'roma-study__page');
        page.append(el('small', 'PRÓXIMO PASSO', 'roma-study__date'), el('h3', heading), el('p', instruction));
        if (state().step !== 'complete') {
            const mark = button('Marcar o caminho e voltar ao jogo', () => { close(); config.onGuideRoute?.(); }, 'roma-study__primary');
            mark.id = 'romaGuideRoute'; page.append(mark);
            page.append(el('p', 'Siga a seta do caminho. Perto da pessoa ou do objeto, use E / ↑ ou o botão ↑ no celular. A marcação não teletransporta Renato.', 'roma-study__hint'));
        }
        if (questionId) {
            const q = data.questions.find(q => q.id === questionId), c = chapter(q.chapterId);
            page.append(el('h3', 'O que observar'), el('p', learning.questions[questionId].focus));
            const read = button('Ler: ' + c.title, () => openChapter(c.id, 'guide')); read.id = 'romaGuideRead'; page.append(read);
            page.append(el('p', 'O livro ajuda a entender. A comparação só aparece depois de conversar com a pessoa indicada.', 'roma-study__hint'));
        } else if (state().step !== 'complete') {
            page.append(el('p', 'Primeiro, recupere a folha. Depois, os documentos e moradores vão revelar o que não combina com os registros de 475–476.'));
        }
        page.append(button('Minhas descobertas', () => { renderReview(); focus(title); })); body.append(page);
    }
    function renderBook() {
        screen('Livros de Renato', 'book');
        if (question) body.append(steps(1));
        const c = data.chapters[pageIndex], short = learning.chapters[c.id];
        const article = el('article', '', 'roma-study__page'); article.dataset.reading = c.id;
        article.append(el('small', 'VOLUME ' + (c.book + 1) + ' · ' + c.date, 'roma-study__date'), el('h3', c.title));
        if (question) article.append(el('p', 'Procure no trecho: ' + learning.questions[question.id].focus, 'roma-study__reading-goal'));
        article.append(el('p', short.summary, 'roma-study__summary'));
        article.append(el('blockquote', c.evidence, 'roma-study__evidence'));
        const noted = state().noted.includes(c.id);
        const note = button(noted ? 'Evidência anotada ✓' : 'Anotar esta evidência', () => {
            config.onNote(c.id); renderBook();
            focus(modal.querySelector(question && ready() ? '#romaReturnQuestion' : '#romaEvidenceNote'));
        }, question && ready() ? '' : 'roma-study__primary');
        note.id = 'romaEvidenceNote'; note.dataset.evidence = c.id; article.append(note);
        if (question) {
            const back = button(ready() ? 'Comparar a pista com o livro →' : 'Voltar à pista', () => { renderQuestion(); focus(title); }, ready() ? 'roma-study__primary' : '');
            back.id = 'romaReturnQuestion'; article.append(back);
            if (!ready() && c.id !== question.chapterId) article.append(button('Ir ao trecho indicado', () => openChapter(question.chapterId)));
        } else if (bookReturn) {
            article.append(button(bookReturn === 'practice' ? 'Voltar à revisão' : bookReturn === 'review' ? 'Voltar às descobertas' : 'Voltar à ajuda da missão', () => {
                if (bookReturn === 'practice') renderPractice(); else if (bookReturn === 'review') renderReview(); else renderGuide(); focus(title);
            }));
        }
        const glossary = el('details', '', 'roma-study__details'); glossary.append(el('summary', 'Entenda os nomes e as palavras'));
        const terms = el('dl'); short.terms.forEach(([term, meaning]) => terms.append(el('dt', term), el('dd', meaning))); glossary.append(terms); article.append(glossary);
        const full = el('details', '', 'roma-study__details'); full.append(el('summary', 'Ler a explicação completa'));
        c.paragraphs.forEach(p => full.append(el('p', p))); article.append(full);
        const sources = el('details', '', 'roma-study__sources'); sources.append(el('summary', 'Fontes históricas deste capítulo'));
        c.sources.forEach(source => { const a = el('a', source.title); a.href = source.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; sources.append(a); }); article.append(sources);
        const noteDetails = el('details', '', 'roma-study__details'); noteDetails.append(el('summary', 'História real e ficção do jogo'), el('p', data.note)); article.append(noteDetails);
        const pages = el('div', '', 'roma-study__paging');
        const prev = button('← Anterior', () => { pageIndex--; renderBook(); focus(title); }); prev.disabled = pageIndex === 0;
        const next = button('Próxima →', () => { pageIndex++; renderBook(); focus(title); }); next.disabled = pageIndex === data.chapters.length - 1;
        pages.append(prev, el('span', (pageIndex + 1) + ' / ' + data.chapters.length), next); article.append(pages);
        if (!question) article.append(actionRow());
        const nav = el('details', '', 'roma-study__contents'); nav.append(el('summary', 'Índice · outros capítulos')); nav.open = !question && !bookReturn;
        const index = el('nav', '', 'roma-study__index'); index.setAttribute('aria-label', 'Volumes e capítulos');
        data.books.forEach((name, book) => {
            index.append(el('h3', name));
            data.chapters.forEach((chapter, i) => {
                if (chapter.book !== book) return;
                const b = button(chapter.title, () => { pageIndex = i; renderBook(); focus(title); });
                b.dataset.chapter = chapter.id; b.setAttribute('aria-current', i === pageIndex ? 'page' : 'false'); index.append(b);
            });
        }); nav.append(index);
        const journal = el('details', '', 'roma-study__journal'); journal.id = 'romaJournal';
        const notes = state().testimonies || [];
        journal.append(el('summary', 'Conversas anotadas · ' + notes.length), el('p', 'Relatos ficcionais dos moradores: são pistas do jogo, não fontes históricas.'));
        if (!notes.length) journal.append(el('p', 'Converse com os moradores para registrar seus relatos.'));
        notes.forEach(t => { const entry = el('section', '', 'roma-study__testimony'); entry.append(el('h4', t.name + ' · ' + t.epoch + ' d.C.'), el('p', t.text)); journal.append(entry); });
        article.append(journal); body.append(article, nav);
    }
    function renderQuestion() {
        screen(question.title, 'question'); answered = false; modal.dataset.question = question.id;
        const help = learning.questions[question.id], c = chapter(question.chapterId), available = ready();
        body.append(steps(available ? 2 : 0));
        const evidence = el('section', '', 'roma-study__record');
        evidence.append(el('small', 'PISTA ENCONTRADA · FICÇÃO DO JOGO'), el('blockquote', question.claim), el('p', help.focus, 'roma-study__reading-goal'));
        const consult = button((available ? 'Reler: ' : 'Ler: ') + c.title, () => openChapter(c.id), available ? '' : 'roma-study__primary');
        consult.id = 'romaConsultBook'; evidence.append(consult);
        if (available) {
            evidence.append(el('h3', 'O registro original diz'), el('blockquote', c.evidence, 'roma-study__evidence'));
        } else evidence.append(el('p', 'Abra o trecho indicado e anote a evidência para liberar a comparação. Não precisa procurar a página sozinho.', 'roma-study__hint'));
        const hint = el('details', '', 'roma-study__details'); hint.id = 'romaQuestionHint';
        hint.append(el('summary', 'Preciso de uma dica'), el('p', help.hint)); evidence.append(hint);
        const choices = el('section', '', 'roma-study__choices'); choices.append(el('h3', question.prompt));
        const feedback = el('div', '', 'roma-study__feedback'); feedback.id = 'romaQuestionFeedback'; feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-atomic', 'true');
        const buttons = [];
        question.options.forEach(([id, label]) => {
            const b = button(label, () => {
                if (answered || !ready()) return;
                buttons.forEach(n => { n.classList.remove('is-wrong'); n.setAttribute('aria-pressed', 'false'); });
                if (id !== question.correct) {
                    b.classList.add('is-wrong'); b.setAttribute('aria-pressed', 'true');
                    feedback.replaceChildren(el('strong', 'Vamos conferir o motivo:'), el('p', help.feedback[id]), el('p', 'Compare com a evidência anotada e tente de novo. Você não perde progresso.'));
                    config.onMistake?.(question.id); focus(feedback); return;
                }
                answered = true; buttons.forEach(n => n.disabled = true); b.classList.add('is-correct'); b.setAttribute('aria-pressed', 'true');
                feedback.replaceChildren(el('h3', 'O que isso ensina sobre a queda'), el('p', help.lesson), el('strong', 'Na memória do jogo'), el('p', question.explanation));
                const finish = button(question.actionLabel, () => { const cb = onCorrect; close(); cb?.(); }, 'roma-study__primary');
                finish.id = 'romaRestoreRecord'; footerAction(finish); focus(feedback);
            });
            b.dataset.answer = id; b.disabled = !available; b.setAttribute('aria-pressed', 'false'); buttons.push(b); choices.append(b);
        });
        choices.append(feedback); body.append(evidence, choices);
    }
    function renderReview() {
        screen('O que descobri sobre a queda?', 'review'); delete modal.dataset.question;
        const page = el('article', '', 'roma-study__page'), answers = state().answers;
        page.append(el('p', 'As descobertas se somam. Não existe uma única causa que explique todo o fim do Império Romano do Ocidente.'));
        if (!answers.length) page.append(el('p', 'Suas descobertas aparecem aqui depois de comparar uma pista e desfazer a interferência. Comece pela ajuda da missão.'));
        const list = el('ol', '', 'roma-study__discoveries');
        data.questions.filter(q => answers.includes(q.id)).forEach(q => {
            const item = el('li'); item.dataset.discovery = q.id;
            item.append(el('h3', chapter(q.chapterId).title), el('p', learning.questions[q.id].lesson), button('Rever o registro', () => openChapter(q.chapterId, 'review'))); list.append(item);
        }); page.append(list);
        if (answers.length === data.questions.length) {
            page.append(el('h3', 'Ligue as descobertas'), el('p', 'Perdas de território e receitas dificultaram a defesa. Disputas pelo poder e conflitos com as tropas também enfraqueceram o governo. Em 476, o apoio militar a Odoacro permitiu a deposição de Rômulo em Ravena. Esse desfecho não apagou o Oriente nem toda a vida romana.', 'roma-study__evidence'));
            page.append(el('p', 'O jogo resume processos longos em cinco pistas. Os historiadores discutem o peso de cada fator. A destruição visual é ficção da memória, não uma reprodução de Roma em 476.'));
            const practice = button('Testar o que aprendi · 3 perguntas', () => { reviewIndex = 0; renderPractice(); focus(title); }, 'roma-study__primary'); practice.id = 'romaStartReview'; page.append(practice);
        }
        page.append(button('Ajuda da missão', () => { renderGuide(); focus(title); })); body.append(page);
    }
    function renderPractice() {
        screen('Revisão · ' + (reviewIndex + 1) + ' de ' + learning.review.length, 'practice');
        const q = learning.review[reviewIndex], page = el('article', '', 'roma-study__page');
        page.append(el('p', 'Sem limite de tentativas. Esta revisão não bloqueia sua partida.'), el('h3', q.prompt));
        const choices = el('div', '', 'roma-study__choices'), feedback = el('div', '', 'roma-study__feedback');
        feedback.id = 'romaReviewFeedback'; feedback.setAttribute('role', 'status');
        let resolved = false;
        q.options.forEach(([id, label]) => {
            const b = button(label, () => {
                if (resolved) return;
                feedback.replaceChildren(el('strong', id === q.correct ? 'Isso mesmo.' : 'Releia esta relação e tente novamente.'), el('p', q.explanation));
                if (id === q.correct) {
                    resolved = true; choices.querySelectorAll('button').forEach(n => n.disabled = true); b.classList.add('is-correct');
                    const next = button(reviewIndex < learning.review.length - 1 ? 'Próxima pergunta' : 'Concluir revisão', () => {
                        if (++reviewIndex < learning.review.length) renderPractice();
                        else { screen('Revisão concluída', 'review'); const done = el('article', '', 'roma-study__page'); done.append(el('h3', 'Você relacionou causas e consequências.'), el('p', 'Recursos, poder e lealdade militar se conectam. A deposição de 476 é o desfecho político estudado, não o fim de todas as pessoas e instituições romanas.'), button('Voltar às descobertas', () => { renderReview(); focus(title); }), button('Voltar ao jogo', close, 'roma-study__primary')); body.append(done); }
                        focus(title);
                    }, 'roma-study__primary'); next.id = 'romaReviewNext'; footerAction(next);
                }
                focus(feedback);
            }); b.dataset.reviewAnswer = id; choices.append(b);
        });
        page.append(choices, feedback, button('Consultar o trecho do livro', () => openChapter(q.chapterId, 'practice')), button('Voltar às descobertas', () => { renderReview(); focus(title); })); body.append(page);
    }
    function openMode(fn) {
        if (!state().canOpen && modal.hidden) return;
        question = null; onCorrect = null; bookReturn = null; delete modal.dataset.question; activate(); fn(); focus(title);
    }
    const api = {
        isOpen: () => !modal.hidden,
        open() { openMode(() => {
            const questionId = currentGuide()[2], q = data.questions.find(q => q.id === questionId);
            if (q) pageIndex = data.chapters.findIndex(c => c.id === q.chapterId);
            renderBook();
        }); },
        guide() { openMode(renderGuide); },
        review() { openMode(renderReview); },
        ask(id, callback) {
            question = data.questions.find(q => q.id === id); if (!question) throw new Error('Pergunta histórica desconhecida: ' + id);
            onCorrect = callback; activate(); renderQuestion(); focus(title);
        }, close
    };
    modal.querySelector('#romaStudyClose').addEventListener('click', close);
    document.querySelector('#romaBook').addEventListener('click', () => api.open());
    document.querySelector('#romaGuide').addEventListener('click', () => api.guide());
    window.addEventListener('keydown', event => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (modal.hidden) { if (event.key.toLowerCase() === 'b' && !event.repeat && state().canOpen) { event.preventDefault(); api.open(); } return; }
        if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close(); return; }
        if (event.key === 'Tab') {
            const closed = [...modal.querySelectorAll('details:not([open])')];
            const nodes = [...modal.querySelectorAll('button:not(:disabled),a[href],summary')].filter(n =>
                n.getClientRects().length && !closed.some(d => d.contains(n) && n !== d.querySelector(':scope > summary')));
            const active = document.activeElement, index = nodes.indexOf(active);
            const beforeFirst = index < 0 && !!(nodes[0]?.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_PRECEDING);
            const afterLast = index < 0 && !!(nodes.at(-1)?.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING);
            if (!modal.contains(active) || (!event.shiftKey && (index === nodes.length - 1 || afterLast)) || (event.shiftKey && (index === 0 || beforeFirst))) {
                event.preventDefault(); nodes[event.shiftKey ? nodes.length - 1 : 0]?.focus();
            }
        }
        event.stopImmediatePropagation();
    }, true);
    return api;
}};
})();
