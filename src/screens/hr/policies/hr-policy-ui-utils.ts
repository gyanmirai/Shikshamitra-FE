import type { HrPolicyVersion } from 'src/redux/hr/hr-policy-api';

import dayjs from 'dayjs';

export type AttendanceNumericField =
  | 'fullDayThresholdPercentage'
  | 'halfDayThresholdPercentage'
  | 'absentThresholdPercentage'
  | 'graceTime'
  | 'maxLateAllowedPerMonth'
  | 'penaltyCountThreshold'
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
  absentThresholdPercentage: { min: 0, max: 100, maxLength: 3, label: 'Absent threshold' },
  graceTime: { min: 0, max: 240, maxLength: 3, label: 'Late grace minutes' },
  maxLateAllowedPerMonth: {
    min: 0,
    max: 31,
    maxLength: 2,
    label: 'Allowed late arrivals per month',
  },
  penaltyCountThreshold: { min: 0, max: 31, maxLength: 2, label: 'Late count before deduction' },
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

const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}(T|\s)|^\d{8}T\d{2}:\d{2}:\d{2}/;

export function cleanVersionDisplayValue(value?: string | null) {
  if (!value || value === 'null' || value === 'undefined') return 'Not set';
  const trimmed = value.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return 'Unknown reference';
  }
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'Changed';
  }

  const normalizedIso = trimmed.replace(
    /^(\d{4})(\d{2})(\d{2})T/,
    (_match, year, month, day) => `${year}-${month}-${day}T`
  );
  const parsedDate = dayjs(normalizedIso);
  if (parsedDate.isValid() && ISO_DATE_TIME_PATTERN.test(trimmed)) {
    return parsedDate.format('DD MMM YYYY, hh:mm A');
  }

  return value;
}
