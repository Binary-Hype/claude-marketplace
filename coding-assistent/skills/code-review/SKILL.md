---
name: code-review
description: Expert code reviewer specialized in web development technologies (PHP, HTML, CSS, JavaScript) with deep expertise in Laravel framework. Reviews code for quality, security, performance, and best practices including WCAG accessibility compliance.
---

# Code Review Skill

An expert code reviewer specializing in web development with deep knowledge of PHP, HTML, CSS, JavaScript, and particularly Laravel framework. This skill provides thorough, constructive code reviews focusing on quality, security, performance, WCAG accessibility compliance, and adherence to best practices.

## When to Use This Skill

Use this skill when:
- You need a comprehensive code review before merging changes
- You want to identify potential bugs, security vulnerabilities, or performance issues
- You're working with PHP, Laravel, HTML, CSS, or JavaScript code
- You need feedback on code architecture and design patterns
- You want to ensure adherence to coding standards and best practices
- You need to verify WCAG accessibility compliance
- You're refactoring code and want expert validation
- You need to review pull requests or feature implementations

## What This Skill Does

This skill performs comprehensive code reviews by:

1. **Code Quality Analysis**
   - Evaluates code readability and maintainability
   - Checks for proper naming conventions and code organization
   - Identifies code smells and anti-patterns
   - Suggests refactoring opportunities

2. **Laravel-Specific Review**
   - Validates proper use of Laravel conventions and best practices
   - Reviews Eloquent models, relationships, and query optimization
   - Checks middleware, service providers, and dependency injection
   - Evaluates route definitions and controller structure
   - Reviews Blade templates for efficiency and security
   - Validates use of Laravel features (queues, jobs, events, caching, etc.)

3. **Security Assessment**
   - Identifies potential security vulnerabilities (SQL injection, XSS, CSRF)
   - Reviews authentication and authorization implementation
   - Checks for proper input validation and sanitization
   - Validates secure handling of sensitive data
   - Reviews API endpoint security

4. **Performance Optimization**
   - Identifies N+1 query problems
   - Suggests database indexing opportunities
   - Reviews caching strategies
   - Evaluates asset loading and optimization
   - Checks for memory leaks and inefficient loops

5. **Frontend Code Review**
   - Reviews JavaScript for modern best practices (ES6+)
   - Validates HTML semantic structure and accessibility
   - Checks CSS organization and maintainability
   - Reviews responsive design implementation
   - Evaluates frontend performance considerations
   - **WCAG Accessibility Compliance**:
     - **Perceivable**: Verifies text alternatives, captions, adaptable content, and distinguishable elements
     - **Operable**: Checks keyboard accessibility, timing controls, navigation, and input modalities
     - **Understandable**: Validates readable text, predictable behavior, and input assistance
     - **Robust**: Ensures compatibility with assistive technologies and parsing compliance
   - Validates proper ARIA attributes and roles
   - Checks color contrast ratios (WCAG AA/AAA)
   - Reviews focus management and keyboard navigation
   - Validates form labels and error messages
   - Checks heading hierarchy and document structure
   - Reviews alternative text for images and media
   - Validates skip links and landmark regions
   - Checks for proper semantic HTML5 elements

6. **Architecture & Design Patterns**
   - Validates adherence to SOLID principles
   - Reviews design pattern implementation
   - Evaluates separation of concerns
   - Checks dependency management
   - Reviews API design and RESTful conventions

## How to Use

Simply invoke the skill when you need code reviewed:

```
/code-review
```

Or be more specific about what you want reviewed:

```
/code-review Review the UserController and related authentication logic
```

```
/code-review Check this Laravel migration for performance issues
```

```
/code-review Analyze this JavaScript module for potential bugs
```

```
/code-review Review this Blade template for WCAG compliance
```

## Review Output Format

The skill provides structured feedback organized by:

- **Critical Issues**: Security vulnerabilities or bugs that must be fixed
- **Accessibility Issues**: WCAG compliance violations that affect users with disabilities
- **Performance Issues**: Problems affecting application speed or resource usage
- **Code Quality**: Suggestions for improving readability and maintainability
- **Best Practices**: Recommendations aligned with Laravel and web development standards
- **Positive Feedback**: Recognition of well-written code and good practices

Each issue includes:
- Severity level (Critical, High, Medium, Low)
- File and line number reference
- WCAG criterion reference (for accessibility issues)
- Clear explanation of the problem
- Concrete suggestions for improvement
- Code examples when applicable

## Examples

### Example 1: Laravel Controller Review

```php
// Before Review
public function store(Request $request)
{
    $user = new User;
    $user->name = $request->name;
    $user->email = $request->email;
    $user->save();
    return redirect('/users');
}
```

**Review Feedback:**
- **Critical**: Missing input validation - validates user input
- **Medium**: Not using mass assignment - consider using `User::create()`
- **Medium**: Missing form request validation - create `StoreUserRequest`
- **Low**: No success message feedback for user

### Example 2: Eloquent Query Optimization

```php
// Before Review
$users = User::all();
foreach ($users as $user) {
    echo $user->posts->count();
}
```

**Review Feedback:**
- **High**: N+1 query problem - use `User::withCount('posts')`
- **Medium**: Inefficient for large datasets - consider pagination
- **Low**: Direct echo in controller - return to view instead

### Example 3: Security Review

```php
// Before Review
$users = DB::select("SELECT * FROM users WHERE email = '".$request->email."'");
```

**Review Feedback:**
- **Critical**: SQL injection vulnerability - use parameter binding or Eloquent
- **High**: Not using Eloquent ORM - leverage Laravel's query builder
- **Medium**: Selecting all columns - specify required columns for performance

### Example 4: WCAG Accessibility Review

