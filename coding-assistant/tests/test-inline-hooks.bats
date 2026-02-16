#!/usr/bin/env bats

load helpers

setup() {
  setup_base
}

teardown() {
  teardown_base
}

# --- Large file blocker ---

@test "file size blocker: blocks file with 900 lines" {
  # Build a payload with 900 newlines
  local content
  content=$(printf '%0.s\\n' {1..900})
  run_file_size_blocker "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/project/big.js\",\"content\":\"${content}\"}}"
  [ "$status" -eq 2 ]
  [[ "$output" == *"BLOCKED: File has"* ]]
  [[ "$output" == *"lines (max 800)"* ]]
}

@test "file size blocker: allows file with 100 lines" {
  local content
  content=$(printf '%0.s\\n' {1..100})
  run_file_size_blocker "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"/project/small.js\",\"content\":\"${content}\"}}"
  [ "$status" -eq 0 ]
}

@test "file size blocker: allows empty file" {
  run_file_size_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/empty.js","content":""}}'
  [ "$status" -eq 0 ]
}
