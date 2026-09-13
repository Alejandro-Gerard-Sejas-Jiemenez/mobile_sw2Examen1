# Feature Specification: Auditor Mobile Console

**Feature Branch**: `001-auditor-mobile-console`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Mobile companion app for a security-auditing platform, aimed at
an auditor/analyst in the field. Acts as a complementary monitoring viewer and report
generator/consultant. Scope: (1) secure authentication and session sync via JWT tokens linked
to the main backend, (2) real-time monitoring panel showing status of ongoing audits, active
test batteries, and execution metrics, (3) instant alerts for confirmed vulnerabilities or
critical-severity events detected by the web scanning engine, (4) summarized review of
successful injections, identified anomalies, and impact parameters without needing the desktop
console, (5) an executive report module to preview, compile, and download reports in PDF or
Markdown for delivery to stakeholders. The mobile app is a separate module from the web
frontend, backend, database, and auxiliary services; heavy/offensive processing (headless
browser testing, prompt injection, AI semantic analysis) stays on the web platform and backend
— the phone is strictly a consultation, alerting, and reporting node."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In and Stay in Sync (Priority: P1)

An auditor opens the app in the field and signs in with the same credentials they use on the
platform. Once signed in, the app keeps their session valid in the background for as long as
they are actively using it, without asking them to re-enter credentials every time they reopen
the app during a normal work session.

**Why this priority**: Every other capability in this app requires an authenticated, trusted
session. Without reliable sign-in and session continuity, no other user story is reachable.

**Independent Test**: Can be fully tested by signing in with valid platform credentials, using
the app across multiple screens and app backgrounding/foregrounding cycles, and confirming the
session remains valid without unexpected sign-outs; and by confirming that invalid credentials
or an expired/revoked session are rejected and the user is returned to sign-in.

**Acceptance Scenarios**:

1. **Given** an auditor has valid platform credentials, **When** they sign in on the mobile app,
   **Then** they reach the monitoring panel and their identity/role is recognized the same way it
   is on the web platform.
2. **Given** an auditor is signed in and has been using the app for an extended period, **When**
   their session token nears expiration, **Then** the app renews the session transparently and
   the auditor is not interrupted or asked to sign in again.
3. **Given** an auditor's session or account access has been revoked on the platform, **When**
   the app attempts to renew or use that session, **Then** the auditor is signed out and returned
   to the sign-in screen.
4. **Given** an auditor signs out, **When** the app finishes signing them out, **Then** no further
   audit data, findings, or alerts for that account are accessible or delivered to that device
   until someone signs in again.

---

### User Story 2 - Monitor Audits in Real Time (Priority: P1)

An auditor wants to check, from anywhere, how an in-progress audit is going: which test
batteries are running, how far along they are, and key execution metrics — without opening a
laptop.

**Why this priority**: Real-time visibility into running audits is the core reason this app
exists as a "complementary viewer" — it is the primary value proposition alongside alerts.

**Independent Test**: Can be fully tested by starting/observing an audit on the platform and
confirming the mobile monitoring panel reflects the same in-progress state, progress, and
metrics, updating as the audit progresses.

**Acceptance Scenarios**:

1. **Given** one or more audits are currently running, **When** the auditor opens the monitoring
   panel, **Then** they see each audit's status, the test batteries currently active, and their
   progress and execution metrics.
2. **Given** an audit's status or progress changes while the auditor has the panel open, **When**
   the change happens on the platform, **Then** the panel picks up the updated state on its next
   automatic refresh, without the auditor needing to manually reload.
3. **Given** no audits are currently running, **When** the auditor opens the monitoring panel,
   **Then** they see a clear indication that nothing is active rather than an empty or broken
   screen.

---

### User Story 3 - Get Notified of Critical Findings (Priority: P2)

An auditor wants to be alerted immediately when the platform confirms a vulnerability or detects
a critical-severity event, so they can react without having to keep the app open and watching.

**Why this priority**: Timely awareness of critical findings is explicitly called out as a
standalone capability; it delivers value even for an auditor who is not actively monitoring the
app at that moment, but depends on sign-in (Story 1) to know who to alert.

**Independent Test**: Can be fully tested by triggering a confirmed critical finding on the
platform while the app is closed or backgrounded, and confirming the auditor receives an alert
on the device that leads them to that finding.

**Acceptance Scenarios**:

1. **Given** the platform confirms a vulnerability or critical-severity event, **When** the
   auditor is a legitimate recipient for that audit, **Then** they receive an alert on their
   device shortly after the event is confirmed.
