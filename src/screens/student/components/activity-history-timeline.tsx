'use client';

import type { ReactNode } from 'react';

import Timeline from '@mui/lab/Timeline';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useId, useState, Fragment } from 'react';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import { skeletonReducedMotionSx } from 'src/theme/styles/skeleton';
import { Box, Stack, Button, Skeleton, Typography } from '@mui/material';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { fDate, fTime, fDateTime, fTimestamp } from 'src/utils/format-time';

export type ActivityHistoryItem = {
  id: string;
  title: string;
  occurredAt: string;
  icon: string;
  actor?: string;
  description?: ReactNode;
  details?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
};

export function ActivityHistorySkeleton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <Stack role="status" aria-label={ariaLabel} spacing={1.5} sx={skeletonReducedMotionSx}>
      <Skeleton width={84} height={20} />
      {[0, 1, 2].map((row) => (
        <Stack key={row} direction="row" spacing={1.5} alignItems="flex-start">
          <Skeleton variant="rounded" width={32} height={32} sx={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton width="58%" height={20} />
            <Skeleton width="35%" height={18} />
          </Box>
          <Skeleton width={56} height={18} sx={{ flexShrink: 0 }} />
        </Stack>
      ))}
    </Stack>
  );
}

export function ActivityHistoryTimeline({
  items,
  ariaLabel,
  initiallyVisible,
}: {
  items: readonly ActivityHistoryItem[];
  ariaLabel: string;
  initiallyVisible?: number;
}) {
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const ordered = items
    .map((item) => {
      const timestamp = fTimestamp(item.occurredAt);
      const validTime = typeof timestamp === 'number';
      return {
        item,
        timestamp: validTime ? timestamp : Number.NEGATIVE_INFINITY,
        dateLabel: validTime ? fDate(item.occurredAt) : 'Date not recorded',
        timeLabel: validTime ? fTime(item.occurredAt, 'h:mm A') : 'Time not recorded',
        fullTime: validTime ? fDateTime(item.occurredAt, 'DD MMM YYYY, h:mm A [UTC]Z') : null,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);
  const canExpand = initiallyVisible !== undefined && items.length > initiallyVisible;
  const visible = canExpand && !expanded ? ordered.slice(0, initiallyVisible) : ordered;

  return (
    <Stack
      spacing={1}
      sx={{ minWidth: 0, containerType: 'inline-size', containerName: 'activity-history' }}
    >
      <Timeline
        id={listId}
        aria-label={ariaLabel}
        sx={{ p: 0, m: 0, [`& .${timelineItemClasses.root}:before`]: { display: 'none' } }}
      >
        {visible.map(({ item, dateLabel, timeLabel, fullTime }, index) => (
          <Fragment key={item.id}>
            {(index === 0 || dateLabel !== visible[index - 1].dateLabel) && (
              <Box
                component="li"
                role="presentation"
                sx={{ listStyle: 'none', pt: index ? 1 : 0, pb: 1 }}
              >
                <Label color="default">{dateLabel}</Label>
              </Box>
            )}
            <TimelineItem sx={{ minHeight: 0 }}>
              <TimelineSeparator sx={{ width: 32, flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'text.secondary',
                    bgcolor: 'background.neutral',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Iconify icon={item.icon} width={18} aria-hidden />
                </Box>
                {dateLabel === visible[index + 1]?.dateLabel && (
                  <TimelineConnector sx={{ bgcolor: 'divider', width: '1px' }} />
                )}
              </TimelineSeparator>
              <TimelineContent
                sx={{
                  p: 0,
                  pl: 1.5,
                  pb: 1.25,
                  pt: 0.25,
                  minWidth: 0,
                  display: 'grid',
                  gap: 0.5,
                  alignItems: 'start',
                  '@container activity-history (min-width: 420px)': {
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    columnGap: 2,
                  },
                }}
              >
                <Stack spacing={0.25} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  <Stack direction="row" gap={0.75} alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle2">{item.title}</Typography>
                    {item.badge}
                  </Stack>
                  {item.description && (
                    <Typography variant="body2" color="text.secondary" component="div">
                      {item.description}
                    </Typography>
                  )}
                  {item.actor && (
                    <Typography variant="caption" color="text.secondary">
                      {item.actor}
                    </Typography>
                  )}
                  {item.details}
                </Stack>
                <Typography
                  component={fullTime ? 'time' : 'span'}
                  dateTime={fullTime ? item.occurredAt : undefined}
                  title={fullTime ?? undefined}
                  aria-label={fullTime ?? undefined}
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontVariantNumeric: 'tabular-nums',
                    '@container activity-history (min-width: 420px)': { textAlign: 'right' },
                  }}
                >
                  {timeLabel}
                </Typography>
                {item.action && <Box sx={{ gridColumn: '1 / -1' }}>{item.action}</Box>}
              </TimelineContent>
            </TimelineItem>
          </Fragment>
        ))}
      </Timeline>
      {canExpand && (
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          aria-controls={listId}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          endIcon={<Iconify icon={expanded ? 'mdi:chevron-up' : GlobalIcons.expandMore} />}
          sx={{ alignSelf: 'flex-start' }}
        >
          {expanded ? 'Show recent activity' : `Show all ${items.length} events`}
        </Button>
      )}
    </Stack>
  );
}
