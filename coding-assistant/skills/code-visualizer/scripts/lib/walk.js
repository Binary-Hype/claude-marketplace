'use strict';

/**
 * Allowlist walker: only descends into the include roots it is given and
 * never into framework, vendor, build or secret locations, even when an
 * include root contains them.
 */

const fs = require('fs');
const path = require('path');

const EXCLUDED_DIRS = new Set([
    'vendor', 'node_modules', 'var', 'storage', 'public', 'dist', 'build',
    '.git', '.svn', '.idea', '.vscode', '.ddev', '.github', '.gitlab',
    'coverage', '.cache', '.next', '.nuxt', '.output', '.turbo', '__snapshots__',
]);

const TEST_DIRS = new Set(['tests', 'test', 'Tests', 'Test', '__tests__', 'spec', 'cypress', 'e2e']);

const EXCLUDED_PATH_PATTERNS = [
    /(^|\/)bootstrap\/cache(\/|$)/,
    /(^|\/)Resources\/public(\/|$)/,
    /(^|\/)Resources\/app\/[^/]+\/dist(\/|$)/,
    /(^|\/)wp-admin(\/|$)/,
    /(^|\/)wp-includes(\/|$)/,
];

const CODE_EXTENSIONS = new Set(['.php', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue']);

const SECRET_PATTERNS = [
    /^\.env(\..*)?$/,
    /\.(pem|key|p12|pfx|crt|cer|jks|keystore)$/i,
    /^id_(rsa|ed25519|ecdsa|dsa)/,
    /^\.(npmrc|netrc|htpasswd|pgpass)$/,
    /^(vault|secrets?|credentials)\.(ya?ml|json|php)$/i,
    /^auth\.json$/,
];

const MAX_FILE_BYTES = 1024 * 1024;

function toPosix(p) {
    return p.split(path.sep).join('/');
}

function isSecretFile(name) {
    return SECRET_PATTERNS.some((re) => re.test(name));
}

function isServiceDefinition(rel) {
    const base = path.posix.basename(rel);
    return base === 'services.xml' || /\/Resources\/config\/services\/[^/]+\.xml$/.test(rel);
}

function isCodeFile(rel) {
    const base = path.posix.basename(rel);
    if (isSecretFile(base)) return false;
    if (/\.min\.(js|mjs|cjs)$/.test(base) || base.endsWith('.map') || base.endsWith('.d.ts')) return false;
    return CODE_EXTENSIONS.has(path.posix.extname(base)) || isServiceDefinition(rel);
}

function isExcludedDir(name, rel, options) {
    if (EXCLUDED_DIRS.has(name)) return true;
    if (!options.withTests && TEST_DIRS.has(name)) return true;
    if (EXCLUDED_PATH_PATTERNS.some((re) => re.test(rel))) return true;
    return (options.excludes || []).some((ex) => rel === ex || rel.startsWith(ex + '/'));
}

/**
 * Normalise an include/exclude argument to a repo-relative POSIX path and
 * refuse anything that points outside the repository.
 */
function normaliseRoot(repo, input) {
    const abs = path.resolve(repo, input);
    const rel = toPosix(path.relative(repo, abs));
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
        throw new Error(`Path is outside the repository: ${input}`);
    }
    return rel === '' ? '.' : rel;
}

/**
 * List code files below the given include roots. Symlinks are never
 * followed, so a symlinked vendor package cannot sneak into the scope.
 */
function listCodeFiles(repo, includes, options = {}) {
    const excludes = (options.excludes || []).map((ex) => normaliseRoot(repo, ex));
    const opts = { ...options, excludes };
    const seen = new Set();
    const files = [];

    function visit(rel) {
        const abs = rel === '.' ? repo : path.join(repo, rel);
        let entries;
        try {
            entries = fs.readdirSync(abs, { withFileTypes: true });
        } catch {
            return;
        }
        entries.sort((a, b) => a.name.localeCompare(b.name));
        for (const entry of entries) {
            const childRel = rel === '.' ? entry.name : `${rel}/${entry.name}`;
            if (entry.isSymbolicLink()) continue;
            if (entry.isDirectory()) {
                if (!isExcludedDir(entry.name, childRel, opts)) visit(childRel);
            } else if (entry.isFile() && isCodeFile(childRel) && !seen.has(childRel)) {
                if (excludes.some((ex) => childRel === ex || childRel.startsWith(ex + '/'))) continue;
                seen.add(childRel);
                files.push(childRel);
            }
        }
    }

    for (const include of includes) {
        const rel = normaliseRoot(repo, include);
        const blocked = rel.split('/').find((seg) => EXCLUDED_DIRS.has(seg));
        if (blocked) throw new Error(`Include path is inside an always-excluded location (${blocked}/): ${include}`);
        const abs = path.join(repo, rel);
        let stat;
        try {
            stat = fs.lstatSync(abs);
        } catch {
            throw new Error(`Include path does not exist: ${include}`);
        }
        if (stat.isSymbolicLink()) continue;
        if (stat.isFile()) {
            if (isCodeFile(rel) && !seen.has(rel)) {
                seen.add(rel);
                files.push(rel);
            }
        } else if (rel === '.' || !isExcludedDir(path.posix.basename(rel), rel, opts)) {
            visit(rel);
        }
    }
    return files;
}

/**
 * Read a file that passed the walker. Returns null for oversized or
 * generated files so they never reach the extractors.
 */
function readCodeFile(repo, rel, stats) {
    const abs = path.join(repo, rel);
    const size = fs.statSync(abs).size;
    if (size > MAX_FILE_BYTES) {
        stats.skippedLarge.push(rel);
        return null;
    }
    if (process.env.CODE_VISUALIZER_DEBUG) process.stderr.write(`read ${rel}\n`);
    const source = fs.readFileSync(abs, 'utf8');
    if (/@generated|auto-generated|autogenerated|DO NOT EDIT/i.test(source.slice(0, 600))) {
        stats.skippedGenerated.push(rel);
        return null;
    }
    return { source, bytes: size };
}

module.exports = {
    EXCLUDED_DIRS,
    TEST_DIRS,
    isCodeFile,
    isExcludedDir,
    isServiceDefinition,
    listCodeFiles,
    normaliseRoot,
    readCodeFile,
    toPosix,
};
