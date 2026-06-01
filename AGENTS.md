# Claude Marketplace - Development Guide

This repository contains Claude Code plugins that provide specialized skills for software development workflows.

## Project Structure

This is a marketplace repository for Claude Code plugins created by Binary Hype (Tobias Kokesch).

### Plugins

1. **coding-assistant** - Comprehensive coding assistance with multiple specialized skills

## Plugin: coding-assistant

**Location:** `./coding-assistant`
**Version:** 2.0.0

A comprehensive coding assistant providing expert guidance on code quality, planning, and implementation.

### Skills

1. **changelog-generator**: Transforms technical git commits into user-friendly changelogs by analyzing commit history, categorizing changes, and creating polished release notes. Use when preparing release notes, documenting changes for customers, or maintaining public changelogs.

2. **time-estimation**: Estimates development time for features by analyzing complexity, dependencies, and project structure. Provides manual vs AI-assisted development time comparisons showing hours saved when using AI tools.

3. **quality-check**: Quality screen for code changes covering design pattern appropriateness, readability, SOLID/DRY principles, common performance anti-patterns, and dead code. Defaults to scanning unstaged git changes; accepts explicit file paths or diff ranges as alternative scope. Diff-level only — not a full performance audit and not a full-codebase dead-code pipeline.

4. **api-documentation**: Automatically generates comprehensive API documentation including OpenAPI/Swagger specs, endpoint descriptions, request/response examples, and integration guides. Includes Laravel route discovery support.

5. **test-generator**: Generates comprehensive tests using Pest syntax with Laravel testing helpers. Creates feature tests, unit tests, factories, and test data with proper assertions and mocking.

6. **api-design**: REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning, and rate limiting for production APIs. Includes implementation examples for Laravel and plain PHP.

7. **iterative-retrieval**: Pattern for progressively refining context retrieval in multi-agent workflows. Solves the subagent context problem through 4-phase DISPATCH-EVALUATE-REFINE-LOOP cycles (max 3 iterations) with relevance scoring and gap identification.

8. **merge-conflict-resolver**: Analyzes git merge conflicts and recommends resolutions by examining both sides of each conflict, gathering branch context, and providing per-conflict recommendations with risk levels. Handles special cases like lock files, migrations, config files, and auto-generated files.

9. **seo-auditor**: SEO auditor for meta tags, Open Graph, structured data (JSON-LD), sitemap, robots.txt, canonical URLs, heading hierarchy, and image alt text. Scans templates and public files for search engine optimization issues. Supports dynamic model delegation for cost-optimized execution.

10. **performance-auditor**: Core Web Vitals and frontend performance auditor. Analyzes templates, images, scripts, styles, and build configs for LCP, INP, CLS issues, render-blocking resources, missing lazy loading, bundle size problems, and caching gaps. Supports dynamic model delegation.

11. **i18n-checker**: Internationalization checker for missing translations, hardcoded strings, locale file completeness, and placeholder consistency. Supports Laravel lang files, gettext .po, JSON translations, and Shopware snippets. Supports dynamic model delegation.

12. **dependency-auditor**: Audits project dependencies for known vulnerabilities (CVEs), outdated packages, license compliance, and abandoned packages. Supports Composer (PHP) and npm (Node.js) with DDEV-aware command execution. Supports dynamic model delegation.

13. **migration-assistant**: Framework and dependency migration/upgrade assistant. Detects current versions, identifies breaking changes, scans for deprecated API usage, and provides step-by-step upgrade paths for Laravel, Shopware, PHP, and Node.js projects. Supports dynamic model delegation.

14. **cicd-assistant**: CI/CD pipeline assistant for GitHub Actions, Docker, docker-compose, and deployment configurations. Reviews, generates, and fixes workflow files, Dockerfiles, and environment configs with security and performance best practices. Supports dynamic model delegation.

15. **database-reviewer**: Database specialist for MySQL/MariaDB and PostgreSQL covering query optimization, schema design, security, and performance. Includes ORM patterns (Eloquent) and migration best practices. Use when writing SQL, creating migrations, or troubleshooting performance. Supports dynamic model delegation.

16. **codebase-summary**: Analyzes a codebase and generates a comprehensive summary document for new developers. Detects tech stack, architecture, conventions, entry points, workflows, and domain concepts across PHP, Node.js, Python, Go, Rust, and Ruby projects. Supports dynamic model delegation.

17. **humanizer**: Removes signs of AI-generated writing from text. Based on Wikipedia's "Signs of AI writing" guide. Detects and fixes patterns including inflated symbolism, promotional language, superficial -ing analyses, vague attributions, em dash overuse, rule of three, AI vocabulary words, negative parallelisms, and excessive conjunctive phrases. Use when editing or reviewing text to make it sound more natural and human-written.

18. **handoff**: Generates a structured handoff document for continuing work in a fresh Claude Code session. Captures task context, git state, key decisions, and remaining work so nothing is lost when context limits are reached. Use when context is filling, before /compact, when pausing work, or when handing off to a colleague.

