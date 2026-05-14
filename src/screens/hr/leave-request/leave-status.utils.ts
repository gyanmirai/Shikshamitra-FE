import type { LabelColor } from 'src/components/label';

import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';

export type NormalizedLeaveStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVIEWED'
  | 'CANCELLED'
  | 'UNKNOWN';

const STATUS_LABELS: Record<Exclude<NormalizedLeaveStatus, 'UNKNOWN'>, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVIEWED: 'Reviewed',
  CANCELLED: 'Cancelled',
};

const STATUS_COLORS: Record<Exclude<NormalizedLeaveStatus, 'UNKNOWN'>, LabelColor> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  REVIEWED: 'info',
  CANCELLED: 'default',
};

const NUMERIC_TO_STATUS: Record<number, Exclude<NormalizedLeaveStatus, 'UNKNOWN'>> = {
  [EmployeeLeaveStatusType.Pending]: 'PENDING',
  [EmployeeLeaveStatusType.Approved]: 'APPROVED',
  [EmployeeLeaveStatusType.Rejected]: 'REJECTED',
  [EmployeeLeaveStatusType.Reviewed]: 'REVIEWED',
  [EmployeeLeaveStatusType.Cancelled]: 'CANCELLED',
};

const STATUS_TO_NUMERIC: Record<
  Exclude<NormalizedLeaveStatus, 'UNKNOWN'>,
  EmployeeLeaveStatusType
> = {
  PENDING: EmployeeLeaveStatusType.Pending,
  APPROVED: EmployeeLeaveStatusType.Approved,
  REJECTED: EmployeeLeaveStatusType.Rejected,
  REVIEWED: EmployeeLeaveStatusType.Reviewed,
  CANCELLED: EmployeeLeaveStatusType.Cancelled,
};

export function normalizeLeaveStatus(value: unknown): NormalizedLeaveStatus {
  if (typeof value === 'number') {
    return NUMERIC_TO_STATUS[value] ?? 'UNKNOWN';
  }

  if (typeof value !== 'string') {
    return 'UNKNOWN';
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === 'VIEWED') {
    return 'REVIEWED';
  }

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

export function getLeaveStatusFilterValue(value: unknown): EmployeeLeaveStatusType | unknown {
  const normalized = normalizeLeaveStatus(value);
  if (normalized === 'UNKNOWN') {
    return value;
  }
  return STATUS_TO_NUMERIC[normalized];
}
