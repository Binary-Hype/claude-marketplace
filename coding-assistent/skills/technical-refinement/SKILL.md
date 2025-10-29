---
name: technical-refinement
description: Expert technical lead that transforms product requirements and customer requests into actionable developer todo lists. Analyzes project architecture and conventions to create clear, ordered implementation tasks.
---

# Technical Refinement Skill

A skilled technical lead who takes requirements from product owners or customers and creates clear, actionable todo lists for developers. This skill analyzes your codebase, considers your project's architecture and conventions, then breaks down features into concrete implementation tasks.

## When to Use This Skill

Use this skill when:
- You receive feature requests from product owners or customers
- You need to break down user stories into development tasks
- You want to plan a new feature implementation
- You're starting sprint planning and need a task breakdown
- You need a clear implementation roadmap
- You want tasks that respect your existing project patterns
- You need to identify what files and components to create or modify

## What This Skill Does

This skill acts as your technical lead by:

1. **Analyzing Requirements**
   - Understands what the product owner/customer wants
   - Identifies technical implications
   - Asks clarifying questions if needed

2. **Reviewing Your Codebase**
   - Examines your project structure and architecture
   - Identifies existing patterns and conventions
   - Finds relevant files and components
   - Reviews configuration and dependencies

3. **Creating Developer Todo List**
   - Breaks down the feature into specific, actionable tasks
   - Orders tasks logically with dependencies
   - Specifies which files to create or modify
   - Includes testing and documentation tasks
   - Estimates complexity for each task

## Output Format

The skill produces a **developer-ready todo list** with:

### Implementation Context
- Brief summary of what's being built
- Key technical decisions and rationale
- Files/components that will be affected

### Ordered Todo List
Each task includes:
- Clear action item (create, modify, implement)
- Specific files or components involved
- Complexity estimate (Small/Medium/Large/XL)
- Dependencies on other tasks
- Key implementation notes

### Additional Notes
- Important considerations
- Potential gotchas
- Testing requirements
- Questions that need answering

## How to Use

Invoke the skill with requirements:

```
/technical-refinement Users should be able to export their data to PDF
```

```
/technical-refinement Product owner wants: "Add two-factor authentication to login"
```

```
/technical-refinement Customer requested scheduling feature for posts
```

## Examples

### Example 1: User Export Feature

**Input:**
```
Users want to export their activity history to PDF and CSV formats
```

**Output:**

**Implementation Overview:**
Build async export functionality using Laravel queues. Users can request exports from their profile, receive email when ready, and download files. Uses `laravel-excel` for CSV and `dompdf` for PDF.

**Files to Create:**
- `app/Models/Export.php`
- `app/Services/UserExportService.php`
- `app/Jobs/GenerateUserExportJob.php`
- `app/Http/Controllers/ExportController.php`
- `app/Http/Requests/ExportRequest.php`
- `database/migrations/xxxx_create_exports_table.php`
- `resources/views/exports/activity-pdf.blade.php`
- `tests/Feature/ExportControllerTest.php`
- `tests/Unit/UserExportServiceTest.php`

**Files to Modify:**
- `routes/web.php` - Add export routes
- `resources/views/profile/show.blade.php` - Add export UI

**Developer Todo List:**

**Backend Setup**
- [ ] **Create exports migration** (Small)
  - Table: id, user_id, type (pdf/csv), status, file_path, expires_at, timestamps
  - Add indexes on user_id and status
  - Dependencies: None

- [ ] **Create Export model** (Small)
  - Eloquent model with relationships to User
  - Cast type and status to enums
  - Add scope for expired exports
  - Dependencies: Migration

- [ ] **Install and configure packages** (Small)
  - Run `composer require maatwebsite/excel barryvdh/laravel-dompdf`
  - Publish configs if needed
  - Dependencies: None

**Business Logic**
- [ ] **Create UserExportService** (Medium)
  - Method: `getUserActivityData($user)` - query user's activities
  - Method: `generateCsv($user, $filePath)` - create CSV file
  - Method: `generatePdf($user, $filePath)` - create PDF file
  - Handle large datasets with chunking
  - Dependencies: Export model

- [ ] **Create GenerateUserExportJob** (Medium)
  - Accept export_id in constructor
  - Load export, call appropriate service method
  - Update export status and file_path
  - Handle failures and update status to 'failed'
  - Send notification email on completion
  - Dependencies: UserExportService

**API Layer**
- [ ] **Create ExportRequest validation** (Small)
  - Validate type field (pdf or csv)
  - Ensure authenticated user
  - Dependencies: None

- [ ] **Create ExportController** (Medium)
  - `store()` - Create export record, dispatch job, return success
  - `index()` - List user's export history
  - `download($id)` - Serve file with authorization check
  - Use signed URLs or verify ownership
  - Dependencies: Export model, GenerateUserExportJob, ExportRequest

- [ ] **Add routes** (Small)
  - POST /exports - Create export
  - GET /exports - List exports
  - GET /exports/{id}/download - Download file
  - Group under auth middleware
  - Dependencies: ExportController

