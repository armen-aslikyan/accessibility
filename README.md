# Vivatech Audit POC

Outil d'audit d'accessibilité RGAA 4.1 avec interface React moderne.

## Architecture

Ce projet est divisé en deux parties:

### 1. Générateur d'Audit (Backend Node.js)
- Exécute des audits d'accessibilité avec Playwright et axe-core
- Analyse RGAA 4.1 (106 critères)
- Calcul d'empreinte carbone
- Génère des données JSON dans `data/audits/`

### 2. Interface React (Frontend)
- Interface moderne avec Vite et React
- Visualisation des données d'audit
- Composants interactifs pour explorer les résultats
- Design avec Tailwind CSS

## Installation

```bash
# Installer les dépendances backend
npm install

# Installer les dépendances frontend
npm run install:frontend
```

## Utilisation

### Exécuter un Audit

```bash
npm run audit
```

Cela génère:
- Des fichiers JSON dans `data/audits/`
- Un fichier `latest.json` pour accès facile
- Des rapports HTML (legacy) dans `reports/`

### Lancer l'Interface React

```bash
npm run dev
```

Ouvre le navigateur sur `http://localhost:5173`

L'interface charge automatiquement les données du dernier audit depuis `data/audits/latest.json`

### Build Production

```bash
npm run build
npm run preview
```

## Structure du Projet

```
.
├── audit.js                    # Script principal d'audit
├── exportAuditData.js          # Export des données JSON
├── data/                       # Données générées
│   └── audits/                # Résultats d'audit JSON
│       └── latest.json        # Dernier audit
├── frontend/                   # Application React
│   ├── src/
│   │   ├── components/        # Composants React
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RGAAReport.jsx
│   │   │   ├── ViolationsReport.jsx
│   │   │   └── CarbonReport.jsx
│   │   ├── utils/
│   │   │   └── dataLoader.js  # Chargement des données
│   │   └── App.jsx            # Application principale
│   └── vite.config.js         # Configuration Vite
├── constants/                  # Mappings RGAA/WCAG
└── utils/                     # Utilitaires (LLM, cache)
```

## Fonctionnalités

### Audit d'Accessibilité
- ✅ Tests automatisés (axe-core)
- ✅ Tests hybrides (automation + analyse humaine)
- ✅ Tests manuels avec support IA
- ✅ Conformité RGAA 4.1 (106 critères)
- ✅ Calcul de risque juridique (EAA 2025)

### Interface React
- 📊 **Dashboard**: Vue d'ensemble avec métriques clés
- 📋 **Critères RGAA**: Liste complète des 106 critères avec filtres
- ⚠️ **Violations**: Détail des problèmes détectés
- 🌱 **Empreinte Carbone**: Analyse d'impact environnemental

### Données JSON

Format de données exportées:

```json
{
  "meta": {
    "version": "1.0.0",
    "generatedAt": "ISO timestamp",
    "url": "site audité",
    "llmAvailable": true/false
  },
  "summary": {
    "accessibilityScore": 85,
    "totalViolations": 15,
    "legalRisk": { ... },
    "carbon": { ... }
  },
  "statistics": { ... },
  "criteria": { ... },
  "violations": [ ... ]
}
```

## Scripts Disponibles

```bash
# Audit
npm run audit              # Exécuter un audit complet

# Frontend
npm run dev                # Mode développement
npm run build              # Build production
npm run preview            # Preview du build
npm run install:frontend   # Installer dépendances frontend

# Tests
npm run test-llm          # Tester l'intégration LLM
```

## Configuration

Créer un fichier `config.js` basé sur `config.example.js` pour configurer:
- API LLM (optionnel)
- URLs à auditer
- Paramètres d'audit

## Technologies

**Backend:**
- Node.js
- Playwright
- @axe-core/playwright
- @tgwf/co2 (calcul carbone)

**Frontend:**
- React 18
- Vite
- Tailwind CSS

## License

ISC
