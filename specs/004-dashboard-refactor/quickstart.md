# Quickstart: Dashboard Refactor

## Prerequisites
- Node.js 18+, Python 3.11+
- Firebase project with Firestore enabled
- All environment variables set (see .env.example)
- Backend running (FastAPI, Render.com or local)
- Frontend running (Next.js, Netlify or local)

## Steps

1. **Install dependencies**
   - `cd backend && pip install -r requirements.txt`
   - `cd frontend && npm install`

2. **Start backend**
   - `cd backend && uvicorn app.main:app --reload`

3. **Start frontend**
   - `cd frontend && npm run dev`

4. **Sign in**
   - Go to `http://localhost:3000/ar/dashboard` or `/en/dashboard`
   - Sign in with Firebase Auth

5. **Populate data**
   - Add tickers to your watchlist
   - Complete the Risk Wizard
   - Calculate Zakat (optional)

6. **Explore dashboard**
   - All 6 zones should render with real or fallback data
   - Try switching locale (ar/en)
   - Test tier gating by toggling user tier in JWT (Pro/Free)

7. **Run tests**
   - Frontend: `cd frontend && npm run test`
   - Backend: `cd backend && pytest`

## Notes
- All dashboard charts use Chart.js via react-chartjs-2
- All navigation uses next/link with locale prefix
- All user-facing text must be present in both ar.json and en.json
- For design reference, see `dashboardDesign/` images

---

For further details, see the feature spec and data model.
