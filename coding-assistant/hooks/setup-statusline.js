#!/usr/bin/env node
// Installs the statusline into ~/.claude/settings.json
// Resolves the absolute path to statusline.js at install time

const fs = require('fs');
const path = require('path');
const os = require('os');

const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
const statuslinePath = path.join(__dirname, 'statusline.js');

if (!fs.existsSync(statuslinePath)) {
  console.error('Error: statusline.js not found at', statuslinePath);
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
  command: `node "${statuslinePath}"`
};

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');

console.log('Statusline installed successfully.');
console.log('Command: node "' + statuslinePath + '"');
console.log('Restart Claude Code to see the statusline.');
