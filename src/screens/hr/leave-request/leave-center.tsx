'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { Box, Tab, Alert, Paper, Button } from '@mui/material';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useMemo, useState, useEffect, type SyntheticEvent } from 'react';
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
  const [actionsContainer, setActionsContainer] = useState<HTMLDivElement | null>(null);
  const [openCreateOnMount, setOpenCreateOnMount] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { permissions, employee } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

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
  useEffect(() => {
    if (activeTab === 'my-requests') setOpenCreateOnMount(false);
  }, [activeTab]);

  const leaveOverviewState = useLeaveOverview({
    mode: isSelfContext ? 'self' : 'hr',
    enabled: !isSelfLeaveBlocked && activeTab === 'balance',
  });

  const pageTitle = isSelfContext ? 'My Leave' : 'Leave Center';
  const pageDescription = isSelfContext
    ? 'Track leave balance and request history for the current academic year.'
    : 'Track staff leave balance, requests, and approvals from one workspace.';

  const breadcrumbItems = isSelfContext
    ? [{ name: 'Dashboard', href: '/dashboard/' }, { name: 'My Leave' }]
    : [
        { name: 'HR/Staff', href: hrPaths.dashboard },
        { name: 'Leave Management', href: HR_ROUTE },
        { name: pageTitle },
      ];

  const handleTabChange = (_event: SyntheticEvent, nextTab: LeaveCenterTab) => {
    if (!visibleTabs.includes(nextTab)) {
      return;
    }

    if (nextTab !== 'my-requests') setOpenCreateOnMount(false);

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
          flexShrink: 0,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
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
          aria-label={pageTitle}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flex: { xs: '1 1 100%', md: 1 }, minWidth: 0 }}
        >
          {visibleTabs.includes('balance') && (
            <Tab
              id={`${context}-leave-tab-balance`}
              aria-controls={`${context}-leave-panel`}
              label="My Balance"
              value="balance"
              icon={<Iconify icon="mdi:scale-balance" width={20} />}
              iconPosition="start"
            />
          )}
          {visibleTabs.includes('my-requests') && (
            <Tab
              id={`${context}-leave-tab-my-requests`}
              aria-controls={`${context}-leave-panel`}
              label="My Requests"
              value="my-requests"
              icon={<Iconify icon="mdi:file-document-edit-outline" width={20} />}
              iconPosition="start"
            />
          )}
          {visibleTabs.includes('approvals') && (
            <Tab
              id={`${context}-leave-tab-approvals`}
              aria-controls={`${context}-leave-panel`}
              label="Approvals"
              value="approvals"
              icon={<Iconify icon="mdi:check-circle-outline" width={20} />}
              iconPosition="start"
            />
          )}
        </CustomTabs>
        <Box
          ref={setActionsContainer}
          sx={{
            p: 1,
            ml: 'auto',
            flexShrink: 0,
            display: activeTab === 'approvals' ? 'none' : undefined,
          }}
        >
          {activeTab === 'balance' && (
            <Button
              variant="contained"
              color="inherit"
              size="small"
              disabled={!currentYear?.id || Boolean(leaveOverviewState.selfAccessError)}
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={(event) => {
                setOpenCreateOnMount(true);
                handleTabChange(event, 'my-requests');
              }}
            >
              Apply Leave
            </Button>
          )}
        </Box>
      </Paper>

      {leaveOverviewState.selfAccessError && (
        <Alert severity="warning">
          Your user is not linked to an employee profile. Contact admin/HR.
        </Alert>
      )}

      <Box
        id={`${context}-leave-panel`}
        role="tabpanel"
        aria-labelledby={`${context}-leave-tab-${activeTab}`}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: activeTab === 'balance' ? 'auto' : 'hidden',
        }}
      >
        {activeTab === 'my-requests' && (
          <ApplyLeave
            mode={isSelfContext ? 'self' : 'hr'}
            showBreadcrumbs={false}
            actionsContainer={actionsContainer}
            openCreateOnMount={openCreateOnMount}
          />
        )}
        {activeTab === 'approvals' && canReviewLeaves && <LeaveApprovals showBreadcrumbs={false} />}
        {activeTab === 'balance' &&
          !leaveOverviewState.selfAccessError &&
          (!currentYear?.id ? (
            <HrNotice severity="info">Select an academic year to view your leave balances.</HrNotice>
          ) : !isSelfContext && !employee?.id ? (
            <Alert severity="warning">
              Your user is not linked to an employee profile. Contact admin/HR.
            </Alert>
          ) : (
            <LeaveCenterOverviewPanel
              overview={leaveOverviewState.overview}
              isLoading={leaveOverviewState.isLoadingBalance}
              error={leaveOverviewState.balanceError}
              onRetry={leaveOverviewState.refetchBalance}
            />
          ))}
      </Box>
    </Box>
  );
};

export default LeaveCenter;
