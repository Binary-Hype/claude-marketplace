#!/bin/bash
# Protect .env files - PreToolUse Hook
#
# Blocks read/write/edit access to files named exactly ".env".
# Does NOT block .env.example, .env.local, .env.production, etc.
#
# Exit codes:
#   0 = allow the tool call
#   2 = block the tool call (stderr = reason shown to Claude)

set -e

# Read JSON from stdin (Claude Code hook format)
INPUT_JSON=$(cat)

# Exit if no input
if [ -z "$INPUT_JSON" ]; then
  exit 0
fi

# Parse and check using node
RESULT=$(echo "$INPUT_JSON" | node -e '
const path = require("path");

function basenameIsDotenv(fp) {
  if (!fp) return false;
  return path.basename(fp.replace(/\/+$/, "")) === ".env";
}

function shellSplit(s) {
  const t = []; let cur = "", sq = false, dq = false, esc = false;
  for (const c of s) {
    if (esc) { cur += c; esc = false; continue; }
    if (c === "\\" && !sq) { esc = true; continue; }
    if (c === "'"'"'" && !dq) { sq = !sq; continue; }
    if (c === "\"" && !sq) { dq = !dq; continue; }
    if (/\s/.test(c) && !sq && !dq) { if (cur) { t.push(cur); cur = ""; } continue; }
    cur += c;
  }
  if (sq || dq) return s.split(/\s+/).filter(Boolean);
  if (cur) t.push(cur);
  return t;
}

function checkBashCommand(command) {
  let tokens;
  try { tokens = shellSplit(command); } catch { tokens = command.split(/\s+/).filter(Boolean); }
  return tokens.some(t => basenameIsDotenv(t.replace(/^[<>]+/, "")));
}

let d = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", c => d += c);
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(d);
    const toolName = data.tool_name || "";
    const toolInput = data.tool_input || {};
    let blocked = false, blockedPath = "";

    if (["Read","Edit","Write"].includes(toolName)) {
      const fp = toolInput.file_path || "";
      if (basenameIsDotenv(fp)) { blocked = true; blockedPath = fp; }
    } else if (toolName === "Bash") {
      const cmd = toolInput.command || "";
      if (checkBashCommand(cmd)) { blocked = true; blockedPath = cmd; }
    } else if (toolName === "Grep") {
      const p = toolInput.path || "";
      if (basenameIsDotenv(p)) { blocked = true; blockedPath = p; }
    } else if (toolName === "Glob") {
      const pat = toolInput.pattern || "";
      const p = toolInput.path || "";
      if (pat && path.basename(pat) === ".env") { blocked = true; blockedPath = pat; }
      else if (basenameIsDotenv(p)) { blocked = true; blockedPath = p; }
    }

    console.log(JSON.stringify({ blocked, path: blockedPath }));
  } catch {
    console.log(JSON.stringify({ blocked: false }));
  }
});
')

# Check if the tool call should be blocked
BLOCKED=$(echo "$RESULT" | node -e "let d='';process.stdin.setEncoding('utf8');process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).blocked?'true':'false')}catch{console.log('false')}})")

if [ "$BLOCKED" = "true" ]; then
  BLOCKED_PATH=$(echo "$RESULT" | node -e "let d='';process.stdin.setEncoding('utf8');process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).path||'')}catch{console.log('')}})")
  echo "BLOCKED: Access to .env files is prohibited. The file '$BLOCKED_PATH' is a .env file containing secrets. Use .env.example for templates or environment variables for configuration." >&2
  exit 2
fi

exit 0
