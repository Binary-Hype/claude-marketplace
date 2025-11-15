---
description: Generate comprehensive changelogs from git commits with user-friendly release notes
---

# Changelog Generator

Invoke the changelog-generator skill to create user-facing changelogs from your git commit history.

You are being asked to generate a changelog. Follow the changelog-generator skill workflow:

1. **Analyze Git History**
   - Determine the time range or version range for the changelog
   - Run `git log` with appropriate parameters to fetch commits
   - Review recent commits to understand the scope of changes
   - Ask user for clarification if date range or version is unclear

2. **Categorize Changes**
   - Group commits into categories:
     - ✨ New Features
     - 🔧 Improvements
     - 🐛 Bug Fixes
     - 💥 Breaking Changes
     - 🔒 Security
   - Filter out internal commits (refactoring, tests, CI/CD, etc.)
   - Focus on user-facing changes

3. **Transform Technical → User-Friendly**
   - Convert developer language to customer language
   - Focus on benefits and impact, not implementation details
   - Use clear, concise descriptions
   - Remove technical jargon
   - Make it scannable and easy to understand

4. **Format the Changelog**
   - Create structured markdown output
   - Use emoji or symbols for visual hierarchy
   - Keep descriptions brief but informative
   - Follow best changelog practices
   - Check for any style guidelines in CHANGELOG_STYLE.md or similar

5. **Present to User**
   - Show the generated changelog
   - Offer to save to CHANGELOG.md if desired
   - Note that user should review before publishing

**Example Categories**:
- New Features: Wholly new functionality users can access
- Improvements: Enhancements to existing features
- Bug Fixes: Issues that were resolved
- Breaking Changes: Changes requiring user action
- Security: Security-related fixes or improvements

**Tips**:
- Focus on user value, not technical details
- Keep it concise and scannable
- Use active voice
- Be specific but brief
- Exclude internal/developer-only changes
