---
name: commit-message
description: Generates well-structured git commit messages with concise subject lines and detailed descriptions. Analyzes staged changes to create meaningful commit messages following best practices.
---

# Commit Message Generator

An intelligent skill that crafts professional git commit messages by analyzing your staged changes. Creates concise subject lines (50 characters or less) with comprehensive descriptions that explain the what, why, and how of your changes.

## When to Use This Skill

Use this skill when:
- You're ready to commit changes but need help writing a clear commit message
- You want to follow git commit message best practices
- You have complex changes that need proper documentation
- You want consistent commit message formatting across your project
- You need to explain the reasoning behind your changes
- You're working on a team and want clear commit history

## What This Skill Does

This skill provides comprehensive commit message support by:

1. **Change Analysis**
   - Reviews git diff to understand what changed
   - Identifies the scope and impact of changes
   - Recognizes patterns (bug fixes, features, refactoring, etc.)
   - Analyzes multiple files and their relationships

2. **Subject Line Generation**
   - Creates concise summaries (50 characters or less)
   - Uses imperative mood ("Add feature" not "Added feature")
   - Focuses on what the commit accomplishes
   - Avoids unnecessary details in the subject

3. **Description Writing**
   - Explains WHY changes were made
   - Provides context about the problem being solved
   - Details HOW the solution works if non-obvious
   - Lists breaking changes or important considerations
   - References related issues or tickets when applicable

4. **Format Adherence**
   - Follows conventional commit best practices
   - Separates subject from body with blank line
   - Wraps body text at 72 characters
   - Uses bullet points for multiple changes
   - Maintains consistent tone and style

## How to Use

Simply invoke the skill when you're ready to commit:

```
/commit-message
```

Or ask for help with a specific commit:

```
/commit-message Write a commit message for my authentication changes
```

```
I've staged changes to the user model and auth controller. Help me write a commit message.
```

## Workflow

When this skill is invoked, it follows this process:

1. **Analyze Staged Changes**
   - Run `git status` to see what's staged
   - Run `git diff --staged` to see the actual changes
   - Review recent commits with `git log` to match project style

2. **Understand the Context**
   - Identify the type of change (feature, fix, refactor, docs, test, etc.)
   - Determine the scope (which part of the codebase)
   - Recognize the impact (breaking change, enhancement, bug fix)

3. **Generate Subject Line**
   - Start with a verb in imperative mood
   - Keep it under 50 characters
   - Don't end with a period
   - Make it meaningful and specific
   - Examples:
     - "Add user authentication with JWT"
     - "Fix null pointer in payment processor"
     - "Refactor database query optimization"
     - "Update API documentation for v2 endpoints"

4. **Write Detailed Description**
   - Explain the motivation for the change
   - Describe what was changed and why
   - Include implementation details if helpful
   - Note any breaking changes or migrations needed
   - Reference issue numbers or tickets
   - Format example:
     ```
     Add user authentication with JWT

     Implements JWT-based authentication to replace session-based auth.
     This provides better scalability for our API and allows mobile
     clients to authenticate more easily.

     Changes:
     - Add JWT token generation and validation
     - Update User model with token methods
     - Create AuthController with login/logout endpoints
     - Add authentication middleware
     - Update API routes to use auth middleware

     Breaking changes:
     - Session-based auth endpoints are deprecated
     - Clients must update to use Authorization header

     Fixes #123
     ```

5. **Present the Commit Message**
   - Show the complete message with subject and body
   - Explain the reasoning behind the message structure
   - Allow for user review and adjustments

## Commit Message Structure

### Subject Line Format

```
<type>: <short description>
```

Or simply:

```
<short description>
```

**Types** (optional, use if your project follows conventional commits):
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

**Subject Line Rules:**
- Maximum 50 characters
- Start with capital letter
- Use imperative mood
- No period at the end
- Be specific and meaningful

### Body Format

```
<blank line after subject>

<Detailed explanation of the change>

<Additional paragraphs as needed>

- Bullet points for lists
- More bullet points

<Footer with references>
```

**Body Rules:**
- Wrap at 72 characters per line
- Explain the WHY, not just the WHAT
- Use present tense
- Separate paragraphs with blank lines
- Use bullet points for lists
- Include breaking changes if any
- Reference issues/tickets at the end

## Examples

### Example 1: Feature Addition

**Staged changes:** New email notification system

**Generated message:**
```
Add email notification system for user events

Implements a comprehensive email notification system to keep users
informed about important account activities. Uses queued jobs for
performance and includes customizable notification preferences.

Features:
- Email templates for common notifications
- User preference management for notification types
- Queue-based sending to avoid blocking requests
- Support for both transactional and marketing emails
- Configurable SMTP settings

Technical details:
- Uses Laravel's notification system
- Implements Mailable classes for each email type
- Adds notifications table for tracking sent emails
- Uses Redis queue for background processing

Users can now manage their email preferences in account settings.

Related to #456
```

### Example 2: Bug Fix

**Staged changes:** Fix in payment processing

