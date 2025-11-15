---
description: Identify code smells and suggest refactoring improvements using design patterns and Laravel best practices
---

# Refactoring Assistant

Invoke the refactoring-assistant skill to analyze code and suggest improvements.

You are being asked to help refactor code. Follow the refactoring-assistant skill workflow:

1. **Understand the Scope**
   - Identify which files need refactoring
   - Read the target code thoroughly
   - Understand the business logic and purpose
   - Check for related files and dependencies

2. **Analyze Code Quality**
   - Measure method and class complexity
   - Identify code smells (long methods, god classes, duplicate code)
   - Check for SOLID principle violations
   - Find duplicated or similar code patterns
   - Review Laravel conventions adherence

3. **Prioritize Issues**
   - **Critical**: Code blocking testing or causing bugs
   - **High**: Significant complexity or maintainability issues
   - **Medium**: Code smells reducing readability
   - **Low**: Minor improvements and naming conventions

4. **Generate Refactoring Plan**
   - List specific refactorings with rationale
   - Show before/after code examples
   - Explain benefits of each change
   - Highlight risks or considerations
   - Provide step-by-step implementation

5. **Laravel-Specific Patterns**
   - **Fat Controller → Action Pattern**: Extract business logic to single-responsibility classes
   - **Complex Queries → Query Scopes**: Reusable Eloquent scopes
   - **Validation Logic → Form Requests**: Dedicated validation classes
   - **Raw Data → API Resources**: Controlled API responses
   - **Model Callbacks → Observers**: Extract event listeners

**Focus Areas**:
- Extract methods/classes from large code blocks
- Apply design patterns (Action, Strategy, Factory, Observer)
- Improve naming for clarity
- Reduce cyclomatic complexity
- Add type hints and return types
- Enhance testability through dependency injection

**Output Format**:
- Code quality summary
- Prioritized refactoring recommendations (Critical/High/Medium/Low)
- Before/after code examples
- Benefits and migration steps
- Refactoring checklist
- Integration with code-review, commit-message, test-generator

After presenting refactoring suggestions, optionally:
- Run **code-review** to verify quality
- Use **test-generator** to add tests for refactored code
- Use **commit-message** to document changes
