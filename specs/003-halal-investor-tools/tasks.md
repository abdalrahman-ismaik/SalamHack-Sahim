# Tasks: Halal Investor Tools Suite (003)

**Input**: Design documents from `specs/003-halal-investor-tools/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths are included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared type definitions and Firebase Firestore initialization — required before any user story touches persistence or new data shapes.

- [X] T001 Add `RiskProfile`, `GoldPriceData`, `ZakatResult`, `ComplianceAlertPreference`, and `ComplianceChangeNotification` TypeScript types to `frontend/src/lib/types.ts`
- [X] T002 [P] Add `getFirestore(app)` import and `export const db` to `frontend/src/lib/firebase.ts`
- [X] T028 Add `/[a-z]{2}/tools/risk-wizard` to `PUBLIC_PATTERNS` in `frontend/src/middleware.ts` so unauthenticated users can access the wizard page without a redirect (FR-R07)
- [X] T029 [P] Add `/[a-z]{2}/tools/zakat` to `PUBLIC_PATTERNS` in `frontend/src/middleware.ts` so the page loads for guests and renders its own soft sign-in gate (FR-Z06)

**Checkpoint**: Shared types defined; Firestore client exported; guest-accessible tool routes registered in middleware — user story implementation can begin.

---

## Phase 2: Foundational (Backend Gold Price Service)

**Purpose**: The `GET /api/tools/gold-price` endpoint is a blocking prerequisite for US3 (Zakat Calculator). US1 and US2 can proceed in parallel with this phase.

**⚠️ NOTE**: This phase only blocks US3. US1 and US2 can start immediately after Phase 1.

- [X] T003 Create `GoldPriceResponse` Pydantic model (`price_per_gram_usd`, `price_per_gram_aed`, `price_per_gram_sar`, `source: Literal["TwelveData","static"]`, `date: str`) in `backend/app/models/tools.py`
- [X] T004 [P] Implement `async def get_gold_price() -> dict` in `backend/app/services/gold_service.py`: call Twelve Data `/quote?symbol=XAUUSD` via httpx, divide troy oz price by 31.1035, apply fixed AED (×3.6725) and SAR (×3.75) pegs; catch all exceptions and return static fallback `{price_per_gram_usd: 96.50, ..., source: "static"}`
- [X] T005 Create `GET /gold-price` endpoint in `backend/app/api/tools.py` using `cache_or_fetch("gold_price", get_gold_price, ttl=3600)` (depends on T003, T004)
- [X] T006 Register tools router in `backend/app/main.py` with `app.include_router(tools_router, prefix="/api/tools")` (depends on T005)

**Checkpoint**: `GET /api/tools/gold-price` returns 200 with all 3 currency fields; static fallback active when Twelve Data is unavailable.

---

## Phase 3: User Story 1 — Risk Tolerance Wizard (Priority: P1) 🎯 MVP

**Goal**: A guest user completes a 6-question Arabic-first questionnaire and receives a Conservative / Moderate / Aggressive risk profile — no sign-in required.

**Independent Test**: Open `http://localhost:3000/ar/tools/risk-wizard` without any session cookie. Complete all 6 questions. Verify a colored label badge appears with `محافظ`, `متوازن`, or `جريء` and the regulatory disclaimer text.

- [X] T007 [P] [US1] Create `WizardStep` primitive in `frontend/src/components/ui/WizardStep.tsx`: props = `stepNumber`, `totalSteps`, `questionKey`, `options[]`, `selectedIndex`, `onSelect`, `onNext`, `onPrev`, `isFirst`, `isLast`; renders progress bar, radio-style option buttons (touch target ≥ 44px), prev/next buttons; keyboard: Arrow keys select, Enter submits step, Escape goes back
- [X] T008 [P] [US1] Add `riskWizard` i18n namespace keys to `frontend/src/messages/en.json` and `frontend/src/messages/ar.json`: `title`, `progress`, `next`, `previous`, `calculate`, `result.conservative`, `result.moderate`, `result.aggressive`, `disclaimer`, `howCalculated`, `questions.q1`–`q6` (question text), `questions.q1Options`–`q6Options` (4 answer options each)
- [X] T009 [US1] Create `RiskWizard` component in `frontend/src/components/RiskWizard.tsx`: orchestrates 6 `WizardStep` instances; maintains `answers` state; on final step computes weighted score (`horizon:25%, drawdown:20%, age:15%, knowledge:15%, income:15%, patience:10%`); maps score to label (`0–40→conservative`, `41–70→moderate`, `71–100→aggressive`); transitions to result screen showing label badge, 3 Arabic recommendations, expandable "كيف يُحسب هذا؟" methodology, and disclaimer (depends on T001, T007, T008)
- [X] T010 [US1] Create `frontend/src/app/[locale]/tools/risk-wizard/page.tsx`: load `initialProfile` from `localStorage` key `ahim_risk_profile` for guests or from Firestore `users/{uid}/risk_profile` for authenticated users; on `onComplete` write profile to same storage; render `<RiskWizard>`; no `middleware.ts` auth gate required (guest-accessible) (depends on T009, T002)

