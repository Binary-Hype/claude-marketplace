---
name: refactoring-assistant
description: Identifies code smells and suggests refactoring improvements using proven design patterns. Helps improve code quality, maintainability, and testability with Laravel-specific refactoring guidance.
---

# Refactoring Assistant

An intelligent skill that analyzes your code to identify improvement opportunities, code smells, and anti-patterns, then provides actionable refactoring suggestions using industry best practices and Laravel-specific patterns.

## When to Use This Skill

Use this skill when:
- You have legacy code that needs improvement
- Code is becoming difficult to maintain or test
- You notice repetitive patterns across your codebase
- Methods or classes are growing too large
- You want to apply SOLID principles to existing code
- You're preparing code for a major feature addition
- Code review reveals complexity or maintainability issues
- You want to improve code readability and structure
- You need to extract reusable components or services

## What This Skill Does

This skill provides comprehensive refactoring guidance by:

1. **Code Smell Detection**
   - Long methods (>50 lines) and god classes
   - Duplicate code and similar patterns
   - Nested conditionals and complex logic
   - Feature envy (methods using other class data heavily)
   - Primitive obsession (not using value objects)
   - Dead code and unused parameters
   - Magic numbers and unclear variable names

2. **Laravel-Specific Analysis**
   - Fat controllers that should use Actions or Services
   - Complex Eloquent queries needing Query Scopes
   - Repeated validation logic needing Form Requests
   - Missing resource classes for API transformations
   - Opportunities for Observer patterns
   - Policy extraction opportunities
   - Job/Event extraction for async operations

3. **Design Pattern Recommendations**
   - **Action Pattern**: Single-responsibility classes for business logic
   - **Repository Pattern**: Database abstraction layers
   - **Strategy Pattern**: Interchangeable algorithms
   - **Factory Pattern**: Complex object creation
   - **Observer Pattern**: Event-driven architecture
   - **Decorator Pattern**: Adding behavior dynamically
   - **Service Pattern**: Coordinating multiple operations

4. **Refactoring Strategies**
   - Extract Method: Break down long methods
   - Extract Class: Split god classes
   - Replace Conditional with Polymorphism
   - Introduce Parameter Object
   - Replace Magic Numbers with Constants
   - Move Method to appropriate class
   - Rename for clarity

5. **Code Quality Improvements**
   - Improve naming conventions
   - Add type hints and return types
   - Enhance error handling
   - Reduce cyclomatic complexity
   - Improve testability through dependency injection
   - Add PHPDoc for complex logic

## How to Use

Simply invoke the skill when you want to improve existing code:

```
/refactoring-assistant
```

Or ask for specific refactoring help:

```
/refactoring-assistant Analyze my UserController for refactoring opportunities
```

```
I have a complex method that's hard to test. Can you help refactor it?
```

```
/refactoring-assistant Help me apply the Action pattern to this controller
```

## Refactoring Process

When this skill is invoked, it follows this systematic approach:

1. **Understand the Scope**
   - Identify which files need refactoring
   - Read the target code thoroughly
   - Understand the business logic and purpose
   - Check for related files and dependencies

2. **Analyze Code Quality**
   - Measure method and class complexity
   - Identify code smells and anti-patterns
   - Check for SOLID principle violations
   - Find duplicated or similar code patterns
   - Review Laravel conventions adherence

3. **Prioritize Issues**
   - **Critical**: Code that blocks testing or causes bugs
   - **High**: Significant complexity or maintainability issues
   - **Medium**: Code smells that reduce readability
   - **Low**: Minor improvements and naming conventions

4. **Generate Refactoring Plan**
   - List specific refactorings with rationale
   - Show before/after code examples
   - Explain benefits of each change
   - Highlight risks or considerations
   - Provide step-by-step implementation

5. **Validate with Code Review**
   - After refactoring suggestions, optionally invoke **code-review** subagent
   - Ensures refactored code maintains quality standards
   - Verifies no security or performance regressions

## Output Format

The skill provides structured refactoring recommendations:

