import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export const STAFF_POLICY_REQUIREMENTS = [
  { name: 'HR.Policies.View', label: 'View payroll and attendance policies' },
  { name: 'HR.LeaveManagement.Setting.LeavePolicy.View', label: 'View leave policies' },
  { name: 'HR.Policies.Assign', label: 'Assign staff policies' },
  { name: 'HR.Policies.PreviewImpact', label: 'Preview policy assignment impact' },
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
    denied.push(STAFF_POLICY_REQUIREMENTS[0]);
  }
  if (asRecord(leaveError).status === 403) denied.push(STAFF_POLICY_REQUIREMENTS[1]);
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
