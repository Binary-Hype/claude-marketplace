#!/usr/bin/env bats

load helpers

setup() {
  setup_base
}

teardown() {
  teardown_base
}

# --- File existence tests ---

@test "code-review.md exists" {
  [ -f "$REPO_ROOT/agents/code-review.md" ]
}

@test "code-review-laravel.md exists" {
  [ -f "$REPO_ROOT/agents/code-review-laravel.md" ]
}

@test "code-review-shopware.md exists" {
  [ -f "$REPO_ROOT/agents/code-review-shopware.md" ]
}

@test "security-scanner.md exists" {
  [ -f "$REPO_ROOT/agents/security-scanner.md" ]
}

@test "security-scanner-laravel.md exists" {
  [ -f "$REPO_ROOT/agents/security-scanner-laravel.md" ]
}

@test "security-scanner-shopware.md exists" {
  [ -f "$REPO_ROOT/agents/security-scanner-shopware.md" ]
}

# --- YAML front matter validation ---

extract_frontmatter() {
  local file="$1"
  awk '/^---$/{if(++count<=2)next} count<=2{print}' "$file"
}

@test "code-review.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/code-review.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: code-review$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "code-review-laravel.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/code-review-laravel.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: code-review-laravel$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "code-review-shopware.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/code-review-shopware.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: code-review-shopware$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "security-scanner.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/security-scanner.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: security-scanner$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "security-scanner-laravel.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/security-scanner-laravel.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: security-scanner-laravel$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "security-scanner-shopware.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/security-scanner-shopware.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: security-scanner-shopware$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

# --- Model validation ---

@test "all agents use a valid model value" {
  local agents=("code-review" "code-review-laravel" "code-review-shopware" "security-scanner" "security-scanner-laravel" "security-scanner-shopware")
  for agent in "${agents[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    local model
    model=$(extract_frontmatter "$file" | grep "^model:" | sed 's/^model: *//')
    [[ "$model" == "opus" || "$model" == "sonnet" || "$model" == "haiku" ]]
  done
}

# --- No duplicate names ---

@test "no duplicate agent names across all agent files" {
  local names=()
  for file in "$REPO_ROOT"/agents/*.md; do
    [ -f "$file" ] || continue
    local name
    name=$(extract_frontmatter "$file" | grep "^name:" | sed 's/^name: *//')
    for existing in "${names[@]}"; do
      [ "$existing" = "$name" ] && fail "Duplicate agent name: $name"
    done
    names+=("$name")
  done
}

# --- Required tools ---

@test "base orchestrator agents have Task in tools" {
  local orchestrators=("code-review" "security-scanner")
  for agent in "${orchestrators[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    local tools
    tools=$(extract_frontmatter "$file" | grep "^tools:" | sed 's/^tools: *//')
    [[ "$tools" == *"Task"* ]]
  done
}

@test "leaf specialist agents do not have Task in tools" {
  local leafs=("code-review-laravel" "code-review-shopware" "security-scanner-laravel" "security-scanner-shopware")
  for agent in "${leafs[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    local tools
    tools=$(extract_frontmatter "$file" | grep "^tools:" | sed 's/^tools: *//')
    [[ "$tools" != *"Task"* ]]
  done
}

# --- Content structure ---

@test "all agents have Success Criteria section" {
  local agents=("code-review" "code-review-laravel" "code-review-shopware" "security-scanner" "security-scanner-laravel" "security-scanner-shopware")
  for agent in "${agents[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    grep -qi "success criteria" "$file"
  done
}

@test "all agents have a report format section" {
  local agents=("code-review" "code-review-laravel" "code-review-shopware" "security-scanner" "security-scanner-laravel" "security-scanner-shopware")
  for agent in "${agents[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    grep -qi "report" "$file"
  done
}

# --- Name consistency ---

@test "front matter name matches filename for all agents" {
  local agents=("code-review" "code-review-laravel" "code-review-shopware" "security-scanner" "security-scanner-laravel" "security-scanner-shopware")
  for agent in "${agents[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    local name
    name=$(extract_frontmatter "$file" | grep "^name:" | sed 's/^name: *//')
    [ "$name" = "$agent" ]
  done
}
