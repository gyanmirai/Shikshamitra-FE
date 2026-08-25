'use client';

import type { RootState } from 'src/redux/store';

import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { hrPermissions } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Grid, Alert, Stack, Button, Skeleton } from '@mui/material';
import {
  type HRDashboardSummary,
  parseHRDashboardPayload,
  sanitizeHRDashboardSummary,
  useGetHRDashboardPreviewQuery,
  useRefreshHRDashboardPreviewMutation,
} from 'src/redux/hr/hrDashboardApi';

import { HrDashboardContent } from './components/HrDashboardContent';
import { HrDashboardPreviewShell } from './components/HrDashboardPreviewShell';
import { type HrDashboardDisplayPermissions } from './hr-dashboard-view-model';
import { shouldShowDashboardSnapshotSkeleton } from './hr-dashboard-preview-state';
import { HrDashboardSnapshotEmptyState } from './components/HrDashboardSnapshotEmptyState';

const EmployeeProfileDashboard = dynamic(() => import('../employee/employee-dashboard'));

const hasRole = (role: unknown, expectedRole: string) => {
  if (Array.isArray(role)) {
    return role.some((item) => String(item).toLowerCase() === expectedRole);
  }

  return String(role || '').toLowerCase() === expectedRole;
};

const DashboardSkeleton = () => (
  <Stack spacing={2} aria-label="Loading HR dashboard">
    <Skeleton variant="rounded" height={156} />
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 7 }}>
        <Skeleton variant="rounded" height={420} />
      </Grid>
      <Grid size={{ xs: 12, lg: 5 }}>
        <Skeleton variant="rounded" height={420} />
      </Grid>
    </Grid>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 7 }}>
        <Skeleton variant="rounded" height={440} />
      </Grid>
      <Grid size={{ xs: 12, lg: 5 }}>
        <Skeleton variant="rounded" height={440} />
      </Grid>
    </Grid>
    <Skeleton variant="rounded" height={300} />
  </Stack>
);

const buildDisplayPermissions = (permissions: RootState['auth']['permissions']) =>
  ({
    canViewEmployees: hasGrantedPermission(permissions, hrPermissions.employee.list),
    canViewAttendance: hasGrantedPermission(permissions, hrPermissions.attendance.dashboard),
    canApproveLeave: hasGrantedPermission(permissions, hrPermissions.leaveManagement.approvals),
    canRunPayroll: hasGrantedPermission(permissions, hrPermissions.payroll.runPayroll),
    canViewSalaryStructures: hasGrantedPermission(
      permissions,
      hrPermissions.payroll.payrollStructure
    ),
    canViewReports: hasGrantedPermission(permissions, hrPermissions.reports),
  }) satisfies HrDashboardDisplayPermissions;

const AdminDashboard = ({ permissions }: { permissions: HrDashboardDisplayPermissions }) => {
  const {
    data: preview,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetHRDashboardPreviewQuery('Main', { pollingInterval: 0 });
  const [refreshPreview, { isLoading: isRefreshStarting }] = useRefreshHRDashboardPreviewMutation();
  const data = useMemo(
    () => sanitizeHRDashboardSummary(parseHRDashboardPayload<HRDashboardSummary>(preview)),
    [preview]
  );

  useEffect(() => {
    if (preview?.status !== 'Refreshing') return undefined;

    const intervalId = window.setInterval(() => refetch(), 5000);
    return () => window.clearInterval(intervalId);
  }, [preview?.status, refetch]);

  const handleRefresh = async () => {
    try {
      await refreshPreview('Main').unwrap();
    } catch (error: any) {
      shikshaMitraToast.error({
        message: error?.data?.message || 'The HR dashboard refresh could not be started.',
      });
    }
  };

  const shouldShowSkeleton =
    isLoading ||
    (!data &&
      shouldShowDashboardSnapshotSkeleton({
        status: preview?.status,
        isFetching,
        hasPreview: Boolean(preview),
      }));

  return (
    <HrDashboardPreviewShell
      preview={preview}
      isFetching={isFetching}
      isRefreshing={isRefreshStarting}
      onRefresh={handleRefresh}
    >
      {isError && !data ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => refetch()} sx={{ minHeight: 44 }}>
              Retry
            </Button>
          }
        >
          HR dashboard data could not be loaded.
        </Alert>
      ) : null}
      {shouldShowSkeleton ? <DashboardSkeleton /> : null}
      {!shouldShowSkeleton && !isError && !data ? (
        <HrDashboardSnapshotEmptyState status={preview?.status} isRefreshing={isRefreshStarting} />
      ) : null}
      {data ? <HrDashboardContent data={data} permissions={permissions} /> : null}
    </HrDashboardPreviewShell>
  );
};

const HRDashboardScreen = () => {
  const { data: session } = useSession() as any;
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const isAdminUser = hasRole(session?.profile?.role, 'admin');
  const canViewHRDashboard = hasGrantedPermission(permissions, hrPermissions.dashboard);

  if (!isAdminUser && !canViewHRDashboard) {
    return <EmployeeProfileDashboard editData={{}} />;
  }

  return <AdminDashboard permissions={buildDisplayPermissions(permissions)} />;
};

export default HRDashboardScreen;
