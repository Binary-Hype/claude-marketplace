'use strict';

/**
 * Low-level PHP source helpers: comment/string stripping that keeps every
 * character offset intact, brace matching and PHP name resolution.
 */

const SCALAR_TYPES = new Set([
    'int', 'integer', 'float', 'double', 'string', 'bool', 'boolean', 'array', 'callable',
    'iterable', 'object', 'mixed', 'void', 'null', 'never', 'false', 'true', 'self',
    'static', 'parent', 'resource', 'class', 'function', 'fn', 'list', 'array-key',
]);

function blankChar(ch) {
    return ch === '\n' ? '\n' : ' ';
}

/**
 * Returns two same-length copies of the source:
 * - code:  comments and inline HTML removed, strings kept
 * - blank: comments, inline HTML and string contents removed
 * Offsets in both map 1:1 to the original source.
 */
function stripPhp(src) {
    const n = src.length;
    const code = new Array(n);
    const blank = new Array(n);
    let i = 0;
    // PHP files start in inline-HTML mode until the first open tag, like the engine does.
    let html = true;

    const emit = (from, to, keepCode, keepBlank) => {
        for (let k = from; k < to; k++) {
            code[k] = keepCode ? src[k] : blankChar(src[k]);
            blank[k] = keepBlank ? src[k] : blankChar(src[k]);
        }
    };

    while (i < n) {
        if (html) {
            const open = src.indexOf('<?', i);
            if (open === -1) {
                emit(i, n, false, false);
                break;
            }
            const tag = src.startsWith('<?php', open) ? 5 : src.startsWith('<?=', open) ? 3 : 2;
            emit(i, open + tag, false, false);
            i = open + tag;
            html = false;
            continue;
        }
        const ch = src[i];
        const next = src[i + 1];
        if (ch === '?' && next === '>') {
            emit(i, i + 2, false, false);
            i += 2;
            html = true;
        } else if ((ch === '/' && next === '/') || (ch === '#' && next !== '[')) {
            let end = i;
            while (end < n && src[end] !== '\n' && !(src[end] === '?' && src[end + 1] === '>')) end++;
            emit(i, end, false, false);
            i = end;
        } else if (ch === '/' && next === '*') {
            const close = src.indexOf('*/', i + 2);
            const end = close === -1 ? n : close + 2;
            emit(i, end, false, false);
            i = end;
        } else if (ch === '<' && src.startsWith('<<<', i)) {
            const m = /^<<<[ \t]*(['"]?)([A-Za-z_]\w*)\1\r?\n/.exec(src.slice(i, i + 200));
            if (!m) {
                emit(i, i + 1, true, true);
                i++;
                continue;
            }
            const terminator = new RegExp(`\\n[ \\t]*${m[2]}\\b`, 'g');
            terminator.lastIndex = i + m[0].length - 1;
            const t = terminator.exec(src);
            const end = t ? t.index + t[0].length : n;
            emit(i, i + 3, true, true);
            emit(i + 3, end, true, false);
            i = end;
        } else if (ch === '\'' || ch === '"' || ch === '`') {
            let end = i + 1;
            while (end < n && src[end] !== ch) end += src[end] === '\\' ? 2 : 1;
            end = Math.min(end + 1, n);
            emit(i, i + 1, true, true);
            emit(i + 1, end - 1, true, false);
            emit(end - 1, end, true, true);
            i = end;
        } else {
            code[i] = ch;
            blank[i] = ch;
            i++;
        }
    }
    return { code: code.join(''), blank: blank.join('') };
}

/** Index of the brace/bracket/paren that closes the one at `open`. */
function matchClose(text, open) {
    const pairs = { '{': '}', '(': ')', '[': ']' };
    const openCh = text[open];
    const closeCh = pairs[openCh];
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        if (text[i] === openCh) depth++;
        else if (text[i] === closeCh && --depth === 0) return i;
    }
    return text.length - 1;
}

/** Copy of a class body where everything nested deeper than the body itself is blanked. */
function shallow(text, from, to) {
    let depth = 0;
    let out = '';
    for (let i = from; i <= to; i++) {
        const ch = text[i];
        if (ch === '{') depth++;
        out += depth > 1 ? blankChar(ch) : ch;
        if (ch === '}') depth--;
    }
    return out;
}

/** Split on a separator at nesting depth 0. */
function splitTop(text, sep) {
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if ('([{'.includes(ch)) depth++;
        else if (')]}'.includes(ch)) depth--;
        else if (ch === sep && depth === 0) {
            parts.push(text.slice(start, i));
            start = i + 1;
        }
    }
    parts.push(text.slice(start));
    return parts.map((p) => p.trim()).filter(Boolean);
}

function makeLineIndex(src) {
    const starts = [0];
    for (let i = 0; i < src.length; i++) if (src[i] === '\n') starts.push(i + 1);
    return (offset) => {
        let lo = 0;
        let hi = starts.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (starts[mid] <= offset) lo = mid;
            else hi = mid - 1;
        }
        return lo + 1;
    };
}

function countLoc(text) {
    let loc = 0;
    for (const line of text.split('\n')) if (line.trim()) loc++;
    return loc;
}

/** Resolve a class name as PHP would, given the namespace and `use` aliases. */
function resolveName(name, namespace, aliases) {
    if (!name) return null;
    const clean = name.trim().replace(/^\?/, '');
    if (!clean || !/^\\?[A-Za-z_][\w\\]*$/.test(clean)) return null;
    if (SCALAR_TYPES.has(clean.toLowerCase())) return null;
    if (clean.startsWith('\\')) return clean.slice(1);
    if (/^namespace\\/i.test(clean)) return namespace ? `${namespace}\\${clean.slice(10)}` : clean.slice(10);
    const [first, ...rest] = clean.split('\\');
    const alias = aliases[first.toLowerCase()];
    if (alias) return [alias, ...rest].join('\\');
    return namespace ? `${namespace}\\${clean}` : clean;
}

/** Split a PHP type expression (?A|B&(C|D)) into class names. */
function typeNames(type) {
    if (!type) return [];
    return type.split(/[|&()?\s]+/).filter((t) => t && !SCALAR_TYPES.has(t.toLowerCase()));
}

/** Parse the clause of a top-level `use` statement into the alias map. */
function addImports(clause, aliases) {
    const text = clause.replace(/\s+/g, ' ').trim();
    if (/^(function|const)\b/i.test(text)) return;
    const group = text.match(/^\\?([\w\\]+?)\\?\s*\{(.*)\}$/);
    const items = group
        ? group[2].split(',').map((s) => s.trim()).filter((s) => s && !/^(function|const)\b/i.test(s)).map((s) => `${group[1]}\\${s}`)
        : text.split(',').map((s) => s.trim());
    for (const item of items) {
        const m = item.match(/^\\?([\w\\]+)(?:\s+as\s+(\w+))?$/i);
        if (!m) continue;
        const alias = m[2] || m[1].split('\\').pop();
        aliases[alias.toLowerCase()] = m[1];
    }
}

module.exports = {
    SCALAR_TYPES,
    addImports,
    countLoc,
    makeLineIndex,
    matchClose,
    resolveName,
    shallow,
    splitTop,
    stripPhp,
    typeNames,
};
