## v1.4.2

### Optimized skill loading for faster context usage

All 8 skills now stay under the recommended 500-line `SKILL.md` limit. Detailed reference material, examples, and framework-specific patterns have been extracted into dedicated supporting files that Claude loads on demand — keeping the core skill definitions lean while preserving all content.

### What changed

Five oversized skills were restructured:

| Skill | Before | After | Extracted to |
|---|---|---|---|
| api-documentation | 1,014 lines | 244 lines | `reference.md`, `examples.md` |
| test-generator | 987 lines | 358 lines | `reference.md`, `examples.md` |
| refactoring-assistant | 922 lines | 325 lines | `laravel-patterns.md`, `examples.md` |
| api-design | 568 lines | 431 lines | `implementation-patterns.md` |
| time-estimation | 533 lines | 345 lines | `examples.md` |

### Why this matters

- **Faster skill activation** — smaller `SKILL.md` files load quicker and consume less context
- **No content lost** — all examples, reference templates, and Laravel/PHP patterns are still available in supporting files alongside each skill
- **Better context efficiency** — Claude only loads supporting files when the task actually needs them

### New files (8)

```
skills/api-design/implementation-patterns.md
skills/api-documentation/reference.md
skills/api-documentation/examples.md
skills/refactoring-assistant/laravel-patterns.md
skills/refactoring-assistant/examples.md
skills/test-generator/reference.md
skills/test-generator/examples.md
skills/time-estimation/examples.md
```

**Full Changelog**: https://github.com/Binary-Hype/claude-marketplace/compare/v1.4.1...v1.4.2
