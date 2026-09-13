# Phase 0 Research: Auditor Mobile Console

All Technical Context items were resolvable with a direct, justified decision rather than left as
`NEEDS CLARIFICATION`; this document records those decisions for traceability, as required before
Phase 1 design.

## Decision: Data fetching & polling — TanStack Query

**Decision**: Use TanStack Query (`@tanstack/react-query`) for all backend reads (monitoring
panel, findings, reports), with `refetchInterval` driving the panel's 30s polling (FR-004) and
`enabled`/`refetchIntervalInBackground: false` to satisfy FR-004a (pause when not visible).

**Rationale**: Polling, caching, retry-on-failure, and "is this data stale" state are exactly what
TanStack Query provides out of the box — building that manually with `useEffect` + `setInterval`
means re-implementing cache invalidation, race-condition handling between overlapping requests,
and background/foreground pause logic that the library already handles. It also gives a built-in
`isStale`/`dataUpdatedAt` signal, which directly implements the spec's "indicate when data is not
current" edge case (FR-015) without extra bookkeeping.

**Alternatives considered**:
- **Plain `useEffect` + `setInterval`**: rejected — no built-in stale/error state, easy to leak
  intervals across screen focus changes, would need custom code for exactly what FR-004a asks for.
- **Redux Toolkit Query**: rejected — pulls in a full Redux store for a client that has no other
  need for global mutable state; TanStack Query alone covers the server-state needs here.
- **SWR**: viable alternative with similar behavior; TanStack Query preferred for its more explicit
  `refetchIntervalInBackground` control, which maps directly to FR-004a.

## Decision: Refresh-token storage — `expo-secure-store` only

**Decision**: Persist only the refresh token, via `expo-secure-store`. Access token stays in a
React context (memory only), never persisted.

**Rationale**: Directly mandated by Constitution Principle I. `expo-secure-store` wraps iOS
Keychain / Android Keystore, which is the appropriate place for a credential that must survive
app restarts; `AsyncStorage` is unencrypted on-disk and explicitly disallowed for this purpose
by [[auth-jwt-securestore]].

**Alternatives considered**:
- **`AsyncStorage`**: rejected outright — unencrypted, violates the constitution.
- **`react-native-mmkv` with encryption**: rejected — adds a native dependency and its own key
  management for no benefit over the already-vetted `expo-secure-store`, which ships with Expo.

## Decision: Refresh concurrency — single in-flight promise (mutex)

**Decision**: Implement a module-level "in-flight refresh promise" in `src/services/auth/`: the
first 401 triggers a refresh call and stores its promise; any concurrent 401 awaits that same
promise instead of calling `/refresh` again; the promise is cleared once settled.

**Rationale**: The backend rotates refresh tokens (invalidates the previous one on use), so two
parallel refresh calls would race and one would always fail. A shared in-flight promise is the
standard fix and needs no external library — it's ~20 lines of code that the whole app's API
client depends on.

**Alternatives considered**:
- **Third-party interceptor library (e.g. `axios-auth-refresh`)**: rejected — plan already avoids
  a full HTTP client library (see below); pulling one in only for its refresh-queue feature isn't
  justified.
- **Optimistic retry without a mutex**: rejected — directly causes the race condition Constitution
  Principle I calls out.

## Decision: HTTP client — thin `fetch` wrapper (no axios)

**Decision**: A small wrapper around the global `fetch`, adding the base URL, auth header
injection, the refresh mutex above, and JSON parsing/error normalization.

**Rationale**: TanStack Query already provides retry, caching, and request de-duplication — the
remaining job for an HTTP layer is just "attach auth header, catch 401, retry once." That doesn't
need axios's feature set (interceptor chains, cancellation tokens duplicate what Query already
offers). Keeping it to `fetch` avoids an extra dependency with no corresponding requirement.

**Alternatives considered**:
- **axios**: viable, commonly used; rejected only to avoid a redundant dependency once TanStack
  Query is in place — revisit if a concrete need for axios-specific features appears during
  implementation.

## Decision: Push notifications — `expo-notifications`

**Decision**: Use `expo-notifications` for permission request, token registration, and payload
handling.

**Rationale**: It's the Expo-managed-workflow-native way to handle push (wraps FCM/APNs) and
integrates with `expo-router` for handling a notification tap's deep link. Directly supports the
constitutional requirement that payloads stay generic ([[push-vulnerabilidades]]) — the app itself
controls what is fetched after the tap, not the payload.

**Alternatives considered**:
- **`@react-native-firebase/messaging` directly**: rejected for the MVP — requires ejecting more
  native configuration than the Expo-managed push service needs; reconsider only if a Firebase
  Console requirement independent of this feature appears.

## Decision: Report export — `expo-print` (PDF) + plain string generation (Markdown) + `expo-sharing`

**Decision**: Generate PDF reports via `expo-print`'s HTML-to-PDF rendering (given a server- or
client-composed HTML template of the report), generate Markdown by templating a string from the
same report data, and hand off either file via `expo-sharing`.

**Rationale**: `expo-print` is the standard Expo-managed way to produce a PDF on-device without
native modules outside the Expo SDK; Markdown needs no library at all. `expo-sharing` covers
FR-013 ("share/hand off a generated report from the device") through the OS share sheet, which
also satisfies "download" in practice on mobile (save-to-Files is one of the share sheet targets).

**Alternatives considered**:
- **Server-side report generation (backend renders the PDF, mobile just downloads it)**: plausible
  and possibly simpler, but the spec describes the mobile app "compiling" the report, and the
  actual report-service contract isn't ours to assume — documented as an open contract question in
  `contracts/reports.md` rather than a blocking unknown, since either approach satisfies the
  spec's user-facing requirements (FR-011–013) identically from the auditor's point of view.

## Decision: Testing — `jest-expo` + `@testing-library/react-native`

**Decision**: Unit-test `src/services/` logic (refresh mutex, api client error handling, push
payload route-whitelist validation) and integration-test key screens with
`@testing-library/react-native` under the `jest-expo` preset.

**Rationale**: This is the standard, zero-extra-native-config testing stack for an Expo-managed
project and directly supports testing the security-sensitive logic (refresh mutex, route
whitelist) called out in the constitution without needing a real device/simulator.

**Alternatives considered**:
- **Detox / Maestro (E2E on-device)**: valuable long-term, deferred — no user story in this spec
  requires cross-app-restart or native-permission-dialog E2E coverage to be considered done; revisit
  once core screens exist.

## Decision: Deep-link route validation — explicit whitelist against Expo Router's typed routes

**Decision**: A notification's `data.route` is only followed if it matches one entry in an
explicit, hand-maintained list of in-app routes (e.g. finding detail, audit detail); anything else
is dropped and the notification instead opens the default findings/alerts screen.

**Rationale**: Directly implements Constitution Principle IV / [[push-vulnerabilidades]] — a push
payload is untrusted input and must not drive arbitrary navigation. `typedRoutes` (already enabled
in `app.json`) gives compile-time checking that the whitelist only references routes that actually
exist.

**Alternatives considered**:
- **Trusting `data.route` directly**: rejected — this is exactly the vulnerability the
  `push-vulnerabilidades` skill calls out.

## Open item for Phase 1 (not blocking)

- The exact backend REST contract (endpoint paths, request/response shapes, error format) is not
  yet documented anywhere accessible to this plan. `contracts/` will therefore describe the
  **expected/proposed** contract from the mobile app's point of view, marked as pending
  confirmation from whoever owns the backend, rather than a verified existing API.
