# $ahim (سهم) — Smart Investing for Arabic-Speaking Beginners

> An AI-powered investment intelligence platform for beginner Arabic investors, covering MENA stocks. Built for SalamHack 2024.

## Features

- **Investment Readiness Score** — Composite 0–100 score with traffic-light band (🟢🟡🔴) — designed to be understood without a finance background
- **Arabic-First Interface** — Full Arabic & English support with RTL layout via next-intl
- **AI News Analysis** — GPT-4o-mini sentiment + Arabic summary from NewsAPI/GDELT
- **Risk Panel** — Annualised volatility, 95% VaR, Sharpe ratio, Beta (MENA benchmarks: TASI, EGX30, ADX)
- **ARIMA Forecast** — 30-day price forecast with 95% CI (grid-search over p/d/q by AIC)
- **Sector Comparison** — Peer analysis vs sector averages
- **Budget Allocator** — Score-weighted proportional allocation with whole-share rounding
- **Shariah Compliance** *(secondary)* — Musaffa API primary, AAOIFI fallback (sector pre-filter + ratio thresholds)

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS v3, shadcn/ui, Recharts, next-intl |
| Backend | Python 3.11, FastAPI 0.111+, uvicorn, pydantic-settings |
| Data | Twelve Data (primary), Alpha Vantage (fallback), NewsAPI + GDELT |
| AI | OpenAI GPT-4o-mini (Chat Completions) |
| Halal | Musaffa API → AAOIFI built-in fallback |
| Forecast | statsmodels ARIMA |
| Deployment | Netlify (frontend) + Render.com free (backend) |

## Local Development

Run both services simultaneously in two separate PowerShell terminals.

### Terminal 1 — Backend (FastAPI)

```powershell
cd backend

# First time only: create virtual environment and install deps
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
Copy-Item .env.example .env   # then open .env and fill in your API keys

# Every run:
.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --reload-dir app --port 8000
```

> Hot-reload is enabled — the server restarts automatically on file save.  
> Verify it's running: open `http://localhost:8000/api/health` in your browser.  
> Interactive API docs (Swagger UI): `http://localhost:8000/docs`

### Terminal 2 — Frontend (Next.js)

```powershell
cd frontend

# First time only:
npm install
Copy-Item .env.local.example .env.local
# Open .env.local and confirm: NEXT_PUBLIC_API_URL=http://localhost:8000

# Every run:
npm run dev
```

> App runs at `http://localhost:3000`.  
> Next.js hot-reloads on file save — no restart needed.

### Running Tests

```powershell
# Backend unit tests (from repo root)
cd backend
.venv\Scripts\Activate.ps1
pytest tests/unit/ -v --cov=app --cov-report=term-missing

# Watch mode (re-runs on file change)
pytest tests/unit/ -v -f
```

### Common Dev Tasks

| Task | Command |
|------|---------|
| Check backend logs | uvicorn stdout in Terminal 1 |
| Lint backend | `ruff check app/` |
| Format backend | `ruff format app/` |
| Type-check frontend | `npx tsc --noEmit` |
| Build frontend (prod check) | `npm run build` |
| Add a shadcn/ui component | `npx shadcn-ui@latest add <name>` |

---

## Quick Start

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
Copy-Item .env.example .env   # fill in API keys
python -m uvicorn app.main:app --reload
```

API available at `http://localhost:8000`. Health check: `GET /api/health`.

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

App at `http://localhost:3000`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness probe |
| GET | `/api/search?q=` | Stock search |
| GET | `/api/stock/{ticker}/score` | Investment readiness score |
| GET | `/api/stock/{ticker}/risk` | Risk metrics panel |
| GET | `/api/stock/{ticker}/halal` | Halal compliance verdict |
| GET | `/api/stock/{ticker}/news` | AI news analysis |
| GET | `/api/stock/{ticker}/forecast` | ARIMA 30-day forecast |
| GET | `/api/sectors/{ticker}` | Sector peer comparison |
| POST | `/api/allocate` | Budget allocation |

## Running Tests

```powershell
cd backend
pytest tests/unit/ -v --cov=app
```

## Deployment

- **Backend** → Render.com: configure `render.yaml`, set env vars in dashboard
- **Frontend** → Netlify: connect repo, set `NEXT_PUBLIC_API_URL` to your Render URL

## Disclaimers

> تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة

> التحقق النهائي من الحلية يقع على عاتق المستخدم

> هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة
