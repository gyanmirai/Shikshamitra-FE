import type { NotificationInboxItem } from 'src/redux/communication/notification-self-api';

import { useId } from 'react';
import { fIsSame } from 'src/utils/format-time';
import { Box, List, Typography } from '@mui/material';

import { NotificationInboxRow } from './notification-inbox-item';

const sections = [
  { key: 'today', label: 'Today' },
  { key: 'earlier', label: 'Earlier' },
] as const;

type NotificationInboxListProps = {
  items: NotificationInboxItem[];
  owner: string;
  unreadOnly: boolean;
  onOpen: () => void;
};

export function NotificationInboxList({
  items,
  owner,
  unreadOnly,
  onOpen,
}: NotificationInboxListProps) {
  const listId = useId();
  const currentDate = new Date();
  const grouped: Record<(typeof sections)[number]['key'], NotificationInboxItem[]> = {
    today: [],
    earlier: [],
  };

  items.forEach((item) => {
    const group = fIsSame(item.creationTime, currentDate, 'day') === true ? 'today' : 'earlier';
    grouped[group].push(item);
  });

  return sections.map(({ key, label }) => {
    if (!grouped[key].length) return null;
    const headingId = `${listId}-${key}`;
    return (
      <Box component="section" key={key}>
        <Typography
          id={headingId}
          component="h3"
          variant="subtitle2"
          sx={{
            px: { xs: 2, sm: 3 },
            py: 0.75,
            bgcolor: 'background.neutral',
            color: 'text.secondary',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {label}
        </Typography>
        <List disablePadding aria-labelledby={headingId} sx={{ maxHeight: 'none' }}>
          {grouped[key].map((item) => (
            <NotificationInboxRow
              key={item.id}
              item={item}
              owner={owner}
              unreadOnly={unreadOnly}
              isToday={key === 'today'}
              onOpen={onOpen}
            />
          ))}
        </List>
      </Box>
    );
  });
}
