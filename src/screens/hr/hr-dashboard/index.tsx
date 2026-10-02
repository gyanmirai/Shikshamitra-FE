'use client';

import type { RootState } from 'src/redux/store';
import type { GrantedPermission } from 'src/utils/permissions';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';

import OperationalDashboard from './OperationalDashboard';

export default function HRDashboardScreen() {
  const { data: session } = useSession();
  const permissions: GrantedPermission[] = useSelector(
    (state: RootState) => state.auth.permissions
  );
  const profile = (
    session as {
      user?: { organizationName?: string };
      profile?: { sub?: string; tenantId?: string; tenantid?: string; tenant?: string };
    } | null
  )?.profile;
  const accessKey = JSON.stringify([
    profile?.sub,
    profile?.tenantId ||
      profile?.tenantid ||
      profile?.tenant ||
      (session?.user as { organizationName?: string })?.organizationName,
    permissions
      .filter((permission) => permission.isGranted)
      .map((permission) => permission.name)
      .sort(),
  ]);
  // Remount on identity or grants changes. Unused operational queries have zero cache retention.
  return <OperationalDashboard key={accessKey} cacheIdentity={accessKey} />;
}
