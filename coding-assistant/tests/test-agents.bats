#!/usr/bin/env bats

load helpers

setup() {
  setup_base
}

teardown() {
  teardown_base
}

# --- File existence tests ---

@test "performance-auditor.md exists" {
  [ -f "$REPO_ROOT/agents/performance-auditor.md" ]
}

@test "dependency-auditor.md exists" {
  [ -f "$REPO_ROOT/agents/dependency-auditor.md" ]
}

@test "seo-auditor.md exists" {
  [ -f "$REPO_ROOT/agents/seo-auditor.md" ]
}

@test "cicd-assistant.md exists" {
  [ -f "$REPO_ROOT/agents/cicd-assistant.md" ]
}

@test "migration-assistant.md exists" {
  [ -f "$REPO_ROOT/agents/migration-assistant.md" ]
}

@test "i18n-checker.md exists" {
  [ -f "$REPO_ROOT/agents/i18n-checker.md" ]
}

@test "pr-reviewer.md exists" {
  [ -f "$REPO_ROOT/agents/pr-reviewer.md" ]
}

# --- YAML front matter validation ---

extract_frontmatter() {
  local file="$1"
  awk '/^---$/{n++; next} n==1{print}' "$file"
}

@test "performance-auditor.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/performance-auditor.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: performance-auditor$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "dependency-auditor.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/dependency-auditor.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: dependency-auditor$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "seo-auditor.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/seo-auditor.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: seo-auditor$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "cicd-assistant.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/cicd-assistant.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: cicd-assistant$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "migration-assistant.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/migration-assistant.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: migration-assistant$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "i18n-checker.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/i18n-checker.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: i18n-checker$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

@test "pr-reviewer.md has valid YAML front matter" {
  local file="$REPO_ROOT/agents/pr-reviewer.md"
  run head -1 "$file"
  [ "$output" = "---" ]
  local fm
  fm=$(extract_frontmatter "$file")
  echo "$fm" | grep -q "^name: pr-reviewer$"
  echo "$fm" | grep -q "^description:"
  echo "$fm" | grep -q "^tools:"
  echo "$fm" | grep -q "^model:"
}

# --- Model validation ---

@test "all new agents use a valid model value" {
  local agents=("performance-auditor" "dependency-auditor" "seo-auditor" "cicd-assistant" "migration-assistant" "i18n-checker" "pr-reviewer")
  for agent in "${agents[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    local model
    model=$(extract_frontmatter "$file" | grep "^model:" | sed 's/^model: *//')
    [[ "$model" =~ ^(opus|sonnet|haiku)$ ]]
  done
}

# --- No duplicate names ---

@test "no duplicate agent names across all agent files" {
  local names=()
  for file in "$REPO_ROOT"/agents/*.md; do
    local name
    name=$(extract_frontmatter "$file" | grep "^name:" | sed 's/^name: *//')
    for existing in "${names[@]}"; do
      [ "$name" != "$existing" ]
    done
    names+=("$name")
  done
}

# --- Required tools ---

@test "agents with commands have Bash in tools" {
  local bash_agents=("performance-auditor" "dependency-auditor" "cicd-assistant" "migration-assistant" "i18n-checker" "pr-reviewer")
  for agent in "${bash_agents[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    local tools
    tools=$(extract_frontmatter "$file" | grep "^tools:" | sed 's/^tools: *//')
    [[ "$tools" == *"Bash"* ]]
  done
}

@test "cicd-assistant has Write and Edit in tools" {
  local file="$REPO_ROOT/agents/cicd-assistant.md"
  local tools
  tools=$(extract_frontmatter "$file" | grep "^tools:" | sed 's/^tools: *//')
  [[ "$tools" == *"Write"* ]]
  [[ "$tools" == *"Edit"* ]]
}

@test "seo-auditor does not have Bash in tools" {
  local file="$REPO_ROOT/agents/seo-auditor.md"
  local tools
  tools=$(extract_frontmatter "$file" | grep "^tools:" | sed 's/^tools: *//')
  [[ "$tools" != *"Bash"* ]]
}

# --- Content structure ---

@test "all new agents have Success Criteria section" {
  local agents=("performance-auditor" "dependency-auditor" "seo-auditor" "cicd-assistant" "migration-assistant" "i18n-checker" "pr-reviewer")
  for agent in "${agents[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    grep -q "## Success Criteria" "$file"
  done
}

@test "all new agents have a report format section" {
  local agents=("performance-auditor" "dependency-auditor" "seo-auditor" "cicd-assistant" "migration-assistant" "i18n-checker" "pr-reviewer")
  for agent in "${agents[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    grep -q "## Report Format" "$file"
  done
}

# --- Name consistency ---

@test "front matter name matches filename for all new agents" {
  local agents=("performance-auditor" "dependency-auditor" "seo-auditor" "cicd-assistant" "migration-assistant" "i18n-checker" "pr-reviewer")
  for agent in "${agents[@]}"; do
    local file="$REPO_ROOT/agents/${agent}.md"
    local name
    name=$(extract_frontmatter "$file" | grep "^name:" | sed 's/^name: *//')
    [ "$name" = "$agent" ]
  done
}
