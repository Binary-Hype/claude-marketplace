---
name: maintenance-turn
description: Runs a full maintenance pass over one or more web projects — update packages, run the test suites, clean up dead code, inconsistencies and duplication through parallel surveys and scoped fix agents, re-run the suites, then reset the local database and verify the result manually in the browser. DDEV-aware; built for Laravel/PHP apps with companion frontends or static sites.
argument-hint: "Projects in scope and any specific inconsistencies to fix (e.g. 'site and app; all fonts via spatie/google-fonts')"
disable-model-invocation: true
---

# Maintenance Turn

A maintenance turn has five steps and they always run in this order:

1. Update packages
2. Run tests (baseline)
3. Clean up code: dead code, inconsistencies, duplication (DRY), readability
4. Run tests (again, the full suite)
5. Manual test in the browser against a freshly reset and seeded local environment

The user's arguments name the projects in scope and often one or more concrete inconsistencies they already know about ("fonts are served three different ways, all of it should go through X"). Those named items are **requirements**, not suggestions — do them yourself, first, and completely. Everything the surveys find on top of that is judged on evidence.

Nothing is committed or pushed unless the user asks. Report what is uncommitted at the end.

## Step 0: Orient before touching anything

Collect all of this in parallel — none of it depends on the rest:

- **Project instructions and rules.** Read `CLAUDE.md` / `AGENTS.md` in each repo, and any committed rule directory (for example `.ai/rules/index.md` and every rule file matching the paths in scope). Rules record deliberate decisions; a cleanup that "fixes" a recorded decision is a regression.
- **User memory.** Honour recalled preferences: command wrappers (DDEV), commit/push policy, backwards-compatibility policy, attribution rules.
- **Repo layout.** A project folder may hold several independent git repos (app, site, plugin). Use absolute paths; relative `cd` into a folder named `app` inside a Laravel app lands in `app/app`.
- **Environment.** `ddev describe` per project. If `.ddev/` exists, run `composer`, `npm`, `artisan` through `ddev` — never fall back to the host when a ddev command looks like it might fail.
- **Baseline state.** `git status --short` and `git log --oneline -5` in every repo, so pre-existing dirt is not mistaken for your changes.
- **How the project verifies itself.** Composer scripts (`test`, `ci:check`, `lint`, `types:check`), npm scripts (`build`, `check`, worker tests), CI workflow steps, drift or mirror checks between repos (e.g. a site that mirrors a region of the app's JS/CSS and a script that diffs them).
- **What is outdated.** `ddev composer outdated --direct`, `ddev npm outdated` per repo.

Tell the user in one sentence what you are about to do before long-running work starts.

## Step 1: Update packages

- Update within existing constraints: `ddev composer update -W`, `ddev npm update` — per repo, in parallel where they don't share files.
- Watch post-update hooks: some rewrite tracked files (Boost guidelines, published Filament assets, `CLAUDE.md`). Note them in the report; re-read any instruction file they changed, because the rules may have moved under you.
- **Majors** are decided, not auto-applied:
  - The team's own package (a companion plugin, an internal library): read its changelog/commits. If the consuming code already handles the new contract, bump the constraint — the app is otherwise shipping a stale artifact.
  - Third-party majors with ecosystem risk (e.g. TypeScript major under a framework's checker): hold back and report why.
- Note warnings that matter later (npm install-script approvals, audit findings).

## Step 2: Baseline tests

Run the project's own full verification, not a subset:

- App: frontend build, worker/JS tests, formatter check, static analysis, full parallel test suite (usually one composer script does all of it).
- Site: type check, build (including post-build checks like CSP hash verification), mirror/drift checks.

If output is noisy (progress bars, dot matrices), filter to the summary and failures. A red baseline must be understood before cleanup starts — otherwise you cannot tell which failures you caused.

## Step 3: Cleanup

### 3a. Survey in parallel, read-only

Launch one read-only exploration agent per area, in a single message. Typical split:

- App backend (models, services, jobs, HTTP clients, config, routes, migrations/seeders)
- App frontend (views, components, CSS, JS, bundler config, mail/error templates)
- Each companion repo (site, plugin)

Every survey prompt must demand:

- `file:line` evidence for every item
- **grep for usages before claiming anything dead** (including tests, routes, config, views, framework auto-discovery, route model binding / scoped bindings)
- reading the committed rules first, so deliberate decisions are not flagged — and reporting code that contradicts a rule
- a dedicated catalogue for any inconsistency the user named (e.g. every way fonts reach a page)
- a prioritised list with a confidence per item, capped in length

### 3b. Do the user-named items yourself

While surveys run, handle the named inconsistency end to end in the main session:

- Read the installed package's source for the mechanism you are standardising on (config defaults, how it resolves disks/URLs, what it does on failure). Defaults are frequently wrong for the project's policy — e.g. a font package whose fallback links a third-party CDN in production.
- Route **every** consumer through one path (app layouts *and* admin panel *and* anything else that renders a `<head>`), and delete the old paths and their dependencies.
- Make failure degrade, not crash: a runtime download that throws on every page render takes down the login screen too. Catch, report, render without.
- Keep tests off the network: if every page render now touches the mechanism, seed or fake it in the base test case, and add one focused test for the success path, the failure path and each consumer.
- Verify against the real thing once (e.g. actually fetch the assets locally and inspect the output for remaining third-party references).
- Update docs that describe the old mechanism. Do not invent new rule entries unless the project's instructions allow it.

### 3c. Triage the survey results

Sort every finding into:

- **Apply** — high-confidence dead code, stale comments, clear bugs, security gaps against a recorded rule, untranslated strings, obvious duplication with an obvious home, N+1 queries.
- **Verify first** — legacy fallbacks (is the old data shape still written anywhere? still sent by a provider?), "only tests use it", rank/order disagreements between two call sites.
- **Defer and report** — anything needing a product/design decision (brand values, intended ordering), large component extractions, splitting oversized views, security-boundary checks that may or may not be redundant.

Premises are wrong more often than they look. Expect several survey items to be refuted on inspection; that is the process working.

### 3d. Apply through scoped fix agents

Fork one agent per area with **disjoint file ownership** in the shared working tree:

- Spell out which items each agent owns and which areas belong to the others.
- Forbid `git checkout`/`stash`/`reset` and repo-wide formatters; formatters run on explicit paths or `--dirty` only.
- Require verifying each premise before changing code, and reporting skipped items with the reason.
- Require reading matching rule files, updating rule sentences that the change makes stale, and not adding new rules.
- Require running the affected tests, static analysis on touched files, and a build after CSS/JS changes.
- Allow deleting test cases that only exercised deleted code, and require listing them.
- **Mirror regions**: code copied verbatim between repos is changed at the source of truth first; the copy is re-synced afterwards and the drift check re-run. A fix agent must not edit one side alone.
- No backwards-compatibility shims if the project has no external consumers.

Keep the user posted in a sentence as each agent reports back. Transient test failures while agents overlap are expected; only the final run counts.

## Step 4: Full verification

After all agents are done:

1. Re-sync any mirrored regions and re-run every drift check.
2. Run the formatter on dirty files, then the complete verification from Step 2 in every repo.
3. Scan for leftovers the agents can introduce: unused imports, stale diagnostics, a Vite `public/hot` file pointing at a dead dev server.

Everything must be green before Step 5. Report the exact numbers (tests passed/skipped, files analysed).

## Step 5: Manual browser test

- Reset and seed the local database **after** all changes (fix agents may have changed seeders): e.g. `ddev artisan migrate:fresh --seed --no-interaction`.
- Make sure built assets are current and no stale hot-reload marker exists.
- Load the browser tools once, in one batch; open a fresh tab; batch navigate/screenshot/inspect steps.
- On every page checked:
  - screenshot (scaled down)
  - console errors (start tracking, then reload so page-load errors are captured)
  - JS probes for the things the cleanup touched: loaded font faces and their URLs, absence of third-party hosts in the document, chart instances and ids rendered, hreflang values, theme toggle results
- Cover guest pages, the companion site (both locales, both themes, a docs page), then authenticated pages: index, detail, secondary views, settings, admin panel, language switch.
- **Never type passwords into a login form**, not even local seed credentials. Ask the user to sign in in the open tab, and continue after they confirm. Grant local-only flags (e.g. platform admin on the seeded user) through a tinker/CLI command against the local database and say so.
- Close the tabs you opened when done, unless the user wants them.

## Final report

Structure it by step, short:

- **1. Packages** — what moved, which majors were bumped and why, which were held back and why.
- **2 / 4. Tests** — commands and exact results, per repo.
- **3. Cleanup** — the named items first, then fixes grouped as bugs/security, dead code and legacy, shared abstractions, i18n, cross-repo sync. Mention findings refuted on inspection only briefly.
- **5. Manual test** — what was checked and what was seen.
- **Before deploying** — anything outside the repo that must change (deploy script steps, coupled releases of two repos).
- **Deferred** — items needing a decision, one line each.
- **Uncommitted** — state plainly that nothing was committed (unless the user asked).

## Guardrails

- Do not commit or push unless asked.
- Do not add dependencies beyond what the user requested; removing ones the cleanup made unused is fine.
- Do not publish, message, or change anything outside the local environment.
- Stop and ask when the cleanup would change product behaviour the rules or docs describe as deliberate.
