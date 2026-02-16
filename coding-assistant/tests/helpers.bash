#!/usr/bin/env bash
# Shared test helpers for Bats test suite

setup_base() {
  export REPO_ROOT
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/.." && pwd)"

  export TEST_TMPDIR
  TEST_TMPDIR="$(mktemp -d)"

  # Override HOME so tests don't touch real user config
  export ORIGINAL_HOME="$HOME"
  export HOME="$TEST_TMPDIR/home"
  mkdir -p "$HOME/.claude/security"

  # Use a test-specific cache dir (isolated per test)
  export CACHE_DIR="$TEST_TMPDIR/cache"
  mkdir -p "$CACHE_DIR"
  export CLAUDE_SECURITY_CACHE_DIR="$CACHE_DIR"

  # Set plugin root for hooks
  export CLAUDE_PLUGIN_ROOT="$REPO_ROOT"
}

teardown_base() {
  rm -rf "$TEST_TMPDIR"
  export HOME="$ORIGINAL_HOME"
}

# Run protect-secrets.js with a JSON payload
run_secret_hook() {
  local payload="$1"
  run bash -c 'printf "%s" "$1" | CLAUDE_SECURITY_CACHE_DIR="$CLAUDE_SECURITY_CACHE_DIR" CLAUDE_PLUGIN_ROOT="$CLAUDE_PLUGIN_ROOT" HOME="$HOME" node "$2/hooks/protect-secrets.js"' _ "$payload" "$REPO_ROOT"
}

# Run the large file blocker inline hook
run_file_size_blocker() {
  local payload="$1"
  run bash -c 'printf "%s" "$1" | node -e "let d=\"\";process.stdin.on(\"data\",c=>d+=c);process.stdin.on(\"end\",()=>{try{const i=JSON.parse(d);const c=i.tool_input?.content||\"\";const n=c.split(\"\\n\").length;if(n>800){process.stderr.write(\"[Hook] BLOCKED: File has \"+n+\" lines (max 800). Split into smaller modules.\\n\");process.exit(2)}}catch{}})"' _ "$payload"
}

# --- protect-credentials.sh helpers ---

# Extract and run the Phase 1 gate-check script from protect-credentials.sh
# Returns "true" or "false" on stdout
run_credential_gate() {
  local payload="$1"
  local src="$REPO_ROOT/hooks/protect-credentials.sh"
  local gate_script
  gate_script=$(mktemp)

  # Verify expected anchor (fail clearly if script structure changed)
  if ! sed -n '23p' "$src" | grep -q 'function shellSplit'; then
    echo "ERROR: protect-credentials.sh structure changed, gate extraction failed" >&2
    rm -f "$gate_script"
    return 1
  fi

  # Extract Phase 1 Node.js (lines 23-60) and fix bash single-quote escaping:
  # In the source, a JS single-quote char "'" is bash-encoded as "'"'"'"
  sed -n '23,60p' "$src" | sed "s/\"'\"'\"'\"/\"'\"/g" > "$gate_script"
  run bash -c 'printf "%s" "$1" | node "$2"' _ "$payload" "$gate_script"
  rm -f "$gate_script"
}

# Extract and run the credential scanner from protect-credentials.sh
# Accepts git-diff-formatted text on $1, returns JSON {found, findings}
run_credential_scanner() {
  local diff_text="$1"
  local src="$REPO_ROOT/hooks/protect-credentials.sh"
  local scanner_script
  scanner_script=$(mktemp)

  # Verify expected anchor (fail clearly if script structure changed)
  if ! sed -n '73p' "$src" | grep -q 'CREDENTIAL_PATTERNS'; then
    echo "ERROR: protect-credentials.sh structure changed, scanner extraction failed" >&2
    rm -f "$scanner_script"
    return 1
  fi

  # Extract Phase 2 scanner Node.js (lines 73-172)
  sed -n '73,172p' "$src" > "$scanner_script"
  run bash -c 'printf "%s" "$1" | node "$2"' _ "$diff_text" "$scanner_script"
  rm -f "$scanner_script"
}

# --- merge-denylist.js helper ---

# Run merge-denylist.js with test environment
# $1 = project dir (default: $TEST_TMPDIR), $2 = plugin root (default: $REPO_ROOT)
run_merge_denylist() {
  local project_dir="${1:-$TEST_TMPDIR}"
  local plugin_root="${2:-$REPO_ROOT}"
  run bash -c 'cd "$1" && CLAUDE_SECURITY_CACHE_DIR="$2" CLAUDE_PLUGIN_ROOT="$3" HOME="$4" node "$5/hooks/lib/merge-denylist.js"' \
    _ "$project_dir" "$CACHE_DIR" "$plugin_root" "$HOME" "$REPO_ROOT"
}

# --- utils.js helper ---

# Evaluate a Node.js expression with utils.js loaded
# Writes expression to temp file to avoid shell quoting issues
run_utils_eval() {
  local expr="$1"
  local script_file
  script_file=$(mktemp)
  cat > "$script_file" <<UTILEOF
const utils = require('$REPO_ROOT/hooks/lib/utils');
$expr
UTILEOF
  run bash -c 'CLAUDE_SECURITY_CACHE_DIR="$1" node "$2"' _ "$CACHE_DIR" "$script_file"
  rm -f "$script_file"
}

# --- exempt-secret helper ---

# Run exempt-secret CLI with arguments
run_exempt_secret() {
  run node "$REPO_ROOT/hooks/bin/exempt-secret" "$@"
}
