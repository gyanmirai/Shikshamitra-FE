'use client';

import { useEffect } from 'react';
import { StudentFeedback } from 'src/components/student-feedback';
import { Paper, Stack, Button, Skeleton, Typography } from '@mui/material';

import { useApplicationFollowUps } from './use-application-follow-ups';
import { InquiryFollowUpsPanel } from '../inquiry-management/inquiry-follow-ups';

export function ApplicationFollowUps({
  applicationId,
  compact = false,
  disabled = false,
  onBusyChange,
}: {
  applicationId: string;
  compact?: boolean;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { query, saving, value, problem, sourceUnavailable, actions } =
    useApplicationFollowUps(applicationId);
  useEffect(() => {
    onBusyChange?.(saving);
  }, [saving, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);

  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{ p: compact ? 1.5 : 2, minWidth: 0, ...(compact && { borderRadius: 1 }) }}
    >
      {query.isLoading && (
        <Stack spacing={1} role="status" aria-label="Loading Application Follow-Ups">
          <Skeleton width="40%" />
          <Skeleton variant="rounded" height={80} />
        </Stack>
      )}
      {query.isError && (
        <StudentFeedback
          notificationKey="STU-0199"
          presentation="toast"
          severity="error"
          action={
            !sourceUnavailable && (
              <Button
                size="small"
                color="inherit"
                disabled={disabled}
                onClick={() => query.refetch()}
              >
                Retry
              </Button>
            )
          }
        >
          {problem && problem.detail !== 'Something went wrong'
            ? problem.detail
            : sourceUnavailable
              ? 'The Source Inquiry Is Unavailable. Follow-ups Cannot Be Loaded for This Application.'
              : 'Unable to Load Application Follow-ups. Retry to View the Latest Information.'}
        </StudentFeedback>
      )}
      {!query.isLoading && !query.isError && value && (
        <Stack spacing={1.5}>
          {!value.canManageFollowUps && (
            <Typography variant="body2" color="text.secondary">
              Follow-up changes require an active application, managed inquiry settings, and your
              current access.
            </Typography>
          )}
          <InquiryFollowUpsPanel
            value={value}
            compact={compact}
            disabled={disabled}
            readOnly={!value.canManageFollowUps}
            busy={query.isFetching || saving}
            actions={actions}
          />
        </Stack>
      )}
    </Paper>
  );
}
