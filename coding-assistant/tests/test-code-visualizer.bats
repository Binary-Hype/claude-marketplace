#!/usr/bin/env bats

load helpers

setup() {
  setup_base
  export ANALYZE="$REPO_ROOT/skills/code-visualizer/scripts/analyze.js"
  export RENDER="$REPO_ROOT/skills/code-visualizer/scripts/render.js"
  export FIXTURES="$REPO_ROOT/tests/fixtures/code-visualizer"
}

teardown() {
  teardown_base
}

# Evaluate a JS expression against a JSON file; `g` is the parsed document.
# Prints the result so tests can compare it.
json_eval() {
  node -e 'const g = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")); const r = eval(process.argv[2]); process.stdout.write(typeof r === "string" ? r : JSON.stringify(r));' "$1" "$2"
}

has_edge() {
  json_eval "$1" "g.edges.some((e) => e.source === '$2' && e.target === '$3' && e.type === '$4')"
}

scan_shopware() {
  node "$ANALYZE" scan "$FIXTURES/shopware" --include custom/plugins/AcmeErp --out "$TEST_TMPDIR/sw.json" >/dev/null
}

scan_laravel() {
  node "$ANALYZE" scan "$FIXTURES/laravel" --include app --include routes --include resources/js --out "$TEST_TMPDIR/l.json" >/dev/null
}

# =============================================================================
# detect
# =============================================================================

@test "detect: recognises Shopware and lists both plugins" {
  node "$ANALYZE" detect "$FIXTURES/shopware" > "$TEST_TMPDIR/d.json"
  [ "$(json_eval "$TEST_TMPDIR/d.json" 'g.frameworks.join(",")')" = "shopware" ]
  [ "$(json_eval "$TEST_TMPDIR/d.json" 'g.roots.map((r) => r.path).join(",")')" = "custom/plugins/AcmeErp,custom/plugins/SwagPayPal" ]
}

@test "detect: marks own plugin by vendor and third-party plugin as not own" {
  node "$ANALYZE" detect "$FIXTURES/shopware" > "$TEST_TMPDIR/d.json"
  [ "$(json_eval "$TEST_TMPDIR/d.json" 'g.roots.find((r) => r.path.endsWith("AcmeErp")).ownVendor')" = "true" ]
  [ "$(json_eval "$TEST_TMPDIR/d.json" 'g.roots.find((r) => r.path.endsWith("SwagPayPal")).ownVendor')" = "false" ]
  [ "$(json_eval "$TEST_TMPDIR/d.json" 'g.pluginFolders[0].thirdParty')" = "1" ]
}

@test "detect: counts plugin files without built assets" {
  node "$ANALYZE" detect "$FIXTURES/shopware" > "$TEST_TMPDIR/d.json"
  [ "$(json_eval "$TEST_TMPDIR/d.json" 'g.roots.find((r) => r.path.endsWith("AcmeErp")).files')" = "11" ]
}

@test "detect: recognises Laravel and suggests app, routes and resources/js" {
  node "$ANALYZE" detect "$FIXTURES/laravel" > "$TEST_TMPDIR/d.json"
  [ "$(json_eval "$TEST_TMPDIR/d.json" 'g.frameworks.includes("laravel")')" = "true" ]
  [ "$(json_eval "$TEST_TMPDIR/d.json" 'g.roots.filter((r) => r.suggested).map((r) => r.path).join(",")')" = "app,routes,resources/js" ]
}

# =============================================================================
# scan: scope
# =============================================================================

@test "scan: requires at least one include root" {
  run node "$ANALYZE" scan "$FIXTURES/shopware" --out "$TEST_TMPDIR/x.json"
  [ "$status" -eq 1 ]
  [[ "$output" == *"--include"* ]]
}

@test "scan: rejects include roots inside vendor" {
  run node "$ANALYZE" scan "$FIXTURES/shopware" --include vendor/shopware/core --out "$TEST_TMPDIR/x.json"
  [ "$status" -eq 1 ]
  [[ "$output" == *"always-excluded"* ]]
}

@test "scan: rejects include roots outside the repository" {
  run node "$ANALYZE" scan "$FIXTURES/shopware" --include ../laravel --out "$TEST_TMPDIR/x.json"
  [ "$status" -eq 1 ]
  [[ "$output" == *"outside the repository"* ]]
}

@test "scan: only the included plugin becomes nodes" {
  scan_shopware
  [ "$(json_eval "$TEST_TMPDIR/sw.json" 'g.nodes.every((n) => n.file.startsWith("custom/plugins/AcmeErp/"))')" = "true" ]
  [ "$(json_eval "$TEST_TMPDIR/sw.json" 'g.nodes.some((n) => n.id.startsWith("Swag\\"))')" = "false" ]
}

@test "scan: vendor and built assets are skipped even when the repo root is included" {
  node "$ANALYZE" scan "$FIXTURES/shopware" --include . --out "$TEST_TMPDIR/all.json" >/dev/null
  [ "$(json_eval "$TEST_TMPDIR/all.json" 'g.nodes.filter((n) => /^vendor\/|Resources\/public/.test(n.file)).length')" = "0" ]
  [ "$(json_eval "$TEST_TMPDIR/all.json" 'g.nodes.some((n) => n.id.startsWith("Shopware\\"))')" = "false" ]
}

