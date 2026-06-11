import { normalizeLeaveStatus } from './leave-status.utils';

export interface LeaveTypeBreakdown {
  leaveTypeId: string;
  leaveTypeName: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
}

export interface LeaveOverviewData {
  totalLeaves: number;
  usedLeaves: number;
  remainingLeaves: number;
  pendingLeaves: number;
  leaveTypeBreakdown: LeaveTypeBreakdown[];
}

export const EMPTY_LEAVE_OVERVIEW: LeaveOverviewData = {
  totalLeaves: 0,
  usedLeaves: 0,
  remainingLeaves: 0,
  pendingLeaves: 0,
  leaveTypeBreakdown: [],
};

export function buildLeaveOverview(balanceData?: any, historyData?: any): LeaveOverviewData {
  const balanceItems = balanceData?.items ?? [];
  const historyItems = historyData?.items ?? [];

  if (!balanceItems.length) {
    return EMPTY_LEAVE_OVERVIEW;
  }

  const totalLeaves = balanceItems.reduce(
    (sum: number, item: any) => sum + (item.entitledDays ?? 0),
    0
  );
  const usedLeaves = balanceItems.reduce((sum: number, item: any) => sum + (item.usedDays ?? 0), 0);
  const remainingLeaves = balanceItems.reduce(
    (sum: number, item: any) => sum + (item.remainingDays ?? 0),
    0
  );
  const pendingLeaves = historyItems.filter(
    (item: any) => normalizeLeaveStatus(item?.status) === 'PENDING'
  ).length;

  return {
    totalLeaves,
    usedLeaves,
    remainingLeaves,
    pendingLeaves,
    leaveTypeBreakdown: balanceItems.map((item: any) => {
      const leaveTypeName = item.leaveTypeName ?? item.policyName ?? '-';

      return {
        leaveTypeId: item.leaveTypeMasterId,
        leaveTypeName,
        total: item.entitledDays ?? 0,
        used: item.usedDays ?? 0,
        pending: historyItems.filter((historyItem: any) => {
          const matchesLeaveType = String(historyItem?.leaveType ?? '') === String(leaveTypeName);
          return matchesLeaveType && normalizeLeaveStatus(historyItem?.status) === 'PENDING';
        }).length,
        remaining: item.remainingDays ?? 0,
      };
    }),
  };
}

export const LEAVE_OVERVIEW_CARDS = (data: LeaveOverviewData = EMPTY_LEAVE_OVERVIEW) => [
  {
    title: 'Balance',
    value: data.remainingLeaves,
    icon: 'solar:calendar-add-bold-duotone',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    title: 'Leaves Taken',
    value: data.usedLeaves,
    icon: 'solar:check-circle-bold-duotone',
    color: 'warning.main',
    bgColor: 'warning.lighter',
  },
  {
    title: 'Pending Leave',
    value: data.pendingLeaves,
    icon: 'solar:clock-circle-bold-duotone',
    color: 'info.main',
    bgColor: 'info.lighter',
  },
  {
    title: 'Total Entitlement',
    value: data.totalLeaves,
    icon: 'solar:calendar-bold-duotone',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
];
