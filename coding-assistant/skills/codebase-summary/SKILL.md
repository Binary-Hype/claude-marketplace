---
name: codebase-summary
description: Analyzes a codebase and generates a comprehensive summary document for new developers. Detects tech stack, architecture, conventions, entry points, workflows, and domain concepts across PHP, Node.js, Python, Go, Rust, Ruby, Java, and .NET projects.
---

# Codebase Summary

You are an expert software architect and technical writer. Your mission is to analyze a codebase and produce a comprehensive onboarding document that lets a new developer understand the project quickly — its tech stack, architecture, conventions, entry points, development workflow, and domain concepts.

## When to Use

- New developer joining a team and needs to get productive fast
- Project lacks documentation or existing docs are outdated
- Taking over maintenance of an unfamiliar codebase
- Briefing a contractor or external collaborator
- Returning to a project after extended time away
- Starting work on an unfamiliar open-source project

## Core Responsibilities

1. **Tech Stack Detection** — Identify languages, frameworks, and versions from manifest files (composer.json, package.json, go.mod, Cargo.toml, Gemfile, requirements.txt, pom.xml, *.csproj)
2. **Architecture Mapping** — Map directory structure and identify architectural patterns (MVC, DDD, hexagonal, modular monolith, microservices)
3. **Entry Point Discovery** — Find routes, CLI commands, schedulers, event listeners, and queue workers
4. **Configuration Analysis** — Analyze .env.example, framework configs, and external service integrations
5. **Workflow Extraction** — Extract install, run, test, build, and deploy commands from README, Makefile, package.json scripts, Docker/DDEV configs
6. **Convention Detection** — Identify linter configs, style rules, and naming patterns from sampled source files
7. **Dependency Overview** — Categorize dependencies by purpose (auth, payments, ORM, testing, etc.)
8. **Test Infrastructure** — Detect test framework, test locations, run commands, and factories/fixtures
9. **Deployment Analysis** — Identify CI/CD pipelines, environments, and hosting platform
10. **Domain Modeling** — Discover key entities, relationships, and business logic locations

## Analysis Workflow

### Step 1: Detect Tech Stack

```
# Find manifest files
Glob: pattern="composer.json"
Glob: pattern="package.json"
Glob: pattern="go.mod"
Glob: pattern="Cargo.toml"
Glob: pattern="Gemfile"
Glob: pattern="requirements.txt"
Glob: pattern="pyproject.toml"
Glob: pattern="pom.xml"
Glob: pattern="**/*.csproj"

# Read detected manifests for framework and version info
Read: composer.json  # Laravel, Shopware, Symfony, plain PHP
Read: package.json   # React, Vue, Angular, Next.js, Nuxt, etc.

# Check runtime versions
Glob: pattern=".php-version"
Glob: pattern=".node-version"
Glob: pattern=".nvmrc"
Glob: pattern=".python-version"
Glob: pattern=".ruby-version"
Glob: pattern=".tool-versions"
Glob: pattern="rust-toolchain.toml"
```

### Step 2: Map Architecture and Directory Structure

```
# Get top-level structure
Bash: ls -1

# Get 2-level deep tree (lightweight)
Bash: find . -maxdepth 2 -type d -not -path '*/\.*' -not -path '*/node_modules/*' -not -path '*/vendor/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/build/*' | sort

# Identify architectural patterns
Glob: pattern="app/Http/Controllers/**/*.php"    # Laravel MVC
Glob: pattern="src/Domain/**/*"                   # DDD
Glob: pattern="src/Modules/**/*"                  # Modular
Glob: pattern="app/Models/**/*.php"               # Eloquent models
Glob: pattern="src/**/*.go"                       # Go project
Glob: pattern="src/**/*.rs"                       # Rust project
```

### Step 3: Discover Entry Points

```
# Routes
Glob: pattern="routes/*.php"                      # Laravel
Grep: pattern="Route::(get|post|put|delete|resource|apiResource)" path="routes"
Glob: pattern="src/routes/**/*"                   # Node.js
Glob: pattern="config/routes.rb"                  # Rails

# CLI commands
Glob: pattern="app/Console/Commands/**/*.php"     # Laravel
Grep: pattern="protected \$signature" path="app/Console/Commands"
Glob: pattern="src/Command/**/*.php"              # Symfony

# Schedulers
Grep: pattern="->schedule\(" path="app"
Grep: pattern="schedule:run" path="."
Glob: pattern="**/crontab*"
Glob: pattern="**/schedule*"

# Queue workers / Event listeners
Glob: pattern="app/Jobs/**/*.php"
Glob: pattern="app/Listeners/**/*.php"
Glob: pattern="app/Events/**/*.php"
```

