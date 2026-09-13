# Phase 1 Data Model: Auditor Mobile Console

Entities as consumed/displayed by the mobile client (not the backend's internal schema — the
backend is the source of truth; these are the shapes this app reads and, where noted, never
persists to disk).

## AuditorSession (in-memory only — Constitution Principle I)

| Field | Type | Notes |
|---|---|---|
| accessToken | string (JWT) | Memory only. Never persisted. Cleared on logout or refresh failure. |
| accessTokenExpiresAt | ISO datetime | Drives proactive refresh before expiry. |
| auditorId | string | From decoded/validated token or `/me` response. |
| displayName | string | For UI (e.g. header). |
| role | string | Informational only — **never** used as the sole gate for what data is shown; server enforces authorization (Principle III). |

Persisted separately: `refreshToken` (string) — the only field written to disk, via
`expo-secure-store`, keyed under a single fixed key (e.g. `auth.refreshToken`). Rotated on every
use; old value overwritten atomically with the new one from the refresh response.

**State transitions**: `signedOut → signingIn → signedIn → (refreshing) → signedIn` or
`→ signedOut` (on refresh failure / explicit sign-out / server-side revocation detected via 401
after a refresh attempt).

## Audit

| Field | Type | Notes |
|---|---|---|
| id | string | |
| name | string | |
| status | enum: `running` \| `completed` \| `paused` | Drives monitoring panel grouping. |
| startedAt | ISO datetime | |
| completedAt | ISO datetime \| null | |
| testBatteries | TestBattery[] | |
| metrics | AuditMetrics | Execution metrics for the panel (e.g. requests sent, pages scanned — exact fields pending backend contract, see `contracts/monitoring.md`). |

## TestBattery

| Field | Type | Notes |
|---|---|---|
| id | string | |
| auditId | string | FK to Audit |
| name | string | |
| status | enum: `queued` \| `running` \| `completed` \| `failed` | |
| progressPercent | number (0–100) | |

## Finding

| Field | Type | Notes |
|---|---|---|
| id | string | |
| auditId | string | FK to Audit |
| type | enum: `injection` \| `anomaly` \| `other` | Matches spec language ("successful injections, anomalies"). |
| severity | enum: `critical` \| `high` \| `medium` \| `low` | Backend-classified; mobile never recalculates (spec Assumptions). |
| confirmationState | enum: `confirmed` \| `preliminary` | Drives FR-010's visual distinction. |
| summary | string | Short description for list/triage view (FR-008). |
| evidence | string \| structured object | Full evidence shown in detail view (FR-009); exact shape pending backend contract. |
| impactParameters | Record<string, string \| number> | Free-form key/value impact data, rendered generically in the UI. |
| reclassifiedAt | ISO datetime \| null | Set if severity/confirmation changed after initial confirmation (Edge Cases: reclassification). |

## Alert

| Field | Type | Notes |
|---|---|---|
| id | string | |
| findingId | string | FK to Finding — tapping the alert opens this finding (FR-007). |
| severityLabel | string | Generic label only (e.g. "Critical"), no finding detail — Constitution Principle IV. |
| deliveredAt | ISO datetime | |
| readState | enum: `unread` \| `read` | |

**Push payload shape** (what actually arrives over APNs/FCM — deliberately minimal):

```json
{ "findingId": "f_123", "severityLabel": "Critical", "route": "finding-detail" }
```

`route` MUST be one of the whitelisted route keys (see `contracts/notifications.md`); anything
else is ignored and the app opens the default alerts list instead.

## ExecutiveReport

| Field | Type | Notes |
|---|---|---|
| id | string | Assigned once compiled (may be client-generated for an in-progress preview). |
| auditId | string | FK to Audit |
| format | enum: `pdf` \| `markdown` | |
| generatedAt | ISO datetime | |
| status | enum: `previewing` \| `compiling` \| `ready` \| `failed` | `compiling` state satisfies the Edge Case requirement to show progress feedback for large finding sets. |
| fileUri | string \| null | Local URI once `ready`, handed to `expo-sharing`. |

## Relationships

```
Audit 1──* TestBattery
Audit 1──* Finding
Finding 1──0..1 Alert
Audit 1──* ExecutiveReport
```

## Validation rules derived from requirements

- A `Finding` with `confirmationState: "preliminary"` MUST NOT trigger an `Alert` (FR-005 only
  fires for confirmed vulnerabilities / critical-severity events).
- An `Alert`'s `route` MUST be checked against the whitelist before navigation (FR-006, Principle
  IV) — invalid/unknown routes are dropped, not followed.
- `AuditorSession.accessToken` MUST NOT appear in any object written to `expo-secure-store`, logs,
  or crash reports (Principle I, III).
- `ExecutiveReport` generation MUST read `Finding`/`Audit` data via an authenticated request made
  at generation time, not from a stale cached copy older than the current TanStack Query cache
  policy (spec Assumptions: reports reflect current permission-scoped data).