19. **promote-prs**: Creates paired pull/merge requests for the current feature branch — one targeting `develop` (fallback `main`) labeled `(production)`, and one targeting `staging` (fallback `stage`, then `testing`) labeled `(staging)`. Auto-extracts JIRA ticket from the branch name (formats like `TIC-1337` and `TIC_1337` both supported), prompts only when missing. Idempotent: skips PRs that already exist for the same source→target pair. Supports GitHub (`gh`) and GitLab (`glab`), auto-detected from the origin remote URL.

### Subagents

1. **code-review**: Expert PHP web application code reviewer with automatic framework detection. Reads `composer.json` to detect Laravel (`laravel/framework`) or Shopware 6 (`shopware/core`) and delegates framework-specific reviews to specialist subagents. Reviews for:
   - Code quality and best practices (PSR-1/PSR-12, SOLID, type safety)
   - Security vulnerabilities (SQL injection, XSS, CSRF)
   - Performance optimization (N+1 queries, caching)
   - General PHP patterns and conventions
   - Delegates framework-specific checks to code-review-laravel or code-review-shopware subagent
   - Delegates WCAG accessibility checks to wcag-compliance subagent
   - Delegates security scans to security-scanner subagent

2. **wcag-compliance**: Specialized WCAG 2.2 accessibility compliance checker. Analyzes HTML, JSX, TSX, Blade, and Vue files for comprehensive accessibility issues. Features:
   - All 86 WCAG 2.2 success criteria (including 9 new WCAG 2.2 criteria)
   - Categorization by conformance level (A, AA, AAA)
   - Accepts specific files or folder patterns for targeted audits
   - Provides detailed remediation guidance with code examples
   - References official W3C WCAG documentation
   - Framework-aware (Laravel Blade, React, Vue)

3. **security-scanner**: Expert PHP web application security scanner with automatic framework detection. Specializes in OWASP Top 10, SQL injection, XSS, CSRF, authentication flaws, and insecure configurations. Reads `composer.json` to detect Laravel or Shopware 6 and delegates framework-specific security checks to specialist subagents. Performs comprehensive security audits with actionable remediation guidance.

4. **code-review-laravel**: Laravel specialist code reviewer (leaf agent). Delegated to by code-review when `laravel/framework` is detected. Reviews Eloquent/DB patterns (N+1, eager loading), controllers (thin controllers, Form Requests), Blade templates (XSS, CSRF, Livewire syntax), service providers, events/listeners, queue jobs, middleware, and config/cache compatibility.

5. **code-review-shopware**: Shopware 6 specialist code reviewer (leaf agent). Delegated to by code-review when `shopware/core` is detected. Reviews plugin architecture (lifecycle, services.xml), DAL usage (EntityDefinition, Criteria, Repository), Twig templates (sw_extends, |trans), event subscribers, migration patterns, and Shopware anti-patterns.

6. **security-scanner-laravel**: Laravel security specialist (leaf agent). Delegated to by security-scanner when `laravel/framework` is detected. Scans for mass assignment, Eloquent injection, Blade XSS/CSRF, route protection, Sanctum/Passport token security, signed URLs, broadcasting authorization, and Laravel configuration security.

7. **security-scanner-shopware**: Shopware 6 security specialist (leaf agent). Delegated to by security-scanner when `shopware/core` is detected. Scans for ACL/permissions, Store API security, Admin API authentication, plugin sandbox risks, Twig |raw abuse, DAL access control, and Shopware misconfigurations.

### Commands

1. **commit-message**: Generates well-structured git commit messages and automatically creates the commit. Analyzes staged changes to create meaningful commit messages following best practices.

2. **update-docs**: Syncs documentation with the codebase for PHP projects (including Laravel and Shopware). Generates from source-of-truth files like composer.json, .env.example, route definitions, and artisan commands.


### Hooks

1. **hooks.json**: Hook configuration file registering PreToolUse and PreCompact hooks for the plugin.


2. **protect-secrets.js**: PreToolUse security hook that blocks access to secret/credential files using a configurable denylist. Covers `.env`, `.env.*`, SSH keys (`id_rsa*`, `id_ed25519*`), certificates (`*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.crt`), keystores (`*.jks`, `*.keystore`), auth configs (`.npmrc`, `.netrc`, `.htpasswd`, `.pgpass`), vault files (`vault.yml`, `secrets.yml`, `secrets.json`), and more. Features:
   - 3-tier configuration: plugin defaults → `~/.claude/security/denylist.json` → `.claude/security/denylist.json`
   - Allow list for safe files (`.env.example`, `.env.dist`, `.env.template`)
   - Session-scoped overrides via `bin/exempt-secret` (temporary, lost on reboot)
   - Fail-closed design: blocks all file access if config is unavailable
   - Intercepts Read, Edit, Write, Bash, Grep, and Glob tool calls

