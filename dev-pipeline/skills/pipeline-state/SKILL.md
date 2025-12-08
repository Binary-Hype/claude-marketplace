---
name: pipeline-state
description: Manages development pipeline state tracking. Automatically invoked when working with the dev-pipeline plugin to read/write .pipeline/state.json and track progress through the 4-stage workflow.
---

# Pipeline State Skill

Manages the `.pipeline/` directory and state tracking for the dev-pipeline workflow.

## State File Structure

Location: `.pipeline/state.json`

```json
{
  "feature": "Feature Name",
  "stage": 1,
  "started_at": "2024-01-01T00:00:00Z",
  "stages": {
    "1": { "status": "approved", "completed_at": "..." },
    "2": { "status": "in_progress", "started_at": "..." },
    "3": { "status": "pending" },
    "4": { "status": "pending" }
  }
}
```

## Stage Status Values

- `pending` - Not yet started
- `in_progress` - Currently active
- `approved` - Completed and approved
- `revision` - Returned for changes

## Operations

### Initialize Pipeline

When `/feature` command is invoked:
1. Create `.pipeline/` directory
2. Create `state.json` with stage 1 in_progress
3. Create empty `spec.md`, `tech-spec.md`, `review.md`

### Read State

Before any pipeline operation:
```bash
cat .pipeline/state.json 2>/dev/null
```

### Update State

When advancing stages:
```bash
# Read, modify, write back
```

### Check Stage

Determine current stage before processing commands.

## Pipeline Files

| File | Created In | Purpose |
|------|------------|---------|
| `state.json` | Stage 1 | Pipeline state |
| `spec.md` | Stage 1 | Requirements |
| `tech-spec.md` | Stage 2 | Technical spec |
| `changelog.md` | Stage 3 | Implementation log |
| `review.md` | Stage 4 | Review report |

## Stage Indicators

Always display current stage:
```
[PIPELINE: Stage X/4 - Stage Name Emoji]
```

Stage names and emojis:
- Stage 1: Spec Generation 📋
- Stage 2: Technical Refinement 🏗️
- Stage 3: Implementation 💻
- Stage 4: Review ✅
