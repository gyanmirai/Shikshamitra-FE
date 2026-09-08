import { it, expect, describe } from 'vitest';

import {
  normalizePolicyAuditAction,
  mapPolicyVersionsToAuditLogs,
} from './policy-version-audit';

import type { PolicyVersion } from '../hooks/useFinancePolicyVersion';
import type { IFinancePolicyRow } from '../types/finance-policy.types';

const policy: IFinancePolicyRow = {
  id: 'policy-1',
  policyName: 'Standard Collection Policy',
  policyCode: 'CP-001',
  policyType: 'collection',
  academicYearId: 'year-1',
  academicYearName: '2026-27',
  status: 'Active',
  effectiveFrom: null,
  effectiveTo: null,
  updatedBy: 'Admin',
  updatedAt: '2026-09-08T10:00:00Z',
  isDefault: false,
};

const version: PolicyVersion = {
  versionNumber: 2,
  eventId: 'version-2',
  actor: 'Finance Admin',
  date: '2026-09-08T10:00:00Z',
  createdAt: '2026-09-08T10:00:00Z',
  action: 'edited',
  status: 'Active',
  changeReason: 'Updated grace period',
  summary: 'Updated grace period',
  changedFields: [{ field: 'gracePeriodDays', oldValue: 5, newValue: 7 }],
};

describe('collection policy version audit mapping', () => {
  it('maps immutable version changes into the audit timeline contract', () => {
    const [log] = mapPolicyVersionsToAuditLogs([version], policy);

    expect(log).toMatchObject({
      id: 'version-2',
      subModule: 'Collection Policy',
      action: 'UPDATE',
      description: 'Policy edited as version 2.',
      performedBy: 'Finance Admin',
      beforeData: { gracePeriodDays: 5 },
      afterData: { gracePeriodDays: 7 },
      remarks: 'Updated grace period',
      entityType: 'collection_policy',
    });
  });

  it.each([
    ['created', 'CREATE'],
    ['cloned', 'CLONE'],
    ['archived', 'ARCHIVE'],
    ['unarchived', 'UNARCHIVE'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizePolicyAuditAction(input)).toBe(expected);
  });
});
