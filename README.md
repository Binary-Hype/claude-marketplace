# Claude Marketplace

A collection of plugins for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that extend its capabilities with specialized skills, subagents, commands, and hooks.

## Quick Start

Inside Claude Code, run:

```
# 1. Add the marketplace
/plugin marketplace add Binary-Hype/claude-marketplace

# 2. Install the coding-assistant plugin
/plugin install coding-assistant@binary-hype-dev
```

After installation, use skills with `/skill-name` (e.g. `/changelog-generator`), commands with `/command-name` (e.g. `/commit-message`), and subagents are picked up automatically by the Task tool.

## Plugins

### coding-assistant (v1.4.0)

Comprehensive coding assistant providing expert guidance on code quality, planning, and implementation.

**Skills** — Invoke with `/skill-name`:

| Skill | Description |
|-------|-------------|
| `changelog-generator` | Transforms git commits into user-friendly release notes |
| `time-estimation` | Estimates development time with manual vs AI-assisted comparisons |
| `refactoring-assistant` | Identifies code smells and suggests improvements using design patterns |
| `api-documentation` | Generates OpenAPI/Swagger specs and endpoint documentation |
| `test-generator` | Creates comprehensive Pest tests with Laravel testing helpers |
| `api-design` | REST API design patterns for resource naming, pagination, error responses |
| `merge-conflict-resolver` | Analyzes merge conflicts and recommends resolutions with risk levels |
| `iterative-retrieval` | Progressive context refinement for multi-agent workflows |

**Commands** — Invoke with `/command-name`:

| Command | Description |
|---------|-------------|
| `commit-message` | Generates commit messages and automatically creates the commit |
| `refactor-clean` | Identifies and removes dead code with test verification |
| `update-docs` | Syncs documentation with the codebase |
| `setup-statusline` | Installs statusline showing model, task, and context usage |
| `handoff` | Generates a session handoff document for context continuity |

**Subagents** — Used automatically or via the Task tool:

| Subagent | Description |
|----------|-------------|
| `code-review` | PHP code reviewer with automatic Laravel/Shopware 6 detection |
| `security-scanner` | OWASP Top 10 scanner with framework-specific specialists |
| `wcag-compliance` | WCAG 2.2 accessibility checker (all 86 success criteria) |
| `database-reviewer` | MySQL/MariaDB/PostgreSQL query and schema reviewer |
| `performance-auditor` | Core Web Vitals and frontend performance analysis |
| `dependency-auditor` | CVE scanning, license compliance, outdated package detection |
| `seo-auditor` | Meta tags, structured data, Open Graph, sitemap analysis |
| `cicd-assistant` | GitHub Actions, Docker, and deployment config review |
| `migration-assistant` | Framework and dependency upgrade paths |
| `i18n-checker` | Missing translations and locale file completeness |
| `pr-reviewer` | Diff analysis, PR descriptions, and change impact assessment |

**Hooks** — Run automatically:

- **protect-secrets.js** — Blocks access to secret/credential files (.env, SSH keys, certificates, etc.)
- **protect-credentials.sh** — Scans staged changes for leaked credentials before commits
- **large-file-blocker** — Prevents creation of files exceeding 800 lines
- **statusline.js** — Displays model, task, directory, and context usage in the status bar

## License

MIT — Tobias Kokesch ([Binary Hype](https://binary-hype.com))
