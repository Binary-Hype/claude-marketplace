---
description: Installs the coding-assistant statusline showing model, token usage, rate limits, and thinking status. Modifies ~/.claude/settings.json.
---

# Setup Statusline

Installs the coding-assistant statusline into your Claude Code settings.

## What It Does

Runs the setup script that:
1. Resolves the absolute path to the statusline hook
2. Writes the `statusLine` configuration to `~/.claude/settings.json`

## What the Statusline Shows

- **Line 1**: Model name | token usage (used/total) | % used | % remaining | thinking on/off
- **Line 2**: 5-hour usage bar | 7-day usage bar | extra usage bar (if enabled)
- **Line 3**: Reset times for each usage window

## Requirements

- `jq` must be installed
- `curl` must be installed
- OAuth credentials (automatically resolved from macOS Keychain, Linux credentials file, or GNOME Keyring)

## Workflow

When this command is invoked:

1. Run the setup script:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/hooks/setup-statusline.js"
   ```
2. Show the user the output
3. Tell the user to restart Claude Code to see the statusline
