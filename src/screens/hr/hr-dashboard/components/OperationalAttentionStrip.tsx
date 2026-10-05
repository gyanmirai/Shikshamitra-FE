'use client';

import type { OperationalOverview } from 'src/redux/hr/hrOperationalDashboardApi';

import { hrPaths } from 'src/constants/hr-menus';
import { RouterLink } from 'src/routes/components';
import { Stack, Button, Typography } from '@mui/material';

import { formatCount } from '../operational-dashboard-state';

type Props = {
  data: OperationalOverview;
  canViewStaff: boolean;
  canViewAttendance: boolean;
  canViewLeave: boolean;
  onStatus: (status: string) => void;
};
export default function OperationalAttentionStrip({
  data,
  canViewStaff,
  canViewAttendance,
  canViewLeave,
  onStatus,
}: Props) {
  const items = data.attention.filter(
    (item) =>
      item.count > 0 &&
      (item.kind === 'Leave'
        ? canViewLeave
        : canViewAttendance && ['NeedsSetup', 'NeedsReview'].includes(item.kind))
  );
  const leaveUnavailable = canViewLeave && ['Failed', 'Unavailable'].includes(data.leaveState);
  if (!items.length && !leaveUnavailable) return null;
  return (
    <Stack
      component="section"
      aria-label="Needs attention"
      direction="row"
      alignItems="center"
      spacing={1}
      useFlexGap
      flexWrap="wrap"
      sx={{
        px: 1.5,
        py: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.neutral',
      }}
    >
      <Typography variant="subtitle2" component="h2">
        Needs attention
      </Typography>
      {items.map((item) => {
        const label = `${formatCount(item.count)} ${item.kind === 'Leave' ? 'current leave requests' : item.kind === 'NeedsReview' ? 'staff need review' : 'staff need setup'}`;
        return item.kind === 'Leave' ? (
          <Button
            key={item.kind}
            size="small"
            component={RouterLink}
            href={hrPaths.leaveManagement.approvals}
          >
            {label}
          </Button>
        ) : canViewStaff ? (
          <Button key={item.kind} size="small" onClick={() => onStatus(item.action)}>
            {label}
          </Button>
        ) : (
          <Typography key={item.kind} variant="body2">
            {label}
          </Typography>
        );
      })}
      {leaveUnavailable ? (
        <Typography variant="caption" color="text.secondary">
          Current leave requests unavailable.
        </Typography>
      ) : null}
    </Stack>
  );
}
