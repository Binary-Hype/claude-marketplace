---
description: Safely identifies and removes dead code in PHP/Laravel/Shopware projects with test verification at every step. Uses PHPStan, Psalm, composer-unused, and Deptrac for detection, then performs atomic deletions with test runs between each removal.
---

# Refactor Clean

Safely identify and remove dead code with test verification at every step.

## Step 1: Detect Dead Code

Run analysis tools based on project type:

| Tool | What It Finds | Command |
|------|--------------|---------|
| composer-unused | Unused Composer packages | `composer unused` |
| PHPStan | Dead code, unused methods | `phpstan analyse --level=max` |
| Psalm | Dead code, unused variables | `psalm --find-dead-code` |
| Deptrac | Architectural violations | `deptrac analyse` |
| Rector | Deprecated code patterns | `rector process --dry-run` |

**DDEV-aware**: If a `.ddev` directory exists, prefix all commands with `ddev exec`:
```bash
ddev exec composer unused
ddev exec php vendor/bin/phpstan analyse --level=max
ddev exec php vendor/bin/psalm --find-dead-code
```

If no tool is available, use Grep to find unused code:
```
# Find classes that are never referenced
# Find public methods with zero callers
# Find route definitions with no controller method
```

## Step 2: Categorize Findings

Sort findings into safety tiers:

| Tier | Examples | Action |
|------|----------|--------|
| **SAFE** | Unused private methods, unused imports, unused variables, dead helper functions | Delete with confidence |
| **CAUTION** | Public methods, Blade components, middleware, event listeners, service providers | Verify no dynamic usage or external consumers |
| **DANGER** | Config files, migration files, route files, Artisan commands, Shopware plugin files | Investigate before touching |

## Step 3: Safe Deletion Loop

For each SAFE item:

1. **Run full test suite** - Establish baseline (all green)
   ```bash
   php artisan test
   # or with DDEV:
   ddev exec php artisan test
   ```
2. **Delete the dead code** - Use Edit tool for surgical removal
3. **Re-run test suite** - Verify nothing broke
4. **If tests fail** - Immediately revert with `git checkout -- <file>` and skip this item
5. **If tests pass** - Move to next item

## Step 4: Handle CAUTION Items

Before deleting CAUTION items, check for dynamic usage:

### Laravel-Specific Checks
- **Blade components**: Search for `<x-component-name>` and `@component('name')` usage
- **Middleware**: Check `Kernel.php`, route files, and controller constructors for middleware references
- **Event listeners**: Search for `Event::dispatch()`, `event()` calls, and `$dispatchesEvents` model properties
- **Service providers**: Check `config/app.php` providers array and `composer.json` auto-discovery
- **Routes**: Search for `route('name')`, `action([Controller::class, 'method'])`, URL references
- **Jobs/Commands**: Check schedules in `Console/Kernel.php`, queued dispatches
- **Policies**: Check `AuthServiceProvider` and `$this->authorize()` calls
- **Form Requests**: Search controller method signatures for type-hinted requests

### Shopware-Specific Checks
- **Services**: Search `services.xml` and `services.yaml` for service references
- **Subscribers**: Check for `getSubscribedEvents()` return values
- **Plugin lifecycle**: Check `install()`, `update()`, `activate()`, `deactivate()` methods
- **Storefront/Admin extensions**: Search for `{% sw_extends %}` and twig block overrides
- **Deprecated APIs**: Check Shopware upgrade guides for deprecated methods

### General Checks
- Search for dynamic class resolution: `app()->make()`, `resolve()`, container bindings
- Search for string references: class names in config files, route names in JavaScript
- Check if exported from a public package API (`composer.json` autoload)

## Step 5: Consolidate Duplicates

After removing dead code, look for:
- Near-duplicate methods (>80% similar) - merge into one
- Redundant type definitions or interfaces - consolidate
- Wrapper functions that add no value - inline them
- Re-exports or service aliases that serve no purpose - remove indirection
- Multiple Action classes doing the same thing - consolidate

## Step 6: Summary

Report results:

```
Dead Code Cleanup
--------------------------------------
Deleted:   12 unused methods
            3 unused classes
            5 unused Composer packages
            2 unused Blade components
Skipped:    2 items (tests failed)
Saved:     ~450 lines removed
--------------------------------------
All tests passing
```

## Rules

- **Never delete without running tests first**
- **One deletion at a time** - Atomic changes make rollback easy
- **Skip if uncertain** - Better to keep dead code than break production
- **Don't refactor while cleaning** - Separate concerns (clean first, refactor later)
- **Never delete migration files** - They represent database history
- **Never delete Shopware plugin lifecycle methods** - Even if currently empty, they may be needed for updates
