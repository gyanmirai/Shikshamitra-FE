import { normalizeLeaveStatus } from './leave-status.utils';

export interface LeaveTypeBreakdown {
  leaveTypeId: string;
  leaveTypeName: string;
  total: number;
  used: number;
  pendingDays: number;
  remaining: number;
  isUnlimited: boolean;
}

export interface LeaveOverviewData {
  totalLeaves: number;
  usedLeaves: number;
  remainingLeaves: number;
  pendingLeaveDays: number;
  leaveTypeBreakdown: LeaveTypeBreakdown[];
}

export const EMPTY_LEAVE_OVERVIEW: LeaveOverviewData = {
  totalLeaves: 0,
  usedLeaves: 0,
  remainingLeaves: 0,
  pendingLeaveDays: 0,
  leaveTypeBreakdown: [],
};

const UNLIMITED_REMAINING_DAYS_THRESHOLD = 1_000_000;

function toFiniteNumber(value: unknown): number {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function isUnlimitedLeaveBalance(item: any): boolean {
  const remainingDays = toFiniteNumber(item?.remainingDays);

  return Boolean(
    item?.allowNegativeBalance ||
    item?.isUnlimited ||
    item?.unlimited ||
    remainingDays >= UNLIMITED_REMAINING_DAYS_THRESHOLD
  );
}

export function formatLeaveDays(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function normalizeLeaveTypeName(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function getLeaveTypeMasterId(item: any): string {
  return String(item?.leaveTypeMasterId ?? item?.leaveTypeId ?? '');
}

function getLeaveUnits(item: any): number {
  return toFiniteNumber(item?.totalDays);
}

function hasAuthoritativePendingDays(items: any[]): boolean {
  return items.some((item) => item?.pendingDays != null);
}

function getPendingUnits(item: any): number {
  return toFiniteNumber(item?.pendingDays);
}

function resolvePendingDaysForBalanceItem({
  item,
  leaveTypeId,
  leaveTypeName,
  pendingDaysByLeaveTypeId,
  pendingDaysByLeaveTypeName,
}: {
  item: any;
  leaveTypeId: string;
  leaveTypeName: string;
  pendingDaysByLeaveTypeId: Map<string, number>;
  pendingDaysByLeaveTypeName: Map<string, number>;
}): number {
  if (item?.pendingDays != null) {
    return getPendingUnits(item);
  }

  if (leaveTypeId && pendingDaysByLeaveTypeId.has(leaveTypeId)) {
    return pendingDaysByLeaveTypeId.get(leaveTypeId) ?? 0;
  }

  return pendingDaysByLeaveTypeName.get(normalizeLeaveTypeName(leaveTypeName)) ?? 0;
}

export function shouldFetchHrEmployeeLeaveOverview({
  enabled,
  isSelfMode,
  academicYearId,
  employeeId,
}: {
  enabled: boolean;
  isSelfMode: boolean;
  academicYearId?: string | null;
  employeeId?: string | null;
}): boolean {
  return Boolean(enabled && !isSelfMode && academicYearId && employeeId);
}

export function buildLeaveOverview(balanceData?: any, historyData?: any): LeaveOverviewData {
  const balanceItems = balanceData?.items ?? [];
  const historyItems = historyData?.items ?? [];

  if (!balanceItems.length) {
    return EMPTY_LEAVE_OVERVIEW;
  }

  const finiteBalanceItems = balanceItems.filter((item: any) => !isUnlimitedLeaveBalance(item));

  const totalLeaves = finiteBalanceItems.reduce(
    (sum: number, item: any) => sum + toFiniteNumber(item.entitledDays),
    0
  );
  const usedLeaves = balanceItems.reduce(
    (sum: number, item: any) => sum + toFiniteNumber(item.usedDays),
    0
  );
  const remainingLeaves = finiteBalanceItems.reduce(
    (sum: number, item: any) => sum + toFiniteNumber(item.remainingDays),
    0
  );
  const useBalancePendingDays = hasAuthoritativePendingDays(balanceItems);
  const pendingItems = historyItems.filter(
    (item: any) => normalizeLeaveStatus(item?.status) === 'PENDING'
  );
  const pendingLeaveDays = useBalancePendingDays
    ? balanceItems.reduce((sum: number, item: any) => sum + getPendingUnits(item), 0)
    : pendingItems.reduce((sum: number, item: any) => sum + getLeaveUnits(item), 0);
  const pendingDaysByLeaveTypeId = pendingItems.reduce((map: Map<string, number>, item: any) => {
    const leaveTypeId = getLeaveTypeMasterId(item);
    if (!leaveTypeId) {
      return map;
    }

    map.set(leaveTypeId, (map.get(leaveTypeId) ?? 0) + getLeaveUnits(item));
    return map;
  }, new Map<string, number>());
  const pendingDaysByLeaveTypeName = pendingItems.reduce((map: Map<string, number>, item: any) => {
    const leaveTypeName = normalizeLeaveTypeName(item?.leaveType);
    if (!leaveTypeName) {
      return map;
    }

    map.set(leaveTypeName, (map.get(leaveTypeName) ?? 0) + getLeaveUnits(item));
    return map;
  }, new Map<string, number>());

  return {
    totalLeaves,
    usedLeaves,
    remainingLeaves,
    pendingLeaveDays,
    leaveTypeBreakdown: balanceItems.map((item: any) => {
      const leaveTypeName = item.leaveTypeName ?? item.policyName ?? '-';
      const leaveTypeId = getLeaveTypeMasterId(item);
      const isUnlimited = isUnlimitedLeaveBalance(item);
      const pendingDays = resolvePendingDaysForBalanceItem({
        item,
        leaveTypeId,
        leaveTypeName,
        pendingDaysByLeaveTypeId,
        pendingDaysByLeaveTypeName,
      });

      return {
        leaveTypeId,
        leaveTypeName,
        total: toFiniteNumber(item.entitledDays),
        used: toFiniteNumber(item.usedDays),
        pendingDays,
        remaining: isUnlimited ? 0 : toFiniteNumber(item.remainingDays),
        isUnlimited,
      };
    }),
  };
}
