# Quickstart: sSsahim Development Setup

**For the 4-person team** | Branch: `001-arabic-investment-intelligence`

This guide gets every team member running the full stack locally in under 15
minutes. Complete the **Shared Prerequisites** first, then follow your
**Role-Specific Setup**.

---

## Shared Prerequisites

1. **Clone the repo** (if not already done):

   ```bash
   git clone https://github.com/<org>/SalamHack-sSsahim.git
   cd SalamHack-sSsahim
   git checkout 001-arabic-investment-intelligence
   ```

2. **Get your API keys** (team lead distributes via secure channel — never
   commit keys to Git):

   | Key | Where to get | Who needs it |
   |-----|-------------|-------------|
   | `TWELVE_DATA_API_KEY` | twelvedata.com → sign up free | Backend + AI/Integration |
   | `OPENAI_API_KEY` | platform.openai.com | AI/Integration |
   | `NEWS_API_KEY` | newsapi.org → free account | AI/Integration |
   | `halal_terminal_api_key` | musaffa.com → request access | Backend |
   | `NEXT_PUBLIC_API_URL` | Set to `http://localhost:8000` for local dev | Frontend |

3. **Confirm `.gitignore`** includes `.env`, `.env.local`, `__pycache__/`,
   `.next/`, `node_modules/`. Never commit real keys.

---

## Backend Setup (Mathematician + Backend Developer)

### Requirements

