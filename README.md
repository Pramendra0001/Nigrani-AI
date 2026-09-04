# Nigrani AI

## AI-Powered MPLADS Intelligence, Anomaly Detection & Decision-Support Platform

Nigrani AI is an AI-powered public project intelligence and decision-support platform designed to support the monitoring and analysis of MPLADS (Member of Parliament Local Area Development Scheme) implementation data.

The platform analyzes available project, financial, expenditure, progress, timeline, geospatial, and data-quality information to identify potential anomalies, unusual patterns, inefficiencies, inconsistencies, and high-risk cases requiring human review.

> **Decision-Support Disclaimer:**  
> A detected anomaly, risk score, or potential irregularity does not establish fraud, corruption, misconduct, or legal liability. Findings are evidence-based risk indicators intended to support verification and informed human review. Human examination of measurement books, administrative sanctions, and treasury vouchers remains essential.

---

## 1. Project Overview

Nigrani AI serves as a direct-access, decision-support intelligence platform that ingests, audits, and analyzes parliamentary infrastructure portfolios across India. The platform supports both parliamentary houses:
- **Lok Sabha:** 543 Parliamentary Constituency Portfolios across all 28 States and 8 Union Territories.
- **Rajya Sabha:** 231 State-Represented Parliamentary Portfolios.
- **Total Monitored Scope:** 774 Official Parliamentary Portfolios.

The system provides vigilance officers, State Nodal Authorities, and district administrators with prioritized, evidence-backed dossiers rather than arbitrary or black-box risk scores.

---

## 2. Problem Addressed

Monitoring public works under MPLADS presents significant administrative challenges:
- **High Volume & Fragmented Portfolios:** Hundreds of parliamentary portfolios and thousands of localized works are executed across 700+ districts.
- **Disproportionate Financial-Physical Velocity:** Discrepancies where financial disbursements reach near-exhaustion while physical progress lags behind.
- **Duplicate & Overlapping Allocations:** Unintentional re-sanctioning of identical or adjacent assets across successive tenures or nearby wards.
- **Schedule Slippage & Milestone Stagnation:** Works idling without physical progress or timely closure.
- **Data Incompleteness & Reporting Gaps:** Missing milestone dates, conflicting progress percentages, and irregular updates.

Manual portfolio audits are resource-intensive. Nigrani AI automates statistical screening to identify statistical outliers and potential compliance deviations, presenting clear forensic evidence to human reviewers.

---

## 3. Core Capabilities

- **Multi-Format Data Ingestion:** Automated ingestion of CSV, JSON, and Excel files with fuzzy header matching and schema preview.
- **16-Point Data Quality Audit:** Automated scoring of completeness, range sanity, date ordering, and cross-field consistency.
- **IQR-Based Cost Outlier Detection:** Deterministic interquartile range (IQR) and percentile baseline analysis by category and state.
- **Multi-Factor Duplicate Intelligence:** Combined TF-IDF semantic vector similarity, Haversine geospatial proximity, and temporal overlap scoring.
- **Physical vs. Financial Consistency Analysis:** Divergence gap calculation between financial absorption and on-ground physical delivery.
- **Disbursement Velocity & Threshold Monitoring:** Macro-level expenditure monitoring with opt-in synthetic stress-testing for sub-voucher pattern detection.
- **Explainable Risk Scoring ("Why Flagged?"):** Transparent point attribution breakdown with full mathematical traceability.
- **Human Review & Investigation Dossier:** Comprehensive 8-stage financial lifecycle tracking, variance analysis, and 6-state review lifecycle.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Browser                                │
│        React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons       │
│        (Direct-Access Demonstration UI • Dark/Light Mode Theme)         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                             REST API (JSON)
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                       FastAPI Application Server                        │
│                 Python 3.11+ • Async SQLAlchemy                         │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Core Intelligence Engines                      │  │
│  │  1. CostEngine (IQR & Percentile Peer Baselines)                  │  │
│  │  2. DuplicateEngine (TF-IDF Cosine + Haversine Geospatial)        │  │
│  │  3. DelayEngine (Schedule Velocity & Milestone Deviation)         │  │
│  │  4. DataQualityEngine (16-Point Integrity & Completeness Rubric)   │  │
│  │  5. ConsistencyEngine (Physical vs. Financial Divergence Gap)     │  │
│  │  6. PaymentEngine (Disbursement Velocity & Threshold Rules)       │  │
│  │  7. Unified RiskEngine (Explainable Multi-Criteria Scoring)       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Services & Data Processing                    │  │
│  │  • ImportService (CSV / JSON / Excel Fuzzy Schema Detection)      │  │
│  │  • ReviewService (Dossier Lifecycle, Audit Notes, Status Log)     │  │
│  │  • AnalysisService (Batch & Portfolio Pipeline Orchestrator)      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                               Async Driver
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                           Database Layer                                │
│       SQLite (Local Development) / PostgreSQL (Cloud Production)        │
│    774 Official Parliamentary Portfolios (543 Lok Sabha + 231 RS)       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Core Intelligence Engines

