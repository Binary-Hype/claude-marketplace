# Claude Marketplace - Development Guide

This repository contains Claude Code plugins that provide specialized skills for software development workflows.

## Project Structure

This is a marketplace repository for Claude Code plugins created by Binary Hype (Tobias Kokesch). The project contains multiple plugins, each providing specialized skills:

### Plugins

1. **coding-assistant** - Comprehensive coding assistance with multiple specialized skills
2. **research-assistant** - Research and analysis toolkit for market intelligence and insights

## Plugin: coding-assistant

**Location:** `./coding-assistant`
**Version:** 1.0.4

A comprehensive coding assistant providing expert guidance on code quality, planning, and implementation.

### Skills

1. **changelog-generator**: Transforms technical git commits into user-friendly changelogs by analyzing commit history, categorizing changes, and creating polished release notes. Use when preparing release notes, documenting changes for customers, or maintaining public changelogs.

2. **commit-message**: Generates well-structured git commit messages by analyzing staged changes. Creates concise subject lines (≤50 chars) with detailed descriptions following best practices.

3. **time-estimation**: Estimates development time for features by analyzing complexity, dependencies, and project structure. Provides manual vs AI-assisted development time comparisons showing hours saved when using AI tools.

4. **refactoring-assistant**: Identifies code smells and suggests refactoring improvements using proven design patterns. Helps improve code quality, maintainability, and testability with Laravel-specific refactoring guidance.

5. **api-documentation**: Automatically generates comprehensive API documentation including OpenAPI/Swagger specs, endpoint descriptions, request/response examples, and integration guides. Perfect for Laravel APIs with automatic route discovery.

6. **test-generator**: Generates comprehensive Laravel tests using Pest syntax. Creates feature tests, unit tests, factories, and test data with proper assertions, mocking, and Laravel testing helpers.

### Subagents

1. **code-review**: Expert autonomous code reviewer specializing in PHP, HTML, CSS, JavaScript, and Laravel. Performs systematic code analysis using Read, Grep, Glob, and IDE diagnostics tools. Reviews for:
   - Code quality and best practices
   - Security vulnerabilities (SQL injection, XSS, CSRF)
   - Performance optimization (N+1 queries, caching)
   - Laravel-specific conventions
   - Delegates WCAG accessibility checks to wcag-compliance subagent
   - Delegates security scans to security-scanner subagent

2. **wcag-compliance**: Specialized WCAG 2.2 accessibility compliance checker. Analyzes HTML, JSX, TSX, Blade, and Vue files for comprehensive accessibility issues. Features:
   - All 86 WCAG 2.2 success criteria (including 9 new WCAG 2.2 criteria)
   - Categorization by conformance level (A, AA, AAA)
   - Accepts specific files or folder patterns for targeted audits
   - Provides detailed remediation guidance with code examples
   - References official W3C WCAG documentation
   - Framework-aware (Laravel Blade, React, Vue)

3. **security-scanner**: Expert security vulnerability scanner specializing in OWASP Top 10, Laravel security best practices, SQL injection, XSS, CSRF, authentication flaws, and insecure configurations. Performs comprehensive security audits with actionable remediation guidance.

4. **laravel-best-practices**: Expert Laravel best practices auditor specializing in framework conventions, Action patterns, service architecture, Eloquent optimization, and modern Laravel patterns. Promotes single-responsibility Action classes for business logic and ensures adherence to Laravel's ecosystem standards.

