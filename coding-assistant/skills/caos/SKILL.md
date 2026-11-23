---
name: caos
description: |
  Works a task (card) end to end with Codeäffchen OS (CAOS): creates the card
  when no card URL or key is given, moves it to In Progress and assigns the
  user, branches off main (feature/CA-142_short-slug), implements the change,
  loops on user feedback, commits via /commit-message, pushes, opens the PR via
  /promote-pr, merges it when there are no conflicts (which deploys), and moves
  the card to Testing. Use when the user wants to work on a CAOS card, passes a
  card key like CA-142 or an os.codeaeffchen.de link, or starts a new task that
  should be tracked in CAOS.
argument-hint: "[card-key | card-url | task description]"
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - Grep
  - Glob
  - Skill
  - ToolSearch
  - AskUserQuestion
---

# CAOS Card Workflow

Take one task from card to deployment using Codeäffchen OS (CAOS) and git. The steps below run in a fixed order. Stop and report clearly at the first hard failure; never skip a step without telling the user.

```
card → In Progress + assigned → branch → implement → user review loop
     → commit → push → PR → merge (deploy) → card to Testing
```

## Prerequisites

The CAOS MCP tools (`mcp__codeaeffchen__*`) must be available. They are usually deferred, so load the ones you need in **one** ToolSearch call before Step 1:

```
select:mcp__codeaeffchen__who-am-i,mcp__codeaeffchen__get-card,mcp__codeaeffchen__get-project,mcp__codeaeffchen__get-project-context,mcp__codeaeffchen__list-projects,mcp__codeaeffchen__create-card,mcp__codeaeffchen__move-card,mcp__codeaeffchen__set-card-assignees
```

If the tools do not exist, stop and tell the user to connect the Codeäffchen OS MCP server. Do not fall back to the browser.

CAOS boards have fixed column **types**: `backlog`, `planned`, `in_progress`, `waiting`, `testing`, `to_bill`, `done`. Always pick columns by their type from `get-project`, never by their display name. Names differ per project and language.

Everything changed in CAOS is visible live to the team, lands in the card history under the user's name and notifies assignees. Write titles and descriptions like a colleague would, **in the project's language** (look at existing cards when unsure).

## Step 1: Resolve or Create the Card

Parse the argument and the user's message:

| Input | Card reference | Project |
|-------|----------------|---------|
| Key such as `CA-142`, `COS-227` (`[A-Z][A-Z0-9]+-\d+`) | the key | from the card |
| Card link: `os.codeaeffchen.de/cards/CA-142` or any CAOS page with `?card=CA-142` | the key in the URL | from the card |
| Project link without a card: `os.codeaeffchen.de/projects/<project-id>` (also `/planning`, `/settings`, … below it) | none, so create one | the `<project-id>` in the URL |
| Anything else / nothing | none, so create one | **unknown, ask the user** |

**Card given:** call `get-card` with the key or id. Note its project key, type, title, description, checklists, comments and current assignees. If the card is already in a `testing`, `to_bill` or `done` column, ask the user whether to reopen it before continuing.

**No card given:** create one.

1. Determine the project.
   - **Project link given:** use the project id from the URL and confirm it exists with `get-project`. If it does not resolve, treat the project as unknown.
   - **Otherwise:** always ask the user which project the task is for, even when the repository looks like an obvious match. Never pick the project on your own. Call `list-projects`, then ask with AskUserQuestion:
     - Offer exactly **two** project suggestions, shown as `KEY – Name`. The first is the best repository match, marked "(Recommended)" (match the folder name, the remote URL and the project key in existing branch names such as `feature/COS-…`). The second is the next most likely project.
     - Say in the question that the user can choose "Other" to **paste a CAOS link or type the project name or key** themselves.
     - Resolve an "Other" answer: a project link gives the project id, a card link or card key gives that card's project (via `get-card`), and a name or key is matched against `list-projects`. If it matches no project or several, ask again.
2. Draft a short title and a description from the user's request: what should change and why, as Markdown. Pick the card `type`: `bug` for defects, `task` otherwise (`story`/`epic` only when the user says so).
3. Show the draft (project, title, type, description) and let the user adjust it.
4. Call `get-project` for the column ids and `assignable_people`, then `create-card` directly in the `in_progress` column with the user as assignee (`column_id` + `assignee_ids`). That also covers Step 2.

Report the new card key.

## Step 2: Move to In Progress and Assign the User

Skip whatever Step 1 already did.

1. `who-am-i` gives the user's name and email. Find the matching entry in `assignable_people` from `get-project` (match on email, then on name).
2. `set-card-assignees` **replaces** the whole list. Send the card's current assignee ids **plus** the user's id. Never drop existing assignees. Skip the call if the user is already assigned.
3. `move-card` to the column whose type is `in_progress` (skip if it is already there).

If the project is new to you, call `get-project-context` once. It returns the project file (setup, deploy, pitfalls), recent log entries and open cards, which you need for Step 4.

## Step 3: Create the Branch from main

Check the working tree first:

```bash
git status --porcelain
git rev-parse --abbrev-ref HEAD
```

