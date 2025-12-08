---
description: Show current pipeline status and stage information
---

# Stage Status Command

Display the current state of the development pipeline.

## Execution

1. Read `.pipeline/state.json`
2. If no pipeline exists, inform user: "No active pipeline. Use `/feature <name>` to start one."
3. Display status in this format:

```
═══════════════════════════════════════════════════
Feature: [feature name]
Started: [timestamp]
═══════════════════════════════════════════════════

[indicator] Stage 1: Spec Generation 📋 - [STATUS]
[indicator] Stage 2: Technical Refinement 🏗️ - [STATUS]
[indicator] Stage 3: Implementation 💻 - [STATUS]
[indicator] Stage 4: Review ✅ - [STATUS]

═══════════════════════════════════════════════════

Current: [PIPELINE: Stage X/4 - Stage Name Emoji]
Agent: [Current Agent Name]
```

**Indicators:**
- `▶️` = Current stage (IN PROGRESS)
- `✅` = Completed/Approved
- `⬜` = Pending

## Available Commands

After displaying status, remind user of available commands:
- `/approve` - Approve current stage and proceed
- `/back` - Return to previous stage
- `/abort` - Cancel the pipeline
