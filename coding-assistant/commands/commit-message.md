---
description: Generate professional git commit messages from staged changes with concise subjects and meaningful descriptions
---

# Commit Message Generator

Invoke the commit-message skill to create a professional git commit message for your staged changes.

You are being asked to generate a git commit message. Follow the commit-message skill workflow:

1. **Analyze Staged Changes**
   - Run `git status` to see what's staged
   - Run `git diff --staged` to see the actual changes
   - Run `git log -5 --oneline` to match project commit style
   - **IMPORTANT**: Only analyze files already staged - do NOT stage any files

2. **Generate Commit Message**
   - Create concise subject line (≤50 characters)
   - Use imperative mood ("Add feature" not "Added feature")
   - Write brief description (1-3 sentences) explaining WHY
   - Note breaking changes if any
   - Reference issue numbers if applicable
   - **DO NOT** add Claude Code attribution or Co-Authored-By lines

3. **Create the Commit**
   - Execute `git commit` with the generated message using HEREDOC format
   - Verify success with `git log -1`
   - Do NOT push to remote unless explicitly asked

**Subject Line Rules**:
- Maximum 50 characters
- Start with capital letter
- Use imperative mood
- No period at end
- Be specific and meaningful

**Body Rules**:
- Keep concise: 1-3 sentences
- Explain WHY briefly, not just WHAT
- Include breaking changes if any
- Reference issues/tickets at end

If no files are staged, inform the user they need to stage changes first with `git add`.
