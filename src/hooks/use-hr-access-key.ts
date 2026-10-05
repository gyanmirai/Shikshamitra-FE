'use client';

import type { RootState } from 'src/redux/store';
import type { GrantedPermission } from 'src/utils/permissions';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';

export function useHRAccessKey() {
  const { data: session } = useSession();
  const permissions: GrantedPermission[] = useSelector(
    (state: RootState) => state.auth.permissions
  );
  const profile = (
    session as {
      profile?: { sub?: string; tenantId?: string; tenantid?: string; tenant?: string };
    } | null
  )?.profile;
  return JSON.stringify([
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
}
