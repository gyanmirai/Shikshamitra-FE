import type { RootState } from 'src/redux/store';

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { pfApi } from 'src/redux/PF/PFApi';
import { employeeApi } from 'src/redux/hr/employeeApi';
import { hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission } from 'src/utils/permissions';
import { salaryTemplateApi } from 'src/redux/hr/salary-template-api';
import { compensationRevisionApi } from 'src/redux/hr/compensation-revision-api';

// Share RTK Query's cache with the editor; repeated hover/focus events reuse recent requests.
const prefetchOptions = { ifOlderThan: 30 };

export function useSalaryEditorPrefetch(employeeId: string) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.compensationRevisionActions.manage
  );
  const canActivate = hasGrantedPermission(permissions, `${hrPermissions.employee.list}.Edit`);
  const prefetchEmployee = employeeApi.usePrefetch('getEmployeeById', prefetchOptions);
  const prefetchTemplates = salaryTemplateApi.usePrefetch(
    'getActiveSalaryTemplates',
    prefetchOptions
  );
  const prefetchPf = pfApi.usePrefetch('getPF', prefetchOptions);
  const prefetchRevisions = compensationRevisionApi.usePrefetch(
    'getCompensationRevisions',
    prefetchOptions
  );
  const prefetchReadiness = compensationRevisionApi.usePrefetch(
    'getEmployeeActivationReadiness',
    prefetchOptions
  );

  return useCallback(() => {
    if (!employeeId || !canManage) return;
    prefetchEmployee(employeeId);
    prefetchTemplates(undefined);
    prefetchPf({});
    prefetchRevisions(employeeId);
    if (canActivate) prefetchReadiness(employeeId);
  }, [
    employeeId,
    canManage,
    canActivate,
    prefetchEmployee,
    prefetchTemplates,
    prefetchPf,
    prefetchRevisions,
    prefetchReadiness,
  ]);
}
