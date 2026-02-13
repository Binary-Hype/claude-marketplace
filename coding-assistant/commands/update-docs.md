---
description: Syncs documentation with the codebase for PHP/Laravel/Shopware projects. Generates from source-of-truth files like composer.json, .env.example, route definitions, and artisan commands. Preserves manually written sections.
---

# Update Documentation

Sync documentation with the codebase, generating from source-of-truth files.

## Step 1: Identify Sources of Truth

| Source | Generates |
|--------|-----------|
| `composer.json` scripts | Available commands reference |
| `.env.example` | Environment variable documentation |
| `routes/api.php`, `routes/web.php` | API/route endpoint reference |
| `php artisan route:list` | Complete route listing |
| `php artisan` (command list) | Artisan command reference |
| Source code (controllers, actions) | Public API documentation |
| `.ddev/config.yaml` | DDEV/infrastructure setup docs |
| `config/*.php` | Configuration reference |

### Shopware-Specific Sources

| Source | Generates |
|--------|-----------|
| Plugin `composer.json` | Plugin metadata and dependencies |
| `config/services.xml` | Service reference |
| `src/Resources/config/` | Plugin configuration reference |
| `bin/console` commands | Shopware CLI reference |
| `CHANGELOG.md` | Plugin changelog |

## Step 2: Generate Command Reference

1. Read `composer.json` scripts section
2. List `php artisan` commands (or `ddev exec php artisan list`)
3. Extract all commands with their descriptions
4. Generate a reference table:

```markdown
| Command | Description |
|---------|-------------|
| `composer dev` | Start development environment |
| `php artisan serve` | Start local development server |
| `php artisan migrate` | Run pending database migrations |
| `php artisan test` | Run test suite with Pest |
| `php artisan route:list` | List all registered routes |
| `php artisan queue:work` | Process queued jobs |
```

**DDEV-aware**: If a `.ddev` directory exists, prefix commands:
```markdown
| Command | Description |
|---------|-------------|
| `ddev start` | Start DDEV environment |
| `ddev exec php artisan migrate` | Run migrations |
| `ddev exec php artisan test` | Run tests |
| `ddev composer install` | Install dependencies |
| `ddev npm run build` | Build frontend assets |
```

## Step 3: Generate Environment Documentation

1. Read `.env.example` (Laravel standard)
2. Extract all variables with their purposes
3. Categorize as required vs optional
4. Document expected format and valid values

```markdown
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `APP_KEY` | Yes | Application encryption key | `base64:...` (run `php artisan key:generate`) |
| `DB_CONNECTION` | Yes | Database driver | `mysql`, `pgsql`, `sqlite` |
| `DB_HOST` | Yes | Database host | `127.0.0.1` or `db` (DDEV) |
| `DB_DATABASE` | Yes | Database name | `my_app` |
| `MAIL_MAILER` | No | Mail driver (default: log) | `smtp`, `mailgun`, `ses` |
| `QUEUE_CONNECTION` | No | Queue driver (default: sync) | `redis`, `database`, `sqs` |
```

## Step 4: Generate Route Documentation

1. Run `php artisan route:list --json` (or `ddev exec php artisan route:list --json`)
2. Parse the JSON output
3. Group by prefix or controller
4. Generate endpoint reference:

```markdown
### User Management

| Method | URI | Controller | Middleware |
|--------|-----|------------|------------|
| GET | `/api/v1/users` | UserController@index | auth:sanctum |
| POST | `/api/v1/users` | UserController@store | auth:sanctum |
| GET | `/api/v1/users/{user}` | UserController@show | auth:sanctum |
```

## Step 5: Update Contributing Guide

Generate or update `docs/CONTRIBUTING.md` with:
- Development environment setup (DDEV, Composer, Node prerequisites)
- Available composer scripts and their purposes
- Testing procedures (`php artisan test`, Pest conventions)
- Code style enforcement (Laravel Pint, PHPStan level)
- PR submission checklist
- Shopware-specific: plugin installation, theme compilation

## Step 6: Update Deployment / Runbook

Generate or update `docs/RUNBOOK.md` with:
- Deployment procedures (step-by-step)
- Health check endpoints and monitoring
- Common issues and their fixes (migrations, cache, queues)
- Rollback procedures (`php artisan migrate:rollback`)
- Queue and scheduler management
- Shopware-specific: plugin lifecycle, cache clearing (`bin/console cache:clear`)

## Step 7: Staleness Check

1. Find documentation files not modified in 90+ days
2. Cross-reference with recent source code changes
3. Flag potentially outdated docs for manual review

```
# Check for stale docs
find docs/ -name "*.md" -mtime +90 -type f
```

## Step 8: Show Summary

```
Documentation Update
--------------------------------------
Updated:  docs/CONTRIBUTING.md (commands table)
Updated:  docs/ENV.md (3 new variables)
Generated: docs/API.md (from route:list)
Flagged:  docs/DEPLOY.md (142 days stale)
Skipped:  docs/ARCHITECTURE.md (no changes detected)
--------------------------------------
```

## Rules

- **Single source of truth**: Always generate from code, never manually edit generated sections
- **Preserve manual sections**: Only update generated sections; leave hand-written prose intact
- **Mark generated content**: Use `<!-- AUTO-GENERATED -->` markers around generated sections
- **Don't create docs unprompted**: Only create new doc files if the command explicitly requests it
- **DDEV-aware**: Always check for `.ddev` directory and adjust commands accordingly
- **Shopware-aware**: Check for Shopware plugin structure and include plugin-specific docs
