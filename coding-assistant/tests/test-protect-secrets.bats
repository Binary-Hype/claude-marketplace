#!/usr/bin/env bats

load helpers

setup() {
  setup_base
}

teardown() {
  teardown_base
}

# --- Deny tests ---

@test "blocks Read of .env file" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/.env"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: .env"* ]]
}

@test "blocks Write to .env file" {
  run_secret_hook '{"tool_name":"Write","tool_input":{"file_path":"/project/.env"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: .env"* ]]
}

@test "blocks Edit of .env file" {
  run_secret_hook '{"tool_name":"Edit","tool_input":{"file_path":"/project/.env"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: .env"* ]]
}

@test "blocks Read of .env.local (matches .env.* pattern)" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/.env.local"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: .env.local"* ]]
}

@test "blocks Read of .env.production" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/.env.production"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: .env.production"* ]]
}

@test "blocks Read of id_rsa" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/home/user/.ssh/id_rsa"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: id_rsa"* ]]
}

@test "blocks Read of id_ed25519" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/home/user/.ssh/id_ed25519"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: id_ed25519"* ]]
}

@test "blocks Read of *.pem file" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/certs/server.pem"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: server.pem"* ]]
}

@test "blocks Read of *.key file" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/certs/private.key"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: private.key"* ]]
}

@test "blocks Read of .npmrc" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/home/user/.npmrc"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: .npmrc"* ]]
}

@test "blocks Read of .netrc" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/home/user/.netrc"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: .netrc"* ]]
}

@test "blocks Read of secrets.yml" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/config/secrets.yml"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: secrets.yml"* ]]
}

@test "blocks Read of credentials.json" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/credentials.json"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: credentials.json"* ]]
}

@test "blocks Read of wp-config.php" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/var/www/wp-config.php"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: wp-config.php"* ]]
}

@test "blocks Read of .htpasswd" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/etc/apache2/.htpasswd"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: .htpasswd"* ]]
}

@test "blocks Read of auth.json" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/auth.json"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked: auth.json"* ]]
}

# --- Allow tests ---

@test "allows Read of .env.example (allow list)" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/.env.example"}}'
  [ "$status" -eq 0 ]
}

@test "allows Read of .env.dist (allow list)" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/.env.dist"}}'
  [ "$status" -eq 0 ]
}

@test "allows Read of .env.template (allow list)" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/.env.template"}}'
  [ "$status" -eq 0 ]
}

@test "allows Read of normal files" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/README.md"}}'
  [ "$status" -eq 0 ]
}

@test "allows Read of PHP files" {
  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/app/Models/User.php"}}'
  [ "$status" -eq 0 ]
}

@test "allows non-file tools" {
  run_secret_hook '{"tool_name":"WebFetch","tool_input":{"url":"https://example.com"}}'
  [ "$status" -eq 0 ]
}

# --- Bash command interception ---

@test "blocks Bash cat .env" {
  run_secret_hook '{"tool_name":"Bash","tool_input":{"command":"cat /project/.env"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked"* ]]
}

@test "blocks Bash source .env" {
  run_secret_hook '{"tool_name":"Bash","tool_input":{"command":"source .env"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked"* ]]
}

@test "allows Bash commands without secret files" {
  run_secret_hook '{"tool_name":"Bash","tool_input":{"command":"ls -la /project/src"}}'
  [ "$status" -eq 0 ]
}

@test "allows exempt-secret command in Bash" {
  run_secret_hook '{"tool_name":"Bash","tool_input":{"command":"/path/to/exempt-secret .env"}}'
  [ "$status" -eq 0 ]
}

# --- Grep/Glob ---

@test "blocks Grep targeting .env path" {
  run_secret_hook '{"tool_name":"Grep","tool_input":{"pattern":"DB_PASSWORD","path":"/project/.env"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"Secret file access blocked"* ]]
}

@test "allows Grep with normal path" {
  run_secret_hook '{"tool_name":"Grep","tool_input":{"pattern":"function","path":"/project/src"}}'
  [ "$status" -eq 0 ]
}

# --- Session overrides ---

@test "allows Read of .env after session override" {
  # Create override
  mkdir -p "$CACHE_DIR"
  echo "/project/.env" > "$CACHE_DIR/secret-overrides"

  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/project/.env"}}'
  [ "$status" -eq 0 ]
}

@test "allows Read of .env with basename override" {
  mkdir -p "$CACHE_DIR"
  echo ".env" > "$CACHE_DIR/secret-overrides"

  run_secret_hook '{"tool_name":"Read","tool_input":{"file_path":"/any/path/.env"}}'
  [ "$status" -eq 0 ]
}
