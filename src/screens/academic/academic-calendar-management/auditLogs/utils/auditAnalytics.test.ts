import { it, expect, describe } from 'vitest';
import { CalendarAuditAction } from 'src/enums/academic-calendar';

import { buildAuditAnalytics } from './auditAnalytics';
import { type AuditLog, AuditRiskLevel, AuditApprovalStatus } from '../types/auditLogs.types';

describe('calendar audit analytics', () => {
  it('keeps empty records empty without fabricated security accusations', () => {
    expect(buildAuditAnalytics([])).toEqual({
      actionDistribution: [],
      riskDistribution: [],
      topUsers: [],
      topEntities: [],
      criticalCount: 0,
      highRiskCount: 0,
      pendingApprovalCount: 0,
    });
  });
  it('counts only the supplied events and preserves record names', () => {
    const event = {
      action: CalendarAuditAction.CalendarCreated,
      actionLabel: 'Created',
      changedByUserId: 'user',
      changedByName: 'Test actor',
      changedByRole: 'Admin',
      entityName: 'CBSE term',
      riskLevel: AuditRiskLevel.High,
      approvalStatus: AuditApprovalStatus.PendingApproval,
    } as AuditLog;
    const result = buildAuditAnalytics([event, { ...event, riskLevel: AuditRiskLevel.Critical }]);
    expect(result.topEntities).toEqual([{ label: 'CBSE term', count: 2 }]);
    expect(result.highRiskCount).toBe(2);
    expect(result.criticalCount).toBe(1);
    expect(result.pendingApprovalCount).toBe(2);
  });
});
