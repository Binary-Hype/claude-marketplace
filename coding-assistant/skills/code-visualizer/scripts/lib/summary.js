'use strict';

/**
 * Compact text digest of graph.json for Claude: rankings, entry points and
 * downstream trees, so the annotation step never needs the raw JSON.
 */

function pad(value, width) {
    const s = String(value);
    return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

function row(n) {
    return `  ${pad(n.id, 70)} ${pad(n.layer, 16)} loc=${pad(n.loc, 5)} in=${pad(n.fanIn, 3)} out=${pad(n.fanOut, 3)} ${n.file}:${n.line}-${n.endLine}`;
}

function entryLabel(n) {
    const details = [...n.routes, ...n.listensTo.map((e) => `on ${e}`), ...n.hooks.map((h) => `hook ${h}`)];
    return `${n.entry.join(',')}${details.length ? ` — ${details.slice(0, 4).join('; ')}` : ''}`;
}

function summarize(graph, top = 15) {
    const byId = new Map(graph.nodes.map((n) => [n.id, n]));
    const out = new Map();
    for (const e of graph.edges) {
        if (!byId.has(e.target)) continue;
        if (!out.has(e.source)) out.set(e.source, []);
        out.get(e.source).push(e);
    }
    const lines = [];
    const m = graph.meta;
    lines.push(`Repo: ${m.repo} | Frameworks: ${m.frameworks.join(', ') || 'none detected'} | Files: ${m.files}`);
    lines.push(`Scope: ${m.includes.join(', ')}${m.excludes.length ? ` | excluded: ${m.excludes.join(', ')}` : ''}${m.withTests ? ' | tests included' : ''}`);
    lines.push(`Nodes: ${m.nodeCount} | Internal edges: ${m.edgeCount} | Externals: ${m.externalCount} | Skipped generated: ${m.skippedGenerated}, large: ${m.skippedLarge}`);

    const groups = new Map();
    for (const n of graph.nodes) groups.set(n.group, (groups.get(n.group) || 0) + 1);
    lines.push('', 'GROUPS', `  ${[...groups].sort((a, b) => b[1] - a[1]).map(([g, c]) => `${g} (${c})`).join(', ')}`);

    lines.push('', `TOP ${top} BY SCORE`, ...graph.nodes.slice(0, top).map(row));
    lines.push('', 'MOST USED (fan-in)', ...[...graph.nodes].sort((a, b) => b.fanIn - a.fanIn).slice(0, 10).map(row));
    lines.push('', 'BIGGEST (loc)', ...[...graph.nodes].sort((a, b) => b.loc - a.loc).slice(0, 10).map(row));

    const entries = graph.nodes.filter((n) => n.entry.length);
    lines.push('', `ENTRY POINTS (${entries.length})`, ...entries.slice(0, 40).map((n) => `  ${n.id} [${entryLabel(n)}]`));

    lines.push('', 'DOWNSTREAM FROM ENTRY POINTS (internal edges, depth 3)');
    for (const entry of entries.slice(0, 20)) {
        lines.push(`  ${entry.id} [${entryLabel(entry)}]`);
        const seen = new Set([entry.id]);
        const walk = (id, depth) => {
            if (depth > 3) return;
            const children = (out.get(id) || [])
                .filter((e) => !seen.has(e.target))
                .sort((a, b) => byId.get(b.target).score - byId.get(a.target).score)
                .slice(0, 6);
            for (const e of children) {
                seen.add(e.target);
                const t = byId.get(e.target);
                const extra = t.dataAccess.length ? ` data: ${t.dataAccess.slice(0, 3).join(', ')}` : '';
                lines.push(`${'    '.repeat(depth)}  -${e.type}-> ${t.id} (${t.layer})${extra}`);
                walk(e.target, depth + 1);
            }
        };
        walk(entry.id, 1);
    }

    const data = graph.nodes.filter((n) => n.dataAccess.length);
    if (data.length) {
        lines.push('', 'DATA ACCESS', ...data.slice(0, 20).map((n) => `  ${n.id}: ${n.dataAccess.join(', ')}`));
    }
    lines.push('', 'EXTERNALS (folded, not scanned)', `  ${graph.externals.slice(0, 15).map((e) => `${e.name} (${e.refs})`).join(', ')}`);
    return lines.join('\n');
}

module.exports = { summarize };
