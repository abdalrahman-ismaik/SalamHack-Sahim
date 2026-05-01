# Feature Specification: Firestore MVP User Storage

**Feature Branch**: `005-firestore-mvp-storage`
**Created**: 2026-05-01
**Status**: Draft
**Input**: User description: "Create a spec for Firestore MVP user storage, including user profiles, watchlists, risk profiles, Zakat metadata, compliance alerts, and backend TTL cache boundaries."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Persist Signed-In User Profile (Priority: P1)

As a signed-in beginner investor, I want my profile, language, access tier, and
onboarding preferences to be remembered, so that the dashboard feels personal
when I return during the hackathon demo.

**Why this priority**: User continuity is the foundation for dashboard KPIs,
tier gates, watchlist behavior, and personalized guidance. Without it, the SaaS
demo feels like a stateless prototype.

**Independent Test**: Create or sign in to an account, complete onboarding, leave
the dashboard, and return with the same account. The dashboard should show the
same name/profile context and should not ask the user to redo onboarding.

**Acceptance Scenarios**:

1. **Given** a new signed-in user, **When** they reach the dashboard for the first time, **Then** a user record exists with default profile, locale, tier, and dashboard metadata.
2. **Given** a returning signed-in user with saved onboarding preferences, **When** they open the dashboard, **Then** the saved preferences are available without repeating onboarding.
3. **Given** a signed-out visitor, **When** they browse public or guest flows, **Then** no owner-scoped user record is created until they authenticate.

---

### User Story 2 - Preserve Watchlist, Risk, and Zakat State (Priority: P1)

As a signed-in user exploring halal investment tools, I want my watchlist, latest
risk profile, and latest Zakat reminder metadata to survive page reloads, so
that dashboard cards and tool prompts reflect my real progress.

**Why this priority**: These data points power the most visible dashboard KPIs
and Islamic-finance workflows. They are small enough for MVP storage and useful
enough to demonstrate real product value.

**Independent Test**: Save watchlist tickers, complete the risk wizard, calculate
Zakat, reload the app, and confirm the dashboard shows the same watchlist count,
risk profile status, and Zakat reminder state.

**Acceptance Scenarios**:

1. **Given** a signed-in user adds a ticker to their watchlist, **When** they reload the dashboard, **Then** the ticker remains listed once and contributes to the watchlist count.
2. **Given** a signed-in user completes the risk wizard, **When** they return to the dashboard, **Then** the dashboard risk card reflects the latest completed profile.
3. **Given** a signed-in user completes a Zakat calculation, **When** they return to the dashboard, **Then** the dashboard shows a last-calculated reminder without exposing raw portfolio or liability inputs.
4. **Given** a guest completes a risk profile, **When** they stay unauthenticated, **Then** the profile may be kept only as a local fallback and is not written to another user's account.

---

### User Story 3 - Manage Compliance Alerts Privately (Priority: P2)

As a Pro user monitoring halal status, I want to save alert preferences per
ticker, so that I can be notified when a watched stock's compliance status
changes without exposing my alert list to anyone else.

**Why this priority**: Compliance alerts are a premium Islamic-investing feature
and demonstrate why persistence matters beyond basic profile storage.

**Independent Test**: Sign in as one Pro user, enable an alert for a ticker, sign
in as another user, and verify the second user cannot see or change the first
user's alert preference.

**Acceptance Scenarios**:

1. **Given** a Pro user enables an alert for a ticker, **When** the dashboard checks that ticker later, **Then** the saved preference is available for comparison.
2. **Given** a Free user tries to enable a Pro-only alert, **When** they interact with the alert control, **Then** they see an upgrade prompt and no Pro alert preference is saved.
3. **Given** any authenticated user, **When** they attempt to access another user's profile, watchlist, risk profile, Zakat metadata, or alert preferences, **Then** access is denied.

---

### User Story 4 - Keep Service Cache Boundaries Clear (Priority: P3)

As the demo team, we want external market, news, halal, forecast, sector, and
gold-price responses to be cached only as short-lived service data, so that the
demo is faster without turning provider responses into long-term user records.

**Why this priority**: Caching protects the live demo from rate limits and slow
providers, while a clear boundary prevents unnecessary database scope creep.

**Independent Test**: Request the same stock analysis twice within the cache
window and confirm the second request can reuse a short-lived service response,
then confirm no user-owned record is created from that service lookup unless the
user explicitly saves something.

**Acceptance Scenarios**:

1. **Given** a user searches for a ticker, **When** service data is cached, **Then** the cached entry contains only service response data and no user identity.
2. **Given** a cache entry reaches its expiry window, **When** the same service data is requested again, **Then** the system refreshes or gracefully falls back rather than using stale data indefinitely.
3. **Given** an external provider is unavailable, **When** the dashboard or stock page needs data, **Then** user-owned data remains readable and the service failure is shown as a reduced-mode state.

### Edge Cases

- A user signs in with a profile that has no existing user record.
- A user has duplicate watchlist saves for the same ticker with different casing.
- A user deletes a watchlist ticker while dashboard KPIs are loading.
- A risk profile exists locally for a guest and the user later signs in.
- A Zakat calculation completes while persistence is temporarily unavailable.
- A compliance alert references a ticker whose latest halal status is unknown.
- A Free user attempts to write Pro-only alert preferences.
- A cached service response is stale, malformed, or from a failed provider call.
- A service lookup happens while no user is signed in.

