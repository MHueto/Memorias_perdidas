'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({window: {}});
for (const file of ['roma-history-data.js', 'roma-learning.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), context, {filename: file});
}
const history = context.window.ROMA_HISTORY_DATA, learning = context.window.ROMA_LEARNING;
function frozen(value) {
    return Object.isFrozen(value) && Object.values(value).every(v => !v || typeof v !== 'object' || frozen(v));
}
test('livros originais e apoio didático permanecem profundamente imutáveis', () => {
    assert.ok(frozen(history)); assert.ok(frozen(learning));
});
test('as cinco pistas têm capítulo, dica, síntese e explicação de cada alternativa incorreta', () => {
    assert.equal(history.questions.length, 5);
    for (const q of history.questions) {
        assert.ok(history.chapters.some(c => c.id === q.chapterId));
        const help = learning.questions[q.id];
        for (const field of ['focus', 'hint', 'lesson']) assert.ok(help[field].length >= 40, q.id + ': ' + field);
        const wrong = q.options.filter(([id]) => id !== q.correct).map(([id]) => help.feedback[id]);
        assert.ok(wrong.every(text => typeof text === 'string' && text.length > 50));
        assert.equal(new Set(wrong).size, wrong.length);
        assert.equal(q.options.filter(([id]) => id === q.correct).length, 1);
    }
});
test('cada registro tem resumo curto, glossário e referências preservadas', () => {
    for (const c of history.chapters) {
        assert.ok(c.sources.length > 0);
        assert.ok(c.sources.every(s => new URL(s.url).protocol === 'https:'));
        assert.ok(c.paragraphs.length >= 2 && c.evidence.length > 30);
        const short = learning.chapters[c.id];
        assert.ok(short.summary.length > 100 && short.summary.split(/\s+/).length <= 65);
        assert.ok(short.terms.length >= 2 && short.terms.every(([name, definition]) => name && definition));
    }
});
test('todas as etapas, da chegada até o encerramento, possuem ajuda contextual', () => {
    for (const step of ['briefing','travelColosseum','observeArena','needStraw','craftDolls','findRope','distract','lassoAim','senate','supplyInquiry','militaryPetition','routeInquiry','travelRavenna','aftermath','deposition','complete']) {
        assert.ok(learning.steps[step]?.[0] && learning.steps[step]?.[1], step);
    }
});
test('cada investigação indica seu próprio trecho, sem pular para outra pergunta', () => {
    const expected = {senate:'power475',supplyInquiry:'resources',militaryPetition:'army476',routeInquiry:'ravenna476',aftermath:'legacy476'};
    for (const [step, question] of Object.entries(expected)) assert.equal(learning.steps[step][2], question);
});
test('sínteses distinguem 475, recursos, conflito militar, Ravena e continuidade após 476', () => {
    assert.match(learning.chapters.west475.summary, /475.*Rômulo.*Orestes/);
    assert.match(learning.chapters.resources.summary, /impostos.*exército/);
    assert.match(learning.chapters.army476.summary, /já serviam Roma.*terras.*recusou.*Odoacro/);
    assert.match(learning.chapters.ravenna476.summary, /Ravena.*outra cidade/);
    assert.match(learning.chapters.legacy476.summary, /476.*deposição.*Ocidente.*Oriente.*continuou/);
});
test('revisão exercita causa e consequência e mantém um registro para consulta', () => {
    assert.equal(learning.review.length, 3);
    for (const q of learning.review) {
        assert.ok(history.chapters.some(c => c.id === q.chapterId));
        assert.equal(q.options.filter(([id]) => id === q.correct).length, 1);
        assert.ok(q.explanation.length > 70);
    }
});
