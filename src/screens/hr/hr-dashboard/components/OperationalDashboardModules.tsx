'use client';

import type { ReactNode } from 'react';
import type {
  OperationalOverview,
  DashboardSectionState,
} from 'src/redux/hr/hrOperationalDashboardApi';

import { hrPaths } from 'src/constants/hr-menus';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Box, Paper, Stack, Button, Skeleton, Typography } from '@mui/material';

import { formatCount, formatSchoolDate } from '../operational-dashboard-state';

export type ModuleVisibility = {
  workforce: boolean;
  leave: boolean;
  onboarding: boolean;
  appraisal: boolean;
};

function ModuleDetail({ label, value }: { label: string; value: string | number }) {
  return (
    <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Typography component="dt" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        component="dd"
        variant="body2"
        sx={{ m: 0, fontWeight: 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}
      >
        {typeof value === 'number' ? formatCount(value) : value}
      </Typography>
    </Box>
  );
}

function ModuleCard({
  title,
  icon,
  state,
  count,
  label,
  children,
  href,
  action,
  reason,
}: {
  title: string;
  icon: string;
  state?: DashboardSectionState;
  count?: number;
  label: string;
  children?: ReactNode;
  href?: string;
  action: string;
  reason?: string | null;
}) {
  if (state === 'Forbidden') return null;
  const available = state === 'Available' && count !== undefined;
  return (
    <Paper
      component="section"
      aria-label={title}
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Iconify icon={icon} width={20} sx={{ color: 'text.secondary' }} aria-hidden="true" />
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
      </Stack>
      {state === undefined ? (
        <Box aria-label={`Loading ${title}`}>
          <Skeleton width="40%" height={36} />
          <Skeleton width="80%" />
        </Box>
      ) : (
        <Box>
          <Typography
            variant={available ? 'h4' : 'h6'}
            component="p"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {available ? formatCount(count) : 'Unavailable'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {available
              ? label
              : state === 'Failed'
                ? 'Could not load this summary. Refresh to retry.'
                : reason || 'This summary is currently unavailable.'}
          </Typography>
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {state === undefined ? (
          <Stack spacing={0.5}>
            <Skeleton />
            <Skeleton width="70%" />
          </Stack>
        ) : available ? (
          children
        ) : null}
      </Box>
      {(state === undefined || href) && (
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
          {state === undefined ? (
            <Skeleton variant="rounded" width={130} height={30} />
          ) : href ? (
            <Button
              component={RouterLink}
              href={href}
              size="small"
              variant="outlined"
              endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
            >
              {action}
            </Button>
          ) : null}
        </Box>
      )}
    </Paper>
  );
}

export default function OperationalDashboardModules({
  data,
  visible,
}: {
  data?: OperationalOverview;
  visible: ModuleVisibility;
}) {
  return (
    <Box
      data-testid="hr-module-overview"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 1.5,
      }}
    >
      {visible.workforce && (
        <ModuleCard
          title="Workforce"
          icon="mdi:account-group-outline"
          state={data?.workforceState}
          count={data?.workforce?.activeStaff}
          label="active staff"
          href={hrPaths.employee.list}
          action="Open Employees"
        >
          <Stack component="dl" spacing={0.5} sx={{ m: 0 }}>
            <ModuleDetail label="Teaching" value={data?.workforce?.teaching ?? 0} />
            <ModuleDetail label="Non-teaching" value={data?.workforce?.nonTeaching ?? 0} />
            <ModuleDetail label="Joined this month" value={data?.workforce?.joinedThisMonth ?? 0} />
          </Stack>
        </ModuleCard>
      )}
      {visible.leave && (
        <ModuleCard
          title="Leave approvals"
          icon="mdi:calendar-check-outline"
          state={data?.leaveState}
          count={data?.leave?.pendingRequests}
          label="requests awaiting a decision"
          href={hrPaths.leaveManagement.approvals}
          action="Review Requests"
        >
          <Typography variant="body2" color="text.secondary">
            {data?.leave?.pendingRequests === 0
              ? 'No requests awaiting a decision.'
              : 'Current requests within your permitted approval scope.'}
          </Typography>
        </ModuleCard>
      )}
      {visible.onboarding && (
        <ModuleCard
          title="Onboarding"
          icon="mdi:account-plus-outline"
          state={data?.onboardingState}
          count={data?.onboarding?.readyCount}
          label="ready for onboarding"
          href={data?.capabilities.canOpenOnboarding ? hrPaths.employee.onboarding : undefined}
          action="Open Onboarding"
          reason={data?.onboardingUnavailableReason}
        >
          <Stack component="dl" sx={{ m: 0 }}>
            <ModuleDetail
              label="Applications in progress"
              value={data?.onboarding?.inProgressCount ?? 0}
            />
          </Stack>
        </ModuleCard>
      )}
      {visible.appraisal && (
        <ModuleCard
          title="Appraisals"
          icon="mdi:clipboard-check-outline"
          state={data?.appraisalState}
          count={data?.appraisal?.pendingCount}
          label="appraisals to complete"
          href={`${hrPaths.professionalManagement.reviews}?cycleId=all`}
          action="Open Appraisals"
        >
          <Stack component="dl" spacing={0.5} sx={{ m: 0 }}>
            <ModuleDetail label="Overdue" value={data?.appraisal?.overdueCount ?? 0} />
            <ModuleDetail
              label="Next deadline"
              value={
                data?.appraisal?.nextDeadline
                  ? formatSchoolDate(data.appraisal.nextDeadline)
                  : 'None scheduled'
              }
            />
          </Stack>
        </ModuleCard>
      )}
    </Box>
  );
}
