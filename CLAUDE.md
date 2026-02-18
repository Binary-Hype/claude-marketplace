# Claude Marketplace - Development Guide

This repository contains Claude Code plugins that provide specialized skills for software development workflows.

## Project Structure

This is a marketplace repository for Claude Code plugins created by Binary Hype (Tobias Kokesch).

### Plugins

1. **coding-assistant** - Comprehensive coding assistance with multiple specialized skills

## Plugin: coding-assistant

**Location:** `./coding-assistant`
**Version:** 1.4.0

A comprehensive coding assistant providing expert guidance on code quality, planning, and implementation.

### Skills

1. **changelog-generator**: Transforms technical git commits into user-friendly changelogs by analyzing commit history, categorizing changes, and creating polished release notes. Use when preparing release notes, documenting changes for customers, or maintaining public changelogs.

2. **time-estimation**: Estimates development time for features by analyzing complexity, dependencies, and project structure. Provides manual vs AI-assisted development time comparisons showing hours saved when using AI tools.

3. **refactoring-assistant**: Identifies code smells and suggests refactoring improvements using proven design patterns. Includes Laravel-specific patterns but applicable to any codebase.

4. **api-documentation**: Automatically generates comprehensive API documentation including OpenAPI/Swagger specs, endpoint descriptions, request/response examples, and integration guides. Includes Laravel route discovery support.

5. **test-generator**: Generates comprehensive tests using Pest syntax with Laravel testing helpers. Creates feature tests, unit tests, factories, and test data with proper assertions and mocking.

6. **api-design**: REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning, and rate limiting for production APIs. Includes implementation examples for Laravel and plain PHP.

7. **iterative-retrieval**: Pattern for progressively refining context retrieval in multi-agent workflows. Solves the subagent context problem through 4-phase DISPATCH-EVALUATE-REFINE-LOOP cycles (max 3 iterations) with relevance scoring and gap identification.

8. **merge-conflict-resolver**: Analyzes git merge conflicts and recommends resolutions by examining both sides of each conflict, gathering branch context, and providing per-conflict recommendations with risk levels. Handles special cases like lock files, migrations, config files, and auto-generated files.

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

4. **database-reviewer**: Database specialist for MySQL/MariaDB and PostgreSQL covering query optimization, schema design, security, and performance. Includes ORM patterns (Eloquent) and migration best practices. Use when writing SQL, creating migrations, or troubleshooting performance.

5. **code-review-laravel**: Laravel specialist code reviewer (leaf agent). Delegated to by code-review when `laravel/framework` is detected. Reviews Eloquent/DB patterns (N+1, eager loading), controllers (thin controllers, Form Requests), Blade templates (XSS, CSRF, Livewire syntax), service providers, events/listeners, queue jobs, middleware, and config/cache compatibility.

6. **code-review-shopware**: Shopware 6 specialist code reviewer (leaf agent). Delegated to by code-review when `shopware/core` is detected. Reviews plugin architecture (lifecycle, services.xml), DAL usage (EntityDefinition, Criteria, Repository), Twig templates (sw_extends, |trans), event subscribers, migration patterns, and Shopware anti-patterns.

7. **security-scanner-laravel**: Laravel security specialist (leaf agent). Delegated to by security-scanner when `laravel/framework` is detected. Scans for mass assignment, Eloquent injection, Blade XSS/CSRF, route protection, Sanctum/Passport token security, signed URLs, broadcasting authorization, and Laravel configuration security.

8. **security-scanner-shopware**: Shopware 6 security specialist (leaf agent). Delegated to by security-scanner when `shopware/core` is detected. Scans for ACL/permissions, Store API security, Admin API authentication, plugin sandbox risks, Twig |raw abuse, DAL access control, and Shopware misconfigurations.

9. **performance-auditor**: Core Web Vitals and frontend performance auditor. Analyzes templates, images, scripts, styles, and build configs for LCP, INP, CLS issues, render-blocking resources, missing lazy loading, bundle size problems, and caching gaps.

10. **dependency-auditor**: Audits project dependencies for known vulnerabilities (CVEs), outdated packages, license compliance, and abandoned packages. Supports Composer (PHP) and npm (Node.js) with DDEV-aware command execution.

11. **seo-auditor**: SEO auditor for meta tags, Open Graph, structured data (JSON-LD), sitemap, robots.txt, canonical URLs, heading hierarchy, and image alt text. Scans templates and public files for search engine optimization issues.

12. **cicd-assistant**: CI/CD pipeline assistant for GitHub Actions, Docker, docker-compose, and deployment configurations. Reviews, generates, and fixes workflow files, Dockerfiles, and environment configs with security and performance best practices.

