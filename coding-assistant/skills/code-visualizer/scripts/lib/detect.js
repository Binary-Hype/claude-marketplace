'use strict';

/**
 * Framework and candidate-root detection. Reads manifests (composer.json,
 * package.json, plugin/theme headers) and directory listings only — never
 * the project's source files.
 */

const fs = require('fs');
const path = require('path');
const { listCodeFiles } = require('./walk');

const FRAMEWORK_VENDORS = new Set([
    'laravel', 'shopware', 'symfony', 'roots', 'johnpbloch', 'wordpress',
    'wpackagist-plugin', 'wpackagist-theme', 'drupal', 'magento', 'typo3',
]);

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return null;
    }
}

function exists(repo, rel) {
    return fs.existsSync(path.join(repo, rel));
}

function isDir(abs) {
    try {
        return fs.statSync(abs).isDirectory();
    } catch {
        return false;
    }
}

function subdirs(repo, rel) {
    const abs = path.join(repo, rel);
    if (!isDir(abs)) return [];
    return fs.readdirSync(abs, { withFileTypes: true })
        .filter((e) => (e.isDirectory() || e.isSymbolicLink()) && !e.name.startsWith('.'))
        .map((e) => ({ name: e.name, rel: `${rel}/${e.name}`, symlink: e.isSymbolicLink() }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

function vendorOf(packageName) {
    if (!packageName || typeof packageName !== 'string') return null;
    return packageName.replace(/^@/, '').split('/')[0].toLowerCase();
}

function detectFrameworks(repo, composer, pkg) {
    const php = { ...(composer && composer.require), ...(composer && composer['require-dev']) };
    const js = { ...(pkg && pkg.dependencies), ...(pkg && pkg.devDependencies) };
    const found = [];
    if (php['laravel/framework'] || exists(repo, 'artisan')) found.push('laravel');
    if (php['shopware/core'] || php['shopware/platform'] || exists(repo, 'vendor/shopware/core')) found.push('shopware');
    if (php['symfony/framework-bundle'] && !found.length) found.push('symfony');
    if (exists(repo, 'wp-config.php') || exists(repo, 'wp-includes') || php['roots/wordpress'] || php['johnpbloch/wordpress']) {
        found.push('wordpress');
    }
    for (const [dep, name] of [['next', 'next'], ['nuxt', 'nuxt'], ['vue', 'vue'], ['react', 'react'], ['svelte', 'svelte'], ['@angular/core', 'angular']]) {
        if (js[dep]) found.push(name);
    }
    return found;
}

/** Namespace roots and vendors that identify the project's own code. */
function ownIdentity(composer, pkg) {
    const vendors = new Set();
    const namespaces = new Set();
    const rootVendor = vendorOf(composer && composer.name);
    if (rootVendor && !FRAMEWORK_VENDORS.has(rootVendor)) vendors.add(rootVendor);
    const pkgVendor = pkg && pkg.name && pkg.name.startsWith('@') ? vendorOf(pkg.name) : null;
    if (pkgVendor) vendors.add(pkgVendor);
    const psr4 = (composer && composer.autoload && composer.autoload['psr-4']) || {};
    for (const ns of Object.keys(psr4)) {
        const root = ns.split('\\')[0];
        if (root && root !== 'App' && root !== 'Database' && root !== 'Tests') namespaces.add(root.toLowerCase());
    }
    return { vendors, namespaces };
}

function countFiles(repo, rel) {
    try {
        return listCodeFiles(repo, [rel]).length;
    } catch {
        return 0;
    }
}

function readHeader(file, fields) {
    let head;
    try {
        const fd = fs.openSync(file, 'r');
        const buf = Buffer.alloc(8192);
        const n = fs.readSync(fd, buf, 0, buf.length, 0);
        fs.closeSync(fd);
        head = buf.slice(0, n).toString('utf8');
    } catch {
        return null;
    }
    const out = {};
    for (const [key, label] of Object.entries(fields)) {
        const m = head.match(new RegExp(`^[\\s*#@/]*${label}:\\s*(.+)$`, 'mi'));
        if (m) out[key] = m[1].trim();
    }
    return Object.keys(out).length ? out : null;
}

function wordpressPluginHeader(repo, rel) {
    const abs = path.join(repo, rel);
    const candidates = fs.readdirSync(abs).filter((f) => f.endsWith('.php'));
    for (const file of candidates) {
        const header = readHeader(path.join(abs, file), { name: 'Plugin Name', author: 'Author', authorUri: 'Author URI' });
        if (header && header.name) return header;
    }
    return null;
}

function pluginRoot(repo, dir, kind, identity) {
    const manifest = readJson(path.join(repo, dir.rel, 'composer.json'));
    const name = manifest && manifest.name;
    const vendor = vendorOf(name);
    const namespaces = Object.keys((manifest && manifest.autoload && manifest.autoload['psr-4']) || {})
        .map((ns) => ns.split('\\')[0].toLowerCase());
    let header = null;
    if (kind === 'wordpress-plugin') header = wordpressPluginHeader(repo, dir.rel);
    if (kind === 'wordpress-theme') header = readHeader(path.join(repo, dir.rel, 'style.css'), { name: 'Theme Name', author: 'Author' });
    const authors = ((manifest && manifest.authors) || []).map((a) => a.name).filter(Boolean);
    if (header && header.author) authors.push(header.author);
    const ownVendor = Boolean(
        (vendor && identity.vendors.has(vendor)) || namespaces.some((ns) => identity.namespaces.has(ns)),
    );
    return {
        path: dir.rel,
        kind,
        label: (header && header.name) || dir.name,
        package: name || null,
        vendor,
        authors,
        ownVendor,
        hasGit: exists(repo, `${dir.rel}/.git`),
        symlink: dir.symlink,
        files: dir.symlink ? 0 : countFiles(repo, dir.rel),
        suggested: ownVendor,
    };
}

function addRoot(roots, repo, rel, kind, suggested) {
    if (roots.some((r) => r.path === rel) || !isDir(path.join(repo, rel))) return;
    const files = countFiles(repo, rel);
    if (!files) return;
    roots.push({ path: rel, kind, label: rel, files, suggested, ownVendor: true });
}

function detect(repo) {
    const composer = readJson(path.join(repo, 'composer.json'));
    const pkg = readJson(path.join(repo, 'package.json'));
    const frameworks = detectFrameworks(repo, composer, pkg);
    const identity = ownIdentity(composer, pkg);
    const roots = [];
    const pluginFolders = [];

    const autoload = (composer && composer.autoload) || {};
    for (const dirs of Object.values(autoload['psr-4'] || {})) {
        for (const dir of [].concat(dirs)) {
            const rel = dir.replace(/\/+$/, '') || '.';
            if (rel === '.' || rel.startsWith('vendor') || rel.startsWith('database')) continue;
            addRoot(roots, repo, rel, 'own-code', true);
        }
    }
    for (const rel of ['app', 'src', 'lib']) addRoot(roots, repo, rel, 'own-code', true);
    addRoot(roots, repo, 'routes', 'routes', true);
    for (const rel of ['resources/js', 'resources/ts', 'resources/scripts']) addRoot(roots, repo, rel, 'frontend', true);
    addRoot(roots, repo, 'database', 'database', false);
    addRoot(roots, repo, 'config', 'config', false);

    const pluginLocations = [
        ['custom/plugins', 'shopware-plugin'],
        ['custom/static-plugins', 'shopware-plugin'],
        ['custom/apps', 'shopware-app'],
        ['wp-content/plugins', 'wordpress-plugin'],
        ['wp-content/mu-plugins', 'wordpress-plugin'],
        ['wp-content/themes', 'wordpress-theme'],
        ['web/app/plugins', 'wordpress-plugin'],
        ['web/app/themes', 'wordpress-theme'],
    ];
    for (const [folder, kind] of pluginLocations) {
        const dirs = subdirs(repo, folder);
        if (!dirs.length) continue;
        const entries = dirs.map((d) => pluginRoot(repo, d, kind, identity)).filter((r) => r.files || r.symlink);
        if (!entries.length) continue;
        pluginFolders.push({
            path: folder,
            kind,
            total: entries.length,
            own: entries.filter((e) => e.ownVendor).length,
            thirdParty: entries.filter((e) => !e.ownVendor).length,
        });
        roots.push(...entries);
    }

    if (!roots.length) {
        // Unknown layout: offer top-level directories that contain code.
        for (const dir of subdirs(repo, '.')) {
            const rel = dir.name;
            if (dir.symlink) continue;
            addRoot(roots, repo, rel, 'other', true);
        }
    }

    return {
        repo: path.basename(repo),
        frameworks,
        ownVendors: [...identity.vendors],
        ownNamespaces: [...identity.namespaces],
        pluginFolders,
        roots,
    };
}

module.exports = { detect };
