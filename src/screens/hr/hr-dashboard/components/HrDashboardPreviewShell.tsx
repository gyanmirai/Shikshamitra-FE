'use client';

import type React from 'react';
import type { HRDashboardPreview, HRDashboardPreviewStatus } from 'src/redux/hr/hrDashboardApi';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';

type Props = {
  title: string;
  subtitle?: string;
  preview?: HRDashboardPreview;
  isFetching?: boolean;
  isRefreshing?: boolean;
  onRefresh: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const isRefreshRunning = (status?: HRDashboardPreviewStatus) => status === 'Refreshing';

const formatRefreshTime = (value?: string | null) =>
  value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : 'Not refreshed yet';

const formatScheduleTime = (value?: string | null) =>
  value ? dayjs(value).format('DD MMM, hh:mm A') : 'tomorrow morning';

export const HrDashboardPreviewShell = ({
  title,
  subtitle,
  preview,
  isFetching = false,
  isRefreshing = false,
  onRefresh,
  actions,
  children,
}: Props) => {
  const refreshing = isRefreshRunning(preview?.status) || isRefreshing;
  const hasError = Boolean(preview?.lastError);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
        justifyContent="space-between"
        spacing={1.25}
      >
        <Box>
          <Typography variant="h4">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle || 'Stored HR operations snapshot'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last refreshed:{' '}
            {formatRefreshTime(preview?.lastSuccessfulRefreshAt || preview?.lastRefreshedAt)}
            {preview?.nextScheduledRefreshAt
              ? ` • Next scheduled: ${formatScheduleTime(preview.nextScheduledRefreshAt)}`
              : ''}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" justifyContent="flex-end">
          {actions}
          <Button
            size="small"
            variant="outlined"
            onClick={onRefresh}
            disabled={refreshing || isFetching}
            startIcon={<Iconify icon="solar:refresh-linear" />}
            sx={{ minHeight: 34 }}
          >
            {refreshing ? 'Refreshing' : 'Refresh'}
          </Button>
        </Stack>
      </Stack>

      {refreshing ? <LinearProgress /> : null}
      {hasError ? <Alert severity="warning">{preview?.lastError}</Alert> : null}
      {preview?.isStale && preview?.status === 'Ready' ? (
        <Alert severity="info">
          This snapshot is older than 24 hours. You can keep working with the saved view or refresh
          it now.
        </Alert>
      ) : null}
      {preview?.status === 'Empty' ? (
        <Alert severity="info">
          No saved HR dashboard snapshot is available yet. Use Refresh to prepare one; the next
          automatic refresh is scheduled around {formatScheduleTime(preview.nextScheduledRefreshAt)}
          .
        </Alert>
      ) : null}
      {preview?.status === 'Failed' ? (
        <Alert severity="error">
          The last dashboard refresh failed. Try Refresh again; page loading will continue to use
          only saved snapshot data.
        </Alert>
      ) : null}

      {children}
    </Box>
  );
};
