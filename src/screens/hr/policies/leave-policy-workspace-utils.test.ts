import { it, expect, describe } from 'vitest';

import {
  getLeavePolicyTitle,
  isLeavePolicyArchived,
  getLeavePolicyBucketSummary,
  buildLeavePolicyImpactReview,
  getCurrentLeavePolicyTitleSet,
} from './leave-policy-workspace-utils';

describe('leave policy workspace adapter', () => {
  it.each([0, 1, 80])(
    'never derives affected populations from a %i-day entitlement',
    (leaveCount) => {
      const review = buildLeavePolicyImpactReview(
        { id: 'policy-1', rules: [{ paidType: 'Paid', leaveCount, encashmentAllowed: true }] },
        'archive'
      );
      expect(review.affectedEmployeeCount).toBeNull();
      expect(review.affectedRequestCount).toBeNull();
      expect(review.balanceImpactCount).toBeNull();
      expect(review.payrollMonthRiskCount).toBeNull();
      expect(review.assignmentConflictCount).toBeNull();
    }
  );
  it('maps leave policy names and paid buckets for the policy workspace', () => {
    expect(getLeavePolicyTitle({ policyTitle: 'Annual casual leave' } as any)).toBe(
      'Annual casual leave'
    );
    expect(getLeavePolicyTitle({ title: 'Legacy title' } as any)).toBe('Legacy title');
    expect(
      getLeavePolicyBucketSummary({
        rules: [{ id: 'rule-1', paidType: 'Paid', isActive: true }],
      } as any)
    ).toBe('Paid');
  });

  it('summarizes active paid type rules and ignores inactive rules', () => {
    expect(
      getLeavePolicyBucketSummary({
        rules: [
          { id: 'rule-1', paidType: 'Paid', isActive: true },
          { id: 'rule-2', paidType: 'Unpaid', isActive: true },
          { id: 'rule-3', paidType: 'Unpaid', isActive: false },
        ],
      } as any)
    ).toBe('Paid, Unpaid');
  });

  it('treats soft-deleted or inactive policies as archived', () => {
    expect(isLeavePolicyArchived({ isDeleted: true } as any)).toBe(true);
    expect(isLeavePolicyArchived({ isActive: false } as any)).toBe(true);
    expect(isLeavePolicyArchived({ deletionTime: '2026-06-06T00:00:00Z' } as any)).toBe(true);
    expect(isLeavePolicyArchived({ isActive: true } as any)).toBe(false);
  });

  it('keeps restored drafts in the current name set and excludes archived names', () => {
    const titles = getCurrentLeavePolicyTitleSet([
      {
        policyTitle: 'Restored Draft',
        status: 'Draft',
        isActive: false,
      },
      {
        policyTitle: 'Archived Name',
        status: 'Archived',
        isActive: false,
      },
    ] as any);

    expect(isLeavePolicyArchived({ status: 'Draft', isActive: false } as any)).toBe(false);
    expect(titles).toEqual(new Set(['restored draft']));
  });

  it('requires confirmation for archive impact and names historical preservation risks', () => {
    const review = buildLeavePolicyImpactReview(
      {
        id: 'policy-1',
        policyTitle: 'Sick leave',
        rules: [
          {
            id: 'rule-1',
            paidType: 'Paid',
            leaveCount: 12,
            encashmentAllowed: true,
            carryForward: true,
            requiresApproval: true,
            isActive: true,
          },
        ],
      } as any,
      'archive'
    );

    expect(review.requiresConfirmation).toBe(true);
    expect(review.bucketSummary).toBe('Paid');
    expect(review.risks.map((risk) => risk.label)).toContain('Needs confirmation');
    expect(review.risks.map((risk) => risk.label)).toContain('Informational');
  });
});
