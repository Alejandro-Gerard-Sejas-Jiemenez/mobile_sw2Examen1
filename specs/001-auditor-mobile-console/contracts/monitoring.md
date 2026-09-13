# Contract: Monitoring & Findings (expected — pending backend confirmation)

**Status**: Proposed, same caveat as `auth.md` — confirm against the real backend during
implementation.

All endpoints require `Authorization: Bearer <accessToken>`. All authorization (which audits a
given auditor may see) is enforced server-side (Constitution Principle III) — the client never
decides this on its own.

## GET /audits?status=running,completed,paused

**Response 200**:
```json
{
  "audits": [
    {
      "id": "string",
      "name": "string",
      "status": "running",
      "startedAt": "2026-09-12T10:00:00Z",
      "completedAt": null,
      "testBatteries": [
        { "id": "string", "name": "string", "status": "running", "progressPercent": 42 }
      ],
      "metrics": { "requestsSent": 0, "pagesScanned": 0 }
    }
  ]
}
```

Polled by the mobile client every 30s while the monitoring panel is visible (FR-004); paused while
backgrounded (FR-004a). Empty `audits` array is a valid response (spec: "no audits running" state).

## GET /audits/{auditId}/findings

**Response 200**:
```json
{
  "findings": [
    {
      "id": "string",
      "auditId": "string",
      "type": "injection",
      "severity": "critical",
      "confirmationState": "confirmed",
      "summary": "string",
      "reclassifiedAt": null
    }
  ]
}
```

List view only — enough for FR-008's triage list. Full evidence is a separate call to avoid
shipping large evidence payloads for a list the auditor is just scanning.

## GET /findings/{findingId}

**Response 200**:
```json
{
  "id": "string",
  "auditId": "string",
  "type": "injection",
  "severity": "critical",
  "confirmationState": "confirmed",
  "summary": "string",
  "evidence": "string or structured object — exact shape TBD with backend owner",
  "impactParameters": { "key": "value" },
  "reclassifiedAt": null
}
```

**Response 403/404**: auditor lacks permission, or the finding no longer exists/is inaccessible —
the client shows an explicit "no longer available" message rather than continuing to display
previously-cached data (spec Edge Cases).

## GET /audits/{auditId}/report/preview?format=pdf|markdown

**Response 200**: a preview representation (HTML for `pdf`, raw markdown string for `markdown`)
of the report the client would compile, without persisting a report record yet (FR-011).

## POST /audits/{auditId}/report

**Request**:
```json
{ "format": "pdf" }
```

**Response 202** (compiling — large finding sets may take time; client shows a "compiling" state
per the Edge Cases requirement):
```json
{ "reportId": "string", "status": "compiling" }
```

## GET /reports/{reportId}

**Response 200** once ready:
```json
{ "reportId": "string", "status": "ready", "downloadUrl": "https://.../report.pdf" }
```

Client downloads `downloadUrl` over HTTPS, then hands the local file to `expo-sharing` (FR-013).
