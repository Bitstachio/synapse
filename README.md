# Synapse

> A Human-Centered AI Assurance Framework — TD Bank C4 Capstone Project (April 2026)

Synapse is a governance system that helps organizations adopt AI responsibly without compromising employee **well-being**, **privacy**, or **security**. It transforms static policy documents into a dynamic, real‑time decision-support layer that integrates directly into the tools teams already use (e.g. Jira), flags potential framework violations, and recommends safer alternatives.

This monorepo contains the full MVP that accompanies the capstone report: the AI risk-scoring service, the framework management console (API + admin web app), a Jira plug-in, the published methodology/report site, and a public showcase landing page.

**Authors:** Max Catricala · Alessandro Tesa · Natalia Garcia · Amirhossein Mansouri · Barbod Habibi · Rameen Kahloon · Aabrar Raiyan

---

## Table of contents

- [What is Synapse?](#what-is-synapse)
- [Repository structure](#repository-structure)
- [Architecture overview](#architecture-overview)
- [End-to-end data flow](#end-to-end-data-flow)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Framework Management API (`console/api`)](#1-framework-management-api-consoleapi)
  - [2. Framework Admin Web (`console/web`)](#2-framework-admin-web-consoleweb)
  - [3. Synapse Brain (`brain`)](#3-synapse-brain-brain)
  - [4. Jira plug-in (`integrations/jira`)](#4-jira-plug-in-integrationsjira)
  - [5. Methodology / report site (`methodology`)](#5-methodology--report-site-methodology)
  - [6. Showcase landing page (`showcase`)](#6-showcase-landing-page-showcase)
- [Environment variables](#environment-variables)
- [Tech stack](#tech-stack)
- [Project status](#project-status)
- [License](#license)

---

## What is Synapse?

The rapid integration of AI into workplaces — particularly in regulated industries such as banking — creates a **micro-alignment gap**: traditional AI safety frameworks address macro risks (bias, fairness, model performance) but rarely speak to the *individual* employee's day-to-day experience, autonomy, and trust.

Working with TD Bank, the team identified that employees often lack the clarity and confidence to use AI tools responsibly. Synapse closes that gap with two coordinated artifacts:

1. **The Synapse Wellbeing Framework** — a hierarchical, versioned governance document (`Categories → Subcategories → Instructions`) that encodes the organization's policies for employee well-being, privacy, and security.
2. **An AI-powered decision-support MVP** — embedded in Jira, where every ticket / user story is automatically scored against the active framework, with violations flagged, explained, and accompanied by suggested revisions.

This turns static policy into actionable, in-context guidance, rather than a PDF that nobody reads.

## Repository structure

```text
synapse/
├── brain/                # Python FastAPI service: risk scoring & NLP analysis
├── console/
│   ├── api/              # NestJS API: framework CRUD, versioning, revisions, Auth0 RBAC
│   └── web/              # Next.js admin UI for the framework
├── integrations/
│   └── jira/             # Atlassian Forge app: Jira issue panel that calls the brain
├── methodology/          # Nextra documentation site: the full capstone report
├── showcase/             # Vite + React public landing page presenting the project
└── framework/            # Reserved (legacy scaffold — currently unused)
```

Each subproject is self-contained, has its own dependency manifest, and can be developed independently.

## Architecture overview

Synapse is a modular workflow built around six functional components that map directly to deployable services:

| # | Component | Where it lives |
|---|-----------|----------------|
| 1 | User Input Interface | `integrations/jira` (Forge issue panel) and `console/web` |
| 2 | Framework Validation Engine | `brain` (FastAPI + OpenAI structured outputs) |
| 3 | Violation Detection Module | `brain` (scores user stories against the active framework) |
| 4 | Explanation Engine | `brain` (LLM-generated rationale tied to instruction IDs) |
| 5 | Suggestion Engine | `brain` (remediation guidance) |
| 6 | Feedback / Revision Interface | `console/web` (framework editor + revision log) |

The **Framework API** (`console/api`) is the source of truth for the Wellbeing Framework. The **Brain** loads the active framework and performs LLM-based risk scoring. The **Jira plug-in** is the primary user-facing surface for everyday users; the **Admin Web** is the surface for HR / governance staff who maintain the framework.

```
                                 ┌──────────────────────────────┐
                                 │  Framework Management API    │
                                 │  (console/api · NestJS · DB) │
                                 └──────────────┬───────────────┘
                                                │  GET /frameworks/active
                                                ▼
┌──────────────────┐    POST /api/v1/analyze-story    ┌──────────────────┐
│  Jira issue      │ ───────────────────────────────▶ │  Synapse Brain   │
│  (Forge panel)   │ ◀────────── verdict JSON ─────── │  (FastAPI · LLM) │
└──────────────────┘                                  └──────────────────┘

┌────────────────────────┐    HTTPS + Auth0 JWT     ┌──────────────────────────┐
│  Admin Web (Next.js)   │ ───────────────────────▶ │  Framework Management API │
│  console/web           │ ◀─────────────────────── │  console/api              │
└────────────────────────┘                          └──────────────────────────┘
```

## End-to-end data flow

A typical "is this Jira ticket safe?" round-trip:

1. A developer opens a Jira issue. The **Synapse** issue panel (Forge app) loads.
2. The panel resolver (`integrations/jira/src/index.js`) reads the issue's `summary` + `description` (ADF → plain text) via `requestJira`.
3. It POSTs `{ story_text }` to the **Brain** at `/api/v1/analyze-story`.
4. The Brain loads the active framework (currently from the bundled prototype JSON; the live `console/api` integration is wired and feature-flagged), flattens it into an audit context, and asks OpenAI for a structured `risk_score ∈ [0.0, 1.0]` via OpenAI Structured Outputs.
5. The Brain returns a `UserStoryVerdict` (`is_safe`, `risk_score`, `violated_controls`, `remediation`, `framework_id`) wrapped in a `StandardResponse` envelope.
6. The Jira panel renders the verdict inline with the issue, so the developer can revise before assigning / committing.

Independently, governance staff use **`console/web`** to author / version / activate frameworks against **`console/api`**, with every change captured as an auditable revision (created / updated / deleted / activated) including diffs.

## Getting started

### Prerequisites

- **Node.js** 20+ and **npm** (used by `console/api`, `console/web`, `methodology`, `showcase`, `integrations/jira`)
- **Python** 3.11+ and **pip** (used by `brain`)
- **MongoDB** running locally (or a connection string) for `console/api`
- **Auth0** tenant — see `console/api/docs/AUTH0_SETUP.md`
- **OpenAI** API key (required for the Brain's risk scoring)
- **Google Gemini** API key (optional — only used by the Brain's `/test` connectivity endpoint)
- **Atlassian Forge CLI** (`npm i -g @forge/cli`) — only if you intend to deploy the Jira app

> [!TIP]
> You can develop most of the system without Forge / Jira by hitting the Brain directly with `curl` or via the Next.js admin app.

### 1. Framework Management API (`console/api`)

The NestJS service that owns the Wellbeing Framework, its versions, and the revision history. Uses MongoDB and Auth0.

```bash
cd console/api
npm install
cp .env.example .env   # then fill in MONGODB_URI, AUTH0_*
npm run start:dev
```

Once running:

- API base: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/api/docs`
- Health check: `GET /api/v1/` (the `AppController`)

Key endpoints (all behind `JwtAuthGuard` + `PermissionsGuard`):

- `POST /frameworks` — create a new framework version
- `GET /frameworks` — list all frameworks
- `GET /frameworks/active` — fetch the currently active framework (consumed by the Brain)
- `GET /frameworks/:id` — fetch a single framework
- `PATCH /frameworks/:id` — update content (categories / subcategories / instructions)
- `PATCH /frameworks/:id/activate` — make this version the source of truth
- `DELETE /frameworks/:id` — remove a version
- `GET /frameworks/revisions` — paginated audit log
- `GET /frameworks/revisions/:revisionId` — full diff with `previousContent`, `newContent`, and enriched names
- `POST /auth/login` — Auth0 password-grant login

Auth0 roles & permissions are documented in `console/api/docs/AUTH0_SETUP.md` (Framework Viewer, Publisher, Administrator).

### 2. Framework Admin Web (`console/web`)

Next.js 16 + React 19 admin UI for HR / governance staff to author, version, and activate frameworks, and to inspect the revision history with diff visualization.

```bash
cd console/web
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
npm run dev
```

Open `http://localhost:3000` (or whatever Next.js prints — it will fall back if 3000 is taken). Sign in with an Auth0 user that has the appropriate permissions.

### 3. Synapse Brain (`brain`)

The FastAPI service that performs NLP analysis and computes the risk score against the active framework using OpenAI Structured Outputs.

```bash
cd brain
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set OPENAI_API_KEY (required), GOOGLE_API_KEY (optional), FRAMEWORK_API_BASE_URL, FRAMEWORK_API_BEARER_TOKEN
uvicorn main:app --reload --port 8000
```

Once running:

- `GET /health` — basic health check
- `GET /test` — Gemini connectivity smoke test (requires `GOOGLE_API_KEY`)
- `POST /api/v1/analyze-story` — body: `{ "story_text": "..." }` (min length 10)

Example:

```bash
curl -X POST http://localhost:8000/api/v1/analyze-story \
  -H "Content-Type: application/json" \
  -d '{"story_text": "As a manager, I want to use AI to monitor employee keystrokes so I can measure productivity."}'
```

Returns a `StandardResponse<AnalyzeStoryResult>` with the verdict.

> [!NOTE]
> In the current MVP, the Brain reads the active framework from `brain/active-framework-response.json` (or `brain/fixtures/active-framework-response.json` in production). The live integration with `console/api`'s `GET /frameworks/active` endpoint is implemented in `services/active_framework_service.py` and is wired but disabled by default in the `analyze` route.

### 4. Jira plug-in (`integrations/jira`)

An Atlassian Forge app that adds a **Synapse** panel to every Jira issue, reads the issue's summary + description, and calls the Brain for analysis.

```bash
cd integrations/jira
npm install                       # root deps (resolver)
cd static/synapse-ui && npm install && npm run build && cd -

forge login                       # one-time
forge deploy --non-interactive --environment development
forge install --non-interactive --site <your-site>.atlassian.net --product jira --environment development
```

The default `SYNAPSE_ANALYZE_URL` points at the deployed Render instance (`https://synapse-0olq.onrender.com/api/v1/analyze-story`). Override with the `SYNAPSE_ANALYZE_URL` Forge env var (and add the matching host to `manifest.yml`'s egress allow-list) to point at a local Brain via tunneling.

### 5. Methodology / report site (`methodology`)

Nextra-powered static site that publishes the full capstone report (abstract, objectives, solution design, results & analysis, collaboration, conclusion, acknowledgements, references, appendix).

```bash
cd methodology
npm install
npm run dev   # http://localhost:3000
npm run build # generates Pagefind search index in postbuild
```

### 6. Showcase landing page (`showcase`)

A Vite + React + Tailwind + Framer Motion single-page site that presents the project to a general audience.

```bash
cd showcase
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Environment variables

Each subproject has its own `.env.example`. The most important variables across the stack:

| Variable | Where | Purpose |
|---|---|---|
| `MONGODB_URI`, `MONGODB_DB_NAME` | `console/api` | MongoDB connection |
| `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` | `console/api` | Auth0 RBAC + login |
| `NEXT_PUBLIC_API_BASE_URL` | `console/web` | Browser → Framework API |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | `brain` | LLM that produces the `risk_score` |
| `GOOGLE_API_KEY` | `brain` | Optional — Gemini connectivity smoke test |
| `FRAMEWORK_API_BASE_URL`, `FRAMEWORK_API_BEARER_TOKEN` | `brain` | When the live framework integration is enabled |
| `FRAMEWORK_PROTOTYPE_JSON` | `brain` | Optional override of prototype framework JSON path |
| `SYNAPSE_ANALYZE_URL` | `integrations/jira` (Forge env) | Where the Forge resolver POSTs |

> [!WARNING]
> Never commit real `.env` files. The repository's `.gitignore` rules and the per-package `.gitignore`s exclude them, but always double-check before pushing.

## Tech stack

| Layer | Technology |
|---|---|
| LLM / NLP | OpenAI (`gpt-4o-mini` by default, Structured Outputs), Google Gemini (smoke test) |
| Brain service | Python 3.11+, FastAPI, Pydantic v2, httpx, Uvicorn |
| Framework API | NestJS 11, TypeScript, Mongoose, MongoDB, Auth0 (JWT + RBAC), Swagger / OpenAPI |
| Admin Web | Next.js 16, React 19, TanStack Query, Tailwind CSS 4 |
| Jira plug-in | Atlassian Forge (UI Kit Custom UI), `@forge/api`, `@forge/resolver` |
| Methodology site | Next.js 16, Nextra 4, MDX, Pagefind |
| Showcase | Vite, React 19, Framer Motion, Tailwind CSS |
| Infra (current) | Render (Brain), Auth0 (identity), MongoDB Atlas (data) |

## Project status

This repository is the deliverable for a TD Bank capstone (C4). It is an **MVP / prototype** intended to demonstrate the value of the Human-Centered AI Assurance Framework. Several integrations (notably the Brain ↔ live Framework API freshness check) are implemented but feature-flagged behind the prototype JSON loader for demo reproducibility.

## License

This project is the work of the listed capstone authors and TD Bank stakeholders. No open-source license has been applied at the repository root; treat all code, content, and assets as proprietary unless an individual subproject states otherwise.
