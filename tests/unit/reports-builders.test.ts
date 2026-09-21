import { buildHtmlReport, stripHtml } from '../../src/services/reports/html-report-builder';
import { buildMarkdownReport } from '../../src/services/reports/markdown-report-builder';
import { generateReportMarkdown } from '../../src/services/reports/generate-markdown';
import { generateReportPdf } from '../../src/services/reports/generate-pdf';
import { getHtmlReportStyles } from '../../src/services/reports/html-report.styles';
import { ReportError } from '../../src/errors/report-error';
import {
  FINDING_CONFIRMATION_STATES,
  FINDING_SEVERITIES,
  FINDING_TYPES,
} from '../../src/constants/risk.constants';
import type { Audit, Finding } from '../../src/services/api/types';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64',
  },
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn().mockResolvedValue('{}'),
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({
    uri: 'file:///mock/cache/print.pdf',
    base64: 'bW9ja1BkZkJhc2U2NA==',
  }),
}));

describe('Reports Domain Builders & Generators', () => {
  const mockAudit: Audit = {
    id: 'aud-test-1',
    name: 'LLM Banking Assistant Audit',
    status: 'completed',
    startedAt: '2026-03-01T10:00:00.000Z',
    completedAt: '2026-03-01T10:30:00.000Z',
    metrics: { requestsSent: 100, pagesScanned: 5 },
    testBatteries: [],
  };

  const mockFindings: Finding[] = [
    {
      id: 'f-1',
      auditId: 'aud-test-1',
      severity: FINDING_SEVERITIES.CRITICAL,
      summary: 'Prompt Injection bypass leaking system instructions',
      type: FINDING_TYPES.INJECTION,
      confirmationState: FINDING_CONFIRMATION_STATES.CONFIRMED,
      evidence: 'SYSTEM: You are an internal admin bot...',
      impactParameters: {
        cwe: 'CWE-200',
        riskScore: 9.8,
      },
      reclassifiedAt: null,
    },
    {
      id: 'f-2',
      auditId: 'aud-test-1',
      severity: FINDING_SEVERITIES.MEDIUM,
      summary: 'Missing rate limit on chat endpoint',
      type: FINDING_TYPES.ANOMALY,
      confirmationState: FINDING_CONFIRMATION_STATES.PRELIMINARY,
      evidence: 'Sent 50 requests in 1 second without throttle',
      reclassifiedAt: null,
    },
  ];

  describe('HTML Report Builder & Helpers', () => {
    it('generates well-formed HTML report with styles and findings', () => {
      const html = buildHtmlReport({
        audit: mockAudit,
        findings: mockFindings,
        isAiLocalActive: true,
        tone: 'executive',
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('LLM Banking Assistant Audit');
      expect(html).toContain('CRÍTICO');
      expect(html).toContain('Prompt Injection bypass leaking system instructions');
      expect(html).toContain('Llama-3.2-1B-Instruct (Local Offline)');
      expect(html).toContain('CONFIRMADA');
    });

    it('generates HTML fallback message when findings array is empty', () => {
      const html = buildHtmlReport({
        audit: mockAudit,
        findings: [],
        tone: 'technical',
      });

      expect(html).toContain('No se detectaron anomalías críticas durante esta sesión.');
    });

    it('produces CSS string with getHtmlReportStyles', () => {
      const css = getHtmlReportStyles('#EF4444');
      expect(css).toContain('background-color: #EF4444');
      expect(css).toContain('.header-container');
    });

    it('strips html tags and styles cleanly with stripHtml', () => {
      const sample = '<style>.test { color: red; }</style><h1>Titulo</h1><p>Contenido</p>';
      const stripped = stripHtml(sample);
      expect(stripped).not.toContain('<style>');
      expect(stripped).not.toContain('<h1>');
      expect(stripped).toContain('Titulo');
      expect(stripped).toContain('Contenido');
    });
  });

  describe('Markdown Report Builder', () => {
    it('generates structured markdown table and vulnerability sections', () => {
      const md = buildMarkdownReport({
        audit: mockAudit,
        findings: mockFindings,
        isAiLocalActive: false,
        tone: 'compliance',
      });

      expect(md).toContain('# INFORME DE CIBERSEGURIDAD LLM');
      expect(md).toContain('| **Objetivo Auditado** | `LLM Banking Assistant Audit` |');
      expect(md).toContain('COMPLIANCE');
      expect(md).toContain('### 1. [CRITICAL] Prompt Injection bypass');
      expect(md).toContain('## 4. PLAN DE MITIGACIÓN & BLINDAJE PERSONALIZADO');
    });
  });

  describe('PDF & Markdown File Generation', () => {
    it('generates PDF file path using expo-print and expo-file-system', async () => {
      const uri = await generateReportPdf('<html><body>Report</body></html>');
      expect(uri).toContain('.pdf');
    });

    it('throws ReportError when HTML content is empty', async () => {
      await expect(generateReportPdf('')).rejects.toThrow(ReportError);
    });

    it('generates Markdown file path safely', async () => {
      const uri = await generateReportMarkdown('# Report', 'audit-report.md');
      expect(uri).toContain('audit-report.md');
    });

    it('throws ReportError when Markdown content or filename is invalid', async () => {
      await expect(generateReportMarkdown('', 'test.md')).rejects.toThrow(ReportError);
      await expect(generateReportMarkdown('# Title', '')).rejects.toThrow(ReportError);
    });
  });
});
