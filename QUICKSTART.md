# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
# Install backend dependencies (already done if you ran npm install)
npm install

# Install frontend dependencies
npm run install:frontend
```

### 2. Test the React Interface

You can test the interface immediately with the example data provided:

```bash
npm run dev
```

This will open `http://localhost:5173` with example audit data.

### 3. Run a Real Audit

To generate real audit data:

```bash
npm run audit
```

This will:
- Audit the configured URLs (default: vivatechnology.com)
- Generate JSON data in `data/audits/`
- Update `data/audits/latest.json`
- The React app will automatically pick up the new data on refresh

## 📁 Project Structure

```
vivatech-audit-poc/
├── audit.js                    # Main audit script
├── exportAuditData.js          # JSON data exporter
├── data/
│   └── audits/
│       ├── latest.json        # Latest audit (auto-updated)
│       └── example.json       # Example data for testing
└── frontend/                   # React application
    ├── src/
    │   ├── App.jsx            # Main app with tabs
    │   ├── components/
    │   │   ├── Dashboard.jsx      # Overview & metrics
    │   │   ├── RGAAReport.jsx     # 106 RGAA criteria
    │   │   ├── ViolationsReport.jsx # Detailed violations
    │   │   └── CarbonReport.jsx   # Carbon footprint
    │   └── utils/
    │       └── dataLoader.js      # Data loading utilities
    └── vite.config.js         # Vite config (serves data folder)
```

## 🎨 React Interface Features

The React interface includes 4 main views:

1. **📊 Dashboard**
   - Accessibility score
   - Legal risk assessment
   - Carbon footprint
   - RGAA statistics

2. **📋 RGAA Criteria**
   - All 106 RGAA 4.1 criteria
   - Filter by status (passed, failed, manual, AI)
   - Search functionality
   - Detailed violation info

3. **⚠️ Violations**
   - All accessibility violations detected
   - Filter by impact (critical, serious, moderate, minor)
   - Code snippets and fix suggestions
   - Links to WCAG documentation

4. **🌱 Carbon Report**
   - CO2 emissions per visit
   - Yearly projections
   - Eco-design recommendations
   - Comparisons and context

## 🔧 Configuration

Edit the URLs to audit in `audit.js`:

```javascript
const pagesToAudit = [
    'https://your-website.com',
    'https://your-website.com/about',
    // Add more URLs...
];
```

## 📝 Workflow

```
┌──────────────┐
│  Run Audit   │  npm run audit
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Generate Data   │  Saves to data/audits/
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Launch React    │  npm run dev
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  View Results    │  http://localhost:5173
└──────────────────┘
```

## 🛠 Available Commands

```bash
# Development
npm run audit         # Run accessibility audit
npm run dev          # Start React dev server
npm run build        # Build React app for production
npm run preview      # Preview production build

# Installation
npm run install:frontend  # Install frontend dependencies
```

## 💡 Tips

- **First Time**: Use `npm run dev` right away to see the interface with example data
- **Real Data**: Run `npm run audit` to generate actual audit data (takes 1-2 minutes)
- **Live Updates**: After running an audit, just refresh the browser to see new data
- **Multiple Audits**: Historical audits are saved with timestamps in `data/audits/`

## 🔍 Data Format

The exported JSON includes:
- Meta information (URL, timestamp, version)
- Summary (scores, legal risks, carbon footprint)
- Statistics (criteria breakdown)
- All 106 RGAA criteria with test results
- Detailed violations with code snippets
- Pass/incomplete results

## 🎯 Next Steps

1. Customize audit URLs in `audit.js`
2. Run your first real audit: `npm run audit`
3. Explore the React interface: `npm run dev`
4. Customize components in `frontend/src/components/`
5. Add more visualizations as needed

Enjoy auditing! 🚀
