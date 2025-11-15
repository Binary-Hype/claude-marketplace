# Research Assistant Plugin

Comprehensive research and analysis toolkit with specialized skills for market research, competitive intelligence, trend analysis, and data investigation.

## Overview

This plugin provides six specialized research skills that can be invoked to perform deep analysis, information gathering, and strategic insights across various domains.

## Available Skills

### 1. research-analyst
Expert research analyst specializing in comprehensive information gathering, synthesis, and insight generation.

**Use for:**
- Comprehensive research projects
- Information synthesis from multiple sources
- Detailed research reports
- Academic or industry research

### 2. search-specialist
Expert search specialist mastering advanced information retrieval and query optimization.

**Use for:**
- Finding hard-to-locate information
- Advanced search strategies
- Accessing specialized databases
- High-precision information retrieval

### 3. trend-analyst
Expert trend analyst specializing in identifying emerging patterns and forecasting future developments.

**Use for:**
- Trend identification and analysis
- Future forecasting
- Strategic foresight
- Scenario planning

### 4. competitive-analyst
Expert competitive analyst specializing in competitor intelligence and strategic analysis.

**Use for:**
- Competitive benchmarking
- SWOT analysis
- Market positioning
- Competitor intelligence

### 5. market-researcher
Expert market researcher specializing in market analysis and consumer insights.

**Use for:**
- Market sizing (TAM, SAM, SOM)
- Consumer behavior research
- Market segmentation
- Go-to-market strategies

### 6. data-researcher
Expert data researcher specializing in data discovery and statistical analysis.

**Use for:**
- Data analysis and mining
- Statistical analysis
- Pattern recognition
- Data visualization

## Usage

Each skill is automatically available when the plugin is installed. Skills are invoked based on the task context and can operate autonomously.

## Tools

All skills have access to:
- Read - Read files and documents
- Grep - Search file contents
- Glob - Find files by pattern
- WebFetch - Fetch and analyze web content
- WebSearch - Search the web for information

## Plugin Structure

```
research-assistant/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── research-analyst/
│   │   └── SKILL.md
│   ├── search-specialist/
│   │   └── SKILL.md
│   ├── trend-analyst/
│   │   └── SKILL.md
│   ├── competitive-analyst/
│   │   └── SKILL.md
│   ├── market-researcher/
│   │   └── SKILL.md
│   └── data-researcher/
│       └── SKILL.md
└── README.md
```

## Author

Tobias Kokesch (Binary Hype)
- Email: hallo@binary-hype.com
- Repository: https://github.com/Binary-Hype/claude-marketplace

## License

MIT

## Credits

Skills are based on the excellent work from [VoltAgent's awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) repository.
