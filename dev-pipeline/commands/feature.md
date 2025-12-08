---
description: Start a new feature development pipeline with 4-stage workflow (Spec → Technical → Implementation → Review)
arguments:
  - name: feature_name
    description: Name or description of the feature to implement
    required: true
---

# Feature Pipeline Command

Start a structured 4-stage development pipeline for the requested feature.

## Pipeline Initialization

1. Create `.pipeline/` directory if it doesn't exist
2. Create `.pipeline/state.json` with initial state:
```json
{
  "feature": "$ARGUMENTS",
  "stage": 1,
  "started_at": "<current ISO timestamp>",
  "stages": {
    "1": { "status": "in_progress" },
    "2": { "status": "pending" },
    "3": { "status": "pending" },
    "4": { "status": "pending" }
  }
}
```

## Stage 1: Spec Generation

Invoke the `product-owner` agent to gather requirements.

**Display this header:**
```
[PIPELINE: Stage 1/4 - Spec Generation 📋]
Feature: $ARGUMENTS
```

**Instructions for Product Owner agent:**
- Ask clarifying questions about the feature (minimum 5 questions before any technical thinking)
- Cover: user story, acceptance criteria, edge cases, UI/UX, data requirements, integrations
- Document everything in `.pipeline/spec.md`
- Present summary and wait for `/approve` command

**CRITICAL RULES:**
- Do NOT proceed to Stage 2 without explicit `/approve` from user
- Do NOT write any code or make technical decisions in this stage
- Focus purely on WHAT, not HOW
