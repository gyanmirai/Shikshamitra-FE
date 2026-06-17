import { normalizeLeaveStatus } from './leave-status.utils';

export interface LeaveBucketBreakdown {
  bucketId: string;
  bucketName: string;
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
  bucketBreakdown: LeaveBucketBreakdown[];
}

export const EMPTY_LEAVE_OVERVIEW: LeaveOverviewData = {
  totalLeaves: 0,
  usedLeaves: 0,
  remainingLeaves: 0,
  pendingLeaveDays: 0,
  bucketBreakdown: [],
};

const UNLIMITED_REMAINING_DAYS_THRESHOLD = 1_000_000;

function toFiniteNumber(value: unknown): number {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function isUnlimitedLeaveBalance(item: any): boolean {
  const remainingDays = toFiniteNumber(item?.remainingDays);

  return Boolean(
    item?.isUnlimited ||
    item?.unlimited ||
    String(item?.entitlementMode || '').toLowerCase() === 'unlimited' ||
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

function getPaidType(item: any): string {
  return String(item?.paidType ?? item?.leaveType ?? '')
    .trim()
    .toLowerCase() === 'unpaid'
    ? 'Unpaid'
    : 'Paid';
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

function getAccruedOrEntitledDays(item: any): number {
  return item?.accruedDays == null
    ? toFiniteNumber(item?.entitledDays)
    : toFiniteNumber(item?.accruedDays);
}

function resolvePendingDaysForBalanceItem({
  item,
  bucketName,
  pendingDaysByPaidType,
  pendingDaysByLeaveTypeName,
}: {
  item: any;
  bucketName: string;
  pendingDaysByPaidType: Map<string, number>;
  pendingDaysByLeaveTypeName: Map<string, number>;
}): number {
  if (item?.pendingDays != null) {
    return getPendingUnits(item);
  }

  const paidType = getPaidType(item);
  if (pendingDaysByPaidType.has(paidType)) {
    return pendingDaysByPaidType.get(paidType) ?? 0;
  }

  return pendingDaysByLeaveTypeName.get(normalizeLeaveTypeName(bucketName)) ?? 0;
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
    (sum: number, item: any) => sum + getAccruedOrEntitledDays(item),
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
  const pendingDaysByPaidType = pendingItems.reduce((map: Map<string, number>, item: any) => {
    const paidType = getPaidType(item);
    map.set(paidType, (map.get(paidType) ?? 0) + getLeaveUnits(item));
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
    bucketBreakdown: balanceItems.map((item: any) => {
      const paidType = getPaidType(item);
      const bucketName = item.paidType ?? item.leaveTypeName ?? paidType;
      const bucketId = paidType;
      const isUnlimited = isUnlimitedLeaveBalance(item);
      const pendingDays = resolvePendingDaysForBalanceItem({
        item,
        bucketName,
        pendingDaysByPaidType,
        pendingDaysByLeaveTypeName,
      });

      return {
        bucketId,
        bucketName,
        total: isUnlimited ? 0 : getAccruedOrEntitledDays(item),
        used: toFiniteNumber(item.usedDays),
        pendingDays,
        remaining: isUnlimited ? 0 : toFiniteNumber(item.remainingDays),
        isUnlimited,
      };
    }),
  };
}
