'use strict';

/**
 * PHP extractor: declarations, references between classes and flow signals
 * (events, routes, commands, jobs, DI) from a single file.
 */

const path = require('path');
const {
    addImports, countLoc, makeLineIndex, matchClose, resolveName, shallow, splitTop, stripPhp, typeNames,
} = require('./php-source');

const NAME = '\\\\?[A-Za-z_][\\w\\\\]*';
const DISPATCH_METHODS = new Set(['dispatch', 'dispatchsync', 'dispatchnow', 'dispatchif', 'dispatchunless', 'broadcast']);
const SKIP_CLASS_REFS = new Set(['self', 'static', 'parent', 'class']);

function shortName(fqcn) {
    return fqcn.split('\\').pop();
}

function newMeta() {
    return { entry: new Set(), routes: [], listensTo: [], dispatchesEvents: [], hooks: [], dataAccess: [] };
}

function findDeclarations(blank, lineOf, namespaces) {
    const decls = [];
    const re = /(^|[^\w$>:\\])((?:(?:abstract|final|readonly)\s+)*)(class|interface|trait|enum)\s+([A-Za-z_]\w*)/g;
    let m;
    while ((m = re.exec(blank))) {
        const name = m[4];
        if (name === 'extends' || name === 'implements') continue;
        const before = blank.slice(Math.max(0, m.index - 12), m.index + m[1].length);
        if (/\bnew\s*$/.test(before)) continue;
        const start = m.index + m[1].length;
        const open = blank.indexOf('{', start);
        if (open === -1) continue;
        const header = blank.slice(start + m[0].length - m[1].length, open);
        if (/[;}]/.test(header)) continue;
        const close = matchClose(blank, open);
        const ns = namespaces.filter((n) => n.index <= start).pop();
        decls.push({
            kind: m[3],
            name,
            namespace: ns ? ns.name : '',
            start,
            open,
            close,
            header,
            line: lineOf(start),
            endLine: lineOf(close),
        });
        re.lastIndex = open + 1;
    }
    return decls;
}

/**
 * Parse one PHP file. Returns declarations (classes etc.), an optional
 * file-level node for files without declarations, and raw references that
 * graph.js resolves against the scanned scope.
 */
