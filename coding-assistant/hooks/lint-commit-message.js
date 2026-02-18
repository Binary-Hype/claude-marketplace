#!/usr/bin/env node
/**
 * lint-commit-message.js - PreToolUse hook for commit message conventions
 *
 * Validates git commit messages against configurable rules:
 * - Subject line length (warn >50, block >72)
 * - No trailing period on subject
 * - Imperative mood (no past tense verbs)
 * - No empty subject
 * - Body separation (blank line after subject)
 *
 * Uses 3-tier config: plugin defaults → ~/.claude/commit-rules.json →
 * .claude/commit-rules.json
 *
 * Exit codes:
 *   0 = allow the tool call
 *   2 = block the tool call (stderr = reason shown to Claude)
 */

const fs = require('fs');
const path = require('path');
const { readStdinJSON, warn } = require('./lib/utils');

const PAST_TENSE_VERBS = [
  'added', 'fixed', 'changed', 'updated', 'removed', 'deleted',
  'refactored', 'implemented', 'created', 'modified', 'moved', 'renamed',
];

/**
 * Load commit rules with 3-tier merge: plugin defaults → user → project.
 */
function loadConfig() {
  const pluginDir = path.dirname(__filename || __dirname);
  const defaultPath = path.join(pluginDir, 'config', 'default-commit-rules.json');

  let config = {};

  // Tier 1: Plugin defaults
  try {
    config = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  } catch {
    // Hardcoded fallback
    config = {
      subjectMaxLength: 72,
      subjectWarnLength: 50,
      requireImperativeMood: true,
      noTrailingPeriod: true,
      allowTypes: ['fixup', 'squash', 'amend'],
    };
  }

  // Tier 2: User config (~/.claude/commit-rules.json)
  try {
    const home = process.env.HOME || process.env.USERPROFILE || '';
    const userPath = path.join(home, '.claude', 'commit-rules.json');
    if (fs.existsSync(userPath)) {
      Object.assign(config, JSON.parse(fs.readFileSync(userPath, 'utf8')));
    }
  } catch {
    // Ignore
  }

  // Tier 3: Project config (.claude/commit-rules.json)
  try {
    const projectPath = path.join(process.cwd(), '.claude', 'commit-rules.json');
    if (fs.existsSync(projectPath)) {
      Object.assign(config, JSON.parse(fs.readFileSync(projectPath, 'utf8')));
    }
  } catch {
    // Ignore
  }

  return config;
}

/**
 * Check if a command is a git commit command.
 * Returns false for non-commit commands.
 */
function isGitCommit(command) {
  // Match git commit with various patterns
  return /\bgit\s+commit\b/.test(command);
}

/**
 * Check if the commit should be skipped (amend, fixup, squash).
 */
function shouldSkip(command, allowTypes) {
  for (const type of allowTypes) {
    if (type === 'amend' && /--amend\b/.test(command)) return true;
    if (type === 'fixup' && /--fixup\b/.test(command)) return true;
    if (type === 'squash' && /--squash\b/.test(command)) return true;
  }
  return false;
}

/**
 * Extract the commit message from a git commit command.
 * Returns null if no inline message found (interactive commit).
 */
function extractMessage(command) {
  // Try heredoc pattern: $(cat <<'EOF'...EOF) or $(cat <<EOF...EOF)
  const heredocMatch = command.match(/\$\(cat\s+<<['"]?(\w+)['"]?\s*\n([\s\S]*?)\n\s*\1\s*\)/);
  if (heredocMatch) {
    return heredocMatch[2].trim();
  }

  // Try -m or --message with various quoting styles
  // -m "message" or -m 'message'
  const mFlagDoubleQuote = command.match(/(?:^|\s)-m\s+"((?:[^"\\]|\\.)*)"/);
  if (mFlagDoubleQuote) return mFlagDoubleQuote[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');

  const mFlagSingleQuote = command.match(/(?:^|\s)-m\s+'((?:[^'\\]|\\.)*)'/);
  if (mFlagSingleQuote) return mFlagSingleQuote[1];

  // -m $'message' (ANSI-C quoting)
  const mFlagDollarQuote = command.match(/(?:^|\s)-m\s+\$'((?:[^'\\]|\\.)*)'/);
  if (mFlagDollarQuote) return mFlagDollarQuote[1].replace(/\\n/g, '\n');

  // --message="message" or --message='message'
  const msgFlagDoubleQuote = command.match(/--message="((?:[^"\\]|\\.)*)"/);
  if (msgFlagDoubleQuote) return msgFlagDoubleQuote[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');

  const msgFlagSingleQuote = command.match(/--message='((?:[^'\\]|\\.)*)'/);
  if (msgFlagSingleQuote) return msgFlagSingleQuote[1];

  // --message 'message' or --message "message"
  const msgSpaceDoubleQuote = command.match(/--message\s+"((?:[^"\\]|\\.)*)"/);
  if (msgSpaceDoubleQuote) return msgSpaceDoubleQuote[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');

  const msgSpaceSingleQuote = command.match(/--message\s+'((?:[^'\\]|\\.)*)'/);
  if (msgSpaceSingleQuote) return msgSpaceSingleQuote[1];

  // No inline message found — interactive commit
  return null;
}

