# Quickstart: Validating the Auditor Mobile Console

Prerequisites, setup, and runnable scenarios to prove each user story works end-to-end once
implemented. This does not contain implementation code — see `tasks.md` (Phase 2) and the
implementation phase for that.

## Prerequisites

- Node.js + npm (already used to scaffold this project)
- Expo CLI (`npx expo`, no global install required)
- A running instance of the backend described in `contracts/` (or a mock server implementing the
  same contract, e.g. via `msw` or a small local stub — TBD in tasks.md) — this app has no backend
  of its own
- A physical device or simulator with Expo Go, or an EAS/dev-client build if a config plugin
  (push, etc.) isn't supported by Expo Go
- Two auditor test accounts: one with access to at least one seeded audit with findings of mixed
  severity/confirmation state, one with no access to that audit (for permission checks)

## Setup

```bash
npm install
npx expo-doctor         # sanity check — should report 0 issues, as it does today
npx tsc --noEmit         # type-check — should be clean
npm run web              # or: npm run ios / npm run android
```

Set the backend base URL via an Expo public env var (exact name decided in tasks.md, e.g.
`EXPO_PUBLIC_API_URL`) — never hardcode it per-environment in source (Constitution Principle III).

## Scenario 1 — Sign in and session continuity (User Story 1)

1. Launch the app signed out → confirm the sign-in screen appears (no way to reach authenticated
   screens without it).
2. Sign in with a valid test account → confirm the monitoring panel (authenticated home) loads.
3. Background the app for a few minutes, then foreground it → confirm no forced re-login during
   normal use.
4. Revoke that account/session on the backend (or let the refresh token expire in a test
   environment) → next app action that needs a fresh token should return the auditor to sign-in.
5. Sign out explicitly → confirm no further audit/finding data or alerts are retrievable for that
   account on this device (e.g. inspect that the push token was disassociated, per
   `contracts/notifications.md`).

**Pass condition**: all 4 acceptance scenarios in spec.md Story 1 hold.

## Scenario 2 — Real-time-ish monitoring panel (User Story 2)

1. With a running audit seeded on the backend, open the monitoring panel → confirm status,
   active test batteries, and metrics are visible.
2. Change that audit's progress/status on the backend → within one polling interval (default 30s),
   confirm the panel updates without a manual pull-to-refresh.
3. Put the app in the background, change the audit again, then foreground the app → confirm the
   panel shows the updated state (polling resumed) rather than a stale value frozen from before
   backgrounding.
4. With no audits running, open the panel → confirm an explicit "nothing active" state, not a
   blank/broken screen.

**Pass condition**: spec.md Story 2 acceptance scenarios hold; SC-001 and SC-005a are observable.

## Scenario 3 — Critical alert delivery (User Story 3)

1. With the app backgrounded/closed, trigger a confirmed critical finding on the backend for an
   audit the test account can access → confirm a push notification arrives.
2. Tap the notification → confirm the app opens directly to that finding's detail.
3. Trigger the same kind of finding for an audit the *other* test account (no access) does not
   have permission to view → confirm that account's device receives nothing.
4. Trigger two critical findings in quick succession → confirm both are individually visible/
   reviewable afterward (e.g. in an alerts list), not collapsed into one.

**Pass condition**: spec.md Story 3 acceptance scenarios and Edge Case ("alert for inaccessible
audit MUST NOT be delivered") hold; SC-002 is observable.

## Scenario 4 — Reviewing findings and evidence (User Story 4)

1. Open an audit with findings of mixed confirmation state → confirm the findings list shows type,
   severity, and short description per finding, and visually distinguishes confirmed vs
   preliminary.
2. Open a confirmed finding → confirm evidence, anomaly details, and impact parameters are shown.
3. Reclassify a finding on the backend (e.g. mark a previously critical finding as false-positive)
   → confirm the mobile view reflects the new state rather than continuing to show the old one.

**Pass condition**: spec.md Story 4 acceptance scenarios and the reclassification Edge Case hold.

## Scenario 5 — Executive report generation (User Story 5)

1. From an audit with reviewable findings, request a report preview → confirm a preview renders
   before anything is finalized.
2. Compile the report as PDF → confirm a downloadable/shareable PDF file is produced matching the
   audit's findings.
3. Repeat for Markdown format.
4. Trigger report generation for an audit with a large number of findings → confirm the app shows
   an in-progress/compiling state rather than appearing frozen.
5. Use the app's share action on a completed report → confirm the OS share sheet appears with the
   file attached.

**Pass condition**: spec.md Story 5 acceptance scenarios and the "large finding set" Edge Case
hold; SC-004 is observable.

## Regression checks (run after any change)

```bash
npx tsc --noEmit
npx expo-doctor
npm test            # once the Jest setup from research.md is added
```