**PDF Template**
- [ ] **Create PDF Blade template** (Small)
  - Template: `resources/views/exports/activity-pdf.blade.php`
  - Display user info and activity table
  - Basic styling for PDF rendering
  - Dependencies: None

**Frontend**
- [ ] **Add export UI to profile page** (Medium)
  - Radio buttons for PDF/CSV selection
  - Export button that POSTs to /exports
  - Display list of recent exports with download links
  - Show export status (pending/completed/failed)
  - Dependencies: Routes

**Maintenance**
- [ ] **Create cleanup command** (Small)
  - `app/Console/Commands/CleanupExpiredExports.php`
  - Delete exports older than 48 hours
  - Delete associated files from storage
  - Schedule to run daily in Kernel
  - Dependencies: Export model

**Testing**
- [ ] **Write ExportController feature tests** (Medium)
  - Test export creation
  - Test unauthorized access prevention
  - Test download with valid/invalid IDs
  - Test user can only download own exports
  - Dependencies: All backend tasks

- [ ] **Write UserExportService unit tests** (Medium)
  - Test CSV generation
  - Test PDF generation
  - Test data extraction
  - Mock file system
  - Dependencies: UserExportService

**Final Steps**
- [ ] **Test with large dataset** (Small)
  - Create test user with 1000+ activities
  - Verify no timeouts or memory issues
  - Optimize queries if needed
  - Dependencies: All implementation tasks

- [ ] **Update documentation** (Small)
  - Add to README if needed
  - Document deployment requirements (queue worker)
  - Dependencies: All tasks complete

**Important Considerations:**
- Ensure queue worker is running in production
- Set appropriate memory limits for job
- Consider rate limiting export requests
- Export files expire after 48 hours - communicate to users
- Use chunking for large datasets to avoid memory issues

**Questions for Product Owner:**
1. What date range for activities? (all time, last year, custom?)
2. Should users be limited to X exports per day?
3. What specific activity data should be included?

---

### Example 2: Two-Factor Authentication

**Input:**
```
Add two-factor authentication using TOTP (Google Authenticator style)
```

**Output:**

**Implementation Overview:**
Implement TOTP-based 2FA using `pragmarx/google2fa-laravel` package. Users can enable 2FA in settings, scan QR code, and enter codes on login. Store encrypted 2FA secrets per user.

**Files to Create:**
- `database/migrations/xxxx_add_two_factor_to_users_table.php`
- `app/Http/Controllers/TwoFactorController.php`
- `app/Http/Requests/TwoFactorEnableRequest.php`
- `app/Http/Middleware/EnsureTwoFactorAuthenticated.php`
- `resources/views/auth/two-factor-challenge.blade.php`
- `resources/views/settings/two-factor.blade.php`
- `tests/Feature/TwoFactorAuthenticationTest.php`

**Files to Modify:**
- `app/Models/User.php` - Add 2FA columns and methods
- `routes/web.php` - Add 2FA routes
- `app/Http/Kernel.php` - Register 2FA middleware
- `app/Http/Controllers/Auth/LoginController.php` - Add 2FA check after login
- `resources/views/settings/index.blade.php` - Link to 2FA settings

**Developer Todo List:**

**Database Setup**
- [ ] **Create migration for 2FA fields** (Small)
  - Add columns to users: `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_enabled_at`
  - Encrypt two_factor_secret column
  - Dependencies: None

- [ ] **Update User model** (Small)
  - Add fillable fields
  - Add casts (two_factor_recovery_codes as array, two_factor_enabled_at as datetime)
  - Add `$hidden` for sensitive fields
  - Dependencies: Migration

**Package Setup**
- [ ] **Install Google2FA package** (Small)
  - Run `composer require pragmarx/google2fa-laravel`
  - Publish config: `php artisan vendor:publish --provider="PragmaRX\Google2FALaravel\ServiceProvider"`
  - Review config options
  - Dependencies: None

**2FA Management**
- [ ] **Add helper methods to User model** (Small)
  - Method: `hasTwoFactorEnabled()` - check if 2FA is enabled
  - Method: `enableTwoFactor($secret, $codes)` - enable 2FA
  - Method: `disableTwoFactor()` - disable 2FA
  - Method: `recoveryCodes()` - get recovery codes
  - Dependencies: Migration

- [ ] **Create TwoFactorController** (Large)
  - `show()` - Display 2FA settings page
  - `enable()` - Generate secret, return QR code
  - `confirm()` - Verify code and enable 2FA, generate recovery codes
  - `disable()` - Disable 2FA with password confirmation
  - `regenerateRecoveryCodes()` - Generate new recovery codes
  - Use Google2FA facade for QR code generation
  - Dependencies: User model methods, package

- [ ] **Create TwoFactorEnableRequest** (Small)
  - Validate confirmation code (6 digits)
  - Validate current password
  - Dependencies: None

