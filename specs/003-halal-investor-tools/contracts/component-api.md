# Component API Contract: Halal Investor Tools Components (003)

**Purpose**: Documents the public prop interfaces for the 6 new React components introduced in this feature.

---

## RiskWizard

**File**: `frontend/src/components/RiskWizard.tsx`  
**Route**: Rendered on `/[locale]/tools/risk-wizard/page.tsx`  
**Tier**: Guest-accessible (no auth required)

```typescript
interface RiskWizardProps {
  /** Called when the user completes all steps and receives a result. */
  onComplete?: (profile: RiskProfile) => void;
  /** If provided, wizard starts in "result" view showing this saved profile. */
  initialProfile?: RiskProfile | null;
}

interface RiskProfile {
  score: number;           // 0–100
  label: 'conservative' | 'moderate' | 'aggressive';
  answers: Record<string, number>;
  completed_at: string;   // ISO 8601
}
```

**Behavior**:
- Renders 6 wizard steps (one per dimension), progress indicator ("السؤال X من 6")
- Final step triggers score computation and transitions to result screen
- Result screen shows: Arabic label badge, 3 recommended actions, disclaimer, "كيف يُحسب هذا؟" expandable formula
- Keyboard: Arrow keys navigate answers; Enter submits step; Escape goes back

---

## PurificationCalculator

**File**: `frontend/src/components/PurificationCalculator.tsx`  
**Embedded in**: `HalalPanel.tsx`  
**Tier**: Guest-accessible

```typescript
interface PurificationCalculatorProps {
  /** Non-halal revenue percentage (0–100). From HalalVerdict.interest_income_ratio × 100. */
  nonHalalPct: number | null;
  /** Pre-selected currency passed from context. */
  defaultCurrency?: 'AED' | 'USD' | 'SAR';
}
```

**Behavior**:
- Hidden when `nonHalalPct` is null, 0, or undefined (shows "لا يلزم تطهير" note instead)
- Shows disabled state with error message when `nonHalalPct` is null
- Real-time calculation as user types (no submit button)
- Expandable methodology section

---

## ZakatCalculator

**File**: `frontend/src/components/ZakatCalculator.tsx`  
**Route**: Rendered on `/[locale]/tools/zakat/page.tsx`  
**Tier**: Free (authenticated); shows soft gate for guests

```typescript
interface ZakatCalculatorProps {
  /** Gold price data from GET /api/tools/gold-price. Null triggers fallback display. */
  goldPrice: GoldPriceData | null;
}

interface GoldPriceData {
  price_per_gram_usd: number;
  price_per_gram_aed: number;
  price_per_gram_sar: number;
  source: 'TwelveData' | 'static';
  date: string;
}
```

**Behavior**:
- Two numeric inputs + currency selector
- Calculate button (not real-time — user submits)
- Shows nisab value and source badge; "قيمة ثابتة" badge when source = "static"
- Result: zakat amount or "أقل من النصاب" message
- Expandable formula section

---

## ComplianceAlertToggle

**File**: `frontend/src/components/ComplianceAlertToggle.tsx`  
**Embedded in**: Dashboard stock card  
**Tier**: Pro only (shows upgrade prompt for Free/guest)

```typescript
interface ComplianceAlertToggleProps {
  ticker: string;
  /** Current user's tier. */
  tier: UserTier;
  /** Current alert preference state (from Firestore or null if not set). */
  alertEnabled: boolean;
  /** Called when user toggles the switch. */
  onToggle: (ticker: string, enabled: boolean) => void;
}
```

**Behavior**:
- Free/guest: toggle is rendered but triggers `UpgradeModal` on click
- Pro: toggle updates Firestore preference via `onToggle`
- Shows "تنبيهات الشريعة" label next to ticker

---

## ComplianceNotificationBanner

**File**: `frontend/src/components/ComplianceNotificationBanner.tsx`  
**Embedded in**: Dashboard page, above stock list  
**Tier**: Pro (only rendered when user is Pro)

```typescript
interface ComplianceNotificationBannerProps {
  notifications: ComplianceChangeNotification[];
  /** Called when user dismisses a notification. */
  onDismiss: (ticker: string) => void;
}

interface ComplianceChangeNotification {
  ticker: string;
  previous_status: HalalStatus;
  current_status: HalalStatus;
  detected_at: string;
}
```

**Behavior**:
- Renders one banner per notification (stacked vertically at top of Dashboard)
- Each banner: ticker label, status change direction arrow, "عرض التفاصيل" link → stock Halal Panel, dismiss × button
- `aria-live="polite"` on container so screen readers announce new notifications
- Animates in with Framer Motion (fade + slide)

---

## WizardStep (ui primitive)

**File**: `frontend/src/components/ui/WizardStep.tsx`  
**Tier**: Internal primitive, no direct rendering

```typescript
interface WizardStepProps {
  /** 1-based step number */
  stepNumber: number;
  totalSteps: number;
  questionKey: string;    // i18n key for question text
  options: WizardOption[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

interface WizardOption {
  labelKey: string;       // i18n key for option text
  value: number;          // Numeric value used in weighted scoring (0–4)
}
```
