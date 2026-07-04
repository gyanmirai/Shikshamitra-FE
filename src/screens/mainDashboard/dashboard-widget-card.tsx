'use client';

import { useRouter } from 'next/navigation';
import { Card, Chip, Grid, Stack, Typography, CardActionArea } from '@mui/material';

import type { DashboardWidget } from './dashboard-types';

const statusColorMap = {
  primary: 'primary',
  secondary: 'secondary',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const;

type DashboardWidgetCardProps = {
  widget: DashboardWidget;
  compact?: boolean;
};

export function DashboardWidgetCard({ widget, compact = false }: DashboardWidgetCardProps) {
  const router = useRouter();
  const content = (
    <Stack spacing={1.25} sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Typography variant={compact ? 'subtitle2' : 'subtitle1'} sx={{ fontWeight: 700 }}>
          {widget.title}
        </Typography>
        {widget.status && (
          <Chip
            size="small"
            color={statusColorMap[widget.status]}
            label={widget.value ?? widget.count ?? widget.dueLabel ?? 'Open'}
          />
        )}
      </Stack>

      {widget.value !== undefined && <Typography variant="h5">{widget.value}</Typography>}

      {widget.subtitle && (
        <Typography variant="body2" color="text.secondary">
          {widget.subtitle}
        </Typography>
      )}

      {(widget.trend || widget.owner || widget.dueLabel) && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {widget.trend && <Chip size="small" variant="outlined" label={widget.trend} />}
          {widget.owner && <Chip size="small" variant="outlined" label={widget.owner} />}
          {widget.dueLabel && <Chip size="small" variant="outlined" label={widget.dueLabel} />}
        </Stack>
      )}
    </Stack>
  );

  if (!widget.drilldownUrl) {
    return (
      <Card
        variant="outlined"
        sx={{ height: '100%' }}
        data-testid={`dashboard-widget-${widget.id}`}
      >
        {content}
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%' }} data-testid={`dashboard-widget-${widget.id}`}>
      <CardActionArea
        aria-label={`Open ${widget.title}`}
        onClick={() => router.push(widget.drilldownUrl as string)}
        sx={{ height: '100%' }}
      >
        {content}
      </CardActionArea>
    </Card>
  );
}

export function DashboardWidgetGrid({
  widgets,
  compact = false,
}: {
  widgets: DashboardWidget[];
  compact?: boolean;
}) {
  return (
    <Grid container spacing={1}>
      {widgets.map((widget) => (
        <Grid key={widget.id} size={{ xs: 12, sm: 6, md: compact ? 4 : 3 }}>
          <DashboardWidgetCard widget={widget} compact={compact} />
        </Grid>
      ))}
    </Grid>
  );
}
