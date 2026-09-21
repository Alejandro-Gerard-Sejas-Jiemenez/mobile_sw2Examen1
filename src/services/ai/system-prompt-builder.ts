import type { Audit, Finding } from '../api/types';
import { persistentMemory } from './persistent-memory';
import { searchVectorMemory, type VectorSearchResult } from './vector-memory';
import { AI_CONSTANTS } from '@/constants/ai.constants';

export interface SystemPromptOptions {
  audit: Audit;
  findings: Finding[];
  tone?: 'executive' | 'technical' | 'compliance' | 'custom';
  auditorDirectives?: string;
}

export interface StructuredPromptOutput {
  systemPrompt: string;
  retrievedVectors: VectorSearchResult[];
  persistentRulesCount: number;
}

export function buildStructuredSystemPrompt({
  audit,
  findings,
  tone = 'executive',
  auditorDirectives = '',
}: SystemPromptOptions): StructuredPromptOutput {
  const query = `${audit.name} ${findings.map((f) => f.summary + ' ' + (f.evidence || '')).join(' ')} ${auditorDirectives}`;
  const retrievedVectors = searchVectorMemory(query, AI_CONSTANTS.DEFAULT_TOP_K_VECTORS);
  const memoryContext = persistentMemory.getFormattedMemoryContext();
  const rulesCount = persistentMemory.getMemorySync().learnedRules.length;

  const findingsSummary = findings
    .map(
      (f, i) =>
        `  [Finding #${i + 1}] Severity: ${f.severity.toUpperCase()} | Type: ${f.type} | Summary: ${f.summary} | Evidence: ${f.evidence || 'N/A'}`
    )
    .join('\n');

  const vectorRagContext = retrievedVectors
    .map(
      (res, i) =>
        `  [Vector #${i + 1} - Similarity: ${(res.similarity * 100).toFixed(1)}%] ${res.node.title} (${res.node.owaspId}, ${res.node.cweId})\n   Description: ${res.node.description}\n   Remediation Blueprint:\n${res.node.remediationSnippet}`
    )
    .join('\n\n');

  const systemPrompt = `
<system_role>
You are GenAI Security Copilot, an elite cybersecurity intelligence and automated LLM vulnerability assessment engine.
Your mission is to perform deep heuristic synthesis, calculate realistic CVSS scores, cross-reference against international frameworks (OWASP Top 10 for LLM 2025, EU AI Act, NIST AI RMF), and formulate concrete, code-level defensive remediation blueprints.
All output must be strict, verified, and confidential.
</system_role>

<persistent_memory_context>
${memoryContext}
</persistent_memory_context>

<rag_vector_knowledge>
${vectorRagContext}
</rag_vector_knowledge>

<audit_telemetry_findings>
Target: ${audit.name} (ID: ${audit.id})
Execution Date: ${audit.startedAt}
Status: ${audit.status}
Metrics: ${audit.metrics.requestsSent} requests sent across ${audit.metrics.pagesScanned} interfaces.
Total Findings Detected: ${findings.length}
${findingsSummary || '  No critical vulnerabilities detected.'}
</audit_telemetry_findings>

<auditor_voice_directives>
Selected Tone Mode: ${tone.toUpperCase()}
Auditor Custom Voice/Text Directives: ${auditorDirectives ? `"${auditorDirectives.trim()}"` : 'None specified (Apply standard institutional baseline).'}
</auditor_voice_directives>

<dynamic_synthesis_rules>
1. Adapt the entire technical diagnosis to the requested tone (${tone.toUpperCase()}).
2. Construct dynamic document sections based on the retrieved RAG vectors.
3. Generate actionable Python/Django/Next.js defensive code remedies for each confirmed vulnerability.
4. Calculate composite risk score on a 1.0 to 10.0 scale reflecting active exploitability.
</dynamic_synthesis_rules>
`.trim();

  return {
    systemPrompt,
    retrievedVectors,
    persistentRulesCount: rulesCount,
  };
}
