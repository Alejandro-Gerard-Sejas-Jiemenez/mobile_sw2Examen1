// Local mock backend implementing specs/001-auditor-mobile-console/contracts/*.md, so the app
// can be run and clicked through end-to-end before a real backend exists. Not for production use:
// tokens are opaque random strings (not real JWTs), everything is in-memory, and access tokens
// expire quickly on purpose (see ACCESS_TOKEN_TTL_MS) so the app's silent-refresh flow is easy to
// observe during a normal test session instead of waiting a realistic 15+ minutes.
//
// Run: npm run mock-server   (defaults to http://localhost:4000)
// Test accounts: auditor1@example.com / password123 (sees Audit Alpha + Beta)
//                auditor2@example.com / password123 (sees Audit Gamma only)

const crypto = require('crypto');
const cors = require('cors');
const express = require('express');

const { users, audits, findings, alerts } = require('./fixtures');

const PORT = process.env.MOCK_SERVER_PORT || 4000;
const ACCESS_TOKEN_TTL_MS = 60 * 1000; // short on purpose, see header comment
const REPORT_COMPILE_DELAY_MS = 4000;

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[mock-server] ${req.method} ${req.path}`);
  next();
});

/** @type {Map<string, { userId: string, expiresAt: number }>} */
const accessTokens = new Map();
/** @type {Map<string, { userId: string }>} */
const refreshTokens = new Map();
/** @type {Map<string, { auditorId: string, reportId: string, format: string, status: string, downloadUrl?: string }>} */
const reports = new Map();
/** device push tokens, just tracked for visibility/logging */
const pushTokensByUser = new Map();

function issueTokenPair(userId) {
  const accessToken = crypto.randomBytes(24).toString('hex');
  const refreshToken = crypto.randomBytes(24).toString('hex');
  const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString();
  accessTokens.set(accessToken, { userId, expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS });
  refreshTokens.set(refreshToken, { userId });
  return { accessToken, accessTokenExpiresAt, refreshToken };
}

function publicAuditor(user) {
  return { auditorId: user.id, displayName: user.displayName, role: user.role };
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  const entry = token ? accessTokens.get(token) : undefined;

  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  req.userId = entry.userId;
  next();
}

function userFor(req) {
  return users.find((u) => u.id === req.userId);
}

// ---- Auth (contracts/auth.md) ----

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  const tokens = issueTokenPair(user.id);
  res.json({ ...tokens, auditor: publicAuditor(user) });
});

app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  const entry = refreshToken ? refreshTokens.get(refreshToken) : undefined;
  if (!entry) {
    return res.status(401).json({ error: 'invalid_refresh_token' });
  }
  // Rotation: the token just used is immediately invalidated.
  refreshTokens.delete(refreshToken);
  const user = users.find((u) => u.id === entry.userId);
  const tokens = issueTokenPair(entry.userId);
  res.json({ ...tokens, auditor: publicAuditor(user) });
});

app.post('/auth/logout', requireAuth, (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.slice('Bearer '.length);
  accessTokens.delete(token);
  pushTokensByUser.delete(req.userId);
  res.status(204).end();
});

// ---- Monitoring & findings (contracts/monitoring.md) ----

app.get('/audits', requireAuth, (req, res) => {
  const user = userFor(req);
  const visible = Object.values(audits).filter((a) => user.auditIds.includes(a.id));
  res.json({ audits: visible });
});

app.get('/audits/:auditId/findings', requireAuth, (req, res) => {
  const user = userFor(req);
  if (!user.auditIds.includes(req.params.auditId)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const list = Object.values(findings)
    .filter((f) => f.auditId === req.params.auditId)
    .map(({ evidence, impactParameters, ...summary }) => summary);
  res.json({ findings: list });
});

app.get('/findings/:findingId', requireAuth, (req, res) => {
  const user = userFor(req);
  const finding = findings[req.params.findingId];
  if (!finding) {
    return res.status(404).json({ error: 'not_found' });
  }
  if (!user.auditIds.includes(finding.auditId)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  res.json(finding);
});

app.get('/audits/:auditId/report/preview', requireAuth, (req, res) => {
  const user = userFor(req);
  if (!user.auditIds.includes(req.params.auditId)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const format = req.query.format === 'markdown' ? 'markdown' : 'pdf';
  const audit = audits[req.params.auditId];
  const auditFindings = Object.values(findings).filter((f) => f.auditId === audit.id);

  if (format === 'markdown') {
    const lines = [
      `# Executive Report — ${audit.name}`,
      '',
      `Status: ${audit.status}`,
      '',
      '## Findings',
      ...auditFindings.map((f) => `- **${f.severity.toUpperCase()}** (${f.confirmationState}): ${f.summary}`),
    ];
    return res.type('text/markdown').send(lines.join('\n'));
  }

  res.type('text/html').send(
    `<h1>Executive Report — ${audit.name}</h1><p>Status: ${audit.status}</p><ul>${auditFindings
      .map((f) => `<li><b>${f.severity.toUpperCase()}</b> (${f.confirmationState}): ${f.summary}</li>`)
      .join('')}</ul>`,
  );
});

