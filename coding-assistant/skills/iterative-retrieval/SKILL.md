---
name: iterative-retrieval
description: Pattern for progressively refining context retrieval to solve the subagent context problem. Uses a 4-phase DISPATCH-EVALUATE-REFINE-LOOP cycle with max 3 iterations.
---

# Iterative Retrieval Pattern

Solves the "context problem" in multi-agent workflows where subagents don't know what context they need until they start working.

## When to Activate

- Spawning subagents that need codebase context they cannot predict upfront
- Building multi-agent workflows where context is progressively refined
- Encountering "context too large" or "missing context" failures in agent tasks
- Designing RAG-like retrieval pipelines for code exploration
- Optimizing token usage in agent orchestration

## The Problem

Subagents are spawned with limited context. They don't know:
- Which files contain relevant code
- What patterns exist in the codebase
- What terminology the project uses

Standard approaches fail:
- **Send everything**: Exceeds context limits
- **Send nothing**: Agent lacks critical information
- **Guess what's needed**: Often wrong

## The Solution: Iterative Retrieval

A 4-phase loop that progressively refines context:

```
+---------------------------------------------+
|                                             |
|   +----------+      +----------+            |
|   | DISPATCH |----->| EVALUATE |            |
|   +----------+      +----------+            |
|        ^                  |                 |
|        |                  v                 |
|   +----------+      +----------+            |
|   |   LOOP   |<-----+  REFINE  |            |
|   +----------+      +----------+            |
|                                             |
|        Max 3 cycles, then proceed           |
+---------------------------------------------+
```

### Phase 1: DISPATCH

Initial broad query to gather candidate files:

```php
// Start with high-level intent
$initialQuery = [
    'patterns' => ['app/**/*.php', 'src/**/*.php'],
    'keywords' => ['authentication', 'user', 'session'],
    'excludes' => ['*Test.php', '*_test.php'],
];

// Dispatch to retrieval agent
$candidates = retrieveFiles($initialQuery);
```

### Phase 2: EVALUATE

Assess retrieved content for relevance:

```php
function evaluateRelevance(array $files, string $task): array
{
    return array_map(fn (array $file) => [
        'path' => $file['path'],
        'relevance' => scoreRelevance($file['content'], $task),
        'reason' => explainRelevance($file['content'], $task),
        'missing_context' => identifyGaps($file['content'], $task),
    ], $files);
}
```

Scoring criteria:
- **High (0.8-1.0)**: Directly implements target functionality
- **Medium (0.5-0.7)**: Contains related patterns or types
- **Low (0.2-0.4)**: Tangentially related
- **None (0-0.2)**: Not relevant, exclude

### Phase 3: REFINE

Update search criteria based on evaluation:

```php
function refineQuery(array $evaluation, array $previousQuery): array
{
    $irrelevant = array_filter($evaluation, fn ($e) => $e['relevance'] < 0.2);

    return [
        // Add new patterns discovered in high-relevance files
        'patterns' => array_merge(
            $previousQuery['patterns'],
            extractPatterns($evaluation)
        ),

        // Add terminology found in codebase
        'keywords' => array_merge(
            $previousQuery['keywords'],
            extractKeywords($evaluation)
        ),

        // Exclude confirmed irrelevant paths
        'excludes' => array_merge(
            $previousQuery['excludes'],
            array_map(fn ($e) => $e['path'], $irrelevant)
        ),

        // Target specific gaps
        'focus_areas' => array_values(array_unique(
            array_merge(...array_map(fn ($e) => $e['missing_context'], $evaluation))
        )),
    ];
}
```

### Phase 4: LOOP

Repeat with refined criteria (max 3 cycles):

```php
function iterativeRetrieve(string $task, int $maxCycles = 3): array
{
    $query = createInitialQuery($task);
    $bestContext = [];

    for ($cycle = 0; $cycle < $maxCycles; $cycle++) {
        $candidates = retrieveFiles($query);
        $evaluation = evaluateRelevance($candidates, $task);

        // Check if we have sufficient context
        $highRelevance = array_filter($evaluation, fn ($e) => $e['relevance'] >= 0.7);

        if (count($highRelevance) >= 3 && !hasCriticalGaps($evaluation)) {
            return $highRelevance;
        }

        // Refine and continue
        $query = refineQuery($evaluation, $query);
        $bestContext = mergeContext($bestContext, $highRelevance);
    }

    return $bestContext;
}
```

## Practical Examples

### Example 1: Bug Fix Context

```
Task: "Fix the authentication token expiry bug"

Cycle 1:
  DISPATCH: Search for "token", "auth", "expiry" in app/**
  EVALUATE: Found AuthService.php (0.9), TokenManager.php (0.8), User.php (0.3)
  REFINE: Add "refresh", "jwt" keywords; exclude User.php

Cycle 2:
  DISPATCH: Search refined terms
  EVALUATE: Found SessionMiddleware.php (0.95), JwtHelper.php (0.85)
  REFINE: Sufficient context (2 high-relevance files)

Result: AuthService.php, TokenManager.php, SessionMiddleware.php, JwtHelper.php
```

### Example 2: Feature Implementation

```
Task: "Add rate limiting to API endpoints"

Cycle 1:
  DISPATCH: Search "rate", "limit", "api" in app/Http/**
  EVALUATE: No matches - codebase uses "throttle" terminology
  REFINE: Add "throttle", "middleware" keywords

Cycle 2:
  DISPATCH: Search refined terms
  EVALUATE: Found ThrottleRequests.php (0.9), Kernel.php (0.7)
  REFINE: Need route definitions

Cycle 3:
  DISPATCH: Search "Route::", "middleware" in routes/**
  EVALUATE: Found api.php (0.8)
  REFINE: Sufficient context

Result: ThrottleRequests.php, Kernel.php, routes/api.php
```

## Integration with Agents

Use in agent prompts:

```markdown
When retrieving context for this task:
1. Start with broad keyword search
2. Evaluate each file's relevance (0-1 scale)
3. Identify what context is still missing
4. Refine search criteria and repeat (max 3 cycles)
5. Return files with relevance >= 0.7
```

## Best Practices

1. **Start broad, narrow progressively** - Don't over-specify initial queries
2. **Learn codebase terminology** - First cycle often reveals naming conventions
3. **Track what's missing** - Explicit gap identification drives refinement
4. **Stop at "good enough"** - 3 high-relevance files beats 10 mediocre ones
5. **Exclude confidently** - Low-relevance files won't become relevant
