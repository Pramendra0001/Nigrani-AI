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

## 🚀 Live Demo & Production Architecture

### 🌐 1. Public Production Frontend (GitHub Pages)
The web application is deployed and publicly accessible globally from any phone, laptop, or browser:
👉 **[https://pramendra0001.github.io/Nigrani-AI/](https://pramendra0001.github.io/Nigrani-AI/)**

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
│       https://<YOUR_BACKEND_URL>.onrender.com          │
│       Swagger Docs: .../docs | Health: .../health      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Database Layer                        │
│   SQLite (Self-Seeding Demo) or Cloud PostgreSQL       │
└────────────────────────────────────────────────────────┘
```

> **Client Fallback Guarantee:** When the remote backend is waking up from a cloud cold-start or during offline presentations, the frontend seamlessly uses its embedded client intelligence engine with all 500 benchmark projects. The application will never crash with network errors.

---

### ☁️ 2. Cloud Backend Deployment (Render / Railway)

The FastAPI backend is fully cloud-ready with `render.yaml` and `Procfile`.

#### Recommended: Deploy to Render (Free Tier)
1. Log in to [Render](https://render.com) with GitHub.
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect repository: `Pramendra0001/Nigrani-AI`.
4. Render will read `render.yaml` automatically, or configure manually:
   - **Root Directory:** *(leave blank)*
   - **Environment:** `Python`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`
   - **Environment Variables:**
     - `CORS_ORIGINS`: `https://pramendra0001.github.io`
     - `DEMO_MODE`: `true`
     - `AI_PROVIDER`: `mock`
5. Click **Deploy**. Your live backend URL will be:
   `https://nigrani-ai-api.onrender.com` (or your assigned subdomain).

#### Connecting Frontend to the Live Cloud Backend:
Once your backend is deployed:
1. In your GitHub repository: Go to **Settings** → **Secrets and variables** → **Actions** → **Variables**.
2. Click **New repository variable**:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://your-backend-app.onrender.com`
3. Go to **Actions** tab → Select **Deploy Nigrani AI Web App to GitHub Pages** → Click **Run workflow**.
4. GitHub Pages will rebuild and connect to your live cloud backend!

---

### 💻 3. Local Full-Stack Development (FastAPI + React)

To run the full stack locally on your computer:

| Component | Local URL | Description |
| :--- | :--- | :--- |
| **Interactive Frontend** | [http://localhost:5173](http://localhost:5173) | Modern executive dashboard, investigation workstation, and review triage |
| **Backend REST API** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | FastAPI high-performance asynchronous API |
| **Interactive API Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Swagger UI for exploring all 16 endpoints |

#### Quick Start Locally:
- **Windows (1-Click):** Double-click `start.bat` in the repository root.
- **Manual Start:**
  ```bash
  # Terminal 1 - Backend:
  .\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000

  # Terminal 2 - Frontend:
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
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/            # UI components (Navbar, Sidebar, Charts, Badges)
│   │   ├── pages/                 # Dashboard, Projects, Investigation, Review, Upload, Analytics
│   │   ├── api.ts                 # Typed client with environment base URL resolution & fallback
│   │   ├── demo_projects.json     # 500 benchmark projects dataset
│   │   ├── types.ts               # TypeScript data models
│   │   ├── App.tsx                # Master app shell
│   │   └── main.tsx
│   ├── .env.example               # Frontend environment template
│   ├── .env.development          # Development configuration
│   ├── .env.production.example   # Production configuration template
│   ├── vite.config.ts             # Vite configuration with relative base & dev proxy
│   └── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions CI/CD with VITE_API_BASE_URL support
├── render.yaml                    # Render.com Blueprint specification
├── Procfile                       # Railway / Heroku process configuration
├── start.bat                      # 1-click Windows runner
└── README.md
```
