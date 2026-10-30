'use client';

import NextLink from 'next/link';
import { Label } from 'src/components/label';
import { Box, Stack, ListItem, Typography, ListItemButton } from '@mui/material';

import { safeDashboardHref, dashboardDisplayValue } from './dashboard-widget-presentation';

import type { DashboardWidget } from './dashboard-types';

export function DashboardWorkRow({ widget }: { widget: DashboardWidget }) {
  const href = safeDashboardHref(widget.drilldownUrl);
  const value = dashboardDisplayValue(widget);
  const { priority } = widget;
  const content = (
    <Stack spacing={0.75} sx={{ minWidth: 0, width: 1, py: 1.25, overflowWrap: 'anywhere' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        {widget.owner && (
          <Typography variant="caption" color="text.secondary">
            {widget.owner}
          </Typography>
        )}
        {widget.dueLabel && <Label>{widget.dueLabel}</Label>}
      </Stack>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={1}>
        <Typography component="h3" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
          {widget.title}
        </Typography>
        {value !== undefined && (
          <Typography
            component="span"
            variant="subtitle2"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {value}
          </Typography>
        )}
      </Stack>
      {widget.subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          {widget.subtitle}
        </Typography>
      )}
      {(priority === 'high' || priority === 'critical') && (
        <Label
          color={priority === 'critical' ? 'error' : 'warning'}
          sx={{ alignSelf: 'flex-start' }}
        >
          {priority === 'critical' ? 'Critical priority' : 'High priority'}
        </Label>
      )}
    </Stack>
  );
  return (
    <ListItem
      disablePadding
      data-testid={`dashboard-widget-${widget.id}`}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      {href ? (
        <ListItemButton
          component={NextLink}
          href={href}
          aria-label={`${widget.actionLabel || 'View details'}: ${widget.title}`}
          sx={{
            px: 0.5,
            '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
          }}
        >
          {content}
        </ListItemButton>
      ) : (
        <Box sx={{ px: 0.5, width: 1 }}>{content}</Box>
      )}
    </ListItem>
  );
}