If there are uncommitted changes that do not belong to this card, stop and ask the user how to proceed (stash, commit elsewhere, or abort). Never discard them.

Branch naming convention:

```
<prefix>/<CARD-KEY>_<short-slug>
```

| Card type | Prefix |
|-----------|--------|
| `bug` | `fix/` |
| everything else | `feature/` |

- `<CARD-KEY>` exactly as in CAOS (`COS-227`), followed by an **underscore**.
- `<short-slug>`: 2–4 English words in lowercase kebab-case that sum up the card. Translate a German title, don't transliterate it. ASCII only.

Examples: `feature/COS-227_timeline-start-date`, `feature/COS-177_card-filters-mcp`, `fix/COS-181_close-button-scrolls`.

Before inventing a name, glance at the repo's existing branches (`git branch -a --sort=-committerdate | head -20`). If the repo clearly follows a different pattern for feature branches, follow the repo. Bug cards always use `fix/`, even where older branches used `bugfix/`.

Branch from the latest remote `main`:

```bash
git fetch origin main
git switch -c "<branch>" origin/main
```

If a branch for this card key already exists locally or on the remote, ask whether to continue on it instead of creating a new one.

## Step 4: Implement

Implement what the card asks for, using the card description, checklist items and comments as the spec. Follow the project file and the repository's own conventions (CLAUDE.md, AGENTS.md, existing code). Run the project's tests and linters where they exist. Use DDEV commands when the project has a `.ddev/` folder.

If the card is ambiguous, ask the user before guessing. Keep the change scoped to the card. Mention unrelated problems you notice, but don't fix them.

## Step 5: User Review Loop

Summarise what changed (files, behaviour, how to try it) and ask the user with AskUserQuestion whether the implementation is correct:

- **Looks good, continue.** Go to Step 6.
- **Needs changes.** Collect the feedback, apply it, summarise again and ask again.

Repeat until the user approves. Never commit, push or merge before an explicit approval in this step.

## Step 6: Stage and Commit

Stage only the files that belong to this card. Check `git status` and add paths explicitly, not with a blind `git add -A`.

- If the `commit-message` skill is available (listed as `commit-message` or `coding-assistant:commit-message`), invoke it with the Skill tool. It drafts the message from the staged diff and asks for approval before committing.
- Otherwise propose a message yourself: imperative subject of at most 50 characters, blank line, bulleted body explaining why. Commit only after the user approves it.

## Step 7: Push

```bash
git push -u origin "<branch>"
```

Never force-push. If the push is rejected, report the error and stop.

## Step 8: Open the Pull Request

- If the `promote-pr` skill is available (`promote-pr` or `coding-assistant:promote-pr`), invoke it with no argument so the PR targets `main`. It picks the card key up from the branch name.
- Otherwise propose a PR to `main` yourself, titled `[<CARD-KEY>] <Title>`, with a short summary of the commits in the body, and create it with `gh pr create` / `glab mr create` once the user agrees.

Note the PR URL.

## Step 9: Merge if Conflict-Free

Check mergeability. GitHub may report `UNKNOWN` for a few seconds right after creation; re-check briefly before concluding anything.

```bash
# GitHub
gh pr view "<url>" --json mergeable,mergeStateStatus,statusCheckRollup
# GitLab
glab mr view "<url>" --output json   # has_conflicts, detailed_merge_status
```

| State | Action |
|-------|--------|
| Mergeable, no conflicts, checks passing or none | Merge |
| Checks still running | Wait for them (`gh pr checks "<url>" --watch`), then re-evaluate |
| Checks failing | Do not merge. Show the failures, then ask the user |
| Conflicts | Do not merge. Report the conflicting files and suggest the `merge-conflict-resolver` skill. Leave the card in In Progress and stop here |

Merge with a merge commit, matching the team's history (`Merge pull request #… from …`):

```bash
gh pr merge "<url>" --merge
glab mr merge "<url>" --yes
```

Do not pass `--admin` or any flag that bypasses branch protection. Do not delete the branch unless the user asks.

After a successful merge, tell the user plainly that the PR is merged into `main` and **the changes are now being deployed**.

## Step 10: Move the Card to Testing

`move-card` to the column whose type is `testing`. If the board has no `testing` column, tell the user and ask where the card should go instead.

## Final Report

```
Card:    COS-227 Timeline start date  → Testing
Branch:  feature/COS-227_timeline-start-date
Commit:  a1b2c3d Add start date to project timeline
PR:      https://github.com/org/repo/pull/93  (merged, deploying)
```

If the flow stopped early (conflicts, failing checks, rejected push), report the step it stopped at and where the card is now.

## Rules

1. **Approval before anything leaves the machine.** No commit, push, PR or merge before the user approves the implementation in Step 5.
2. **Merge only when clean.** No conflicts and no failing checks. Never bypass branch protection.
3. **Never lose work.** No force-push, no `git reset --hard`, no discarding of uncommitted changes.
4. **Assignees are additive.** `set-card-assignees` replaces the list, so always send the existing assignees along with the user.
5. **Columns by type, not name.** Use `in_progress` and `testing` column types from `get-project`.
6. **Project language on the card.** Card titles and descriptions follow the project's language; branch slugs are always English.
