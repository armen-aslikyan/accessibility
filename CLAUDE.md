# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**vivatech-audit-poc** is a full-stack RGAA 4.1.2 (French Web Accessibility Standard) audit tool. It automates accessibility compliance testing using Axe-core + a local Ollama LLM for intelligent RGAA assessment, and supports both single-page and full-site audits.

## Development Commands

```bash
# Start development server
npm run dev

# Start the PostgreSQL database (required before dev)
npm run docker:up

# Database management
npm run prisma:migrate    # Run pending migrations
npm run prisma:generate   # Regenerate Prisma client after schema changes
npm run prisma:studio     # Open Prisma Studio UI

# Build & lint
npm run build
npm run lint

# Database backup
npm run db:backup

# Kill Ollama processes if stuck
npm run kill-ollama-process
npm run kill-ollama-daemon
```

## Prerequisites

- Docker (for PostgreSQL)
- Ollama running locally (for LLM-based RGAA assessment)
- Node.js with Playwright browsers installed (`npx playwright install chromium`)
- `.env` file with `DATABASE_URL` (see `.env.example`)

## Architecture

### Audit Execution Flow

Audits run as **detached child processes** spawned from the API route — they outlive the HTTP request:

```
POST /api/audits
  → Create DB record (status: pending)
  → spawn() scripts/run-audit.js or scripts/run-site-audit.js (detached)
  → Return audit ID immediately

scripts/run-audit.js (page mode):
  → Playwright: launch Chromium, navigate to URL
  → axe-core: accessibility scan
  → htmlExtractor.js: extract theme-relevant HTML
  → llmClient.js: send to Ollama for RGAA criterion assessment
  → Save CriterionResult records to DB
  → Mark audit completed

scripts/run-site-audit.js (site mode):
  → Crawl site (robots.txt, sitemap, link following)
  → Hash page structure → cluster into PageTemplates (A, B, C...)
  → Audit one representative per template × 3 viewports (desktop/tablet/mobile)
  → Save DiscoveredPage, PageTemplate, ViewportResult records
  → Aggregate compliance metrics on Audit record
```

### Key Modules

| File | Purpose |
|------|---------|
| `lib/audit-core.js` | Core axe + LLM logic (~1000 lines), shared by both scripts |
| `lib/audit-runner.ts` | Spawns audit scripts as detached child processes |
| `lib/transform-audit.ts` | Transforms DB data for page-mode UI |
| `lib/transform-site-audit.ts` | Transforms DB data for site-mode UI |
| `utils/llmClient.js` | Ollama HTTP client — sends prompts, parses structured JSON responses |
| `utils/htmlExtractor.js` | Cheerio-based HTML filtering by RGAA theme (reduces LLM context) |
| `constants/rgaaMapping.complete.js` | All 106 RGAA 4.1.2 criteria (178KB — do not edit lightly) |

### API Routes (`app/api/audits/`)

- `POST /` — Create audit, spawn background script
- `GET /` — List all audits
- `GET /[id]` — Fetch audit with transformed data
- `PATCH /[id]` — Cancel audit
- `DELETE /[id]` — Delete audit

### Audit Modes

- **Page Mode ("Quick Check"):** Single URL, one viewport — no legal compliance weight
- **Site Mode ("Full Audit"):** Full crawl, template clustering, 3 viewports — used for legal RGAA compliance reporting

### Database Schema (Prisma + PostgreSQL)

Key models and their roles:
- **`Audit`** — Root record; holds URL, status, mode, aggregate metrics
- **`CriterionResult`** — Per RGAA article result (status, confidence, AI reasoning, axe evidence)
- **`DiscoveredPage`** — Each page found during crawl; linked to a `PageTemplate`
- **`PageTemplate`** — Cluster of structurally similar pages (named A, B, C...); audited once per viewport
- **`ViewportResult`** — axe results per template × viewport combination
- **`ElementFixSuggestion`** — AI-generated code fix for a specific element
- **`PageHashCache`** — Caches structural hashes per URL to detect changes across audits
- **`UserPreference`** — Per-session language preference (en/fr)

### Frontend Components

- **`AuditDetail.tsx`** — Page-mode report UI (criterion list, evidence gallery)
- **`SiteAuditDetail.tsx`** — Site-mode report UI (template cards, viewport comparison)
- **`RGAAReport.tsx`** — Full RGAA criteria breakdown table
- **`Dashboard.tsx`** — Metrics summary + legal risk display
- **`I18nProvider.tsx`** / **`LanguageSwitcher.tsx`** — i18next EN/FR support

### Important Configuration

- `next.config.ts` marks `playwright`, `@axe-core/playwright`, `cheerio`, `p-limit` as `serverExternalPackages` — these must not be bundled by webpack
- `tsconfig.json` excludes `scripts/` from TypeScript compilation (scripts are plain JS)
- Scripts in `scripts/` are Node.js entry points, not Next.js modules
