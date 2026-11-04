import { it, expect, describe } from 'vitest';
import { CalendarAuditAction } from 'src/enums/academic-calendar';

import { buildAuditSummary } from './auditSummary';

import type { AuditLog } from '../types/auditLogs.types';

describe('calendar activity summary', () => {
  it('reports absent risk and impact as unavailable rather than measured zeros', () => {
    const result = buildAuditSummary([{ actionLabel: 'Day added' } as AuditLog]);
    expect(result.text).toContain('Risk assessment not recorded');
    expect(result.text).toContain('Impact not recorded');
  });
  it('reports an empty result without fabricated activity or recommendations', () => {
    const summary = buildAuditSummary([]);
    expect(summary.text).toContain('No audit records');
    expect(summary.suggestedActions).toEqual([]);
  });

  it('summarizes only the supplied page and does not claim a weekly or security analysis', () => {
    const log: AuditLog = {
      id: 'real-change',
      module: 'Academic',
      action: CalendarAuditAction.CalendarPublished,
      actionLabel: 'Calendar Published',
      changedByUserId: 'staff-1',
      timestamp: '2026-10-21',
      hasDiff: true,
      riskLevel: 3,
      impact: { workingDaysAffected: 2 },
    };
    const summary = buildAuditSummary([log]);
    expect(summary.text).toContain('1 calendar change');
    expect(summary.text).toContain('High risk: 1');
    expect(summary.text).toContain('loaded results only');
    expect(summary.text).not.toMatch(/last 7 days|No suspicious activity/);
    expect(
      buildAuditSummary([
        {
          ...log,
          action: CalendarAuditAction.DayAdded,
          riskLevel: 1,
          impact: undefined,
          actionLabel: 'Day added',
        },
      ]).suggestedActions
    ).toEqual([]);
  });
});
