# Claude Marketplace

Lightweight plugins for Claude Code — easy to install, zero configuration, nothing to build.

## Quick Start

Inside Claude Code, run:

```
# 1. Add the marketplace
/plugin marketplace add Binary-Hype/claude-marketplace

# 2. Install the coding-assistant plugin
/plugin install coding-assistant@binary-hype-dev
```

That's it. Skills, commands, subagents, and hooks are all active immediately.

## Lightweight by design

This plugin doesn't add process or overhead. It enhances what you already do.

- **No extra workflow to learn** — no planning frameworks, no todo mechanics, no dashboards. Just your normal Claude Code session, enhanced.
- **Skills when you need them** — type `/skill-name` and go. Each skill is a focused expert for one task. Use it once, or use it daily.
- **Hooks that protect you automatically** — credential scanning, secret file blocking, commit linting, typosquatting detection. They run silently on every action. You only hear from them when something is wrong.
- **Subagents that activate on their own** — code review, security scanning, and accessibility checks are picked up by Claude automatically. No manual setup needed.
- **Zero configuration** — sensible defaults out of the box. Override anything via `~/.claude/` if you want to, but you don't have to.

## coding-assistant (v1.5.1)

### Skills

Invoke any skill with `/skill-name`.

**Code Quality** — `/refactoring-assistant` · `/test-generator` · `/database-reviewer`

**API** — `/api-design` · `/api-documentation`

**Git & Releases** — `/changelog-generator` · `/merge-conflict-resolver` · `/pr-reviewer`

**DevOps** — `/cicd-assistant` · `/dependency-auditor` · `/migration-assistant`

**Frontend** — `/performance-auditor` · `/seo-auditor` · `/i18n-checker`

**Planning** — `/time-estimation` · `/iterative-retrieval`

### Commands

Invoke with `/coding-assistant:<command>`.

- **commit-message** — generates commit messages and creates the commit
- **refactor-clean** — finds and removes dead code with test verification
- **update-docs** — syncs documentation with the codebase
- **setup-statusline** — installs a statusline showing model, task, and context usage
- **handoff** — generates a session handoff document for context continuity

### Automatic protections

Hooks run silently in the background — no setup, no invocation:

- Secret file blocking (`.env`, SSH keys, certificates)
- Credential leak scanning on every commit
- Commit message linting (length, imperative mood)
- Typosquatting detection for package installs
- Large file prevention (800-line limit)

### Code review subagents

Subagents are used automatically by Claude when relevant:

- **code-review** — PHP code reviewer, auto-detects Laravel and Shopware 6
- **security-scanner** — OWASP Top 10, framework-specific checks
- **wcag-compliance** — WCAG 2.2 accessibility checker (all 86 success criteria)

## License

GPL-3.0 — Tobias Kokesch ([Binary Hype](https://binary-hype.com))
