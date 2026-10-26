import { AccuralPolicyType } from 'src/enums/accuralPolicyType';

import type { ILeavePolicy } from './leave-policy-types';

export type LeavePolicyRiskSeverity = 'blocking' | 'confirmation' | 'info';

export type LeavePolicyImpactReview = {
  policyId: string;
  policyName: string;
  action: 'archive' | 'update' | 'default-change' | 'effective-date-change';
  bucketSummary: string;
  affectedEmployeeCount: null;
  affectedRequestCount: null;
  balanceImpactCount: null;
  payrollMonthRiskCount: null;
  assignmentConflictCount: null;
  risks: Array<{
    severity: LeavePolicyRiskSeverity;
    label: string;
    message: string;
  }>;
  requiresConfirmation: boolean;
};

export function getLeavePolicyTitle(policy: Partial<ILeavePolicy> | null | undefined) {
  return policy?.policyTitle || policy?.title || 'Untitled leave policy';
}

export function normalizeAccrualPolicyTypeValue(value: unknown) {
  if (value === AccuralPolicyType.Yearly || value === 'Yearly') {
    return AccuralPolicyType.Yearly;
  }

  if (value === AccuralPolicyType.Monthly || value === 'Monthly') {
    return AccuralPolicyType.Monthly;
  }

  return AccuralPolicyType.Yearly;
}

export function toAccrualPolicyTypeApiValue(value: AccuralPolicyType | string) {
  return normalizeAccrualPolicyTypeValue(value) === AccuralPolicyType.Monthly
    ? 'Monthly'
    : 'Yearly';
}

export function getLeavePolicyBucketSummary(policy: Partial<ILeavePolicy> | null | undefined) {
  const activeRules = (policy?.rules || []).filter((rule) => rule?.isActive !== false);
  if (activeRules.length > 0) {
    const buckets = activeRules.map((rule) =>
      String(rule?.paidType || '').toLowerCase() === 'unpaid' ? 'Unpaid' : 'Paid'
    );
    return Array.from(new Set(buckets)).join(', ');
  }
  return '-';
}

export function isLeavePolicyArchived(policy: Partial<ILeavePolicy> | null | undefined) {
  const status = String(policy?.status || '')
    .trim()
    .toLowerCase();
  if (status) {
    return status === 'archived' || Boolean(policy?.isDeleted || policy?.deletionTime);
  }

  return Boolean(policy?.isDeleted || policy?.deletionTime || policy?.isActive === false);
}

export function getCurrentLeavePolicyTitleSet(
  policies: Array<Partial<ILeavePolicy>> | null | undefined
): Set<string> {
  return new Set(
    (policies || [])
      .filter((policy) => !isLeavePolicyArchived(policy))
      .map((policy) => (policy.policyTitle || policy.title || '').trim().toLowerCase())
      .filter(Boolean)
  );
}

export function buildLeavePolicyImpactReview(
  policy: Partial<ILeavePolicy>,
  action: LeavePolicyImpactReview['action']
): LeavePolicyImpactReview {
  const policyName = getLeavePolicyTitle(policy);
  const bucketSummary = getLeavePolicyBucketSummary(policy);
  const activeRules = (policy.rules || []).filter((rule) => rule?.isActive !== false);
  const leaveCount = activeRules.reduce((sum, rule) => sum + Number(rule.leaveCount ?? 0), 0);
  const requiresApproval = activeRules.some((rule) => Boolean(rule.requiresApproval));
  const carryForward = activeRules.some((rule) => Boolean(rule.carryForward));
  const encashmentAllowed = activeRules.some((rule) => Boolean(rule.encashmentAllowed));
  const archived = isLeavePolicyArchived(policy);

  const risks: LeavePolicyImpactReview['risks'] = [];

  if (!policy.id) {
    risks.push({
      severity: 'blocking',
      label: 'Blocking',
      message: 'This policy does not have an id, so the action cannot be confirmed safely.',
    });
  }

  if (archived) {
    risks.push({
      severity: 'blocking',
      label: 'Blocking',
      message: 'This policy is already archived.',
    });
  }

  if (action === 'archive') {
    risks.push({
      severity: 'confirmation',
      label: 'Needs confirmation',
      message:
        'Archiving prevents this policy from future leave requests while preserving historical requests and balances.',
    });
  }

  if (leaveCount > 0) {
    risks.push({
      severity: 'confirmation',
      label: 'Needs confirmation',
      message: `${policyName} currently grants ${leaveCount} total leave day${leaveCount === 1 ? '' : 's'} across ${activeRules.length || 1} rule${activeRules.length === 1 ? '' : 's'}. Balance changes can affect assigned staff.`,
    });
  }

  if (encashmentAllowed) {
    risks.push({
      severity: 'confirmation',
      label: 'Needs confirmation',
      message:
        'Encashment is enabled, so payroll teams should review open or upcoming payroll months.',
    });
  }

  if (carryForward) {
    risks.push({
      severity: 'info',
      label: 'Informational',
      message: 'Carry forward is enabled; year-end balances should keep the archived policy name.',
    });
  }

  if (requiresApproval) {
    risks.push({
      severity: 'info',
      label: 'Informational',
      message:
        'Existing pending approvals should continue to show this leave policy and paid bucket.',
    });
  }

  return {
    policyId: policy.id || '',
    policyName,
    action,
    bucketSummary,
    // Policy configuration is not an affected-population query.
    affectedEmployeeCount: null,
    affectedRequestCount: null,
    balanceImpactCount: null,
    payrollMonthRiskCount: null,
    assignmentConflictCount: null,
    risks,
    requiresConfirmation: risks.some((risk) => risk.severity !== 'info'),
  };
}