```html
<!-- Before Review -->
<div onclick="submitForm()">Submit</div>
<img src="logo.png">
<input type="text" placeholder="Enter name">
<div style="color: #999; background: #ccc;">Important notice</div>
```

**Review Feedback:**
- **High**: Non-semantic button (WCAG 4.1.2) - use `<button>` element instead of `<div>`
- **High**: Missing alt attribute (WCAG 1.1.1) - add descriptive alt text to image
- **High**: Missing label (WCAG 3.3.2) - add `<label>` element for form input
- **High**: Insufficient color contrast (WCAG 1.4.3) - contrast ratio 2.8:1 fails AA (requires 4.5:1)
- **Medium**: Not keyboard accessible (WCAG 2.1.1) - button needs to work with Enter/Space keys

**Improved Code:**
```html
<button type="button" onclick="submitForm()">Submit</button>
<img src="logo.png" alt="Company Logo - Acme Corporation">
<label for="username">Name</label>
<input type="text" id="username" name="username" placeholder="Enter name">
<div style="color: #333; background: #f0f0f0;" role="alert">Important notice</div>
```

### Example 5: Form Accessibility

```html
<!-- Before Review -->
<form>
    <input type="email" placeholder="Email">
    <input type="password" placeholder="Password">
    <span style="color: red;">Invalid email</span>
    <div onclick="submit()">Login</div>
</form>
```

**Review Feedback:**
- **High**: Missing form labels (WCAG 3.3.2) - add `<label>` elements
- **High**: Error message not associated (WCAG 3.3.1) - use `aria-describedby`
- **High**: Non-semantic submit button (WCAG 4.1.2) - use `<button type="submit">`
- **Medium**: Missing required indicators (WCAG 3.3.2) - mark required fields
- **Medium**: No focus indicators visible (WCAG 2.4.7) - ensure visible focus states

**Improved Code:**
```html
<form>
    <label for="email">Email <span aria-label="required">*</span></label>
    <input type="email" id="email" name="email" required
           aria-describedby="email-error" aria-invalid="true">
    <span id="email-error" role="alert" style="color: #c0392b;">Invalid email</span>

    <label for="password">Password <span aria-label="required">*</span></label>
    <input type="password" id="password" name="password" required>

    <button type="submit">Login</button>
</form>
```

### Example 6: Navigation Accessibility

```html
<!-- Before Review -->
<div class="nav">
    <a href="#" onclick="goTo('home')">Home</a>
    <a href="#" onclick="goTo('about')">About</a>
</div>
<div class="content">...</div>
```

**Review Feedback:**
- **High**: Missing landmark regions (WCAG 1.3.1) - use semantic HTML5 elements
- **High**: No skip link (WCAG 2.4.1) - add skip to main content link
- **Medium**: Incorrect link usage (WCAG 2.1.1) - links with href="#" are not buttons
- **Low**: Missing navigation label (WCAG 2.4.1) - add aria-label to nav

**Improved Code:**
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<nav aria-label="Main navigation">
    <a href="/home">Home</a>
    <a href="/about">About</a>
</nav>
<main id="main-content">
    <div class="content">...</div>
</main>
```

## Laravel-Specific Focus Areas

- **Eloquent ORM**: Proper use of models, relationships, scopes, and query optimization
- **Routing**: RESTful conventions, route model binding, route caching
- **Controllers**: Thin controllers, resource controllers, form requests
- **Middleware**: Authentication, authorization, custom middleware
- **Blade Templates**: Component usage, directive usage, XSS protection
- **Validation**: Form requests, validation rules, custom validators
- **Database**: Migrations, seeders, factories, query optimization
- **Authentication**: Laravel Sanctum/Passport, gates, policies
- **Jobs & Queues**: Proper queue usage, job design, failure handling
- **Testing**: Feature tests, unit tests, test coverage

## WCAG Compliance Focus Areas

### Level A (Minimum)
- Text alternatives for non-text content
- Captions and alternatives for media
- Adaptable content structure
- Distinguishable foreground/background
- Keyboard accessible functionality
- Sufficient time for interactions
- Seizure prevention (no flashing content)
- Navigable page structure
- Readable and understandable text
- Predictable behavior
- Input assistance and error handling
- Compatible with assistive technologies

### Level AA (Recommended)
- Captions for live audio
- Audio descriptions for video
- Minimum color contrast (4.5:1)
- Text resizing up to 200%
- Images of text (avoid when possible)
- Multiple navigation mechanisms
- Focus visible indicators
- Language of page and parts
- Consistent navigation and identification
- Error suggestions and prevention

### Level AAA (Enhanced)
- Sign language interpretation
- Extended audio descriptions
- Enhanced color contrast (7:1)
- No background audio
- Visual presentation controls
- Unusual word definitions
- Pronunciation and abbreviations
- Section headings
- Link purpose from link text alone

## Tips for Best Results

1. **Provide Context**: Mention what the code does and any specific concerns
2. **Include Related Files**: Show models, controllers, and views together
3. **Specify Priority**: Indicate if you need security, performance, accessibility, or general review
4. **Mention Target WCAG Level**: Specify if you need AA (standard) or AAA compliance
5. **Ask Questions**: Request clarification on any feedback you don't understand
6. **Iterative Reviews**: Use the skill multiple times as you address feedback
7. **Test with Screen Readers**: Combine review with actual assistive technology testing

## Related Use Cases

- Pre-merge pull request reviews
- Security audits for production code
- Accessibility compliance audits (WCAG 2.1/2.2)
- Refactoring validation
- Junior developer mentoring
- Legacy code modernization
- Performance bottleneck identification
- Compliance with coding standards
- Third-party code evaluation
- Public sector website compliance (Section 508, ADA)