## Tier & Accessibility Constraints *(SaaS — mandatory)*

- **Tier gate**: Profile metadata, locale, onboarding, watchlist, risk profile,
  and latest Zakat metadata are available to signed-in Free, Pro, and Enterprise
  users. Guest users may keep only non-sensitive local fallback data. Compliance
  alert preferences are Pro and Enterprise only; Free users receive an upgrade
  prompt rather than a generic error. Tier authority is trusted state; client
  writes must not be able to self-promote a Free user to Pro or Enterprise.
- **Data persistence**: User-owned MVP data is stored only under owner-scoped
  paths: `users/{uid}`, `users/{uid}/watchlist/{ticker}`,
  `users/{uid}/risk_profile/current`, and
  `users/{uid}/alert_preferences/{ticker}`. Rules must require the authenticated
  user to own the `uid`. Service/API response caching remains a short-lived
  backend TTL cache and must not become user-owned storage.
- **Accessibility**: Any storage-dependent UI state, including loading,
  unavailable, upgrade, and saved states, must be reachable by keyboard and
  announced clearly to assistive technology where it changes visible content.
- **Bilingual**: All storage-related user messages, empty states, errors,
  upgrade prompts, and recovery notices must have Arabic and English text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create or update a signed-in user's root profile record with profile metadata, locale, access tier, and dashboard defaults.
- **FR-002**: System MUST prevent any user from reading, creating, updating, or deleting another user's stored profile, watchlist, risk profile, Zakat metadata, or alert preferences.
- **FR-003**: System MUST store watchlist tickers as unique, normalized entries per user.
- **FR-004**: Users MUST be able to view their saved watchlist after reload, return visit, or device change using the same account.
- **FR-005**: System MUST store the latest completed risk profile for signed-in users and replace any prior current profile when the user retakes the wizard.
- **FR-006**: System MUST allow guests to keep a risk profile only as a local fallback and MUST avoid writing guest risk data to a signed-in user's account without that user's authenticated session.
- **FR-007**: System MUST store latest Zakat reminder metadata for signed-in users, including calculation date, currency, nisab source, and whether Zakat was due.
- **FR-008**: System MUST NOT store raw Zakat portfolio value, liability inputs, or net input values unless a future feature explicitly asks for historical Zakat records.
- **FR-009**: System MUST store compliance alert preferences by user and ticker with enabled state, last known halal status, and update timestamp.
- **FR-010**: System MUST block Pro-only alert preference writes for users who do not have Pro or Enterprise access.
- **FR-011**: System MUST keep external market, news, halal, forecast, sector, and gold-price responses in short-lived service cache entries that contain no user identity.
- **FR-012**: System MUST keep user-owned data readable even when a service cache entry expires or an external provider fails.
- **FR-013**: System MUST document which data is stored, which data remains local-only, which data is cached temporarily, and which data is out of MVP scope.
- **FR-014**: System MUST fail gracefully when persistence is unavailable across profile, watchlist, risk, Zakat, and alert flows by showing a localized warning or empty state while preserving the user's current workflow.

### Key Entities *(include if feature involves data)*

- **UserProfile**: Represents a signed-in user's profile metadata, locale, access tier, onboarding summary, dashboard KPI metadata, last viewed ticker, and latest Zakat reminder metadata.
- **WatchlistItem**: Represents one normalized ticker saved by a user, with optional display metadata and saved timestamp.
- **RiskProfile**: Represents the user's latest completed risk wizard result, including score, label, answers, and completion timestamp.
- **ZakatMetadata**: Represents the latest Zakat reminder state shown on the dashboard, excluding raw portfolio, liability, and net input values.
- **ComplianceAlertPreference**: Represents one user's Pro alert preference for a ticker, including enabled state, last known halal status, and update timestamp.
- **ServiceCacheEntry**: Represents short-lived non-user-owned provider response data used to keep the demo responsive and resilient.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of signed-in users can reload the dashboard and see their saved profile, watchlist count, risk state, and Zakat reminder within 3 seconds.
- **SC-002**: 100% of attempted cross-account reads and writes during validation are denied.
- **SC-003**: A user can complete sign-up, reach the dashboard, and have a reusable profile record in under 60 seconds.
- **SC-004**: Repeated stock/service lookups during the demo avoid unnecessary repeated provider calls while showing refreshed or fallback data after the documented cache window.
- **SC-005**: 90% of storage-unavailable scenarios tested still allow the user to continue the current page or tool with a visible localized warning.
- **SC-006**: No validation sample of cached service data contains a user id, email, display name, or account-specific preference.

## Assumptions

- The MVP stores only lightweight demo-safe user state and does not store real brokerage transactions, KYC documents, payment methods, or broker credentials.
- Signed-in users are the only users with cross-device persistence.
- Guest risk profile storage is a convenience fallback and not a durable account record.
- Zakat history is out of scope; only the latest reminder metadata is needed for the dashboard.
- Compliance alerts are preference storage and in-app notification state only; push notifications, email notifications, and scheduled background monitoring are out of scope.
- External provider responses are cached only to improve demo speed and reliability, not to create a historical market-data database.
