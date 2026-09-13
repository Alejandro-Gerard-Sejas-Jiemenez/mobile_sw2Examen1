# Contract: Push Notifications (expected — pending backend confirmation)

**Status**: Proposed, same caveat as `auth.md`.

## POST /devices/push-token

**Auth**: required (`Authorization: Bearer <accessToken>`) — Constitution Principle IV: token
registration MUST require an authenticated session.

**Request**:
```json
{ "pushToken": "expo-push-token-string", "platform": "ios" }
```

**Response 204**. Server associates this push token with the current auditor's account.

## DELETE /devices/push-token

**Auth**: required. Called on logout to disassociate the token from the account (Principle IV).

**Response 204**.

## Push payload (server → device, via APNs/FCM through Expo push service)

```json
{ "findingId": "f_123", "severityLabel": "Critical", "route": "finding-detail" }
```

**Rules** (Constitution Principle IV / `push-vulnerabilidades` skill):
- MUST NOT include `summary`, `evidence`, `impactParameters`, or any other finding detail — those
  are fetched in-app via `GET /findings/{findingId}` after the user taps the notification, over an
  authenticated request.
- `route` MUST be one of a fixed whitelist maintained in the mobile client (currently:
  `finding-detail`, `audit-detail`, `alerts-list`). Any other value (or a missing/malformed
  payload) makes the client fall back to opening `alerts-list`.
- The server only sends this notification for `confirmationState: "confirmed"` findings — see
  data-model.md validation rules.

## Route whitelist (client-side, enforced regardless of what the payload claims)

| `route` value | Resolves to |
|---|---|
| `finding-detail` | `src/app/(tabs)/findings/[findingId]` — requires `findingId` present in payload |
| `audit-detail` | `src/app/(tabs)/audits/[auditId]` — requires `auditId` present in payload |
| `alerts-list` | `src/app/(tabs)/alerts` (default fallback) |

Any payload whose `route` is absent, unrecognized, or missing its required id field resolves to
`alerts-list` instead of throwing or silently doing nothing.