The platform incorporates 7 dedicated analytical engines:

| Engine | Primary Function | Core Methodology | Input Requirements |
| :--- | :--- | :--- | :--- |
| **Cost Anomaly Engine** | Detects abnormal portfolio expenditures | Interquartile Range (IQR, 1.5x / 3.0x IQR thresholds) & category medians | Sanctioned cost, cumulative expenditure, category |
| **Duplicate Intelligence Engine** | Identifies potential overlapping works | Character 3-gram TF-IDF cosine similarity + Haversine geographical distance | Work title, category, latitude, longitude |
| **Schedule Delay Engine** | Evaluates execution timelines | Ratio of elapsed time to planned duration vs. reported physical progress | Start date, target completion date, physical progress |
| **Data Quality Engine** | Evaluates record completeness & integrity | 16-point deterministic rule checks with weighted completeness scoring | Mandatory identifiers, financial fields, coordinates |
| **Consistency Engine** | Detects physical vs. financial divergence | Mathematical divergence gap: `abs(financial_% - physical_%)` | Completion percentage, budget, cumulative expenditure |
| **Payment Intelligence Engine** | Evaluates disbursement velocity & thresholds | Macro expenditure velocity checks; statutory ceiling clustering | Expenditure totals, sanctioned ceilings, voucher logs |
| **Unified Risk Engine** | Synthesizes explainable composite score | Weighted multi-criteria linear model with point attribution breakdown | Outputs from all active analytical engines |

---

## 6. End-to-End Workflow

The platform follows a continuous, connected 13-step governance assurance workflow:

```
[1] Data Enters Platform
       ↓
[2] Schema Detection & Column Normalization
       ↓
[3] 16-Point Data Quality Audit
       ↓
[4] Cost & Expenditure Screening (IQR Outliers)
       ↓
[5] Duplicate & Overlap Detection (Semantic & Geospatial)
       ↓
[6] Schedule Velocity & Delay Assessment
       ↓
[7] Physical vs. Financial Consistency Evaluation
       ↓
[8] Payment Disbursement Velocity & Threshold Analysis
       ↓
[9] Unified Risk Scoring (0–100 Weighted Score)
       ↓
[10] Explainable Evidence Attribution ("Why Flagged?")
       ↓
[11] Alert Generation & Category Assignment
       ↓
[12] Priority Review Queue Assignment
       ↓
[13] Investigation Dossier, Human Decision & Immutable Audit Record
```

---

## 7. Key Modules