### Step 4: Analyze Configuration

```
# Environment config
Read: .env.example
Read: .env.dist

# Framework configuration
Glob: pattern="config/*.php"                      # Laravel/PHP
Glob: pattern="config/*.ts"                       # Node.js
Glob: pattern="config/*.yml"                      # Symfony/Rails

# Database config
Grep: pattern="DB_CONNECTION|DB_HOST|DB_DATABASE" path=".env.example"
Read: config/database.php
```

### Step 5: Extract Development Workflow

```
# README for setup instructions
Read: README.md

# Makefile / Taskfile
Read: Makefile
Read: Taskfile.yml

# Package scripts
# Already read in Step 1 — extract "scripts" block from package.json

# Docker / DDEV
Glob: pattern="docker-compose*.yml"
Glob: pattern="Dockerfile*"
Glob: pattern=".ddev/config.yaml"
Read: .ddev/config.yaml    # If DDEV detected

# Dev server configs
Glob: pattern="vite.config.*"
Glob: pattern="webpack.config.*"
Glob: pattern="next.config.*"
Glob: pattern="nuxt.config.*"
```

### Step 6: Detect Code Conventions

```
# Linters and formatters
Glob: pattern=".eslintrc*"
Glob: pattern="eslint.config.*"
Glob: pattern=".prettierrc*"
Glob: pattern="phpstan.neon*"
Glob: pattern="pint.json"
Glob: pattern=".php-cs-fixer*"
Glob: pattern="psalm.xml"
Glob: pattern=".editorconfig"
Glob: pattern="biome.json*"
Glob: pattern=".stylelintrc*"
Glob: pattern="rustfmt.toml"
Glob: pattern=".golangci.yml"
Glob: pattern=".rubocop.yml"

# Read a few sample source files to observe naming conventions
# (pick 2-3 files from core application code — controllers, services, models)
```

### Step 7: Survey Dependencies and Integrations

```
# Read dependency files (already obtained in Step 1)
# Categorize by purpose:
# - Framework core
# - Authentication (sanctum, passport, JWT, devise, passport.js)
# - Payments (stripe, braintree, paddle)
# - ORM / Database (eloquent, prisma, typeorm, gorm)
# - Queue / Messaging (redis, rabbitmq, SQS)
# - Storage / Files (S3, flysystem)
# - Email (mailgun, SES, sendgrid)
# - Search (algolia, meilisearch, elasticsearch)
# - Testing (phpunit, pest, jest, pytest)
# - Dev tooling (debugbar, telescope, devtools)
```

### Step 8: Analyze Test Infrastructure

```
# Test configuration
Glob: pattern="phpunit.xml*"
Glob: pattern="pest.php"
Glob: pattern="jest.config.*"
Glob: pattern="vitest.config.*"
Glob: pattern="pytest.ini"
Glob: pattern="pyproject.toml"
Glob: pattern=".rspec"
Glob: pattern="cypress.config.*"
Glob: pattern="playwright.config.*"

# Test files
Glob: pattern="tests/**/*Test.php"
Glob: pattern="tests/**/*.test.*"
Glob: pattern="**/*.spec.*"
Glob: pattern="test/**/*_test.go"

# Factories / Fixtures
Glob: pattern="database/factories/**/*.php"
Glob: pattern="tests/fixtures/**/*"
Glob: pattern="spec/factories/**/*"
```

### Step 9: Analyze Deployment and CI/CD

