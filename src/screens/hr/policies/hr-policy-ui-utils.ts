import type { HrPolicyVersion } from 'src/redux/hr/hr-policy-api';

import { formatHrAuditValue, getHrAuditValueText } from 'src/utils/hr-audit-format';

export type AttendanceNumericField =
  | 'fullDayThresholdPercentage'
  | 'halfDayThresholdPercentage'
  | 'absentThresholdPercentage'
  | 'graceTime'
  | 'maxLateAllowedPerMonth'
  | 'penaltyCountThreshold'
  | 'penaltyDeductionAmount'
  | 'earlyExitGraceTime'
  | 'minOvertimeMinutes';

export type AttendanceNumericRule = {
  min: number;
  max: number;
  maxLength: number;
  label: string;
  allowEmpty?: boolean;
};

export const attendanceNumericRules: Record<AttendanceNumericField, AttendanceNumericRule> = {
  fullDayThresholdPercentage: { min: 0, max: 100, maxLength: 3, label: 'Full day threshold' },
  halfDayThresholdPercentage: { min: 0, max: 100, maxLength: 3, label: 'Half day threshold' },
  absentThresholdPercentage: {
    min: 0,
    max: 100,
    maxLength: 3,
    label: 'Absence Conversion Threshold',
  },
  graceTime: { min: 0, max: 240, maxLength: 3, label: 'Grace Period' },
  maxLateAllowedPerMonth: {
    min: 0,
    max: 31,
    maxLength: 2,
    label: 'Monthly Late Allowance',
  },
  penaltyCountThreshold: { min: 0, max: 31, maxLength: 2, label: 'Apply Penalty After' },
  penaltyDeductionAmount: {
    min: 1,
    max: 1000000,
    maxLength: 7,
    label: 'Penalty deduction amount',
    allowEmpty: true,
  },
  earlyExitGraceTime: { min: 0, max: 240, maxLength: 3, label: 'Early exit grace minutes' },
  minOvertimeMinutes: {
    min: 0,
    max: 1440,
    maxLength: 4,
    label: 'Minimum overtime minutes',
    allowEmpty: true,
  },
};

export function sanitizeNumericPolicyInput(value: string, rule: AttendanceNumericRule) {
  return value.replace(/\D/g, '').slice(0, rule.maxLength);
}

export function clampNumericPolicyInput(value: string, rule: AttendanceNumericRule) {
  const sanitized = sanitizeNumericPolicyInput(value, rule);
  if (!sanitized) return rule.allowEmpty ? '' : String(rule.min);

  const parsed = Number(sanitized);
  if (!Number.isFinite(parsed)) return rule.allowEmpty ? '' : String(rule.min);
  return String(Math.min(rule.max, Math.max(rule.min, parsed)));
}

export function getNumericPolicyInputError(value: string, rule: AttendanceNumericRule) {
  if (!value) return rule.allowEmpty ? '' : `${rule.label} is required.`;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < rule.min || parsed > rule.max) {
    return `${rule.label} must be between ${rule.min} and ${rule.max}.`;
  }

  return '';
}

export function isAttendanceThresholdOrderValid(full: number, half: number, absent: number) {
  return full > half && half >= absent;
}

export function normalizeEditableDefault(status?: string, isDefault?: boolean) {
  return status === 'active' && Boolean(isDefault);
}

export function getAttendanceOvertimeValidationError({
  overtimeEnabled,
  overtimeRate,
  minOvertimeMinutes,
}: {
  overtimeEnabled: boolean;
  overtimeRate?: string | null;
  minOvertimeMinutes?: string | null;
}) {
  if (!overtimeEnabled) return '';
  if (!overtimeRate?.trim()) return 'Overtime rate is required when overtime is enabled.';
  if (minOvertimeMinutes == null || minOvertimeMinutes.trim() === '') {
    return 'Minimum overtime minutes are required when overtime is enabled.';
  }
  return '';
}

export function versionMatchesHistorySearch(version: HrPolicyVersion, rawSearch: string) {
  const search = rawSearch.trim().toLowerCase();
  if (!search) return true;

  return [
    version.name,
    version.changeReason || '',
    version.createdByName || version.creatorId || '',
    version.changeAction,
    `v${version.versionNumber}`,
    String(version.versionNumber),
  ].some((value) => value.toLowerCase().replace(/[_-]/g, ' ').includes(search));
}

export function cleanVersionDisplayValue(value?: string | null, options?: { full?: boolean }) {
  if (!value || value === 'null' || value === 'undefined') return 'Not set';
  return options?.full ? getHrAuditValueText(value) : formatHrAuditValue(value);
}
