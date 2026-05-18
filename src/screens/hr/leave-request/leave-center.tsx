'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Tab, Card, Tabs } from '@mui/material';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import LeaveBalance from 'src/screens/hr/leave-balance/leave-balance';

import ApplyLeave from './apply-leave';
import LeaveApprovals from './leave-approvals';
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

const LeaveCenter = ({ context, initialTab = 'my-requests' }: LeaveCenterProps) => {
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
  const canReviewLeaves = !isSelfContext && Boolean(isAdminUser || hasApprovalPermission);
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
      if (tabFromQuery === 'balance') return 'balance';
      return initialTab === 'balance' ? 'balance' : 'my-requests';
    }

    const tabFromQuery = searchParams.get('tab');
    if (tabFromQuery === 'approvals') return 'approvals';
    if (tabFromQuery === 'balance') return 'balance';
    if (tabFromQuery === 'my-requests') return 'my-requests';
    return initialTab;
  }, [initialTab, isSelfContext, searchParams]);

  const activeTab = resolveLeaveCenterTab(
    requestedTab,
    visibleTabs,
    canReviewLeaves ? 'approvals' : initialTab
  );

  const handleTabChange = (_event: React.SyntheticEvent, nextTab: LeaveCenterTab) => {
    if (!visibleTabs.includes(nextTab)) {
      return;
    }

    if (isSelfContext) {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (nextTab === 'balance') {
        nextParams.set('tab', 'balance');
      } else {
        nextParams.delete('tab');
      }
      const query = nextParams.toString();
      router.push(query ? `${SELF_ROUTE}?${query}` : SELF_ROUTE);
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextTab === 'my-requests') {
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
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        heading={isSelfContext ? 'My Leave' : 'Leave Center'}
        links={
          isSelfContext
            ? [{ name: 'Dashboard', href: '/dashboard/' }, { name: 'My Leave' }]
            : [
                { name: 'HR/Staff', href: '/hr/dashboard/' },
                { name: 'Leave Management', href: HR_ROUTE },
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

      <Card sx={{ px: 1 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {visibleTabs.includes('my-requests') && <Tab label="My Requests" value="my-requests" />}
          {visibleTabs.includes('approvals') && <Tab label="Approvals" value="approvals" />}
          {visibleTabs.includes('balance') && <Tab label="Balance" value="balance" />}
        </Tabs>
      </Card>

      {activeTab === 'my-requests' && (
        <ApplyLeave mode={isSelfContext ? 'self' : 'hr'} showBreadcrumbs={false} />
      )}
      {activeTab === 'approvals' && canReviewLeaves && <LeaveApprovals showBreadcrumbs={false} />}
      {activeTab === 'balance' && (
        <LeaveBalance mode={isSelfContext ? 'self' : 'hr'} showBreadcrumbs={false} />
      )}
    </Box>
  );
};

export default LeaveCenter;
