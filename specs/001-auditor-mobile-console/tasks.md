---

description: "Task list template for feature implementation"
---

# Tasks: Auditor Mobile Console

**Input**: Design documents from `/specs/001-auditor-mobile-console/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Not explicitly requested in spec.md, so no test-first tasks per story. Targeted unit
tests for the two security-critical pieces (refresh mutex, push route whitelist) are included in
the Polish phase instead, since the constitution treats those as non-negotiable correctness
requirements, not general coverage.

**Organization**: Tasks are grouped by user story (spec.md priorities) to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- File paths are exact, relative to the repository root

## Path Conventions

Single Expo project (see plan.md → Project Structure): `src/app/`, `src/services/`,
`src/components/`, `src/hooks/`; tests under `tests/unit/`, `tests/integration/`.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project identity, dependencies, and route-group scaffolding

- [X] T001 Rename app identity from the scaffold placeholder in `app.json` (`expo.name`,
      `expo.slug`, `expo.scheme`) and `package.json` (`name`) to reflect "Auditor Mobile Console"
      instead of `expo-scaffold`
- [X] T002 [P] Add `@tanstack/react-query`, `expo-secure-store`, `expo-notifications`,
      `expo-print`, `expo-sharing` to `package.json` dependencies (`npx expo install <pkg>` for
      each, so Expo SDK-compatible versions are pinned)
- [X] T003 [P] Add `jest-expo`, `@testing-library/react-native`, `@types/jest` as devDependencies
      in `package.json` and add a `jest.config.js` using the `jest-expo` preset, plus a `test`
      script in `package.json`
- [X] T004 [P] Add an `EXPO_PUBLIC_API_URL` convention: create `.env.example` at the repo root
      documenting the variable, and read it via `process.env.EXPO_PUBLIC_API_URL` at the single
      point defined in T009 — never hardcode a per-environment URL elsewhere (Constitution
      Principle III)
- [X] T005 Restructure routes into groups per plan.md: create `src/app/(auth)/_layout.tsx` and
      `src/app/(tabs)/_layout.tsx`; move the existing `src/app/index.tsx` content into
      `src/app/(tabs)/index.tsx` as the monitoring panel placeholder, and keep
      `src/app/explore.tsx` under `(tabs)` or remove it if superseded by US4/US5 screens

**Checkpoint**: Project builds (`npx tsc --noEmit`, `npx expo-doctor`) with the new route groups
and dependencies present but unused.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth/session/API-client core that every user story depends on

**⚠️ CRITICAL**: No user story task may begin until this phase is complete

- [X] T006 Create `AuditorSession` in-memory context in
      `src/services/auth/session-context.tsx`, with fields `accessToken`, `accessTokenExpiresAt`,
      `auditorId`, `displayName`, `role` (data-model.md → AuditorSession) — **`accessToken` MUST
      only ever be held in this React context's state, never written to any storage API**
      (Constitution Principle I)
- [X] T007 Implement `src/services/auth/secure-token-store.ts` wrapping `expo-secure-store`,
      exposing `getRefreshToken()`, `setRefreshToken(token)`, `clearRefreshToken()` against a
      single fixed key `auth.refreshToken` — this file is the **only** place in the codebase
      allowed to call `expo-secure-store` for the refresh token
- [X] T008 Implement `src/services/auth/refresh-mutex.ts`: a module-level in-flight-refresh
      promise so concurrent 401s share one `/auth/refresh` call instead of racing (research.md →
      "Refresh concurrency"); on success it MUST overwrite the stored refresh token via T007
      before resolving, and on failure it MUST clear the session (Constitution Principle I)
- [X] T009 [P] Implement `src/services/api/client.ts`: a `fetch` wrapper reading
      `EXPO_PUBLIC_API_URL` (T004), rejecting any non-HTTPS base URL outside local dev, attaching
      `Authorization: Bearer <accessToken>` from T006, and on a 401 invoking the T008 mutex then
      retrying the original request exactly once
- [X] T010 [P] Define shared TypeScript types for `Audit`, `TestBattery`, `Finding`, `Alert`,
      `ExecutiveReport` in `src/services/api/types.ts`, matching the field tables in
      `data-model.md` exactly (including the enum value sets, e.g. `severity`:
      `"critical" | "high" | "medium" | "low"`)
- [X] T011 [P] Wrap the app in a `QueryClientProvider` (TanStack Query) in `src/app/_layout.tsx`
- [X] T012 Implement an auth routing guard in `src/app/_layout.tsx` (or a dedicated layout
      component it renders): unauthenticated auditors are redirected to `(auth)`, authenticated
      auditors to `(tabs)`, based on `AuditorSession` (T006) — this is a **UX redirect only**;
      it MUST NOT be treated as the authorization boundary (Constitution Principle III — the
      backend enforces access, this guard just routes)

**Checkpoint**: Foundation ready — `src/services/auth/` and `src/services/api/client.ts` exist and
type-check; no user story depends on anything not yet built.

---

## Phase 3: User Story 1 - Sign In and Stay in Sync (Priority: P1) 🎯 MVP

**Goal**: An auditor can sign in with platform credentials, stay signed in through normal use, and
be signed out cleanly on expiry/revocation or explicit logout.

**Independent Test**: quickstart.md → Scenario 1 (sign in, background/foreground, forced
expiry/revocation, explicit sign-out) — all pass without touching any other story's code.

### Implementation for User Story 1

- [X] T013 [US1] Build the sign-in screen in `src/app/(auth)/sign-in.tsx`: email/password form,
      calls `POST /auth/login` (contracts/auth.md) via `src/services/api/client.ts`
- [X] T014 [US1] On successful login, populate `AuditorSession` (T006) with the response's
      `accessToken`/`accessTokenExpiresAt`/auditor fields and persist `refreshToken` via T007 —
      implement in `src/services/auth/use-login.ts`, consumed by `sign-in.tsx`
- [X] T015 [US1] Show a generic "invalid email or password" message on a 401 from `/auth/login`
      (never the raw response body, per contracts/auth.md) in `src/app/(auth)/sign-in.tsx`
- [X] T016 [US1] Implement `src/services/auth/use-logout.ts`: calls `POST /auth/logout`
      (contracts/auth.md), then — regardless of that call's outcome — clears the in-memory access
      token (T006) and the stored refresh token (T007); add a "Sign out" action wired to it in the
      `(tabs)` layout
- [X] T017 [US1] Wire forced sign-out on refresh failure: when `refresh-mutex.ts` (T008) reports a
      failed refresh, clear the session (same effect as T016) and let the routing guard (T012)
      redirect to `(auth)/sign-in`

**Checkpoint**: Story 1 fully functional and independently testable (quickstart.md Scenario 1).

---

## Phase 4: User Story 2 - Monitor Audits in Real Time (Priority: P1) 🎯 MVP

**Goal**: The signed-in auditor sees running audits, their test batteries, progress, and metrics,
refreshed automatically while the panel is open.

**Independent Test**: quickstart.md → Scenario 2 (live panel, background/foreground pause-resume,
empty state) — testable once Story 1 provides a valid session.

### Implementation for User Story 2

- [X] T018 [P] [US2] Implement `src/services/api/use-audits.ts`: a TanStack Query hook for
      `GET /audits` (contracts/monitoring.md) with `refetchInterval: 30_000` (FR-004, default from
      spec.md Assumptions) and `refetchIntervalInBackground: false`
- [X] T019 [US2] Use `AppState` to pause the T018 query (`enabled: false`) when the app is
      backgrounded and resume it on foreground, in `src/services/api/use-audits.ts` (FR-004a)
- [X] T020 [US2] Build the monitoring panel in `src/app/(tabs)/index.tsx`: list each audit with
      status, its `testBatteries` (name/status/`progressPercent`), and `metrics`, using T018
- [X] T021 [US2] Add an explicit "no audits running" empty state to `src/app/(tabs)/index.tsx`
      when `GET /audits` returns an empty list (spec Story 2, Acceptance Scenario 3)
- [X] T022 [US2] Add a stale-data indicator to `src/app/(tabs)/index.tsx` using the T018 query's
      `isStale`/`dataUpdatedAt`, satisfying FR-015 (never present stale data as live)

**Checkpoint**: Stories 1 and 2 together form the MVP (quickstart.md Scenarios 1–2 both pass).

---

## Phase 5: User Story 3 - Get Notified of Critical Findings (Priority: P2)

**Goal**: The auditor receives a push alert when a critical finding is confirmed, and tapping it
opens that finding.

**Independent Test**: quickstart.md → Scenario 3 (alert delivery, tap-through, permission scoping,
no-collapse on rapid succession).

### Implementation for User Story 3

- [ ] T023 [P] [US3] Implement `src/services/notifications/register-push-token.ts`: request
      notification permission, obtain the Expo push token, and call
      `POST /devices/push-token` (contracts/notifications.md) — this call MUST only be made when
      `AuditorSession` (T006) has a valid access token (Constitution Principle IV)
- [ ] T024 [US3] Call `DELETE /devices/push-token` (contracts/notifications.md) from
      `src/services/auth/use-logout.ts` (T016) before clearing the session, disassociating the
      device's push token from the account
- [ ] T025 [US3] Implement `src/services/notifications/handle-notification-response.ts`: on a
      notification tap, validate `data.route` against the fixed whitelist in
      contracts/notifications.md (`finding-detail`, `audit-detail`, `alerts-list`) — any other
      value, or a missing required id, MUST navigate to `alerts-list` instead
- [ ] T026 [US3] Build the alerts list screen in `src/app/(tabs)/alerts.tsx`, listing delivered
      `Alert` records (data-model.md) with `severityLabel` and `readState`, each opening its
      linked finding
- [ ] T027 [US3] Register the T025 handler and a foreground-notification display in
      `src/app/_layout.tsx` using `expo-notifications`' response/received listeners

**Checkpoint**: Stories 1–3 functional independently (quickstart.md Scenarios 1–3).

---

## Phase 6: User Story 4 - Review Findings and Evidence on the Go (Priority: P2)

**Goal**: The auditor can browse an audit's findings and drill into full evidence/impact detail.

**Independent Test**: quickstart.md → Scenario 4 (triage list, evidence detail, reclassification
reflected).

### Implementation for User Story 4

- [ ] T028 [P] [US4] Implement `src/services/api/use-findings.ts`: TanStack Query hook for
      `GET /audits/{auditId}/findings` (contracts/monitoring.md)
- [ ] T029 [P] [US4] Implement `src/services/api/use-finding-detail.ts`: TanStack Query hook for
      `GET /findings/{findingId}` (contracts/monitoring.md), surfacing a distinct
      not-found/forbidden state on 403/404
- [ ] T030 [US4] Build the findings list screen at `src/app/(tabs)/audits/[auditId]/findings.tsx`
      using T028, showing `type`/`severity`/`summary` per finding and visually distinguishing
      `confirmationState: "confirmed"` from `"preliminary"` (FR-010)
- [ ] T031 [US4] Build the finding detail screen at `src/app/(tabs)/findings/[findingId].tsx`
      using T029, rendering `evidence` and `impactParameters` (data-model.md)
- [ ] T032 [US4] In `src/app/(tabs)/findings/[findingId].tsx`, show an explicit "no longer
      available" message on the T029 hook's 403/404 state instead of stale cached content (spec
      Edge Cases)
- [ ] T033 [US4] Ensure `use-finding-detail.ts` (T029) refetches on screen focus so a
      `reclassifiedAt`/severity change made on the backend is reflected next time the auditor
      opens that finding (spec Edge Cases — reclassification)

**Checkpoint**: Stories 1–4 functional independently (quickstart.md Scenarios 1–4).

---

## Phase 7: User Story 5 - Generate an Executive Report (Priority: P3)

**Goal**: The auditor can preview, compile, and share a PDF or Markdown executive report for an
audit.

**Independent Test**: quickstart.md → Scenario 5 (preview, PDF, Markdown, large-set progress
state, share sheet).

### Implementation for User Story 5

- [ ] T034 [P] [US5] Implement `src/services/api/use-report-preview.ts`: query hook for
      `GET /audits/{auditId}/report/preview?format=pdf|markdown` (contracts/monitoring.md)
- [ ] T035 [US5] Build the report screen at `src/app/(tabs)/audits/[auditId]/report.tsx` with a
      PDF/Markdown format toggle, rendering the T034 preview
- [ ] T036 [US5] Implement `src/services/api/use-generate-report.ts`: calls
      `POST /audits/{auditId}/report` then polls `GET /reports/{reportId}` until
      `status: "ready"` (or `"failed"`), exposing a `compiling` state to the UI (spec Edge Cases —
      large finding sets)
- [ ] T037 [US5] Implement `src/services/reports/generate-pdf.ts` using `expo-print` to render the
      report HTML (from the ready report's data) into a local PDF file
- [ ] T038 [US5] Implement `src/services/reports/generate-markdown.ts` to produce a Markdown
      string/file from the same report data, for the Markdown format path
- [ ] T039 [US5] Wire a "Share" action in `src/app/(tabs)/audits/[auditId]/report.tsx` that hands
      the compiled file (T037 or T038 output) to `expo-sharing`

**Checkpoint**: All 5 user stories independently functional (quickstart.md Scenarios 1–5 all pass).

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Security-critical unit coverage and final validation across all stories

- [ ] T040 [P] Unit test the refresh mutex in `tests/unit/refresh-mutex.test.ts`: two concurrent
      401s trigger exactly one `/auth/refresh` call, and the second caller receives the result of
      the first (not a second, competing rotation) — covers `src/services/auth/refresh-mutex.ts`
      (T008)
- [ ] T041 [P] Unit test the notification route whitelist in
      `tests/unit/notification-route-whitelist.test.ts`: a payload with an unrecognized or missing
      `route` resolves to `alerts-list`, never to an arbitrary path — covers
      `src/services/notifications/handle-notification-response.ts` (T025)
- [ ] T042 [P] Grep the codebase for `AsyncStorage` usage and confirm none of it touches
      `accessToken` or `refreshToken` (Constitution Principle I); document the check's result in
      the PR/commit description
- [ ] T043 Run the full `quickstart.md` validation (all 5 scenarios) against a real or mocked
      backend implementing `contracts/`
- [ ] T044 Run `npx tsc --noEmit` and `npx expo-doctor` and confirm both are clean, per the
      constitution's Development Workflow section

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately
- **Foundational (Phase 2)**: depends on Phase 1 — **blocks every user story**
- **User Stories (Phases 3–7)**: all depend on Phase 2 completion; independent of each other after
  that (see below)
- **Polish (Phase 8)**: depends on whichever stories are in scope for the current delivery being
  complete

### User Story Dependencies

- **US1 (P1)**: no dependency on other stories — this is the true root, everything else needs a
  signed-in session but not any US1 *screen* code
- **US2 (P1)**: needs Phase 2's API client + a signed-in session (US1) to have data to show, but no
  US2 code depends on US1's UI
- **US3 (P2)**: push registration (T023) needs a signed-in session (US1); independent of US2/US4/US5
- **US4 (P2)**: independent of US2/US3/US5 beyond the shared Phase 2 API client
- **US5 (P3)**: independent of US2/US3/US4; conceptually follows US4 (reviewing findings before
  reporting on them) but has no code dependency on it

### Parallel Opportunities

- Setup: T002, T003, T004 in parallel; T001 and T005 are sequential (T005 restructures files T001
  also touches indirectly via app naming, keep them in order to avoid merge conflicts)
- Foundational: T009 and T010 in parallel once T006–T008 exist; T011 in parallel with T009/T010
- Once Phase 2 is done: US1, US2, US3, US4, US5 phases can be staffed in parallel by different
  people — only shared file is `src/app/_layout.tsx` (T011, T012, T027 all touch it; sequence
  those three specifically even though their stories run in parallel)
- Within Phase 8: T040, T041, T042 in parallel; T043 and T044 after everything else

---

## Parallel Example: Foundational Phase

```bash
# After T006, T007, T008 are done:
Task: "Implement fetch-based API client in src/services/api/client.ts"
Task: "Define shared TypeScript types in src/services/api/types.ts"
Task: "Wrap app in QueryClientProvider in src/app/_layout.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 — both P1)

1. Phase 1: Setup
2. Phase 2: Foundational (blocks everything)
3. Phase 3: User Story 1 (sign-in/session)
4. Phase 4: User Story 2 (monitoring panel)
5. **STOP and VALIDATE**: run quickstart.md Scenarios 1–2 — this is the MVP demo

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 + US2 → MVP demo (real-time monitoring, signed in)
3. US3 → alerts demo
4. US4 → findings/evidence demo
5. US5 → executive reports demo
6. Polish → security-critical tests + full quickstart pass

## Notes

- [P] tasks touch different files and have no unmet dependency within their phase
- Every task above names its exact file path — none are "TBD"
- Contracts in `contracts/` are proposed/pending backend confirmation (see plan.md); if the real
  backend's shape differs, update `contracts/*.md` first, then the corresponding `use-*` hook —
  do not let implementation drift silently away from the documented contract
- Commit after each task or logical group; stop at any phase checkpoint to validate that story
  independently before moving on
