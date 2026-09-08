import type { FinanceAuditLog } from 'src/screens/finance/AuditTrail/types/financeAudit.types';

import type { PolicyVersion } from '../hooks/useFinancePolicyVersion';
import type { IFinancePolicyRow } from '../types/finance-policy.types';

const ACTION_MAP: Record<string, string> = {
  created: 'CREATE',
  edited: 'UPDATE',
  updated: 'UPDATE',
  cloned: 'CLONE',
  archived: 'ARCHIVE',
  unarchived: 'UNARCHIVE',
  activated: 'ACTIVATE',
};

const POLICY_LABELS: Record<IFinancePolicyRow['policyType'], string> = {
  payment: 'Payment Policy',
  concession: 'Concession Policy',
  refund: 'Refund Policy',
  collection: 'Collection Policy',
  proration: 'Proration Policy',
};

export const normalizePolicyAuditAction = (action: string): string => {
  const normalized = action.trim().toLowerCase();
  return ACTION_MAP[normalized] || normalized.replace(/[^a-z0-9]+/g, '_').toUpperCase();
};

const actionDescription = (action: string, versionNumber: number): string => {
  const readableAction = action.trim().replace(/[_-]+/g, ' ').toLowerCase() || 'changed';
  return `Policy ${readableAction} as version ${versionNumber}.`;
};

export const mapPolicyVersionsToAuditLogs = (
  versions: PolicyVersion[],
  policy: IFinancePolicyRow
): FinanceAuditLog[] =>
  versions.map((version) => {
    const action = normalizePolicyAuditAction(version.action);
    const beforeData: Record<string, unknown> = {};
    const afterData: Record<string, unknown> = {};

    version.changedFields.forEach((change) => {
      if (action !== 'CREATE' && change.oldValue !== undefined) {
        beforeData[change.field] = change.oldValue;
      }
      if (change.newValue !== undefined) {
        afterData[change.field] = change.newValue;
      }
    });

    return {
      id: version.eventId,
      subModule: POLICY_LABELS[policy.policyType],
      action,
      description: actionDescription(version.action, version.versionNumber),
      performedBy: version.actor || 'System',
      beforeData: Object.keys(beforeData).length ? beforeData : undefined,
      afterData: Object.keys(afterData).length ? afterData : undefined,
      createdAt: version.createdAt,
      remarks: version.changeReason || undefined,
      entityType: `${policy.policyType}_policy`,
      entityId: policy.id,
      academicYearId: policy.academicYearId,
    };
  });
