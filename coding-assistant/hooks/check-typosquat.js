#!/usr/bin/env node
/**
 * check-typosquat.js - PreToolUse hook for dependency typosquat detection
 *
 * Detects potentially typosquatted package names in npm/yarn/pnpm/composer/bun
 * install commands by comparing against a curated list of popular packages
 * using Levenshtein distance and common typosquat patterns.
 *
 * Uses 3-tier config: plugin defaults → ~/.claude/popular-packages.json →
 * .claude/popular-packages.json
 *
 * Exit codes:
 *   0 = allow the tool call
 *   2 = block the tool call (stderr = reason shown to Claude)
 */

const fs = require('fs');
const path = require('path');
const { readStdinJSON, warn } = require('./lib/utils');

/**
 * Compute Levenshtein distance between two strings.
 */
function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check for hyphen/underscore swap typosquatting.
 * e.g., "lodash" vs "lo-dash", "node_fetch" vs "node-fetch"
 */
function isHyphenUnderscoreSwap(pkg, popular) {
  const normalize = (s) => s.replace(/[-_]/g, '');
  return normalize(pkg) === normalize(popular) && pkg !== popular;
}

/**
 * Load popular packages with 3-tier merge.
 */
function loadPopularPackages() {
  const pluginDir = path.dirname(__filename || __dirname);
  const defaultPath = path.join(pluginDir, 'config', 'default-popular-packages.json');

  let config = { npm: [], composer: [] };

  // Tier 1: Plugin defaults
  try {
    config = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  } catch {
    // Use empty lists as fallback
  }

  // Tier 2: User config (~/.claude/popular-packages.json)
  try {
    const home = process.env.HOME || process.env.USERPROFILE || '';
    const userPath = path.join(home, '.claude', 'popular-packages.json');
    if (fs.existsSync(userPath)) {
      const userConfig = JSON.parse(fs.readFileSync(userPath, 'utf8'));
      if (userConfig.npm) config.npm = [...new Set([...config.npm, ...userConfig.npm])];
      if (userConfig.composer) config.composer = [...new Set([...config.composer, ...userConfig.composer])];
    }
  } catch {
    // Ignore
  }

  // Tier 3: Project config (.claude/popular-packages.json)
  try {
    const projectPath = path.join(process.cwd(), '.claude', 'popular-packages.json');
    if (fs.existsSync(projectPath)) {
      const projectConfig = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
      if (projectConfig.npm) config.npm = [...new Set([...config.npm, ...projectConfig.npm])];
      if (projectConfig.composer) config.composer = [...new Set([...config.composer, ...projectConfig.composer])];
    }
  } catch {
    // Ignore
  }

  return config;
}

/**
 * Detect the package manager and extract package names from a command.
 * Returns { manager: 'npm'|'composer'|null, packages: string[] }
 */
function parseCommand(command) {
  // Normalize: strip leading ddev exec if present
  let cmd = command.replace(/^\s*ddev\s+(exec\s+)?/, '');

  // npm install/i/add <packages>
  const npmMatch = cmd.match(/\b(?:npm|npx)\s+(?:install|i|add)\s+(.+)/);
  if (npmMatch) {
    return { manager: 'npm', packages: extractPackageNames(npmMatch[1], 'npm') };
  }

  // yarn add <packages>
  const yarnMatch = cmd.match(/\byarn\s+add\s+(.+)/);
  if (yarnMatch) {
    return { manager: 'npm', packages: extractPackageNames(yarnMatch[1], 'npm') };
  }

  // pnpm add/install <packages>
  const pnpmMatch = cmd.match(/\bpnpm\s+(?:add|install)\s+(.+)/);
  if (pnpmMatch) {
    return { manager: 'npm', packages: extractPackageNames(pnpmMatch[1], 'npm') };
  }

  // bun add/install <packages>
  const bunMatch = cmd.match(/\bbun\s+(?:add|install)\s+(.+)/);
  if (bunMatch) {
    return { manager: 'npm', packages: extractPackageNames(bunMatch[1], 'npm') };
  }

  // composer require <packages>
  const composerMatch = cmd.match(/\bcomposer\s+require\s+(.+)/);
  if (composerMatch) {
    return { manager: 'composer', packages: extractPackageNames(composerMatch[1], 'composer') };
  }

  return { manager: null, packages: [] };
}

/**
 * Extract package names from the arguments portion of an install command.
 * Strips flags and version specifiers.
 */
