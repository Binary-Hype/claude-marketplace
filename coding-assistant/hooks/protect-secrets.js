#!/usr/bin/env node
/**
 * protect-secrets.js - PreToolUse hook for secret file protection
 *
 * Reads Claude Code hook JSON from stdin, extracts file paths from tool calls,
 * and checks them against a configurable deny/allow list. Returns exit code 2
 * with stderr message to block access.
 *
 * Replaces protect-env.sh with broader coverage: SSH keys, PEM files,
 * keystores, .npmrc, .netrc, vault files, and more.
 *
 * Fail-closed: if denylist cache is unavailable, blocks all file operations.
 *
 * Exit codes:
 *   0 = allow the tool call
 *   2 = block the tool call (stderr = reason shown to Claude)
 */

const fs = require('fs');
const path = require('path');
const { readStdinJSON, getCacheDir, matchesGlob, warn } = require('./lib/utils');

/**
 * Load cached deny/allow patterns from disk.
 * If cache is missing, runs merge-denylist.js to regenerate.
 * Returns { deny: string[], allow: string[] } or null on failure.
 */
function loadPatterns() {
  const cacheDir = getCacheDir();
  const denyFile = path.join(cacheDir, 'deny-patterns.json');
  const allowFile = path.join(cacheDir, 'allow-patterns.json');

  // If cache exists, load it
  if (fs.existsSync(denyFile) && fs.existsSync(allowFile)) {
    try {
      return {
        deny: JSON.parse(fs.readFileSync(denyFile, 'utf8')),
        allow: JSON.parse(fs.readFileSync(allowFile, 'utf8')),
      };
    } catch {
      // Cache corrupted, fall through to regenerate
    }
  }

  // Regenerate cache
  try {
    const { merge } = require('./lib/merge-denylist');
    return merge();
  } catch (err) {
    warn(`[protect-secrets] Failed to load or regenerate denylist: ${err.message}`);
    return null;
  }
}

/**
 * Load session override file (paths exempted by user).
 * Returns a Set of exempted paths/basenames.
 */
function loadOverrides() {
  const overrideFile = path.join(getCacheDir(), 'secret-overrides');
  const overrides = new Set();

  try {
    if (fs.existsSync(overrideFile)) {
      const content = fs.readFileSync(overrideFile, 'utf8');
      content.split('\n').filter(Boolean).forEach((entry) => overrides.add(entry));
    }
  } catch {
    // Ignore read errors
  }

  return overrides;
}

/**
 * Check if a file path is denied.
 * Allow list takes precedence over deny list.
 * Session overrides take precedence over deny list.
 */
function isPathDenied(filePath, patterns, overrides) {
  if (!filePath) return { denied: false };

  const basename = path.basename(filePath);

  // Allow list wins
  for (const pattern of patterns.allow) {
    if (matchesGlob(basename, pattern)) {
      return { denied: false };
    }
  }

  // Check deny patterns
  for (const pattern of patterns.deny) {
    if (matchesGlob(basename, pattern)) {
      // Check session overrides
      if (overrides.has(filePath) || overrides.has(basename)) {
        return { denied: false };
      }

      return { denied: true, pattern, basename };
    }
  }

  return { denied: false };
}

/**
 * Extract file paths from a Bash command string (best-effort).
 * Catches common file-reading commands: cat, head, tail, less, more,
 * grep, sed, awk, source, cp, mv.
 */
function extractBashFilePaths(command) {
  const paths = [];

  // Match common file-reading commands followed by file arguments
  const fileCommandRegex = /(?:cat|head|tail|less|more|grep|sed|awk|source|\.|cp|mv)\s+([^\s|;&>]+)/g;
  let match;
  while ((match = fileCommandRegex.exec(command)) !== null) {
    const arg = match[1].replace(/^[<>]+/, ''); // Strip redirection operators
    if (arg && !arg.startsWith('-')) {
      paths.push(arg);
    }
  }

  // Also check for redirection targets: > .env, >> .env
  const redirectRegex = />{1,2}\s*([^\s|;&]+)/g;
  while ((match = redirectRegex.exec(command)) !== null) {
    paths.push(match[1]);
  }

  return paths;
}

