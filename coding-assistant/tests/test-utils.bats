#!/usr/bin/env bats

load helpers

setup() {
  setup_base
}

teardown() {
  teardown_base
}

# =============================================================================
# matchesGlob tests
# =============================================================================

@test "matchesGlob: exact match .env" {
  run_utils_eval 'console.log(utils.matchesGlob(".env", ".env"))'
  [ "$output" = "true" ]
}

@test "matchesGlob: *.pem matches server.pem" {
  run_utils_eval 'console.log(utils.matchesGlob("server.pem", "*.pem"))'
  [ "$output" = "true" ]
}

@test "matchesGlob: *.pem rejects server.pem.bak" {
  run_utils_eval 'console.log(utils.matchesGlob("server.pem.bak", "*.pem"))'
  [ "$output" = "false" ]
}

@test "matchesGlob: .env.* matches .env.local" {
  run_utils_eval 'console.log(utils.matchesGlob(".env.local", ".env.*"))'
  [ "$output" = "true" ]
}

@test "matchesGlob: .env.* rejects .env (no suffix)" {
  run_utils_eval 'console.log(utils.matchesGlob(".env", ".env.*"))'
  [ "$output" = "false" ]
}

@test "matchesGlob: id_rsa* matches id_rsa" {
  run_utils_eval 'console.log(utils.matchesGlob("id_rsa", "id_rsa*"))'
  [ "$output" = "true" ]
}

@test "matchesGlob: id_rsa* matches id_rsa.pub" {
  run_utils_eval 'console.log(utils.matchesGlob("id_rsa.pub", "id_rsa*"))'
  [ "$output" = "true" ]
}

@test "matchesGlob: ? wildcard matches single char" {
  run_utils_eval 'console.log(utils.matchesGlob("a", "?"))'
  [ "$output" = "true" ]
}

@test "matchesGlob: ? wildcard rejects multi char" {
  run_utils_eval 'console.log(utils.matchesGlob("ab", "?"))'
  [ "$output" = "false" ]
}

@test "matchesGlob: special regex chars are escaped" {
  run_utils_eval 'console.log(utils.matchesGlob("file[1].txt", "file[1].txt"))'
  [ "$output" = "true" ]
}

# =============================================================================
# getCacheDir tests
# =============================================================================

@test "getCacheDir: uses CLAUDE_SECURITY_CACHE_DIR env var when set" {
  run_utils_eval 'console.log(utils.getCacheDir())'
  [ "$status" -eq 0 ]
  [ "$output" = "$CACHE_DIR" ]
}

@test "getCacheDir: creates directory if it does not exist" {
  rm -rf "$CACHE_DIR"
  run_utils_eval 'console.log(utils.getCacheDir())'
  [ "$status" -eq 0 ]
  [ -d "$CACHE_DIR" ]
}

@test "getCacheDir: falls back to /tmp/claude-security-uid when env var unset" {
  local script_file
  script_file=$(mktemp)
  cat > "$script_file" <<UTILEOF
const utils = require('$REPO_ROOT/hooks/lib/utils');
console.log(utils.getCacheDir());
UTILEOF
  run bash -c 'unset CLAUDE_SECURITY_CACHE_DIR && node "$1"' _ "$script_file"
  rm -f "$script_file"
  [ "$status" -eq 0 ]
  [[ "$output" == /tmp/claude-security-* ]]
}

# =============================================================================
# readStdinJSON tests
# =============================================================================

@test "readStdinJSON: parses valid JSON" {
  local script_file
  script_file=$(mktemp)
  cat > "$script_file" <<UTILEOF
const utils = require('$REPO_ROOT/hooks/lib/utils');
utils.readStdinJSON().then(d => console.log(JSON.stringify(d)));
UTILEOF
  run bash -c 'printf "%s" "{\"key\":\"value\"}" | node "$1"' _ "$script_file"
  rm -f "$script_file"
  [ "$status" -eq 0 ]
  [[ "$output" == *'"key":"value"'* ]]
}

@test "readStdinJSON: rejects invalid JSON (exit 1)" {
  local script_file
  script_file=$(mktemp)
  cat > "$script_file" <<UTILEOF
const utils = require('$REPO_ROOT/hooks/lib/utils');
utils.readStdinJSON().then(() => process.exit(0)).catch(() => process.exit(1));
UTILEOF
  run bash -c 'printf "%s" "not json" | node "$1"' _ "$script_file"
  rm -f "$script_file"
  [ "$status" -eq 1 ]
}

@test "readStdinJSON: handles empty stdin (exit 1)" {
  local script_file
  script_file=$(mktemp)
  cat > "$script_file" <<UTILEOF
const utils = require('$REPO_ROOT/hooks/lib/utils');
utils.readStdinJSON().then(() => process.exit(0)).catch(() => process.exit(1));
UTILEOF
  run bash -c 'printf "%s" "" | node "$1"' _ "$script_file"
  rm -f "$script_file"
  [ "$status" -eq 1 ]
}

# =============================================================================
# warn tests
# =============================================================================

@test "warn: writes message to stderr" {
  local script_file
  script_file=$(mktemp)
  cat > "$script_file" <<UTILEOF
const utils = require('$REPO_ROOT/hooks/lib/utils');
utils.warn("test warning");
UTILEOF
  # Redirect stderr to stdout so BATS captures it
  run bash -c 'CLAUDE_SECURITY_CACHE_DIR="$1" node "$2" 2>&1' _ "$CACHE_DIR" "$script_file"
  rm -f "$script_file"
  [ "$status" -eq 0 ]
  [[ "$output" == *"test warning"* ]]
}

@test "warn: appends newline (two calls produce two lines)" {
  local script_file
  script_file=$(mktemp)
  cat > "$script_file" <<UTILEOF
const utils = require('$REPO_ROOT/hooks/lib/utils');
utils.warn("line1");
utils.warn("line2");
UTILEOF
  run bash -c 'CLAUDE_SECURITY_CACHE_DIR="$1" node "$2" 2>&1' _ "$CACHE_DIR" "$script_file"
  rm -f "$script_file"
  [[ "$output" == *"line1"* ]]
  [[ "$output" == *"line2"* ]]
  local line_count
  line_count=$(echo "$output" | wc -l | tr -d ' ')
  [ "$line_count" -ge 2 ]
}
