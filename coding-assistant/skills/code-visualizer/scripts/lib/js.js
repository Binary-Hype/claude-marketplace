'use strict';

/**
 * JS/TS/Vue extractor: one node per module, import specifiers as raw
 * references that graph.js resolves to files or folds into packages.
 */

const path = require('path');

function blankChar(ch) {
    return ch === '\n' ? '\n' : ' ';
}

/** Remove comments, keep strings (import specifiers live in strings). */
function stripJsComments(src) {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
        const ch = src[i];
        const next = src[i + 1];
        if (ch === '/' && next === '/') {
            while (i < n && src[i] !== '\n') {
                out += ' ';
                i++;
            }
        } else if (ch === '/' && next === '*') {
            const close = src.indexOf('*/', i + 2);
            const end = close === -1 ? n : close + 2;
            for (; i < end; i++) out += blankChar(src[i]);
        } else if (ch === '\'' || ch === '"' || ch === '`') {
            let end = i + 1;
            while (end < n && src[end] !== ch && !(ch !== '`' && src[end] === '\n')) end += src[end] === '\\' ? 2 : 1;
            end = Math.min(end + 1, n);
            out += src.slice(i, end);
            i = end;
        } else {
            out += ch;
            i++;
        }
    }
    return out;
}

/** Keep only the <script> blocks of a Vue single-file component, line-preserving. */
function vueScript(src) {
    let out = '';
    let last = 0;
    for (const m of src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
        const contentStart = m.index + m[0].indexOf('>') + 1;
        out += src.slice(last, contentStart).replace(/[^\n]/g, ' ');
        out += m[1];
        last = contentStart + m[1].length;
    }
    return out + src.slice(last).replace(/[^\n]/g, ' ');
}

function countLoc(text) {
    let loc = 0;
    for (const line of text.split('\n')) if (line.trim()) loc++;
    return loc;
}

function parseJs(src, rel) {
    const ext = path.posix.extname(rel);
    const code = stripJsComments(ext === '.vue' ? vueScript(src) : src);
    const imports = [];
    const add = (spec, type) => {
        if (spec && !imports.some((i) => i.spec === spec && i.type === type)) imports.push({ spec, type });
    };

    for (const m of code.matchAll(/\bimport\s+(?:type\s+)?(?:[\w*{}\s,$]+?\s+from\s+)?['"]([^'"]+)['"]/g)) add(m[1], 'imports');
    for (const m of code.matchAll(/\bexport\s+(?:type\s+)?[\w*{}\s,$]*?\s+from\s+['"]([^'"]+)['"]/g)) add(m[1], 'imports');
    for (const m of code.matchAll(/\bimport\s*\(\s*['"`]([^'"`$]+)['"`]\s*\)/g)) add(m[1], 'imports');
    for (const m of code.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) add(m[1], 'imports');

    const meta = { entry: new Set(), routes: [], listensTo: [], dispatchesEvents: [], hooks: [], dataAccess: [], components: [] };
    const componentExtends = [];
    for (const m of code.matchAll(/\bComponent\.(register|extend|override)\s*\(\s*['"]([\w-]+)['"](?:\s*,\s*['"]([\w-]+)['"])?/g)) {
        if (m[1] === 'register') meta.components.push(m[2]);
        if (m[1] === 'extend') {
            meta.components.push(m[2]);
            if (m[3]) componentExtends.push(m[3]);
        }
        if (m[1] === 'override') meta.hooks.push(`overrides ${m[2]}`);
    }
    for (const m of code.matchAll(/\bPluginManager\.(?:register|override)\s*\(\s*['"]([\w-]+)['"]/g)) {
        meta.entry.add('storefront-plugin');
        meta.components.push(m[1]);
    }
    for (const m of code.matchAll(/\bModule\.register\s*\(\s*['"]([\w-]+)['"]/g)) {
        meta.entry.add('admin-module');
        meta.components.push(m[1]);
    }
    for (const m of code.matchAll(/\bpath\s*:\s*['"](\/[^'"]*)['"]/g)) meta.routes.push(m[1]);
    if (meta.routes.length) meta.entry.add('route');
    for (const m of code.matchAll(/\$emit\s*\(\s*['"]([\w:-]+)['"]/g)) meta.dispatchesEvents.push(m[1]);
    for (const m of code.matchAll(/\brepositoryFactory\.create\(\s*['"]([\w_]+)['"]/g)) meta.dataAccess.push(m[1]);
    for (const m of code.matchAll(/\b(?:fetch|axios\.(?:get|post|put|patch|delete)|httpClient\.(?:get|post|put|patch|delete))\s*\(\s*['"`]([^'"`]+)['"`]/g)) {
        meta.dataAccess.push(m[1]);
    }

    const methods = [...code.matchAll(/\bfunction\s*\*?\s*[A-Za-z_$][\w$]*\s*\(|\b(?:const|let)\s+[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>|^\s+(?:async\s+)?[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{/gm)].length;
    const base = path.posix.basename(rel);
    const name = /^index\.\w+$/.test(base) ? `${path.posix.basename(path.posix.dirname(rel))}/${base}` : base;
    const isComponent = ext === '.vue' || meta.components.length > 0;

    return {
        nodes: [{
            id: rel,
            name,
            kind: isComponent ? 'component' : 'module',
            namespace: '',
            line: 1,
            endLine: src.split('\n').length,
            loc: countLoc(code),
            methods,
            extends: [],
            implements: [],
            meta,
        }],
        imports,
        componentExtends,
    };
}

module.exports = { parseJs };
