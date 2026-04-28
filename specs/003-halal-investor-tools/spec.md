# Feature Specification: Halal Investor Tools Suite

**Feature Branch**: `003-halal-investor-tools`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: Build the P1 competitive features identified from constitution Principle X (Competitive Intelligence): Risk Tolerance Wizard, Dividend Purification Calculator, Zakat Calculator, and Halal Compliance Change Alerts.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Risk Tolerance Wizard (Priority: P1)

Aisha is a 28-year-old first-time investor from Riyadh. She visits $ahim and wants to start investing but has no idea how much risk is right for her. She completes an 8-step Arabic-first questionnaire that asks about her investment horizon, age, income stability, market knowledge, and how she'd react to market downturns. At the end, she receives a clear Arabic label — **محافظ (Conservative)**, **متوازن (Moderate)**, or **جريء (Aggressive)** — along with 3 personalized next-step recommendations. Her profile is saved to her session and pre-fills the Portfolio Allocator's risk input.

**Why this priority**: Every competing platform (Annuity.org, Nippon, CalcXML) offers a risk profile questionnaire as the primary entry point for new investors. Without it, $ahim has no personalization — the Risk Panel shows generic metrics that beginners cannot act on. This is the single highest-leverage feature for beginner onboarding and converts anonymous visitors into engaged users.

**Independent Test**: A guest user can open the wizard page, complete all 8 questions, and receive a risk profile label with recommendations — without signing in. This alone delivers standalone value as an educational tool.

**Acceptance Scenarios**:

1. **Given** a guest user on the Landing page, **When** they click "اعرف مستوى مخاطرتك" (Know Your Risk Level), **Then** the wizard opens at Step 1 of 6 with a progress bar showing "1 / 6" in both Arabic and English.
2. **Given** the user is on any step, **When** they select a radio answer and tap "التالي" (Next), **Then** the app advances to the next step and the progress bar updates; the previous answer is preserved if they tap "السابق" (Previous).
3. **Given** the user completes all 8 steps, **When** they tap "احسب ملفي" (Calculate My Profile), **Then** the result screen displays: risk label in Arabic (محافظ / متوازن / جريء), a short Arabic explanation of what that means, 3 recommended actions, and the disclaimer "هذا تقييم إرشادي، وليس نصيحة استثمارية مرخصة".
4. **Given** a logged-in Free-tier user who completes the wizard, **When** the result is shown, **Then** their risk profile is stored in their session and the Portfolio Allocator page pre-selects the matching risk level on next visit.
5. **Given** a user on a mobile device, **When** they use the wizard, **Then** all radio options are tappable with touch targets ≥ 44×44 px and the layout is fully responsive in RTL Arabic.
6. **Given** a user navigating with keyboard only, **When** they move through the wizard, **Then** Tab advances to the next answer option, Space/Enter selects it, and Escape returns to the previous step.

---

### User Story 2 — Dividend Purification Calculator (Priority: P1)

Khalid holds shares in a stock that passed the Halal screener but carries 3.2% non-compliant revenue. He received a SAR 400 dividend. He needs to know exactly how much to donate to charity to "purify" his dividend income — a religious obligation. He opens the Purification Calculator on the Halal Panel page, enters his dividend amount, and the calculator uses the stock's non-compliant revenue ratio to instantly compute how much to give (e.g., SAR 12.80).

**Why this priority**: Islamicly's most-cited feature is dividend purification. It closes the halal UX loop — without it, a user can screen a stock as "حاجة تطهير" (Purification Required) but has no actionable next step. This is a zero-API-cost calculation using data already available from the Halal screener.

**Independent Test**: A user on any stock's Halal Panel can enter a dividend amount and receive an exact purification amount and percentage — without any additional API call. Fully self-contained on the frontend with pre-loaded screener ratio.

**Acceptance Scenarios**:

1. **Given** a stock with a "Purification Required" Halal verdict, **When** the user opens the Halal Panel, **Then** a "حاسبة التطهير" (Purification Calculator) card is visible below the verdict.
2. **Given** the calculator card is open, **When** the user types a dividend amount in their preferred currency (AED or USD, selectable), **Then** the purification amount updates in real time as: `Purification = (Non-Halal Revenue% / 100) × Dividend Amount`, displayed in the same currency.
3. **Given** the calculation is shown, **When** the user views the result, **Then** the screen shows: the purification amount, the percentage used, the formula as an expandable "كيف يُحسب هذا؟" section, and the reminder "التبرع بمبلغ التطهير واجب ديني؛ التحقق النهائي يقع على عاتق المستخدم".
4. **Given** a stock with a clean "Halal" verdict (0% non-compliant revenue), **When** the user opens the Halal Panel, **Then** the Purification Calculator is hidden and a note reads "لا يلزم تطهير لهذا السهم".
5. **Given** a user who has not signed in (guest), **When** they use the Purification Calculator, **Then** they can perform the calculation freely; no sign-in is required for this tool.

