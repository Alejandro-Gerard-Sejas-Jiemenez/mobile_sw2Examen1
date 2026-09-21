/**
 * HTML Report Stylesheet Generator
 * Modular CSS styles for WebView rendering, print media, and PDF generation.
 */

export function getHtmlReportStyles(riskBadgeColor: string): string {
  return `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      background: #ffffff;
      padding: 36px;
      line-height: 1.6;
      max-width: 850px;
      margin: 0 auto;
    }
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1E40AF;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .header-left h1 {
      font-size: 24px;
      color: #1E40AF;
      margin: 0 0 6px 0;
      letter-spacing: 0.5px;
    }
    .subtitle {
      font-size: 13px;
      color: #64748B;
      font-weight: 500;
    }
    .risk-seal {
      background-color: ${riskBadgeColor};
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      text-align: center;
      min-width: 140px;
    }
    .score-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
    }
    .score-num {
      font-size: 20px;
      font-weight: 800;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 14px 18px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: #F1F5F9;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      border: 1px solid #E2E8F0;
    }
    .stat-num {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
    }
    .stat-label {
      font-size: 11px;
      color: #64748B;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .ai-diagnosis-card {
      background: #EFF6FF;
      border-left: 4px solid #3B82F6;
      padding: 18px 20px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 28px;
    }
    .ai-diagnosis-card h2 {
      font-size: 16px;
      color: #1E3A8A;
      margin: 0 0 8px 0;
    }
    .ai-diagnosis-text {
      font-size: 14px;
      color: #1E293B;
      margin: 0;
      white-space: pre-line;
    }
    .compliance-note {
      margin-top: 10px;
      font-size: 12px;
      color: #475569;
      font-style: italic;
    }
    .section-heading {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin: 28px 0 14px 0;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 6px;
    }
    .vector-card {
      background: #FAF5FF;
      border: 1px solid #E9D5FF;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 12px;
    }
    .vector-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 4px;
    }
    .vector-badge {
      background: #7E22CE;
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .vector-owasp {
      color: #6B21A8;
      font-weight: 600;
    }
    .vector-title {
      font-size: 14px;
      color: #581C87;
      margin-bottom: 4px;
    }
    .vector-desc {
      font-size: 12px;
      color: #4A044E;
    }
    .finding-card {
      background: #ffffff;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .finding-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .conf-badge {
      font-size: 10px;
      background: #E2E8F0;
      color: #334155;
      padding: 3px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .finding-title {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
    }
    .finding-meta {
      font-size: 12px;
      color: #64748B;
      margin-bottom: 10px;
    }
    .evidence-box {
      background: #0F172A;
      color: #E2E8F0;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
    }
    .evidence-label {
      font-size: 11px;
      color: #94A3B8;
      margin-bottom: 4px;
      font-weight: 600;
    }
    pre {
      margin: 0;
      font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .mitigation-card {
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .mitigation-title {
      font-size: 14px;
      color: #1E293B;
      margin-bottom: 6px;
    }
    .mitigation-desc {
      font-size: 13px;
      color: #334155;
      margin: 0 0 10px 0;
    }
    .code-box {
      background: #1E293B;
      color: #38BDF8;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #E2E8F0;
      padding-top: 16px;
      font-size: 11px;
      color: #94A3B8;
      text-align: center;
    }
  `;
}