@test "scan: framework classes are folded into external nodes" {
  scan_shopware
  [ "$(json_eval "$TEST_TMPDIR/sw.json" 'g.externals.map((e) => e.id).includes("ext:Shopware\\Core")')" = "true" ]
  [ "$(has_edge "$TEST_TMPDIR/sw.json" 'Acme\\Erp\\AcmeErp' 'ext:Shopware\\Core' extends)" = "true" ]
}

@test "scan: secret files are never read, even with a code extension" {
  cp -R "$FIXTURES/shopware" "$TEST_TMPDIR/repo"
  printf '<?php\nclass LeakedSecret {}\n' > "$TEST_TMPDIR/repo/custom/plugins/AcmeErp/src/.env.php"
  printf '<?php\nclass LeakedKey {}\n' > "$TEST_TMPDIR/repo/custom/plugins/AcmeErp/src/secrets.php"
  run bash -c 'CODE_VISUALIZER_DEBUG=1 node "$1" scan "$2" --include custom/plugins/AcmeErp --out "$3" 2>&1 >/dev/null' _ "$ANALYZE" "$TEST_TMPDIR/repo" "$TEST_TMPDIR/s.json"
  [ "$status" -eq 0 ]
  [[ "$output" == *"OrderSubscriber.php"* ]]
  [[ "$output" != *".env.php"* ]]
  [[ "$output" != *"secrets.php"* ]]
  [ "$(json_eval "$TEST_TMPDIR/s.json" 'g.nodes.some((n) => /Leaked/.test(n.id))')" = "false" ]
}

@test "scan: tests are excluded by default and included with --with-tests" {
  scan_laravel
  [ "$(json_eval "$TEST_TMPDIR/l.json" 'g.nodes.some((n) => n.id.startsWith("Tests\\"))')" = "false" ]
  node "$ANALYZE" scan "$FIXTURES/laravel" --include app --include tests --with-tests --out "$TEST_TMPDIR/t.json" >/dev/null
  [ "$(json_eval "$TEST_TMPDIR/t.json" 'g.nodes.some((n) => n.id === "Tests\\Feature\\OrderTest")')" = "true" ]
}

# =============================================================================
# scan: PHP extraction (Shopware)
# =============================================================================

@test "php: subscriber listens to the framework event and is an entry point" {
  scan_shopware
  [ "$(has_edge "$TEST_TMPDIR/sw.json" 'Acme\\Erp\\Subscriber\\OrderSubscriber' 'ext:Shopware\\Core' listens)" = "true" ]
  [ "$(json_eval "$TEST_TMPDIR/sw.json" 'g.nodes.find((n) => n.name === "OrderSubscriber").entry.join(",")')" = "subscriber" ]
  [ "$(json_eval "$TEST_TMPDIR/sw.json" 'g.nodes.find((n) => n.name === "OrderSubscriber").listensTo.join(",")')" = "CheckoutOrderPlacedEvent" ]
}

@test "php: dispatch(new Event) produces a dispatches edge" {
  scan_shopware
  [ "$(has_edge "$TEST_TMPDIR/sw.json" 'Acme\\Erp\\Subscriber\\OrderSubscriber' 'Acme\\Erp\\Event\\OrderExportedEvent' dispatches)" = "true" ]
}

@test "php: constructor injection produces injects edges" {
  scan_shopware
  [ "$(has_edge "$TEST_TMPDIR/sw.json" 'Acme\\Erp\\Service\\ErpExportService' 'Acme\\Erp\\Service\\ErpClient' injects)" = "true" ]
  [ "$(has_edge "$TEST_TMPDIR/sw.json" 'Acme\\Erp\\Subscriber\\OrderSubscriber' 'Acme\\Erp\\Service\\ErpExportService' injects)" = "true" ]
}

@test "php: route attribute marks controller as entry point with its path" {
  scan_shopware
  [ "$(json_eval "$TEST_TMPDIR/sw.json" 'g.nodes.find((n) => n.name === "ErpController").routes.join(",")')" = "/api/_action/acme-erp/sync" ]
}

@test "php: repository injection is recorded as data access" {
  scan_shopware
  [ "$(json_eval "$TEST_TMPDIR/sw.json" 'g.nodes.find((n) => n.name === "ErpExportService").dataAccess.join(",")')" = "order" ]
}

@test "php: comments and strings do not create classes or edges" {
  scan_shopware
  [ "$(json_eval "$TEST_TMPDIR/sw.json" 'g.nodes.some((n) => /Fake|NotARealClass/.test(n.id)) || g.externals.some((e) => /NotARealClass|Nothing/.test(e.id))')" = "false" ]
}

@test "js: admin imports resolve to files and built assets stay out" {
  scan_shopware
  local base='custom/plugins/AcmeErp/src/Resources/app/administration/src'
  [ "$(has_edge "$TEST_TMPDIR/sw.json" "$base/main.js" "$base/module/acme-erp/index.js" imports)" = "true" ]
  [ "$(has_edge "$TEST_TMPDIR/sw.json" "$base/module/acme-erp/index.js" "$base/module/acme-erp/page/acme-erp-list/index.js" imports)" = "true" ]
}

