#!/usr/bin/env node
/**
 * Shared utilities for Claude Code security hooks.
 *
 * Provides stdin reading, cache directory management,
 * and glob pattern matching for file basename checks.
 */

const fs = require('fs');
const path = require('path');

/**
 * Read all data from stdin and parse as JSON.
 * Returns a promise that resolves with the parsed object.
 */
function readStdinJSON() {
  return new Promise((resolve, reject) => {
    const MAX_STDIN = 1024 * 1024; // 1MB limit
    let data = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      if (data.length < MAX_STDIN) {
        data += chunk;
      }
    });

    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error(`Failed to parse stdin JSON: ${err.message}`));
      }
    });

    process.stdin.on('error', reject);
  });
}

/**
 * Get the cache directory path for security hooks.
 * Creates the directory if it doesn't exist.
 * Uses /tmp/claude-security-<uid>/ for session scoping.
 *
 * Supports CLAUDE_SECURITY_CACHE_DIR env var for testing.
 * Uses /tmp explicitly (not os.tmpdir()) for cross-platform
 * consistency with bash scripts and exempt-secret.
 */
function getCacheDir() {
  if (process.env.CLAUDE_SECURITY_CACHE_DIR) {
    const dir = process.env.CLAUDE_SECURITY_CACHE_DIR;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
    return dir;
  }

  const uid = process.getuid ? process.getuid() : 'default';
  const cacheDir = `/tmp/claude-security-${uid}`;

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true, mode: 0o700 });
  }

  return cacheDir;
}

/**
 * Match a filename against a glob-like pattern.
 * Supports * (any chars) and ? (single char) wildcards.
 *
 * @param {string} filename - The filename (basename) to check
 * @param {string} pattern - The glob pattern (e.g., "*.pem", ".env.*", "id_rsa*")
 * @returns {boolean}
 */
function matchesGlob(filename, pattern) {
  let regex = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '*') {
      regex += '.*';
    } else if (c === '?') {
      regex += '.';
    } else if ('.+^${}()|[]\\'.includes(c)) {
      regex += '\\' + c;
    } else {
      regex += c;
    }
  }

  return new RegExp(`^${regex}$`).test(filename);
}

/**
 * Write to stderr (shown to Claude as hook message).
 * @param {string} msg
 */
function warn(msg) {
  process.stderr.write(msg + '\n');
}

module.exports = {
  readStdinJSON,
  getCacheDir,
  matchesGlob,
  warn,
};
