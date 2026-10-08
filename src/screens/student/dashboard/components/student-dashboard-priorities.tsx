import type { GrantedPermission } from 'src/utils/permissions';
import type { StudentDashboardMode } from 'src/redux/student/dashboard/student-module-dashboard-types';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Stack, Alert, Skeleton, Typography, ButtonBase } from '@mui/material';
import { DashboardSectionCard } from 'src/screens/academic/AcademicDashboard/Components/DashboardSectionCard';

import { dashboardPriorities } from '../dashboard-insights';

import type { StudentSectionQueries } from '../hooks/use-student-dashboard-sections';

export default function StudentDashboardPriorities({
  queries,
  permissions,
  mode,
}: {
  queries: StudentSectionQueries;
  permissions: GrantedPermission[];
  mode: StudentDashboardMode;
}) {
  const priorities = dashboardPriorities(queries, permissions, mode);
  const states = Object.values(queries).filter((query) => !query.isUninitialized);
  const loading = states.some((query) => query.isFetching && !query.currentData);
  const failed = states.some((query) => query.isError);
  return (
    <DashboardSectionCard
      title="Needs attention"
      subheader="Next steps in your permitted workspaces"
      height="100%"
    >
      <Stack spacing={1}>
        {failed && (
          <Alert severity="warning">
            Some summaries are unavailable. This queue may be incomplete.
          </Alert>
        )}
        {loading && <Skeleton variant="rounded" height={80} aria-label="Loading priority work" />}
        {priorities.map((item) => (
          <ButtonBase
            key={item.id}
            component={Link}
            href={item.href}
            prefetch={false}
            aria-label={`${item.action}: ${fNumber(item.value)}. ${item.title}`}
            sx={{
              p: 1.5,
              minHeight: 64,
              borderRadius: 1,
              bgcolor: 'background.neutral',
              textAlign: 'left',
              justifyContent: 'space-between',
              gap: 1,
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">{item.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.action}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="h6"
                color={item.tone === 'success' ? 'success.main' : 'warning.main'}
              >
                {fNumber(item.value)}
              </Typography>
              <Iconify icon="mdi:arrow-right" />
            </Stack>
          </ButtonBase>
        ))}
        {!priorities.length && !loading && !failed && (
          <Typography variant="body2" color="text.secondary">
            No priority actions in the available summaries.
          </Typography>
        )}
      </Stack>
    </DashboardSectionCard>
  );
}
