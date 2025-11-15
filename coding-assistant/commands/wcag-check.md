---
description: Check code for WCAG 2.2 accessibility compliance across all 86 success criteria (A, AA, AAA levels)
---

# WCAG Accessibility Check

Invoke the wcag-compliance subagent to perform a comprehensive WCAG 2.2 accessibility audit.

You are being asked to check for accessibility compliance. Use the Task tool to invoke the wcag-compliance subagent:

```
Task: subagent_type="wcag-compliance"
      prompt="Analyze [specify files or folder patterns] for WCAG 2.2 compliance. Check all conformance levels (A, AA, AAA) and provide detailed findings with:
      - All 86 WCAG 2.2 success criteria
      - Framework-specific issues (Laravel Blade, React, Vue)
      - Specific file:line references
      - Code examples for fixes
      - Official W3C WCAG documentation references"
```

The wcag-compliance agent will:
1. Analyze HTML, JSX, TSX, Blade, and Vue files
2. Check all 86 WCAG 2.2 success criteria (including 9 new 2.2 criteria)
3. Categorize by conformance level (A, AA, AAA)
4. Provide detailed remediation guidance
5. Include code examples for fixes
6. Reference official WCAG documentation
7. Deliver a comprehensive accessibility report

If no specific files are mentioned, analyze all frontend templates and components.
