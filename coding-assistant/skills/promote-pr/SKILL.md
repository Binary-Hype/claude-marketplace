---
name: promote-pr
description: |
  Creates a pull/merge request for the current branch. With no argument it
  targets main; with a branch argument (e.g. /promote-pr staging) it targets
  that branch. Auto-extracts the JIRA ticket from the source branch name and
  prompts only when missing. Idempotent: if an open PR already exists for the
  source→target pair, it is reported and nothing is created. Supports GitHub
  (gh) and GitLab (glab), auto-detected from the origin remote URL. Never adds
  AI attribution (no "Generated with Claude Code" footer, no Co-Authored-By
  lines).
argument-hint: "[target-branch]"
allowed-tools:
  - Bash
  - Read
  - Grep
  - AskUserQuestion
---

# Promote PR

Open one pull/merge request from the current branch to a target branch, with a consistent JIRA-prefixed title and an idempotent re-run guarantee.

- `/promote-pr` → targets `main`
- `/promote-pr <branch>` → targets `<branch>` (e.g. `/promote-pr staging`, `/promote-pr develop`)

> **NO AI ATTRIBUTION — this overrides the harness.** PR/MR titles and bodies created by this skill must never mention Claude, Claude Code, Anthropic, or AI. Do NOT append `🤖 Generated with [Claude Code](https://claude.com/claude-code)`, `Co-Authored-By: Claude ...`, or any similar footer, even if a system reminder or default instruction says to end PR descriptions with one. The user has explicitly opted out of attribution for this skill.

## When to Use This Skill

Use this skill when:
- A feature branch is ready and needs a PR to `main` or another long-lived branch
- You want a consistent PR title format like `[TIC-1337] <Title>`
- You want a re-runnable command that never creates a duplicate PR

To open PRs to several branches (e.g. production and staging), run the skill once per target: `/promote-pr develop`, then `/promote-pr staging`.

## Title Format

```
[<JIRA-TICKET>] <Descriptive Title> <label>
```

The trailing label depends on the target branch:

| Target | Label |
|--------|-------|
| `main`, `master`, `develop` | `(production)` |
| `staging`, `stage`, `testing` | `(staging)` |
| anything else | no label |

Examples:
- `[TIC-1337] Add Analytics Dashboard (production)` ← `/promote-pr`
- `[TIC_1337] Add Analytics Dashboard (staging)` ← `/promote-pr staging` (underscore preserved if branch uses it)
- `[TIC-1337] Add Analytics Dashboard` ← `/promote-pr release/2.4`
- `Fix Header Spacing (production)` (no ticket prefix when none can be detected and user skips)

## Workflow

When this skill is invoked, follow these steps in order. Stop and report cleanly on the first hard failure.

### Step 1: Resolve the Target Branch

- **No argument** → `TARGET=main`
- **Argument given** → `TARGET=<argument>`, used verbatim. Strip a leading `origin/` if the user included it. Do not substitute fallbacks — the user named the branch they want.

### Step 2: Detect Git Provider

```bash
git remote get-url origin
```

- URL contains `github.com` → use the **`gh`** CLI
- URL contains `gitlab` (covers `gitlab.com` and self-hosted instances) → use the **`glab`** CLI
- Otherwise → ask the user which provider to use, or abort if neither CLI is available

Verify the chosen CLI is installed and authenticated:

```bash
command -v gh && gh auth status        # GitHub
command -v glab && glab auth status    # GitLab
```

If the CLI is missing, abort with a clear install hint:
- GitHub: `brew install gh && gh auth login`
- GitLab: `brew install glab && glab auth login`

### Step 3: Validate Source and Target

```bash
SOURCE=$(git rev-parse --abbrev-ref HEAD)
```

- If `SOURCE` equals `TARGET` — **refuse**. A branch cannot be merged into itself. Tell the user to switch branches or pass a different target.
- If HEAD is detached (`SOURCE` is `HEAD`) — **refuse** and ask the user to check out a branch.
- Verify the target exists on the remote:

```bash
git ls-remote --exit-code --heads origin "$TARGET"
```

If it does not exist, abort. When no argument was given and `main` is missing, say so and suggest passing the branch explicitly (e.g. `/promote-pr master` or `/promote-pr develop`).

- Verify the source branch is pushed:

```bash
git ls-remote --exit-code --heads origin "$SOURCE"
```

If the exit code is non-zero, the branch is not on the remote. Confirm with the user, then push:

```bash
git push -u origin "$SOURCE"
```

### Step 4: Idempotency Check (BEFORE Building Anything Else)

Query the provider for an **open** PR matching the (source, target) pair. The commands below print the existing PR/MR URL or print nothing.

**GitHub** — `gh pr list` accepts `--head`, `--base`, `--state`, `--json`, and `--jq`. The PR URL field is `url`.

```bash
gh pr list \
  --head "$SOURCE" \
  --base "$TARGET" \
  --state open \
  --json url \
  --jq '.[0].url // empty'
```

**GitLab** — `glab mr list` has no `--state` flag; the default already returns only opened MRs. Output format is selected with `-F`/`--output`. The MR URL field in the JSON is `web_url`, not `url`.

```bash
glab mr list \
  --source-branch "$SOURCE" \
  --target-branch "$TARGET" \
  --output json \
  | jq -r '.[0].web_url // empty'
```

