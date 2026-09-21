import { calculateRiskAssessment } from '../../src/services/reports/risk-calculator';
import {
  FINDING_CONFIRMATION_STATES,
  FINDING_SEVERITIES,
  FINDING_TYPES,
  RISK_LEVELS,
} from '../../src/constants/risk.constants';
import type { Finding } from '../../src/services/api/types';

describe('Risk Calculator (CVSS & Dynamic Diagnosis)', () => {
  it('calculates CRITICAL overall risk when critical vulnerabilities are present', () => {
    const findings: Finding[] = [
      {
        id: 'f1',
        auditId: 'aud-1',
        severity: FINDING_SEVERITIES.CRITICAL,
        summary: 'System prompt extraction vulnerability in chat interface',
        type: FINDING_TYPES.INJECTION,
        confirmationState: FINDING_CONFIRMATION_STATES.CONFIRMED,
        evidence: 'Exfiltrated secret instructions',
        reclassifiedAt: null,
      },
    ];

    const result = calculateRiskAssessment(
      findings,
      'executive',
      'Priorizar impacto',
      'TestBot'
    );

    expect(result.overallRiskLevel).toBe(RISK_LEVELS.CRITICAL);
    expect(result.riskScore).toBeGreaterThanOrEqual(4.0);
    expect(result.retrievedVectors.length).toBeGreaterThan(0);
    expect(result.threatSummary).toContain('Priorizar impacto');
  });

  it('calculates BAJO risk when no findings are detected', () => {
    const findings: Finding[] = [];
    const result = calculateRiskAssessment(findings, 'technical');

    expect(result.overallRiskLevel).toBe(RISK_LEVELS.LOW);
    expect(result.riskScore).toBe(1.0);
    expect(result.mitigationMatrix.length).toBe(0);
  });
});
