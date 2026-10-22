'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { inspect } = require('./check-project.cjs');
const scan = entries => inspect(new Map(Object.entries(entries)));

test('aceita HTML, CSS e imagem com versão de cache e prefixo relativo', () => {
    const result = scan({
        'index.html': '<link href="css/main.css?v=2"><img src="assets/renato.png">',
        'css/main.css': '.renato { background: url(../assets/renato.png?v=4); }',
        'assets/renato.png': null
    });
    assert.deepEqual(result.errors, []);
    assert.equal(result.checked, 3);
});
test('detecta imagem ausente', () => {
    assert.match(scan({ 'index.html': '<img src="assets/falta.png">' }).errors[0], /arquivo ausente/);
});
test('detecta diferença de maiúsculas mesmo em Windows', () => {
    assert.match(scan({ 'index.html': '<img src="assets/Renato.png">', 'assets/renato.png': null }).errors[0], /maiúsculas/);
});
test('detecta colisão de nomes entre sistemas', () => {
    assert.match(scan({ 'assets/A.png': null, 'assets/a.png': null }).errors[0], /Nomes que diferem/);
});
test('rejeita caminho absoluto que perderia o prefixo de Pages', () => {
    assert.match(scan({ 'index.html': '<img src="/assets/a.png">', 'assets/a.png': null }).errors[0], /caminho relativo/);
});
test('rejeita referência fora do projeto', () => {
    assert.match(scan({ 'css/style.css': 'a { background: url(../../privado.png); }' }).errors[0], /fora do projeto/);
});
test('ignora sites externos, data URLs e âncoras', () => {
    assert.deepEqual(scan({ 'index.html': '<a href="https://example.com">x</a><a href="#menu">y</a><img src="data:image/png;base64,AA"><script src="//example.com/a.js"></script>' }).errors, []);
});
test('confere links Markdown relativos e diretórios', () => {
    assert.deepEqual(scan({ 'docs/README.md': '[Menu](../index.html) [Arte](../assets/) [Este guia](#inicio)', 'index.html': '', 'assets/a.png': null }).errors, []);
});
test('não interpreta exemplo de link dentro de bloco de código Markdown', () => {
    assert.deepEqual(scan({ 'README.md': '```md\n[Exemplo](ausente.md)\n```' }).errors, []);
});
test('confere imagem de JavaScript em relação à página, não à pasta js', () => {
    assert.deepEqual(scan({ 'js/game.js': "const sprite = 'assets/renato.png';", 'assets/renato.png': null }).errors, []);
});
test('confere o mapa de cenários com prefixo concatenado de Roma', () => {
    assert.match(scan({ 'js/roma.js': "const backgrounds = {city:'cidade.png'};" }).errors[0], /assets\/images\/roma\/cidade.png/);
});
test('não trata template dinâmico como arquivo literal', () => {
    const result = scan({ 'js/game.js': 'const a = `assets/npc-${sheet}.png`;' });
    assert.deepEqual(result.errors, []);
    assert.equal(result.dynamic, 1);
});
test('aceita espaços codificados e remove query e fragmento', () => {
    assert.deepEqual(scan({ 'index.html': '<img src="assets/nova%20arte.png?v=1#f">', 'assets/nova arte.png': null }).errors, []);
});
test('URL malformada produz diagnóstico em vez de derrubar o verificador', () => {
    assert.match(scan({ 'index.html': '<img src="assets/%XX.png">' }).errors[0], /URL inválida/);
});
test('ignora referências comentadas em HTML e CSS', () => {
    assert.deepEqual(scan({ 'index.html': '<!-- <img src="ausente.png"> -->', 'css/a.css': '/* url(ausente.png) */' }).errors, []);
});
