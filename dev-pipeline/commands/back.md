---
description: Return to the previous pipeline stage for revisions
---

# Back Command

Return to the previous stage in the pipeline for revisions.

## Execution

1. Read `.pipeline/state.json`
2. If no pipeline exists, inform user: "No active pipeline."
3. If already at stage 1, inform user: "Already at first stage. Cannot go back further."

## Stage Return

1. Get current stage number
2. Set current stage status to "pending"
3. Set previous stage status to "in_progress"
4. Decrement stage number in state.json

## Display

```
↩️ Returned to Stage [N]

[PIPELINE: Stage N/4 - Stage Name Emoji]
Agent: [Agent Name]

What would you like to revise?
```

## Invoke Previous Agent

- Stage 1: Invoke `product-owner` agent
- Stage 2: Invoke `lead-developer` agent
- Stage 3: Invoke `senior-developer` agent

## Notes

- The previous stage's documentation remains in `.pipeline/`
- Agent should ask what specific changes are needed
- Changes should be tracked/appended to existing docs
