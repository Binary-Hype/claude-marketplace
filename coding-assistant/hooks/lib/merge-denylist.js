#!/usr/bin/env node
/**
 * Merge denylist configurations from 3 tiers into cache files.
 *
 * Priority (later overrides earlier):
 *   1. Plugin defaults:  ${CLAUDE_PLUGIN_ROOT}/hooks/config/default-denylist.json
 *   2. Global user:      ~/.claude/security/denylist.json
 *   3. Per-project:      .claude/security/denylist.json (relative to CWD)
 *
 * Supports two JSON formats:
 *   - Object: { "deny": [...], "allow": [...] }
 *   - Array:  [...] (treated as all-deny, no allow)
 *
 * Outputs:
 *   /tmp/claude-security-<uid>/deny-patterns.json   (JSON array of deny patterns)
 *   /tmp/claude-security-<uid>/allow-patterns.json   (JSON array of allow patterns)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function getCacheDir() {
  if (process.env.CLAUDE_SECURITY_CACHE_DIR) {
    return process.env.CLAUDE_SECURITY_CACHE_DIR;
  }
  const uid = process.getuid ? process.getuid() : 'default';
  return `/tmp/claude-security-${uid}`;
}

function loadConfig(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed)) {
      return { deny: parsed, allow: [] };
    }

    return {
      deny: Array.isArray(parsed.deny) ? parsed.deny : [],
      allow: Array.isArray(parsed.allow) ? parsed.allow : [],
    };
  } catch {
    return null;
  }
}

function merge() {
  const denyPatterns = new Set();
  const allowPatterns = new Set();

  // Tier 1: Plugin defaults (required)
  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '../..');
  const defaultPath = path.join(pluginRoot, 'hooks', 'config', 'default-denylist.json');
  const defaultConfig = loadConfig(defaultPath);

  if (!defaultConfig) {
    process.stderr.write(`[protect-secrets] ERROR: Default denylist not found: ${defaultPath}\n`);
    process.exit(1);
  }

  defaultConfig.deny.forEach((p) => denyPatterns.add(p));
  defaultConfig.allow.forEach((p) => allowPatterns.add(p));

  // Tier 2: Global user config (optional)
  const globalPath = path.join(os.homedir(), '.claude', 'security', 'denylist.json');
  const globalConfig = loadConfig(globalPath);
  if (globalConfig) {
    globalConfig.deny.forEach((p) => denyPatterns.add(p));
    globalConfig.allow.forEach((p) => allowPatterns.add(p));
  }

  // Tier 3: Per-project config (optional)
  const projectPath = path.join(process.cwd(), '.claude', 'security', 'denylist.json');
  const projectConfig = loadConfig(projectPath);
  if (projectConfig) {
    projectConfig.deny.forEach((p) => denyPatterns.add(p));
    projectConfig.allow.forEach((p) => allowPatterns.add(p));
  }

  // Write cache files atomically
  const cacheDir = getCacheDir();

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true, mode: 0o700 });
  }

  const denyFile = path.join(cacheDir, 'deny-patterns.json');
  const allowFile = path.join(cacheDir, 'allow-patterns.json');

  const denyTmp = denyFile + '.tmp';
  const allowTmp = allowFile + '.tmp';

  fs.writeFileSync(denyTmp, JSON.stringify([...denyPatterns]), 'utf8');
  fs.renameSync(denyTmp, denyFile);

  fs.writeFileSync(allowTmp, JSON.stringify([...allowPatterns]), 'utf8');
  fs.renameSync(allowTmp, allowFile);

  return { deny: [...denyPatterns], allow: [...allowPatterns] };
}

// Run if called directly
if (require.main === module) {
  const result = merge();
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

module.exports = { merge };