# =============================================================================
# scan: Laravel
# =============================================================================

@test "laravel: route file marks the controller as route entry point" {
  scan_laravel
  [ "$(has_edge "$TEST_TMPDIR/l.json" 'routes/web.php' 'App\\Http\\Controllers\\OrderController' routes)" = "true" ]
  [ "$(json_eval "$TEST_TMPDIR/l.json" 'g.nodes.find((n) => n.name === "OrderController").routes.join(",")')" = "POST /orders" ]
}

@test "laravel: constructor injection, events, jobs and listeners are linked" {
  scan_laravel
  [ "$(has_edge "$TEST_TMPDIR/l.json" 'App\\Http\\Controllers\\OrderController' 'App\\Services\\OrderService' injects)" = "true" ]
  [ "$(has_edge "$TEST_TMPDIR/l.json" 'App\\Http\\Controllers\\OrderController' 'App\\Events\\OrderPlaced' dispatches)" = "true" ]
  [ "$(has_edge "$TEST_TMPDIR/l.json" 'App\\Http\\Controllers\\OrderController' 'App\\Jobs\\ProcessOrder' dispatches)" = "true" ]
  [ "$(has_edge "$TEST_TMPDIR/l.json" 'App\\Listeners\\SendOrderConfirmation' 'App\\Events\\OrderPlaced' listens)" = "true" ]
  [ "$(json_eval "$TEST_TMPDIR/l.json" 'g.nodes.find((n) => n.name === "ProcessOrder").entry.join(",")')" = "job" ]
}

@test "laravel: Illuminate is folded into one external node" {
  scan_laravel
  [ "$(json_eval "$TEST_TMPDIR/l.json" 'g.externals.filter((e) => e.name.startsWith("Illuminate")).map((e) => e.id).join(",")')" = "ext:Illuminate" ]
  [ "$(has_edge "$TEST_TMPDIR/l.json" 'App\\Models\\Order' 'ext:Illuminate' extends)" = "true" ]
}

@test "laravel: vue imports resolve via @ alias and packages become externals" {
  scan_laravel
  [ "$(has_edge "$TEST_TMPDIR/l.json" 'resources/js/app.js' 'resources/js/components/Orders.vue' imports)" = "true" ]
  [ "$(has_edge "$TEST_TMPDIR/l.json" 'resources/js/components/Orders.vue' 'resources/js/components/OrderRow.vue' imports)" = "true" ]
  [ "$(has_edge "$TEST_TMPDIR/l.json" 'resources/js/bootstrap.js' 'ext:axios' imports)" = "true" ]
}

@test "laravel: frontend fetch to a scanned route links to its controller" {
  scan_laravel
  [ "$(has_edge "$TEST_TMPDIR/l.json" 'resources/js/components/Orders.vue' 'App\\Http\\Controllers\\OrderController' calls)" = "true" ]
}

# =============================================================================
# summary + render
# =============================================================================

@test "summary: prints rankings, entry points and externals" {
  scan_shopware
  run node "$ANALYZE" summary "$TEST_TMPDIR/sw.json"
  [ "$status" -eq 0 ]
  [[ "$output" == *"TOP 15 BY SCORE"* ]]
  [[ "$output" == *"ENTRY POINTS (3)"* ]]
  [[ "$output" == *"Shopware\\Core"* ]]
}

@test "render: embeds data, drops unknown ids and marks inferred hops" {
  scan_shopware
  cat > "$TEST_TMPDIR/ann.json" <<'EOF'
{
  "overview": "ERP plugin </script><script>alert(1)</script>",
  "summaries": { "Acme\\Erp\\Service\\ErpClient": "Sends payloads.", "Nope\\Missing": "dropped" },
  "flows": [{ "name": "Export", "steps": ["Acme\\Erp\\Subscriber\\OrderSubscriber", "Acme\\Erp\\Service\\ErpExportService", "Acme\\Erp\\AcmeErp"] }]
}
EOF
  run node "$RENDER" "$TEST_TMPDIR/sw.json" "$TEST_TMPDIR/ann.json" "$TEST_TMPDIR/out.html"
  [ "$status" -eq 0 ]
  [[ "$output" == *"unknown node dropped: Nope\\Missing"* ]]
  ! grep -q '__CODE_MAP_DATA__' "$TEST_TMPDIR/out.html"
  ! grep -q '</script><script>alert' "$TEST_TMPDIR/out.html"
  grep -q 'Sends payloads.' "$TEST_TMPDIR/out.html"
  grep -q '"inferred":false' "$TEST_TMPDIR/out.html"
  grep -q '"inferred":true' "$TEST_TMPDIR/out.html"
}

@test "render: works without annotations" {
  scan_laravel
  run node "$RENDER" "$TEST_TMPDIR/l.json" - "$TEST_TMPDIR/out.html"
  [ "$status" -eq 0 ]
  grep -q '"flows":\[\]' "$TEST_TMPDIR/out.html"
}