**Checkpoint**: US1 fully functional. Guest user reaches `/ar/tools/risk-wizard`, completes wizard, receives correct label. Profile saved to localStorage. ✅

---

## Phase 4: User Story 2 — Dividend Purification Calculator (Priority: P1)

**Goal**: A user on any `PurificationRequired` stock's Halal Panel can enter their dividend amount and immediately see exactly how much to donate.

**Independent Test**: Navigate to a `PurificationRequired` stock's halal panel. Verify the "حاسبة التطهير" card appears. Enter `1000` in the dividend field and select SAR. Verify the displayed purification amount equals `interest_income_ratio × 1000` (i.e., `ratio × dividend_amount` — do NOT multiply by 100 again; the ratio is already a decimal). Navigate to a `Halal`-status stock and verify the card is hidden.

- [X] T011 [P] [US2] Add `purification` i18n namespace keys to `frontend/src/messages/en.json` and `frontend/src/messages/ar.json`: `title` ("حاسبة التطهير"), `dividendLabel`, `currencyLabel`, `resultLabel`, `noCleanup` ("لا يلزم تطهير لهذا السهم"), `formulaTitle` ("كيف يُحسب هذا؟"), `formulaText`, `disclaimer`, `unavailable` ("النسبة غير متاحة — يرجى مراجعة مصدر البيانات")
- [X] T012 [US2] Create `PurificationCalculator` component in `frontend/src/components/PurificationCalculator.tsx`: props = `nonHalalPct: number | null`, `defaultCurrency?: 'AED'|'USD'|'SAR'`; **when `nonHalalPct === 0`** hide card entirely and show "لا يلزم تطهير لهذا السهم" note (FR-P05); **when `nonHalalPct === null`** render card in disabled state with error "النسبة غير متاحة — يرجى مراجعة مصدر البيانات" and calculate button disabled (FR-P06); **when `nonHalalPct > 0`** dividend input + currency selector with real-time result `= dividend × (nonHalalPct / 100)`; validate `dividend > 0` — show inline "يرجى إدخال مبلغ صحيح" on invalid; expandable methodology section; mandatory disclaimer (depends on T001, T011)
- [X] T013 [US2] Embed `<PurificationCalculator nonHalalPct={verdict.interest_income_ratio ? verdict.interest_income_ratio * 100 : null} />` in `frontend/src/components/HalalPanel.tsx` below the verdict badge, rendered when `verdict.status === 'PurificationRequired'` (depends on T012)

**Checkpoint**: US2 fully functional. Purification card visible on PurificationRequired stocks, hidden on Halal stocks, real-time calculation works. ✅

---

## Phase 5: User Story 3 — Zakat Calculator (Priority: P1)

**Goal**: An authenticated Free-tier user enters portfolio value and liabilities, selects currency, and sees their Zakat obligation (or "below nisab" message) based on live gold price.

**Independent Test**: Sign in as a Free-tier user. Navigate to `/ar/tools/zakat`. Enter portfolio = `100000 AED`, liabilities = `0`. Verify: nisab is displayed with its source date; if gold price = ~96.50 USD/g then nisab ≈ AED 30,056 (85g × 96.50 × 3.6725); 100000 > 30056 → Zakat = AED 2500 (2.5%). Also test: navigate as guest → should show soft sign-in gate.

**⚠️ Depends on Phase 2 (T006) being complete.**

- [X] T014 [P] [US3] Add `zakatCalculator` i18n namespace keys to `frontend/src/messages/en.json` and `frontend/src/messages/ar.json`: `title`, `portfolioLabel`, `liabilitiesLabel`, `currencyLabel`, `calculateButton`, `zakatDue`, `belowNisab`, `nisabLabel`, `nisabSource.api`, `nisabSource.static` ("قيمة ثابتة — تحديث مرجو"), `formulaTitle`, `formulaText`, `disclaimer`, `signInGate`
- [X] T015 [US3] Create `ZakatCalculator` component in `frontend/src/components/ZakatCalculator.tsx`: props = `goldPrice: GoldPriceData | null`; two numeric inputs (portfolio value, liabilities) + currency selector (AED/USD/SAR) + Calculate button; computes `net = portfolio − liabilities`; `nisab = 85 × goldPrice.price_per_gram_{currency}`; shows zakat = `net × 0.025` if `net ≥ nisab`, else "أقل من النصاب" message; shows nisab value, source badge ("قيمة ثابتة" when `goldPrice.source === 'static'`), expandable formula, disclaimer; validates inputs with zod (≥ 0, finite) (depends on T001, T014)
- [X] T016 [US3] Create `frontend/src/app/[locale]/tools/zakat/page.tsx`: fetch `GET /api/tools/gold-price` server-side; if user is unauthenticated render `useSoftGate` prompt with "سجّل مجاناً لحفظ نتائج حسابك"; else render `<ZakatCalculator goldPrice={goldPrice} />` (depends on T015, T006)