app.post('/audits/:auditId/report', requireAuth, (req, res) => {
  const user = userFor(req);
  if (!user.auditIds.includes(req.params.auditId)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const format = req.body?.format === 'markdown' ? 'markdown' : 'pdf';
  const reportId = crypto.randomBytes(8).toString('hex');
  reports.set(reportId, { auditorId: user.id, reportId, format, status: 'compiling' });

  setTimeout(() => {
    const report = reports.get(reportId);
    if (report) {
      report.status = 'ready';
      report.downloadUrl = `http://localhost:${PORT}/audits/${req.params.auditId}/report/preview?format=${format}`;
    }
  }, REPORT_COMPILE_DELAY_MS);

  res.status(202).json({ reportId, status: 'compiling' });
});

app.get('/reports/:reportId', requireAuth, (req, res) => {
  const report = reports.get(req.params.reportId);
  if (!report || report.auditorId !== req.userId) {
    return res.status(404).json({ error: 'not_found' });
  }
  res.json(report);
});

// ---- Push notifications (contracts/notifications.md) ----

app.post('/devices/push-token', requireAuth, (req, res) => {
  pushTokensByUser.set(req.userId, req.body?.pushToken);
  console.log(`[mock-server] registered push token for ${req.userId}: ${req.body?.pushToken}`);
  res.status(204).end();
});

app.delete('/devices/push-token', requireAuth, (req, res) => {
  pushTokensByUser.delete(req.userId);
  res.status(204).end();
});

// ---- Simulated "live" progress on Audit Alpha's running test battery ----

setInterval(() => {
  const alpha = audits.a1;
  const runningBattery = alpha.testBatteries.find((b) => b.status === 'running');
  if (!runningBattery) return;

  runningBattery.progressPercent = Math.min(100, runningBattery.progressPercent + Math.ceil(Math.random() * 5));
  alpha.metrics.requestsSent += Math.ceil(Math.random() * 20);
  if (Math.random() < 0.3) alpha.metrics.pagesScanned += 1;

  if (runningBattery.progressPercent >= 100) {
    runningBattery.status = 'completed';
    const stillActive = alpha.testBatteries.some((b) => b.status === 'running' || b.status === 'queued');
    if (!stillActive) {
      alpha.status = 'completed';
      alpha.completedAt = new Date().toISOString();
    }
  }
}, 5000);

app.listen(PORT, () => {
  console.log(`[mock-server] listening on http://localhost:${PORT}`);
  console.log('[mock-server] test accounts:');
  console.log('  auditor1@example.com / password123  (Audit Alpha + Beta)');
  console.log('  auditor2@example.com / password123  (Audit Gamma)');
});
