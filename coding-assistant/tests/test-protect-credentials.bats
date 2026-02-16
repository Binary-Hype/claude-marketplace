#!/usr/bin/env bats

load helpers

setup() {
  setup_base
}

teardown() {
  teardown_base
}

# =============================================================================
# Gate check tests — Phase 1: is this a git commit command?
# =============================================================================

@test "gate: detects 'git commit -m test'" {
  run_credential_gate '{"tool_name":"Bash","tool_input":{"command":"git commit -m test"}}'
  [ "$output" = "true" ]
}

@test "gate: detects 'git commit --amend'" {
  run_credential_gate '{"tool_name":"Bash","tool_input":{"command":"git commit --amend"}}'
  [ "$output" = "true" ]
}

@test "gate: detects chained 'npm test && git commit -m ok'" {
  run_credential_gate '{"tool_name":"Bash","tool_input":{"command":"npm test && git commit -m ok"}}'
  [ "$output" = "true" ]
}

@test "gate: detects '/usr/bin/git commit'" {
  run_credential_gate '{"tool_name":"Bash","tool_input":{"command":"/usr/bin/git commit -m test"}}'
  [ "$output" = "true" ]
}

@test "gate: rejects 'git push'" {
  run_credential_gate '{"tool_name":"Bash","tool_input":{"command":"git push origin main"}}'
  [ "$output" = "false" ]
}

@test "gate: rejects 'git status'" {
  run_credential_gate '{"tool_name":"Bash","tool_input":{"command":"git status"}}'
  [ "$output" = "false" ]
}

@test "gate: rejects non-Bash tool (Read)" {
  run_credential_gate '{"tool_name":"Read","tool_input":{"file_path":"/some/file"}}'
  [ "$output" = "false" ]
}

@test "gate: rejects empty command" {
  run_credential_gate '{"tool_name":"Bash","tool_input":{"command":""}}'
  [ "$output" = "false" ]
}

# =============================================================================
# Scanner detection tests — Phase 2: credential pattern matching
# =============================================================================

@test "scanner: detects AWS access key" {
  local diff=$'+++ b/src/config.js\n+AWS_KEY=AKIAIOSFODNN7EXAMPLE'
  run_credential_scanner "$diff"
  [ "$status" -eq 0 ]
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"AWS Access Key"* ]]
}

@test "scanner: detects GitHub personal access token" {
  local diff=$'+++ b/src/config.js\n+TOKEN=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"GitHub Personal Access Token"* ]]
}

@test "scanner: detects GitLab personal access token" {
  local diff=$'+++ b/src/config.js\n+TOKEN=glpat-ABCDEFGHIJKLMNOPQRSTUVWXYZab'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"GitLab Personal Access Token"* ]]
}

@test "scanner: detects Slack bot token" {
  local diff=$'+++ b/src/config.js\n+SLACK=xoxb-1234567890-9876543210-ABCDEFGHIJKLMNOPQRSTUVwx'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"Slack Bot Token"* ]]
}

@test "scanner: detects Stripe live secret key" {
  local diff=$'+++ b/src/config.js\n+STRIPE=sk_live_ABCDEFGHIJKLMNOPQRSTUVWXyz'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"Stripe Live Secret Key"* ]]
}

@test "scanner: detects private key header" {
  local diff=$'+++ b/src/key.pem\n+-----BEGIN RSA PRIVATE KEY-----'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"Private Key"* ]]
}

@test "scanner: detects database connection string" {
  local diff=$'+++ b/src/db.js\n+mysql://admin:secretpass@db.example.com/mydb'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"Database connection string"* ]]
}

@test "scanner: detects JWT token" {
  local diff=$'+++ b/src/auth.js\n+eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"JWT Token"* ]]
}

@test "scanner: detects password assignment" {
  local diff=$'+++ b/src/config.js\n+password = \'myS3cretP@ss\''
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"Password assignment"* ]]
}

@test "scanner: detects generic API key assignment" {
  local diff=$'+++ b/src/config.js\n+api_key = \'realvalue1234567890\''
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"API Key/Secret"* ]]
}

# =============================================================================
# Scanner filter tests — false positive handling
# =============================================================================

@test "scanner: skips test files" {
  local diff=$'+++ b/tests/AuthTest.php\n+AKIAIOSFODNN7EXAMPLE'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":false'* ]]
}

@test "scanner: skips .example files" {
  local diff=$'+++ b/config.env.example\n+AKIAIOSFODNN7EXAMPLE'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":false'* ]]
}

@test "scanner: skips comment lines" {
  local diff=$'+++ b/src/config.js\n+# AKIAIOSFODNN7EXAMPLE'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":false'* ]]
}

@test "scanner: skips placeholder 'changeme'" {
  local diff=$'+++ b/src/config.js\n+api_key = \'changeme\''
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":false'* ]]
}

@test "scanner: skips placeholder 'your-api-key'" {
  local diff=$'+++ b/src/config.js\n+api_key = \'your-api-key\''
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":false'* ]]
}

@test "scanner: clean diff returns found false" {
  local diff=$'+++ b/src/app.js\n+console.log("hello world");'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":false'* ]]
  [[ "$output" == *'"findings":[]'* ]]
}

@test "scanner: redacts long values (6...4 format)" {
  local diff=$'+++ b/src/config.js\n+AKIAIOSFODNN7EXAMPLE'
  run_credential_scanner "$diff"
  # AKIAIOSFODNN7EXAMPLE = 20 chars → AKIAIO...MPLE
  [[ "$output" == *"AKIAIO...MPLE"* ]]
}

@test "scanner: detects multiple credentials in single diff" {
  local diff=$'+++ b/src/config.js\n+AKIAIOSFODNN7EXAMPLE\n+sk_live_ABCDEFGHIJKLMNOPQRSTUVWXyz'
  run_credential_scanner "$diff"
  [[ "$output" == *'"found":true'* ]]
  [[ "$output" == *"AWS Access Key"* ]]
  [[ "$output" == *"Stripe Live Secret Key"* ]]
}