2. **Given** an auditor taps a critical-finding alert, **When** the app opens, **Then** they are
   taken directly to that finding's summary.
3. **Given** an auditor has signed out or revoked the app's access, **When** a critical finding is
   later confirmed, **Then** that device no longer receives alerts for that account.
4. **Given** multiple critical findings are confirmed in quick succession, **When** alerts are
   delivered, **Then** each finding is still individually identifiable and reviewable — none are
   silently dropped or merged in a way that hides a distinct finding.

---

### User Story 4 - Review Findings and Evidence on the Go (Priority: P2)

An auditor wants to review, in summarized form, the successful injections, identified anomalies,
and impact parameters for an audit — enough detail to understand and act on a finding without
needing the desktop console.

**Why this priority**: This turns an alert or a monitoring glance into something actionable; it
is the natural next step after Stories 2 and 3 and is required for the app to be useful as a
"consultation" tool, not just a notifier.

**Independent Test**: Can be fully tested by confirming findings exist on the platform for a
given audit and verifying the auditor can locate, open, and read an accurate, summarized view of
each finding's evidence and impact on the mobile app.

**Acceptance Scenarios**:

1. **Given** an audit has one or more findings, **When** the auditor opens that audit from the
   monitoring panel or from an alert, **Then** they see a list of findings with enough summary
   information (type, severity, short description) to triage at a glance.
2. **Given** the auditor selects a specific finding, **When** its detail view opens, **Then** they
   see the confirmed evidence, anomaly details, and impact parameters for that finding.
3. **Given** an audit is still in progress, **When** the auditor views its findings, **Then** the
   app clearly distinguishes confirmed findings from anything still preliminary or unconfirmed.

---

### User Story 5 - Generate an Executive Report (Priority: P3)

An auditor wants to preview, compile, and download an executive report for an audit directly
from their phone, so they can hand it to a stakeholder without returning to a desk.

**Why this priority**: Valuable and explicitly in scope, but it depends on findings already being
reviewable (Story 4) and is the least time-sensitive of the five capabilities — it is a
deliverable step, not a real-time need.

**Independent Test**: Can be fully tested by selecting a completed (or in-progress) audit,
generating a report, previewing it, and confirming a downloadable PDF or Markdown file is
produced that matches the audit's findings.

**Acceptance Scenarios**:

1. **Given** an audit with reviewable findings, **When** the auditor requests an executive report
   for it, **Then** they can preview the report's content before finalizing it.
2. **Given** the auditor is previewing a report, **When** they choose to compile it, **Then** they
   can download it in either PDF or Markdown format.
3. **Given** a report has been generated, **When** the auditor wants to share it with a
   stakeholder, **Then** the app provides a way to hand off that file from the device.

---

### Edge Cases

- What happens when the auditor loses network connectivity while viewing the monitoring panel or
  a finding? The app MUST show the last known state clearly marked as not current, rather than a
  blank screen or stale data presented as live.
- What happens when an audit or finding the auditor is viewing is deleted or becomes inaccessible
  (e.g., permissions changed) while they are looking at it? The app MUST inform the auditor rather
  than continuing to display now-invalid data.
- How does the system handle a critical alert arriving for an audit the signed-in auditor does not
  have permission to view? That alert MUST NOT be delivered to that auditor's device.
- What happens if report generation is requested for an audit with a very large number of
  findings? The auditor MUST receive feedback that generation is in progress rather than an app
  that appears frozen.
- What happens when the same critical finding is confirmed and then later reclassified (e.g.,
  downgraded or marked false-positive) on the platform? The mobile view of that finding MUST
  reflect the updated status, and it MUST NOT continue to imply the original severity indefinitely.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let an auditor authenticate using the same credentials/identity
  used on the security-auditing platform, via session tokens (JWT) linked to the main backend.
- **FR-002**: The system MUST keep an authenticated auditor's session valid for the duration of
  active use without requiring repeated manual sign-in, and MUST end the session (sign the
  auditor out) when the session is expired, revoked, or invalid.
- **FR-003**: The system MUST display a monitoring panel showing the status of currently running
  audits, their active test batteries, progress, and execution metrics.
- **FR-004**: The monitoring panel MUST refresh audit/test-battery status automatically on a
  regular polling interval while it is open, without the auditor needing to manually reload or
  reinstall the app.
- **FR-004a**: The system MUST stop polling for monitoring updates when the panel is not visible
  (app backgrounded or a different screen open), and MUST resume polling when the panel becomes
  visible again.
- **FR-005**: The system MUST send the signed-in auditor an alert when the platform confirms a
  vulnerability or detects a critical-severity event, for audits that auditor has permission to
  view.