function parsePhp(src, rel) {
    const { code, blank } = stripPhp(src);
    const lineOf = makeLineIndex(src);
    const namespaces = [...blank.matchAll(/\bnamespace\s+([A-Za-z_][\w\\]*)\s*[;{]/g)].map((m) => ({ index: m.index, name: m[1] }));
    const decls = findDeclarations(blank, lineOf, namespaces);
    const inDecl = (idx) => decls.find((d) => idx >= d.start && idx <= d.close);

    const aliases = {};
    for (const m of blank.matchAll(/(?<=^|[;{}])\s*use\s+(?!\()([^;]+);/g)) {
        if (!inDecl(m.index)) addImports(m[1], aliases);
    }

    const declarations = [];
    const refs = [];
    const fileRefs = [];
    const entryMarks = [];
    const nsAt = (idx) => {
        const ns = namespaces.filter((n) => n.index <= idx).pop();
        return ns ? ns.name : '';
    };
    const resolve = (name, idx) => resolveName(name, nsAt(idx), aliases);

    for (const d of decls) {
        const id = d.namespace ? `${d.namespace}\\${d.name}` : d.name;
        const meta = newMeta();
        const extendsList = [];
        const implementsList = [];
        const ext = d.header.match(/\bextends\s+([\w\\\s,]+?)(?=\bimplements\b|$)/);
        const imp = d.header.match(/\bimplements\s+([\w\\\s,]+)/);
        for (const n of ext ? ext[1].split(',') : []) {
            const r = resolve(n, d.start);
            if (r) {
                extendsList.push(r);
                refs.push({ from: id, to: r, type: 'extends' });
            }
        }
        for (const n of imp ? imp[1].split(',') : []) {
            const r = resolve(n, d.start);
            if (r) {
                implementsList.push(r);
                refs.push({ from: id, to: r, type: 'implements' });
            }
        }

        const body = shallow(blank, d.open, d.close);
        for (const m of body.matchAll(/\buse\s+([\\\w\s,]+?)\s*[;{]/g)) {
            for (const n of m[1].split(',')) {
                const r = resolve(n, d.open);
                if (r) refs.push({ from: id, to: r, type: 'uses-trait' });
            }
        }
        for (const m of body.matchAll(/\b(?:public|protected|private|var)\s+(?:(?:static|readonly)\s+)*([?\w\\|&()]+)\s+\$\w+/g)) {
            for (const t of typeNames(m[1])) {
                const r = resolve(t, d.open);
                if (r) refs.push({ from: id, to: r, type: 'uses' });
            }
        }

        let methods = 0;
        for (const m of body.matchAll(/\bfunction\s+&?\s*([A-Za-z_]\w*)\s*\(/g)) {
            methods++;
            const method = m[1];
            const parenOpen = d.open + m.index + m[0].length - 1;
            const parenClose = matchClose(blank, parenOpen);
            const params = splitTop(blank.slice(parenOpen + 1, parenClose), ',');
            const retMatch = blank.slice(parenClose + 1, parenClose + 200).match(/^\s*:\s*([?\w\\|&()\s]+?)\s*(\{|;|=>)/);
            for (const t of typeNames(retMatch && retMatch[1])) {
                const r = resolve(t, d.open);
                if (r) refs.push({ from: id, to: r, type: 'uses' });
            }
            params.forEach((param, index) => {
                const clean = param.replace(/#\[[^\]]*\]/g, ' ')
                    .replace(/\b(public|protected|private|readonly)\b/g, ' ').trim();
                const pm = clean.match(/^([?\w\\|&()]+)\s+(?:&\s*)?(?:\.\.\.\s*)?\$(\w+)/);
                if (!pm) return;
                for (const t of typeNames(pm[1])) {
                    const r = resolve(t, d.open);
                    if (!r) continue;
                    const isListener = (method === 'handle' || method === '__invoke') && index === 0
                        && (/Listener$/.test(d.name) || /\\Listeners?(\\|$)/.test(d.namespace));
                    if (isListener) {
                        refs.push({ from: id, to: r, type: 'listens' });
                        meta.listensTo.push(shortName(r));
                        meta.entry.add('listener');
                    }
                    refs.push({ from: id, to: r, type: method === '__construct' ? 'injects' : 'uses' });
                    if (method === '__construct' && /^EntityRepository(Interface)?$/.test(shortName(r))) {
                        const entity = pm[2].replace(/Repository$/, '').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
                        if (entity) meta.dataAccess.push(entity);
                    }
                }
            });
            if (method === 'getSubscribedEvents') {
                const bodyOpen = blank.indexOf('{', parenClose);
                const bodyClose = matchClose(blank, bodyOpen);
                const text = code.slice(bodyOpen, bodyClose);
                for (const em of text.matchAll(new RegExp(`(${NAME})::(class|[A-Z_][A-Z0-9_]*)\\s*=>`, 'g'))) {
                    const r = resolve(em[1], d.open);
                    if (!r || SKIP_CLASS_REFS.has(em[1].toLowerCase())) continue;
                    refs.push({ from: id, to: r, type: 'listens' });
                    meta.listensTo.push(em[2] === 'class' ? shortName(r) : `${shortName(r)}::${em[2]}`);
                }
                for (const em of text.matchAll(/['"]([\w.:-]+)['"]\s*=>/g)) meta.listensTo.push(em[1]);
            }
        }

        if (implementsList.some((n) => /^EventSubscriberInterface$/.test(shortName(n)))) meta.entry.add('subscriber');
        if (implementsList.some((n) => shortName(n) === 'ShouldQueue')) meta.entry.add('job');
        if (implementsList.some((n) => shortName(n) === 'MessageHandlerInterface')) meta.entry.add('message-handler');
        if (extendsList.some((n) => shortName(n) === 'Command')) meta.entry.add('command');
        if (extendsList.some((n) => /ScheduledTaskHandler$/.test(shortName(n)))) meta.entry.add('scheduled-task');

        declarations.push({
            id,
            name: d.name,
            kind: d.kind,
            namespace: d.namespace,
            line: d.line,
            endLine: d.endLine,
            loc: countLoc(code.slice(d.start, d.close + 1)),
            methods,
            extends: extendsList,
            implements: implementsList,
            meta,
            span: [d.start, d.close],
        });
    }

    // File-level owner for references outside any declaration.
    let fileNode = null;
    if (!declarations.length) {
        fileNode = {
            id: rel,
            name: path.posix.basename(rel),
            kind: 'file',
            namespace: namespaces.length ? namespaces[0].name : '',
            line: 1,
            endLine: lineOf(src.length),
            loc: countLoc(code),
            methods: [...blank.matchAll(/\bfunction\s+&?\s*[A-Za-z_]\w*\s*\(/g)].length,
            extends: [],
            implements: [],
            meta: newMeta(),
            span: [0, src.length],
        };
    }
    const owners = fileNode ? [fileNode] : declarations;
    const ownerAt = (idx) => owners.find((o) => idx >= o.span[0] && idx <= o.span[1]) || owners[0];
    // Attributes and docblocks precede the declaration they belong to.
    const ownerFor = (idx) => owners.find((o) => idx >= o.span[0] && idx <= o.span[1])
        || owners.find((o) => o.span[0] > idx) || owners[0];

    const scan = (re, handler) => {
        for (const m of blank.matchAll(re)) handler(m, ownerAt(m.index));
    };
    scan(new RegExp(`\\bnew\\s+(${NAME})`, 'g'), (m, owner) => {
        if (SKIP_CLASS_REFS.has(m[1].toLowerCase())) return;
        const r = resolve(m[1], m.index);
        if (r) refs.push({ from: owner.id, to: r, type: 'instantiates' });
    });
    scan(new RegExp(`(?<![\\w$\\\\>])(${NAME})\\s*::\\s*(\\$?\\w+)`, 'g'), (m, owner) => {
        if (SKIP_CLASS_REFS.has(m[1].toLowerCase())) return;
        const r = resolve(m[1], m.index);
        if (!r) return;
        const member = m[2].toLowerCase();
        const type = member === 'class' ? 'uses' : DISPATCH_METHODS.has(member) ? 'dispatches' : 'static-call';
        refs.push({ from: owner.id, to: r, type });
        if (type === 'dispatches') owner.meta.dispatchesEvents.push(shortName(r));
    });
    scan(new RegExp(`\\binstanceof\\s+(${NAME})`, 'g'), (m, owner) => {
        const r = resolve(m[1], m.index);
        if (r) refs.push({ from: owner.id, to: r, type: 'uses' });
    });
    scan(/\bcatch\s*\(([^)$]*)/g, (m, owner) => {
        for (const t of typeNames(m[1])) {
            const r = resolve(t, m.index);
            if (r) refs.push({ from: owner.id, to: r, type: 'uses' });
        }
    });
    scan(new RegExp(`(?:->|::|\\b)(?:dispatch|dispatchSync|dispatchNow|event|broadcast)\\s*\\(\\s*new\\s+(${NAME})`, 'g'), (m, owner) => {
        const r = resolve(m[1], m.index);
        if (!r) return;
        refs.push({ from: owner.id, to: r, type: 'dispatches' });
        owner.meta.dispatchesEvents.push(shortName(r));
    });

    // Attributes and legacy @Route annotations.
    for (const m of code.matchAll(/#\[\s*\\?([\w\\]+)\s*(\(([^\]]*))?/g)) {
        const owner = ownerFor(m.index);
        const attr = m[1].split('\\').pop();
        const args = m[3] || '';
        if (attr === 'Route') {
            owner.meta.entry.add('route');
            const p = args.match(/^\s*(?:path\s*:\s*)?['"]([^'"]+)['"]/);
            if (p) owner.meta.routes.push(p[1]);
        } else if (attr === 'AsCommand') {
            owner.meta.entry.add('command');
            const p = args.match(/['"]([^'"]+)['"]/);
            if (p) owner.meta.routes.push(`cli: ${p[1]}`);
        } else if (attr === 'AsMessageHandler') {
            owner.meta.entry.add('message-handler');
        } else if (attr === 'AsEventListener') {
            owner.meta.entry.add('listener');
            const ev = args.match(new RegExp(`(${NAME})::class`));
            if (ev) {
                const r = resolve(ev[1], m.index);
                if (r) {
                    refs.push({ from: owner.id, to: r, type: 'listens' });
                    owner.meta.listensTo.push(shortName(r));
                }
            }
        } else if (attr === 'AsScheduledTask' || attr === 'AsCronTask' || attr === 'AsPeriodicTask') {
            owner.meta.entry.add('scheduled-task');
        }
    }
    for (const m of src.matchAll(/@Route\(\s*(?:path\s*=\s*)?"([^"]+)"/g)) {
        const owner = ownerFor(m.index);
        owner.meta.entry.add('route');
        owner.meta.routes.push(m[1]);
    }

    // WordPress hooks.
    for (const m of code.matchAll(/\badd_(action|filter)\s*\(\s*['"]([^'"]+)['"]/g)) {
        const owner = ownerAt(m.index);
        owner.meta.entry.add('wp-hook');
        owner.meta.hooks.push(m[2]);
    }
    for (const m of code.matchAll(/\b(do_action|apply_filters)\s*\(\s*['"]([^'"]+)['"]/g)) {
        ownerAt(m.index).meta.dispatchesEvents.push(`hook: ${m[2]}`);
    }

    // Local includes (classic PHP / WordPress).
    for (const m of code.matchAll(/\b(?:require|include)(?:_once)?\s*\(?\s*(?:__DIR__\s*\.\s*|dirname\(\s*__FILE__\s*\)\s*\.\s*)?['"]([^'"$]+\.php)['"]/g)) {
        fileRefs.push({ from: ownerAt(m.index).id, path: m[1], type: 'includes' });
    }

    // Laravel route files: Route::get('/x', [Controller::class, 'm']) and 'Controller@m'.
    if (/(^|\/)routes\/[^/]+\.php$/.test(rel)) {
        const owner = owners[0];
        owner.meta.entry.add('route');
        const routeRe = new RegExp(`Route::(\\w+)\\s*\\(\\s*['"]([^'"]*)['"]\\s*,\\s*\\[?\\s*(${NAME})::class`, 'g');
        for (const m of code.matchAll(routeRe)) {
            const r = resolve(m[3], m.index);
            if (!r) continue;
            const label = `${m[1].toUpperCase()} ${m[2]}`;
            refs.push({ from: owner.id, to: r, type: 'routes' });
            entryMarks.push({ target: r, entry: 'route', route: label });
        }
        for (const m of code.matchAll(/Route::(\w+)\s*\(\s*['"]([^'"]*)['"]\s*,\s*['"]([\w\\]+)@\w+['"]/g)) {
            const r = m[3].includes('\\') ? m[3].replace(/^\\/, '') : `App\\Http\\Controllers\\${m[3]}`;
            refs.push({ from: owner.id, to: r, type: 'routes' });
            entryMarks.push({ target: r, entry: 'route', route: `${m[1].toUpperCase()} ${m[2]}` });
        }
    }

    // Laravel EventServiceProvider::$listen = [Event::class => [Listener::class]].
    for (const m of blank.matchAll(/\$listen\s*=\s*\[/g)) {
        const open = m.index + m[0].length - 1;
        const text = blank.slice(open, matchClose(blank, open) + 1);
        for (const em of text.matchAll(new RegExp(`(${NAME})::class\\s*=>\\s*\\[([^\\]]*)\\]`, 'g'))) {
            const event = resolve(em[1], m.index);
            for (const lm of em[2].matchAll(new RegExp(`(${NAME})::class`, 'g'))) {
                const listener = resolve(lm[1], m.index);
                if (!event || !listener) continue;
                refs.push({ from: listener, to: event, type: 'listens' });
                entryMarks.push({ target: listener, entry: 'listener', listensTo: shortName(event) });
            }
        }
    }

    const nodes = (fileNode ? [fileNode] : declarations).map((n) => {
        const { span, ...rest } = n;
        return rest;
    });
    return { nodes, refs, fileRefs, entryMarks, loc: countLoc(code) };
}

/**
 * Symfony/Shopware services.xml: explicit service arguments become
 * `injects` edges, tags mark entry points.
 */
function parseServicesXml(src) {
    const refs = [];
    const entryMarks = [];
    const body = src.replace(/<!--[\s\S]*?-->/g, '');
    for (const m of body.matchAll(/<service\b([^>]*?)(\/>|>([\s\S]*?)<\/service>)/g)) {
        const attrs = m[1];
        const id = (attrs.match(/\bclass="([^"]+)"/) || attrs.match(/\bid="([^"]+)"/) || [])[1];
        if (!id || !id.includes('\\')) continue;
        const inner = m[3] || '';
        for (const a of inner.matchAll(/<argument\b[^>]*\btype="service"[^>]*\bid="([^"]+)"/g)) {
            if (a[1].includes('\\')) refs.push({ from: id, to: a[1], type: 'injects' });
            else if (/\.repository$/.test(a[1])) entryMarks.push({ target: id, dataAccess: a[1].replace(/\.repository$/, '') });
        }
        for (const t of inner.matchAll(/<tag\b[^>]*\bname="([^"]+)"/g)) {
            const tag = t[1];
            const entry = tag === 'kernel.event_subscriber' ? 'subscriber'
                : tag === 'kernel.event_listener' ? 'listener'
                    : tag === 'console.command' ? 'command'
                        : tag === 'messenger.message_handler' ? 'message-handler'
                            : tag === 'shopware.scheduled.task' ? 'scheduled-task'
                                : null;
            if (entry) entryMarks.push({ target: id, entry });
        }
    }
    return { nodes: [], refs, fileRefs: [], entryMarks, loc: 0 };
}

module.exports = { parsePhp, parseServicesXml };