```
# CI/CD pipelines
Glob: pattern=".github/workflows/*.yml"
Glob: pattern=".gitlab-ci.yml"
Glob: pattern="Jenkinsfile"
Glob: pattern="bitbucket-pipelines.yml"
Glob: pattern=".circleci/config.yml"

# Hosting / Platform
Glob: pattern="Procfile"                          # Heroku
Glob: pattern="fly.toml"                          # Fly.io
Glob: pattern="vercel.json"                       # Vercel
Glob: pattern="netlify.toml"                      # Netlify
Glob: pattern="app.yaml"                          # Google App Engine
Glob: pattern="render.yaml"                       # Render
Glob: pattern="forge-deploy.sh"                   # Laravel Forge
Glob: pattern=".platform.app.yaml"                # Platform.sh

# Read CI workflow files
Read: .github/workflows/*.yml   # Read all workflow files found
```

### Step 10: Identify Domain Concepts

```
# Models / Entities
Glob: pattern="app/Models/**/*.php"
Glob: pattern="src/Entity/**/*.php"
Glob: pattern="src/models/**/*"
Glob: pattern="app/models/**/*"

# Services / Business logic
Glob: pattern="app/Services/**/*.php"
Glob: pattern="app/Actions/**/*.php"
Glob: pattern="src/services/**/*"

# Migrations (reveal schema evolution)
Glob: pattern="database/migrations/*.php"
Glob: pattern="migrations/**/*"

# Events (reveal business processes)
Glob: pattern="app/Events/**/*.php"
Glob: pattern="app/Listeners/**/*.php"
```

## Focus Areas

### 1. Project Identity (CRITICAL)

Answer the question: **What does this project do?** Look at README.md, composer.json/package.json description, and overall structure to understand the project's purpose and target audience.

### 2. Tech Stack Accuracy (CRITICAL)

Report exact versions found in manifest and lock files. Present as a clear table:

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | PHP | 8.3 |
| Framework | Laravel | 11.x |
| Frontend | Vue.js | 3.4 |
| Database | MySQL | 8.0 |
| Cache | Redis | 7.x |

### 3. Getting Started Steps (HIGH)

Provide copy-pasteable commands to get the project running locally. Be DDEV-aware — if `.ddev/` exists, prefix commands accordingly. Include:
- Prerequisites (PHP, Node, Docker, DDEV, etc.)
- Clone + install steps
- Environment setup (.env copy)
- Database setup (migrations, seeders)
- Build step (npm/yarn/bun)
- Run step (serve command)

### 4. Architecture Decision Records (HIGH)

Infer architectural decisions from the directory structure and patterns observed:
- Why this framework?
- MVC vs DDD vs modular structure?
- Monolith vs microservices?
- API-only vs full-stack?
- What patterns are used (Repository, Action, Service, Event-driven)?

### 5. Key Files Quick Reference (MEDIUM)

List the files a developer will touch most frequently — the "hot files" of the project:
- Main route files
- Core models/entities
- Base controllers or actions
- Configuration files
- Main layout/template

### 6. External Services Map (MEDIUM)

Extract from .env.example all external service integrations:

| Service | Purpose | Env Vars |
|---------|---------|----------|
| Stripe | Payments | STRIPE_KEY, STRIPE_SECRET |
| AWS S3 | File storage | AWS_BUCKET, AWS_KEY |
| Mailgun | Email | MAILGUN_DOMAIN, MAILGUN_SECRET |

### 7. Domain Model Relationships (MEDIUM)

From models, migrations, and entity definitions, identify:
- Key entities and their relationships (belongs_to, has_many, etc.)
- Core business objects
- Where business logic lives (models, services, actions)

## Report Format

```markdown
# Codebase Summary: [Project Name]

**Generated**: [Date]
**Analyzed by**: Claude Code — Codebase Summary Skill

---

## What Is This Project?

[1-3 paragraph description: what the project does, who it's for, and its core purpose. Derived from README, manifest descriptions, and overall structure.]

---

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | [e.g., PHP] | [e.g., 8.3] |
| Framework | [e.g., Laravel] | [e.g., 11.x] |
| Frontend | [e.g., Vue.js + Inertia] | [e.g., 3.4] |
| Database | [e.g., MySQL] | [e.g., 8.0] |
| Cache | [e.g., Redis] | [e.g., 7.x] |
| Build Tool | [e.g., Vite] | [e.g., 5.x] |
| Package Manager | [e.g., Composer + npm] | [versions] |

---

## Getting Started

### Prerequisites

- [List required software and versions]

### Setup

```bash
# Clone and install
git clone [repo-url]
cd [project-dir]
[install commands — composer install, npm install, etc.]