---

### User Story 3 — Zakat Calculator (Priority: P1)

Mohammed has been holding a portfolio of halal stocks for over a year. Ramadan is approaching and he wants to know how much Zakat he owes on his investments. He opens the Zakat Calculator on his Dashboard, enters his total portfolio value and any outstanding investment-related liabilities. The calculator checks whether the net value exceeds the current nisab threshold (gold equivalent) and computes his Zakat obligation at 2.5%.

**Why this priority**: Zakat on investments is a frequently searched topic among Muslim investors and a key differentiator for $ahim versus non-halal-native competitors. It requires no external API (nisab can be derived from gold price already available), uses pure math, and delivers immediate, high-trust value to religious users.

**Independent Test**: A logged-in Free-tier user can navigate to the Zakat Calculator, input a portfolio value and liability, and receive a Zakat amount or a "below nisab" message — fully functional as a standalone page.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they navigate to `/[locale]/tools/zakat`, **Then** they see an Arabic-first calculator with two numeric inputs: "قيمة المحفظة" (Portfolio Value) and "الالتزامات المتعلقة بالاستثمار" (Investment Liabilities), plus a currency selector (AED / USD / SAR).
2. **Given** the user enters a portfolio value and liabilities, **When** they tap "احسب الزكاة" (Calculate Zakat), **Then** the system computes: Net Value = Portfolio − Liabilities; Nisab = 85g gold × current gold price; if Net Value ≥ Nisab → Zakat Due = Net Value × 2.5%, else → "قيمتك أقل من النصاب، لا تجب عليك الزكاة".
3. **Given** the result screen is shown, **When** the user taps "كيف يُحسب هذا؟", **Then** an expandable section shows the formula, the nisab source (gold price date and value used), and the reminder "استشر عالماً للتحقق من زكاتك الخاصة".
4. **Given** the gold price API is unavailable, **When** the user requests calculation, **Then** the system falls back to a configurable static nisab constant (displayed visibly as "قيمة ثابتة — تحديث مرجو") rather than failing.
5. **Given** a guest user, **When** they visit the Zakat Calculator URL, **Then** they are shown the sign-in gate (Free tier is sufficient) with a message "سجّل مجاناً لحفظ نتائج حسابك".

---

### User Story 4 — Halal Compliance Change Alerts (Priority: P1)

Sara follows 5 stocks on her Dashboard. One of them, previously Halal, has crossed the debt threshold and flipped to "Non-Halal" after its latest quarterly filing. Sara receives an in-app notification banner and (if enabled) an email: "تنبيه: سهم [TICKER] تغيّر وضعه الشرعي إلى غير حلال — يُرجى مراجعة محفظتك". She can tap the notification to go directly to the stock's Halal Panel and see the updated ratios.

**Why this priority**: Halal compliance status is dynamic, not static — companies' financial ratios change every quarter. Without alerts, a user who screened a stock 6 months ago has no way of knowing it has since become non-compliant. Islamicly's compliance-change monitoring is one of its top-cited premium features and directly addresses a real religious-obligation gap.

**Independent Test**: A Pro-tier user can toggle "تنبيهات الامتثال الشرعي" on the Dashboard's watchlist, and when a mocked compliance-status flip is triggered (or the screener returns a changed verdict), an in-app notification appears within the current session. Email delivery is out of scope for MVP (in-app only).

**Acceptance Scenarios**:

1. **Given** a Pro-tier user with at least one stock on their watchlist, **When** they view the stock card on the Dashboard, **Then** a toggle "تنبيهات الشريعة" (Shariah Alerts) is visible on each stock card; it is OFF by default and ON after the user activates it.
2. **Given** the user has alerts enabled for a stock and the Halal screener returns a changed verdict (Halal → Non-Halal or Non-Halal → Halal), **When** the Dashboard data refreshes, **Then** an in-app notification banner appears at the top of the Dashboard: "[TICKER]: تغيّر وضع الامتثال الشرعي" with a "عرض التفاصيل" (View Details) link.
3. **Given** the notification appears, **When** the user taps "عرض التفاصيل", **Then** they are navigated to the stock's Halal Panel showing the current and previous compliance ratios side-by-side with the change highlighted.
4. **Given** a Free-tier user, **When** they attempt to enable Shariah Alerts, **Then** an upgrade prompt appears: "تنبيهات الامتثال الشرعي متاحة لمشتركي Pro — ترقِّ الآن للحصول على تنبيهات فورية" linking to the pricing comparison table at the Pro row.
5. **Given** the screener API is temporarily unavailable, **When** the compliance check cannot run, **Then** no alert is fired and a visible status note on the Dashboard reads "لم يتم التحقق من الامتثال — إعادة المحاولة قريباً" without crashing the page.

