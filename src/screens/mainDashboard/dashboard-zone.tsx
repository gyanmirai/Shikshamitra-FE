'use client';

import type { ReactNode } from 'react';

import { Box, Card, Alert, Stack, Button, Skeleton, Typography } from '@mui/material';

type DashboardStateCardProps = {
  testId: string;
  children: ReactNode;
};

function DashboardStateCard({ testId, children }: DashboardStateCardProps) {
  return (
    <Card variant="outlined" sx={{ p: 2.5, minHeight: 120 }} data-testid={testId}>
      {children}
    </Card>
  );
}

type DashboardZoneProps = {
  title: string;
  testId: string;
  children: ReactNode;
  isEmpty: boolean;
  description?: string;
  itemCount?: number;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
  onRetry?: () => void;
};

export function DashboardZone({
  title,
  testId,
  children,
  isEmpty,
  description,
  itemCount,
  isLoading = false,
  error,
  emptyMessage = 'Nothing needs your attention in this area right now.',
  onRetry,
}: DashboardZoneProps) {
  return (
    <Stack
      spacing={1.5}
      component="section"
      aria-labelledby={`${testId}-title`}
      data-testid={testId}
    >
      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography id={`${testId}-title`} component="h2" variant="h5">
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Box>
        {typeof itemCount === 'number' && !isLoading ? (
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Typography>
        ) : null}
      </Stack>

      <Box aria-busy={isLoading || undefined} aria-live="polite">
        {isLoading ? (
          <Card
            variant="outlined"
            sx={{ p: 2.5, minHeight: 150 }}
            data-testid={`${testId}-loading`}
          >
            <Stack spacing={1.5} aria-label={`Loading ${title}`}>
              <Skeleton variant="rounded" width={44} height={38} />
              <Skeleton variant="text" width="42%" height={26} />
              <Skeleton variant="text" width="75%" />
              <Skeleton variant="text" width="58%" />
            </Stack>
          </Card>
        ) : error ? (
          <Alert
            severity="warning"
            data-testid={`${testId}-error`}
            action={
              onRetry ? (
                <Button color="inherit" size="small" onClick={onRetry}>
                  Retry
                </Button>
              ) : undefined
            }
          >
            {error}
          </Alert>
        ) : isEmpty ? (
          <DashboardStateCard testId={`${testId}-empty`}>
            <Stack spacing={0.75} justifyContent="center" sx={{ minHeight: 70 }}>
              <Typography variant="subtitle2">You’re all caught up</Typography>
              <Typography variant="body2" color="text.secondary">
                {emptyMessage}
              </Typography>
            </Stack>
          </DashboardStateCard>
        ) : (
          children
        )}
      </Box>
    </Stack>
  );
}
