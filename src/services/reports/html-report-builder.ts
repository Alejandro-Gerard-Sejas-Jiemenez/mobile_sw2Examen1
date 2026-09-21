import { calculateRiskAssessment } from './risk-calculator';
import type { Finding } from '../api/types';
import type { VectorSearchResult } from '../ai/vector-memory';
import type { SynthesizeOptions, MitigationItem, DynamicDiagnosis } from './types';
import { getHtmlReportStyles } from './html-report.styles';
import { RISK_BADGE_COLORS, RISK_LEVELS } from '@/constants/risk.constants';

function getRiskBadgeColor(level: DynamicDiagnosis['overallRiskLevel']): string {
  switch (level) {
    case RISK_LEVELS.CRITICAL:
      return RISK_BADGE_COLORS.CRITICAL;
    case RISK_LEVELS.HIGH:
      return RISK_BADGE_COLORS.HIGH;
    case RISK_LEVELS.MEDIUM:
      return RISK_BADGE_COLORS.MEDIUM;
    case RISK_LEVELS.LOW:
    default:
      return RISK_BADGE_COLORS.LOW;
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return RISK_BADGE_COLORS.CRITICAL;
    case 'high':
      return RISK_BADGE_COLORS.HIGH;
    case 'medium':
      return RISK_BADGE_COLORS.MEDIUM;
    case 'low':
    default:
      return RISK_BADGE_COLORS.LOW;
  }
}

function renderFindingCard(finding: Finding, index: number): string {
  const severityColor = getSeverityColor(finding.severity);
  const confirmationLabel = finding.confirmationState === 'confirmed' ? 'CONFIRMADA' : 'PRELIMINAR';
  const classification = finding.impactParameters?.cwe || finding.type.toUpperCase();
  const riskScore = finding.impactParameters?.riskScore ? `${finding.impactParameters.riskScore}/10` : 'N/A';

  return `
    <div class="finding-card">
      <div class="finding-header">
        <span class="badge" style="background-color: ${severityColor}; color: #ffffff;">${finding.severity.toUpperCase()}</span>
        <span class="conf-badge">${confirmationLabel}</span>
        <h3 class="finding-title">${index + 1}. ${finding.summary}</h3>
      </div>
      <div class="finding-meta">
        <b>Clasificación:</b> ${classification} | 
        <b>Riesgo:</b> ${riskScore}
      </div>
      <div class="evidence-box">
        <div class="evidence-label">Evidencia del Ataque (Payload & Filtración):</div>
        <pre>${finding.evidence || 'N/A'}</pre>
      </div>
    </div>
  `;
}

function renderVectorCard(vector: VectorSearchResult, index: number): string {
  return `
    <div class="vector-card">
      <div class="vector-header">
        <span class="vector-badge">Vector #${index + 1} (${(vector.similarity * 100).toFixed(1)}% afín)</span>
        <span class="vector-owasp">${vector.node.owaspId} | ${vector.node.cweId}</span>
      </div>
      <div class="vector-title"><b>${vector.node.title}</b></div>
      <div class="vector-desc">${vector.node.description}</div>
    </div>
  `;
}

function renderMitigationCard(mitigation: MitigationItem, index: number): string {
  return `
    <div class="mitigation-card">
      <div class="mitigation-title"><b>Mitigación ${index + 1} [${mitigation.vectorRef}]:</b> ${mitigation.findingTitle}</div>
      <p class="mitigation-desc">${mitigation.actionableStep}</p>
      <div class="code-box">
        <pre>${mitigation.codeExample}</pre>
      </div>
    </div>
  `;
}

/**
 * Strips HTML tags and style blocks to convert HTML report markup to clean plain text.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/**
 * Builds professional styled HTML report suitable for WebView rendering and PDF generation.
 */
