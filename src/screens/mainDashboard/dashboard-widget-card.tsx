'use client';

import NextLink from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Card, Grid, Stack, Typography, CardActionArea } from '@mui/material';

import {
  safeDashboardHref,
  dashboardKindIcons,
  dashboardDisplayValue,
} from './dashboard-widget-presentation';

import type { DashboardWidget, DashboardWidgetKind } from './dashboard-types';

type DashboardWidgetCardProps = {
  widget: DashboardWidget;
  kind?: DashboardWidgetKind;
  featured?: boolean;
};

export function DashboardWidgetCard({
  widget,
  kind = widget.kind || 'metric',
  featured: _featured,
}: DashboardWidgetCardProps) {
  const href = safeDashboardHref(widget.drilldownUrl);
  const value = dashboardDisplayValue(widget);
  const state = widget.health;
  const content = (
    <Stack
      spacing={0.75}
      sx={{ p: 2, height: 1, minHeight: kind === 'metric' ? 132 : 120, overflowWrap: 'anywhere' }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography
          component="h3"
          variant="subtitle2"
          color="text.secondary"
          sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
        >
          {widget.title}
        </Typography>
        <Iconify
          icon={dashboardKindIcons[kind]}
          width={20}
          aria-hidden
          sx={{ color: 'text.secondary' }}
        />
      </Stack>
      <Typography
        component="p"
        variant={kind === 'metric' ? 'h4' : 'h5'}
        sx={{ fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
      >
        {value ?? 'Unavailable'}
      </Typography>
      {widget.subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          {widget.subtitle}
        </Typography>
      )}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        sx={{ mt: 'auto' }}
      >
        {state && (
          <Label
            color={state === 'critical' ? 'error' : state === 'attention' ? 'warning' : 'success'}
          >
            {state === 'good' ? 'Good' : state === 'attention' ? 'Attention' : 'Critical'}
          </Label>
        )}
        {widget.trend && (
          <Typography variant="caption" color="text.secondary">
            {widget.trend}
          </Typography>
        )}
        {widget.dueLabel && (
          <Typography variant="caption" color="text.secondary">
            {widget.dueLabel}
          </Typography>
        )}
        {href && (
          <Typography variant="caption" sx={{ ml: 'auto', color: 'primary.main' }}>
            {widget.actionLabel || 'View details'}
          </Typography>
        )}
      </Stack>
    </Stack>
  );

  return (
    <Card
      variant="outlined"
      sx={{ height: 1, boxShadow: 'none', borderRadius: 2 }}
      data-testid={`dashboard-widget-${widget.id}`}
    >
      {href ? (
        <CardActionArea
          component={NextLink}
          href={href}
          aria-label={`${widget.actionLabel || 'View details'}: ${widget.title}`}
          sx={{
            height: 1,
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: -2,
            },
          }}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}

export function DashboardWidgetGrid({
  widgets,
  kind = 'metric',
  featureFirst: _featureFirst,
}: {
  widgets: DashboardWidget[];
  kind?: DashboardWidgetKind;
  featureFirst?: boolean;
}) {
  return (
    <Grid container spacing={1.5}>
      {widgets.map((widget) => (
        <Grid
          key={widget.id}
          size={kind === 'metric' ? { xs: 12, sm: 6, lg: 3 } : { xs: 12, sm: 6 }}
        >
          <DashboardWidgetCard widget={widget} kind={kind} />
        </Grid>
      ))}
    </Grid>
  );
}
