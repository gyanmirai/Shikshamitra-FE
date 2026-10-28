import type { ILeavePolicy } from './leave-policy-types';

export type LeaveImpactScope = {
  asOfDate: string;
  fromDate?: string;
  toDate?: string;
  expectedVersion?: number;
};
export type LeaveImpactRequest = LeaveImpactScope & {
  academicYearId: string;
  policyId?: string;
  action: 'inspect' | 'create' | 'update' | 'set-default' | 'archive';
  proposal?: Record<string, unknown>;
};
export type LeaveImpactReview = {
  policyId?: string;
  action: string;
  currentVersion?: number;
  proposedVersion?: number;
  requiresConfirmation: boolean;
  confirmationToken?: string;
  expiresAt?: string;
  warnings: Array<{ code: string; message: string; severity: string }>;
  blockingWarnings: Array<{ code: string; message: string; severity: string }>;
  differences: Array<{
    fieldKey: string;
    fieldLabel: string;
    fromDisplayValue: string;
    toDisplayValue: string;
  }>;
  impact: {
    asOfDate: string;
    fromDate: string;
    toDate: string;
    calculatedAt: string;
    completeness: string;
    fingerprint: string;
    limitation: string;
    measures: Record<
      string,
      {
        status: string;
        count: number | null;
        definition: string;
        scope: string;
        availabilityReason?: string;
        drilldownKey?: string;
      }
    >;
    payrollPeriods: Array<{
      month: string;
      snapshotEmployeeCount: number;
      settlementEmployeeCount: number;
      lockedSnapshotEmployeeCount: number;
      lockState: string;
    }>;
  };
};
export type LeaveImpactPage = {
  totalCount: number;
  assessedTotalCount: number;
  redactedCount: number;
  isScopeRestricted: boolean;
  items: Array<{
    id: string;
    label: string;
    status: string;
    currentSource?: string;
    proposedSource?: string;
    currentPolicyId?: string;
    proposedPolicyId?: string;
    period?: string;
    fromDate?: string;
    toDate?: string;
  }>;
};
export type LeaveReviewApproval = { impactToken?: string; impactScope: LeaveImpactScope };

export function leaveImpactScope(
  year: { startDate?: string; endDate?: string },
  expectedVersion?: number
): LeaveImpactScope {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const start = year.startDate?.slice(0, 10);
  const end = year.endDate?.slice(0, 10);
  return {
    asOfDate: start && date < start ? start : end && date > end ? end : date,
    fromDate: start,
    toDate: end,
    expectedVersion,
  };
}

export function policyImpactRequest(
  policy: ILeavePolicy,
  action: LeaveImpactRequest['action'],
  year: { id: string; startDate?: string; endDate?: string }
): LeaveImpactRequest {
  return {
    academicYearId: year.id,
    policyId: policy.id,
    action,
    ...leaveImpactScope(year, policy.version),
  };
}
