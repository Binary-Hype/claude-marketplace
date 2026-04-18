#!/usr/bin/env node
/**
 * protect-1password.js - PreToolUse hook for 1Password CLI (`op`).
 *
 * Blocks `op` invocations that would surface credential material
 * (passwords, private keys, tokens, recovery codes, documents).
 * Allows metadata reads (titles, vault/item names, URLs, usernames).
 *
 * Policy:
 *   - Allowlist of safe subcommands (whoami, vault list/get, user list/get, ...)
 *   - `op item get` requires `--fields` restricted to known-safe fields.
 *   - `op read op://...` requires the referenced field to be known-safe.
 *   - `op document`, `op inject`, `op run` are always blocked.
 *   - Unknown subcommands are blocked (fail-closed).
 *
 * Exit codes:
 *   0 = allow
 *   2 = block (stderr = reason shown to Claude)
 */

const { readStdinJSON, warn } = require('./lib/utils');

const SAFE_FIELDS = new Set([
  'title', 'name', 'url', 'website', 'username', 'user', 'email',
  'tags', 'category', 'vault', 'id', 'uuid',
  'createdat', 'updatedat', 'favorite', 'trashed', 'version',
]);

const SAFE_SUBCOMMANDS_NO_ARGS = new Set([
  'whoami', 'signin', 'signout', 'help', 'update', 'completion', 'plugin',
]);

const LIST_GET_SUBCOMMANDS = new Set([
  'vault', 'user', 'account', 'group',
]);

const ALWAYS_BLOCKED_SUBCOMMANDS = {
  document: '1Password documents commonly contain private keys, certificates, or recovery codes.',
  inject: 'Substitutes secret references into template files, writing secrets to disk or context.',
  run: 'Injects 1Password secrets into subprocess environment variables.',
  connect: 'Manages Connect server tokens (sensitive).',
  'events-api': 'Manages Events API tokens (sensitive).',
  'service-account': 'Manages service account tokens (sensitive).',
};

const GLOBAL_FLAGS_WITH_VALUE = new Set([
  '--account', '--cache', '--config', '--session', '--format', '--encoding',
]);

