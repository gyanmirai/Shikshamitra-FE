'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { Iconify } from 'src/components/iconify';
import { Box, Tab, Alert, Paper } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useMemo, useEffect, type SyntheticEvent } from 'react';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import LeaveBalance from 'src/screens/hr/leave-balance/leave-balance';
import { useGetMyEmployeesUnderManagerQuery } from 'src/redux/hr/employeeApi';

import ApplyLeave from './apply-leave';
import LeaveApprovals from './leave-approvals';
import { useLeaveOverview } from './use-leave-overview';
import { LeaveCenterOverviewPanel } from './leave-center-overview';
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

  const pageTitle = isSelfContext ? 'My Leave' : 'Leave Center';
  const pageDescription = isSelfContext
    ? 'Track leave balance and request history for the current academic year.'
    : 'Track staff leave balance, requests, and approvals from one workspace.';

  const breadcrumbItems = isSelfContext
    ? [{ name: 'Dashboard', href: '/dashboard/' }, { name: 'My Leave' }]
    : [
      { name: 'HR/Staff', href: '/hr/dashboard/' },
      { name: 'Leave Management', href: HR_ROUTE },
      { name: pageTitle },
    ];

  const handleTabChange = (_event: SyntheticEvent, nextTab: LeaveCenterTab) => {
    if (!visibleTabs.includes(nextTab)) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextTab === 'balance') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', nextTab);
    }
    const query = nextParams.toString();
    const route = isSelfContext ? SELF_ROUTE : HR_ROUTE;
    router.push(query ? `${route}?${query}` : route);
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
        heading={pageTitle}
        links={breadcrumbItems}
        description={pageDescription}
      />

      <Paper
        sx={{
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        <CustomTabs
          value={activeTab}
          onChange={handleTabChange}
          role="tablist"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 42,
            bgcolor: 'background.paper',
            [`& .MuiTabs-scroller`]: { p: 0.75 },
            [`& .MuiTabs-flexContainer`]: { gap: 0.75 },
            [`& .MuiTabs-indicator`]: { display: 'none' },
            [`& .MuiTab-root`]: {
              minHeight: 34,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              color: 'text.secondary',
              fontWeight: 800,
              '&.Mui-selected': {
                bgcolor: 'background.neutral',
                color: 'text.primary',
              },
            },
          }}
        >
          {visibleTabs.includes('balance') && (
            <Tab
              label="My Balance"
              value="balance"
              icon={<Iconify icon="mdi:scale-balance" width={18} />}
              iconPosition="start"
            />
          )}
          {visibleTabs.includes('my-requests') && (
            <Tab
              label="My Requests"
              value="my-requests"
              icon={<Iconify icon="mdi:file-document-edit-outline" width={18} />}
              iconPosition="start"
            />
          )}
          {visibleTabs.includes('approvals') && (
            <Tab
              label="Approvals"
              value="approvals"
              icon={<Iconify icon="mdi:check-circle-outline" width={18} />}
              iconPosition="start"
            />
          )}
        </CustomTabs>
      </Paper>

      {leaveOverviewState.selfAccessError && (
        <Alert severity="warning">
          Your user is not linked to an employee profile. Contact admin/HR.
        </Alert>
      )}

      {activeTab === 'balance' && !leaveOverviewState.selfAccessError && (
        <LeaveCenterOverviewPanel
          overview={leaveOverviewState.overview}
          isLoading={leaveOverviewState.isLoadingBalance}
        />
      )}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeTab === 'my-requests' && (
          <ApplyLeave mode={isSelfContext ? 'self' : 'hr'} showBreadcrumbs={false} />
        )}
        {activeTab === 'approvals' && canReviewLeaves && <LeaveApprovals showBreadcrumbs={false} />}
        {activeTab === 'balance' && (
          <LeaveBalance
            mode={isSelfContext ? 'self' : 'hr'}
            showBreadcrumbs={false}
            showSelfAccessError={false}
            overviewState={leaveOverviewState}
          />
        )}
      </Box>
    </Box>
  );
};

export default LeaveCenter;
