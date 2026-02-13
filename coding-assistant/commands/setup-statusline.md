---
description: Installs the coding-assistant statusline showing model, current task, directory, and context usage. Modifies ~/.claude/settings.json.
---

# Setup Statusline

Installs the coding-assistant statusline into your Claude Code settings.

## What It Does

Runs the setup script that:
1. Resolves the absolute path to the statusline hook
2. Writes the `statusLine` configuration to `~/.claude/settings.json`

## What the Statusline Shows

- **Model name** - which Claude model is active
- **Current task** - the in-progress task from your todo list (if any)
- **Directory** - current working directory name
- **Context usage** - color-coded progress bar scaled to Claude's 80% context limit

## Workflow

When this command is invoked:

1. Run the setup script:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/hooks/setup-statusline.js"
   ```
2. Show the user the output
3. Tell the user to restart Claude Code to see the statusline