# Environment
cp .env.example .env
[generate app key, configure database, etc.]

# Database
[migration and seeder commands]

# Build assets
[npm run dev / build commands]

# Start development server
[serve command]
```

---

## Project Architecture

### Directory Structure

```
[2-level directory tree of key directories]
```

### Pattern: [MVC / DDD / Modular / etc.]

[Brief description of the architectural pattern used and how files are organized.]

### Request Lifecycle

[How a typical request flows through the application — middleware → controller → service → response.]

---

## Entry Points

### Web Routes

| Method | URI | Controller | Purpose |
|--------|-----|-----------|---------|
| [Summary of key route groups] |

### API Routes

| Method | URI | Purpose |
|--------|-----|---------|
| [Summary of API endpoints] |

### CLI Commands

| Command | Purpose |
|---------|---------|
| [Custom artisan/CLI commands] |

### Scheduled Tasks

| Schedule | Task | Purpose |
|----------|------|---------|
| [Cron jobs and scheduled commands] |

---

## Configuration

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| [Key env vars from .env.example] |

### External Services

| Service | Purpose | Config |
|---------|---------|--------|
| [Integrations detected from .env.example and config files] |

---

## Code Conventions

### Naming

- **Classes**: [PascalCase / snake_case / etc.]
- **Methods**: [camelCase / snake_case / etc.]
- **Files**: [Observed naming patterns]
- **Database**: [Table/column naming observed in migrations]

### Style Tools

| Tool | Config File |
|------|-------------|
| [PHPStan, ESLint, Prettier, Pint, etc.] |

### Observed Patterns

- [Patterns observed in sampled files: strict types, return types, readonly properties, etc.]

---

## Key Dependencies

### Backend

| Package | Purpose | Version |
|---------|---------|---------|
| [Categorized by function: auth, payments, ORM, etc.] |

### Frontend

| Package | Purpose | Version |
|---------|---------|---------|
| [UI framework, state management, HTTP client, etc.] |

---

## Testing

### Framework

[Pest/PHPUnit/Jest/Vitest/pytest/etc.]

### Run Tests

```bash
[Exact test commands]
```

### Structure

```
[Test directory layout]
```

### Factories / Fixtures

[Where test data is defined and how to use it]

---

## Deployment

### CI/CD

[GitHub Actions / GitLab CI / etc. — describe the pipeline stages]

### Environments

| Environment | URL | Branch | Notes |
|-------------|-----|--------|-------|
| [Production, staging, etc.] |

---

## Domain Concepts

### Key Entities

| Entity | Description | Key Relationships |
|--------|------------|-------------------|
| [Core domain models] |

### Business Logic Locations

| Concern | Location |
|---------|----------|
| [Where key business rules live — models, services, actions, etc.] |

### Data Flow

[How data moves through the system for key operations]

---

## Files You Will Touch Most

| File/Directory | Purpose | When |
|---------------|---------|------|
| [Hot files a new developer will edit frequently] |

---

## Gotchas and Tribal Knowledge

- [Non-obvious things discovered during analysis: unusual patterns, workarounds, legacy code areas, etc.]

---

## Further Reading

- [Links to README, wiki, API docs, external documentation, or framework guides relevant to this project]
```

## Success Criteria

Your analysis is successful when:

- Tech stack versions are accurate (verified from manifest and lock files, not guessed)
- Getting started steps are copy-pasteable and would actually work
- All entry points are discovered (routes, CLI, schedulers, queue workers)
- External services are documented with their env var names
- Code conventions are observed from actual files, not assumed from framework defaults
- DDEV is detected and commands are prefixed accordingly when present
- The report is structured as a complete onboarding document a developer can follow on day one
- Domain concepts reflect the actual business logic, not generic framework boilerplate

## Execution Mode

- **Quick check** (< 20 files in the project): Execute these instructions directly in the main session
- **Full analysis** (standard project): Delegate to a Task agent for context isolation:
  ```
  Task(subagent_type="general-purpose", model="sonnet", prompt="Follow the Codebase Summary skill instructions to analyze this project and generate an onboarding document")
  ```
- **Cost-optimized**: Use `model="haiku"` for small projects with standard framework structures
