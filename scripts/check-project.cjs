'use strict';

// Verificação estática, sem dependências e sem executar o código do jogo.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const posix = path.posix;

function references(file, text) {
    const refs = [];
    const add = (url, base = posix.dirname(file)) => refs.push({ url, base });
    if (file.endsWith('.html')) {
        const html = text.replace(/<!--[\s\S]*?-->/g, '');
        for (const match of html.matchAll(/\b(?:src|href|poster)\s*=\s*(["'])(.*?)\1/gi)) add(match[2]);
    }
    if (file.endsWith('.css')) {
        const css = text.replace(/\/\*[\s\S]*?\*\//g, '');
        for (const match of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) add(match[2].trim());
    }
    if (file.startsWith('js/') && file.endsWith('.js')) {
        // No jogo, URLs usadas pelo JS são relativas à página HTML na raiz.
        for (const match of text.matchAll(/(["'`])([^"'`\r\n]+)\1/g)) {
            const url = match[2];
            if (/\.(?:png|jpe?g|gif|svg|webp|mp4|woff2?|json|html)(?:[?#].*)?$/i.test(url) &&
                (url.includes('/') || /\.html(?:[?#].*)?$/i.test(url))) add(url, '.');
        }
        // Os cenários de Roma usam um prefixo concatenado, fora do literal.
        if (file === 'js/roma.js') {
            const backgrounds = text.match(/const\s+backgrounds\s*=\s*\{([\s\S]*?)\};/);
            if (backgrounds) {
                for (const match of backgrounds[1].matchAll(/["']([^"']+\.(?:png|jpe?g|webp))["']/gi)) {
                    add('assets/images/roma/' + match[1], '.');
                }
            }
        }
    }
    if (file.endsWith('.md')) {
        const markdown = text.replace(/```[\s\S]*?```/g, '');
        for (const match of markdown.matchAll(/!?\[[^\]]*\]\((?:<([^>]+)>|([^\)]+))\)/g)) {
            add((match[1] || match[2]).replace(/\s+["'][^"']*["']$/, '').trim());
        }
    }
    return refs;
}

function inspect(files) {
    const errors = [];
    const names = [...files.keys()];
    const folded = new Map();
    let checked = 0;
    let dynamic = 0;
    for (const name of names) {
        const lower = name.toLowerCase();
        if (folded.has(lower) && folded.get(lower) !== name) {
            errors.push('Nomes que diferem só por maiúsculas/minúsculas: ' + folded.get(lower) + ' e ' + name);
        }
        folded.set(lower, name);
    }
    for (const [file, text] of files) {
        if (typeof text !== 'string') continue;
        for (const { url, base } of references(file, text)) {
            if (!url || url.startsWith('#') || /^(?:[a-z][\w+.-]*:|\/\/)/i.test(url)) continue;
            if (url.includes('${')) { dynamic++; continue; }
            checked++;
            if (url.startsWith('/') || url.includes('\\')) {
                errors.push(file + ': use caminho relativo com barras /: ' + url);
                continue;
            }
            let target;
            try { target = posix.normalize(posix.join(base, decodeURIComponent(url.split(/[?#]/)[0]))); }
            catch { errors.push(file + ': URL inválida: ' + url); continue; }
            if (target === '..' || target.startsWith('../')) {
                errors.push(file + ': referência fora do projeto: ' + url);
                continue;
            }
            if (files.has(target)) continue;
            const directory = target.replace(/\/$/, '') + '/';
            if (names.some(name => name.startsWith(directory))) continue;
            const caseMatch = folded.get(target.toLowerCase());
            errors.push(file + ': ' + (caseMatch ? 'maiúsculas/minúsculas incorretas; use ' + caseMatch : 'arquivo ausente: ' + url));
        }
    }
    return { errors: [...new Set(errors)], checked, dynamic };
}

function main() {
    const root = path.resolve(__dirname, '..');
    const listed = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
        cwd: root, encoding: 'utf8'
    });
    if (listed.status !== 0) throw new Error('Execute a verificação dentro de uma cópia Git do projeto.');
    const names = [...new Set(listed.stdout.split('\0').filter(Boolean))];
    const files = new Map();
    const errors = [];
    let scripts = 0;
    let json = 0;
    for (const name of names) {
        const absolute = path.join(root, name);
        if (!fs.existsSync(absolute)) { errors.push('Arquivo rastreado ausente: ' + name); continue; }
        if (!fs.statSync(absolute).isFile()) continue;
        const text = /\.(?:html|css|js|cjs|md|json)$/.test(name) ? fs.readFileSync(absolute, 'utf8') : null;
        files.set(name, text);
        if (/\.(?:js|cjs)$/.test(name)) {
            scripts++;
            const result = spawnSync(process.execPath, ['--check', absolute], { encoding: 'utf8' });
            if (result.status !== 0) errors.push('Sintaxe JavaScript: ' + name + '\n' + (result.stderr || result.error?.message || 'Falha ao conferir.'));
        }
        if (name.endsWith('.json')) {
            json++;
            try { JSON.parse(text); } catch (error) { errors.push('JSON inválido: ' + name + ': ' + error.message); }
        }
    }
    for (const required of ['index.html', 'teste-escola.html', 'roma.html', 'README.md', '.nojekyll']) {
        if (!files.has(required)) errors.push('Arquivo essencial ausente: ' + required);
    }
    const report = inspect(files);
    errors.push(...report.errors);
    if (errors.length) {
        console.error('Verificação falhou:\n- ' + errors.join('\n- '));
        process.exitCode = 1;
    } else {
        console.log('OK: ' + files.size + ' arquivos, ' + scripts + ' scripts, ' + json + ' JSON e ' + report.checked + ' referências locais conferidas.');
    }
    console.log('Escopo: sintaxe e referências estáticas; não substitui testes do jogo no navegador.');
    if (report.dynamic) console.log(report.dynamic + ' referências com interpolação exigem teste no navegador.');
}

module.exports = { references, inspect };
if (require.main === module) {
    try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
