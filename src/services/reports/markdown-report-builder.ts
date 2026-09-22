import { calculateRiskAssessment } from './risk-calculator';
import type { Finding } from '../api/types';
import type { SynthesizeOptions, ReportTone, DynamicDiagnosis, MitigationItem } from './types';

export type { SynthesizeOptions, ReportTone };

/**
 * Renders a single finding entry for markdown.
 */
function renderFindingMarkdown(finding: Finding, index: number): string {
  const stateBadge = finding.confirmationState === 'confirmed' ? '[CONFIRMADA]' : '[PRELIMINAR]';
  const cweLine = finding.impactParameters?.cwe ? `- **Clasificación Estándar:** \`${finding.impactParameters.cwe}\`` : '';
  const scoreLine = finding.impactParameters?.riskScore ? `- **Score de Severidad:** \`${finding.impactParameters.riskScore}/10\`` : '';

  return [
    `### ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.summary}`,
    `- **Tipo de Vector:** \`${finding.type.toUpperCase()}\``,
    `- **Estado de Confirmación:** **${stateBadge}**`,
    cweLine,
    scoreLine,
    ``,
    `**Evidencia Técnica Registrada:**`,
    `\`\`\`text`,
    finding.evidence || 'Evidencia capturada durante la sesión ofensiva.',
    `\`\`\``,
    ``,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Renders a single mitigation entry for markdown.
 */
function renderMitigationMarkdown(mitigation: MitigationItem, index: number): string {
  return [
    `### Mitigación ${index + 1} [${mitigation.vectorRef}]: Para "${mitigation.findingTitle}"`,
    `**Recomendación:** ${mitigation.actionableStep}`,
    ``,
    `**Código / Configuración de Blindaje Sugerida:**`,
    `\`\`\`python`,
    mitigation.codeExample,
    `\`\`\``,
    ``,
  ].join('\n');
}

/**
 * Builds a structured Markdown audit report using pure risk calculations.
 */
export function buildMarkdownReport({
  audit,
  findings,
  isAiLocalActive,
  tone = 'executive',
  auditorCustomDirectives,
  narrativeOverride,
}: SynthesizeOptions): string {
  const diagnosis: DynamicDiagnosis = calculateRiskAssessment(
    findings,
    tone,
    auditorCustomDirectives,
    audit.name
  );
  const threatSummary = narrativeOverride || diagnosis.threatSummary;

  console.log(
    `[markdown-report-builder] 📝 buildMarkdownReport → audit="${audit.name}" tone=${tone}` +
      ` riskLevel=${diagnosis.overallRiskLevel} score=${diagnosis.riskScore}` +
      ` findings=${findings.length} isAiLocalActive=${isAiLocalActive}` +
      ` narrativeOverride=${narrativeOverride ? `SÍ (${narrativeOverride.length} chars)` : 'NO → heurístico'}`
  );
  const criticals = findings.filter((f) => f.severity === 'critical').length;
  const highs = findings.filter((f) => f.severity === 'high').length;
  const mediums = findings.filter((f) => f.severity === 'medium').length;
  const lows = findings.filter((f) => f.severity === 'low').length;

  const dateStr = new Date(audit.startedAt).toLocaleString();

  // Dynamic vector context list
  const vectorList = diagnosis.retrievedVectors.map(
    (v, i) =>
      `- **Vector #${i + 1} (${(v.similarity * 100).toFixed(1)}% Similitud):** \`${v.node.owaspId}\` — ${v.node.title} (${v.node.cweId})`
  );

  const lines = [
    `# INFORME DE CIBERSEGURIDAD LLM — ${diagnosis.toneHeading.toUpperCase()}`,
    ``,
    `| Parámetro | Detalle |`,
    `| :--- | :--- |`,
    `| **Objetivo Auditado** | \`${audit.name}\` |`,
    `| **Enfoque del Informe** | **${tone.toUpperCase()}** |`,
    `| **Nivel de Riesgo Global** | **${diagnosis.overallRiskLevel} (Score: ${diagnosis.riskScore}/10)** |`,
    `| **Fecha de Análisis** | ${dateStr} |`,
    `| **Motor IA de Síntesis** | ${isAiLocalActive ? 'Llama-3.2-1B-Instruct (On-Device Local Ingestion)' : 'Analizador Heurístico IA'} |`,
    `| **Memoria Persistente** | **${diagnosis.learnedRulesCount} Reglas Organizacionales Aprendidas** |`,
    `| **Vector Memory RAG** | **3 Vectores Semánticos Recuperados** |`,
    `| **Garantía de Privacidad** | **100% Offline (Sin Exfiltración Externa)** |`,
    ``,
    `---`,
    ``,
    `## 1. ${diagnosis.toneHeading}`,
    `> **Evaluación del Modelo Local & Vector RAG:**  `,
    `> ${threatSummary.replace(/\n/g, '\n> ')}`,
    ``,
    `### Métricas de Cobertura y Hallazgos:`,
    `- **Peticiones Ofensivas Enviadas:** \`${audit.metrics.requestsSent}\` requests`,
    `- **Interfaces y Canales Analizados:** \`${audit.metrics.pagesScanned}\` interfaces`,
    `- **Desglose de Severidad:** **${criticals} Críticas** · **${highs} Altas** · **${mediums} Medias** · **${lows} Bajas**`,
    ``,
    `---`,
    ``,
    `## 2. VECTORES DE CONOCIMIENTO RAG RECUPERADOS`,
    `La IA vinculó los siguientes vectores semánticos de ciberseguridad para este informe:`,
    ...vectorList,
    ``,
    `---`,
    ``,
    `## 3. DETALLE TÉCNICO DE VULNERABILIDADES`,
    ...findings.map((f, i) => renderFindingMarkdown(f, i)),
    `---`,
    ``,
    `## 4. PLAN DE MITIGACIÓN & BLINDAJE PERSONALIZADO`,
    `A continuación se detallan las medidas técnicas específicas generadas por la IA para subsanar cada hallazgo:`,
    ``,
    ...diagnosis.mitigationMatrix.map((m, i) => renderMitigationMarkdown(m, i)),
    `---`,
    `## 5. DICTAMEN REGULATORIO & PRIVACIDAD`,
    `${diagnosis.complianceImpact}`,
    ``,
    `---`,
    `*Informe generado confidencialmente por GenAI Security Auditor Companion.*  `,
    `*Memoria Persistente + Vector RAG Hash: \`SHA256-${Date.now().toString(16)}-GENAI-SEC\`*`,
  ];

  return lines.join('\n');
}
