#!/usr/bin/env node
// Installs the statusline into ~/.claude/settings.json
// Resolves the absolute path to statusline.sh at install time

const fs = require('fs');
const path = require('path');
const os = require('os');

const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
const statuslinePath = path.join(__dirname, 'statusline.sh');

if (!fs.existsSync(statuslinePath)) {
  console.error('Error: statusline.sh not found at', statuslinePath);
  process.exit(1);
}

let settings = {};
if (fs.existsSync(settingsPath)) {
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {
    console.error('Error: Could not parse', settingsPath);
    process.exit(1);
  }
}

settings.statusLine = {
  type: 'command',
  command: `"${statuslinePath}"`
};

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');

console.log('Statusline installed successfully.');
console.log('Command: "' + statuslinePath + '"');
console.log('Restart Claude Code to see the statusline.');