function extractPackageNames(args, manager) {
  const tokens = args.trim().split(/\s+/);
  const packages = [];

  // Flags to skip (including their values if applicable)
  const skipFlags = new Set([
    '--save-dev', '-D', '--dev', '--global', '-g', '--save', '-S',
    '--save-peer', '-P', '--save-optional', '-O', '--exact', '-E',
    '--tilde', '-T', '--no-save', '--legacy-peer-deps',
    '--save-exact', '--production', '--optional', '--prefer-dev',
    '--no-update', '--no-install', '--no-scripts', '--dry-run',
    '--with-all-dependencies', '-W', '-w',
  ]);

  // Flags that take a value argument (skip next token too)
  const valueFlagPrefixes = ['--registry', '--cache-dir', '--prefer-dist', '--prefer-source'];

  let skipNext = false;
  for (const token of tokens) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    // Skip flags
    if (token.startsWith('-')) {
      if (skipFlags.has(token)) continue;
      if (valueFlagPrefixes.some((f) => token.startsWith(f) && !token.includes('='))) {
        skipNext = true;
      }
      continue;
    }

    // Skip if it looks like a URL or local path
    if (token.startsWith('http://') || token.startsWith('https://') ||
        token.startsWith('./') || token.startsWith('../') || token.startsWith('/')) {
      continue;
    }

    // Strip version specifier
    let pkg = token;
    if (manager === 'npm') {
      // Handle @scope/name@version — keep @scope/name, strip @version
      if (pkg.startsWith('@')) {
        const atIdx = pkg.indexOf('@', 1);
        if (atIdx > 0) pkg = pkg.substring(0, atIdx);
      } else {
        const atIdx = pkg.indexOf('@');
        if (atIdx > 0) pkg = pkg.substring(0, atIdx);
      }
    } else if (manager === 'composer') {
      // Handle vendor/package:^1.0 or vendor/package ^1.0
      const colonIdx = pkg.indexOf(':');
      if (colonIdx > 0) pkg = pkg.substring(0, colonIdx);
      // Skip version-only tokens (e.g., "^1.0" after a package name)
      if (/^[\^~><=*\d]/.test(pkg) && !pkg.includes('/')) continue;
    }

    if (pkg) packages.push(pkg);
  }

  return packages;
}

/**
 * Check a single package name against the popular packages list.
 * Returns { suspicious: boolean, match: string, reason: string } or null.
 */
function checkPackage(pkg, popularList) {
  // Exact match — it IS the popular package, allow
  if (popularList.includes(pkg)) {
    return null;
  }

  for (const popular of popularList) {
    // Skip comparison if lengths are too different (Levenshtein won't be <=2)
    if (Math.abs(pkg.length - popular.length) > 2) continue;

    // For composer packages, compare only if both have vendor/ prefix
    const pkgHasVendor = pkg.includes('/');
    const popHasVendor = popular.includes('/');
    if (pkgHasVendor !== popHasVendor) continue;

    // Levenshtein distance check
    const dist = levenshtein(pkg, popular);
    if (dist >= 1 && dist <= 2) {
      return {
        suspicious: true,
        match: popular,
        reason: `name is ${dist} character${dist > 1 ? 's' : ''} different from "${popular}"`,
      };
    }

    // Hyphen/underscore swap check
    if (isHyphenUnderscoreSwap(pkg, popular)) {
      return {
        suspicious: true,
        match: popular,
        reason: `differs from "${popular}" only by hyphen/underscore swap`,
      };
    }
  }

  return null;
}

async function main() {
  let input;
  try {
    input = await readStdinJSON();
  } catch {
    // Fail open
    process.exit(0);
  }

  const toolName = input.tool_name || '';
  const command = (input.tool_input || {}).command || '';

  // Only intercept Bash tool calls
  if (toolName !== 'Bash' || !command) {
    process.exit(0);
  }

  // Parse the command to detect package manager and extract package names
  const { manager, packages } = parseCommand(command);

  if (!manager || packages.length === 0) {
    process.exit(0);
  }

  // Load popular packages config
  const popularPackages = loadPopularPackages();
  const popularList = manager === 'composer' ? popularPackages.composer : popularPackages.npm;

  if (!popularList || popularList.length === 0) {
    process.exit(0);
  }

  // Check each package
  const suspicious = [];
  for (const pkg of packages) {
    const result = checkPackage(pkg, popularList);
    if (result) {
      suspicious.push({ package: pkg, ...result });
    }
  }

  if (suspicious.length === 0) {
    process.exit(0);
  }

  // Build block message
  const registry = manager === 'composer' ? 'packagist.org' : 'npmjs.com';
  const parts = [
    '[dependency-typosquat-checker] Suspicious package name(s) detected:\n',
  ];

  for (const s of suspicious) {
    parts.push(`  "${s.package}" — ${s.reason}`);
  }

  parts.push(`\nThis may be a typosquat attack. Please verify on ${registry} before installing.`);
  parts.push('If the package name is correct, ask the user to confirm and re-run the command.');

  warn(parts.join('\n'));
  process.exit(2);
}

main().catch(() => {
  // Fail open on unexpected errors
  process.exit(0);
});