export function buildHtmlReport({
  audit,
  findings,
  isAiLocalActive,
  tone = 'executive',
  auditorCustomDirectives,
}: SynthesizeOptions): string {
  const diagnosis = calculateRiskAssessment(
    findings,
    tone,
    auditorCustomDirectives,
    audit.name
  );

  const criticals = findings.filter((f) => f.severity === 'critical').length;
  const highs = findings.filter((f) => f.severity === 'high').length;
  const mediums = findings.filter((f) => f.severity === 'medium').length;
  const dateStr = new Date(audit.startedAt).toLocaleString();
  const riskBadgeColor = getRiskBadgeColor(diagnosis.overallRiskLevel);

  const findingsHtml = findings.length > 0
    ? findings.map((f, i) => renderFindingCard(f, i)).join('')
    : '<p>No se detectaron anomalías críticas durante esta sesión.</p>';

  const vectorsHtml = diagnosis.retrievedVectors
    .map((v, i) => renderVectorCard(v, i))
    .join('');

  const mitigationsHtml = diagnosis.mitigationMatrix
    .map((m, i) => renderMitigationCard(m, i))
    .join('');

  const styles = getHtmlReportStyles(riskBadgeColor);
  const aiEngineLabel = isAiLocalActive
    ? 'Llama-3.2-1B-Instruct (Local Offline)'
    : 'Analizador Heurístico IA';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>Informe de Seguridad LLM - ${audit.name}</title>
      <style>
        ${styles}
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="header-left">
          <h1>INFORME EJECUTIVO DE SEGURIDAD LLM</h1>
          <div class="subtitle">GenAI Security Lab & Vector RAG Intelligence Engine</div>
        </div>
        <div class="risk-seal">
          <div class="score-label">Nivel de Riesgo</div>
          <div class="score-num">${diagnosis.overallRiskLevel}</div>
          <div style="font-size: 11px;">Score: ${diagnosis.riskScore}/10</div>
        </div>
      </div>

      <div class="meta-grid">
        <div><b>Objetivo Auditado:</b> ${audit.name}</div>
        <div><b>Enfoque del Informe:</b> ${tone.toUpperCase()}</div>
        <div><b>Fecha de Ejecución:</b> ${dateStr}</div>
        <div><b>Memoria Persistente:</b> ${diagnosis.learnedRulesCount} Reglas Aprendidas</div>
        <div><b>Vector Memory RAG:</b> 3 Vectores de Ciberseguridad</div>
        <div><b>Motor de Síntesis IA:</b> ${aiEngineLabel}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-num">${audit.metrics.requestsSent}</div>
          <div class="stat-label">Peticiones Enviadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color: ${RISK_BADGE_COLORS.CRITICAL};">${criticals}</div>
          <div class="stat-label">Críticas</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color: ${RISK_BADGE_COLORS.HIGH};">${highs}</div>
          <div class="stat-label">Altas</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color: ${RISK_BADGE_COLORS.MEDIUM};">${mediums}</div>
          <div class="stat-label">Medias</div>
        </div>
      </div>

      <div class="ai-diagnosis-card">
        <h2>${diagnosis.toneHeading}</h2>
        <p class="ai-diagnosis-text">${diagnosis.threatSummary}</p>
        <div class="compliance-note"><b>Evaluación de Cumplimiento:</b> ${diagnosis.complianceImpact}</div>
      </div>

      <div class="section-heading">Vectores de Conocimiento RAG Recuperados</div>
      ${vectorsHtml}

      <div class="section-heading">Hallazgos y Vulnerabilidades Detectadas</div>
      ${findingsHtml}

      <div class="section-heading">Plan de Remediación y Blindaje de Prompts</div>
      ${mitigationsHtml}

      <div class="footer">
        Documento generado confidencialmente por <b>GenAI Security Auditor Mobile Node</b>.<br />
        Garantía de Privacidad: Inferencia, Vector RAG y Memoria Persistente ejecutadas localmente sin exfiltración de datos.
      </div>
    </body>
    </html>
  `;
}
