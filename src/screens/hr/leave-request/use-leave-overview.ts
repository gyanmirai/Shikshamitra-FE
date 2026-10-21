import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetLeaveRequestsQuery,
  useGetMyLeaveBalanceQuery,
  useGetMyLeaveRequestsQuery,
  useGetSelfLeaveBalanceQuery,
} from 'src/redux/hr/leaveApi';

import { parseApiProblemDetail, LEAVE_EMPLOYEE_NOT_FOUND } from './leave-request.utils';
import { buildLeaveOverview, shouldFetchHrEmployeeLeaveOverview } from './leave-overview.utils';

export type LeaveOverviewMode = 'hr' | 'self';

type UseLeaveOverviewOptions = {
  mode?: LeaveOverviewMode;
  employeeId?: string;
  enabled?: boolean;
};

export function useLeaveOverview({
  mode = 'hr',
  employeeId,
  enabled = true,
}: UseLeaveOverviewOptions = {}) {
  const isSelfMode = mode === 'self';
  const isEmployeeProfileMode = Boolean(employeeId);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { employee } = useSelector((state: any) => state.auth);
  const resolvedEmployeeId = isEmployeeProfileMode ? employeeId : employee?.id;
  const canFetchHrEmployeeOverview = shouldFetchHrEmployeeLeaveOverview({
    enabled,
    isSelfMode,
    academicYearId: currentYear?.id,
    employeeId: resolvedEmployeeId,
  });

  const {
    currentData: balanceDataForHr,
    error: balanceErrorForHr,
    refetch: refetchBalanceForHr,
    isLoading: isBalanceLoadingForHr,
    isFetching: isBalanceFetchingForHr,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMyLeaveBalanceQuery,
    params: { academicYearId: currentYear?.id, employeeId: resolvedEmployeeId },
    options: { skip: !canFetchHrEmployeeOverview },
  });

  const {
    currentData: balanceDataForSelf,
    error: balanceErrorForSelf,
    refetch: refetchBalanceForSelf,
    isLoading: isBalanceLoadingForSelf,
    isFetching: isBalanceFetchingForSelf,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSelfLeaveBalanceQuery,
    params: { academicYearId: currentYear?.id },
    options: { skip: !enabled || !currentYear?.id || !isSelfMode },
    popupConfig: { error: false },
  });

  const {
    currentData: historyDataForHr,
    isLoading: isHistoryLoadingForHr,
    isFetching: isHistoryFetchingForHr,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLeaveRequestsQuery,
    params: {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 100,
      employeeId: resolvedEmployeeId,
    },
    options: {
      skip: !canFetchHrEmployeeOverview,
    },
  });

  const {
    currentData: historyDataForSelf,
    error: historyErrorForSelf,
    isLoading: isHistoryLoadingForSelf,
    isFetching: isHistoryFetchingForSelf,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMyLeaveRequestsQuery,
    params: { academicYearId: currentYear?.id, page: 1, pageSize: 100 },
    options: { skip: !enabled || !currentYear?.id || !isSelfMode },
    popupConfig: { error: false },
  });

  const balanceData = isSelfMode ? balanceDataForSelf : balanceDataForHr;
  const historyData = isSelfMode ? historyDataForSelf : historyDataForHr;
  const isLoadingBalance = isSelfMode
    ? isBalanceLoadingForSelf || isBalanceFetchingForSelf
    : isBalanceLoadingForHr || isBalanceFetchingForHr;
  const isLoadingHistory = isSelfMode
    ? isHistoryLoadingForSelf || isHistoryFetchingForSelf
    : isHistoryLoadingForHr || isHistoryFetchingForHr;
  const selfAccessError =
    isSelfMode &&
    [balanceErrorForSelf, historyErrorForSelf].some(
      (queryError) => parseApiProblemDetail(queryError).errorCode === LEAVE_EMPLOYEE_NOT_FOUND
    );

  const overview = useMemo(
    () => buildLeaveOverview(balanceData, historyData),
    [balanceData, historyData]
  );

  return {
    balanceData,
    balanceError: isSelfMode ? balanceErrorForSelf : balanceErrorForHr,
    refetchBalance: isSelfMode ? refetchBalanceForSelf : refetchBalanceForHr,
    historyData,
    overview,
    isLoadingBalance,
    isLoadingHistory,
    selfAccessError,
  };
}