---

### Edge Cases

- What happens when a user enters 0 or a negative value in the Purification or Zakat calculator? → Validate: display an inline Arabic error "يرجى إدخال مبلغ صحيح" and block calculation.
- What if the wizard is abandoned mid-flow (browser closed or navigated away)? → Profile is not saved; user restarts from Step 1 on next visit. No partial state persists.
- What if the non-compliant revenue ratio for a stock is missing (data gap)? → Purification Calculator shows "النسبة غير متاحة — يرجى مراجعة مصدر البيانات" and disables the calculate button.
- What if a stock's compliance status flips and then flips back within the same refresh cycle? → Only the net change (relative to last saved state) triggers a notification; no duplicate alerts.
- What if the user has 0 nisab-eligible assets? → Zakat Calculator shows "لا تجب عليك الزكاة على هذه المحفظة".

---

## Tier & Accessibility Constraints *(SaaS — mandatory)*

- **Risk Tolerance Wizard**: Free tier (guest-accessible). All users including unauthenticated guests can complete the wizard. Saving the result to their profile requires Free account. No upgrade gate.
- **Dividend Purification Calculator**: Free tier (guest-accessible). Available on any stock's Halal Panel with no authentication requirement. Completes the existing free halal screening UX.
- **Zakat Calculator**: Free tier (authenticated). Requires Free account to access (encourages sign-up for result-saving). Gate displays a non-intrusive "سجّل مجاناً" prompt for guests.
- **Halal Compliance Alerts**: Pro tier only. Toggle visible to all tiers; activation by Free users shows upgrade prompt linking to pricing Pro row. In-app notification only for MVP (email out of scope).
- **Accessibility**: All 4 tools MUST support full keyboard navigation (Tab / Enter / Space / Escape). Wizard radio buttons navigable with arrow keys. Calculator inputs MUST have `aria-label` in both Arabic and English. All dynamic results MUST use `aria-live="polite"`. WCAG 2.1 AA contrast required throughout.
- **Bilingual**: Every label, tooltip, error, disclaimer, and result text MUST exist in both `ar.json` and `en.json`. Arabic is the primary language; English is secondary. RTL layout MUST be correct for all four tools.

---

## Requirements *(mandatory)*

### Functional Requirements

**Risk Tolerance Wizard**

- **FR-R01**: The system MUST present a 6-question wizard at route `/[locale]/tools/risk-wizard` with Arabic labels for each question and each answer option.
- **FR-R02**: Each question MUST be displayed one at a time with a visible progress indicator ("السؤال X من 6").
- **FR-R03**: The system MUST compute a weighted score using the formula defined in constitution Principle X: horizon (25%), age (15%), knowledge (15%), income stability (15%), drawdown tolerance (20%), holding patience (10%).
- **FR-R04**: The system MUST map score ranges to risk profiles: 0–40 → محافظ (Conservative); 41–70 → متوازن (Moderate); 71–100 → جريء (Aggressive).
- **FR-R05**: The result screen MUST display the Arabic risk label, a plain-Arabic explanation (≤3 sentences), 3 personalized next-step recommendations, and the regulatory disclaimer.
- **FR-R06**: For authenticated Free-tier users, the risk profile label MUST be stored in the session and pre-fill the Portfolio Allocator's risk input on next use.
- **FR-R07**: The wizard MUST be accessible to unauthenticated (guest) users; completion without sign-in MUST be fully functional.

**Dividend Purification Calculator**

- **FR-P01**: The system MUST display a Purification Calculator card on the Halal Panel for any stock with a "Purification Required" verdict.
- **FR-P02**: The calculator MUST accept a numeric dividend amount input with a currency selector (AED / USD / SAR).
- **FR-P03**: The system MUST compute: `Purification Amount = (non_halal_revenue_pct / 100) × dividend_amount` and update the result in real time as the user types.
- **FR-P04**: The result MUST display the purification amount in the selected currency, the percentage used, an expandable methodology section ("كيف يُحسب هذا؟"), and the mandatory Islamic disclaimer.
- **FR-P05**: The calculator MUST be hidden for stocks with a clean "Halal" verdict (non-compliant revenue = 0%).
- **FR-P06**: When the non-compliant revenue ratio is unavailable, the calculator MUST be disabled with an informative Arabic error message.

**Zakat Calculator**

