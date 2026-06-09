import type { PerformanceSqaaAuditPack } from 'src/redux/hr/professional-management-api';

import type { PerformanceWorkspaceTab } from './components/performance-workspace-config';

export type SqaaAuditPackSummary = {
  overallReadinessPercentage: number;
  totalMissingEvidence: number;
  totalRequiredEvidence: number;
  totalEvidenceSubmitted: number;
  readyDomainCount: number;
  totalDomainCount: number;
  topGaps: NonNullable<PerformanceSqaaAuditPack['domains']>[number][];
};

export const summarizeSqaaAuditPack = (
  auditPack?: PerformanceSqaaAuditPack | null
): SqaaAuditPackSummary => {
  const domains = auditPack?.domains || [];

  return {
    overallReadinessPercentage: auditPack?.overallReadinessPercentage ?? 0,
    totalMissingEvidence: auditPack?.totalMissingEvidence ?? 0,
    totalRequiredEvidence: auditPack?.totalRequiredEvidence ?? 0,
    totalEvidenceSubmitted: auditPack?.totalEvidenceSubmitted ?? 0,
    readyDomainCount: domains.filter((domain) => domain.isReady).length,
    totalDomainCount: domains.length,
    topGaps: [...domains]
      .filter((domain) => Number(domain.missingEvidence || 0) > 0)
      .sort((a, b) => Number(b.missingEvidence || 0) - Number(a.missingEvidence || 0))
      .slice(0, 3),
  };
};

export const getPerformanceRoleDefaultWorkspace = (
  roles?: string | string[] | null
): PerformanceWorkspaceTab => {
  const normalizedRoles = (Array.isArray(roles) ? roles : [roles])
    .filter(Boolean)
    .map((role) => String(role).toLowerCase());

  if (normalizedRoles.some((role) => role.includes('teacher') || role.includes('faculty'))) {
    return 'reviews';
  }

  if (
    normalizedRoles.some(
      (role) => role.includes('reviewer') || role.includes('hod') || role.includes('coordinator')
    )
  ) {
    return 'reviews';
  }

  if (normalizedRoles.some((role) => role.includes('hr'))) {
    return 'settings';
  }

  if (
    normalizedRoles.some(
      (role) => role.includes('principal') || role.includes('admin') || role.includes('management')
    )
  ) {
    return 'overview';
  }

  return 'overview';
};
