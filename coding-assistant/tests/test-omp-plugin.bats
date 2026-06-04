#!/usr/bin/env bats

load helpers

setup() {
  setup_base
}

teardown() {
  teardown_base
}

@test "package.json declares an OMP plugin manifest" {
  run node -e '
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    if (!pkg.omp || typeof pkg.omp !== "object") {
      console.error("missing omp manifest");
      process.exit(1);
    }
    if (pkg.omp.name !== "coding-assistant") {
      console.error(`unexpected omp.name: ${pkg.omp.name}`);
      process.exit(1);
    }
    if (pkg.omp.description !== pkg.description) {
      console.error("omp.description must match package description");
      process.exit(1);
    }
  ' "$REPO_ROOT/package.json"

  [ "$status" -eq 0 ]
}

@test "OMP manifest points to the core safety hook" {
  run node -e '
    const fs = require("fs");
    const path = require("path");
    const root = process.argv[1];
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    if (pkg.omp?.hooks !== "hooks/pre/core-safety.ts") {
      console.error(`unexpected omp.hooks: ${pkg.omp?.hooks}`);
      process.exit(1);
    }
    const hookPath = path.join(root, pkg.omp.hooks);
    if (!fs.existsSync(hookPath)) {
      console.error(`missing hook file: ${hookPath}`);
      process.exit(1);
    }
  ' "$REPO_ROOT"

  [ "$status" -eq 0 ]
}

@test "plugin release metadata versions agree" {
  run node -e '
    const fs = require("fs");
    const path = require("path");
    const root = process.argv[1];
    const repoRoot = path.dirname(root);
    const files = [
      path.join(root, "package.json"),
      path.join(root, "plugin.json"),
      path.join(root, ".claude-plugin/plugin.json"),
    ];
    const versions = files.map((file) => JSON.parse(fs.readFileSync(file, "utf8")).version);
    const marketplace = JSON.parse(fs.readFileSync(path.join(repoRoot, ".claude-plugin/marketplace.json"), "utf8"));
    const plugin = marketplace.plugins.find((entry) => entry.name === "coding-assistant");
    if (!plugin) {
      console.error("missing coding-assistant marketplace entry");
      process.exit(1);
    }
    versions.push(plugin.version);
    const expected = versions[0];
    const mismatch = versions.find((version) => version !== expected);
    if (mismatch) {
      console.error(`version mismatch: ${versions.join(", ")}`);
      process.exit(1);
    }
  ' "$REPO_ROOT"

  [ "$status" -eq 0 ]
}
