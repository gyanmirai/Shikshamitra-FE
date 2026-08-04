'use client';

import NextLink from 'next/link';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';
import { Box, Card, Chip, Grid, Stack, Typography, CardActionArea } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import type { DashboardWidget, DashboardWidgetKind, DashboardPriority } from './dashboard-types';

const statusColorMap = {
  primary: 'primary',
  secondary: 'secondary',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const;

const kindIconMap: Record<DashboardWidgetKind, string> = {
  metric: 'solar:chart-2-bold-duotone',
  action: 'solar:checklist-minimalistic-bold-duotone',
  risk: 'solar:danger-triangle-bold-duotone',
  health: 'solar:pulse-2-bold-duotone',
  timeline: 'solar:calendar-date-bold-duotone',
  announcement: 'solar:bell-bing-bold-duotone',
};

const priorityColorMap: Record<DashboardPriority, 'success' | 'info' | 'warning' | 'error'> = {
  low: 'success',
  normal: 'info',
  high: 'warning',
  critical: 'error',
};

type DashboardWidgetCardProps = {
  widget: DashboardWidget;
  kind?: DashboardWidgetKind;
  featured?: boolean;
};

const formatDashboardValue = (value: DashboardWidget['value']) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value)
    : value;

function DashboardWidgetContent({
  widget,
  kind,
  featured,
}: Required<Pick<DashboardWidgetCardProps, 'kind' | 'featured'>> & {
  widget: DashboardWidget;
}) {
  const theme = useTheme();
  const palette = theme.vars?.palette ?? theme.palette;
  const status = widget.status || 'info';
  const priority = widget.priority || 'normal';
  const displayValue = formatDashboardValue(widget.value ?? widget.count);
  const statusColor = statusColorMap[status];
  const statusAlpha = (opacity: number) =>
    palette[statusColor].mainChannel
      ? varAlpha(palette[statusColor].mainChannel, opacity)
      : alpha(palette[statusColor].main, opacity);
  const priorityColor = priorityColorMap[priority];
  const isOperational = kind === 'action' || kind === 'risk';

  return (
    <Stack
      spacing={featured ? 2 : 1.5}
      sx={{
        p: featured ? 3 : 2.25,
        minHeight: featured ? 190 : kind === 'metric' ? 160 : 132,
        height: '100%',
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
        <Box
          aria-hidden="true"
          sx={{
            width: featured ? 44 : 38,
            height: featured ? 44 : 38,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            color: `${statusColor}.main`,
            bgcolor: statusAlpha(0.12),
            flex: '0 0 auto',
          }}
        >
          <Iconify icon={kindIconMap[kind]} width={featured ? 26 : 22} />
        </Box>

        {isOperational ? (
          <Chip
            size="small"
            color={priorityColor}
            variant="soft"
            label={priority === 'normal' ? 'Open' : priority}
            sx={{ textTransform: 'capitalize' }}
          />
        ) : widget.status ? (
          <Chip
            size="small"
            color={statusColor}
            variant="soft"
            label={widget.health || widget.trend || status}
            sx={{ textTransform: 'capitalize' }}
          />
        ) : null}
      </Stack>

      <Box sx={{ minWidth: 0 }}>
        <Typography component="h3" variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {widget.title}
        </Typography>
        {displayValue !== undefined && displayValue !== null ? (
          <Typography
            variant={featured ? 'h3' : kind === 'metric' ? 'h4' : 'h5'}
            sx={{ fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
          >
            {displayValue}
          </Typography>
        ) : null}
      </Box>

      {widget.subtitle ? (
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {widget.subtitle}
        </Typography>
      ) : null}

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        {widget.owner ? <Chip size="small" variant="outlined" label={widget.owner} /> : null}
        {widget.dueLabel ? <Chip size="small" variant="outlined" label={widget.dueLabel} /> : null}
        {widget.drilldownUrl ? (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ ml: 'auto', color: 'primary.main', fontWeight: 700 }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {widget.actionLabel || 'View details'}
            </Typography>
            <Iconify aria-hidden="true" icon="solar:arrow-right-up-linear" width={16} />
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  );
}

export function DashboardWidgetCard({
  widget,
  kind = widget.kind || 'metric',
  featured = false,
}: DashboardWidgetCardProps) {
  const theme = useTheme();
  const palette = theme.vars?.palette ?? theme.palette;
  const status = widget.status || 'info';
  const statusColor = statusColorMap[status];
  const isRisk = kind === 'risk';
  const primaryAlpha = (opacity: number) =>
    palette.primary.mainChannel
      ? varAlpha(palette.primary.mainChannel, opacity)
      : alpha(palette.primary.main, opacity);
  const statusAlpha = (opacity: number) =>
    palette[statusColor].mainChannel
      ? varAlpha(palette[statusColor].mainChannel, opacity)
      : alpha(palette[statusColor].main, opacity);

  const cardSx = {
    height: '100%',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: isRisk ? statusAlpha(0.32) : 'divider',
    background: featured
      ? `linear-gradient(145deg, ${primaryAlpha(0.16)}, ${palette.background.paper} 70%)`
      : isRisk
        ? `linear-gradient(145deg, ${statusAlpha(0.1)}, ${palette.background.paper} 75%)`
        : palette.background.paper,
    transition: theme.transitions.create(['transform', 'box-shadow', 'border-color']),
    '&:hover': widget.drilldownUrl
      ? {
          transform: 'translateY(-2px)',
          borderColor: primaryAlpha(0.4),
          boxShadow: theme.customShadows?.z8 ?? theme.shadows[8],
        }
      : undefined,
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      '&:hover': { transform: 'none' },
    },
  } as const;

  const content = <DashboardWidgetContent widget={widget} kind={kind} featured={featured} />;

  if (!widget.drilldownUrl) {
    return (
      <Card variant="outlined" sx={cardSx} data-testid={`dashboard-widget-${widget.id}`}>
        {content}
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={cardSx} data-testid={`dashboard-widget-${widget.id}`}>
      <CardActionArea
        component={NextLink}
        href={widget.drilldownUrl}
        aria-label={`${widget.actionLabel || 'View details'}: ${widget.title}`}
        sx={{
          height: '100%',
          alignItems: 'stretch',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: primaryAlpha(0.12),
          '&:focus-visible': {
            outline: `3px solid ${palette.primary.main}`,
            outlineOffset: -3,
          },
        }}
      >
        {content}
      </CardActionArea>
    </Card>
  );
}

export function DashboardWidgetGrid({
  widgets,
  kind = 'metric',
  featureFirst = false,
}: {
  widgets: DashboardWidget[];
  kind?: DashboardWidgetKind;
  featureFirst?: boolean;
}) {
  return (
    <Grid container spacing={2}>
      {widgets.map((widget, index) => {
        const featured = featureFirst && index === 0;
        const gridSize =
          kind === 'metric'
            ? { xs: 12, sm: 6, xl: featured ? 6 : 3 }
            : kind === 'health' || kind === 'action'
              ? { xs: 12, md: 6 }
              : { xs: 12 };

        return (
          <Grid key={widget.id} size={gridSize}>
            <DashboardWidgetCard widget={widget} kind={kind} featured={featured} />
          </Grid>
        );
      })}
    </Grid>
  );
}