```
## Refactoring Analysis: [FileName]

📊 Code Quality Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lines of Code: [X]
Methods Analyzed: [Y]
Issues Found: [Z]

Priority Breakdown:
🔴 Critical: [N]
🟠 High: [N]
🟡 Medium: [N]
⚪ Low: [N]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔴 Critical Refactorings

### 1. [Issue Title] - [Method/Class:Line]

**Problem**:
[Clear description of the code smell or issue]

**Current Code**:
```php
[Problematic code snippet]
```

**Impact**:
- Makes testing difficult/impossible
- Creates tight coupling
- Violates SOLID principles
- [Other specific impacts]

**Refactoring Strategy**: [Pattern name]

**Refactored Code**:
```php
[Improved code example]
```

**Benefits**:
- ✓ Improved testability
- ✓ Better separation of concerns
- ✓ Follows Laravel conventions
- ✓ [Other benefits]

**Migration Steps**:
1. [Step by step instructions]
2. [How to safely apply changes]
3. [Testing recommendations]

---

## 🟠 High Priority Refactorings

[Same structure as above]

---

## 🟡 Medium Priority Refactorings

[Same structure as above]

---

## ⚪ Low Priority Refactorings

[Same structure as above]

---

## 📋 Refactoring Checklist

- [ ] Extract [method/class name]
- [ ] Create [Action/Service/Policy]
- [ ] Add type hints to [methods]
- [ ] Rename [variables] for clarity
- [ ] Move [logic] to appropriate class
- [ ] Add tests for refactored code

## 🎯 Overall Recommendations

1. **Immediate Actions** (Critical/High):
   - [Specific refactorings that should be done first]

2. **Next Steps** (Medium):
   - [Follow-up improvements]

3. **Future Considerations** (Low):
   - [Nice-to-have improvements]

## 🔗 Integration Suggestions

- Run **code-review** after refactoring to verify quality
- Use **commit-message** skill to document refactoring changes
- Consider **test-generator** to add tests for refactored code
```

This skill also includes Laravel-specific refactoring patterns covering Actions, Query Scopes, Form Requests, API Resources, and Observers. See [laravel-patterns.md](laravel-patterns.md) for detailed before/after examples.

## Tips for Effective Refactoring

1. **Start Small**
   - Refactor one method or class at a time
   - Ensure tests pass after each refactoring
   - Commit frequently with descriptive messages

2. **Write Tests First**
   - Add tests for current behavior before refactoring
   - Tests ensure refactoring doesn't break functionality
   - Use **test-generator** skill to create comprehensive tests

3. **Use Laravel Patterns**
   - Prefer Actions over fat controllers
   - Use Form Requests for validation
   - Leverage Eloquent scopes for query logic
   - Apply Observers for model events

4. **Maintain Backwards Compatibility**
   - Keep public APIs stable during refactoring
   - Use deprecation warnings if changing interfaces
   - Update documentation as you refactor

5. **Validate with Code Review**
   - Use **code-review** subagent after refactoring
   - Ensure no security or performance regressions
   - Verify Laravel best practices are followed

6. **Document Changes**
   - Use **commit-message** skill for clear commits
   - Update inline comments for complex logic
   - Note architectural decisions in docs

## Integration with Other Skills

This skill works well with:

- **code-review**: Validate refactored code meets quality standards
- **test-generator**: Create tests for refactored components
- **commit-message**: Document refactoring changes clearly
- **laravel-best-practices**: Ensure refactoring follows Laravel conventions

## Common Refactoring Red Flags

Watch for these code smells that signal refactoring needs:

1. **Method Length**: Methods over 50 lines
2. **Class Size**: Classes over 300 lines
3. **Parameter Lists**: Methods with 4+ parameters
4. **Nested Conditions**: More than 2 levels deep
5. **Duplicate Code**: Same logic in 3+ places
6. **God Classes**: Classes doing too many things
7. **Feature Envy**: Methods using other class data excessively
8. **Long Parameter Lists**: Consider parameter objects
9. **Primitive Obsession**: Use value objects for domain concepts
10. **Comments**: Over-commenting to explain complex code (refactor instead)

## Limitations

- Refactoring suggestions require reading and understanding business logic
- Automated refactoring can't account for all business rules
- Some refactorings may require database changes or migrations
- Complex legacy code may need incremental refactoring over time
- Always test thoroughly after applying refactorings

## Success Criteria

Refactoring is successful when:

- ✓ Code is easier to read and understand
- ✓ Tests pass after refactoring
- ✓ New features are easier to add
- ✓ Code follows SOLID principles
- ✓ Laravel conventions are properly applied
- ✓ Business logic is properly separated from infrastructure
- ✓ Code-review subagent finds no new critical issues

## Additional resources

- For Laravel-specific refactoring patterns (Action, Scopes, Form Requests, Resources, Observers), see [laravel-patterns.md](laravel-patterns.md)
- For complete refactoring session examples, see [examples.md](examples.md)

## Important Notes

1. **Always Test**: Never refactor without tests protecting functionality
2. **Incremental Changes**: Small, safe refactorings are better than large rewrites
3. **Business Logic First**: Understand what the code does before refactoring
4. **Team Review**: Complex refactorings benefit from team discussion
5. **Performance**: Profile before/after to ensure no performance regression
6. **Laravel Conventions**: Follow framework patterns for consistency

Remember: The goal of refactoring is to improve code quality without changing behavior. Use the **code-review** subagent to validate your refactored code maintains quality standards.
