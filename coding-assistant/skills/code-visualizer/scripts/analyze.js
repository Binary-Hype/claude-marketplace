#!/usr/bin/env node
'use strict';

/**
 * code-visualizer analyzer.
 *
 *   analyze.js detect  <repo>
 *   analyze.js scan    <repo> --include <path> [--include <path>...] [--exclude <path>...] [--with-tests] --out <graph.json>
 *   analyze.js summary <graph.json> [--top <n>]
 *
 * `detect` reads manifests only. `scan` reads files below the --include
 * roots only and never vendor, build, test or secret locations.
 */

const fs = require('fs');
const path = require('path');
const { detect } = require('./lib/detect');
const { listCodeFiles, readCodeFile, isServiceDefinition } = require('./lib/walk');
const { parsePhp, parseServicesXml } = require('./lib/php');
const { parseJs } = require('./lib/js');
const { buildGraph } = require('./lib/graph');
const { summarize } = require('./lib/summary');

function parseArgs(argv) {
    const args = { _: [], include: [], exclude: [] };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--include' || arg === '--exclude') args[arg.slice(2)].push(argv[++i]);
        else if (arg === '--out' || arg === '--top') args[arg.slice(2)] = argv[++i];
        else if (arg === '--with-tests') args.withTests = true;
        else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
        else args._.push(arg);
    }
    return args;
}

function repoPath(input) {
    const repo = path.resolve(input || '.');
    if (!fs.existsSync(repo) || !fs.statSync(repo).isDirectory()) throw new Error(`Not a directory: ${repo}`);
    return repo;
}

function scan(repo, args) {
    if (!args.include.length) throw new Error('scan needs at least one --include <path>; run detect first and pass the chosen roots');
    if (!args.out) throw new Error('scan needs --out <graph.json>');
    const stats = { skippedGenerated: [], skippedLarge: [], failed: [] };
    const files = listCodeFiles(repo, args.include, { excludes: args.exclude, withTests: args.withTests });
    const parsed = [];
    for (const rel of files) {
        const file = readCodeFile(repo, rel, stats);
        if (!file) continue;
        try {
            let lang;
            let result;
            if (rel.endsWith('.php')) {
                lang = 'php';
                result = parsePhp(file.source, rel);
            } else if (isServiceDefinition(rel)) {
                lang = 'xml';
                result = parseServicesXml(file.source);
            } else {
                lang = rel.endsWith('.vue') ? 'vue' : /\.tsx?$/.test(rel) ? 'ts' : 'js';
                result = parseJs(file.source, rel);
            }
            parsed.push({ rel, lang, bytes: file.bytes, result });
        } catch (err) {
            stats.failed.push(`${rel}: ${err.message}`);
        }
    }
    const includes = args.include.map((p) => path.posix.normalize(p.replace(/\\/g, '/')).replace(/\/+$/, '') || '.');
    const graph = buildGraph({
        repo,
        includes,
        excludes: args.exclude,
        withTests: args.withTests,
        frameworks: detect(repo).frameworks,
        parsed,
        stats,
    });
    fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
    fs.writeFileSync(args.out, JSON.stringify(graph));
    return {
        out: path.resolve(args.out),
        files: graph.meta.files,
        nodes: graph.meta.nodeCount,
        edges: graph.meta.edgeCount,
        externals: graph.meta.externalCount,
        entryPoints: graph.nodes.filter((n) => n.entry.length).length,
        skippedGenerated: stats.skippedGenerated.length,
        skippedLarge: stats.skippedLarge.length,
        failed: stats.failed,
    };
}

function main() {
    const [command, ...rest] = process.argv.slice(2);
    const args = parseArgs(rest);
    if (command === 'detect') {
        process.stdout.write(`${JSON.stringify(detect(repoPath(args._[0])), null, 2)}\n`);
    } else if (command === 'scan') {
        process.stdout.write(`${JSON.stringify(scan(repoPath(args._[0]), args), null, 2)}\n`);
    } else if (command === 'summary') {
        const graph = JSON.parse(fs.readFileSync(args._[0], 'utf8'));
        process.stdout.write(`${summarize(graph, Number(args.top) || 15)}\n`);
    } else {
        process.stderr.write('Usage: analyze.js detect <repo> | scan <repo> --include <path>... --out <file> | summary <graph.json>\n');
        process.exit(2);
    }
}

try {
    main();
} catch (err) {
    process.stderr.write(`code-visualizer: ${err.message}\n`);
    process.exit(1);
}
