---
name: time-estimation
description: Estimates development time for features by analyzing complexity, dependencies, and project structure. Provides manual vs AI-assisted development time comparisons showing hours saved when using AI tools.
---

# Feature Time Estimation Skill

An intelligent skill that provides realistic development time estimates for features, both for traditional manual development and AI-assisted development. Shows exactly how much time and effort AI tools can save on your projects.

## When to Use This Skill

Use this skill when:
- Planning feature development timelines
- Creating sprint estimates and roadmaps
- Pitching projects to stakeholders with time requirements
- Comparing manual vs AI-assisted development ROI
- Budgeting development resources
- Evaluating feature complexity before commitment
- Making build vs buy decisions
- Estimating greenfield (new) projects
- Estimating additions to existing codebases

## What This Skill Does

This skill provides comprehensive time estimation by:

1. **Feature Analysis**
   - Breaks down features into component tasks
   - Analyzes technical complexity and dependencies
   - Considers frontend, backend, database, API, and testing requirements
   - Evaluates integration points and third-party dependencies

2. **Dual Time Estimates**
   - **Manual Development Time**: Traditional hours without AI assistance
   - **AI-Assisted Development Time**: Hours when using AI tools effectively
   - **Time Savings Calculation**: Percentage and absolute hours saved

3. **Context-Aware Estimation**
   - **Existing Projects**: Analyzes codebase patterns and architecture
   - **New Projects**: Estimates based on requirements and standard patterns
   - Factors in project type (web app, API, mobile, etc.)
   - Considers technology stack complexity

4. **Experience Level Adjustments**
   - Junior developer (0-2 years)
   - Mid-level developer (2-5 years)
   - Senior developer (5+ years)
   - Adjusts estimates based on experience

5. **Comprehensive Breakdown**
   - Implementation hours
   - Testing hours (unit, integration, e2e)
   - Documentation hours
   - Code review cycles
   - Bug fixing and refinement
   - Deployment and DevOps tasks

## How to Use

Simply invoke the skill with a feature description:

```
/time-estimation
```

Then describe what you want to estimate:

```
Estimate adding user authentication with email/password and OAuth
```

```
Estimate building a task management app with React frontend and Node.js backend
```

```
How long would it take to add a payment integration with Stripe?
```

For more specific estimates:

```
/time-estimation Estimate adding real-time chat feature for a mid-level developer
```

```
/time-estimation Estimate building an e-commerce checkout flow in an existing Laravel app
```

## AI Efficiency Factors

The skill uses real-world data about AI coding tool effectiveness across different tasks:

### High AI Time Savings (60-80% reduction)

Tasks where AI excels and saves the most time:

- **Boilerplate Code Generation**: Models, migrations, controllers, API endpoints
- **CRUD Operations**: Standard create/read/update/delete functionality
- **Test Writing**: Unit tests, integration tests, test fixtures
- **Documentation**: Code comments, API docs, README files
- **Code Refactoring**: Renaming, restructuring, cleanup
- **Type Definitions**: TypeScript interfaces, PHP types
- **Configuration Files**: Package configs, build scripts
- **CSS/Styling**: Layout code, responsive designs
- **Data Transformations**: Mappers, serializers, formatters

### Moderate AI Time Savings (30-50% reduction)

Tasks where AI provides solid assistance:

- **Business Logic Implementation**: Core feature code with AI scaffolding
- **Debugging**: AI helps identify issues faster
- **Code Reviews**: AI catches common issues, humans review logic
- **Database Design**: Schema design with AI suggestions
- **API Integration**: Connecting third-party services
- **Form Validation**: Rules, error messages, client/server validation
- **Component Building**: React/Vue/Livewire components
- **Error Handling**: Try-catch blocks, error messages

### Limited AI Time Savings (10-30% reduction)

Tasks where AI helps but human expertise dominates:

- **Complex Algorithm Design**: Unique business algorithms
- **Architecture Decisions**: System design, scaling strategies
- **Performance Optimization**: Profiling, query optimization
- **Security Implementation**: Auth flows, encryption, security audits
- **UX/UI Design**: User experience decisions (AI helps with code)
- **Requirements Analysis**: Understanding client needs
- **DevOps Setup**: CI/CD pipelines, infrastructure
- **Legacy Code Understanding**: Reverse-engineering old systems

### Minimal AI Time Savings (0-10% reduction)

Tasks that remain primarily human-driven:

- **Stakeholder Meetings**: Planning, requirements gathering
- **Code Reviews for Logic**: Deep architectural review
- **Performance Testing**: Load testing, benchmarking
- **Production Debugging**: Complex production issues
- **Third-party Tool Evaluation**: Researching and comparing libraries

## Estimation Methodology

The skill follows this process:

1. **Break Down the Feature**
   - Identify all component tasks
   - List technical requirements
   - Map dependencies between tasks

2. **Analyze Complexity**
   - Simple: Well-defined, common patterns, minimal dependencies
   - Medium: Some custom logic, moderate integration
   - Complex: Novel algorithms, heavy integration, performance concerns

3. **Calculate Base Manual Hours**
   - Use industry-standard estimation for each task
   - Apply three-point estimation (optimistic/realistic/pessimistic)
   - Factor in developer experience level

4. **Calculate AI-Assisted Hours**
   - Apply AI efficiency factors to each task category
   - Consider tasks where AI provides maximum value
   - Calculate realistic time with AI pair programming

