---
description: Scan code for security vulnerabilities including OWASP Top 10, SQL injection, XSS, CSRF, and authentication flaws
---

# Security Scan

Invoke the security-scanner subagent to perform a comprehensive security audit of your code.

You are being asked to conduct a security vulnerability scan. Use the Task tool to invoke the security-scanner subagent:

```
Task: subagent_type="security-scanner"
      prompt="Perform a comprehensive security scan of [specify files or scope]. Check for:
      - OWASP Top 10 vulnerabilities
      - SQL Injection (raw queries, string concatenation)
      - XSS (unescaped output in Blade templates)
      - CSRF (missing tokens)
      - Authentication and authorization flaws
      - Hardcoded credentials and secrets
      - Mass assignment vulnerabilities
      - Insecure configurations"
```

The security-scanner agent will:
1. Systematically scan for all OWASP Top 10 categories
2. Identify Laravel-specific security issues
3. Categorize findings by severity (Critical/High/Medium/Low)
4. Explain attack scenarios and impact
5. Provide secure code examples for remediation
6. Reference OWASP documentation
7. Deliver a prioritized security report

If no specific files are mentioned, scan the entire application focusing on controllers, models, routes, and views.
