# sSsahim (سهم) — Arabic Investment Intelligence

> An AI-powered investment readiness platform for MENA stocks, built for SalamHack 2024.

## Features

- **Investment Readiness Score** — Composite 0–100 score with traffic-light band (🟢🟡🔴)
- **Risk Panel** — Annualised volatility, 95% VaR, Sharpe ratio, Beta (MENA benchmarks: TASI, EGX30, ADX)
- **Halal Screening** — Musaffa API primary, AAOIFI fallback (sector pre-filter + ratio thresholds)
- **AI News Analysis** — GPT-4o-mini sentiment + Arabic summary from NewsAPI/GDELT
- **ARIMA Forecast** — 30-day price forecast with 95% CI (grid-search over p/d/q by AIC)
- **Sector Comparison** — Peer analysis vs sector averages
- **Budget Allocator** — Score-weighted proportional allocation with whole-share rounding

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

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
cp .env.example .env      # fill in API keys
uvicorn app.main:app --reload
```

API available at `http://localhost:8000`. Health check: `GET /api/health`.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
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

```bash
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
