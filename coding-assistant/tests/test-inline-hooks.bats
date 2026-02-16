#!/usr/bin/env bats

load helpers

setup() {
  setup_base
}

teardown() {
  teardown_base
}

# --- Doc file blocker ---

@test "doc blocker: blocks random .md file" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/notes.md","content":"some notes"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"BLOCKED: Unnecessary doc file: notes.md"* ]]
}

@test "doc blocker: blocks random .txt file" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/todo.txt","content":"stuff"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"BLOCKED: Unnecessary doc file: todo.txt"* ]]
}

@test "doc blocker: blocks architecture.md" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/architecture.md","content":"design doc"}}'
  [ "$status" -eq 2 ]
  [[ "$output" == *"BLOCKED: Unnecessary doc file: architecture.md"* ]]
}

@test "doc blocker: allows README.md" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/README.md","content":"# Project"}}'
  [ "$status" -eq 0 ]
}

@test "doc blocker: allows CLAUDE.md" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/CLAUDE.md","content":"# Instructions"}}'
  [ "$status" -eq 0 ]
}

@test "doc blocker: allows CONTRIBUTING.md" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/CONTRIBUTING.md","content":"# Contributing"}}'
  [ "$status" -eq 0 ]
}

@test "doc blocker: allows CHANGELOG.md" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/CHANGELOG.md","content":"# Changelog"}}'
  [ "$status" -eq 0 ]
}

@test "doc blocker: allows LICENSE" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/LICENSE","content":"MIT"}}'
  [ "$status" -eq 0 ]
}

@test "doc blocker: allows SECURITY.md" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/SECURITY.md","content":"# Security"}}'
  [ "$status" -eq 0 ]
}

@test "doc blocker: allows SKILL.md files" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/skills/test/SKILL.md","content":"# Skill"}}'
  [ "$status" -eq 0 ]
}

@test "doc blocker: allows non-doc files" {
  run_doc_blocker '{"tool_name":"Write","tool_input":{"file_path":"/project/app.js","content":"console.log(1)"}}'
  [ "$status" -eq 0 ]
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