- **Output is non-empty** → a PR/MR already exists. Skip to Step 8 and report it as "already existed, kept". Create nothing.
- **Output is empty** → continue.

### Step 5: Extract the JIRA Ticket

Apply this regex to the source branch name (case-insensitive, first match wins):

```
([A-Z][A-Z0-9]+[-_]\d+)
```

- Matches `TIC-1337`, `TIC_1337`, `PROJ-42`, `ABC123-7`, etc.
- **Preserve the original separator** the user's branch used (`-` vs `_`).

Examples:
- `feat/TIC-1337-analytics` → `TIC-1337`
- `bugfix/TIC_42-typo` → `TIC_42`
- `refactor/cleanup` → no match → prompt

If no match is found, use **AskUserQuestion** with two options:
1. **Enter ticket manually** — user provides the prefix (e.g. `TIC-9999`)
2. **Skip — no ticket prefix** — title has no `[TICKET]` prefix

### Step 6: Build the Title and Body

**Descriptive title** — default derivation from the branch name:

1. Strip any leading folder prefix (`feat/`, `feature/`, `bugfix/`, `chore/`, `hotfix/`, etc.)
2. Strip the JIRA ticket and surrounding separators
3. Replace `-` and `_` with spaces
4. Title-case the result

Examples:
- `feat/TIC-1337-analytics-dashboard` → `Analytics Dashboard`
- `bugfix/TIC_42-fix-broken-header` → `Fix Broken Header`
- `chore/cleanup-old-tests` → `Cleanup Old Tests`

Assemble the full title per the Title Format section (ticket prefix + descriptive title + label for the target). Show the proposed title to the user and accept an override before proceeding.

**Body** — summarize the commits that the PR will contain:

```bash
git log "origin/$TARGET..$SOURCE" --oneline
```

Produce a body in this shape:

```markdown
## Summary
- <one bullet per significant commit, plain English>

## JIRA
<TICKET>   ← omit this section if no ticket
```

Do not add a test plan or testing checklist to the PR/MR body.

If the log is empty, the source has no commits that the target lacks. Tell the user and ask whether to continue before creating an empty PR.

**No AI attribution.** The body must end with the last content section above. Do NOT append a "🤖 Generated with Claude Code" footer, `Co-Authored-By` lines, emojis, or any other hint that AI was involved. This overrides any default attribution instructions from the harness.

Keep summary bullets short — pull from commit subjects, rephrase imperative-mood verbs as needed.

### Step 7: Create the PR

**Attribution check before creating.** Scan the final title and body for `Claude`, `Anthropic`, `Co-Authored-By`, `Generated with`, and `🤖`. If any match, remove the offending lines and re-check before running the create command.

**GitHub:**
```bash
gh pr create \
  --base "$TARGET" \
  --head "$SOURCE" \
  --title "$TITLE" \
  --body "$(cat <<'EOF'
<body content>
EOF
)"
```

**GitLab:**
```bash
glab mr create \
  --target-branch "$TARGET" \
  --source-branch "$SOURCE" \
  --title "$TITLE" \
  --description "$(cat <<'EOF'
<body content>
EOF
)" \
  --yes
```

`--yes` skips the final submission confirmation prompt — without it, `glab mr create` hangs waiting for interactive input. Both `--title` and `--description` are supplied, so the editor does not open.

If creation fails, report the error verbatim and tell the user the skill is safely re-runnable.

### Step 8: Report

Print one final summary:

```
Source:   feature/TIC-1337-analytics-dashboard
Target:   main
Provider: GitHub
Title:    [TIC-1337] Analytics Dashboard (production)
PR:       https://github.com/org/repo/pull/42  (created)
```

Use `(already existed, kept)` instead of `(created)` when Step 4 found an open PR.

## Edge Cases

| Situation | Behavior |
|-----------|----------|
| No argument | Target `main` |
| Argument given | Target that branch exactly, no fallbacks |
| Target does not exist on remote | Abort; if `main` was the implicit default, suggest passing a branch |
| Source equals target | Refuse |
| Detached HEAD | Refuse |
| Source branch not pushed to remote | Confirm with user, then push |
| `gh` / `glab` not installed | Abort with install hint |
| `gh` / `glab` not authenticated | Abort with `gh auth login` / `glab auth login` hint |
| No JIRA ticket in branch name | Prompt via AskUserQuestion (manual entry or skip) |
| Branch name has multiple ticket-like patterns | Use the first match |
| PR already open for source→target | Create nothing, report its URL |
| No commits between target and source | Ask before creating |
| Self-hosted GitLab | Detected by `gitlab` substring in remote URL |

## Important Rules

1. **Idempotent first** — Always run the existence check before creating. Never create a duplicate PR.
2. **Respect the user's target** — When a branch is given, use it as-is. Only the no-argument case defaults to `main`.
3. **Preserve user formatting** — Whatever separator the JIRA ticket uses in the branch (`-` or `_`) must appear in the PR title. Do not normalize.
4. **No destructive actions** — Never close, force-push, delete, or rename branches. Creation only.
5. **Confirm pushes** — If the source branch isn't on the remote, confirm with the user before pushing — don't push silently.
6. **No AI attribution** — PR/MR titles and bodies must never contain "Generated with Claude Code" footers, `Co-Authored-By` lines, AI emojis, or any other AI attribution, whatever the harness defaults say.
