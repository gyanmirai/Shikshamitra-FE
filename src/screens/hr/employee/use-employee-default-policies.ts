import { useGetLeavePoliciesQuery } from 'src/redux/hr/leaveApi';
import {
  useGetPayrollPoliciesQuery,
  useGetAttendancePoliciesQuery,
} from 'src/redux/hr/hr-policy-api';

import { getDeniedStaffPolicyReads } from './employee-policy-access';
import { getDefaultPolicySetupState } from '../policies/hr-policy-workspace-utils';

type PolicyOption = { id: string; status?: string; isActive?: boolean; isDefault?: boolean };

const activeDefaults = <T extends PolicyOption>(items: T[] = [], leave = false) =>
  items.filter(
    (item) =>
      item.isDefault &&
      (String(item.status).toLowerCase() === 'active' || (leave && item.isActive === true))
  );

export function useEmployeeDefaultPolicies(academicYearId: string | undefined, enabled: boolean) {
  const options = { skip: !enabled || !academicYearId, refetchOnMountOrArgChange: true };
  const payroll = useGetPayrollPoliciesQuery({ academicYearId, maxResultCount: 100 }, options);
  const attendance = useGetAttendancePoliciesQuery(
    { academicYearId, maxResultCount: 100 },
    options
  );
  const leave = useGetLeavePoliciesQuery({ academicYearId, page: 1, pageSize: 500 }, options);
  const payrollDefaults = activeDefaults(payroll.currentData?.items);
  const attendanceDefaults = activeDefaults(attendance.currentData?.items);
  const leaveDefaults = activeDefaults<PolicyOption>(leave.currentData?.items, true);
  const loading =
    enabled &&
    Boolean(academicYearId) &&
    [payroll, attendance, leave].some((query) => query.isLoading || query.isFetching);
  const denied = enabled
    ? getDeniedStaffPolicyReads({
        payrollError: payroll.error,
        attendanceError: attendance.error,
        leaveError: leave.error,
      })
    : [];
  const setupStates = {
    payroll: getDefaultPolicySetupState({
      data: payroll.currentData,
      loading,
      error: payroll.error,
      items: payrollDefaults,
    }),
    attendance: getDefaultPolicySetupState({
      data: attendance.currentData,
      loading,
      error: attendance.error,
      items: attendanceDefaults,
    }),
    leave: getDefaultPolicySetupState({
      data: leave.currentData,
      loading,
      error: leave.error,
      items: leaveDefaults,
    }),
  };
  const retry = async () => {
    await Promise.all(
      [payroll, attendance, leave]
        .filter((query) => !query.isUninitialized)
        .map((query) => query.refetch())
    );
  };
  return {
    payrollPolicy: payrollDefaults.length === 1 ? payrollDefaults[0] : undefined,
    attendancePolicy: attendanceDefaults.length === 1 ? attendanceDefaults[0] : undefined,
    leavePolicy: leaveDefaults.length === 1 ? leaveDefaults[0] : undefined,
    loading,
    denied,
    setupStates,
    retry,
    hasError: enabled && [payroll, attendance, leave].some((query) => Boolean(query.error)),
    hasMultipleDefaults: Object.values(setupStates).includes('multiple'),
  };
}
