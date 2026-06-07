import { it, expect, describe } from 'vitest';

import {
  getLeavePolicyTitle,
  isLeavePolicyArchived,
  getLeavePolicyLeaveTypeName,
  buildLeavePolicyImpactReview,
} from './leave-policy-workspace-utils';

describe('leave policy workspace adapter', () => {
  it('maps legacy leave policy names and leave type objects for the policy workspace', () => {
    expect(getLeavePolicyTitle({ policyTitle: 'Annual casual leave' } as any)).toBe(
      'Annual casual leave'
    );
    expect(getLeavePolicyTitle({ title: 'Legacy title' } as any)).toBe('Legacy title');
    expect(
      getLeavePolicyLeaveTypeName({ leaveType: { id: 'type-1', name: 'Casual' } } as any)
    ).toBe('Casual');
  });

  it('treats soft-deleted or inactive policies as archived', () => {
    expect(isLeavePolicyArchived({ isDeleted: true } as any)).toBe(true);
    expect(isLeavePolicyArchived({ isActive: false } as any)).toBe(true);
    expect(isLeavePolicyArchived({ deletionTime: '2026-06-06T00:00:00Z' } as any)).toBe(true);
    expect(isLeavePolicyArchived({ isActive: true } as any)).toBe(false);
  });

  it('requires confirmation for archive impact and names historical preservation risks', () => {
    const review = buildLeavePolicyImpactReview(
      {
        id: 'policy-1',
        policyTitle: 'Sick leave',
        leaveType: { id: 'type-1', name: 'Sick' },
        leaveCount: 12,
        encashmentAllowed: true,
        carryForward: true,
        requiresApproval: true,
      } as any,
      'archive'
    );

    expect(review.requiresConfirmation).toBe(true);
    expect(review.leaveTypeName).toBe('Sick');
    expect(review.risks.map((risk) => risk.label)).toContain('Needs confirmation');
    expect(review.risks.map((risk) => risk.label)).toContain('Informational');
  });
});