**Checkpoint**: US3 fully functional. Zakat Calculator at `/ar/tools/zakat` shows correct result with live nisab; static fallback visible when API is down; guest sees soft sign-in gate. ✅

---

## Phase 6: User Story 4 — Halal Compliance Change Alerts (Priority: P1, Pro-tier)

**Goal**: A Pro-tier user toggles alerts for stocks on their Dashboard; on next load, any compliance status change triggers an in-app notification banner.

**Independent Test**: Sign in as a Pro-tier user. Enable alerts for a ticker on the Dashboard. Temporarily modify `last_known_status` in Firestore to a different value than what the screener returns. Refresh Dashboard. Verify the notification banner appears at the top with the ticker, status change direction, and "عرض التفاصيل" link.

**⚠️ Depends on T002 (Firestore initialized in firebase.ts).**

- [X] T017 [P] [US4] Add `alerts` i18n namespace keys to `frontend/src/messages/en.json` and `frontend/src/messages/ar.json`: `toggleLabel` ("تنبيهات الشريعة"), `notificationTitle`, `statusChanged`, `viewDetails`, `dismiss`, `upgradePrompt` ("تنبيهات الامتثال الشرعي متاحة لمشتركي Pro"), `apiUnavailable` ("لم يتم التحقق من الامتثال — إعادة المحاولة قريباً")
- [X] T018 [US4] Implement `useComplianceAlerts` hook in `frontend/src/hooks/useComplianceAlerts.ts`: reads all docs from Firestore `users/{uid}/alert_preferences/`; for each `enabled` preference, calls existing `GET /api/stock/{ticker}/halal`; diffs `current_status` vs `last_known_status`; writes updated `last_known_status` + `updated_at` back to Firestore on change; returns `{ notifications: ComplianceChangeNotification[], setAlertEnabled(ticker, enabled): void, isLoading, isApiUnavailable }` (depends on T001, T002)
- [X] T019 [US4] Create `ComplianceAlertToggle` component in `frontend/src/components/ComplianceAlertToggle.tsx`: props = `ticker`, `tier: UserTier`, `alertEnabled: boolean`, `onToggle(ticker, enabled)`; Pro-tier: toggle writes to Firestore via `onToggle`; Free/guest: clicking toggle opens `UpgradeModal` with Pro pricing link; renders "تنبيهات الشريعة" label (depends on T017, T018)
- [X] T020 [P] [US4] Create `ComplianceNotificationBanner` component in `frontend/src/components/ComplianceNotificationBanner.tsx`: props = `notifications: ComplianceChangeNotification[]`, `onDismiss(ticker: string)`; renders one banner per notification with ticker, status change arrow, "عرض التفاصيل" link → stock halal panel, dismiss × button; `aria-live="polite"` on container; Framer Motion `AnimatePresence` fade-in per banner (depends on T001, T017)
- [X] T021 [US4] Integrate compliance alerts into Dashboard: import and render `<ComplianceNotificationBanner notifications={notifications} onDismiss={...} />` at top of Dashboard page; add `<ComplianceAlertToggle>` to each stock card in the Dashboard stock list; wire `useComplianceAlerts` hook; show `isApiUnavailable` status note when screener is unreachable (depends on T019, T020)
- [X] T030 [US4] Modify `frontend/src/components/HalalPanel.tsx` to accept optional `previousStatus?: 'halal'|'purification_required'|'non_halal'` prop; when present and different from `verdict.status`, render a two-column status comparison row ("الوضع السابق" / "الوضع الحالي") with the changed column highlighted using a Tailwind amber border; "عرض التفاصيل" links from `ComplianceNotificationBanner` should append `?from=alert` to the stock URL, which `HalalPanel` uses to detect the alert-navigation context (FR-A06)

**Checkpoint**: US4 fully functional. Pro toggle persists to Firestore; notifications appear on status change; Free users see upgrade prompt; API unavailable state shows graceful degradation message. ✅

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: i18n audit, accessibility verification, UX integration, and navigation links.

