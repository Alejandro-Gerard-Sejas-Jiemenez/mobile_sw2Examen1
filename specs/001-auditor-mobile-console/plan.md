# Implementation Plan: Auditor Mobile Console

**Branch**: `001-auditor-mobile-console` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-auditor-mobile-console/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

A read/consult-only Expo mobile client for auditors: authenticate against the existing platform
backend (JWT, rotating refresh), poll a monitoring panel for running audits/test batteries, receive
push alerts for confirmed critical findings, browse findings/evidence, and generate/export
executive reports (PDF/Markdown). No offensive-testing or AI-analysis logic lives on-device; the
app only calls the backend's existing REST API.

## Technical Context

**Language/Version**: TypeScript ~6.0 (per `tsconfig.json`), React 19.2, React Native 0.86 (Expo SDK 57, already scaffolded)

**Primary Dependencies**: Expo Router (navigation, already scaffolded), `expo-secure-store` (refresh
token persistence), `expo-notifications` (push registration/handling), TanStack Query (polling,
request caching/retry for the monitoring panel and findings), a thin `fetch`-based API client
(no heavy HTTP library needed given TanStack Query already handles caching/retry)

**Storage**: No local database. `expo-secure-store` for the refresh token only; all other
audit/finding/report data is memory-only (TanStack Query cache), never written to disk, per
Constitution Principle I and the Security & Technical Constraints section.

**Testing**: Jest + `jest-expo` preset, `@testing-library/react-native` for component/hook tests.
End-to-end device testing (e.g., Detox/Maestro) is out of scope for this plan — revisit if the
project needs it once core screens exist.

**Target Platform**: iOS 15+ and Android 8+ (API 26+) via Expo managed workflow; web output is
already configured (`app.json` → `web.output: static`) but is a secondary target — the monitoring
console is designed mobile-first.

**Project Type**: Mobile app (single Expo project). The backend (auth, audits, findings, reports
API) already exists as part of the wider platform and is out of scope for this repo — this plan
only covers the mobile client and its expected contract with that backend.

**Performance Goals**: Monitoring panel initial render ≤ 5s on a normal mobile connection (SC-001);
monitoring data never more than one polling interval (default 30s) stale while the panel is open
(SC-005a); critical alert delivered within 1 minute of confirmation ≥ 95% of the time (SC-002).

**Constraints**: Access token in memory only, refresh token in `expo-secure-store`, single
in-flight refresh (mutex) per Constitution Principle I; HTTPS-only backend calls, no hardcoded
secrets, server-enforced authorization per Principle III; push token registration requires an
authenticated session and generic (non-sensitive) payload content per Principle IV; app performs
no offensive-testing/AI-analysis work per Principle II; offline/stale state must be visibly
indicated (spec Edge Cases).

**Scale/Scope**: 5 user stories (P1×2, P2×2, P3×1) from the spec; scoped to a field-auditor
audience of a security-auditing platform (not a consumer-scale app) — concurrent-user scaling is
the backend's concern, not this client's.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Secure Session Lifecycle | Access token in memory only; refresh token only in `expo-secure-store`; refresh calls serialized (mutex); forced logout on refresh failure | **PASS** — design in Technical Context/data-model follows this; no plain `AsyncStorage` use for tokens anywhere in this plan |
| II. Mobile Is a Consult-Only Node | No offensive-testing, headless-browser, prompt-injection, or AI-analysis logic added on-device | **PASS** — scope is limited to auth, polling reads, push handling, and report rendering/export; verified against all 5 user stories |
| III. Backend-Enforced Authorization, Client-Verified Transport | HTTPS-only API calls; no hardcoded secrets/keys; server does authorization; errors sanitized before reaching UI/logs | **PASS** — contracts (Phase 1) will mark all endpoints HTTPS-only and require the access token; no client-side-only role gating planned |
| IV. Trustworthy Critical Alerts | Push token registration requires auth session and is revoked on logout; payload content generic; deep links validated against a route whitelist | **PASS** — data-model/contracts will define a minimal push payload (finding id + severity label only) and a fixed, whitelisted set of in-app routes for notification taps |
| V. Modular Separation From the Platform | No direct DB access; mobile talks to the platform only via the documented backend API contract | **PASS** — no database dependency introduced; `contracts/` documents the expected REST surface as the only integration point |

No violations requiring an exception — Complexity Tracking is left empty.

**Post-Phase-1 re-check**: `data-model.md` and `contracts/` were reviewed against the same five
gates after design — the refresh-token rotation flow, generic push payload, and route whitelist
all landed in the design as required, and no new dependency or structural choice introduces a
violation. Gates remain **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/                      # Expo Router routes (already scaffolded: _layout.tsx, index.tsx, explore.tsx)
│   ├── (auth)/                # sign-in screen(s), outside the authenticated tab group
│   └── (tabs)/                 # authenticated area: monitoring panel, findings, reports
├── components/                # shared UI components (already has themed-text, themed-view, ui/)
├── constants/                  # theme.ts (existing) + app-wide constants
├── hooks/                       # use-color-scheme.ts (existing) + feature hooks (e.g. use-auth, use-audits)
├── services/                    # NEW: api client, auth/session manager, push registration
│   ├── api/                     # fetch wrapper, endpoint functions per contracts/
│   ├── auth/                    # session context, token refresh mutex, SecureStore access
│   └── notifications/           # expo-notifications registration + payload handling
└── global.css                   # existing

tests/
├── unit/                        # services/ logic: auth refresh mutex, api client, push payload validation
└── integration/                 # screen-level tests with @testing-library/react-native
```

**Structure Decision**: Single Expo project (no separate `backend/`/`frontend/` split — the
backend already exists outside this repo). New feature code lives under `src/services/` alongside
the already-scaffolded `src/app/`, `src/components/`, `src/hooks/`. Route groups `(auth)` and
`(tabs)` under `src/app/` map directly to Story 1 (sign-in) and Stories 2–5 (authenticated
monitoring/findings/alerts/reports) respectively.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
