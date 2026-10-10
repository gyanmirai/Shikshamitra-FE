'use client';

import { useEffect } from 'react';
import { Alert, Paper, Stack, Button, Skeleton, Typography } from '@mui/material';

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
        <Stack spacing={1} role="status" aria-label="Loading application follow-ups">
          <Skeleton width="40%" />
          <Skeleton variant="rounded" height={80} />
        </Stack>
      )}
      {query.isError && (
        <Alert
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
              ? 'The source inquiry is unavailable. Follow-ups cannot be loaded for this application.'
              : 'Unable to load application follow-ups. Retry to view the latest information.'}
        </Alert>
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
