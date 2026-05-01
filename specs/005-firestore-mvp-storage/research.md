# Research: Firestore MVP User Storage

## Decision: Use Firestore for user-owned MVP state

**Rationale**: The app already uses Firebase Auth and Firestore client SDK.
Firestore gives the MVP simple account-scoped persistence for profile,
watchlist, risk, Zakat, and alert preferences without introducing a backend
database, migrations, or server maintenance during the hackathon window.

**Alternatives considered**:

- **SQLite/PostgreSQL on backend**: Better for relational constraints, but adds
  migrations, deployment state, and API work that is not needed for the MVP.
- **Browser localStorage only**: Fastest, but fails cross-device sign-in and
  makes dashboard personalization feel temporary.
- **Persistent provider cache in Firestore**: Useful later, but risks mixing
  user behavior and service data and expands data governance scope.

## Decision: Keep provider responses in backend in-memory TTL cache

**Rationale**: Service responses from market/news/halal/forecast/sector/gold
providers are not user-owned data. The existing process-local TTL cache is
enough to reduce repeated demo calls and avoid rate-limit friction. It also
keeps provider data out of long-lived user records.

**Alternatives considered**:

- **Firestore service cache**: Durable across backend restarts, but creates a
  new persistent data class and requires TTL cleanup policy.
- **No caching**: Simpler mentally, but increases demo fragility and provider
  cost/rate-limit exposure.
- **External cache service**: Operationally unnecessary for a hackathon MVP.

## Decision: Store latest Zakat metadata, not raw inputs or history

**Rationale**: The dashboard only needs to know whether and when the user last
calculated Zakat, the result state, currency, and nisab source. Raw portfolio
value and liabilities are more sensitive and are not required for the current
workflow.

**Alternatives considered**:

- **Full Zakat history**: Valuable later, but increases privacy scope and UI
  complexity.
- **No Zakat persistence**: Safer, but weakens the dashboard reminder workflow.

## Decision: Use localStorage only for guest fallback

**Rationale**: Guest risk profile persistence improves the try-before-sign-in
experience. It must remain local-only so guest data is not accidentally assigned
to another user.

**Alternatives considered**:

- **Anonymous cloud records**: Adds identity-linking complexity and privacy risk.
- **No guest persistence**: Simpler, but makes guest risk wizard retakes more
  frustrating after reload.

## Decision: Enforce Pro alert writes with trusted tier data

**Rationale**: Compliance alerts are Pro/Enterprise. The UI can show upgrade
prompts, but write authorization must be enforced by security rules. The tier
field used for rules must be protected from user self-promotion.

**Alternatives considered**:

- **Client-only tier gate**: Not acceptable for Pro-only persistence.
- **Backend service account writes**: More authoritative but conflicts with
  the MVP goal of avoiding server-managed Firestore infrastructure.
- **Manual trusted tier seeding for demo accounts**: Acceptable for hackathon
  MVP if rules prevent users from editing tier themselves.
