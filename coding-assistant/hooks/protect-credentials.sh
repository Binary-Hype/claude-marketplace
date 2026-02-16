#!/bin/bash
# Protect against committing credentials - PreToolUse Hook
#
# Intercepts git commit commands, runs git diff --cached,
# and scans staged content for credential patterns.
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

# Phase 1: Gate check - is this a git commit command?
IS_COMMIT=$(echo "$INPUT_JSON" | node -e '
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
let d = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", c => d += c);
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(d);
    if (data.tool_name !== "Bash") { console.log("false"); return; }
    const cmd = (data.tool_input || {}).command || "";
    if (!cmd) { console.log("false"); return; }
    const subs = cmd.split(/\s*(?:&&|\|\||;)\s*/);
    let found = false;
    for (const sub of subs) {
      let tokens;
      try { tokens = shellSplit(sub); } catch { tokens = sub.split(/\s+/).filter(Boolean); }
      for (let i = 0; i < tokens.length; i++) {
        if ((tokens[i] === "git" || tokens[i].endsWith("/git")) && i + 1 < tokens.length && tokens[i+1] === "commit") {
          found = true; break;
        }
      }
      if (found) break;
    }
    console.log(found ? "true" : "false");
  } catch { console.log("false"); }
});
' 2>/dev/null) || exit 0

# Early exit if not a git commit
if [ "$IS_COMMIT" != "true" ]; then
  exit 0
fi

# Phase 2: Create temp file for Node.js scanner (avoids bash quoting issues)
SCANNER_SCRIPT=$(mktemp)
trap "rm -f $SCANNER_SCRIPT" EXIT

