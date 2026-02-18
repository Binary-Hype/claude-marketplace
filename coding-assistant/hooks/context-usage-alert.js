#!/usr/bin/env node
/**
 * context-usage-alert.js - PreCompact hook for context compaction awareness
 *
 * Fires before context compaction. When auto-compaction triggers, alerts the
 * user and injects additionalContext reminding Claude about /handoff.
 *
 * PreCompact hooks cannot block compaction. They can only show messages
 * and return additionalContext in JSON output.
 *
 * Exit codes:
 *   0 = always (PreCompact cannot block)
 */

const fs = require('fs');
const { readStdinJSON } = require('./lib/utils');

const LOG_FILE = '/tmp/claude-context-alerts.log';

async function main() {
  let input;
  try {
    input = await readStdinJSON();
  } catch {
    process.exit(0);
  }

  const trigger = input.trigger || '';

  // Only alert on auto-compaction, not manual /compact
  if (trigger !== 'auto') {
    process.exit(0);
  }

  // Log compaction event for user awareness
  try {
    const timestamp = new Date().toISOString();
    const sessionId = process.env.CLAUDE_SESSION_ID || 'unknown';
    fs.appendFileSync(LOG_FILE, `${timestamp} session=${sessionId} auto-compaction triggered\n`);
  } catch {
    // Non-critical, ignore log failures
  }

  // Output JSON for Claude Code to consume
  const output = {
    systemMessage: '[context-usage-alert] Context window full — auto-compaction starting. Use /handoff before your next large task to preserve full context.',
    hookSpecificOutput: {
      hookEventName: 'PreCompact',
      additionalContext: 'IMPORTANT: Context was just auto-compacted. Key context may have been lost. Consider suggesting /handoff to the user if they have complex ongoing work, so they can preserve context for a fresh session.',
    },
  };

  process.stdout.write(JSON.stringify(output));
  process.exit(0);
}

main().catch(() => {
  process.exit(0);
});