3. **protect-credentials.sh**: PreToolUse security hook that scans staged git changes for credentials before allowing commits. Detects AWS keys, API tokens, private keys, passwords, database connection strings, JWT tokens, GitHub/GitLab tokens, Slack/Discord webhooks, Stripe/SendGrid/Twilio keys, and other secret patterns. Blocks commits with clear error messages listing findings. Skips test files and placeholder values to reduce false positives. Fails open on errors.

4. **large-file-blocker** (inline): PreToolUse hook that blocks creation of files exceeding 800 lines. Suggests splitting into smaller modules.

5. **protect-env.sh** (legacy): Original `.env` protection hook, kept for backwards compatibility. Superseded by `protect-secrets.js`.

6. **lint-commit-message.js**: PreToolUse hook that enforces commit message conventions. Validates subject line length (warn >50, block >72 chars), imperative mood (blocks past tense verbs like "Added", "Fixed"), no trailing period, and blank line between subject and body. Skips amend/fixup/squash commits. Features:
   - 3-tier configuration: plugin defaults → `~/.claude/commit-rules.json` → `.claude/commit-rules.json`
   - Supports `-m`, `--message`, and heredoc message formats
   - Fails open on parse errors

7. **context-usage-alert.js**: PreCompact hook that alerts when auto-compaction triggers (context window full). Shows a warning message and injects `additionalContext` reminding Claude about `/handoff` for context preservation. Logs compaction events to `/tmp/claude-context-alerts.log`. Only fires on auto-compaction, not manual `/compact`.

8. **protect-1password.js**: PreToolUse hook that blocks 1Password CLI (`op`) commands which could expose secrets. Allows metadata reads (titles, vault/item names, URLs, usernames, tags) but blocks passwords, private keys, tokens, recovery codes, and documents. Features:
    - Allowlist of safe subcommands: `whoami`, `signin`, `signout`, `vault list/get`, `user list/get`, `account list/get`, `group list/get`, `item list/template`
    - `op item get` requires `--fields` restricted to a known-safe set (title, name, url, website, username, email, tags, category, vault, id, uuid, createdAt, updatedAt, favorite, trashed, version)
    - `op read "op://vault/item/field"` only allowed when the referenced field is in the safe set
    - Always blocks: `op document`, `op inject`, `op run`, `op connect`, `op events-api`, `op service-account`
    - `--reveal` flag is blocked on `op item get`
    - Scans command substitutions (`$(...)` and backticks) so `op` nested in substitutions is still caught
    - Fail-closed: unknown subcommands and unknown fields are blocked by default

## Project Conventions

When working with this codebase:

### Code Review Standards
- All code should be reviewed for WCAG 2.2 accessibility compliance using wcag-compliance subagent
- Framework best practices should be followed
- Security is a top priority (use security-scanner subagent for OWASP Top 10 checks)

### Commit Messages
- Subject lines should be <=50 characters
- Use imperative mood ("Add feature" not "Added feature")
- Include detailed body explaining WHY, not just WHAT
- Reference issues/tickets when applicable

## Development Workflow

1. **Implementation**: Follow established framework conventions and project patterns
2. **Self-review**: Use quality-check skill on the unstaged diff to screen for design pattern fit, readability, SOLID/DRY violations, common performance anti-patterns, and dead code
3. **Testing**: Use test-generator skill to create comprehensive tests
4. **Review**: Use code-review subagent to check quality (delegates to security-scanner, wcag-compliance)
5. **Documentation**: Use api-documentation skill for API endpoints, update-docs command for project docs
6. **Commit**: Use commit-message command for professional commit messages
7. **Release**: Use changelog-generator skill to create user-facing release notes

## Repository Information

- **Owner**: Tobias Kokesch (Binary Hype)
- **Email**: hallo@binary-hype.com
- **Repository**: https://github.com/Binary-Hype/claude-marketplace
- **License**: GPL-3.0

## Keywords

- Skills
- Git (changelog, commits)
- Web Development (PHP, JavaScript)
- Code Quality
- Testing
- Refactoring
- API Documentation (OpenAPI)
- API Design Patterns
- Security (OWASP Top 10)
- Accessibility (WCAG 2.2)
- Code Review Workflow (multi-framework: Laravel, Shopware 6, plain PHP)
- Shopware 6
- Database (MySQL, MariaDB, PostgreSQL)
- Dead Code Removal
- Time Estimation
- Performance (Core Web Vitals)
- Dependency Auditing (CVEs, Licenses)
- SEO (Meta Tags, Structured Data, Open Graph)
- CI/CD (GitHub Actions, Docker)
- Migration & Upgrades
- Internationalization (i18n)
- Pull Request Review
- Merge Conflict Resolution
- Codebase Summary (Onboarding)
- Humanizer (AI Writing Detection, Text Editing)

## Notes for AI Assistants

When working in this repository:

1. Each plugin is self-contained in its own directory
2. Skills are defined in `SKILL.md` files within each plugin
3. Commands are defined as `.md` files in the `commands/` directory
4. Hooks are defined in the `hooks/` directory with configuration in `hooks.json`
5. Plugin metadata is in `.claude-plugin/plugin.json`
6. All plugins are GPL-3.0 licensed and maintained by Binary Hype
