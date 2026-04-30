import dayjs from 'dayjs';

import { normalizeLeaveStatus } from './leave-status.utils';

export type LeaveBalanceMatch = {
  leavePolicyId?: string;
  leaveTypeMasterId?: string;
  leaveTypeName?: string;
  entitledDays?: number;
  usedDays?: number;
  remainingDays?: number;
};

export type NormalizedBalanceMetrics = {
  entitledDays: number;
  usedDays: number;
  remainingDays: number;
  entitledPct: number;
  usedPct: number;
  remainingPct: number;
};

export function stripHtml(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getLeaveRequestReason(detail: any, fallback?: any): string {
  const candidates = [detail?.description, detail?.reason, fallback?.description, fallback?.reason];

  return candidates.map(stripHtml).find(Boolean) || '-';
}

export function findMatchingBalanceItem(
  detail: any,
  balanceItems: any[] = []
): LeaveBalanceMatch | null {
  const detailPolicyId = String(detail?.leavePolicyId ?? '');
  const detailLeaveType = String(detail?.leaveType ?? '')
    .trim()
    .toUpperCase();

  const match = balanceItems.find((item) => {
    const policyMatches = detailPolicyId && String(item?.leavePolicyId ?? '') === detailPolicyId;
    const leaveTypeMatches =
      detailLeaveType &&
      String(item?.leaveTypeName ?? '')
        .trim()
        .toUpperCase() === detailLeaveType;

    return policyMatches || leaveTypeMatches;
  });

  return match ?? null;
}

export function buildRecentLeaveRequests(
  items: any[] = [],
  currentRequestId?: string,
  employeeId?: string
) {
  return items
    .filter((item) => {
      if (!item?.id || String(item.id) === String(currentRequestId ?? '')) {
        return false;
      }

      if (employeeId && String(item?.employeeId ?? '') !== String(employeeId)) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      const leftDate = dayjs(left?.startDate ?? left?.createdAt ?? left?.appliedDate);
      const rightDate = dayjs(right?.startDate ?? right?.createdAt ?? right?.appliedDate);
      return rightDate.valueOf() - leftDate.valueOf();
    })
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      leaveType: item.leaveType ?? '-',
      startDate: item.startDate,
      endDate: item.endDate,
      totalDays: item.totalDays ?? 0,
      status: item.status,
      remarks: stripHtml(item?.remarks),
      reason: getLeaveRequestReason(item),
      submittedByName: item?.submittedByName ?? '-',
      normalizedStatus: normalizeLeaveStatus(item?.status),
    }));
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export function getNormalizedBalanceMetrics(
  balance?: LeaveBalanceMatch | null
): NormalizedBalanceMetrics {
  const entitledDays = Number(balance?.entitledDays ?? 0);
  const usedDays = Number(balance?.usedDays ?? 0);
  const remainingDays = Number(balance?.remainingDays ?? 0);
  const safeEntitled = Number.isFinite(entitledDays) ? Math.max(0, entitledDays) : 0;
  const safeUsed = Number.isFinite(usedDays) ? Math.max(0, usedDays) : 0;
  const safeRemaining = Number.isFinite(remainingDays) ? Math.max(0, remainingDays) : 0;
  const denominator = safeEntitled > 0 ? safeEntitled : Math.max(safeUsed + safeRemaining, 1);

  return {
    entitledDays: safeEntitled,
    usedDays: safeUsed,
    remainingDays: safeRemaining,
    entitledPct: safeEntitled > 0 ? 100 : 0,
    usedPct: clampPercent((safeUsed / denominator) * 100),
    remainingPct: clampPercent((safeRemaining / denominator) * 100),
  };
}
