import { Label } from 'src/components/label';
import { fDate, fTime } from 'src/utils/format-time';
import { Box, Link, List, Stack, ListItem, Typography } from '@mui/material';

import { toSafeDashboardHref } from './dashboard-navigation';

import type { DashboardFocus } from './dashboard-focus-types';

function formatSlotTime(time?: string) {
  if (!time) return undefined;
  return /^\d{2}:\d{2}(:\d{2})?$/.test(time) ? fTime(`2000-01-01T${time}`) : fTime(time);
}

export function DashboardFocusItems({ focus }: { focus: DashboardFocus }) {
  if (!focus.items.length) return null;
  return (
    <List disablePadding aria-label={focus.title}>
      {focus.items.map((item) => {
        const href = focus.accessMode === 'staff' ? toSafeDashboardHref(item.drilldownUrl) : undefined;
        const date = item.date && !Number.isNaN(Date.parse(item.date)) ? fDate(item.date) : item.date;
        const time = formatSlotTime(item.time);
        const endTime = formatSlotTime(item.endTime);
        return (
          <ListItem key={item.id} disableGutters divider sx={{ py: 1.5, gap: 1.5, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
              <Typography variant="subtitle2">{item.title}</Typography>
              {item.subtitle && <Typography variant="body2" color="text.secondary">{item.subtitle}</Typography>}
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {date && <Typography variant="caption" color="text.secondary">{date}</Typography>}
                {time && <Typography variant="caption" color="text.secondary">
                  {time}{endTime ? ` to ${endTime}` : ''}
                </Typography>}
              </Stack>
              {href && <Link href={href} variant="caption" aria-label={`View details: ${item.title}`}>
                View details
              </Link>}
            </Box>
            {item.status && <Label sx={{ flexShrink: 0 }}>{item.status}</Label>}
          </ListItem>
        );
      })}
    </List>
  );
}
