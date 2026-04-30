import { it, expect, describe } from 'vitest';

import {
  stripHtml,
  getLeaveRequestReason,
  findMatchingBalanceItem,
  buildRecentLeaveRequests,
  getNormalizedBalanceMetrics,
} from './leave-request-details.utils';

describe('leave request details utils', () => {
  it('strips html and collapses whitespace', () => {
    expect(stripHtml('<p>Hello&nbsp;&nbsp;<strong>World</strong></p>')).toBe('Hello World');
  });

  it('returns sanitized leave reason from detail or fallback', () => {
    expect(getLeaveRequestReason({ description: '<div>Medical <b>leave</b></div>' })).toBe(
      'Medical leave'
    );
    expect(getLeaveRequestReason({}, { reason: 'Travel' })).toBe('Travel');
  });

  it('matches leave balance by policy first and falls back to leave type', () => {
    const items = [
      { leavePolicyId: 'policy-1', leaveTypeName: 'Casual Leave', remainingDays: 3 },
      { leavePolicyId: 'policy-2', leaveTypeName: 'Sick Leave', remainingDays: 5 },
    ];

    expect(findMatchingBalanceItem({ leavePolicyId: 'policy-2' }, items)?.remainingDays).toBe(5);
    expect(findMatchingBalanceItem({ leaveType: 'Casual Leave' }, items)?.remainingDays).toBe(3);
  });

  it('builds recent requests for the same employee and excludes the current request', () => {
    const recent = buildRecentLeaveRequests(
      [
        {
          id: '1',
          employeeId: 'emp-1',
          leaveType: 'Casual',
          startDate: '2026-05-03',
          status: 'PENDING',
        },
        {
          id: '2',
          employeeId: 'emp-2',
          leaveType: 'Sick',
          startDate: '2026-05-05',
          status: 'APPROVED',
        },
        {
          id: '3',
          employeeId: 'emp-1',
          leaveType: 'Loss of Pay',
          startDate: '2026-05-04',
          status: 'REJECTED',
        },
      ],
      '3',
      'emp-1'
    );

    expect(recent).toHaveLength(1);
    expect(recent[0].id).toBe('1');
  });

  it('normalizes balance metrics and computes clamped percentages', () => {
    const normalized = getNormalizedBalanceMetrics({
      entitledDays: 24,
      usedDays: 2,
      remainingDays: 22,
    });

    expect(normalized.entitledDays).toBe(24);
    expect(normalized.usedDays).toBe(2);
    expect(normalized.remainingDays).toBe(22);
    expect(normalized.entitledPct).toBe(100);
    expect(normalized.usedPct).toBeCloseTo(8.33, 1);
    expect(normalized.remainingPct).toBeCloseTo(91.67, 1);
  });

  it('guards against invalid/negative balance values', () => {
    const normalized = getNormalizedBalanceMetrics({
      entitledDays: -5,
      usedDays: 7,
      remainingDays: Number.NaN,
    });

    expect(normalized.entitledDays).toBe(0);
    expect(normalized.usedDays).toBe(7);
    expect(normalized.remainingDays).toBe(0);
    expect(normalized.entitledPct).toBe(0);
    expect(normalized.usedPct).toBe(100);
    expect(normalized.remainingPct).toBe(0);
  });
});