cat > "$SCANNER_SCRIPT" << 'NODEEOF'
const CREDENTIAL_PATTERNS = [
  // AWS
  [/AKIA[0-9A-Z]{16}/, "AWS Access Key ID"],
  // Private keys
  [/-----BEGIN\s+(?:RSA|EC|DSA|OPENSSH|PGP)\s+PRIVATE\s+KEY-----/, "Private Key"],
  // GitHub tokens
  [/ghp_[A-Za-z0-9]{36}/, "GitHub Personal Access Token"],
  [/gho_[A-Za-z0-9]{36}/, "GitHub OAuth Token"],
  [/ghu_[A-Za-z0-9]{36}/, "GitHub User-to-Server Token"],
  [/ghs_[A-Za-z0-9]{36}/, "GitHub Server-to-Server Token"],
  [/ghr_[A-Za-z0-9]{36}/, "GitHub Refresh Token"],
  // GitLab
  [/glpat-[A-Za-z0-9_\-]{20,}/, "GitLab Personal Access Token"],
  // Slack
  [/xoxb-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{24,}/, "Slack Bot Token"],
  [/xoxp-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{24,}/, "Slack User Token"],
  [/https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/, "Slack Webhook URL"],
  // Discord
  [/https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_\-]+/, "Discord Webhook URL"],
  // Stripe (live keys only)
  [/sk_live_[A-Za-z0-9]{24,}/, "Stripe Live Secret Key"],
  [/rk_live_[A-Za-z0-9]{24,}/, "Stripe Live Restricted Key"],
  // Twilio
  [/SK[a-f0-9]{32}/, "Twilio API Key"],
  // SendGrid
  [/SG\.[A-Za-z0-9_\-]{22}\.[A-Za-z0-9_\-]{43}/, "SendGrid API Key"],
  // Google
  [/AIza[A-Za-z0-9_\-]{35}/, "Google API Key"],
  // JWT tokens
  [/eyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/, "JWT Token"],
  // Database connection strings with credentials
  [/(?:mysql|postgres|postgresql|mongodb|redis|amqp):\/\/[^:]+:[^@]+@/i, "Database connection string with credentials"],
  // Generic API key/secret/token assignments (quoted value 8+ chars)
  [/(?:api[_-]?key|api[_-]?secret|secret[_-]?key|access[_-]?key|auth[_-]?token|secret[_-]?token)\s*[=:]\s*['"][A-Za-z0-9/+=_.~\-]{8,}['"]/i, "API Key/Secret assignment"],
  // Password assignments (quoted value 8+ chars)
  [/(?:password|passwd|pwd|db_password|database_password|mysql_password|postgres_password|redis_password)\s*[=:]\s*['"][^'"]{8,}['"]/i, "Password assignment"],
  // High-entropy secret values
  [/(?:SECRET|TOKEN|PRIVATE[_-]?KEY|SIGNING[_-]?KEY|ENCRYPTION[_-]?KEY)\s*[=:]\s*['"][A-Za-z0-9/+=]{32,}['"]/i, "High-entropy secret value"],
];

const SKIP_FILE_PATTERNS = [
  /tests?\//, /specs?\//, /__test__\//, /__mock__\//,
  /\.test\./, /\.spec\./, /fixtures?\//, /\.example$/,
  /\.sample$/, /\.md$/, /CHANGELOG/, /README/,
];

const PLACEHOLDER_VALUES = new Set([
  "test","testing","example","changeme","password","secret",
  "xxx","yyy","zzz","dummy","fake","sample","placeholder",
  "your-api-key","your-secret","your-token","replace-me",
  "todo","fixme","change-me","insert-here",
]);

const COMMENT_PREFIXES = ["#","//","/*","*","<!--","%","-- "];

function shouldSkipFile(fp) { return SKIP_FILE_PATTERNS.some(p => p.test(fp)); }
function isComment(line) { const s = line.trim(); return COMMENT_PREFIXES.some(p => s.startsWith(p)); }

function extractValue(text) {
  for (const d of ["=", ":"]) {
    if (text.includes(d)) return text.split(d, 2)[1].trim().replace(/^['"`\s]+|['"`\s]+$/g, "");
  }
  return text.replace(/^['"`\s]+|['"`\s]+$/g, "");
}

function isPlaceholder(text) {
  const v = extractValue(text).toLowerCase();
  for (const p of PLACEHOLDER_VALUES) { if (v === p || v.startsWith(p)) return true; }
  const cleaned = v.replace(/[-_]/g, "");
  if (cleaned && new Set(cleaned).size <= 2) return true;
  return false;
}

function redact(text) {
  if (text.length <= 12) return text.slice(0,3) + "..." + text.slice(-2);
  return text.slice(0,6) + "..." + text.slice(-4);
}

try {
  const diff = require("fs").readFileSync(0, "utf8");
  const findings = [];
  let curFile = "unknown";
  for (const line of diff.split("\n")) {
    if (line.startsWith("+++ b/")) { curFile = line.slice(6); continue; }
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    const content = line.slice(1);
    if (shouldSkipFile(curFile)) continue;
    if (isComment(content)) continue;
    for (const [pat, label] of CREDENTIAL_PATTERNS) {
      const m = pat.exec(content);
      if (m && !isPlaceholder(m[0])) {
        findings.push({ type: label, file: curFile, line_preview: redact(m[0]) });
        break;
      }
    }
  }
  console.log(JSON.stringify({ found: findings.length > 0, findings }));
} catch {
  console.log(JSON.stringify({ found: false, findings: [] }));
}
NODEEOF

# Scan staged diff for credentials
SCAN_RESULT=$(git diff --cached 2>/dev/null | node "$SCANNER_SCRIPT" 2>/dev/null) || exit 0

# Phase 3: Block or allow based on scan results
FOUND=$(echo "$SCAN_RESULT" | node -e "let d='';process.stdin.setEncoding('utf8');process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).found?'true':'false')}catch{console.log('false')}})" 2>/dev/null) || exit 0

if [ "$FOUND" = "true" ]; then
  DETAILS=$(echo "$SCAN_RESULT" | node -e "
let d='';process.stdin.setEncoding('utf8');
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{try{
  const data=JSON.parse(d);
  const findings=data.findings||[];
  const lines=findings.slice(0,10).map(f=>'  - '+f.type+' in '+f.file+': '+f.line_preview);
  if(findings.length>10) lines.push('  ... and '+(findings.length-10)+' more');
  console.log(lines.join('\n'));
}catch{}});
" 2>/dev/null)
  echo "BLOCKED: Potential credentials detected in staged changes. Remove secrets before committing." >&2
  echo "" >&2
  echo "Findings:" >&2
  echo "$DETAILS" >&2
  echo "" >&2
  echo "Use environment variables or a secret manager instead of hardcoding secrets." >&2
  echo "If these are false positives, review and unstage the flagged content." >&2
  exit 2
fi

exit 0
