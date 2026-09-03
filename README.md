# Nigrani AI — Public Project Intelligence & Anomaly Review Platform

**Version:** 1.0  
**Target:** Smart India Hackathon / Government & Public Infrastructure Vigilance  
**Stack:** FastAPI, Python 3.13, SQLite / aiosqlite, React 19, TypeScript, Vite, Tailwind CSS

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

## 🚀 Live System URLs

| Component | URL | Description |
| :--- | :--- | :--- |
| **Interactive Frontend** | [http://127.0.0.1:5173](http://127.0.0.1:5173) | Modern executive dashboard, investigation workstation, and review triage |
| **Backend REST API** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | FastAPI high-performance asynchronous API |
| **Interactive API Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Swagger UI for exploring all 16 endpoints |

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

## 🛠️ Quickstart (How to Run Locally)

### Prerequisites
- Python 3.11+ (Python 3.13 recommended)
- Node.js v18+ & npm

### Starting the Backend
```bash
# In the root directory:
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Starting the Frontend
```bash
cd frontend
npm run dev
```

---

## 📂 Project Structure

```
RR/
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
│   │   ├── config.py              # App settings & risk weights
│   │   ├── database.py            # aiosqlite async database session
│   │   └── main.py                # FastAPI entrypoint & auto-seeder
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx         # SIH branding & demo mode indicator
│   │   │   ├── Sidebar.tsx        # Navigation & triage counter
│   │   │   ├── MetricCard.tsx     # Executive KPI cards
│   │   │   ├── RiskBadge.tsx      # Multi-tier risk severity pill
│   │   │   ├── StatusBadge.tsx    # Project & review lifecycle badges
│   │   │   └── SvgCharts.tsx      # SVG Donut Chart, Bar Chart & Radial Gauge
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx  # Executive overview, KPI counters, sector breakdown
│   │   │   ├── ProjectsPage.tsx   # Filterable & searchable database of all 500 projects
│   │   │   ├── InvestigationPage.tsx # 8-tab deep dive forensic investigation workstation
│   │   │   ├── ReviewQueuePage.tsx # Human reviewer triage queue
│   │   │   ├── UploadPage.tsx     # CSV dropzone & automated column mapping
│   │   │   └── AnalyticsPage.tsx  # Risk formula weight calibrator
│   │   ├── api.ts                 # Typed fetch client
│   │   ├── types.ts               # TypeScript data models
│   │   ├── App.tsx                # Master app shell & navigation router
│   │   └── main.tsx
│   └── package.json
└── README.md
```
