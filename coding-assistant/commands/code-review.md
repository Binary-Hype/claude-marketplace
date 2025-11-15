---
description: Perform comprehensive code review checking quality, security, performance, and Laravel best practices
---

# Code Review

Invoke the code-review subagent to perform a comprehensive code review of your files.

You are being asked to conduct a thorough code review. Use the Task tool to invoke the code-review subagent:

```
Task: subagent_type="code-review"
      prompt="Perform a comprehensive code review of [specify files or scope]. Check for:
      - Code quality and best practices
      - Security vulnerabilities (SQL injection, XSS, CSRF)
      - Performance issues (N+1 queries, missing indexes)
      - Laravel-specific conventions
      - Delegate security scanning to security-scanner subagent
      - Delegate WCAG accessibility to wcag-compliance subagent
      - Delegate Laravel patterns to laravel-best-practices subagent"
```

The code-review agent will:
1. Systematically analyze the code using Read, Grep, Glob tools
2. Identify issues by severity (Critical/High/Medium/Low)
3. Provide specific file:line references
4. Offer concrete solutions with code examples
5. Delegate specialized checks to appropriate subagents
6. Deliver a prioritized, actionable report

If no specific files are mentioned, review the most recently modified files or ask the user what they'd like reviewed.