- **Executive Dashboard:** High-level summary metrics, risk distribution, category/state breakdowns, and dynamic role perspectives.
- **Projects Database:** Full search, multi-column sorting, and filtering by parliament type (Lok Sabha / Rajya Sabha), state, district, and risk level.
- **Investigation Dossier:** Single-case forensic view featuring financial lifecycle flow, 5 stage-variance delta cards, physical-financial consistency gauge, and point attribution math.
- **Priority Review Queue:** Filterable review inbox allowing reviewers to assign cases, record examination findings, and log official actions.
- **Early Warning Center:** Alert categorization covering cost anomalies, schedule slippage, duplicates, documentation gaps, and high physical-financial divergence.
- **Geographic Intelligence:** Interactive GIS centroid map clustering parliamentary portfolios with color-coded risk markers.
- **Compliance Monitoring:** Rule-based compliance audits tracking guideline clauses (e.g., GFR Rule 238, MPLADS Guideline 2023 Sec 4.2).
- **Asset & Evidence Hub:** Tracks physical infrastructure assets, geo-coordinates, verification stages, and photographic evidence.
- **Data Ingestion & Mapping:** User upload interface for CSV, JSON, and Excel datasets with real-time validation preview.

---

## 8. Data Ingestion and Data Quality

The ingestion pipeline handles heterogeneous data formats commonly exported by state and district portals:
- **Format Support:** CSV (`.csv`), JSON (`.json`), and Excel (`.xlsx`, `.xls`).
- **Fuzzy Header Detection:** Recognizes aliases for project name, state, district, constituency, category, budget, expenditure, progress, and coordinates.
- **16-Point Validation Checks:**
  1. Mandatory Project Identifier
  2. Non-Empty Project / Constituency Title
  3. Valid Indian State / UT Classification
  4. Non-Negative Budget / Sanction Amount
  5. Cumulative Expenditure Sanity (`expenditure <= sanctioned * 1.5`)
  6. Progress Percentage Bounds (`0 <= progress <= 100`)
  7. Timeline Sequence (`completion_date >= start_date`)
  8. Coordinate Latitude Bounds (`6.0 <= lat <= 38.0`)
  9. Coordinate Longitude Bounds (`68.0 <= lng <= 98.0`)
  10. Category Standardization
  11. Non-Negative Allocation
  12. Non-Negative Released Amount
  13. Duplicate Identifier Detection
  14. Realistic Project Duration (`<= 10 years`)
  15. Status-Progress Consistency (e.g., Completed implies 100%)
  16. Minimum Textual Granularity

---

## 9. Data Sources and Provenance

Nigrani AI maintains transparent metadata for all loaded records:

| Record Attribute | Official Dataset Baseline |
| :--- | :--- |
| **Source Authority** | Ministry of Statistics and Programme Implementation (MoSPI) / eSAKSHI Portal |
| **Reference Publication** | 18th Lok Sabha & Rajya Sabha Consolidated Performance Bulletin |
| **Granularity** | Parliamentary Constituency Portfolio Level |
| **Total Monitored Units** | 774 Portfolios (543 Lok Sabha + 231 Rajya Sabha) |
| **Default Record Tier** | `OFFICIAL_BENCHMARK` |
| **Data Completeness Score** | 100% on core macro-indicators |

---

## 10. Official vs Derived vs Demo/Synthetic Data

To maintain strict truthfulness, the platform categorizes every displayed record:
- **OFFICIAL SOURCE DATA:** Baseline parliamentary constituency allocation, release, and expenditure figures sourced directly from official MoSPI eSAKSHI publications.
- **DERIVED METRICS:** Calculated indicators computed deterministically by the platform (e.g., utilization percentage, divergence gaps, IQR thresholds, risk scores).
- **DEMO DATA:** Pre-bundled portfolio records configured to allow immediate evaluation of all platform capabilities without mandatory cloud connectivity.
- **SYNTHETIC TEST DATA:** Isolated sandbox test records (e.g., sub-voucher simulation `VCH-SIM-9921`) clearly marked and strictly segregated from official datasets to test transaction-splitting detection algorithms.

---

## 11. Data-Dependent Capabilities

The platform transparently discloses data limitations where external data is not published in standard macro reports:

| Capability | Current Status | Operating Behavior |
| :--- | :--- | :--- |
| **Micro-Level Voucher Auditing** | `DATA-DEPENDENT` | Displays official notice: *"Awaiting payment-level source data"*. Macro-expenditure is evaluated; sub-voucher analysis is enabled via the opt-in simulation sandbox. |
| **Remote-Sensing Satellite Verification** | `DATA-DEPENDENT` | Geographic coordinate validation within sovereign bounds is active. High-resolution optical change detection is noted as an optional external GIS API integration. |
| **Contractor GSTIN Cross-Verification** | `DATA-DEPENDENT` | Implementing agency names are recorded. Direct tax portal queries require external commercial tax department API linkage. |

