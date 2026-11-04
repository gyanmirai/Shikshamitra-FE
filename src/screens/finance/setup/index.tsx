'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { SplashScreen } from 'src/components/loading-screen';
import {
  financePaths,
  financePermissions,
  financeSetupViewPermissions,
} from 'src/constants/finance-menu';

import FinanceSetupWorkspace from './FinanceSetupWorkspace';
import { safeFinanceReturnTo } from './finance-setup-model';
import { financeSetupSettings, financeWorkflowGuides } from './finance-setup-catalog';

export default function FinanceSetupScreen() {
  const params = useSearchParams();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { sessionContext, permissions, user, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  if (loading || !permissionsInitialized) return <SplashScreen />;
  if (
    sessionContext?.accountMode !== 'tenant' ||
    !sessionContext.tenantId ||
    !user?.sub ||
    !hasGrantedPermission(permissions, financePermissions.root) ||
    !hasGrantedPermission(permissions, financeSetupViewPermissions)
  )
    return <View403 />;

  const destinations = [
    ...financeSetupSettings,
    ...financeWorkflowGuides,
    {
      path: financePaths.fees.structureAssign,
      permission: `${financePermissions.fees.structureAssign}.View`,
    },
    { path: financePaths.dashboard, permission: financePermissions.dashboard },
  ];
  const fallback = hasGrantedPermission(permissions, financePermissions.dashboard)
    ? financePaths.dashboard
    : (destinations.find((item) => hasGrantedPermission(permissions, item.permission))?.path ??
      '/dashboard');
  const requested = params.get('returnTo');
  const returnTo =
    requested &&
    safeFinanceReturnTo(requested) === requested &&
    destinations.some(
      (item) =>
        item.path === requested.split(/[?#]/)[0] &&
        hasGrantedPermission(permissions, item.permission)
    )
      ? requested
      : fallback;
  const identity = `${sessionContext.tenantId}:${user.sub}`;
  const yearId = currentYear?.id ?? '';
  return (
    <FinanceSetupWorkspace
      key={`${identity}:${yearId}`}
      scope={{ tenantCacheKey: identity, academicYearId: yearId }}
      returnTo={returnTo}
      permissions={permissions}
    />
  );
}
