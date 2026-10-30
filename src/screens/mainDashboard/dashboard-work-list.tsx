'use client';

import { FormSectionCard } from 'src/components/form-section-card';
import { Box, List, Alert, Stack, Button, Skeleton, Typography } from '@mui/material';

import { DashboardWorkRow } from './dashboard-work-row';
import { dashboardKindIcons } from './dashboard-widget-presentation';

import type { DashboardWidget } from './dashboard-types';

type DashboardWorkListProps = {
  widgets: DashboardWidget[];
  title: string;
  description?: string;
  testId: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  kind?: 'action' | 'risk' | 'timeline' | 'announcement';
};

export function DashboardWorkList({
  widgets,
  title,
  description,
  testId,
  isLoading = false,
  error,
  onRetry,
  emptyMessage = 'No items in this period.',
  kind = 'action',
}: DashboardWorkListProps) {
  const initialLoading = isLoading && widgets.length === 0;
  return (
    <Box data-testid={testId} aria-busy={isLoading || undefined} sx={{ height: 1, minWidth: 0 }}>
      <FormSectionCard
        aria-label={title}
        title={title}
        description={description}
        icon={dashboardKindIcons[kind]}
        contentSpacing={1}
        sx={{ height: 1, boxShadow: 'none' }}
        action={
          <Typography variant="caption" color="text.secondary">
            {!initialLoading && !error
              ? `${widgets.length} ${widgets.length === 1 ? 'item' : 'items'}`
              : null}
          </Typography>
        }
      >
        <Stack sx={{ minHeight: 144 }} aria-live="polite">
          {error && (
            <Alert
              severity="warning"
              data-testid={`${testId}-error`}
              action={
                onRetry && (
                  <Button size="small" color="inherit" onClick={onRetry}>
                    Retry
                  </Button>
                )
              }
            >
              {error}
            </Alert>
          )}
          {initialLoading ? (
            <Stack spacing={1} aria-label={`Loading ${title}`} data-testid={`${testId}-loading`}>
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} variant="rounded" height={40} />
              ))}
            </Stack>
          ) : widgets.length > 0 ? (
            <>
              {isLoading && (
                <Typography variant="caption" color="text.secondary" role="status">
                  Refreshing {title}
                </Typography>
              )}
              <List disablePadding>
                {widgets.map((widget) => (
                  <DashboardWorkRow key={widget.id} widget={widget} />
                ))}
              </List>
            </>
          ) : (
            !error && (
              <Typography
                data-testid={`${testId}-empty`}
                variant="body2"
                color="text.secondary"
                sx={{ my: 'auto', py: 2 }}
              >
                {emptyMessage}
              </Typography>
            )
          )}
        </Stack>
      </FormSectionCard>
    </Box>
  );
}
