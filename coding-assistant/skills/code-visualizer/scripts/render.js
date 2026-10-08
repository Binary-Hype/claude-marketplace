#!/usr/bin/env node
'use strict';

/**
 * Renders the self-contained viewer.
 *
 *   render.js <graph.json> <annotations.json|-> <out.html>
 *
 * Annotations are validated against the graph: unknown node ids are
 * dropped with a warning, and every flow hop without a graph edge is
 * marked as inferred.
 */

const fs = require('fs');
const path = require('path');

const PLACEHOLDER = '/*__CODE_MAP_DATA__*/null';

function loadAnnotations(file) {
    if (!file || file === '-' || !fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function validate(graph, annotations, warn) {
    const ids = new Set([...graph.nodes.map((n) => n.id), ...graph.externals.map((e) => e.id)]);
    const linked = new Set(graph.edges.map((e) => `${e.source}|${e.target}`));
    const summaries = {};
    for (const [id, text] of Object.entries(annotations.summaries || {})) {
        if (ids.has(id)) summaries[id] = String(text);
        else warn(`summary for unknown node dropped: ${id}`);
    }
    const flows = [];
    for (const flow of annotations.flows || []) {
        const steps = (flow.steps || []).filter((id) => {
            if (ids.has(id)) return true;
            warn(`flow "${flow.name}": unknown step dropped: ${id}`);
            return false;
        });
        if (steps.length < 2) {
            warn(`flow "${flow.name}" dropped: fewer than two known steps`);
            continue;
        }
        const hops = steps.slice(1).map((to, i) => {
            const from = steps[i];
            return { from, to, inferred: !linked.has(`${from}|${to}`) && !linked.has(`${to}|${from}`) };
        });
        flows.push({
            name: String(flow.name || 'Flow'),
            description: String(flow.description || ''),
            data: String(flow.data || ''),
            steps,
            hops,
        });
    }
    return { overview: String(annotations.overview || ''), summaries, flows };
}

function main() {
    const [graphFile, annotationsFile, outFile] = process.argv.slice(2);
    if (!graphFile || !outFile) {
        process.stderr.write('Usage: render.js <graph.json> <annotations.json|-> <out.html>\n');
        process.exit(2);
    }
    const graph = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
    const warnings = [];
    const annotations = validate(graph, loadAnnotations(annotationsFile), (w) => warnings.push(w));
    const template = fs.readFileSync(path.join(__dirname, '..', 'template', 'code-map.html'), 'utf8');
    if (!template.includes(PLACEHOLDER)) throw new Error('template placeholder missing');
    const payload = JSON.stringify({ ...graph, annotations })
        .replace(/</g, '\\u003c')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
    const html = template
        .replace('__CODE_MAP_TITLE__', graph.meta.repo.replace(/[<>&"]/g, ''))
        .replace(PLACEHOLDER, () => payload);
    fs.writeFileSync(outFile, html);
    for (const w of warnings) process.stderr.write(`warning: ${w}\n`);
    process.stdout.write(`${JSON.stringify({ out: path.resolve(outFile), flows: annotations.flows.length, summaries: Object.keys(annotations.summaries).length, warnings: warnings.length })}\n`);
}

try {
    main();
} catch (err) {
    process.stderr.write(`code-visualizer: ${err.message}\n`);
    process.exit(1);
}
