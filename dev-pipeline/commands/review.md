---
description: Start a standalone code review (skips to Stage 4) or review specific files/changes
arguments:
  - name: target
    description: Optional - specific files, commit range, or PR to review
    required: false
---

# Review Command

Start a code review session, either as part of an existing pipeline or standalone.

## Execution Modes

### Mode 1: Active Pipeline Exists

If `.pipeline/state.json` exists and stage < 4:
```
⚠️ Active pipeline at Stage [N]. 
Use `/approve` to progress naturally, or specify files to review independently.
```

### Mode 2: Standalone Review (No Pipeline or Pipeline Complete)

1. Create or update `.pipeline/state.json` for review-only mode
2. Set stage to 4
3. Invoke `code-reviewer` agent

## Review Targets

If `$ARGUMENTS` provided:
- File paths: Review specific files
- Commit range (e.g., `HEAD~3..HEAD`): Review recent commits
- Branch comparison (e.g., `main..feature`): Review branch diff

If no arguments:
- Review all uncommitted changes
- If no changes, ask user what to review

## Display

```
[PIPELINE: Stage 4/4 - Review ✅]
Mode: Standalone Review

Target: [files/commits/changes being reviewed]

Starting comprehensive code review...
```

## Invoke Agent

Invoke `code-reviewer` agent with the review target context.

The review will check:
- Security vulnerabilities
- Clean architecture compliance  
- WCAG 2.1 AA accessibility
- Performance issues
- Error handling
- Input validation
