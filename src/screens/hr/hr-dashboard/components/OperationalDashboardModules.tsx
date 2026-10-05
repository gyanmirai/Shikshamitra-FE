'use client';

import type { ReactNode } from 'react';
import type {
  OperationalOverview,
  DashboardSectionState,
} from 'src/redux/hr/hrOperationalDashboardApi';

import { hrPaths } from 'src/constants/hr-menus';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Box, Card, Stack, Button, Skeleton, Typography } from '@mui/material';

import { formatCount, formatSchoolDate } from '../operational-dashboard-state';

export type ModuleVisibility = {
  workforce: boolean;
  leave: boolean;
  onboarding: boolean;
  appraisal: boolean;
};

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
    <Card
      component="section"
      aria-label={title}
      variant="outlined"
      sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <Iconify icon={icon} width={22} sx={{ color: 'text.secondary' }} aria-hidden="true" />
      </Stack>
      {state === undefined ? (
        <Skeleton variant="rounded" height={74} aria-label={`Loading ${title}`} />
      ) : (
        <Box>
          <Typography
            variant={available ? 'h3' : 'h6'}
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
      <Box sx={{ flex: 1, minWidth: 0 }}>{available && children}</Box>
      {state !== undefined && href && (
        <Button
          component={RouterLink}
          href={href}
          size="small"
          endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
          sx={{ alignSelf: 'flex-start', px: 0.5 }}
        >
          {action}
        </Button>
      )}
    </Card>
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
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
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
          action="Open employees"
        >
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1.5}>
            <Typography variant="body2">
              Teaching <strong>{formatCount(data?.workforce?.teaching ?? 0)}</strong>
            </Typography>
            <Typography variant="body2">
              Non-teaching <strong>{formatCount(data?.workforce?.nonTeaching ?? 0)}</strong>
            </Typography>
            <Typography variant="body2">
              Joined this month{' '}
              <strong>{formatCount(data?.workforce?.joinedThisMonth ?? 0)}</strong>
            </Typography>
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
          action="Review requests"
        >
          <Typography variant="body2" color="text.secondary">
            Current requests within your permitted approval scope.
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
          action="Open onboarding"
          reason={data?.onboardingUnavailableReason}
        >
          <Typography variant="body2" color="text.secondary">
            {formatCount(data?.onboarding?.inProgressCount ?? 0)} applications in progress
          </Typography>
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
          action="Open appraisals"
        >
          <Stack direction="row" useFlexGap flexWrap="wrap" gap={1.5}>
            <Typography
              variant="body2"
              color={data?.appraisal?.overdueCount ? 'text.primary' : 'text.secondary'}
              sx={{ fontWeight: data?.appraisal?.overdueCount ? 600 : 400 }}
            >
              {formatCount(data?.appraisal?.overdueCount ?? 0)} overdue
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data?.appraisal?.nextDeadline
                ? `Next deadline ${formatSchoolDate(data.appraisal.nextDeadline)}`
                : 'No upcoming deadline'}
            </Typography>
          </Stack>
        </ModuleCard>
      )}
    </Box>
  );
}
