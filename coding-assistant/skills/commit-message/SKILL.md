---
name: commit-message
description: Generates well-structured git commit messages with concise subject lines and brief descriptions. Analyzes staged changes to create meaningful commit messages following best practices.
---

# Commit Message Generator

An intelligent skill that crafts professional git commit messages by analyzing your staged changes. Creates concise subject lines (50 characters or less) with brief, focused descriptions (1-3 sentences) that explain the why and what of your changes.

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
   - Formats as a bulleted list with each point starting with a dash
   - Briefly explains WHY changes were made
   - Keeps each point concise and focused
   - Only includes essential context
   - Notes breaking changes if any
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
   - **IMPORTANT**: Only analyze files that are already staged - do NOT stage any files

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

4. **Write Concise Description**
   - Format as a bulleted list with each point starting with a dash
   - Keep each point brief and focused (1 line per point)
   - Only include essential context not obvious from the diff
   - Note breaking changes if any
   - Reference issue numbers or tickets
   - **IMPORTANT**: Do NOT add any AI-generated notes, Claude Code references, or Co-Authored-By lines
   - Format example:
     ```
     Add user authentication with JWT

     - Replaces session-based auth with JWT for better API scalability
     - Easier mobile client integration
     - Breaking change: Session endpoints deprecated, use Authorization header
     - Fixes #123
     ```

5. **Create the Commit**
   - Automatically execute `git commit` with the generated message
   - Use HEREDOC format to ensure proper formatting
   - Verify the commit was created successfully with `git log -1`
   - Do NOT add Claude Code attribution, Co-Authored-By, or any AI-generated notes

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
- Format as a bulleted list with each point starting with a dash
- Keep each point concise (1 line per point)
- Explain the WHY briefly, not just the WHAT
- Use present tense
- Include breaking changes if any
- Reference issues/tickets at the end

## Examples

### Example 1: Feature Addition

**Staged changes:** New email notification system

**Generated message:**
```
Add email notification system for user events

- Implements queued email notifications to keep users informed about account activities
- Uses Laravel notifications with customizable user preferences
- Related to #456
```

### Example 2: Bug Fix

**Staged changes:** Fix in payment processing

**Generated message:**
```
Fix race condition in payment processing

- Adds pessimistic locking and unique constraints
- Prevents duplicate charges when concurrent requests process the same order
- Fixes #789
```

### Example 3: Refactoring

**Staged changes:** Code cleanup and optimization

**Generated message:**
```
Refactor user service for better testability

- Extracts validation logic into separate methods
- Adds dependency injection for better testing
- Improves type hints throughout the service
- No functional changes, all tests pass
```

### Example 4: Documentation Update

**Staged changes:** Updated README and API docs

**Generated message:**
```
Update API documentation for v2 endpoints

- Adds comprehensive endpoint descriptions
- Includes request/response examples
- Provides migration guide from v1 to help developers integrate more easily
```

### Example 5: Multiple Related Changes

**Staged changes:** Several files related to performance improvements

**Generated message:**
```
Optimize database queries for dashboard page

- Adds eager loading, caching, and indexes
- Reduces queries from 45+ to 8
- Improves load time by 60% (850ms → 340ms)
- Closes #234
```

## Best Practices

1. **Subject Line Excellence**
   - Be specific: "Fix login bug" → "Fix null pointer in OAuth callback"
   - Use imperative: "Add feature" not "Added feature" or "Adds feature"
   - Stay brief: If it's too long, you're including too much detail

2. **Body Brevity**
   - Format as bulleted list with dashes
   - Answer: Why is this change needed? (1 line per point)
   - Mention what changed only if not obvious from subject
   - Skip implementation details unless critical
   - Include: Breaking changes if any, related issues

3. **Formatting Consistency**
   - One blank line between subject and body
   - Format body as bulleted list with dashes
   - Keep each point concise (1 line per point)
   - Wrap lines at 72 characters

4. **Project Context**
   - Match your project's commit message style
   - Use conventional commits if your team does
   - Include ticket references if required
   - Follow any team-specific conventions

5. **Meaningful Content**
   - Avoid: "Fix bug" or "Update code"
   - Avoid: Repeating what the diff shows
   - Avoid: Long explanations of implementation details
   - Include: Brief context about WHY (bulleted list format)

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

- [Why it's needed]
- [What it does]
- [Any other relevant points]
```

**Bug Fix:**
```
Fix [specific problem]

- [What caused it]
- [How it's fixed]
- [Fixes #issue]
```

**Refactoring:**
```
Refactor [component] for [benefit]

- [What changed]
- [Why it's better]
- [Tests pass/no functional changes]
```

**Documentation:**
```
Update [what documentation]

- [What changed and why]
```

**Performance:**
```
Optimize [what] for [improvement]

- [Key metrics showing improvement]
- [What changed to achieve this]
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
