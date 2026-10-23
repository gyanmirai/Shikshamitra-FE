import { type AuditLog, AuditRiskLevel, AuditApprovalStatus } from '../types/auditLogs.types';

export const buildAuditAnalytics = (logs: AuditLog[]) => {
  const byAction = new Map<string, number>();
  const byRisk = new Map<AuditRiskLevel, number>();
  const byUser = new Map<string, { name: string; role: string; count: number }>();
  const byEntity = new Map<string, { label: string; count: number }>();

  logs.forEach((l) => {
    const riskLevel = l.riskLevel ?? AuditRiskLevel.Low;
    const changedByName = l.changedByName ?? 'Unknown user';
    const changedByRole = l.changedByRole ?? 'Unknown role';
    const rawEntityName = (l.entityName ?? 'Unknown record').trim();

    // Case-insensitive key for deduplication & consolidation
    const entityKey = rawEntityName.toLowerCase();

    byAction.set(l.actionLabel, (byAction.get(l.actionLabel) ?? 0) + 1);
    byRisk.set(riskLevel, (byRisk.get(riskLevel) ?? 0) + 1);
    const u = byUser.get(l.changedByUserId) ?? {
      name: changedByName,
      role: changedByRole,
      count: 0,
    };
    u.count += 1;
    byUser.set(l.changedByUserId, u);

    const existingEntity = byEntity.get(entityKey);
    if (existingEntity) {
      existingEntity.count += 1;
    } else {
      // Preserve record names when consolidating case-insensitive keys.
      const cleanLabel = rawEntityName;
      byEntity.set(entityKey, { label: cleanLabel, count: 1 });
    }
  });

  return {
    actionDistribution: Array.from(byAction.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    riskDistribution: Array.from(byRisk.entries()).map(([level, count]) => ({ level, count })),
    topUsers: Array.from(byUser.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topEntities: Array.from(byEntity.values())
      .map(({ label, count }) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    criticalCount: logs.filter((l) => l.riskLevel === AuditRiskLevel.Critical).length,
    highRiskCount: logs.filter((l) => (l.riskLevel ?? AuditRiskLevel.Low) >= AuditRiskLevel.High)
      .length,
    pendingApprovalCount: logs.filter(
      (l) => l.approvalStatus === AuditApprovalStatus.PendingApproval
    ).length,
  };
};