13. **migration-assistant**: Framework and dependency migration/upgrade assistant. Detects current versions, identifies breaking changes, scans for deprecated API usage, and provides step-by-step upgrade paths for Laravel, Shopware, PHP, and Node.js projects.

14. **i18n-checker**: Internationalization checker for missing translations, hardcoded strings, locale file completeness, and placeholder consistency. Supports Laravel lang files, gettext .po, JSON translations, and Shopware snippets.

15. **pr-reviewer**: Pull request reviewer that analyzes diffs, generates PR descriptions, identifies debug code, assesses change impact and risk, categorizes modifications, and checks for common PR issues like merge conflicts and missing tests.

### Commands

1. **commit-message**: Generates well-structured git commit messages and automatically creates the commit. Analyzes staged changes to create meaningful commit messages following best practices.

2. **refactor-clean**: Safely identifies and removes dead code in PHP projects (including Laravel and Shopware). Uses PHPStan, Psalm, composer-unused, and Deptrac for detection with test verification at every step.

3. **update-docs**: Syncs documentation with the codebase for PHP projects (including Laravel and Shopware). Generates from source-of-truth files like composer.json, .env.example, route definitions, and artisan commands.

4. **setup-statusline**: Installs the coding-assistant statusline showing model, current task, directory, and context usage. Modifies `~/.claude/settings.json`.

5. **handoff**: Generates a structured handoff document for continuing work in a fresh Claude Code session. Captures task context, git state, key decisions, and remaining work so nothing is lost when context limits are reached.

### Hooks

1. **hooks.json**: Hook configuration file registering PreToolUse hooks for the plugin.

2. **statusline.js**: Displays model, current task, directory, and context usage in the Claude Code status line.

3. **setup-statusline.js**: Statusline setup and installation hook.

4. **protect-secrets.js**: PreToolUse security hook that blocks access to secret/credential files using a configurable denylist. Covers `.env`, `.env.*`, SSH keys (`id_rsa*`, `id_ed25519*`), certificates (`*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.crt`), keystores (`*.jks`, `*.keystore`), auth configs (`.npmrc`, `.netrc`, `.htpasswd`, `.pgpass`), vault files (`vault.yml`, `secrets.yml`, `secrets.json`), and more. Features:
   - 3-tier configuration: plugin defaults → `~/.claude/security/denylist.json` → `.claude/security/denylist.json`
   - Allow list for safe files (`.env.example`, `.env.dist`, `.env.template`)
   - Session-scoped overrides via `bin/exempt-secret` (temporary, lost on reboot)
   - Fail-closed design: blocks all file access if config is unavailable
   - Intercepts Read, Edit, Write, Bash, Grep, and Glob tool calls

5. **protect-credentials.sh**: PreToolUse security hook that scans staged git changes for credentials before allowing commits. Detects AWS keys, API tokens, private keys, passwords, database connection strings, JWT tokens, GitHub/GitLab tokens, Slack/Discord webhooks, Stripe/SendGrid/Twilio keys, and other secret patterns. Blocks commits with clear error messages listing findings. Skips test files and placeholder values to reduce false positives. Fails open on errors.

6. **large-file-blocker** (inline): PreToolUse hook that blocks creation of files exceeding 800 lines. Suggests splitting into smaller modules.

7. **protect-env.sh** (legacy): Original `.env` protection hook, kept for backwards compatibility. Superseded by `protect-secrets.js`.

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

1. **Planning**: Use refactoring-assistant skill to improve existing code or plan architecture
2. **Implementation**: Follow established framework conventions and project patterns
3. **Testing**: Use test-generator skill to create comprehensive tests
4. **Review**: Use code-review subagent to check quality (delegates to security-scanner, wcag-compliance)
5. **Documentation**: Use api-documentation skill for API endpoints, update-docs command for project docs
6. **Commit**: Use commit-message command for professional commit messages
7. **Release**: Use changelog-generator skill to create user-facing release notes
8. **Clean**: Use /refactor-clean command to identify and remove dead code

## Repository Information

- **Owner**: Tobias Kokesch (Binary Hype)
- **Email**: hallo@binary-hype.com
- **Repository**: https://github.com/Binary-Hype/claude-marketplace
- **License**: MIT

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

## Notes for AI Assistants

When working in this repository:

1. Each plugin is self-contained in its own directory
2. Skills are defined in `SKILL.md` files within each plugin
3. Commands are defined as `.md` files in the `commands/` directory
4. Hooks are defined in the `hooks/` directory with configuration in `hooks.json`
5. Plugin metadata is in `.claude-plugin/plugin.json`
6. All plugins are MIT licensed and maintained by Binary Hype
