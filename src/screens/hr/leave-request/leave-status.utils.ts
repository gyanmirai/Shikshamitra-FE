import type { LabelColor } from 'src/components/label';

import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';

export type NormalizedLeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'VIEWED' | 'UNKNOWN';

const STATUS_LABELS: Record<Exclude<NormalizedLeaveStatus, 'UNKNOWN'>, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  VIEWED: 'Viewed',
};

const STATUS_COLORS: Record<Exclude<NormalizedLeaveStatus, 'UNKNOWN'>, LabelColor> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  VIEWED: 'info',
};

const NUMERIC_TO_STATUS: Record<number, Exclude<NormalizedLeaveStatus, 'UNKNOWN'>> = {
  [EmployeeLeaveStatusType.Pending]: 'PENDING',
  [EmployeeLeaveStatusType.Approved]: 'APPROVED',
  [EmployeeLeaveStatusType.Rejected]: 'REJECTED',
  [EmployeeLeaveStatusType.Viewed]: 'VIEWED',
};

export function normalizeLeaveStatus(value: unknown): NormalizedLeaveStatus {
  if (typeof value === 'number') {
    return NUMERIC_TO_STATUS[value] ?? 'UNKNOWN';
  }

  if (typeof value !== 'string') {
    return 'UNKNOWN';
  }

  const normalized = value.trim().toUpperCase();
  if (normalized in STATUS_LABELS) {
    return normalized as Exclude<NormalizedLeaveStatus, 'UNKNOWN'>;
  }

  return 'UNKNOWN';
}

export function getLeaveStatusLabel(value: unknown): string {
  const normalized = normalizeLeaveStatus(value);
  if (normalized === 'UNKNOWN') {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    return 'Unknown';
  }
  return STATUS_LABELS[normalized];
}

export function getLeaveStatusColor(value: unknown): LabelColor {
  const normalized = normalizeLeaveStatus(value);
  if (normalized === 'UNKNOWN') {
    return 'default';
  }
  return STATUS_COLORS[normalized];
}