- Python 3.11+
- pip or [uv](https://github.com/astral-sh/uv) (recommended — faster)

### Steps

```bash
cd backend

# 1. Create virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt
# Or with uv:
uv pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and fill in your keys:
#   TWELVE_DATA_API_KEY=<your key>
#   OPENAI_API_KEY=<your key>
#   NEWS_API_KEY=<your key>
#   halal_terminal_api_key=<your key>  # leave empty if not yet available

# 4. Start the dev server
uvicorn app.main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### Verify

```bash
curl http://localhost:8000/api/health
# Expected: {"status": "ok", "version": "0.1.0"}

curl "http://localhost:8000/api/stock/2222.SR"
# Expected: Full JSON analysis object (may take 5–8s)
```

### Run Backend Tests

```bash
pytest tests/ -v
```

---

## Frontend Setup (Frontend Developer + AI/Integration)

### Requirements

- Node.js 20+ (use `nvm` or download from nodejs.org)
- npm (bundled with Node.js)

### Steps

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Start the dev server
npm run dev
```

The frontend is now at `http://localhost:3000`.

### Verify

Open `http://localhost:3000/ar` — you should see the Arabic landing page
with the search bar. Search for `2222.SR` or `AAPL` and confirm the analysis
page loads with the traffic-light score.

### Run Frontend Tests

```bash
npm test
```

---

## Role-Specific Workflows

### Mathematician

Focus: `backend/app/services/score_engine.py` and `backend/app/services/arima_service.py`

```bash
# Run only math unit tests while iterating
pytest tests/unit/test_score_engine.py -v
pytest tests/unit/test_arima_service.py -v
```

Key files:
- [backend/app/services/score_engine.py](../../backend/app/services/score_engine.py) — Weighted formula implementation
- [backend/app/services/arima_service.py](../../backend/app/services/arima_service.py) — ARIMA fit + 30-day projection
- [specs/001-arabic-investment-intelligence/research.md](research.md) §5, §8 — Normalisation + ARIMA decisions

Normalisation reference (from research.md):

| Component | Formula |
|-----------|---------|
| Volatility | `max(0, 100 - (σ / 0.60) × 100)` |
| VaR | `max(0, 100 - (VaR / 0.05) × 100)` |
| Sharpe | `min(100, max(0, (Sharpe + 1) / 3 × 100))` |
| Beta | `max(0, 100 - abs(β - 1) × 50)` |
| Sentiment | positive→80, neutral→50, negative→20 |

Final: `S = 0.25·V + 0.25·VaR + 0.20·Sharpe + 0.15·Beta + 0.15·Sentiment`

---

### Backend Developer

Focus: `backend/app/services/market_data.py`, `backend/app/services/halal_screener.py`,
`backend/app/api/`

```bash
# Test the full stock endpoint
curl "http://localhost:8000/api/stock/2222.SR" | python -m json.tool
pytest tests/integration/test_stock_api.py -v
```

Key files:
- [backend/app/services/market_data.py](../../backend/app/services/market_data.py) — Twelve Data adapter
- [backend/app/services/halal_screener.py](../../backend/app/services/halal_screener.py) — Musaffa + AAOIFI fallback
- [backend/app/api/stock.py](../../backend/app/api/stock.py) — FastAPI route handlers
- [specs/001-arabic-investment-intelligence/contracts/stock-api.md](contracts/stock-api.md) — Full endpoint spec

Benchmark index routing (from research.md §2):

```python
def get_benchmark(ticker: str) -> str:
    if ticker.endswith(".SR"): return "^TASI"
    if ticker.endswith(".CA"): return "^EGX30"
    if ticker.endswith(".AE"): return "^ADX"
    return "^GSPC"
```

---

### Frontend Developer

Focus: `frontend/src/components/`, `frontend/src/app/[locale]/`

Key design requirements:
- Arabic (`ar`) is the default locale; English (`en`) is the secondary.
- All pages must render correctly in RTL (Arabic) and LTR (English).
- Tailwind RTL: use `rtl:` variants for direction-specific styles.
- Font: Cairo (Arabic) + Inter (Latin) loaded via `next/font/google`.

Key components to build:

| Component | Props | Notes |
|-----------|-------|-------|
| `TrafficLightBadge` | `score`, `band` | Green/Yellow/Red badge with score number |
| `RiskPanel` | `score: InvestmentReadinessScore` | Shows 5 component scores + raw values |
| `HalalPanel` | `halal: HalalVerdictData` | Must render `disclaimer` visibly at all times |
| `NewsCard` | `card: NewsCard` | 3-field layout; shows fallback message when `fallbackMode` |
| `ARIMAChart` | `arima: ARIMAProjection` | Recharts line + CI band; disclaimer below chart |
| `DataFreshnessLabel` | `label: string` | Small muted text showing "آخر تحديث: نهاية جلسة أمس" |

For the low-confidence badge:

```tsx
{score.lowConfidence && (
  <span className="badge-warning">ثقة منخفضة — بيانات محدودة</span>
)}
```

---

### AI/Integration Engineer

Focus: `backend/app/services/news_agent.py`, OpenAI structured output setup

Key files:
- [backend/app/services/news_agent.py](../../backend/app/services/news_agent.py) — NewsAPI fetch + OpenAI summarisation

OpenAI structured output schema (from research.md §4):

```python
SYSTEM_PROMPT = """
أنت محلل مالي متخصص. لكل خبر، قدّم ملخصاً منظماً باللغة العربية فقط.
أجب دائماً بتنسيق JSON الآتي:
{
  "what_happened": "ما الذي حدث؟ (جملة واحدة)",
  "why_it_matters": "لماذا يهم المستثمر؟ (جملة واحدة)",
  "who_is_affected": "مَن المتأثرون؟ (جملة واحدة)",
  "time_horizon": "short أو long",
  "sentiment": "positive أو neutral أو negative"
}
"""
```

Call pattern (use `response_format={"type": "json_object"}` with `gpt-4o-mini`):

```python
import asyncio
import httpx
from openai import AsyncOpenAI

async def summarise_articles(articles: list[dict], ticker: str) -> list[dict]:
    client = AsyncOpenAI()
    tasks = [_summarise_one(client, a, ticker) for a in articles[:5]]
    return await asyncio.gather(*tasks, return_exceptions=True)
```

Timeout: wrap each OpenAI call in `asyncio.wait_for(..., timeout=10.0)`.
On timeout, return `{"fallback_mode": True}` and log the event.

---

## Environment Variables Reference

### backend/.env.example

```bash
TWELVE_DATA_API_KEY=your_twelve_data_key_here
OPENAI_API_KEY=your_openai_key_here
NEWS_API_KEY=your_newsapi_key_here
halal_terminal_api_key=your_halal_terminal_key_here  # optional; leave empty to use built-in fallback
ALLOWED_ORIGINS=http://localhost:3000,https://<your-app>.netlify.app
LOG_LEVEL=INFO
```

### frontend/.env.local.example

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Running Both Services Together

Open two terminal windows:

**Terminal 1 — Backend**:
```bash
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend**:
```bash
cd frontend && npm run dev
```

Then open `http://localhost:3000/ar`.

---

## Deployment Checklist (for Demo Day)

- [ ] Backend deployed to Render.com (free container, `render.yaml` in repo root)
- [ ] All backend env vars set in Render dashboard (never in code)
- [ ] Frontend deployed to Netlify (`NEXT_PUBLIC_API_URL` set to Render service URL)
- [ ] CORS `ALLOWED_ORIGINS` updated with Netlify app URL
- [ ] Smoke test: search `2222.SR` and `AAPL` on the deployed URL
- [ ] `/api/health` returns 200 (to prevent cold-start during demo)
- [ ] Confirm Arabic RTL renders correctly on mobile (≥360px) and desktop (≥1280px)
