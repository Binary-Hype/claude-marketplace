# Dev Pipeline Plugin

Ein strukturiertes 4-Stage Development Pipeline Plugin für Claude Code.

## Installation

### Option 1: Lokaler Marketplace (Entwicklung/Test)

```bash
# 1. Erstelle einen Marketplace-Ordner
mkdir my-marketplace
cd my-marketplace

# 2. Kopiere das Plugin hinein
cp -r /pfad/zu/dev-pipeline ./

# 3. Erstelle die Marketplace-Manifest
mkdir .claude-plugin
cat > .claude-plugin/marketplace.json << 'EOF'
{
  "name": "my-marketplace",
  "owner": { "name": "Your Name" },
  "plugins": [
    {
      "name": "dev-pipeline",
      "source": "./dev-pipeline",
      "description": "4-stage development pipeline"
    }
  ]
}
EOF

# 4. In Claude Code:
/plugin marketplace add ./my-marketplace
/plugin install dev-pipeline@my-marketplace
```

### Option 2: Git Repository

```bash
# In Claude Code:
/plugin marketplace add username/repo-with-plugin
/plugin install dev-pipeline@username
```

## Verwendung

### Pipeline starten

```
/feature Neues User Dashboard mit Dark Mode Support
```

### Pipeline Commands

| Command | Beschreibung |
|---------|--------------|
| `/feature <beschreibung>` | Startet neue Pipeline bei Stage 1 |
| `/stage` | Zeigt aktuellen Pipeline-Status |
| `/approve` | Genehmigt aktuelle Stage → nächste Stage |
| `/back` | Zurück zur vorherigen Stage |
| `/abort` | Bricht Pipeline ab |
| `/review [target]` | Standalone Code Review |

## Pipeline Stages

```
┌──────────────────────────────────────────────────────────────┐
│  Stage 1: SPEC GENERATION 📋                                 │
│  Agent: Product Owner                                        │
│  → Sammelt Requirements durch gezielte Fragen                │
│  → Erstellt .pipeline/spec.md                                │
│  → Wartet auf /approve                                       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  Stage 2: TECHNICAL REFINEMENT 🏗️                            │
│  Agent: Lead Developer                                       │
│  → Analysiert Codebase                                       │
│  → FRAGT nach Architektur-Präferenzen                        │
│  → Erstellt .pipeline/tech-spec.md                           │
│  → Wartet auf /approve                                       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  Stage 3: IMPLEMENTATION 💻                                  │
│  Agent: Senior Developer                                     │
│  → Folgt dem Tech Spec exakt                                 │
│  → KEINE Shortcuts oder Quick Fixes                          │
│  → Fragt bei Unklarheiten                                    │
│  → Wartet auf /approve                                       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  Stage 4: REVIEW ✅                                          │
│  Agent: Code Reviewer → UI Checker (sequentiell)             │
│  → Security Check                                            │
│  → Architecture Review                                       │
│  → WCAG 2.1 AA Compliance                                    │
│  → Performance Check                                         │
│  → Erstellt .pipeline/review.md                              │
│  → UI Verification (visuell + Code-Analyse)                  │
│  → Erstellt .pipeline/ui-review.md                           │
└──────────────────────────────────────────────────────────────┘
                              ↓
                         🎉 DONE!
```

## Generierte Dateien

Die Pipeline erstellt im `.pipeline/` Ordner:

```
.pipeline/
├── state.json      # Pipeline State (Stage, Status)
├── spec.md         # Requirements (Stage 1)
├── ui-baseline/    # UI Baseline Materialien (Stage 1)
│   ├── screenshots/      # Mockups, Screenshots
│   ├── descriptions/     # ui-spec.md
│   └── references/       # Figma Links, Design System
├── tech-spec.md    # Technische Spezifikation (Stage 2)
├── changelog.md    # Implementierungs-Log (Stage 3)
├── review.md       # Code Review Report (Stage 4)
└── ui-review.md    # UI Verification Report (Stage 4)
```

## Agents

### Product Owner (Stage 1)
- Stellt viele Fragen zu Requirements
- Fokus auf User Stories, Edge Cases, UI/UX
- **Sammelt UI Baseline Materialien** (Screenshots, Figma, Beschreibungen)
- Erstellt vollständige Spezifikation

### Lead Developer (Stage 2)
- Analysiert bestehende Codebase
- Erstellt Architektur-Diagramme (Mermaid)
- **FRAGT nach Architektur-Entscheidungen**
- Plant Implementation-Reihenfolge

### Senior Developer (Stage 3)
- Implementiert nach Tech Spec
- **Keine Shortcuts oder Quick Fixes**
- Fragt bei Unklarheiten
- Dokumentiert Änderungen

### Code Reviewer (Stage 4 - Step 1)
- Security Vulnerabilities Check
- Clean Architecture Review
- WCAG 2.1 AA Compliance
- Performance Analysis
- Error Handling Check

### UI Checker (Stage 4 - Step 2)
- **Visuelle Analyse** von Screenshots/Mockups
- **Code-Analyse** von CSS/Tailwind Klassen
- Vergleicht Implementation mit UI Baseline
- Prüft Farben, Typography, Spacing, Layout
- Responsive Design Verification

## Tipps

1. **Nicht skippen!** Jede Stage hat ihren Zweck
2. **Fragen beantworten** - Die Agents fragen viel, das ist Absicht
3. **Architektur-Entscheidungen** - In Stage 2 wirst du zu Präferenzen gefragt
4. **Review ernst nehmen** - Stage 4 findet echte Issues

## Plugin Struktur

```
dev-pipeline/
├── .claude-plugin/
│   └── plugin.json          # Plugin Metadata
├── commands/
│   ├── feature.md           # /feature command
│   ├── stage.md             # /stage command
│   ├── approve.md           # /approve command
│   ├── back.md              # /back command
│   ├── abort.md             # /abort command
│   └── review.md            # /review command
├── agents/
│   ├── product-owner.md     # Stage 1 Agent
│   ├── lead-developer.md    # Stage 2 Agent
│   ├── senior-developer.md  # Stage 3 Agent
│   ├── code-reviewer.md     # Stage 4 Agent (Step 1)
│   └── ui-checker.md        # Stage 4 Agent (Step 2)
└── skills/
    └── pipeline-state/
        └── SKILL.md         # State Management Skill
```
