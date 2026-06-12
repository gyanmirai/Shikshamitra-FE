'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useMemo, useEffect, type SyntheticEvent } from 'react';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import LeaveBalance from 'src/screens/hr/leave-balance/leave-balance';
import { useGetMyEmployeesUnderManagerQuery } from 'src/redux/hr/employeeApi';
import {
  Box,
  Tab,
  Grid,
  Link,
  Card,
  Chip,
  Alert,
  Stack,
  Skeleton,
  Typography,
  Breadcrumbs,
} from '@mui/material';

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

type OverviewMetric = ReturnType<typeof LEAVE_OVERVIEW_CARDS>[number];

const LeaveCenterMetricTile = ({
  metric,
  isLoading,
}: {
  metric: OverviewMetric;
  isLoading: boolean;
}) => (
  <Card
    variant="outlined"
    sx={{
      p: 1.25,
      height: 78,
      borderRadius: 2,
      boxShadow: 'none',
      bgcolor: 'background.paper',
    }}
  >
    {isLoading ? (
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Skeleton variant="rounded" width={38} height={38} sx={{ borderRadius: 1.5 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width={44} height={24} />
          <Skeleton width="72%" height={18} />
        </Box>
      </Stack>
    ) : (
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ height: 1 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: metric.color,
            bgcolor: metric.bgColor,
          }}
        >
          <Iconify icon={metric.icon} width={22} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            {metric.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {metric.title}
          </Typography>
        </Box>
      </Stack>
    )}
  </Card>
);

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

  const pageTitle = isSelfContext
    ? 'My Leave'
    : activeTab === 'approvals'
      ? 'Leave Approvals'
      : activeTab === 'balance'
        ? 'Leave Balance'
        : 'Apply Leave';

  const pageDescription =
    activeTab === 'balance'
      ? 'Review allocation, availability, and leave activity for the current academic year.'
      : activeTab === 'approvals'
        ? 'Review staff leave requests and take action from one focused workspace.'
        : 'Apply leave and track submitted requests without leaving the Leave Center.';

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
      <Box
        sx={{
          p: { xs: 1.5, md: 2 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.25}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Breadcrumbs separator="•" sx={{ mb: 0.5 }}>
                {breadcrumbItems.map((item, index) =>
                  item.href ? (
                    <Link
                      key={item.name}
                      href={item.href}
                      underline="hover"
                      color="text.secondary"
                      sx={{ fontSize: 13, fontWeight: 600 }}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <Typography
                      key={`${item.name}-${index}`}
                      variant="caption"
                      color="primary.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {item.name}
                    </Typography>
                  )
                )}
              </Breadcrumbs>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                  }}
                >
                  <Iconify icon="solar:calendar-bold-duotone" width={20} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {pageTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {pageDescription}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Chip
              label="Leave Center"
              color="primary"
              variant="soft"
              icon={<Iconify icon="solar:calendar-search-bold-duotone" width={16} />}
              sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, fontWeight: 700 }}
            />
          </Stack>

          {leaveOverviewState.selfAccessError && (
            <Alert severity="warning">
              Your user is not linked to an employee profile. Contact admin/HR.
            </Alert>
          )}

          {!leaveOverviewState.selfAccessError && (
            <Grid container spacing={1}>
              {overviewCards.map((metric) => (
                <Grid size={{ xs: 6, md: 3 }} key={metric.title}>
                  <LeaveCenterMetricTile
                    metric={metric}
                    isLoading={leaveOverviewState.isLoadingBalance}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          <Box
            sx={{
              p: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.neutral',
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
                bgcolor: 'transparent',
                [`& .MuiTabs-scroller`]: { p: 0 },
                [`& .MuiTabs-flexContainer`]: { gap: 0.5 },
                [`& .MuiTabs-indicator`]: { display: 'none' },
                [`& .MuiTab-root`]: {
                  minHeight: 36,
                  px: 1.5,
                  borderRadius: 1.5,
                  color: 'text.secondary',
                  fontWeight: 700,
                  '&.Mui-selected': {
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: 1,
                  },
                },
              }}
            >
              {visibleTabs.includes('balance') && (
                <Tab
                  label="Balance"
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
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeTab === 'my-requests' && (
          <ApplyLeave mode={isSelfContext ? 'self' : 'hr'} showBreadcrumbs={false} />
        )}
        {activeTab === 'approvals' && canReviewLeaves && <LeaveApprovals showBreadcrumbs={false} />}
        {activeTab === 'balance' && (
          <LeaveBalance
            mode={isSelfContext ? 'self' : 'hr'}
            showBreadcrumbs={false}
            showSummaryCards
            showSelfAccessError={false}
            overviewState={leaveOverviewState}
          />
        )}
      </Box>
    </Box>
  );
};

export default LeaveCenter;