- **FR-006**: The system MUST NOT deliver an alert, finding, or report for an audit to an auditor
  who does not have permission to view that audit.
- **FR-007**: The system MUST let an auditor open a specific finding directly from its alert.
- **FR-008**: The system MUST let an auditor browse an audit's findings, and view for each finding
  a summary (type, severity, short description) sufficient to triage without opening full detail.
- **FR-009**: The system MUST let an auditor open a finding's full detail, including confirmed
  evidence, identified anomalies, and impact parameters.
- **FR-010**: The system MUST visually distinguish confirmed findings from preliminary/unconfirmed
  results for audits still in progress.
- **FR-011**: The system MUST let an auditor preview an executive report for an audit before
  finalizing it.
- **FR-012**: The system MUST let an auditor compile and download an executive report in PDF or
  Markdown format.
- **FR-013**: The system MUST let an auditor share/hand off a generated report from the device.
- **FR-014**: The system MUST treat the mobile app strictly as a consultation, monitoring, and
  reporting client — it MUST NOT perform or trigger offensive testing, scanning, or AI-driven
  analysis itself; all such processing remains on the web platform and backend.
- **FR-015**: The system MUST indicate to the auditor when displayed data (monitoring status,
  findings) is not current due to lost connectivity, rather than presenting stale data as live.
- **FR-016**: The system MUST stop delivering alerts, and MUST revoke access to audits, findings,
  and reports for a device/account combination once that auditor signs out or their access is
  revoked.

### Key Entities

- **Auditor Account**: The signed-in user; represents an auditor/analyst with credentials and
  permission to view a defined set of audits.
- **Audit**: A security assessment run tracked by the platform; has a status (e.g., running,
  completed), a set of test batteries, and execution metrics.
- **Test Battery**: A group of tests executed as part of an audit; has progress and status,
  reported within an audit's monitoring data.
- **Finding**: A confirmed or preliminary result surfaced by an audit (e.g., a successful
  injection or identified anomaly), with a severity, confirmation state, summary, evidence, and
  impact parameters.
- **Alert**: A notification tied to a specific finding or critical event, delivered to auditors
  permitted to view the related audit.
- **Executive Report**: A compiled, downloadable/shareable document (PDF or Markdown) summarizing
  an audit's findings for stakeholders.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An auditor can view the current status of all audits they have access to within 5
  seconds of opening the app on a normal mobile network connection.
- **SC-002**: An auditor receives an alert for a newly confirmed critical finding within 1 minute
  of it being confirmed on the platform, at least 95% of the time.
- **SC-003**: From a critical-finding alert, an auditor can reach that finding's full evidence and
  impact detail in 2 taps or fewer.
- **SC-004**: An auditor can preview, compile, and download an executive report for a completed
  audit in under 2 minutes end-to-end.
- **SC-005**: Findings and evidence shown on the mobile app match the corresponding data on the
  web platform with no discrepancies, verified across a sample of completed audits.
- **SC-005a**: While the monitoring panel is open, the status shown for a running audit is never
  more than one polling interval (default: 30 seconds) out of date.
- **SC-006**: An auditor whose access to an audit is revoked stops receiving alerts and can no
  longer view that audit's findings within 1 minute of the revocation.

## Assumptions

- Auditors already have existing accounts and role-based access on the security-auditing
  platform; the mobile app authenticates against that same identity system rather than
  introducing a separate account model.
- The web platform and backend are the source of truth for audits, test batteries, findings, and
  severity classification; the mobile app consumes and displays this data but never originates or
  recalculates it.
- Auditors use the app on personal or company-issued mobile devices with intermittent network
  connectivity (not guaranteed to be always online), which is why explicit "stale data" and
  offline-awareness behavior is in scope.
- "Critical-severity" and "confirmed" are classifications already produced by the platform's
  scanning engine; the mobile app does not define or re-derive severity, only displays it.
- Report generation is scoped to audits the auditor already has permission to view; report content
  is derived from the same findings data available in the app's review screens.
- The monitoring panel refreshes via automatic polling (not push/websocket) at a default interval
  of 30 seconds while the panel is visible; this interval is a starting default, not a fixed
  requirement, and may be tuned during planning.
- **The official mobile functional scope (the source platform design document, section on the
  mobile app) is still evolving.** This spec reflects the scope as described so far and MUST be
  revisited/amended via `/speckit-specify` (or a follow-up clarification pass) whenever that
  source document changes, rather than being treated as fixed once `/speckit-plan` starts.
