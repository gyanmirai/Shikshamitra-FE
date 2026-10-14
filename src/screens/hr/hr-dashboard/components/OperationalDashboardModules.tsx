'use client';

import type { ReactNode } from 'react';
import type {
  OperationalOverview,
  DashboardSectionState,
} from 'src/redux/hr/hrOperationalDashboardApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Paper, Stack, Typography } from '@mui/material';

import { DashboardSkeleton } from './OperationalDashboardSkeletons';
import {
  formatCount,
  formatSchoolDate,
  getModulePriorityCue,
} from '../operational-dashboard-state';

export type ModuleVisibility = {
  workforce: boolean;
  leave: boolean;
  onboarding: boolean;
  appraisal: boolean;
};

function ModuleDetail({ label, value }: { label: string; value: ReactNode }) {
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
  reason,
  detailLabels,
}: {
  title: string;
  icon: string;
  state?: DashboardSectionState;
  count?: number;
  label: string;
  children?: ReactNode;
  reason?: string | null;
  detailLabels?: string[];
}) {
  if (state === 'Forbidden') return null;
  const available = state === 'Available' && count !== undefined;
  return (
    <Paper
      component="section"
      aria-label={title}
      aria-busy={state === undefined}
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
        <Box>
          <DashboardSkeleton aria-hidden="true" width={64} height={40} />
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
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
          <Stack aria-hidden="true" spacing={0.5}>
            {detailLabels ? (
              detailLabels.map((detail) => (
                <Stack
                  key={detail}
                  direction="row"
                  justifyContent="space-between"
                  gap={1}
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    {detail}
                  </Typography>
                  <DashboardSkeleton width={32} height={16} sx={{ flexShrink: 0 }} />
                </Stack>
              ))
            ) : (
              <>
                <DashboardSkeleton height={24} width={130} />
                <DashboardSkeleton variant="text" height={22} width="95%" />
                <DashboardSkeleton variant="text" height={22} width="75%" />
              </>
            )}
          </Stack>
        ) : available ? (
          children
        ) : null}
      </Box>
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
  const leaveCue = getModulePriorityCue('leave', data?.leaveState, data?.leave?.pendingRequests);
  const appraisalCue = getModulePriorityCue(
    'appraisal',
    data?.appraisalState,
    data?.appraisal?.overdueCount
  );
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
          detailLabels={['Teaching', 'Non-teaching', 'Joined this month']}
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
        >
          <Stack spacing={0.75} alignItems="flex-start">
            {leaveCue && (
              <Label color={leaveCue.color} sx={{ color: 'text.primary' }}>
                {leaveCue.label}
              </Label>
            )}
            <Typography variant="body2" color="text.secondary">
              {data?.leave?.pendingRequests === 0
                ? 'No requests awaiting a decision.'
                : 'Current requests within your permitted approval scope.'}
            </Typography>
          </Stack>
        </ModuleCard>
      )}
      {visible.onboarding && (
        <ModuleCard
          title="Onboarding"
          icon="mdi:account-plus-outline"
          state={data?.onboardingState}
          count={data?.onboarding?.readyCount}
          label="ready for onboarding"
          detailLabels={['Applications in progress']}
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
          detailLabels={['Overdue', 'Next deadline']}
        >
          <Stack component="dl" spacing={0.5} sx={{ m: 0 }}>
            {appraisalCue ? (
              <ModuleDetail
                label="Status"
                value={
                  <Label color={appraisalCue.color} sx={{ color: 'text.primary' }}>
                    {appraisalCue.label}
                  </Label>
                }
              />
            ) : (
              <ModuleDetail label="Overdue" value={data?.appraisal?.overdueCount ?? 0} />
            )}
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
