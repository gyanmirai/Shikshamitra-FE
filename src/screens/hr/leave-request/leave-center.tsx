'use client';

import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { Box, Tab, Card, Tabs } from '@mui/material';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import LeaveBalance from 'src/screens/hr/leave-balance/leave-balance';
import { useGetMyEmployeesUnderManagerQuery } from 'src/redux/hr/employeeApi';

import ApplyLeave from './apply-leave';
import LeaveApprovals from './leave-approvals';
import { isAdminFromProfile } from './leave-request.utils';

type LeaveCenterContext = 'hr' | 'employee';
type LeaveCenterTab = 'my-requests' | 'team-requests' | 'approvals' | 'balance';

type LeaveCenterProps = {
  context: LeaveCenterContext;
  initialTab?: LeaveCenterTab;
};

const HR_ROUTE = hrPaths.leaveManagement.leaveCenter;

const SELF_ROUTE = '/dashboard/my-leave';

const LeaveCenter = ({ context, initialTab = 'my-requests' }: LeaveCenterProps) => {
  const isEmployeeContext = context === 'employee';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { data: managedEmployeesResponse } = useGetMyEmployeesUnderManagerQuery(undefined, {
    skip: !isEmployeeContext,
  });

  const isAdminUser = isAdminFromProfile((session as any)?.profile);
  const hasApprovalPermission = permissions?.some(
    (permission: any) =>
      permission?.name === hrPermissions.leaveManagement.approvals && permission?.isGranted
  );
  const managedEmployees = useMemo(
    () => managedEmployeesResponse?.employees || [],
    [managedEmployeesResponse]
  );
  const hasManagedEmployees = managedEmployees.length > 0;
  const canReviewLeaves = !isEmployeeContext && Boolean(isAdminUser || hasApprovalPermission);

  const requestedTab = useMemo<LeaveCenterTab>(() => {
    if (isEmployeeContext) {
      const tabFromQuery = searchParams.get('tab');
      if (tabFromQuery === 'team-requests' && hasManagedEmployees) return 'team-requests';
      if (tabFromQuery === 'balance') return 'balance';
      return initialTab === 'team-requests' && hasManagedEmployees
        ? 'team-requests'
        : initialTab === 'balance'
          ? 'balance'
          : 'my-requests';
    }

    const tabFromQuery = searchParams.get('tab');
    if (tabFromQuery === 'approvals') return 'approvals';
    if (tabFromQuery === 'balance') return 'balance';
    if (tabFromQuery === 'my-requests') return 'my-requests';
    return initialTab;
  }, [hasManagedEmployees, initialTab, isEmployeeContext, searchParams]);

  const activeTab: LeaveCenterTab =
    requestedTab === 'approvals' && !canReviewLeaves ? 'my-requests' : requestedTab;

  const handleTabChange = (_event: React.SyntheticEvent, nextTab: LeaveCenterTab) => {
    if (isEmployeeContext) {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (nextTab === 'balance') {
        nextParams.set('tab', 'balance');
      } else if (nextTab === 'team-requests') {
        nextParams.set('tab', 'team-requests');
      } else if (nextTab === 'approvals') {
        nextParams.set('tab', 'approvals');
      } else {
        nextParams.delete('tab');
      }
      const query = nextParams.toString();
      router.push(query ? `${SELF_ROUTE}?${query}` : SELF_ROUTE);
      return;
    }

    if (
      (nextTab === 'approvals' && !canReviewLeaves) ||
      (nextTab === 'team-requests' && !hasManagedEmployees)
    ) {
      router.push(HR_ROUTE);
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: '100%',
        minHeight: 0,
      }}
    >
      <CustomBreadcrumbs
        heading={isEmployeeContext ? 'My Leave' : 'Leave Center'}
        links={
          isEmployeeContext
            ? [{ name: 'Dashboard', href: '/dashboard/' }, { name: 'My Leave' }]
            : [
                { name: 'HR/Staff', href: '/hr/dashboard/' },
                { name: 'Leave Management', href: HR_ROUTE },
                {
                  name:
                    activeTab === 'approvals'
                      ? 'Leave Approvals'
                      : activeTab === 'team-requests'
                        ? 'Team Requests'
                        : activeTab === 'balance'
                          ? 'Leave Balance'
                          : 'Apply Leave',
                },
              ]
        }
        description="Apply leave, track requests, review approvals, and monitor leave balance."
      />

      <Card sx={{ px: 1, py: 0.5 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="My Requests" value="my-requests" />
          {isEmployeeContext && hasManagedEmployees && (
            <Tab label="Team Requests" value="team-requests" />
          )}
          {canReviewLeaves && <Tab label="Approvals" value="approvals" />}
          <Tab label="Balance" value="balance" />
        </Tabs>
      </Card>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {activeTab === 'my-requests' && (
          <ApplyLeave mode={isEmployeeContext ? 'self' : 'hr'} showBreadcrumbs={false} />
        )}
        {activeTab === 'team-requests' && isEmployeeContext && hasManagedEmployees && (
          <ApplyLeave
            mode="employee-team"
            showBreadcrumbs={false}
            canReviewLeavesOverride
            managedEmployees={managedEmployees}
          />
        )}
        {activeTab === 'approvals' && canReviewLeaves && <LeaveApprovals showBreadcrumbs={false} />}
        {activeTab === 'balance' && (
          <LeaveBalance mode={isEmployeeContext ? 'self' : 'hr'} showBreadcrumbs={false} />
        )}
      </Box>
    </Box>
  );
};

export default LeaveCenter;