- [X] T022 [P] Audit all new i18n keys in `frontend/src/messages/en.json` and `frontend/src/messages/ar.json`; fill any gaps; ensure every key added in T008, T011, T014, T017 exists in both files with correct Arabic text
- [X] T023 [P] Verify RTL layout at 360px viewport for all 4 tools: open each in Chrome DevTools with `dir="rtl"`, 360px width; check for horizontal overflow, truncated text, or misaligned icons in `RiskWizard.tsx`, `PurificationCalculator.tsx`, `ZakatCalculator.tsx`, `ComplianceNotificationBanner.tsx`
- [X] T024 [P] Keyboard navigation audit: Tab through all wizard steps (T007) and calculator forms (T012, T015); verify Enter submits, Escape goes back, Arrow keys navigate wizard options; verify `aria-label` present on all calculator inputs and result regions use `aria-live="polite"`
- [X] T025 [P] WCAG AA contrast check: verify all new Tailwind color classes used in label badges (`conservative`, `moderate`, `aggressive`), notification banner, and purification card meet 4.5:1 contrast ratio; adjust if needed
- [X] T026 Add "اكتشف ملف مخاطرتك →" CTA link to NavBar `frontend/src/components/NavBar.tsx` pointing to `/tools/risk-wizard` (visible to guest users as an entry point)
- [X] T027 Add "احسب زكاتك →" link to the authenticated Dashboard view (e.g., in the Dashboard sidebar or hero section, visible only to authenticated users)

**Checkpoint**: All 4 tools pass i18n audit, RTL layout, keyboard nav, WCAG AA, and are discoverable via navigation. ✅ Feature complete.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └── Phase 3 (US1) ← can start after T001 + T002
  └── Phase 4 (US2) ← can start after T001
  └── Phase 2 (Foundational Backend)
        └── Phase 5 (US3) ← must wait for T006
  └── Phase 6 (US4) ← can start after T002

Phase 3 + Phase 4 (US1 + US2) can run in PARALLEL with Phase 2 (backend).
Phase 5 (US3) must wait for Phase 2 to complete.
Phase 6 (US4) can start in parallel with Phase 2, 3, 4 — only needs T002.
Final Phase depends on all 4 user story phases being complete.
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|-----------|----------------------|
| US1 — Risk Wizard | T001, T002 | Phase 2, US2, US4 |
| US2 — Purification Calc | T001 | Phase 2, US1, US4 |
| US3 — Zakat Calculator | T001 + Phase 2 complete (T006) | US1, US2, US4 (after T002) |
| US4 — Compliance Alerts | T001, T002 | Phase 2, US1, US2 |

### Parallel Opportunities Per Story

**Phase 3 (US1)**: T007 (WizardStep) ‖ T008 (i18n) → then T009 (RiskWizard) → T010 (page)

**Phase 4 (US2)**: T011 (i18n) → T012 (component) → T013 (embed in HalalPanel)

**Phase 5 (US3)**: T014 (i18n) → T015 (component) → T016 (page)  
*(must wait for T006)*

**Phase 6 (US4)**: T017 (i18n) ‖ T020 (Banner) → T018 (hook) → T019 (Toggle) → T021 (Dashboard integration)

**Final Phase**: T022 ‖ T023 ‖ T024 ‖ T025 all in parallel → T026, T027

---

## Implementation Strategy

### MVP Scope (Hackathon Demo — highest judge impact)

**Phase 3 alone (US1)** delivers a fully demonstrable, guest-accessible, Arabic-first Islamic investor tool with zero backend changes.

Adding **Phase 4 (US2)** completes the halal screening UX loop and shows the platform's unique Islamic-finance depth.

**US1 + US2 together = minimum viable judge demo**. Both require only frontend work and can ship within hours.

### Incremental Delivery Order

1. **T001 + T002** (10 min) — unblock everything
2. **T007 + T008** in parallel → **T009** → **T010** — US1 Risk Wizard live (no backend)
3. **T011** → **T012** → **T013** — US2 Purification Calculator live (no backend)
4. **T003 + T004** in parallel → **T005** → **T006** — Backend gold price ready
5. **T014** → **T015** → **T016** — US3 Zakat Calculator live
6. **T017 + T018** → **T019 + T020** → **T021** — US4 Compliance Alerts live
7. **T022–T027** — Polish pass, navigation links

### Total Task Count

| Phase | Tasks | User Story |
|-------|-------|-----------|
| Setup | 4 | — |
| Foundational | 4 | — |
| Phase 3 | 4 | US1 |
| Phase 4 | 3 | US2 |
| Phase 5 | 3 | US3 |
| Phase 6 | 6 | US4 |
| Final | 6 | — |
| **Total** | **30** | |
