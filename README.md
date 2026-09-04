# Nigrani AI — AI-Powered MPLADS Intelligence, Anomaly Detection & Decision Support Platform

**Primary Positioning:** AI-Powered MPLADS Intelligence, Anomaly Detection & Decision Support Platform  
**Supporting Line:** AI-Powered Public Project Intelligence  
**Platform Track:** National Public Infrastructure & MPLADS Vigilance Framework  
**Organization:** Ministry of Statistics and Programme Implementation (MoSPI)  
**Department:** Data Informatics & Innovation Division (DIID)  
**Category:** Software | **Theme:** Smart Automation  
**Stack:** FastAPI, Python 3.11+, SQLite / PostgreSQL, React 19, TypeScript, Vite, Tailwind CSS  

> **Official Decision-Support Disclaimer:**  
> Nigrani AI identifies data anomalies and risk indicators to support human review. Automated analysis does not establish corruption, misconduct, or legal liability. Nigrani AI serves strictly as an evidence-based decision-support platform for vigilance officers, State Nodal Authorities, and district administrators.

---

## 🎯 Executive Summary & Core Value Proposition

**Nigrani AI** transforms 543 official 18th Lok Sabha Parliamentary Constituency MPLADS project portfolios into an **explainable, prioritized review queue**.

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
| **Live Frontend Web Application** | **[https://pramendra0001.github.io/Nigrani-AI/](https://pramendra0001.github.io/Nigrani-AI/)** | Hosted React dashboard, 543 18th Lok Sabha MPLADS project registry & forensic workstation |
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
│   PostgreSQL (Render Cloud) or SQLite (Local Dev)      │
│   543 Official 18th Lok Sabha Constituencies (eSAKSHI) │
└────────────────────────────────────────────────────────┘
```

> **Client Fallback Guarantee:** If the cloud backend is cold-starting from idle, the frontend automatically utilizes its embedded client intelligence engine with all 543 official 18th Lok Sabha benchmark projects across all 36 States & Union Territories. The web app will never crash with connection errors.

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

### 4. Official MPLADS National Dataset Integration
Nigrani AI is pre-loaded with the official 18th Lok Sabha dataset sourced directly from the Ministry of Statistics and Programme Implementation eSAKSHI portal (`mplads.gov.in`):
- **Scale:** 543 Members of Parliament (All 543 Lok Sabha Parliamentary Constituencies) across all 36 States and Union Territories.
- **Financial Scope:** ₹8,333.67 Crore allocated limit, ₹2,771.91 Crore cumulative expenditure (33.26% utilization), 106,458 recommended works (₹5,705.28 Cr value), 79,082 sanctioned works, and 34,275 completed works (32.2% physical completion rate).
- **Forensic Pipeline:** Automatically flags severe completion backlogs, zero-completion anomalies despite large expenditures, unspent balance accumulation, and stalled constituency works into an actionable vigilance queue.

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
│   │   │   ├── mplads_loader.py   # Official MPLADS eSAKSHI ingestion engine (543 MPs)
│   │   │   ├── mplads_data.json   # Bundled 543 18th Lok Sabha project records
│   │   │   └── demo_data.py       # Benchmark generator & legacy compatibility layer
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
│   │   ├── demo_projects.json     # 543 official 18th Lok Sabha benchmark projects dataset
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

---

## 🔐 Enterprise Authentication & Real OTP Delivery Architecture

Nigrani AI includes a multi-factor authentication and identity management system designed for public sector compliance:

```
Officer Registration / Sign In
             │
      Password Check (PBKDF2-HMAC-SHA256, 600k iters)
             │
      ┌──────┴───────────────────────────────────────┐
      ▼                                              ▼
Real SMS OTP (MSG91 / Twilio)            Real Email OTP (HTTPS REST API / Resend)
  - E.164 phone normalization              - Outbound HTTPS Port 443 (Render-compatible)
  - 6-digit cryptographic token            - Free 3,000 emails/month via Resend
  - Provider failure detection             - 10-minute validity & 60s cooldown
      │                                              │
      └──────────────────────┬───────────────────────┘
                             ▼
               Dual-Channel Account Verification
                             ▼
         HMAC-SHA256 Signed Session Token Issued
                             ▼
                 Officer Dossier Activated
```

### 1. Production vs Development Mode

| Behavior | `ENVIRONMENT=production` (Default on Render) | `ENVIRONMENT=development` (Local Dev) |
| :--- | :--- | :--- |
| **`ALLOW_SANDBOX_OTP`** | `false` (Mandatory) | `true` (Optional for offline dev) |
| **Email Protocol** | **HTTPS REST API** (Port 443, Render-compatible) | HTTPS or local mock sandbox |
| **OTP Exposure** | **NEVER** returned in JSON, UI, or logs | Only in sandbox provider when unconfigured |
| **Gateway Failures** | Rejects request with clear provider error | Emits safe dev log |
| **Client UI** | Shows: *"Verification code sent successfully."* | Shows: *"Verification code sent successfully."* |

---

## 🛠️ Production Setup Instructions (Render Cloud)

### 1. Exact Environment Variables to Configure on Render

In your **Render Dashboard** → Select **Nigrani-AI** Web Service → **Environment**:

```env
# Server & Security Profile
ENVIRONMENT=production
ALLOW_SANDBOX_OTP=false
SECRET_KEY=<generate-with: openssl rand -hex 32>
APP_CURRENT_YEAR=2026
APP_CURRENT_DATE=2026-09-04

# Database Connection (Render PostgreSQL)
DATABASE_URL=postgresql+asyncpg://<username>:<password>@<render-db-host>:5432/<database>

# CORS Origins
CORS_ORIGINS=https://pramendra0001.github.io,http://localhost:5173,http://127.0.0.1:5173

# SMS OTP Provider (MSG91 - India Primary)
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=<your-msg91-auth-key>
MSG91_TEMPLATE_ID=<your-msg91-otp-template-id>
MSG91_SENDER_ID=<your-approved-sender-id>

# Transactional Email OTP Gateway (HTTPS REST API - Recommended for Render)
# Note: Render blocks direct SMTP outbound ports (25, 465, 587) resulting in [Errno 101].
# Use Resend API over outbound HTTPS port 443 for 100% reliable delivery.
EMAIL_PROVIDER=resend
EMAIL_API_KEY=<your-resend-api-key>
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Nigrani AI Vigilance

# Optional SMTP Fallback (Only for local dev or servers where SMTP ports are open)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=<your-email@gmail.com>
# SMTP_PASSWORD=<your-app-password>

# Google OAuth 2.0
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### 2. Provider Account Setup Details

#### A. MSG91 SMS Gateway (Primary for India)
1. Sign up at [https://msg91.com](https://msg91.com).
2. Go to **OTP Service** and create an OTP Template.
3. Set Template Message: `Your Nigrani AI verification code is ##OTP##. Valid for 10 minutes.`
4. Copy the **Template ID** and **Authkey**.
5. Add `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID` to Render environment variables.

#### B. Resend HTTPS Email Gateway (Recommended for Render)
Render's network policy blocks direct outbound TCP connections to SMTP ports (25, 465, 587) with `[Errno 101] Network is unreachable`. Nigrani AI integrates directly with **Resend**'s HTTPS REST API over port 443:
1. Sign up at [https://resend.com](https://resend.com) (generous free tier: 3,000 emails/month, 100/day).
2. Navigate to **API Keys** → click **Create API Key** (Permissions: Sending access).
3. Copy the generated key (`re_...`).
4. In Render Dashboard, add:
   - `EMAIL_PROVIDER`: `resend`
   - `EMAIL_API_KEY`: `re_...`
   - `EMAIL_FROM`: `onboarding@resend.dev` (or your verified domain email)
   - `EMAIL_FROM_NAME`: `Nigrani AI Vigilance`
5. Verification emails are dispatched instantly via HTTPS with 6-digit OTPs and professional HTML templates.

#### C. Optional SMTP Fallback (Non-Render / Local Only)
If deploying on a VPS, AWS EC2, or local development where ports 587/465 are unblocked:
1. Set `EMAIL_PROVIDER=smtp`.
2. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL`.

#### D. Google OAuth 2.0
1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Web Client ID**.
2. Set **Authorized JavaScript origins**: `https://pramendra0001.github.io`
3. Set **Authorized redirect URIs**: `https://pramendra0001.github.io/Nigrani-AI/`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to Render.
5. Add `VITE_GOOGLE_CLIENT_ID` to GitHub Secrets or frontend build environment.

#### E. Render PostgreSQL Persistence
1. In Render Dashboard, click **New +** → **PostgreSQL**.
2. Set Database Name: `nigrani_db`.
3. Copy the **Internal Database URL** and set as `DATABASE_URL` in the Backend Service.
4. On startup, `init_db()` provisions tables safely with connection pooling (`pool_pre_ping=True`).