5. **fluxui-docs**: Automatically checks official FluxUI documentation (https://fluxui.dev/docs) when working with Flux components. Fetches component APIs, props, and best practices.

6. **daisyui-docs**: Automatically checks official DaisyUI documentation (https://daisyui.com/components/) when working with DaisyUI components. Fetches component classes, modifiers, variants, and usage examples.

7. **tailwindcss-docs**: Automatically checks official Tailwind CSS documentation (https://tailwindcss.com/docs) when using or working with Tailwind utility classes. Fetches and analyzes documentation for utility classes, responsive design, dark mode, customization, and best practices.

## Plugin: research-assistant

**Location:** `./research-assistant`
**Version:** 1.0.0

Comprehensive research and analysis toolkit with specialized subagents for market research, competitive intelligence, trend analysis, and data investigation.

### Subagents

1. **research-analyst**: Expert research analyst for comprehensive information gathering, synthesis, and insight generation. Masters research methodologies, data analysis, and report creation with focus on delivering actionable intelligence.

2. **search-specialist**: Advanced information retrieval expert specializing in query optimization and knowledge discovery. Finds needle-in-haystack information with precision > 90% using advanced search techniques and specialized databases.

3. **trend-analyst**: Senior trend analyst specializing in pattern recognition, forecasting, and strategic foresight. Identifies emerging trends before mainstream awareness and assesses strategic implications across technology, consumer, social, and economic domains.

4. **competitive-analyst**: Expert competitive intelligence specialist for competitor analysis, SWOT analysis, and market positioning. Provides strategic recommendations for sustainable competitive advantage through ethical intelligence gathering.

5. **market-researcher**: Expert market researcher specializing in market sizing (TAM, SAM, SOM), consumer insights, and segmentation analysis. Masters primary and secondary research to identify market opportunities and inform go-to-market strategies.

6. **data-researcher**: Expert data researcher specializing in data discovery, statistical analysis, and pattern recognition. Extracts meaningful insights from complex datasets through rigorous analytical methods and creates compelling visualizations.

### Usage
Use when conducting market research, competitive analysis, trend forecasting, or data-driven decision making. Each subagent is autonomous and performs deep research independently.

## Project Conventions

When working with this codebase:

### FluxUI Components (from fluxui-docs skill)
- Use `<livewire:component>` syntax, NOT `@livewire('component')`
- FluxUI inputs already have error messages attached - don't add additional error displays
- `flux:button` does NOT have size="lg"

### Code Review Standards
- All code should be reviewed for WCAG 2.2 accessibility compliance using wcag-compliance subagent
- Laravel best practices must be followed (use laravel-best-practices subagent)
- Security is a top priority (use security-scanner subagent for OWASP Top 10 checks)
- Action pattern should be used for complex business logic (single-responsibility classes)

### Commit Messages
- Subject lines should be ≤50 characters
- Use imperative mood ("Add feature" not "Added feature")
- Include detailed body explaining WHY, not just WHAT
- Reference issues/tickets when applicable

## Development Workflow

1. **Planning**: Use refactoring-assistant skill to improve existing code or plan architecture
2. **Implementation**: Follow Laravel conventions, Action patterns, and FluxUI component guidelines
3. **Testing**: Use test-generator skill to create comprehensive Pest tests
4. **Review**: Use code-review subagent to check quality (delegates to security-scanner, wcag-compliance, laravel-best-practices)
5. **Documentation**: Use api-documentation skill for API endpoints
6. **Commit**: Use commit-message skill for professional commit messages
7. **Release**: Use changelog-generator skill to create user-facing release notes

## Repository Information

- **Owner**: Tobias Kokesch (Binary Hype)
- **Email**: hallo@binary-hype.com
- **Repository**: https://github.com/Binary-Hype/claude-marketplace
- **License**: MIT

## Keywords

- Skills
- Git (changelog, commits)
- Web Development (PHP, Laravel, JavaScript)
- Code Quality
- Testing (Pest, PHPUnit)
- Refactoring
- API Documentation
- Security (OWASP Top 10)
- Accessibility (WCAG)
- Laravel Best Practices
- Action Pattern
- FluxUI
- TailwindCSS
- DaisyUI
- Research & Analysis
- Market Research
- Competitive Intelligence
- Trend Analysis
- Business Intelligence

## Notes for AI Assistants

When working in this repository:

1. Each plugin is self-contained in its own directory
2. Skills are defined in `SKILL.md` files within each plugin
3. Plugin metadata is in `.claude-plugin/plugin.json`
4. The marketplace configuration is in `.claude-plugin/marketplace.json`
5. All plugins are MIT licensed and maintained by Binary Hype
