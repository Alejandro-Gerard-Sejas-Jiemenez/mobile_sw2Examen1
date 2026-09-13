<!--
Sync Impact Report
- Version change: [TEMPLATE] → 1.0.0 (initial ratification)
- Modified principles: n/a (first draft, all 5 slots newly authored)
- Added sections: Core Principles (5), Security & Technical Constraints, Development Workflow, Governance
- Removed sections: none
- Templates requiring follow-up: none outstanding — plan/spec/tasks templates consume this file at
  runtime and do not embed a copy that needs manual sync.
- Deferred TODOs: none. RATIFICATION_DATE set to the date this constitution was authored.
-->

# Mobile Auditor Console Constitution
<!-- Companion mobile app for the security-auditing platform: a read/consult/alert client for auditors and analysts. -->

## Core Principles

### I. Secure Session Lifecycle (Auth)
The app authenticates against the backend with a JWT access token and a **rotating** refresh
token. The access token MUST live only in memory (app auth context/state) and MUST NOT be
persisted to disk in any form, including `AsyncStorage` or persisted state stores. The refresh
token MUST be persisted only via `expo-secure-store`. On every refresh, the newly issued refresh
token MUST overwrite the previous one immediately; the old token MUST NOT be reused as a fallback.
Concurrent requests that trigger a refresh MUST be serialized behind a single in-flight refresh
(mutex/shared promise) to avoid racing the backend's token rotation. A failed refresh MUST force
logout and clear all local session state; it MUST NOT loop or silently retry indefinitely.
**Rationale**: rotating refresh tokens make reuse of an old token a reliable signal of token theft
on the backend side — any client-side workaround that reuses or caches a stale token defeats that
protection and risks mass session invalidation.

### II. Mobile Is a Consult-Only Node (NON-NEGOTIABLE)
The mobile app MUST NOT execute, orchestrate, or embed any offensive testing logic — no headless
browser automation, no prompt-injection or exploit payloads, no AI semantic analysis of targets.
Those responsibilities belong exclusively to the web platform and backend. The mobile app's
functional scope is limited to: authenticated session sync, real-time monitoring of running test
batteries, critical-event alerts, read access to findings/evidence summaries, and generation/export
of executive reports (PDF/Markdown). Any feature request that would add offensive or heavy
processing capability to the mobile client MUST be rejected or redirected to the backend.
**Rationale**: the platform's own architecture assigns heavy/offensive processing to the web and
backend layers by design; collapsing that boundary on a mobile device multiplies the attack surface
of a client that is inherently harder to harden (physical loss, OS-level compromise, less control
over the runtime) than a server.

### III. Backend-Enforced Authorization, Client-Verified Transport
Every request to the backend MUST use HTTPS. No API key, bearer token, or secret MUST be
hardcoded in application source (anything that ends up in the JS bundle is recoverable by an
attacker). Authorization for findings, evidence, and report data MUST be enforced server-side on
every request; the client hiding a screen or action by role is a UX convenience only and MUST NOT
be treated as a security control. Errors surfaced to the UI or sent to crash/analytics tooling
MUST be sanitized — no raw backend stack traces, internal paths, or query fragments. Request/response
logging (including crash reporters) MUST redact tokens, credentials, and finding-level PII.
**Rationale**: this app is a viewer for sensitive security-audit data (confirmed vulnerabilities,
successful injections, impact parameters); leaking any of that through logs, verbose errors, or a
client-only authorization check turns the auditor's own tool into a disclosure vector.

### IV. Trustworthy Critical Alerts (Push)
Registering a device's push token with the backend MUST require an authenticated session; a push
token MUST be disassociated from the user's account on logout. Push payloads for critical/severity
alerts MUST carry only generic, non-sensitive content (e.g. "New critical finding on Project X") —
the actual finding detail is fetched in-app over an authenticated request, never shipped in the
notification body or `data` payload. Any navigation or action triggered by a push payload (deep
link, mark-as-read, etc.) MUST validate its target against a known, whitelisted set of app routes;
the payload is untrusted input, not a trusted instruction.
**Rationale**: push notification content is visible on lock screens and transits OS-level push
services outside the app's control; the "critical vulnerability found" use case is exactly the
scenario most likely to be misused to leak sensitive findings or to spoof navigation if this
boundary is not enforced.

### V. Modular Separation From the Platform
The mobile app is an independently deployable module. It MUST talk to the rest of the platform
(web frontend, backend, database, auxiliary services) exclusively through the documented backend
API contract — no direct database access, no shared runtime state, no duplicated business/security
logic reimplemented on-device. Changes to the API contract MUST be reflected in the mobile client
through that contract, not by the mobile app inferring or reverse-engineering backend behavior.
**Rationale**: mirrors the platform's own module boundaries (Section 4 of the project design) and
keeps the mobile client replaceable/reviewable in isolation, which matters for an app whose only
job is to safely surface security-sensitive data.

## Security & Technical Constraints

- Stack: Expo + TypeScript + Expo Router (`src/app`), as already scaffolded.
- Any locally cached data (monitoring snapshots, findings summaries, generated reports) that
  contains audit/security data MUST be stored only in encrypted storage (`expo-secure-store`) or
  treated as ephemeral (memory-only, cleared on background/logout) — never plain `AsyncStorage`.
- Exported reports (PDF/Markdown) MUST be generated from data fetched over an authenticated
  request at export time, not from a stale unauthenticated cache.
- Dependencies that touch auth, storage, or networking MUST be reviewed against the
  `auth-jwt-securestore`, `api-vulnerabilidades`, and `push-vulnerabilidades` skills before merge.

## Development Workflow

- Feature work follows the Spec Kit SDD cycle: `/speckit-constitution` → `/speckit-specify` →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`, with a review gate after `specify` and
  after `plan` before proceeding.
- Any spec or plan that touches authentication, API access, or push notifications MUST be checked
  against the corresponding principle above (I, III, IV) before moving to `/speckit-tasks`.
- `/speckit-implement` output MUST pass a type-check (`tsc --noEmit`) and `expo-doctor` clean before
  being considered done for a task.

## Governance

This constitution supersedes ad-hoc practices for this project. Amendments are made via
`/speckit-constitution`, MUST update the version per semantic versioning (MAJOR: incompatible
principle removal/redefinition; MINOR: new principle or materially expanded guidance; PATCH:
clarifications/wording), and MUST update `Last Amended`. Any plan or task that conflicts with a
Core Principle MUST either be revised or justified with an explicit, recorded exception before
`/speckit-implement` proceeds — silent deviation is not permitted.

**Version**: 1.0.0 | **Ratified**: 2026-09-12 | **Last Amended**: 2026-09-12