- **FR-Z01**: The system MUST provide a Zakat Calculator at route `/[locale]/tools/zakat` accessible to authenticated Free-tier users.
- **FR-Z02**: The calculator MUST accept two numeric inputs: portfolio value and investment liabilities, with a currency selector (AED / USD / SAR).
- **FR-Z03**: The system MUST fetch the current gold price to compute the nisab threshold (85g × gold price/g); on API failure it MUST fall back to a configurable static nisab constant displayed with a visible "قيمة ثابتة" label.
- **FR-Z04**: Zakat due MUST be computed as: if `(portfolio − liabilities) ≥ nisab` then `zakat = (portfolio − liabilities) × 0.025`; else display "قيمتك أقل من النصاب".
- **FR-Z05**: The result screen MUST show: nisab value used (with date), net portfolio value, zakat amount or "below nisab" message, expandable formula section, and the advisory disclaimer.
- **FR-Z06**: Guest users visiting the Zakat Calculator URL MUST see the soft sign-in gate with the message "سجّل مجاناً لحفظ نتائج حسابك".

**Halal Compliance Alerts**

- **FR-A01**: Each stock card on the Dashboard MUST include a "تنبيهات الشريعة" toggle visible to all tier users.
- **FR-A02**: Pro-tier users toggling the alert ON MUST have their preference persisted server-side per stock ticker.
- **FR-A03**: Free-tier users attempting to enable an alert MUST see a non-blocking upgrade prompt linking to the Pro pricing row; the toggle MUST NOT silently fail.
- **FR-A04**: When a Dashboard data refresh detects a compliance status change for an alerted stock, the system MUST render an in-app notification banner at the top of the Dashboard.
- **FR-A05**: The notification banner MUST include: the ticker, the direction of change (e.g., "حلال → غير حلال"), a "عرض التفاصيل" link navigating to the stock's Halal Panel, and a dismiss button.
- **FR-A06**: The Halal Panel for an alerted stock MUST display current and previous compliance ratios side-by-side with the changed field visually highlighted.
- **FR-A07**: When the screener API is unavailable, no alert MUST fire and the Dashboard MUST display a graceful degradation status note per constitution Principle VI.

### Key Entities

- **RiskProfile**: `{ user_id, score: number, label: "conservative"|"moderate"|"aggressive", completed_at, answers: object }` — stored in session for guests, persisted server-side for authenticated users.
- **PurificationResult**: Computed client-side on the fly; not persisted. Input: `{ dividend_amount, currency, non_halal_pct }`. Output: `{ purification_amount, formula_display }`.
- **ZakatResult**: Computed client-side; not persisted. Input: `{ portfolio_value, liabilities, currency, nisab_value }`. Output: `{ net_value, zakat_due_or_null, nisab_source }`.
- **ComplianceAlertPreference**: `{ user_id, ticker, enabled: boolean, last_known_status: "halal"|"purification_required"|"non_halal" }` — persisted server-side, Pro-tier only.
- **ComplianceChangeNotification**: `{ ticker, previous_status, current_status, detected_at }` — generated at Dashboard refresh time; in-app only, not stored.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time Arabic-speaking user completes the Risk Tolerance Wizard in under 3 minutes and correctly interprets their risk label without external help.
- **SC-002**: Users who complete the Risk Tolerance Wizard proceed to use the Portfolio Allocator or Halal Panel at a higher rate than users who skip it (conversion lift measurable post-launch).
- **SC-003**: The Dividend Purification Calculator produces a result within 1 second of the user entering a dividend amount, with no page reload.
- **SC-004**: The Zakat Calculator correctly handles the nisab fallback — when the gold price API is unavailable, the result is still shown with a clearly labeled static nisab value within 2 seconds.
- **SC-005**: Pro-tier users with compliance alerts enabled see a notification within the same Dashboard session that a compliance change is detected (no delayed delivery — synchronous with data refresh).
- **SC-006**: All 4 tools render correctly in both Arabic RTL and English LTR layouts on mobile (360px viewport) and desktop (1280px) without horizontal overflow or truncation.
- **SC-007**: All 4 tools pass WCAG 2.1 AA automated contrast checks and are fully operable via keyboard-only navigation.

---

## Assumptions

- The existing Halal screener (`backend/app/services/halal_screener.py`) already returns a `non_halal_revenue_pct` field per stock; if absent, the Purification Calculator displays a data-gap message rather than a broken UI.
- Gold price for nisab calculation is retrievable from the existing market data service (`backend/app/services/market_data.py`) as a commodity price; if not, a configurable constant (e.g., AED 22,000 / 85g ≈ AED 258.82/g) is used as the static fallback.
- The Dashboard watchlist feature (from spec 002) already stores a list of ticker symbols per authenticated user, providing the data backbone for compliance alert preferences.
- In-app notifications are rendered as a banner component on the Dashboard page — no real-time WebSocket or push notification infrastructure is required for MVP (notifications appear on Dashboard page load/refresh).
- Stripe billing and email delivery are out of scope; the Pro tier gate for compliance alerts uses the existing JWT tier claim from spec 001.
- Mobile app (iOS/Android) is out of scope; all 4 tools are web-only for this spec.
- The Risk Tolerance Wizard result is not used for automated investment decisions — it is advisory only and MUST carry the regulatory disclaimer on every result screen.
