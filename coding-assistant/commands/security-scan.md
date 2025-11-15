---
description: Scan code for security vulnerabilities including OWASP Top 10, SQL injection, XSS, CSRF, and authentication flaws
---

# Security Scan

Invoke the security-scanner subagent to perform a comprehensive security audit.

## Usage
Use the Task tool with `subagent_type="coding-assistant:security-scanner"` and specify files or scope in the prompt.

The agent scans for OWASP Top 10 vulnerabilities, SQL injection, XSS, CSRF, authentication flaws, hardcoded credentials, mass assignment, and insecure configurations.

## Output
Prioritized security report with severity levels, attack scenarios, and secure remediation examples with OWASP references.
