'use client';

import type React from 'react';
import type { HRDashboardPreview, HRDashboardPreviewStatus } from 'src/redux/hr/hrDashboardApi';

import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { fDateTime } from 'src/utils/format-time';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';

type Props = {
  title?: string;
  subtitle?: string;
  preview?: HRDashboardPreview;
  isFetching?: boolean;
  isRefreshing?: boolean;
  onRefresh: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const isRefreshRunning = (status?: HRDashboardPreviewStatus) => status === 'Refreshing';

const formatRefreshTime = (value?: string | null) => fDateTime(value) || 'Not refreshed yet';

const formatScheduleTime = (value?: string | null) => fDateTime(value) || 'tomorrow morning';

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
  const heading = title || 'HR Dashboard';
  const description =
    subtitle || 'Monitor workforce health, daily attendance, leave actions, and payroll readiness.';
  const breadcrumbLinks = [{ name: 'HR/Staff', href: hrPaths.dashboard }, { name: heading }];

  return (
    <Box
      data-testid="hr-dashboard-shell"
      sx={{ display: 'flex', minWidth: 0, flexDirection: 'column', gap: 2, pb: 2 }}
    >
      <CustomBreadcrumbs
        heading={heading}
        headingComponent="h1"
        description={description}
        links={breadcrumbLinks}
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
            {actions}
            <Button
              variant="contained"
              size="small"
              onClick={onRefresh}
              disabled={refreshing || isFetching}
              startIcon={<Iconify icon="mdi:refresh" aria-hidden />}
              aria-label={refreshing ? 'Refreshing HR dashboard' : 'Refresh HR dashboard'}
              sx={{ flexShrink: 0 }}
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
          </Stack>
        }
      />

      <Stack
        component="section"
        aria-label="Dashboard freshness"
        direction="row"
        spacing={{ xs: 1, sm: 2 }}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        sx={{
          minHeight: 24,
          color: 'text.secondary',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center" aria-live="polite">
          <Box
            aria-hidden
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: refreshing ? 'info.main' : 'success.main',
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {refreshing ? 'Refresh in progress' : 'Saved snapshot'}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Last refreshed:{' '}
          {formatRefreshTime(preview?.lastSuccessfulRefreshAt || preview?.lastRefreshedAt)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Next refresh: {formatScheduleTime(preview?.nextScheduledRefreshAt)}
        </Typography>
      </Stack>

      {refreshing ? <LinearProgress aria-label="Refreshing HR dashboard" /> : null}
      {hasError ? <Alert severity="warning">{preview?.lastError}</Alert> : null}
      {preview?.isStale && preview?.status === 'Ready' ? (
        <Alert severity="info">
          This snapshot is older than 24 hours. A fresh view is being prepared automatically. You
          can keep working with the saved data meanwhile.
        </Alert>
      ) : null}
      {preview?.status === 'Empty' ? (
        <Alert severity="info">
          The first saved HR dashboard snapshot is being prepared automatically. The next scheduled
          refresh is around {formatScheduleTime(preview.nextScheduledRefreshAt)}.
        </Alert>
      ) : null}
      {preview?.status === 'Failed' ? (
        <Alert severity="error">
          The last dashboard refresh failed. Try Refresh again. The page will continue to use only
          saved snapshot data.
        </Alert>
      ) : null}

      {children}
    </Box>
  );
};
