# Nigrani AI — Public Project Intelligence & Anomaly Review Platform

**Version:** 1.0  
**Target:** Smart India Hackathon / Government & Public Infrastructure Vigilance  
**Stack:** FastAPI, Python 3.11+, SQLite / PostgreSQL, React 19, TypeScript, Vite, Tailwind CSS

---

## 🎯 Executive Summary & Core Value Proposition

**Nigrani AI** transforms thousands of raw public infrastructure project records into an **explainable, prioritized review queue**.

Public infrastructure datasets contain vast volumes of information across budgets, expenditures, contractor bids, geolocations, categories, and timelines. Manual auditing of every project is humanly impossible. Nigrani AI does not accuse anyone of corruption; instead, it identifies statistical outliers, potential duplicate allocations, project delays, and data quality flaws, providing human reviewers with the forensic evidence needed to make informed decisions.

```
Public Project Dataset
         ↓
  Data Validation (16-Point Integrity Audit)
         ↓
  Cost Anomaly Engine (Regional & Category Baseline)
         ↓
  Duplicate Intelligence (Semantic + Haversine Geo + Timeline Overlap)
         ↓
  Schedule Velocity Engine (Planned vs Elapsed Timeline)
         ↓
  Deterministic Risk Score Calculation (0–100)
         ↓
  AI Contextual Reasoning & Evidence Synthesis (Offline Demo Mode / Gemini)
         ↓
  Priority Human Review Queue & Audit Logging
```

---

## 🌐 Public Production Access (Globally Accessible)

The complete Nigrani AI platform is deployed and fully accessible from any phone, laptop, or desktop browser worldwide.