5. **Present Time Savings**
   - Show manual vs AI-assisted comparison
   - Calculate percentage and absolute hours saved
   - Break down by task categories

## Output Format

The skill provides structured estimates in this format:

```
Feature: [Feature Name]

📊 Time Estimate Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Traditional Manual Development:
  Optimistic:   [X] hours
  Realistic:    [Y] hours (recommended estimate)
  Pessimistic:  [Z] hours

AI-Assisted Development:
  Optimistic:   [A] hours (-X%)
  Realistic:    [B] hours (-Y%)
  Pessimistic:  [C] hours (-Z%)

💰 Time Savings with AI: [N] hours ([P]% reduction)

📋 Detailed Breakdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Task Category              Manual    AI-Assisted    Savings
─────────────────────────────────────────────────────────
Backend Implementation     Xh        Yh             Zh (-P%)
Frontend Implementation    Xh        Yh             Zh (-P%)
Database Design            Xh        Yh             Zh (-P%)
API Integration            Xh        Yh             Zh (-P%)
Testing (Unit/Integration) Xh        Yh             Zh (-P%)
Documentation              Xh        Yh             Zh (-P%)
Code Review Cycles         Xh        Yh             Zh (-P%)
Bug Fixes & Refinement     Xh        Yh             Zh (-P%)
─────────────────────────────────────────────────────────
TOTAL                      Xh        Yh             Zh (-P%)

🎯 Assumptions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Developer experience level: [Junior/Mid/Senior]
- Project type: [New/Existing]
- Technology stack: [Stack details]
- AI tools: Claude/Copilot for code generation
- AI usage: Effective AI pair programming
- Testing coverage: [Unit + Integration tests]

📝 Notes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Additional context, risks, or considerations]
```

## Tips for Maximizing AI Efficiency

To achieve the time savings shown in AI-assisted estimates:

1. **Use AI for Boilerplate**
   - Let AI generate models, controllers, migrations
   - Use AI for repetitive CRUD operations
   - Generate test scaffolding with AI

2. **Effective Prompting**
   - Provide context about your project structure
   - Specify your coding standards and conventions
   - Ask for complete implementations, not snippets

3. **Iterative Refinement**
   - Start with AI-generated code
   - Review and refine with human expertise
   - Use AI to explain and improve code

4. **Test Generation**
   - AI excels at writing unit tests
   - Generate test cases from requirements
   - Let AI create test fixtures and mocks

5. **Documentation**
   - AI quickly writes clear documentation
   - Generate API docs from code
   - Create README sections with AI

6. **Code Reviews**
   - Use AI to catch common issues first
   - Human review focuses on logic and architecture
   - Faster review cycles overall

## When AI Saves Less Time

Be realistic about these scenarios:

- **Novel Business Logic**: Unique algorithms require human design
- **Architecture Decisions**: System design needs human expertise
- **Complex Debugging**: Production issues need deep investigation
- **Security Critical Code**: Requires careful human review
- **Performance Optimization**: Profiling and tuning need expertise
- **UX Design**: User experience decisions are human-driven

## Estimation Workflow

When you invoke this skill, it will:

1. **Understand Your Request**
   - Ask clarifying questions if needed
   - Determine if it's a new or existing project
   - Identify the technology stack

2. **Analyze the Feature**
   - Break down into component tasks
   - Assess complexity and dependencies
   - Review similar code if in existing project

3. **Calculate Estimates**
   - Provide manual development hours
   - Calculate AI-assisted hours
   - Show time savings

4. **Present Breakdown**
   - Detailed task-by-task estimates
   - Clear assumptions
   - Notes and considerations

## Integration with Other Skills

This skill works well with:

- **technical-refinement**: Use time estimates to prioritize features
- **code-review**: Validate assumptions about complexity
- **commit-message**: Track actual time vs estimates in commits

## Additional resources

- For complete example estimates (Auth System, Task Management App, Stripe Integration), see [examples.md](examples.md)

## Limitations

- Estimates are based on industry averages and AI tool benchmarks
- Actual times vary based on individual developer skill and familiarity
- AI efficiency depends on effective usage and good prompting
- Complex or novel problems may see lower AI time savings
- Estimates don't include meetings, planning, or stakeholder communication
- First-time technology learning curves not fully captured

## Best Practices

1. **Use Three-Point Estimates**: Always review optimistic/realistic/pessimistic
2. **Factor in Experience**: Adjust estimates for your actual skill level
3. **Track Actual Time**: Compare estimates to reality to improve future estimates
4. **Include Testing**: Don't skip test time - it's essential
5. **Plan for Refinement**: Budget time for polish and edge cases
6. **Review Regularly**: Re-estimate as you learn more about the feature

## Related Use Cases

- Sprint planning and estimation
- Project budget proposals
- Build vs buy decision making
- ROI analysis for AI coding tools
- Developer productivity tracking
- Client timeline commitments
- Resource allocation planning
- Feature prioritization by effort

## Real-World AI Time Savings Data

These estimates are based on:

- GitHub Copilot studies showing 55% faster task completion
- Developer surveys on AI coding assistant usage
- Real project data from AI-assisted development
- Industry benchmarks for common development tasks
- Conservative estimates to ensure realistic expectations

The skill aims to provide realistic, achievable estimates that account for both the power and limitations of AI coding assistance.
