---
name: continuous-learning
description: Instinct-based learning system that observes sessions via hooks, creates atomic instincts with confidence scoring, and evolves them into skills/commands/agents.
---

# Continuous Learning - Instinct-Based Architecture

An advanced learning system that turns your Claude Code sessions into reusable knowledge through atomic "instincts" - small learned behaviors with confidence scoring.

## When to Activate

- Setting up automatic learning from Claude Code sessions
- Configuring instinct-based behavior extraction via hooks
- Tuning confidence thresholds for learned behaviors
- Reviewing, exporting, or importing instinct libraries
- Evolving instincts into full skills, commands, or agents

## The Instinct Model

An instinct is a small learned behavior:

```yaml
---
id: prefer-action-pattern
trigger: "when writing business logic in Laravel"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# Prefer Action Pattern

## Action
Use single-responsibility Action classes over fat controllers.

## Evidence
- Observed 5 instances of Action pattern preference
- User corrected service-based approach to Action on 2025-01-15
```

**Properties:**
- **Atomic** — one trigger, one action
- **Confidence-weighted** — 0.3 = tentative, 0.9 = near certain
- **Domain-tagged** — code-style, testing, git, debugging, workflow, etc.
- **Evidence-backed** — tracks what observations created it

## How It Works

```
Session Activity
      |
      | Hooks capture prompts + tool use (100% reliable)
      v
+---------------------------------------------+
|         observations.jsonl                   |
|   (prompts, tool calls, outcomes)            |
+---------------------------------------------+
      |
      | Observer agent reads (background, Haiku)
      v
+---------------------------------------------+
|          PATTERN DETECTION                   |
|   - User corrections -> instinct            |
|   - Error resolutions -> instinct           |
|   - Repeated workflows -> instinct          |
+---------------------------------------------+
      |
      | Creates/updates
      v
+---------------------------------------------+
|         instincts/personal/                  |
|   - prefer-action-pattern.md (0.7)          |
|   - always-test-first.md (0.9)              |
|   - use-form-requests.md (0.6)              |
+---------------------------------------------+
      |
      | /evolve clusters
      v
+---------------------------------------------+
|              evolved/                        |
|   - commands/new-feature.md                  |
|   - skills/testing-workflow.md               |
|   - agents/refactor-specialist.md            |
+---------------------------------------------+
```

## Quick Start

### 1. Enable Observation Hooks

Add to your `~/.claude/settings.json`.

**If installed as a plugin** (recommended):

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning/hooks/observe.sh post"
      }]
    }]
  }
}
```

**If installed manually** to `~/.claude/skills`:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/hooks/observe.sh post"
      }]
    }]
  }
}
```

### 2. Initialize Directory Structure

The Python CLI will create these automatically, but you can also create them manually:

```bash
mkdir -p ~/.claude/homunculus/{instincts/{personal,inherited},evolved/{agents,skills,commands}}
touch ~/.claude/homunculus/observations.jsonl
```

### 3. Use the Instinct Commands

```bash
/instinct-status     # Show learned instincts with confidence scores
/evolve              # Cluster related instincts into skills/commands
/instinct-export     # Export instincts for sharing
/instinct-import     # Import instincts from others
```

## Commands

| Command | Description |
|---------|-------------|
| `/instinct-status` | Show all learned instincts with confidence |
| `/evolve` | Cluster related instincts into skills/commands |
| `/instinct-export` | Export instincts for sharing |
| `/instinct-import <file>` | Import instincts from others |

## Configuration

Edit `config.json`:

```json
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "store_path": "~/.claude/homunculus/observations.jsonl",
    "max_file_size_mb": 10,
    "archive_after_days": 7
  },
  "instincts": {
    "personal_path": "~/.claude/homunculus/instincts/personal/",
    "inherited_path": "~/.claude/homunculus/instincts/inherited/",
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.05
  },
  "observer": {
    "enabled": true,
    "model": "haiku",
    "run_interval_minutes": 5,
    "patterns_to_detect": [
      "user_corrections",
      "error_resolutions",
      "repeated_workflows",
      "tool_preferences"
    ]
  },
  "evolution": {
    "cluster_threshold": 3,
    "evolved_path": "~/.claude/homunculus/evolved/"
  }
}
```

## File Structure

```
~/.claude/homunculus/
├── identity.json           # Your profile, technical level
├── observations.jsonl      # Current session observations
├── observations.archive/   # Processed observations
├── instincts/
│   ├── personal/           # Auto-learned instincts
│   └── inherited/          # Imported from others
└── evolved/
    ├── agents/             # Generated specialist agents
    ├── skills/             # Generated skills
    └── commands/           # Generated commands
```

## Confidence Scoring

Confidence evolves over time:

| Score | Meaning | Behavior |
|-------|---------|----------|
| 0.3 | Tentative | Suggested but not enforced |
| 0.5 | Moderate | Applied when relevant |
| 0.7 | Strong | Auto-approved for application |
| 0.9 | Near-certain | Core behavior |

**Confidence increases** when:
- Pattern is repeatedly observed
- User doesn't correct the suggested behavior
- Similar instincts from other sources agree

**Confidence decreases** when:
- User explicitly corrects the behavior
- Pattern isn't observed for extended periods
- Contradicting evidence appears

## Why Hooks vs Skills for Observation?

Hooks fire **100% of the time**, deterministically. This means:
- Every tool call is observed
- No patterns are missed
- Learning is comprehensive

Skills are probabilistic (fire ~50-80% based on Claude's judgment), making them unreliable for observation.

## Backward Compatibility

Compatible with v1 learning:
- Existing `~/.claude/skills/learned/` skills still work
- Stop hook still runs (but now also feeds into v2)
- Gradual migration path: run both in parallel

## Privacy

- Observations stay **local** on your machine
- Only **instincts** (patterns) can be exported
- No actual code or conversation content is shared
- You control what gets exported
