// In-memory seed data for the mock backend. Matches specs/001-auditor-mobile-console/data-model.md
// and contracts/*.md. Nothing here is persisted — restarting the server resets everything.

const users = [
  {
    id: 'u1',
    email: 'auditor1@example.com',
    password: 'password123',
    displayName: 'Ana Auditora',
    role: 'auditor',
    auditIds: ['a1', 'a2'],
  },
  {
    id: 'u2',
    email: 'auditor2@example.com',
    password: 'password123',
    displayName: 'Beto Analista',
    role: 'auditor',
    auditIds: ['a3'],
  },
];

const audits = {
  a1: {
    id: 'a1',
    name: 'Audit Alpha — Public API',
    status: 'running',
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    completedAt: null,
    testBatteries: [
      { id: 'tb1', auditId: 'a1', name: 'Injection sweep', status: 'running', progressPercent: 42 },
      { id: 'tb2', auditId: 'a1', name: 'Auth bypass checks', status: 'completed', progressPercent: 100 },
    ],
    metrics: { requestsSent: 1284, pagesScanned: 37 },
  },
  a2: {
    id: 'a2',
    name: 'Audit Beta — Admin Panel',
    status: 'completed',
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    testBatteries: [
      { id: 'tb3', auditId: 'a2', name: 'Full sweep', status: 'completed', progressPercent: 100 },
    ],
    metrics: { requestsSent: 5310, pagesScanned: 122 },
  },
  a3: {
    id: 'a3',
    name: 'Audit Gamma — Mobile Backend',
    status: 'paused',
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completedAt: null,
    testBatteries: [
      { id: 'tb4', auditId: 'a3', name: 'Injection sweep', status: 'queued', progressPercent: 0 },
    ],
    metrics: { requestsSent: 12, pagesScanned: 1 },
  },
};

const findings = {
  f1: {
    id: 'f1',
    auditId: 'a1',
    type: 'injection',
    severity: 'critical',
    confirmationState: 'confirmed',
    summary: 'SQL injection in /search?q= parameter',
    evidence: "Payload ' OR '1'='1 returned all rows; response time delta confirms blind injection.",
    impactParameters: { affectedTable: 'users', rowsExposed: 4200 },
    reclassifiedAt: null,
  },
  f2: {
    id: 'f2',
    auditId: 'a1',
    type: 'anomaly',
    severity: 'medium',
    confirmationState: 'preliminary',
    summary: 'Unusual response time on /export endpoint',
    evidence: 'p95 latency 8x baseline under repeated requests; not yet confirmed as exploitable.',
    impactParameters: { p95LatencyMs: 4200 },
    reclassifiedAt: null,
  },
  f3: {
    id: 'f3',
    auditId: 'a2',
    type: 'injection',
    severity: 'high',
    confirmationState: 'confirmed',
    summary: 'Stored XSS in admin comment field',
    evidence: '<script>document.location=...</script> persisted and executed on admin dashboard load.',
    impactParameters: { affectedRoute: '/admin/comments' },
    reclassifiedAt: null,
  },
};

// findingId -> alert, only for confirmed findings (per validation rule in data-model.md)
const alerts = {
  al1: {
    id: 'al1',
    findingId: 'f1',
    severityLabel: 'Critical',
    deliveredAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    readState: 'unread',
  },
};

module.exports = { users, audits, findings, alerts };
