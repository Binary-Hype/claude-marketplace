---
description: Generate professional git commit messages from staged changes with concise subjects and meaningful descriptions
---

# Commit Message Generator

Invoke the commit-message skill to create a professional git commit message for staged changes.

## Workflow
1. Analyze staged changes with `git status` and `git diff --staged`
2. Review recent commits with `git log` to match project style
3. Generate commit message (≤50 char subject, imperative mood, brief WHY description)
4. Create commit with HEREDOC format
5. Verify with `git log -1`

## Requirements
- Files must be staged first
- Do NOT include Claude Code attribution or Co-Authored-By lines
- Do NOT push to remote unless explicitly asked