/**
 * Validate a commit message against the rules.
 * Returns an array of { level: 'error'|'warn', message: string }.
 */
function validate(message, config) {
  const issues = [];

  if (!message || message.trim() === '') {
    issues.push({ level: 'error', message: 'Commit message is empty' });
    return issues;
  }

  const lines = message.split('\n');
  const subject = lines[0].trim();

  // Empty subject
  if (subject === '') {
    issues.push({ level: 'error', message: 'Subject line is empty' });
    return issues;
  }

  // Subject length
  if (subject.length > config.subjectMaxLength) {
    issues.push({
      level: 'error',
      message: `Subject line is ${subject.length} chars (max ${config.subjectMaxLength}). Shorten it or move details to the body.`,
    });
  } else if (subject.length > config.subjectWarnLength) {
    issues.push({
      level: 'warn',
      message: `Subject line is ${subject.length} chars (recommended max ${config.subjectWarnLength}). Consider shortening it.`,
    });
  }

  // No trailing period
  if (config.noTrailingPeriod && subject.endsWith('.')) {
    issues.push({
      level: 'error',
      message: 'Subject line should not end with a period. Remove the trailing "."',
    });
  }

  // Imperative mood check
  if (config.requireImperativeMood) {
    // Strip conventional commit prefix like "feat: ", "fix(scope): "
    const subjectBody = subject.replace(/^[a-z]+(\([^)]*\))?:\s*/i, '');
    const firstWord = subjectBody.split(/\s+/)[0].toLowerCase();

    if (PAST_TENSE_VERBS.includes(firstWord)) {
      const imperative = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
      const suggestion = getSuggestion(firstWord);
      issues.push({
        level: 'error',
        message: `Subject starts with past tense "${imperative}". Use imperative mood instead (e.g., "${suggestion}").`,
      });
    }
  }

  // Body separation: if there's a second line, it must be blank
  if (lines.length > 1 && lines[1].trim() !== '') {
    issues.push({
      level: 'error',
      message: 'Missing blank line between subject and body. Add an empty line after the subject.',
    });
  }

  return issues;
}

/**
 * Get an imperative mood suggestion for a past-tense verb.
 */
function getSuggestion(verb) {
  const suggestions = {
    added: 'Add',
    fixed: 'Fix',
    changed: 'Change',
    updated: 'Update',
    removed: 'Remove',
    deleted: 'Delete',
    refactored: 'Refactor',
    implemented: 'Implement',
    created: 'Create',
    modified: 'Modify',
    moved: 'Move',
    renamed: 'Rename',
  };
  return suggestions[verb] || verb.replace(/ed$/, '');
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

  // Only intercept Bash tool calls with git commit
  if (toolName !== 'Bash' || !command || !isGitCommit(command)) {
    process.exit(0);
  }

  const config = loadConfig();

  // Skip amend/fixup/squash
  if (shouldSkip(command, config.allowTypes || [])) {
    process.exit(0);
  }

  // Extract the commit message
  const message = extractMessage(command);
  if (message === null) {
    // Interactive commit — can't validate, allow
    process.exit(0);
  }

  // Validate
  const issues = validate(message, config);

  // Filter to errors only for blocking
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warn');

  if (errors.length === 0 && warnings.length === 0) {
    process.exit(0);
  }

  // Build output message
  const parts = ['[commit-message-linter] Commit message issues found:\n'];

  for (const err of errors) {
    parts.push(`  ERROR: ${err.message}`);
  }
  for (const w of warnings) {
    parts.push(`  WARNING: ${w.message}`);
  }

  parts.push('\nFix the commit message and try again.');

  // Block on errors, warn-only on warnings
  if (errors.length > 0) {
    warn(parts.join('\n'));
    process.exit(2);
  }

  // Warnings only — allow but show message
  warn(parts.join('\n'));
  process.exit(0);
}

main().catch(() => {
  // Fail open on unexpected errors
  process.exit(0);
});
