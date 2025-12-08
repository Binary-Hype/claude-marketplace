---
description: Cancel the current pipeline and archive its state
---

# Abort Command

Cancel the current pipeline and archive its state.

## Execution

1. Read `.pipeline/state.json`
2. If no pipeline exists, inform user: "No active pipeline to abort."

## Archive Process

1. Create archive filename: `.pipeline/aborted_[timestamp].json`
2. Copy current state.json to archive with added `aborted_at` field
3. Delete `.pipeline/state.json`

## Display

```
🛑 Pipeline aborted: [feature name]

State archived to: .pipeline/aborted_[timestamp].json

The following files remain for reference:
- .pipeline/spec.md (if created)
- .pipeline/tech-spec.md (if created)

Use `/feature <name>` to start a new pipeline.
```

## Confirmation

Before aborting, ask for confirmation:
```
⚠️ Are you sure you want to abort the pipeline for "[feature name]"?
Current stage: [N]/4 - [Stage Name]

This will cancel all progress. Type "yes" to confirm or anything else to cancel.
```

Only proceed with abort if user confirms with "yes".
