'use client';

import type {
  Academic360Alert,
  Academic360UpcomingItem,
} from 'src/screens/academic/student-academic-360/types';

import { Card, Chip, Stack, Typography } from '@mui/material';
import { Academic360EmptyState } from 'src/screens/academic/student-academic-360/components/Academic360EmptyState';

type Student360ActionPanelsProps = {
  alerts?: Academic360Alert[];
  upcomingItems?: Academic360UpcomingItem[];
};

const alertColor = (severity?: string): 'error' | 'warning' | 'info' => {
  const normalized = (severity || '').toLowerCase();
  if (normalized.includes('urgent') || normalized.includes('error')) return 'error';
  if (
    normalized.includes('attention') ||
    normalized.includes('important') ||
    normalized.includes('warning')
  ) {
    return 'warning';
  }
  return 'info';
};

export function Student360ActionPanels({
  alerts = [],
  upcomingItems = [],
}: Student360ActionPanelsProps) {
  return (
    <Stack spacing={1}>
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          Attention Required
        </Typography>
        {alerts.length > 0 ? (
          <Stack spacing={1}>
            {alerts.slice(0, 4).map((alert) => (
              <Stack key={`${alert.source}-${alert.title}`} spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                    size="small"
                    color={alertColor(alert.severity)}
                    variant="soft"
                    label={alert.severity || 'Info'}
                  />
                  <Typography variant="subtitle2">{alert.title}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {alert.message || alert.evidence || 'Academic attention is required.'}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Academic360EmptyState
            icon="mdi:check-decagram-outline"
            color="success"
            title="No active academic alerts"
            description="This student has no active alert from the available Academic 360 data."
            compact
          />
        )}
      </Card>

      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          Upcoming Academic Work
        </Typography>
        {upcomingItems.length > 0 ? (
          <Stack spacing={1}>
            {upcomingItems.slice(0, 5).map((item) => (
              <Stack
                key={`${item.type}-${item.title}-${item.date}`}
                direction="row"
                justifyContent="space-between"
                gap={1}
              >
                <Typography variant="body2">{item.title || 'Academic item'}</Typography>
                <Chip
                  size="small"
                  color={item.isOverdue ? 'error' : 'default'}
                  variant="soft"
                  label={item.status || item.type || '-'}
                />
              </Stack>
            ))}
          </Stack>
        ) : (
          <Academic360EmptyState
            icon="mdi:calendar-blank-outline"
            color="info"
            title="Nothing upcoming"
            description="Upcoming academic activities will show here when available."
            compact
          />
        )}
      </Card>
    </Stack>
  );
}