---

## 12. Technology Stack

- **Frontend:**
  - React 19, TypeScript 5.7+
  - Vite 8.2+
  - Tailwind CSS 4+
  - Lucide React Icons
- **Backend:**
  - FastAPI 0.115+
  - Python 3.11+ / 3.13+
  - SQLAlchemy 2.0+ (Async)
  - aiosqlite (SQLite) / asyncpg (PostgreSQL)
  - Pydantic v2
  - scikit-learn & NumPy (TF-IDF & IQR mathematical analysis)
- **Deployment:**
  - GitHub Pages (Frontend static hosting)
  - Render (Cloud API hosting)

---

## 13. Installation and Local Setup

### Prerequisites
- Node.js (v18 or later)
- Python (v3.11 or later)
- Git

### Clone the Repository
```bash
git clone https://github.com/Pramendra0001/Nigrani-AI.git
cd Nigrani-AI
```

### Backend Setup
```bash
cd backend
python -m venv ../venv
# On Windows:
..\venv\Scripts\activate
# On Linux/macOS:
source ../venv/bin/activate

pip install -r requirements.txt
```

### Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 14. Environment Configuration

### Backend (`backend/.env`)
```env
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
DATABASE_URL=sqlite+aiosqlite:///./nigrani.db
DEMO_MODE=true
APP_CURRENT_YEAR=2026
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 15. Running the Application

### 1-Click Startup (Windows)
Double-click `start.bat` in the repository root to launch both the backend API and frontend dev server simultaneously.

### Manual Startup
**Terminal 1 — Backend:**
```bash
cd backend
..\venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 16. Testing

### Automated Backend Tests
Run the comprehensive pytest suite from the `backend/` directory:
```bash
cd backend
..\venv\Scripts\python.exe -m pytest tests
```
*Current test suite: 14 tests across API endpoints, analytical engines, and parliament type filters with 100% pass rate.*

### Frontend Production Build & Typecheck
```bash
cd frontend
npm run build
```
*Builds client bundles with zero TypeScript errors.*

---

## 17. Deployment

- **Frontend (GitHub Pages):** Built via Vite into `frontend/dist` and served via GitHub Pages.
- **Backend (Render):** Deployed as a web service running FastAPI via Uvicorn.
- **Client Fallback Resiliency:** If the remote backend is offline or starting from cold idle, the frontend automatically falls back to an embedded client intelligence engine containing all 774 official parliamentary records.

---

## 18. Security and Data Handling

- **Direct-Access Architecture:** Intentionally operates without user authentication barriers for transparent public and institutional auditing demonstrations.
- **Input Sanitization & Bounds Checking:** All file imports and query parameters undergo strict Pydantic and regex validation.
- **CORS Protection:** Configurable origin whitelisting restricting cross-origin API access.
- **Zero Hardcoded Secrets:** Cryptographic tokens are derived dynamically from environment variables or secure entropy.

---

## 19. Limitations

- Official public datasets provide macro constituency-level cumulative expenditure rather than individual contractor line-item vouchers.
- Geospatial mapping visualizes constituency administrative centroids where exact asset-level GPS coordinates are not published in public bulletins.
- AI summaries and anomaly risk scores are decision-support indicators and do not substitute for on-site statutory audits.

---

## 20. Future Integration Possibilities

- **PFMS Integration:** Direct linkage with Public Financial Management System APIs for micro-voucher reconciliation.
- **ISRO Bhuvan / Sentinel Satellite Feed:** Automated optical and radar change detection over reported asset coordinates.
- **State Treasury Inward Scroll Sync:** Direct bank scroll reconciliation for automated payment velocity monitoring.
- **Mobile Geo-Tagging App:** Field surveyor app for real-time photographic upload with cryptographic EXIF geo-stamps.
