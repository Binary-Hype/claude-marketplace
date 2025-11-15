# Claude Marketplace - Development Guide

This repository contains Claude Code plugins that provide specialized skills for software development workflows.

## Project Structure

This is a marketplace repository for Claude Code plugins created by Binary Hype (Tobias Kokesch). The project contains multiple plugins, each providing specialized skills:

### Plugins

1. **changelog-generator** - Automatic changelog generation from git commits
2. **coding-assistant** - Comprehensive coding assistance with multiple specialized skills

## Plugin: changelog-generator

**Location:** `./changelog-generator`
**Version:** 1.0.0

### Skills

- **changelog-generator**: Transforms technical git commits into user-friendly changelogs by analyzing commit history, categorizing changes, and creating polished release notes.

### Usage
Use when preparing release notes, documenting changes for customers, or maintaining public changelogs.

## Plugin: coding-assistant

**Location:** `./coding-assistant`
**Version:** 1.0.0

A comprehensive coding assistant providing expert guidance on code quality, planning, and implementation.

### Skills

1. **technical-refinement**: Transforms product requirements into actionable developer todo lists. Asks clarifying questions, reads requirements.md, and analyzes project architecture.

2. **commit-message**: Generates well-structured git commit messages by analyzing staged changes. Creates concise subject lines (≤50 chars) with detailed descriptions following best practices.

3. **time-estimation**: Estimates development time for features by analyzing complexity, dependencies, and project structure. Provides manual vs AI-assisted development time comparisons showing hours saved when using AI tools.

### Subagents

1. **code-review**: Expert autonomous code reviewer specializing in PHP, HTML, CSS, JavaScript, and Laravel. Performs systematic code analysis using Read, Grep, Glob, and IDE diagnostics tools. Reviews for:
   - Code quality and best practices
   - Security vulnerabilities (SQL injection, XSS, CSRF)
   - Performance optimization (N+1 queries, caching)
   - WCAG accessibility compliance (Levels A, AA, AAA)
   - Laravel-specific conventions

2. **fluxui-docs**: Automatically checks official FluxUI documentation (https://fluxui.dev/docs) when working with Flux components. Fetches component APIs, props, and best practices.

3. **daisyui-docs**: Automatically checks official DaisyUI documentation (https://daisyui.com/components/) when working with DaisyUI components. Fetches component classes, modifiers, variants, and usage examples.

## Project Conventions

When working with this codebase:

### FluxUI Components (from fluxui-docs skill)
- Use `<livewire:component>` syntax, NOT `@livewire('component')`
- FluxUI inputs already have error messages attached - don't add additional error displays
- `flux:button` does NOT have size="lg"

### Code Review Standards
- All code should be reviewed for WCAG accessibility compliance
- Laravel best practices must be followed
- Security is a top priority (prevent injection attacks, XSS, CSRF)

### Commit Messages
- Subject lines should be ≤50 characters
- Use imperative mood ("Add feature" not "Added feature")
- Include detailed body explaining WHY, not just WHAT
- Reference issues/tickets when applicable

## Development Workflow

1. **Planning**: Use technical-refinement skill to transform requirements into tasks
2. **Implementation**: Follow Laravel conventions and FluxUI component guidelines
3. **Review**: Use code-review skill to check quality, security, and accessibility
4. **Commit**: Use commit-message skill for professional commit messages
5. **Release**: Use changelog-generator skill to create user-facing release notes

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
- Accessibility (WCAG)
- FluxUI

## Notes for AI Assistants

When working in this repository:

1. Each plugin is self-contained in its own directory
2. Skills are defined in `SKILL.md` files within each plugin
3. Plugin metadata is in `.claude-plugin/plugin.json`
4. The marketplace configuration is in `.claude-plugin/marketplace.json`
5. All plugins are MIT licensed and maintained by Binary Hype
