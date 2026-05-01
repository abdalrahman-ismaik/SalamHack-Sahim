# Quickstart: Firestore MVP User Storage

## Prerequisites

- Firebase project with Authentication enabled.
- Firestore database in Native mode.
- Frontend `.env.local` populated with public Firebase web app config.
- Backend `.env` configured for existing provider keys as needed.

## Firebase Setup

1. In Firebase Console, create or select the project.
2. Enable the sign-in providers used by the app.
3. Enable Firestore.
4. Copy `frontend/.env.local.example` to `frontend/.env.local`.
5. Fill:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
6. Deploy the project `firestore.rules`.

## Local Verification

From `frontend/`:

```powershell
npx tsc --noEmit --pretty false
npm run build
```

Manual flow:

1. Start the backend and frontend.
2. Sign up as User A.
3. Complete onboarding/risk wizard.
4. Add a watchlist ticker.
5. Run a Zakat calculation.
6. Reload the dashboard and confirm profile, watchlist count, risk, and Zakat
   reminder still appear.
7. Sign out and sign in as User B.
8. Confirm User B cannot see User A data.
9. Try enabling a compliance alert as a Free user and confirm an upgrade prompt
   appears instead of a saved Pro alert.
10. In Firebase Console > Firestore Database, update the trusted demo user's
    `users/{uid}.tier` field to `pro` or `enterprise`; do not expose this write
    path in the client.
11. Confirm alert preference writes work for that trusted user only.
12. Attempt to change `users/{uid}.tier` from the signed-in client and confirm
    Firestore rules deny the self-promotion write.

## MVP Success Criteria Validation

1. Time a signed-in dashboard reload and confirm saved profile, watchlist count,
   risk state, and Zakat reminder render within 3 seconds.
2. Time sign-up through first reusable profile record creation and confirm it
   completes in under 60 seconds.
3. Record one repeated stock/service lookup inside the TTL and confirm the
   second request reuses cache or avoids an unnecessary provider call.
4. Test at least 10 storage-unavailable scenarios across dashboard, watchlist,
   risk, Zakat, and alerts; at least 9 must keep the current page usable with a
   localized warning or empty state.

## Cache Boundary Verification

1. Request the same stock score/news/halal/forecast data twice within the TTL
   window.
2. Confirm the second request can use cached service data.
3. Confirm no user document is created or updated by a plain service lookup.
4. Simulate provider failure or missing key and confirm user-owned dashboard
   data still loads with a localized reduced-mode message.

## Out-of-Scope Check

Before demo, verify no stored user document contains:

- brokerage credentials
- payment details
- KYC/AML documents
- real transaction records
- raw Zakat portfolio value or liabilities
- provider response history

## Next Step

After implementation, run the local verification commands above and complete the
manual Firebase account-flow checks before the demo.
