import type { RootState } from 'src/redux/store';

import { useSession } from 'next-auth/react';
import { studentType } from 'src/redux/tagTypes';
import { useDispatch, useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { studentPermissions } from 'src/constants/student-menu';
import {
  studentModuleDashboardApi,
  useGetStudentModuleDashboardContextQuery,
} from 'src/redux/student/dashboard/student-module-dashboard-api';

import { dashboardIdentityKey, permittedDashboardLinks } from '../dashboard-access';

export default function useStudentDashboard() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const initialized = useSelector((state: RootState) => state.auth.permissionsInitialized);
  const year = useSelector((state: RootState) => state.globalState.currentYear);
  const profile: unknown = session && 'profile' in session ? session.profile : undefined;
  const identityKey = dashboardIdentityKey(profile, permissions);
  const canRead = initialized && hasGrantedPermission(permissions, studentPermissions.dashboard);
  const query = useGetStudentModuleDashboardContextQuery(
    { identityKey },
    {
      skip: status !== 'authenticated' || !canRead || !identityKey,
      refetchOnMountOrArgChange: true,
    }
  );
  const context =
    status === 'authenticated' && canRead && !query.isError ? query.currentData : undefined;
  const refresh = () =>
    dispatch(
      studentModuleDashboardApi.util.invalidateTags([
        { type: studentType.student, id: 'MODULE-DASHBOARD' },
      ])
    );
  return {
    ...query,
    context,
    initialized,
    canRead,
    year,
    identityKey,
    permissions,
    links: permittedDashboardLinks(context?.links ?? [], permissions),
    refresh,
  };
}
