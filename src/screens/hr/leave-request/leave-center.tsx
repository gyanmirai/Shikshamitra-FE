'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { DashboardCard } from 'src/components/dashboard-card';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import LeaveBalance from 'src/screens/hr/leave-balance/leave-balance';
import { Box, Tab, Grid, Paper, Alert, Skeleton } from '@mui/material';
import { useGetMyEmployeesUnderManagerQuery } from 'src/redux/hr/employeeApi';

import ApplyLeave from './apply-leave';
import LeaveApprovals from './leave-approvals';
import { useLeaveOverview } from './use-leave-overview';
import { LEAVE_OVERVIEW_CARDS } from './leave-overview.utils';
import {
  isAdminFromProfile,
  type LeaveCenterTab,
  resolveLeaveCenterTab,
  type LeaveCenterContext,
  getLeaveCenterVisibleTabs,
} from './leave-request.utils';

type LeaveCenterProps = {
  context: LeaveCenterContext;
  initialTab?: LeaveCenterTab;
};

const HR_ROUTE = hrPaths.leaveManagement.leaveCenter;

const SELF_ROUTE = '/dashboard/my-leave';

const LeaveCenter = ({ context, initialTab = 'balance' }: LeaveCenterProps) => {
  const isSelfContext = context === 'self';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { permissions } = useSelector((state: RootState) => state.auth);

  const isAdminUser = isAdminFromProfile((session as any)?.profile);
  const hasApprovalPermission = permissions?.some(
    (permission: any) =>
      permission?.name === hrPermissions.leaveManagement.approvals && permission?.isGranted
  );
  const shouldCheckReports = !isSelfContext && !isAdminUser && !hasApprovalPermission;
  const { data: myReportsData } = useGetMyEmployeesUnderManagerQuery(undefined, {
    skip: !shouldCheckReports,
    refetchOnMountOrArgChange: true,
  });
  const hasReportingHierarchy = Boolean(myReportsData?.employees?.length);
  const canReviewLeaves =
    !isSelfContext && Boolean(isAdminUser || hasApprovalPermission || hasReportingHierarchy);
  const isSelfLeaveBlocked = isSelfContext && isAdminUser;
  const visibleTabs = useMemo(
    () => getLeaveCenterVisibleTabs(context, canReviewLeaves),
    [canReviewLeaves, context]
  );

  useEffect(() => {
    if (isSelfLeaveBlocked) {
      router.replace('/dashboard/');
    }
  }, [isSelfLeaveBlocked, router]);

  const requestedTab = useMemo<LeaveCenterTab>(() => {
    if (isSelfContext) {
      const tabFromQuery = searchParams.get('tab');
      if (tabFromQuery === 'my-requests') return 'my-requests';
      if (tabFromQuery === 'balance') return 'balance';
      return initialTab;
    }

    const tabFromQuery = searchParams.get('tab');
    if (tabFromQuery === 'approvals') return 'approvals';
    if (tabFromQuery === 'balance') return 'balance';
    if (tabFromQuery === 'my-requests') return 'my-requests';
    return initialTab;
  }, [initialTab, isSelfContext, searchParams]);

  const activeTab = resolveLeaveCenterTab(requestedTab, visibleTabs, initialTab);
  const leaveOverviewState = useLeaveOverview({
    mode: isSelfContext ? 'self' : 'hr',
    enabled: !isSelfLeaveBlocked,
  });
  const overviewCards = useMemo(
    () => LEAVE_OVERVIEW_CARDS(leaveOverviewState.overview),
    [leaveOverviewState.overview]
  );

  const handleTabChange = (_event: React.SyntheticEvent, nextTab: LeaveCenterTab) => {
    if (!visibleTabs.includes(nextTab)) {
      return;
    }

    if (isSelfContext) {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (nextTab === 'balance') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', nextTab);
      }
      const query = nextParams.toString();
      router.push(query ? `${SELF_ROUTE}?${query}` : SELF_ROUTE);
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextTab === 'balance') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', nextTab);
    }
    const query = nextParams.toString();
    router.push(query ? `${HR_ROUTE}?${query}` : HR_ROUTE);
  };

  if (isSelfLeaveBlocked) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        heading={
          isSelfContext
            ? 'My Leave'
            : activeTab === 'approvals'
              ? 'Leave Approvals'
              : activeTab === 'balance'
                ? 'Leave Balance'
                : 'Apply Leave'
        }
        links={
          isSelfContext
            ? [{ name: 'Dashboard', href: '/dashboard/' }, { name: 'My Leave' }]
            : [
                { name: 'HR/Staff', href: '/hr/dashboard/' },
                { name: 'Leave Management', href: HR_ROUTE },
                { name: 'Leave Center' },
                {
                  name:
                    activeTab === 'approvals'
                      ? 'Leave Approvals'
                      : activeTab === 'balance'
                        ? 'Leave Balance'
                        : 'Apply Leave',
                },
              ]
        }
        description="Apply leave, track requests, review approvals, and monitor leave balance."
      />

      {leaveOverviewState.selfAccessError && (
        <Alert severity="warning">
          Your user is not linked to an employee profile. Contact admin/HR.
        </Alert>
      )}

      {!leaveOverviewState.selfAccessError && (
        <Grid container spacing={1}>
          {overviewCards.map((card) =>
            leaveOverviewState.isLoadingBalance ? (
              <Grid size={{ xs: 6, sm: 3 }} key={card.title}>
                <Skeleton variant="rounded" height={82} sx={{ borderRadius: 2 }} />
              </Grid>
            ) : (
              <Grid size={{ xs: 6, sm: 3 }} key={card.title}>
                <DashboardCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                  bgColor={card.bgColor}
                />
              </Grid>
            )
          )}
        </Grid>
      )}

      <Paper
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: '12px' }}
          role="tablist"
        >
          {visibleTabs.includes('balance') && (
            <Tab
              label="Balance"
              value="balance"
              icon={<Iconify icon="mdi:scale-balance" width={20} />}
            />
          )}
          {visibleTabs.includes('my-requests') && (
            <Tab
              label="My Requests"
              value="my-requests"
              icon={<Iconify icon="mdi:file-document-edit-outline" width={20} />}
            />
          )}
          {visibleTabs.includes('approvals') && (
            <Tab
              label="Approvals"
              value="approvals"
              icon={<Iconify icon="mdi:check-circle-outline" width={20} />}
            />
          )}
        </CustomTabs>
      </Paper>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeTab === 'my-requests' && (
          <ApplyLeave mode={isSelfContext ? 'self' : 'hr'} showBreadcrumbs={false} />
        )}
        {activeTab === 'approvals' && canReviewLeaves && <LeaveApprovals showBreadcrumbs={false} />}
        {activeTab === 'balance' && (
          <LeaveBalance
            mode={isSelfContext ? 'self' : 'hr'}
            showBreadcrumbs={false}
            showSummaryCards={false}
            showSelfAccessError={false}
            overviewState={leaveOverviewState}
          />
        )}
      </Box>
    </Box>
  );
};

export default LeaveCenter;