- [ ] **Add 2FA routes** (Small)
  - GET /settings/two-factor - Show settings
  - POST /settings/two-factor/enable - Generate secret
  - POST /settings/two-factor/confirm - Confirm and enable
  - DELETE /settings/two-factor - Disable
  - POST /settings/two-factor/recovery-codes - Regenerate codes
  - Dependencies: TwoFactorController

**Login Flow**
- [ ] **Modify LoginController** (Medium)
  - After successful credentials check, check if user has 2FA
  - If 2FA enabled, don't log in yet, redirect to 2FA challenge
  - Store user_id in session temporarily
  - Dependencies: User model methods

- [ ] **Create 2FA challenge page** (Medium)
  - View: `resources/views/auth/two-factor-challenge.blade.php`
  - Form to enter 6-digit code
  - Link to use recovery code instead
  - Dependencies: None

- [ ] **Handle 2FA challenge submission** (Medium)
  - Add method to LoginController or create separate controller
  - POST /two-factor-challenge
  - Verify code using Google2FA
  - If valid, complete login
  - If recovery code used, mark as used
  - Log invalid attempts
  - Dependencies: 2FA challenge page, Google2FA

**Middleware Protection**
- [ ] **Create EnsureTwoFactorAuthenticated middleware** (Medium)
  - Check if authenticated user has 2FA enabled
  - If enabled but not verified this session, redirect to challenge
  - Store "two_factor_verified" in session after successful verification
  - Dependencies: 2FA challenge flow

- [ ] **Register middleware** (Small)
  - Add to `app/Http/Kernel.php`
  - Apply to sensitive routes if needed
  - Dependencies: Middleware class

**Frontend**
- [ ] **Create 2FA settings page** (Medium)
  - Show current status (enabled/disabled)
  - Button to enable if disabled
  - Display QR code when enabling
  - Input field for confirmation code
  - Button to disable if enabled (with password confirm)
  - Display recovery codes after setup
  - Button to regenerate recovery codes
  - Dependencies: TwoFactorController

- [ ] **Add link to settings navigation** (Small)
  - Link to 2FA settings in user settings menu
  - Dependencies: Settings page

**Testing**
- [ ] **Write feature tests** (Large)
  - Test enabling 2FA with valid code
  - Test enabling 2FA with invalid code
  - Test disabling 2FA
  - Test login flow with 2FA enabled
  - Test recovery code usage
  - Test middleware protection
  - Test regenerating recovery codes
  - Dependencies: All implementation

**Security & Polish**
- [ ] **Add rate limiting** (Small)
  - Limit 2FA challenge attempts (5 per minute)
  - Limit recovery code attempts
  - Dependencies: 2FA challenge handler

- [ ] **Add logging** (Small)
  - Log 2FA enable/disable events
  - Log failed 2FA attempts
  - Dependencies: All implementation

**Documentation**
- [ ] **Update user documentation** (Small)
  - How to enable 2FA
  - How to use recovery codes
  - What to do if locked out
  - Dependencies: Complete implementation

**Important Considerations:**
- Store recovery codes hashed, not plain text
- Generate 8-10 recovery codes, each single-use
- Use rate limiting to prevent brute force
- Consider account lockout after X failed 2FA attempts
- Provide support process for users locked out
- Consider backup admin bypass for emergencies

**Security Notes:**
- Never expose two_factor_secret in API responses
- Use HTTPS in production (required for security)
- Consider forcing 2FA for admin users
- Audit log all 2FA events

---

## Project Context Integration

This skill automatically considers:

**For Laravel Projects:**
- Existing service layer patterns
- How authentication is currently handled
- Queue and job configurations
- Testing structure (Feature/Unit)
- Middleware organization
- Route grouping patterns

**For All Projects:**
- Current folder structure
- Naming conventions
- Testing frameworks in use
- CI/CD requirements
- Documentation standards
- Code style guidelines

**General Considerations:**
- Database structure and naming
- API design patterns
- Frontend framework/approach
- Security practices
- Performance requirements
- Accessibility needs

## Task Complexity Estimates

- **Small (S)**: 15-30 minutes - Simple, straightforward tasks
- **Medium (M)**: 30-90 minutes - Moderate complexity, some decisions
- **Large (L)**: 2-4 hours - Complex logic, multiple components
- **Extra Large (XL)**: 4+ hours - Major feature, consider breaking down further

## Tips for Best Results

1. **Be Specific**: "Add payment processing with Stripe" is better than "add payments"
2. **Mention Constraints**: Share deadlines, technical limitations, or preferences
3. **Provide Context**: Mention if this relates to existing features
4. **Ask Questions**: The skill will ask clarifying questions when needed
5. **Iterate**: Use the todo list, then refine based on what you learn
6. **Review Codebase First**: Make sure your project is accessible for analysis

## Related Use Cases

- Sprint planning
- Feature estimation
- Backlog refinement
- Technical specifications
- Developer onboarding
- Architecture planning
- Code review preparation
