---
description: Generates a structured handoff document for continuing work in a fresh Claude Code session. Captures task context, decisions, progress, and next steps so nothing is lost when context limits are reached.
---

# Session Handoff Generator

Generate a concise handoff document that lets a fresh Claude Code session pick up exactly where this one left off.

## When to Use This Command

Use this command when:
- You're approaching context limits (~75-80% usage) and want to continue in a fresh session
- You need to pause work and resume later without losing context
- You want to hand off work to a colleague with full context
- A session is getting long and you want to capture progress before it's compressed away

## Workflow

When this command is invoked, follow these steps:

### Step 1: Gather Git State

Run these commands to capture the current repository state:

```bash
git status
git diff --stat
git diff --staged --stat
git log --oneline -10
git branch --show-current
```

If there are uncommitted changes, also run:
```bash
git diff
git diff --staged
```

### Step 2: Review Session Context

Review the full conversation to identify:
- The original task or goal the user requested
- What work has been completed
- What's currently in progress
- Key decisions made and why
- Gotchas, edge cases, or non-obvious findings discovered
- Any unresolved questions or blockers

### Step 3: Generate the Handoff Document

Output the following markdown document directly to the terminal. Do NOT create a file. The user will copy-paste it into a new session.

**Keep it concise.** A handoff document that's too long defeats the purpose — it would eat into the new session's context. Aim for the minimum information needed for full continuity.

```
## Session Handoff

### Original Task
[1-3 sentences describing what was requested and the goal]

### Completed Work
- [Each completed item with relevant file paths]
- [Be specific: "Added validation to UserController.php" not "worked on validation"]

### Current State
- **Branch**: [current branch name]
- **Uncommitted changes**: [summary of what's modified but not committed]
- **Staged changes**: [summary of what's staged]
- [Any other relevant state: running processes, pending migrations, etc.]

### Key Decisions & Context
- [Architectural choices and WHY they were made]
- [Trade-offs that were considered]
- [Gotchas or non-obvious things discovered that a fresh session wouldn't know]
- [Any constraints or requirements that emerged during the session]

### Remaining Work
1. [Next step — specific and actionable]
2. [Following step]
3. [etc., in priority order]

### Open Questions / Blockers
- [Anything unresolved that needs attention]
- [Or "None" if everything is clear]

### Files to Read First
- [List of files the new session should read to get up to speed quickly]
- [Prioritize files that were created or heavily modified]
```

## Important Rules

1. **No file creation** — Output to terminal only. The user controls where the handoff goes.
2. **Be concise** — Every section should contain the minimum needed for continuity. Skip sections that have nothing relevant (except Original Task and Remaining Work, which are always required).
3. **Be specific** — Use exact file paths, function names, and line numbers. Vague descriptions are useless in a new session.
4. **Prioritize the non-obvious** — The new session can read code and run `git log`. Focus on context that ISN'T captured in the code: decisions, reasoning, gotchas.
5. **Actionable next steps** — The Remaining Work section should be specific enough that a fresh session can start working immediately without asking clarifying questions.
6. **Git-aware** — Always use fresh git commands to verify state. Don't rely on conversation memory for what's committed vs uncommitted.
