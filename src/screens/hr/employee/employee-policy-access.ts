import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  hrLeavePolicyPermissions,
  hrPolicyActionPermissions,
} from 'src/constants/hr-policy-permissions';

export const STAFF_POLICY_REQUIREMENTS_BY_ACTION = {
  viewPolicies: {
    name: hrPolicyActionPermissions.view,
    label: 'View payroll and attendance policies',
  },
  viewLeavePolicies: { name: hrLeavePolicyPermissions.view, label: 'View leave policies' },
  assignPolicies: { name: hrPolicyActionPermissions.assign, label: 'Assign staff policies' },
  previewPolicyImpact: {
    name: hrPolicyActionPermissions.previewImpact,
    label: 'Preview policy assignment impact',
  },
} as const;

export const STAFF_POLICY_REQUIREMENTS = [
  STAFF_POLICY_REQUIREMENTS_BY_ACTION.viewPolicies,
  STAFF_POLICY_REQUIREMENTS_BY_ACTION.viewLeavePolicies,
  STAFF_POLICY_REQUIREMENTS_BY_ACTION.assignPolicies,
  STAFF_POLICY_REQUIREMENTS_BY_ACTION.previewPolicyImpact,
] as const;

export type StaffPolicyRequirement = (typeof STAFF_POLICY_REQUIREMENTS)[number];

export function getMissingStaffPolicyPermissions(
  permissions: GrantedPermission[] | undefined
): StaffPolicyRequirement[] {
  return STAFF_POLICY_REQUIREMENTS.filter(({ name }) => !hasGrantedPermission(permissions, name));
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export function getDeniedStaffPolicyReads({
  payrollError,
  attendanceError,
  leaveError,
}: {
  payrollError?: unknown;
  attendanceError?: unknown;
  leaveError?: unknown;
}): StaffPolicyRequirement[] {
  const denied: StaffPolicyRequirement[] = [];
  if (asRecord(payrollError).status === 403 || asRecord(attendanceError).status === 403) {
    denied.push(STAFF_POLICY_REQUIREMENTS_BY_ACTION.viewPolicies);
  }
  if (asRecord(leaveError).status === 403) {
    denied.push(STAFF_POLICY_REQUIREMENTS_BY_ACTION.viewLeavePolicies);
  }
  return denied;
}

export function getStaffPolicySubmitDenial(error: unknown): StaffPolicyRequirement[] | null {
  if (parseApiProblemDetail(error).errorCode !== 'HR:Employee:010043') return null;

  const response = asRecord(asRecord(error).data);
  const businessData = asRecord(response.data ?? asRecord(response.error).data);
  const missing = businessData.missingPermissions ?? businessData.MissingPermissions;
  if (!Array.isArray(missing)) return [];

  return STAFF_POLICY_REQUIREMENTS.filter(({ name }) => missing.includes(name));
}
