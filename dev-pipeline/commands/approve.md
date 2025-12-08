---
description: Approve the current pipeline stage and proceed to the next stage
---

# Approve Command

Approve the current stage and advance the pipeline to the next stage.

## Execution

1. Read `.pipeline/state.json`
2. If no pipeline exists, inform user: "No active pipeline to approve."
3. Get current stage number

## Stage Transitions

### From Stage 1 (Spec) → Stage 2 (Technical)

1. Verify `.pipeline/spec.md` exists and is complete
2. Update state.json: stage 1 → approved, stage 2 → in_progress
3. Display:
```
✅ Stage 1 (Spec Generation) approved!

[PIPELINE: Stage 2/4 - Technical Refinement 🏗️]
```
4. Invoke the `lead-developer` agent

### From Stage 2 (Technical) → Stage 3 (Implementation)

1. Verify `.pipeline/tech-spec.md` exists
2. Update state.json: stage 2 → approved, stage 3 → in_progress
3. Display:
```
✅ Stage 2 (Technical Refinement) approved!

[PIPELINE: Stage 3/4 - Implementation 💻]
```
4. Invoke the `senior-developer` agent

### From Stage 3 (Implementation) → Stage 4 (Review)

1. Update state.json: stage 3 → approved, stage 4 → in_progress
2. Display:
```
✅ Stage 3 (Implementation) approved!

[PIPELINE: Stage 4/4 - Review ✅]
```
3. Invoke the `code-reviewer` agent

### From Stage 4 (Review) → Complete

1. Verify `.pipeline/review.md` exists (code review complete)
2. Verify `.pipeline/ui-review.md` exists (UI verification complete)
3. Check both reports for approval status:
   - If EITHER has 🔴 BLOCKED status, inform user and do NOT complete
   - If both are 🟢 APPROVED or 🟡 NEEDS CHANGES (minor only), proceed
4. Update state.json: stage 4 → approved, stage → 5 (complete)
5. Display:
```
🎉 Pipeline completed for: [feature name]

All stages approved! Feature is ready for merge.

Summary:
- Spec: .pipeline/spec.md
- Tech Spec: .pipeline/tech-spec.md
- UI Baseline: .pipeline/ui-baseline/
- Code Review: .pipeline/review.md
- UI Review: .pipeline/ui-review.md
```
