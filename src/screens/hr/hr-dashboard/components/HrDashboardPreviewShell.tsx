'use client';

import type React from 'react';
import type { HRDashboardPreview, HRDashboardPreviewStatus } from 'src/redux/hr/hrDashboardApi';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Stack, Button, Typography, IconButton, LinearProgress } from '@mui/material';

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
            {subtitle || `Last refreshed: ${formatRefreshTime(preview?.lastRefreshedAt)}`}
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
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={refreshing || isFetching}
            sx={{ width: 36, height: 36, border: (theme) => `1px solid ${theme.palette.divider}` }}
          >
            <Iconify icon="solar:refresh-linear" />
          </IconButton>
        </Stack>
      </Stack>

      {refreshing ? <LinearProgress /> : null}
      {hasError ? <Alert severity="warning">{preview?.lastError}</Alert> : null}
      {preview?.status === 'Empty' ? (
        <Alert severity="info">Preparing dashboard preview. This can take a moment.</Alert>
      ) : null}

      {children}
    </Box>
  );
};