function shellTokenize(s) {
  const tokens = [];
  let current = '';
  let quote = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === quote) quote = null;
      else current += c;
    } else if (c === "'" || c === '"') {
      quote = c;
    } else if (c === '\\' && i + 1 < s.length) {
      current += s[++i];
    } else if (/\s/.test(c)) {
      if (current) { tokens.push(current); current = ''; }
    } else {
      current += c;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function splitSegments(command) {
  // Inline $(...) and `...` so op invocations inside substitutions are scanned too.
  let expanded = command;
  expanded = expanded.replace(/\$\(([^)]*)\)/g, ' ; $1 ; ');
  expanded = expanded.replace(/`([^`]*)`/g, ' ; $1 ; ');
  return expanded
    .split(/;|\|\||&&|\||&/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isSafeField(fieldSpec) {
  let name = fieldSpec.trim();
  // Strip label=/type= prefixes used by `op item get --fields label=Name`
  const eqIdx = name.indexOf('=');
  if (eqIdx !== -1 && /^(label|type)$/i.test(name.slice(0, eqIdx))) {
    name = name.slice(eqIdx + 1);
  }
  // Take the last path segment for "section.field"
  if (name.includes('.')) name = name.split('.').pop();
  name = name.toLowerCase().replace(/[_\s-]/g, '');
  return SAFE_FIELDS.has(name);
}

function getFieldsArg(args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fields' || args[i] === '-f') return args[i + 1];
    if (args[i].startsWith('--fields=')) return args[i].slice('--fields='.length);
  }
  return null;
}

function stripGlobalFlags(args) {
  let i = 0;
  while (i < args.length && args[i].startsWith('-')) {
    const flag = args[i];
    if (flag === '--help' || flag === '-h' || flag === '--version' || flag === '-v') {
      return { helpOrVersion: true, rest: [] };
    }
    if (flag.includes('=')) { i++; continue; }
    if (GLOBAL_FLAGS_WITH_VALUE.has(flag) && args[i + 1] && !args[i + 1].startsWith('-')) {
      i += 2;
    } else {
      i += 1;
    }
  }
  return { helpOrVersion: false, rest: args.slice(i) };
}

function analyzeItemGet(args) {
  const fieldsArg = getFieldsArg(args);
  if (!fieldsArg) {
    return {
      allowed: false,
      reason: 'op item get returns every field (including concealed passwords) by default. '
            + 'Pass --fields with known-safe fields only, e.g. --fields title,url,username.',
    };
  }
  const fields = fieldsArg.replace(/^['"]|['"]$/g, '').split(',').map((f) => f.trim()).filter(Boolean);
  if (!fields.length) {
    return { allowed: false, reason: 'op item get: empty --fields list.' };
  }
  for (const f of fields) {
    if (!isSafeField(f)) {
      return {
        allowed: false,
        reason: `op item get: field "${f}" is not in the known-safe list. `
              + `Safe fields: ${[...SAFE_FIELDS].sort().join(', ')}.`,
      };
    }
  }
  // Reject --reveal which un-masks concealed fields even when they appear alongside safe ones.
  if (args.includes('--reveal')) {
    return {
      allowed: false,
      reason: 'op item get: --reveal is blocked (it unmasks concealed fields).',
    };
  }
  return { allowed: true };
}

function analyzeOpArgs(args) {
  const { helpOrVersion, rest } = stripGlobalFlags(args);
  if (helpOrVersion) return { allowed: true };

  const sub = rest[0];
  const subArgs = rest.slice(1);

  if (!sub) return { allowed: true };

  if (SAFE_SUBCOMMANDS_NO_ARGS.has(sub)) return { allowed: true };

  if (LIST_GET_SUBCOMMANDS.has(sub)) {
    const action = subArgs[0];
    if (!action || action === 'list' || action === 'get') return { allowed: true };
    return {
      allowed: false,
      reason: `op ${sub} ${action}: only 'list' and 'get' are permitted for this subcommand.`,
    };
  }

  if (sub === 'item') {
    const action = subArgs[0];
    if (action === 'list' || action === 'template') return { allowed: true };
    if (action === 'get') return analyzeItemGet(subArgs.slice(1));
    return {
      allowed: false,
      reason: `op item ${action || '(missing action)'}: blocked. `
            + 'Only "list" and "get" (with --fields restricted to safe fields) are permitted.',
    };
  }

  if (sub === 'read') {
    const ref = subArgs.find((a) => a.startsWith('op://'));
    if (!ref) {
      return { allowed: false, reason: 'op read: no op:// reference found — blocked as a safety measure.' };
    }
    const parts = ref.replace(/^op:\/\//, '').split('/').filter(Boolean);
    if (parts.length < 3) {
      return { allowed: false, reason: `op read: malformed reference "${ref}".` };
    }
    const field = parts[parts.length - 1];
    if (isSafeField(field)) return { allowed: true };
    return {
      allowed: false,
      reason: `op read: field "${field}" is not in the known-safe list — blocked to prevent secret exposure. `
            + `Safe fields: ${[...SAFE_FIELDS].sort().join(', ')}.`,
    };
  }

  if (ALWAYS_BLOCKED_SUBCOMMANDS[sub]) {
    return { allowed: false, reason: `op ${sub}: blocked. ${ALWAYS_BLOCKED_SUBCOMMANDS[sub]}` };
  }

  return {
    allowed: false,
    reason: `op ${sub}: unrecognized subcommand, blocked as a safety measure.`,
  };
}

function commandMentionsOp(command) {
  return /(^|[\s;|&`(])op(\s|$)/.test(command);
}

function analyzeCommand(command) {
  for (const seg of splitSegments(command)) {
    const tokens = shellTokenize(seg);
    let i = 0;
    while (i < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[i])) i++;
    if (i >= tokens.length) continue;
    const cmd = tokens[i];
    if (cmd !== 'op' && !cmd.endsWith('/op')) continue;
    const result = analyzeOpArgs(tokens.slice(i + 1));
    if (!result.allowed) return result;
  }
  return { allowed: true };
}

async function main() {
  let input;
  try { input = await readStdinJSON(); } catch { process.exit(0); }

  if (input.tool_name !== 'Bash') process.exit(0);
  const command = input.tool_input?.command || '';
  if (!command || !commandMentionsOp(command)) process.exit(0);

  const result = analyzeCommand(command);
  if (!result.allowed) {
    warn(
      `BLOCKED (1Password): ${result.reason}\n`
      + 'This hook prevents 1Password CLI commands that could surface secrets. '
      + 'Metadata reads (titles, vaults, URLs, usernames) remain allowed.'
    );
    process.exit(2);
  }
  process.exit(0);
}

main().catch((err) => {
  warn(`[protect-1password] ERROR: ${err.message} — blocking as a safety measure.`);
  process.exit(2);
});
