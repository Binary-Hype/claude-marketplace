'use strict';

/**
 * Turns per-file extraction results into one graph: resolves references to
 * nodes inside the scanned scope, folds everything else into one external
 * node per namespace root or package, and computes metrics.
 */

const fs = require('fs');
const path = require('path');

const JS_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue'];
const TWO_SEGMENT_VENDORS = new Set(['Shopware', 'Symfony', 'Doctrine', 'Laminas', 'Spatie', 'League', 'Sentry', 'GuzzleHttp']);
const PLUGIN_ROOT = /(^|\/)(custom\/(static-)?plugins|custom\/apps|wp-content\/(mu-)?plugins|wp-content\/themes|web\/app\/(plugins|themes))\/[^/]+$/;
const ENTRY_LAYERS = {
    command: 'Command',
    job: 'Job',
    subscriber: 'Subscriber',
    listener: 'Listener',
    'scheduled-task': 'Scheduled task',
    'message-handler': 'Message handler',
};

const LAYER_RULES = [
    ['Plugin', (n) => n.extends.some((e) => /\\(Plugin|Bundle)$/.test(e))],
    ['Route file', (n) => n.kind === 'file' && /(^|\/)routes\//.test(n.file)],
    ['Controller', (n) => /Controller$/.test(n.name) || /\/Controllers?\//.test(n.file)],
    ['Middleware', (n) => /Middleware$/.test(n.name) || /\/Middleware\//.test(n.file)],
    ['Request', (n) => /Request$/.test(n.name) && /\/Requests?\//.test(n.file)],
    ['Repository', (n) => /Repository$/.test(n.name)],
    ['Entity', (n) => /(Entity|EntityDefinition)$/.test(n.name) || n.extends.some((e) => /\\EntityCollection$/.test(e))],
    ['Model', (n) => /\/Models?\//.test(n.file)],
    ['Event', (n) => /Event$/.test(n.name) || /\/Events\//.test(n.file)],
    ['Migration', (n) => /^Migration\d+/.test(n.name) || /\/migrations\//i.test(n.file)],
    ['Provider', (n) => /Provider$/.test(n.name)],
    ['Exception', (n) => /Exception$/.test(n.name)],
    ['DTO', (n) => /(Dto|DTO|Data|Struct|Payload|Message|Result)$/.test(n.name) || /\/(Struct|Dto|DTO|Data)\//.test(n.file)],
    ['Livewire', (n) => /\/Livewire\//.test(n.file)],
    ['Filament', (n) => /\/Filament\//.test(n.file)],
    ['Resource', (n) => n.lang === 'php' && (/Resource$/.test(n.name) || /\/Resources\//.test(n.file))],
    ['Action', (n) => /\/Actions?\//.test(n.file)],
    ['Rule', (n) => /\/Rules\//.test(n.file)],
    ['Observer', (n) => /Observer$/.test(n.name)],
    ['Mail', (n) => /\/(Mail|Notifications)\//.test(n.file)],
    ['Policy', (n) => /Policy$/.test(n.name)],
    ['Service', (n) => /(Service|Manager|Handler|Processor|Client|Gateway|Exporter|Importer|Builder|Factory|Resolver|Provider|Loader)$/.test(n.name) || /\/Services?\//.test(n.file)],
    ['Component', (n) => n.kind === 'component'],
    ['Interface', (n) => n.kind === 'interface'],
    ['Trait', (n) => n.kind === 'trait'],
    ['Enum', (n) => n.kind === 'enum'],
    ['Module', (n) => n.kind === 'module'],
    ['File', (n) => n.kind === 'file'],
];

function layerOf(node) {
    for (const entry of node.entry) if (ENTRY_LAYERS[entry]) return ENTRY_LAYERS[entry];
    for (const [layer, test] of LAYER_RULES) if (test(node)) return layer;
    return 'Class';
}

function externalKey(fqcn) {
    const parts = fqcn.split('\\');
    if (parts.length === 1) return 'PHP global';
    if (TWO_SEGMENT_VENDORS.has(parts[0]) && parts.length > 2) return `${parts[0]}\\${parts[1]}`;
    return parts[0];
}

function packageName(spec) {
    const parts = spec.split('/');
    return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function groupOf(rel, roots) {
    const root = roots.filter((r) => r === '.' || rel === r || rel.startsWith(`${r}/`)).sort((a, b) => b.length - a.length)[0] || '.';
    const label = root === '.' ? '(root)' : PLUGIN_ROOT.test(root) ? path.posix.basename(root) : root;
    if (roots.length >= 4) return label;
    const segs = (root === '.' ? rel : rel.slice(root.length + 1)).split('/').slice(0, -1);
    if (segs[0] === 'src') segs.shift();
    if (segs[0] === 'Resources' && segs[1] === 'app' && segs[2]) return `${label}/${segs[2]}`;
    return segs.length ? `${label}/${segs[0]}` : label;
}

/** Read compilerOptions.paths aliases from tsconfig/jsconfig at the repo root. */
function loadAliases(repo) {
    const aliases = [];
    for (const file of ['tsconfig.json', 'jsconfig.json']) {
        let json;
        try {
            json = JSON.parse(fs.readFileSync(path.join(repo, file), 'utf8').replace(/^\s*\/\/.*$/gm, ''));
        } catch {
            continue;
        }
        const opts = json.compilerOptions || {};
        const base = opts.baseUrl || '.';
        for (const [pattern, targets] of Object.entries(opts.paths || {})) {
            for (const target of [].concat(targets)) {
                aliases.push({
                    prefix: pattern.replace(/\*$/, ''),
                    target: path.posix.normalize(path.posix.join(base, target.replace(/\*$/, ''))),
                });
            }
        }
    }
    for (const fallback of ['resources/js/', 'resources/ts/', 'src/']) {
        aliases.push({ prefix: '@/', target: fallback }, { prefix: '~/', target: fallback });
    }
    return aliases;
}

function buildGraph({ repo, includes, excludes, withTests, frameworks, parsed, stats }) {
    const nodes = new Map();
    const lowerIndex = new Map();
    const fileToIds = new Map();
    const componentIndex = new Map();
    const fileSet = new Set(parsed.map((p) => p.rel));

    for (const file of parsed) {
        for (const raw of file.result.nodes) {
            let id = raw.id;
            if (nodes.has(id)) id = `${id}#${file.rel}`;
            const node = {
                ...raw,
                id,
                file: file.rel,
                lang: file.lang,
                bytes: file.bytes,
                group: groupOf(file.rel, includes),
                entry: new Set(raw.meta.entry),
                routes: [...raw.meta.routes],
                listensTo: [...raw.meta.listensTo],
                dispatches: [...raw.meta.dispatchesEvents],
                hooks: [...raw.meta.hooks],
                dataAccess: [...raw.meta.dataAccess],
                components: [...(raw.meta.components || [])],
            };
            delete node.meta;
            nodes.set(id, node);
            if (!lowerIndex.has(id.toLowerCase())) lowerIndex.set(id.toLowerCase(), id);
            if (!fileToIds.has(file.rel)) fileToIds.set(file.rel, []);
            fileToIds.get(file.rel).push(id);
            for (const c of node.components) componentIndex.set(c, id);
        }
    }

    const edges = new Map();
    const externals = new Map();
    const findNode = (id) => (nodes.has(id) ? id : lowerIndex.get(String(id).toLowerCase()));
    const addEdge = (source, target, type) => {
        if (!source || !target || source === target) return;
        const key = `${source}|${target}|${type}`;
        const edge = edges.get(key);
        if (edge) edge.weight++;
        else edges.set(key, { source, target, type, weight: 1 });
    };
    const addExternal = (source, key, type) => {
        const id = `ext:${key}`;
        if (!externals.has(id)) externals.set(id, { id, name: key, kind: 'external', external: true, refs: 0 });
        externals.get(id).refs++;
        addEdge(source, id, type);
    };

    const aliases = loadAliases(repo);
    const resolveFile = (base) => {
        if (fileSet.has(base)) return base;
        for (const ext of JS_EXTENSIONS) if (fileSet.has(base + ext)) return base + ext;
        for (const ext of JS_EXTENSIONS) if (fileSet.has(`${base}/index${ext}`)) return `${base}/index${ext}`;
        return null;
    };
    const resolveImport = (spec, fromRel) => {
        if (spec.startsWith('.')) return { file: resolveFile(path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), spec))), local: true };
        for (const alias of aliases) {
            if (!spec.startsWith(alias.prefix)) continue;
            const hit = resolveFile(path.posix.normalize(alias.target + spec.slice(alias.prefix.length)));
            if (hit) return { file: hit, local: true };
        }
        if (spec.startsWith('/') || spec.startsWith('#') || spec.startsWith('@/') || spec.startsWith('~/')) return { file: null, local: true };
        return { file: null, local: false };
    };

    for (const file of parsed) {
        const r = file.result;
        for (const ref of r.refs || []) {
            const source = findNode(ref.from);
            if (!source) continue;
            const target = findNode(ref.to);
            if (target) addEdge(source, target, ref.type);
            else addExternal(source, externalKey(ref.to), ref.type);
        }
        for (const ref of r.fileRefs || []) {
            const rel = path.posix.normalize(path.posix.join(path.posix.dirname(file.rel), ref.path));
            const ids = fileToIds.get(rel);
            if (ids) addEdge(findNode(ref.from), ids[0], ref.type);
        }
        for (const mark of r.entryMarks || []) {
            const node = nodes.get(findNode(mark.target));
            if (!node) continue;
            if (mark.entry) node.entry.add(mark.entry);
            if (mark.route) node.routes.push(mark.route);
            if (mark.listensTo) node.listensTo.push(mark.listensTo);
            if (mark.dataAccess) node.dataAccess.push(mark.dataAccess);
        }
        for (const imp of r.imports || []) {
            const source = fileToIds.get(file.rel)[0];
            const { file: hit, local } = resolveImport(imp.spec, file.rel);
            if (hit) addEdge(source, fileToIds.get(hit)[0], imp.type);
            else if (!local) addExternal(source, packageName(imp.spec), imp.type);
            else if (!/\.(css|s[ac]ss|less|twig|html|svg|png|jpe?g|gif|webp|json|md)$/.test(imp.spec)) addExternal(source, '(outside scope)', imp.type);
        }
        for (const name of r.componentExtends || []) {
            const source = fileToIds.get(file.rel)[0];
            const target = componentIndex.get(name);
            if (target) addEdge(source, target, 'extends');
            else addExternal(source, 'admin components', 'extends');
        }
    }

    // Frontend HTTP calls to a path that a scanned route serves.
    const routeIndex = [];
    for (const node of nodes.values()) {
        for (const route of node.routes) {
            const p = route.replace(/^[A-Z|]+\s+/, '').replace(/^(?!\/)/, '/');
            if (p.startsWith('/') && !p.startsWith('cli:')) {
                routeIndex.push({ id: node.id, re: new RegExp(`^${p.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{[^}]+\\?\}/g, '[^/]+')}/?$`) });
            }
        }
    }
    for (const node of nodes.values()) {
        if (node.lang === 'php') continue;
        for (const url of node.dataAccess) {
            const p = url.split('?')[0].replace(/^https?:\/\/[^/]+/, '');
            const hit = routeIndex.find((r) => r.re.test(p));
            if (hit) addEdge(node.id, hit.id, 'calls');
        }
    }

    // A plain `uses` adds nothing when the pair already has a stronger relation.
    const strongPairs = new Set([...edges.values()].filter((e) => e.type !== 'uses').map((e) => `${e.source}|${e.target}`));
    const edgeList = [...edges.values()].filter((e) => e.type !== 'uses' || !strongPairs.has(`${e.source}|${e.target}`));

    const fanIn = new Map();
    const fanOut = new Map();
    const extOut = new Map();
    for (const e of edgeList) {
        if (externals.has(e.target)) {
            if (!extOut.has(e.source)) extOut.set(e.source, new Set());
            extOut.get(e.source).add(e.target);
            continue;
        }
        if (!fanIn.has(e.target)) fanIn.set(e.target, new Set());
        if (!fanOut.has(e.source)) fanOut.set(e.source, new Set());
        fanIn.get(e.target).add(e.source);
        fanOut.get(e.source).add(e.target);
    }

    const nodeList = [...nodes.values()].map((n) => {
        const out = {
            ...n,
            entry: [...n.entry],
            routes: [...new Set(n.routes)],
            listensTo: [...new Set(n.listensTo)],
            dispatches: [...new Set(n.dispatches)],
            hooks: [...new Set(n.hooks)],
            dataAccess: [...new Set(n.dataAccess)],
            fanIn: fanIn.has(n.id) ? fanIn.get(n.id).size : 0,
            fanOut: fanOut.has(n.id) ? fanOut.get(n.id).size : 0,
            externalDeps: extOut.has(n.id) ? extOut.get(n.id).size : 0,
        };
        out.layer = layerOf(out);
        out.score = Math.round((out.fanIn * 2 + out.fanOut * 0.5 + Math.log2(out.loc + 1)) * 100) / 100;
        return out;
    }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

    const externalList = [...externals.values()].sort((a, b) => b.refs - a.refs);
    return {
        meta: {
            version: 1,
            repo: path.basename(repo),
            frameworks,
            includes,
            excludes,
            withTests: Boolean(withTests),
            generatedAt: new Date().toISOString(),
            files: parsed.length,
            skippedGenerated: stats.skippedGenerated.length,
            skippedLarge: stats.skippedLarge.length,
            nodeCount: nodeList.length,
            edgeCount: edgeList.filter((e) => !externals.has(e.target)).length,
            externalCount: externalList.length,
        },
        nodes: nodeList,
        externals: externalList,
        edges: edgeList,
    };
}

module.exports = { buildGraph, externalKey, groupOf };
