#!/usr/bin/env bats

load helpers

setup() {
  setup_base
}

teardown() {
  teardown_base
}

# =============================================================================
# Default config loading (Tier 1)
# =============================================================================

@test "loads default deny patterns (.env present)" {
  run_merge_denylist
  [ "$status" -eq 0 ]
  [[ "$output" == *'".env"'* ]]
}

@test "loads default allow patterns (.env.example present)" {
  run_merge_denylist
  [ "$status" -eq 0 ]
  [[ "$output" == *'".env.example"'* ]]
}

@test "fails with exit 1 when default-denylist.json missing" {
  run_merge_denylist "$TEST_TMPDIR" "$TEST_TMPDIR/nonexistent"
  [ "$status" -eq 1 ]
}

# =============================================================================
# Global user config merging (Tier 2)
# =============================================================================

@test "merges global user deny patterns" {
  cat > "$HOME/.claude/security/denylist.json" << 'EOF'
{"deny": ["my-custom-secret"], "allow": []}
EOF
  run_merge_denylist
  [ "$status" -eq 0 ]
  [[ "$output" == *'"my-custom-secret"'* ]]
  # Default patterns still present
  [[ "$output" == *'".env"'* ]]
}

@test "merges global user allow patterns" {
  cat > "$HOME/.claude/security/denylist.json" << 'EOF'
{"deny": [], "allow": [".env.staging"]}
EOF
  run_merge_denylist
  [ "$status" -eq 0 ]
  [[ "$output" == *'".env.staging"'* ]]
}

@test "handles global config as array format (all-deny)" {
  cat > "$HOME/.claude/security/denylist.json" << 'EOF'
["global-secret-file"]
EOF
  run_merge_denylist
  [ "$status" -eq 0 ]
  [[ "$output" == *'"global-secret-file"'* ]]
}

# =============================================================================
# Per-project config merging (Tier 3)
# =============================================================================

@test "merges per-project deny patterns" {
  local project_dir="$TEST_TMPDIR/project"
  mkdir -p "$project_dir/.claude/security"
  cat > "$project_dir/.claude/security/denylist.json" << 'EOF'
{"deny": ["project-secret"], "allow": []}
EOF
  run_merge_denylist "$project_dir"
  [ "$status" -eq 0 ]
  [[ "$output" == *'"project-secret"'* ]]
  [[ "$output" == *'".env"'* ]]
}

@test "accumulates patterns from all 3 tiers" {
  # Tier 2: global
  cat > "$HOME/.claude/security/denylist.json" << 'EOF'
{"deny": ["global-only"], "allow": ["global-allow"]}
EOF
  # Tier 3: project
  local project_dir="$TEST_TMPDIR/project"
  mkdir -p "$project_dir/.claude/security"
  cat > "$project_dir/.claude/security/denylist.json" << 'EOF'
{"deny": ["project-only"], "allow": ["project-allow"]}
EOF
  run_merge_denylist "$project_dir"
  [ "$status" -eq 0 ]
  # All tiers represented
  [[ "$output" == *'".env"'* ]]
  [[ "$output" == *'"global-only"'* ]]
  [[ "$output" == *'"project-only"'* ]]
  [[ "$output" == *'"global-allow"'* ]]
  [[ "$output" == *'"project-allow"'* ]]
}

@test "handles project config as array format" {
  local project_dir="$TEST_TMPDIR/project"
  mkdir -p "$project_dir/.claude/security"
  cat > "$project_dir/.claude/security/denylist.json" << 'EOF'
["project-array-secret"]
EOF
  run_merge_denylist "$project_dir"
  [ "$status" -eq 0 ]
  [[ "$output" == *'"project-array-secret"'* ]]
}

# =============================================================================
# Cache file output
# =============================================================================

@test "writes deny-patterns.json to cache dir" {
  run_merge_denylist
  [ "$status" -eq 0 ]
  [ -f "$CACHE_DIR/deny-patterns.json" ]
  # Verify it's valid JSON containing .env
  local content
  content=$(cat "$CACHE_DIR/deny-patterns.json")
  [[ "$content" == *".env"* ]]
}

@test "writes allow-patterns.json to cache dir" {
  run_merge_denylist
  [ "$status" -eq 0 ]
  [ -f "$CACHE_DIR/allow-patterns.json" ]
  local content
  content=$(cat "$CACHE_DIR/allow-patterns.json")
  [[ "$content" == *".env.example"* ]]
}

@test "deduplicates deny patterns across tiers" {
  # Global config also has .env (already in defaults)
  cat > "$HOME/.claude/security/denylist.json" << 'EOF'
{"deny": [".env", "custom-secret"], "allow": []}
EOF
  run_merge_denylist
  [ "$status" -eq 0 ]
  # Count occurrences of ".env" in the deny array (cache file is a flat JSON array)
  local count
  count=$(node -e "const d=JSON.parse(require('fs').readFileSync('$CACHE_DIR/deny-patterns.json','utf8'));console.log(d.filter(p=>p==='.env').length)")
  [ "$count" -eq 1 ]
}

@test "deduplicates allow patterns across tiers" {
  cat > "$HOME/.claude/security/denylist.json" << 'EOF'
{"deny": [], "allow": [".env.example"]}
EOF
  run_merge_denylist
  [ "$status" -eq 0 ]
  local count
  count=$(node -e "const d=JSON.parse(require('fs').readFileSync('$CACHE_DIR/allow-patterns.json','utf8'));console.log(d.filter(p=>p==='.env.example').length)")
  [ "$count" -eq 1 ]
}

@test "no .tmp files remain after merge (atomic write)" {
  run_merge_denylist
  [ "$status" -eq 0 ]
  local tmp_count
  tmp_count=$(find "$CACHE_DIR" -name '*.tmp' | wc -l | tr -d ' ')
  [ "$tmp_count" -eq 0 ]
}
