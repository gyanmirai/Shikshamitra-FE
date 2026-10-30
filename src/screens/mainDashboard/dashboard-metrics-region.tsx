import { Box, Alert, Stack, Button, Skeleton, Typography } from '@mui/material';

import { DashboardWidgetGrid } from './dashboard-widget-card';

import type { DashboardWidget } from './dashboard-types';

export function DashboardMetricsRegion({ widgets, isLoading, error, onRetry }: {
  widgets: DashboardWidget[]; isLoading: boolean; error?: string; onRetry?: () => void;
}) {
  return <Stack spacing={1.5} data-testid="dashboard-zone-kpis" aria-label="Dashboard overview" aria-busy={isLoading}>
    {error && <Alert severity="warning" data-testid="dashboard-zone-kpis-error"
      action={onRetry && <Button size="small" color="inherit" onClick={onRetry}>Retry</Button>}>{error}</Alert>}
    {isLoading && !widgets.length ? <Box data-testid="dashboard-zone-kpis-loading" sx={{ display: 'grid', gap: 2,
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))', lg: 'repeat(4,minmax(0,1fr))' } }}>
      {[0, 1, 2, 3].map((key) => <Skeleton key={key} variant="rounded" height={132} />)}
    </Box> : widgets.length ? <DashboardWidgetGrid widgets={widgets} kind="metric" /> : !error &&
      <Typography variant="body2" color="text.secondary" sx={{ px: 1 }} data-testid="dashboard-zone-kpis-empty">
        No summary indicators are available for your permissions and this period.
      </Typography>}
  </Stack>;
}
