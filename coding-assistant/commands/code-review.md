---
description: Perform comprehensive code review checking quality, security, performance, and Laravel best practices
---

# Code Review

Invoke the code-review subagent to perform a comprehensive code review.

## Usage
Use the Task tool with `subagent_type="coding-assistant:code-review"` and specify files or scope in the prompt.

The agent reviews code for quality, security vulnerabilities, performance issues, and Laravel conventions. Automatically delegates specialized checks to security-scanner, wcag-compliance, and laravel-best-practices subagents.

## Output
Prioritized report with severity levels, file:line references, and actionable solutions with code examples.
