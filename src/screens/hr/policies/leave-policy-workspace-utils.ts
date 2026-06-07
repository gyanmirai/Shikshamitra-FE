import type { ILeavePolicy } from '../attendance-setting/leave-type';

export type LeavePolicyRiskSeverity = 'blocking' | 'confirmation' | 'info';

export type LeavePolicyImpactReview = {
  policyId: string;
  policyName: string;
  action: 'archive' | 'update' | 'default-change' | 'effective-date-change';
  leaveTypeName: string;
  affectedEmployeeCount: number;
  affectedRequestCount: number;
  balanceImpactCount: number;
  payrollMonthRiskCount: number;
  assignmentConflictCount: number;
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

export function getLeavePolicyLeaveTypeName(policy: Partial<ILeavePolicy> | null | undefined) {
  const leaveType = policy?.leaveType;

  if (!leaveType) {
    return '-';
  }

  return typeof leaveType === 'object' ? leaveType.name || '-' : String(leaveType);
}

export function isLeavePolicyArchived(policy: Partial<ILeavePolicy> | null | undefined) {
  return Boolean(policy?.isDeleted || policy?.deletionTime || policy?.isActive === false);
}

export function buildLeavePolicyImpactReview(
  policy: Partial<ILeavePolicy>,
  action: LeavePolicyImpactReview['action']
): LeavePolicyImpactReview {
  const policyName = getLeavePolicyTitle(policy);
  const leaveTypeName = getLeavePolicyLeaveTypeName(policy);
  const leaveCount = Number(policy.leaveCount ?? 0);
  const requiresApproval = Boolean(policy.requiresApproval);
  const carryForward = Boolean(policy.carryForward);
  const encashmentAllowed = Boolean(policy.encashmentAllowed);
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
      message: `${policyName} currently grants ${leaveCount} leave day${leaveCount === 1 ? '' : 's'} per cycle. Balance changes can affect employees with this leave type.`,
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
        'Existing pending approvals should continue to show this leave policy and leave type.',
    });
  }

  return {
    policyId: policy.id || '',
    policyName,
    action,
    leaveTypeName,
    affectedEmployeeCount: leaveCount > 0 ? 1 : 0,
    affectedRequestCount: action === 'archive' ? 1 : 0,
    balanceImpactCount: leaveCount > 0 ? 1 : 0,
    payrollMonthRiskCount: encashmentAllowed ? 1 : 0,
    assignmentConflictCount: 0,
    risks,
    requiresConfirmation: risks.some((risk) => risk.severity !== 'info'),
  };
}