| Service | Public URL | Description |
| :--- | :--- | :--- |
| **Live Frontend Web Application** | **[https://pramendra0001.github.io/Nigrani-AI/](https://pramendra0001.github.io/Nigrani-AI/)** | Hosted React dashboard, 500-project registry & forensic workstation |
| **Public Backend REST API** | **[https://nigrani-ai-u7gz.onrender.com/](https://nigrani-ai-u7gz.onrender.com/)** | Cloud FastAPI backend service on Render |
| **Interactive API Documentation** | **[https://nigrani-ai-u7gz.onrender.com/docs](https://nigrani-ai-u7gz.onrender.com/docs)** | Live Swagger UI to test and execute API calls directly |
| **Backend Health Check** | **[https://nigrani-ai-u7gz.onrender.com/health](https://nigrani-ai-u7gz.onrender.com/health)** | Live monitoring & uptime verification endpoint |

```
┌────────────────────────────────────────────────────────┐
│                      User Device                       │
│        (Any phone, laptop, or desktop browser)         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Production Frontend (Hosted)               │
│       https://pramendra0001.github.io/Nigrani-AI/      │
└───────────────────────────┬────────────────────────────┘
                            │
                    HTTPS REST / CORS
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          Public Cloud FastAPI Backend API              │
│       https://nigrani-ai-u7gz.onrender.com             │
│       Swagger Docs: .../docs | Health: .../health      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Database Layer                        │
│   SQLite (Self-Seeding Demo) or Cloud PostgreSQL       │
└────────────────────────────────────────────────────────┘
```

> **Client Fallback Guarantee:** If the cloud backend is cold-starting from idle, the frontend automatically utilizes its embedded client intelligence engine with all 500 benchmark projects. The web app will never crash with connection errors.

---

## 💻 Local Development (Offline / Development Only)

> **Note:** The URLs in this section are strictly for local development on your own machine. They will NOT work from other computers or mobile phones.

To run and test the complete stack locally on your computer:

| Local Component | Local URL | Notes |
| :--- | :--- | :--- |
| **Local Frontend** | `http://localhost:5173` | Requires `npm run dev` running locally |
| **Local Backend API** | `http://127.0.0.1:8000` | Requires `uvicorn` running locally |
| **Local API Docs** | `http://127.0.0.1:8000/docs` | Requires `uvicorn` running locally |

### Quick Start Locally:
- **Windows (1-Click):** Double-click `start.bat` in the repository root.
- **Manual Start:**
  ```bash
  # Terminal 1 - Start FastAPI Backend:
  .\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000

  # Terminal 2 - Start React/Vite Frontend:
  cd frontend
  npm run dev
  ```

---

## 💡 Key Architectural Features

### 1. 5 Deterministic Analysis Engines
1. **Cost Anomaly Engine:** Computes median, mean, standard deviation, percentile ranking, and cost deviation against comparable projects in the same district and state.
2. **Duplicate Intelligence Engine:** Combines description token shingles, Haversine geographic distance in kilometers, timeline Jaccard overlap, and budget ratios to classify `POSSIBLE_DUPLICATE`, `POSSIBLE_OVERLAP`, or `RELATED_PROJECT`.
3. **Schedule Delay Engine:** Evaluates contractual start/end dates against reported physical completion to detect critical progress stalling.
4. **Data Quality Engine:** Audits 16 distinct schema anomalies (impossible completion %, negative budgets, dates out of sequence, coordinates outside Indian territorial bounds).
5. **Unified Risk Engine:** Configurable formula:
   $$\text{Risk Score} = (\text{Cost Risk} \times 0.35) + (\text{Duplicate Risk} \times 0.30) + (\text{Delay Risk} \times 0.25) + (\text{DQ Risk} \times 0.10)$$
   Classified as **LOW (0–30)**, **MEDIUM (31–60)**, **HIGH (61–80)**, or **CRITICAL (81–100)**.

### 2. Offline Demo Mode (No API Keys Required)
The platform is equipped with a `MockAIProvider` that generates forensic investigation briefs, actionable vigilance recommendations, and contextual explanations directly from statistical evidence. A real Google Gemini API key can be added to `.env` seamlessly without modifying application code.

### 3. Flexible Dataset Ingestion & Column Mapping
Allows analysts to upload custom CSV datasets with varying column nomenclature (e.g. `work_name` vs `project_title`, `sanctioned_amount` vs `budget`). The fuzzy mapper suggests standard assignments, presents a preview and validation report, and ingests with one click.

---

## 📂 Project Structure

```
Nigrani-AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── router.py          # All REST endpoints (Dashboard, Projects, Upload, Review, Settings)
│   │   ├── engines/
│   │   │   ├── cost_engine.py     # Statistical cost deviation & percentiles
│   │   │   ├── delay_engine.py    # Schedule delay calculation
│   │   │   ├── data_quality_engine.py # 16-point schema validation
│   │   │   ├── duplicate_engine.py # Multi-factor duplicate intelligence
│   │   │   └── risk_engine.py     # Unified deterministic risk scoring
│   │   ├── ai/
│   │   │   ├── base.py            # Abstract AI provider
│   │   │   └── mock_provider.py   # Offline evidence-based narrative generator
│   │   ├── models/
│   │   │   └── models.py          # SQLAlchemy ORM entities (12 tables)
│   │   ├── schemas/
│   │   │   └── schemas.py         # Pydantic v2 schemas
│   │   ├── services/
│   │   │   ├── analysis_service.py # Orchestrator for all 5 engines
│   │   │   ├── import_service.py  # CSV parser & fuzzy column mapper
│   │   │   └── review_service.py  # Triage queue and audit notes
│   │   ├── utils/
│   │   │   └── demo_data.py       # 500-project realistic benchmark generator
│   │   ├── config.py              # App settings & dynamic CORS
│   │   ├── database.py            # Async engine with SQLite / Postgres support
│   │   └── main.py                # FastAPI entrypoint, healthcheck & OpenAPI
│   ├── .env.example               # Backend environment variables template
│   ├── Dockerfile                 # Backend container definition
│   ├── runtime.txt                # Python runtime specification
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/            # UI components (Navbar, Sidebar, Charts, Badges)
│   │   ├── pages/                 # Dashboard, Projects, Investigation, Review, Upload, Analytics
│   │   ├── api.ts                 # Typed client with production Render URL & fallback
│   │   ├── demo_projects.json     # 500 benchmark projects dataset
│   │   ├── types.ts               # TypeScript data models
│   │   ├── App.tsx                # Master app shell
│   │   └── main.tsx
│   ├── .env.production            # Production backend configuration (Render)
│   ├── .env.development          # Development configuration (Local proxy)
│   ├── .env.example               # Environment variables template
│   ├── vite.config.ts             # Vite configuration with relative base & dev proxy
│   └── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions CI/CD with production URL injection
├── render.yaml                    # Render.com Blueprint specification
├── Procfile                       # Railway / Heroku process configuration
├── Dockerfile                     # Root container definition
├── .python-version                # Python 3.11 specification
├── start.bat                      # 1-click Windows runner for local development
└── README.md
```
