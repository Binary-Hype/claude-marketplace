---
name: code-visualizer
description: Visualizes a repository's own code as an interactive HTML map (code-map.html in the repo root) — the most used, biggest and most connected classes/files, the links between them, entry points, and the main data flows. Ignores framework and vendor code (Laravel, Shopware, Symfony, WordPress, node_modules, vendor) and asks before including third-party plugins such as Shopware custom/plugins. Supports PHP and JS/TS/Vue. Use when the user wants to visualize code, get a code map, repo overview, architecture or dependency graph, or understand which components matter most.
argument-hint: "Optional: sub-path to analyze instead of the repo root"
---

# Code Visualizer

Builds `code-map.html` in the repository root: an offline, self-contained page with rankings (most used, biggest, hubs, entry points), an interactive dependency graph, and data flows that you trace and describe.

The work is split so framework code can never pollute the result:

- **The bundled script extracts, it never decides scope.** `detect` reads manifests and folder listings only. `scan` reads files only below the `--include` roots you pass, and it always skips `vendor/`, `node_modules/`, build output, tests and secret files, even inside those roots.
- **You and the user decide the scope.** Third-party plugins are excluded unless the user includes them.
- **You add meaning.** You write short summaries for the most important components and name the main flows. You do this from the script's digest and the source files, never from guesses.

## Script location

The scripts live next to this file. Claude Code prints the skill's base directory when the skill loads ("Base directory for this skill: …"). Call it `SKILL_DIR`:

- `node "$SKILL_DIR/scripts/analyze.js" detect <repo>`
- `node "$SKILL_DIR/scripts/analyze.js" scan <repo> --include <path> [--include <path>…] [--exclude <path>…] [--with-tests] --out <graph.json>`
- `node "$SKILL_DIR/scripts/analyze.js" summary <graph.json> [--top 15]`
- `node "$SKILL_DIR/scripts/render.js" <graph.json> <annotations.json> <out.html>`

All paths passed to `--include`/`--exclude` are relative to the repo.

## Step 1: Preflight

1. Run `node --version`. If Node is missing, stop and tell the user to install Node.js 18 or newer. Do not fall back to reading the whole repo yourself.
2. Resolve the repo root with `git rev-parse --show-toplevel`. Fall back to the current directory when it isn't a git repo. If the user passed a sub-path, use it as the only include root later, and skip the plugin question unless the sub-path contains plugins.
3. Create a work directory outside the repo with `mktemp -d`. `graph.json` and `annotations.json` go there, never into the repo.

## Step 2: Detect

Run `detect`. It returns:

- `frameworks`: detected frameworks (for example `["shopware"]` or `["laravel", "vue"]`)
- `ownVendors`: vendor prefixes that mark the project's own packages
- `roots`: candidate folders. Each has `path`, `kind`, `files` (code file count), `suggested` and, for plugins and themes, `package`, `vendor`, `ownVendor`, `authors` and `hasGit`.
- `pluginFolders`: folders that hold plugins or themes, with counts of own and third-party entries.

## Step 3: Agree on the scope

Default scope = every root with `suggested: true`.

**Plugin and theme folders** (`custom/plugins`, `custom/static-plugins`, `custom/apps`, `wp-content/plugins`, `wp-content/themes`, …): if `pluginFolders` is non-empty, ask with AskUserQuestion, one question per plugin folder:

- **Only own plugins (Recommended)**: include entries with `ownVendor: true`. Name them in the description.
- **Ignore `<folder>` completely**
- **Include all of `<folder>`**
- **Pick individually**: follow up with a multi-select listing every plugin as `label (package, vendor)`, with own plugins listed first.

If no entry is marked `ownVendor`, don't recommend "Only own plugins". Say that the vendor could not be matched, and recommend "Pick individually" instead. A plugin with its own `.git` folder is usually developed in-house, so mention that as a hint.

**Other roots** with `suggested: false` (`database`, `config`) are offered in one multi-select only if they hold more than a handful of files. Otherwise leave them out and mention it in the final report.

Do not ask about obvious own-code roots (`app/`, `src/`, `routes/`, `resources/js`). Before scanning, show the final include list in one line.

If `roots` is empty, ask the user which folders contain their code.

## Step 4: Scan

Run `scan` with the agreed `--include` roots and `--out "$WORK/graph.json"`. The JSON on stdout reports file, node, edge, external and entry-point counts, plus any files that failed to parse.