/**
 * Check if a Bash command is the exempt-secret command (should be allowed).
 */
function isExemptSecretCommand(command) {
  // Allow exempt-secret with simple arguments (no shell metacharacters)
  return /^\s*[\w/.-]*\/exempt-secret\s+[^\s;|&$()` ]+(\s+[^\s;|&$()` ]+)*\s*$/.test(command);
}

/**
 * Build the block message shown to Claude.
 */
function buildBlockMessage(basename, filePath) {
  const scriptDir = path.dirname(__filename || __dirname);
  const exemptCmd = path.join(scriptDir, 'bin', 'exempt-secret');

  return [
    `BLOCKED: Secret file access blocked: ${basename}`,
    `This file matches a secret/credential pattern in the denylist.`,
    `To grant temporary access for this session, ask the user for permission, then run:`,
    `${exemptCmd} ${filePath}`,
  ].join('\n');
}

async function main() {
  let input;
  try {
    input = await readStdinJSON();
  } catch {
    // No input or parse failure — allow
    process.exit(0);
  }

  const toolName = input.tool_name || '';
  const toolInput = input.tool_input || {};

  // Only intercept file-related tools
  const interceptedTools = new Set(['Read', 'Edit', 'Write', 'Bash', 'Grep', 'Glob']);
  if (!interceptedTools.has(toolName)) {
    process.exit(0);
  }

  // Load patterns
  const patterns = loadPatterns();

  if (!patterns) {
    // Fail-closed: block all file operations when config is unavailable
    warn('[protect-secrets] BLOCKED: Secret protection cache unavailable — blocking file access as a safety measure.');
    process.exit(2);
  }

  const overrides = loadOverrides();

  // Check based on tool type
  switch (toolName) {
    case 'Read':
    case 'Edit':
    case 'Write': {
      const filePath = toolInput.file_path || '';
      const result = isPathDenied(filePath, patterns, overrides);
      if (result.denied) {
        warn(buildBlockMessage(result.basename, filePath));
        process.exit(2);
      }
      break;
    }

    case 'Bash': {
      const command = toolInput.command || '';
      if (!command) break;

      // Allow exempt-secret command
      if (isExemptSecretCommand(command)) {
        process.exit(0);
      }

      // Best-effort: extract file paths from command
      const filePaths = extractBashFilePaths(command);
      for (const fp of filePaths) {
        const result = isPathDenied(fp, patterns, overrides);
        if (result.denied) {
          warn(buildBlockMessage(result.basename, fp));
          process.exit(2);
        }
      }
      break;
    }

    case 'Grep': {
      const grepPath = toolInput.path || '';
      const result = isPathDenied(grepPath, patterns, overrides);
      if (result.denied) {
        warn(buildBlockMessage(result.basename, grepPath));
        process.exit(2);
      }
      break;
    }

    case 'Glob': {
      const globPattern = toolInput.pattern || '';
      const globPath = toolInput.path || '';

      // Check if the glob pattern itself targets a secret file
      if (globPattern) {
        const patternBasename = path.basename(globPattern);
        const result = isPathDenied(patternBasename, patterns, overrides);
        if (result.denied) {
          warn(buildBlockMessage(result.basename, globPattern));
          process.exit(2);
        }
      }

      // Check the search path
      if (globPath) {
        const result = isPathDenied(globPath, patterns, overrides);
        if (result.denied) {
          warn(buildBlockMessage(result.basename, globPath));
          process.exit(2);
        }
      }
      break;
    }
  }

  // Allow
  process.exit(0);
}

main().catch((err) => {
  // Fail-closed on unexpected errors
  warn(`[protect-secrets] ERROR: ${err.message} — blocking as a safety measure.`);
  process.exit(2);
});
