#!/usr/bin/env bats

load helpers

setup() {
  setup_base
}

teardown() {
  teardown_base
}

# =============================================================================
# Usage / argument validation
# =============================================================================

@test "no args exits 1 with Usage message" {
  run_exempt_secret
  [ "$status" -eq 1 ]
  [[ "$output" == *"Usage:"* ]]
}

# =============================================================================
# Basic functionality
# =============================================================================

@test "single path creates override file with entry" {
  run_exempt_secret ".env"
  [ "$status" -eq 0 ]
  [ -f "$CACHE_DIR/secret-overrides" ]
  run grep -c ".env" "$CACHE_DIR/secret-overrides"
  [ "$output" = "1" ]
}

@test "creates cache dir if missing" {
  rm -rf "$CACHE_DIR"
  run_exempt_secret ".env"
  [ "$status" -eq 0 ]
  [ -d "$CACHE_DIR" ]
  [ -f "$CACHE_DIR/secret-overrides" ]
}

@test "multiple sequential runs append entries" {
  run_exempt_secret ".env"
  [ "$status" -eq 0 ]
  run_exempt_secret "id_rsa"
  [ "$status" -eq 0 ]
  # Both entries present
  run grep -c "" "$CACHE_DIR/secret-overrides"
  [ "$output" = "2" ]
}

@test "deduplicates existing entries" {
  run_exempt_secret ".env"
  run_exempt_secret ".env"
  [ "$status" -eq 0 ]
  run grep -c ".env" "$CACHE_DIR/secret-overrides"
  [ "$output" = "1" ]
}

@test "reports 'Already exempted' for duplicate" {
  run_exempt_secret ".env"
  run_exempt_secret ".env"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Already exempted: .env"* ]]
}

@test "variadic args writes all entries" {
  run_exempt_secret ".env" "id_rsa" ".npmrc"
  [ "$status" -eq 0 ]
  run grep -c "" "$CACHE_DIR/secret-overrides"
  [ "$output" = "3" ]
}

@test "reports 'Granted session access' for each new entry" {
  run_exempt_secret ".env" "id_rsa"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Granted session access to: .env"* ]]
  [[ "$output" == *"Granted session access to: id_rsa"* ]]
}

@test "reports session-only disclaimer" {
  run_exempt_secret ".env"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Done. Secret file(s) exempted for this session only."* ]]
}

# =============================================================================
# Integration with protect-secrets.js
# =============================================================================

@test "integration: exempt .env then protect-secrets allows Read" {
  # First, verify .env is blocked
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/.env"}}'
  [ "$status" -eq 2 ]

  # Exempt .env
  run_exempt_secret ".env"
  [ "$status" -eq 0 ]

  # Now .env should be allowed
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/.env"}}'
  [ "$status" -eq 0 ]
}