**Generated message:**
```
Fix race condition in payment processing

Resolves an issue where concurrent payment requests could result in
duplicate charges. The problem occurred when multiple requests tried
to process payments for the same order simultaneously.

Root cause:
- Lack of database-level locking on order records
- Insufficient validation of payment status before processing

Solution:
- Add pessimistic locking when fetching orders for payment
- Check payment status within transaction
- Add unique constraint on payment reference IDs

This ensures only one payment can be processed per order, even under
high concurrency.

Fixes #789
```

### Example 3: Refactoring

**Staged changes:** Code cleanup and optimization

**Generated message:**
```
Refactor user service for better testability

Restructures the UserService class to improve code organization,
testability, and maintainability. No functional changes to user-facing
behavior.

Changes:
- Extract validation logic into separate methods
- Use dependency injection for external services
- Remove duplicated code between methods
- Add type hints and return types
- Improve method naming for clarity

Benefits:
- Easier to write unit tests
- Better separation of concerns
- More maintainable codebase
- Improved IDE autocomplete support

All existing tests pass without modification.
```

### Example 4: Documentation Update

**Staged changes:** Updated README and API docs

**Generated message:**
```
Update API documentation for v2 endpoints

Adds comprehensive documentation for all v2 API endpoints including
request/response examples, authentication requirements, and error
handling.

Updates:
- Add endpoint descriptions with parameters
- Include example requests and responses
- Document authentication requirements
- Add error code reference table
- Update README with migration guide from v1

This helps developers integrate with our API more easily and reduces
support requests about endpoint usage.
```

### Example 5: Multiple Related Changes

**Staged changes:** Several files related to performance improvements

**Generated message:**
```
Optimize database queries for dashboard page

Improves dashboard load time by 60% through query optimization and
strategic eager loading. Reduces database queries from 45+ to 8 per
page load.

Optimizations:
- Add eager loading for user relationships
- Implement query result caching (5 minute TTL)
- Add database indexes for common queries
- Replace N+1 queries with batch loading
- Optimize JSON serialization

Performance impact:
- Average page load: 850ms → 340ms
- Database queries: 45+ → 8
- Memory usage: stable

The changes maintain backward compatibility and all tests pass.

Closes #234
```

## Best Practices

1. **Subject Line Excellence**
   - Be specific: "Fix login bug" → "Fix null pointer in OAuth callback"
   - Use imperative: "Add feature" not "Added feature" or "Adds feature"
   - Stay brief: If it's too long, you're including too much detail

2. **Body Completeness**
   - Answer: Why is this change needed?
   - Answer: What does this change do?
   - Answer: How does it work? (if complex)
   - Include: Breaking changes, migration steps, related issues

3. **Formatting Consistency**
   - One blank line between subject and body
   - Wrap lines at 72 characters
   - Use bullet points for lists
   - Keep paragraphs focused on one topic

4. **Project Context**
   - Match your project's commit message style
   - Use conventional commits if your team does
   - Include ticket references if required
   - Follow any team-specific conventions

5. **Meaningful Content**
   - Avoid: "Fix bug" or "Update code"
   - Avoid: Repeating what the diff shows
   - Include: Context that isn't obvious from the code
   - Include: Reasoning behind implementation choices

## Integration with Your Workflow

**Before Committing:**
```
git add .
/commit-message
```

**For Specific Changes:**
```
git add src/auth/*
/commit-message Help me write a message for these auth changes
```

**Quick Review:**
```
I've staged my changes. What would be a good commit message?
```

## Tips for Best Results

1. **Stage Related Changes**: Group related changes together for coherent commits
2. **Review the Diff**: Understand what changed before requesting a message
3. **Provide Context**: Mention why you made the changes if it's not obvious
4. **Check Project Style**: Review recent commits to match your project's style
5. **Edit if Needed**: The generated message is a starting point - adjust as needed
6. **Keep Commits Atomic**: One logical change per commit makes better messages

## Common Commit Message Patterns

**New Feature:**
```
Add [feature name]

[Why it's needed]
[What it does]
[How to use it]
```

**Bug Fix:**
```
Fix [specific problem]

[What caused it]
[How it's fixed]
[Impact]
```

**Refactoring:**
```
Refactor [component] for [benefit]

[What changed]
[Why]
[Impact on tests/behavior]
```

**Documentation:**
```
Update [what documentation]

[What's changed]
[Why]
```

**Performance:**
```
Optimize [what] for [improvement]

[Metrics before/after]
[What changed]
[Trade-offs]
```

## What This Skill Won't Do

- Won't automatically commit your changes (you control when to commit)
- Won't modify your staged changes
- Won't force a specific commit message style (adapts to your project)
- Won't commit without your review and approval

## Related Use Cases

- Writing clear commit messages for team projects
- Documenting complex changes for future reference
- Creating meaningful git history for code archaeology
- Preparing commits for code review
- Following conventional commits standard
- Generating changelog-friendly commit messages
- Training junior developers on good commit practices

## Technical Implementation

This skill:
1. Uses `git status` and `git diff --staged` to analyze changes
2. Reviews `git log` to understand project commit style
3. Applies commit message best practices
4. Generates structured messages with subject and body
5. Presents messages in proper format for direct use

The skill ensures you always have professional, informative commit messages that make your git history a valuable resource for your team.
