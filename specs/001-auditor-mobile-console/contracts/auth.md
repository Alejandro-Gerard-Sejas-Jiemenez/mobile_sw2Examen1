# Contract: Authentication & Session (expected — pending backend confirmation)

**Status**: Proposed from the mobile app's point of view. The actual backend already exists per
the platform's scope description, but its concrete API is not available to this plan — treat every
endpoint below as the mobile client's expectation, to be confirmed against the real backend during
implementation.

All endpoints: HTTPS only (Constitution Principle III). No endpoint here requires anything beyond
the credentials/tokens described.

## POST /auth/login

**Request**:
```json
{ "email": "string", "password": "string" }
```

**Response 200**:
```json
{
  "accessToken": "jwt-string",
  "accessTokenExpiresAt": "2026-09-12T18:00:00Z",
  "refreshToken": "opaque-or-jwt-string",
  "auditor": { "id": "string", "displayName": "string", "role": "string" }
}
```

**Response 401**: invalid credentials — shown as a generic "invalid email or password" message,
never the raw backend error body (Constitution Principle III).

## POST /auth/refresh

**Request**:
```json
{ "refreshToken": "string" }
```

**Response 200**: same shape as `/auth/login`'s response — **including a new `refreshToken`**
(rotation). The mobile client overwrites its stored refresh token with this new value immediately
(Constitution Principle I) and MUST NOT reuse the request's `refreshToken` value again.

**Response 401**: refresh token invalid, expired, or already rotated. The client treats this as
"session ended" — clears the stored refresh token and access token, and returns the auditor to
sign-in. It MUST NOT retry with the same token.

## POST /auth/logout

**Request**: authenticated (access token in `Authorization: Bearer <token>`); body optionally
includes the push token to disassociate (see `contracts/notifications.md`).

**Response 204**: session and (if provided) push-token association are revoked server-side. The
client clears its access token from memory and its refresh token from `expo-secure-store`
regardless of this call's outcome — logout is client-effective even if the network call fails.

## Concurrency note

If two requests both receive a 401 for an expired access token, the client MUST perform exactly
one `/auth/refresh` call and let both requests retry against its result (see
`research.md` → "Refresh concurrency — single in-flight promise").
