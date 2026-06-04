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
- **Hooks that protect you automatically** — credential scanning, secret file blocking, unsafe 1Password guard, large-file prevention. They run silently on every action. You only hear from them when something is wrong.
- **Subagents that activate on their own** — code review and security scanning are picked up by Claude automatically. No manual setup needed.
- **Zero configuration** — sensible defaults out of the box. Override anything via `~/.claude/` if you want to, but you don't have to.

## coding-assistant (v2.3.1)

### Skills

Invoke any skill with `/skill-name`.

**Code Quality** — `/quality-check` · `/test-generator` · `/database-reviewer` · `/merge-conflict-resolver`

**API & Design** — `/api-design`

**Security & Health** — `/dependency-auditor`

**Git & Review** — `/promote-prs` · `/commit-message`

**Writing** — `/humanizer`

**Planning** — `/grill-me`

### Commands

Invoke with `/coding-assistant:<command>`.

- **commit-message** — generates commit messages and creates the commit

### Automatic protections

Hooks run silently in the background — no setup, no invocation:

- Secret file blocking (`.env`, SSH keys, certificates)
- Credential leak scanning on every commit
- Unsafe 1Password CLI command blocking
- Large file prevention (800-line limit)

### Code review subagents

Subagents are used automatically by Claude when relevant:

- **code-review** — PHP code reviewer, auto-detects Laravel and Shopware 6
- **security-scanner** — OWASP Top 10, framework-specific checks

### Oh My Pi compatibility

This plugin also works with [Oh My Pi](https://omp.sh/docs). The following surfaces are compatible:

- **Metadata** — root `plugin.json` plus `package.json` for current OMP local install/link compatibility
- **Skills** — discovered automatically from `skills/<name>/SKILL.md`
- **Commands** — discovered automatically from `commands/<name>.md`
- **Hooks** — the core safety hooks are ported to TypeScript under `hooks/pre/core-safety.ts` (secret-file blocking, credential commit gate, 1Password guard, large-file blocker)
- **Agents** — Claude Code continues to use `agents/*.md` automatically. Oh My Pi does not load plugin-bundled agents; if you want the `code-review` or `security-scanner` agents in OMP, copy them manually to `~/.omp/agent/agents/` or `.omp/agents/`.

## License

GPL-3.0 — Tobias Kokesch ([Binary Hype](https://binary-hype.com))
