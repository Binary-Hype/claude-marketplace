---
name: jira
description: |
  Read and write Jira Cloud tickets from the terminal using the Atlassian
  CLI (acli) instead of MCP or WebFetch. Use whenever the user references a
  Jira issue — a ticket key like TIC-214, a Jira/Atlassian URL, a filter, or
  a request to view/search/comment on/edit/transition/create an issue.
  Handles URL parsing, an acli availability + auth preflight, and full
  read+write via `acli jira workitem`. Falls back to install/auth guidance
  or pasted content when acli is unavailable.
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

# Jira via acli

Read and write Jira Cloud tickets from the terminal with the Atlassian CLI (`acli`). This is the preferred path for anything on an Atlassian domain: the Atlassian MCP is often disabled and WebFetch hits the Jira login wall with no auth, but `acli` carries the user's OAuth session and can both read and write.

## When to Use This Skill

Use this skill when the user:
- Pastes a Jira/Atlassian URL (e.g. `https://<site>.atlassian.net/...`)
- References a ticket key matching `[A-Z]+-\d+` (e.g. `TIC-214`)
- Mentions a Jira filter, board, or sprint
- Asks to view, read, search, comment on, edit, transition, or create an issue

Do NOT use this skill when:
- The reference is to a different tracker (GitHub Issues, Linear, etc.)
- The user explicitly wants the browser instead of the terminal

## Workflow

### Step 1 — Parse the reference

Extract the work-item key or filter id from whatever the user pasted:

| Input | Extract |
| --- | --- |
| `...?...&selectedIssue=TIC-214` | key `TIC-214` |
| `.../browse/TIC-214` | key `TIC-214` |
| `...?filter=10270` | filter id `10270` |
| bare `TIC-214` | key `TIC-214` |

A URL can carry both (`?filter=10270&selectedIssue=TIC-214`) — the `selectedIssue` key is the specific ticket the user means; the `filter` is the surrounding list.

### Step 2 — Preflight (availability + auth)

Never assume `acli` is present and authenticated. Check first:

```bash
command -v acli >/dev/null || echo "MISSING"        # -> Fallback 1
acli jira auth status                               # must print "✓ Authenticated"
```

If `acli` is missing, or `auth status` does not report authenticated, go to **Fallbacks** — do not error out.

### Step 3 — Read

```bash
# Human-readable view (default fields: key, type, summary, status, assignee, description)
acli jira workitem view TIC-214

# JSON when you need to parse fields programmatically
acli jira workitem view TIC-214 --json

# Pick specific fields (include comment to read the discussion)
acli jira workitem view TIC-214 --fields summary,description,status,assignee,comment

# Search with JQL
acli jira workitem search --jql "project = TIC AND status = 'In Progress'" --fields key,summary,status
acli jira workitem search --jql "assignee = @me AND statusCategory != Done" --limit 50

# Resolve a filter link (?filter=10270)
acli jira filter view --id 10270 --json
```

### Step 4 — Write

Full read+write is granted — run these directly, no separate confirmation step (except the destructive ops in Important Rules):

```bash
# Edit fields
acli jira workitem edit --key TIC-214 --summary "New summary"
acli jira workitem edit --key TIC-214 --assignee "@me"

# Comment
acli jira workitem comment create --key TIC-214 --body "Deployed to staging."

# Transition status (--yes skips the confirm prompt)
acli jira workitem transition --key TIC-214 --status "In Progress" --yes

# Create a new work item
acli jira workitem create --project TIC --type Task --summary "..." --description "..."
```

For multi-line descriptions or comments, write the text to a scratchpad file and use the file flags instead of cramming it into a shell argument:

```bash
acli jira workitem edit --key TIC-214 --description-file /path/to/desc.txt
acli jira workitem comment create --key TIC-214 --body-file /path/to/comment.txt
```

`--description` / `--body` accept plain text or Atlassian Document Format (ADF).

## Fallbacks

When the preflight fails, do not silently give up and do not fall through to WebFetch on an Atlassian domain (it hits the login wall and wastes a turn — say so explicitly).

1. **`acli` not installed** — tell the user and give the install + auth hint, then offer to continue once it's ready:
   ```bash
   brew install atlassian/acli/acli
   acli jira auth login
   ```
2. **`acli` present but not authenticated** — ask the user to authenticate. Suggest they run it themselves in this session with the `!` prefix (it's interactive OAuth):
   ```
   ! acli jira auth login
   ```
   Then retry the preflight.
3. **Neither is possible right now** — ask the user to paste the ticket body directly so you can proceed with the content.

## Edge Cases

- **Wrong site** — `acli jira auth status` shows the active site. If it isn't the site in the pasted URL, tell the user; switching accounts needs `acli jira auth login`.
- **Unknown transition name** — if `transition --status` fails, the target status may not be reachable from the current one; read the item first and use a valid target for its workflow.
- **Filter-only link** — if the URL has a `filter` but no `selectedIssue`, list the filter's items (`filter view` / `search --filter <id>`) and ask which ticket the user means.

## Important Rules

1. **Prefer `acli` over MCP/WebFetch** for anything on an Atlassian domain — it's the only path with the user's auth.
2. **Full read+write is allowed** — `edit`, `comment`, `transition`, and `create` run without a separate approval step.
3. **Guard destructive ops** — `acli jira workitem delete` and `acli jira workitem archive` confirm with the user (`AskUserQuestion`) first and never use a blind `--yes`.
4. **Use `--json` when parsing**, human-readable output when just showing the user.
5. **Preflight before acting** — a failed preflight routes to Fallbacks, never to a raw error or a WebFetch attempt.