- If `nodes` is 0, the scope is wrong. Show the include list and ask again.
- If `nodes` is above 3000, suggest narrowing the scope (fewer plugins, or excluding generated or legacy folders with `--exclude`) before continuing. The viewer copes, but the overview gets less useful.
- Mention any `failed` files in the final report. They are skipped, not fatal.

## Step 5: Understand and annotate

Run `summary` on the graph. It prints the groups, the top components by score, the most used and biggest components, the entry points with their downstream call trees, the data access, and the folded externals. Work from this digest. Do not load `graph.json` into context.

Then read the source of the top ~15 components by score, plus the entry points that lead into them. Read the `file:line-endLine` ranges the summary prints, not whole directories. Use parallel reads.

Write `$WORK/annotations.json`:

```json
{
  "overview": "2–4 sentences: what this codebase does, its main parts, and where execution enters.",
  "summaries": {
    "<node id exactly as printed>": "One sentence: what it does and why it matters."
  },
  "flows": [
    {
      "name": "Order export on checkout",
      "description": "1–2 sentences: trigger, what happens, outcome.",
      "data": "OrderEntity → ErpOrderPayload → HTTP POST /orders",
      "steps": ["<entry node id>", "<next node id>", "…"]
    }
  ]
}
```

Rules:

- **IDs must be copied exactly** from the summary output. These are fully qualified class names for PHP, repo-relative paths for JS/TS/Vue, and `ext:<name>` for externals. `render.js` drops unknown IDs and warns. Fix those warnings and re-run; don't ignore them.
- **Summaries:** cover the top components and every flow step. Describe what the code does, based on what you read. If you didn't read it, don't summarize it.
- **Flows:** write 3–8 of them, each with 2–8 steps. Every flow starts at an entry point (route, command, subscriber, listener, job, scheduled task, storefront/admin entry). Follow the downstream trees. A step may end in an external (`ext:…`) when data leaves the codebase, for example to an HTTP client or a queue.
- **`data`** names what travels along the flow (entities, DTOs, payloads, events, HTTP calls), in order.
- Hops without a graph edge are marked as inferred in the viewer. Keep them rare. They are acceptable only where the code really connects things indirectly (container lookups, string-based dispatch), and you verified that connection in the source.
- Small codebases may only have one or two real flows. Don't invent more.

## Step 6: Render and open

```bash
node "$SKILL_DIR/scripts/render.js" "$WORK/graph.json" "$WORK/annotations.json" "<repo>/code-map.html"
```

If it prints warnings, fix `annotations.json` and render again. Then open the page with `open "<repo>/code-map.html"` on macOS or `xdg-open` on Linux.

If `code-map.html` is not covered by `.gitignore` (check with `git check-ignore -q code-map.html`), offer to add it. Don't add it on your own. Nothing is committed.

## Step 7: Report

Keep the report short:

- Framework(s) detected and the scope: what was included, and which plugins and folders were left out.
- Counts: files, components, links, entry points.
- Top 5 most used and top 5 biggest components, by short name.
- Flow names, one line each.
- Anything skipped (parse failures, generated or oversized files) and the output path.

## What the viewer shows

So you can explain the page to the user:

- **Left: rankings.** Most used (fan-in), Biggest (lines or bytes), Hubs (fan-in × fan-out), Entry points, and Flows. Clicking an entry focuses that component.
- **Center: graph.**
  - Node size reflects lines of code, color reflects the group (plugin or top-level folder), and a ring marks an entry point.
  - Edge colors: purple for inheritance, grey for dependencies (injects, uses, instantiates, imports), orange for events (dispatches, listens), and green for routes and HTTP calls.
  - Controls:
    - "Top N" limits the graph to the most important components (150 by default).
    - "Group view" collapses everything to plugins and folders.
    - "Externals" shows the folded framework and library nodes.
    - Edge-type chips and group legend entries toggle what is shown.
- **Right: details.** Summary, file and line, metrics, routes, events, data access, flows the component belongs to, and its incoming and outgoing links.
- **Flow mode.** Shows the numbered path, dims everything else, and dashes inferred hops.

## Limits

- Extraction is regex-based, not a full parser. Dynamic calls (`$container->get($id)`, string class names, magic methods, facades resolved at runtime) produce no edges. When you notice such a gap in a flow, say so instead of papering over it.
- Twig, Blade and other templates are not analyzed.
- Only PHP and JS/TS/Vue are supported. Other languages are skipped silently, so mention it if the repo is mostly something else.
