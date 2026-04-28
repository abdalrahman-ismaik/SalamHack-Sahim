# Quickstart: Halal Investor Tools Suite (003)

**For**: Developer implementing this feature  
**Date**: 2026-04-28

---

## Overview

This feature adds 4 new Islamic investor tools: Risk Tolerance Wizard, Dividend Purification Calculator, Zakat Calculator, and Halal Compliance Change Alerts. Two require new frontend routes; one requires a new backend endpoint; one uses existing endpoints with new Firestore storage.

---

## Prerequisites

- Backend virtual environment active: `& backend\.venv\Scripts\Activate.ps1`
- Frontend dev server: `cd frontend && npm run dev`
- Firebase project configured with `NEXT_PUBLIC_FIREBASE_*` env vars in `frontend/.env.local`
- Twelve Data API key set: `TWELVE_DATA_API_KEY` in `backend/.env`

---

## Step 1 — Backend: Add Gold Price Endpoint

**Files to create/modify:**

1. Add `async def get_gold_price()` to `backend/app/services/market_data.py`
   - Call Twelve Data `/quote?symbol=XAUUSD`
   - Convert troy oz price → per gram (÷ 31.1035)
   - Return `dict` with `price_per_gram_usd`, computed AED/SAR equivalents, `source="TwelveData"`, `date`
   - On any exception: return static fallback `{ price_per_gram_usd: 96.50, ..., source="static" }`

2. Create `backend/app/api/tools.py`:
   ```python
   from fastapi import APIRouter
   from app.services.market_data import get_gold_price
   from app.cache import cache_or_fetch

   router = APIRouter()

   @router.get("/gold-price")
   async def gold_price_endpoint():
       return await cache_or_fetch("gold_price", get_gold_price, ttl=3600)
   ```

3. Register in `backend/app/main.py`:
   ```python
   from app.api.tools import router as tools_router
   app.include_router(tools_router, prefix="/api/tools")
   ```

4. Add Pydantic model to `backend/app/models/stock.py` (or new `tools.py`):
   ```python
   class GoldPriceResponse(BaseModel):
       price_per_gram_usd: float
       price_per_gram_aed: float
       price_per_gram_sar: float
       source: Literal["TwelveData", "static"]
       date: str
   ```

**Verify**: `curl http://localhost:8000/api/tools/gold-price` returns JSON with `price_per_gram_usd`.

---

## Step 2 — Frontend: Enable Firestore

**File**: `frontend/src/lib/firebase.ts`

Add Firestore initialization (append to existing file):
```typescript
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
```

---

## Step 3 — Frontend: Risk Tolerance Wizard

**New files:**
- `frontend/src/app/[locale]/tools/risk-wizard/page.tsx` — page wrapper with `useTranslations`, loads `RiskWizard` component
- `frontend/src/components/RiskWizard.tsx` — multi-step wizard (see component-api.md)
- `frontend/src/components/ui/WizardStep.tsx` — reusable step primitive (see component-api.md)

**i18n keys to add** (in `ar.json` and `en.json` under `"riskWizard"`):
```json
{
  "riskWizard": {
    "title": "اعرف مستوى مخاطرتك",
    "progress": "السؤال {current} من {total}",
    "next": "التالي",
    "previous": "السابق",
    "calculate": "احسب ملفي",
    "result": { "conservative": "محافظ", "moderate": "متوازن", "aggressive": "جريء" },
    "disclaimer": "هذا تقييم إرشادي، وليس نصيحة استثمارية مرخصة",
    "howCalculated": "كيف يُحسب هذا؟",
    "questions": { ... }
  }
}
```

**Route verification**: Visit `http://localhost:3000/ar/tools/risk-wizard`

---

## Step 4 — Frontend: Purification Calculator

**New file**: `frontend/src/components/PurificationCalculator.tsx`

**Modification**: Add `<PurificationCalculator nonHalalPct={verdict.interest_income_ratio ? verdict.interest_income_ratio * 100 : null} />` at the bottom of `frontend/src/components/HalalPanel.tsx`

**Condition**: Render only when `verdict.status === 'PurificationRequired'`

---

## Step 5 — Frontend: Zakat Calculator

**New files:**
- `frontend/src/app/[locale]/tools/zakat/page.tsx` — fetches gold price via `GET /api/tools/gold-price`, passes to component
- `frontend/src/components/ZakatCalculator.tsx` — calculator with nisab display (see component-api.md)

**i18n keys** (under `"zakatCalculator"`):
```json
{
  "zakatCalculator": {
    "title": "حاسبة الزكاة",
    "portfolioValue": "قيمة المحفظة",
    "liabilities": "الالتزامات المتعلقة بالاستثمار",
    "calculate": "احسب الزكاة",
    "zakatDue": "الزكاة المستحقة",
    "belowNisab": "قيمتك أقل من النصاب، لا تجب عليك الزكاة",
    "staticFallback": "قيمة ثابتة — تحديث مرجو",
    "disclaimer": "استشر عالماً للتحقق من زكاتك الخاصة"
  }
}
```

---

## Step 6 — Frontend: Compliance Alerts

**New files:**
- `frontend/src/hooks/useComplianceAlerts.ts` — reads Firestore prefs, calls `/api/stock/{ticker}/halal` for each enabled ticker, diffs status, returns notifications array
- `frontend/src/components/ComplianceAlertToggle.tsx` — Pro-only toggle (see component-api.md)
- `frontend/src/components/ComplianceNotificationBanner.tsx` — notification list at top of Dashboard

**Modification**: Import and render both components in `frontend/src/app/[locale]/dashboard/page.tsx` (or Dashboard component file).

---

## Step 7 — i18n & Accessibility Pass

- Verify all new keys exist in both `ar.json` and `en.json`
- Run WCAG contrast check on new color classes
- Test Tab / Enter / Escape navigation on wizard and calculators
- Test RTL layout at 360px mobile viewport

---

## Testing Checklist

- [ ] `GET /api/tools/gold-price` returns 200 with all 3 currency fields
- [ ] `GET /api/tools/gold-price` returns fallback when Twelve Data key is absent or wrong
- [ ] Risk Wizard: completes 6 steps → correct label (score 0–40 = conservative, 41–70 = moderate, 71–100 = aggressive)
- [ ] Risk Wizard: guest accessible without sign-in
- [ ] Purification Calculator: visible on PurificationRequired stocks, hidden on Halal stocks
- [ ] Purification Calculator: real-time update, correct formula
- [ ] Zakat Calculator: above-nisab → zakat amount; below-nisab → "أقل من النصاب"
- [ ] Zakat Calculator: static fallback label visible when `source === "static"`
- [ ] Compliance Alerts: Pro user can toggle; Free user sees upgrade modal
- [ ] Compliance Alerts: notification banner appears when status changes on Dashboard refresh
- [ ] All tools: RTL Arabic layout correct on mobile (360px)
- [ ] All tools: keyboard-navigable (Tab / Enter / Escape)
