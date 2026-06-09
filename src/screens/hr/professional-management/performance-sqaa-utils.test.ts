import { it, expect, describe } from 'vitest';
import { PerformanceSqaaDomain } from 'src/redux/hr/professional-management-api';

import {
  summarizeSqaaAuditPack,
  getPerformanceRoleDefaultWorkspace,
} from './performance-sqaa-utils';

describe('performance-sqaa-utils', () => {
  it('summarizes empty SQAAF audit pack data safely', () => {
    expect(summarizeSqaaAuditPack(null)).toEqual({
      overallReadinessPercentage: 0,
      totalMissingEvidence: 0,
      totalRequiredEvidence: 0,
      totalEvidenceSubmitted: 0,
      readyDomainCount: 0,
      totalDomainCount: 0,
      topGaps: [],
    });
  });

  it('surfaces top SQAAF evidence gaps by missing evidence count', () => {
    const summary = summarizeSqaaAuditPack({
      generatedAt: '2026-06-07T00:00:00Z',
      overallReadinessPercentage: 55,
      totalMappedCriteria: 8,
      totalRequiredEvidence: 20,
      totalEvidenceSubmitted: 11,
      totalMissingEvidence: 9,
      missingEvidenceItems: [],
      domains: [
        {
          domain: PerformanceSqaaDomain.CurriculumPedagogyAssessment,
          readinessPercentage: 80,
          templateCount: 2,
          assignedReviewCount: 10,
          mappedCriteria: 3,
          evidenceRequiredCriteria: 10,
          evidenceSubmitted: 8,
          missingEvidence: 2,
          isReady: false,
        },
        {
          domain: PerformanceSqaaDomain.HumanResources,
          readinessPercentage: 30,
          templateCount: 1,
          assignedReviewCount: 10,
          mappedCriteria: 2,
          evidenceRequiredCriteria: 10,
          evidenceSubmitted: 3,
          missingEvidence: 7,
          isReady: false,
        },
        {
          domain: PerformanceSqaaDomain.LeadershipGovernance,
          readinessPercentage: 100,
          templateCount: 1,
          assignedReviewCount: 4,
          mappedCriteria: 3,
          evidenceRequiredCriteria: 4,
          evidenceSubmitted: 4,
          missingEvidence: 0,
          isReady: true,
        },
      ],
    });

    expect(summary.overallReadinessPercentage).toBe(55);
    expect(summary.readyDomainCount).toBe(1);
    expect(summary.topGaps.map((domain) => domain.domain)).toEqual([
      PerformanceSqaaDomain.HumanResources,
      PerformanceSqaaDomain.CurriculumPedagogyAssessment,
    ]);
  });

  it('maps common school roles to focused performance workspaces', () => {
    expect(getPerformanceRoleDefaultWorkspace('Teacher')).toBe('reviews');
    expect(getPerformanceRoleDefaultWorkspace('HOD Coordinator')).toBe('reviews');
    expect(getPerformanceRoleDefaultWorkspace('Principal')).toBe('overview');
    expect(getPerformanceRoleDefaultWorkspace('HR Admin')).toBe('settings');
    expect(getPerformanceRoleDefaultWorkspace(null)).toBe('overview');
  });
});
