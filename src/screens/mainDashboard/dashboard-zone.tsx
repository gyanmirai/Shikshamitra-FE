'use client';

import type { ReactNode } from 'react';

import { Card, Alert, Stack, Typography, CircularProgress } from '@mui/material';

type DashboardStateCardProps = {
  testId: string;
  children: ReactNode;
};

function DashboardStateCard({ testId, children }: DashboardStateCardProps) {
  return (
    <Card variant="outlined" sx={{ p: 2 }} data-testid={testId}>
      {children}
    </Card>
  );
}

type DashboardZoneProps = {
  title: string;
  testId: string;
  children: ReactNode;
  isEmpty: boolean;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
};

export function DashboardZone({
  title,
  testId,
  children,
  isEmpty,
  isLoading = false,
  error,
  emptyMessage = 'No permitted dashboard items are available for this zone.',
}: DashboardZoneProps) {
  return (
    <Stack spacing={1} data-testid={testId}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      {isLoading ? (
        <DashboardStateCard testId={`${testId}-loading`}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading dashboard items...
            </Typography>
          </Stack>
        </DashboardStateCard>
      ) : error ? (
        <Alert severity="warning" data-testid={`${testId}-error`}>
          {error}
        </Alert>
      ) : isEmpty ? (
        <DashboardStateCard testId={`${testId}-empty`}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </DashboardStateCard>
      ) : (
        children
      )}
    </Stack>
  );
}
