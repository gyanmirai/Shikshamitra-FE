import { useId } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { Box, Tab, Stack, Drawer, Tooltip, IconButton, Typography } from '@mui/material';
import EnableNotifications from 'src/components/notification-inbox/enable-notifications';
import { NotificationInbox } from 'src/components/notification-inbox/notification-inbox';

const inboxTabs = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
] as const;

const focusOutline = {
  outline: '2px solid',
  outlineColor: 'primary.main',
  outlineOffset: -2,
};

const headerAction = {
  width: 44,
  height: 44,
  flexShrink: 0,
  '&.Mui-focusVisible': focusOutline,
};

type NotificationsPanelProps = {
  open: boolean;
  owner: string;
  unreadCount?: number;
  onClose: () => void;
  onOpenPreferences: () => void;
};

export function NotificationsPanel({
  open,
  owner,
  unreadCount,
  onClose,
  onOpenPreferences,
}: NotificationsPanelProps) {
  const drawerId = useId();
  const tabs = useTabs('all');

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': drawerId,
          sx: { width: { xs: '100%', sm: 420 }, maxWidth: '100%' },
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{ px: { xs: 2, sm: 3 }, py: 2, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography
          id={drawerId}
          variant="h6"
          component="h2"
          sx={{ flex: 1, overflowWrap: 'anywhere' }}
        >
          Notifications
        </Typography>
        <Tooltip title="Notification preferences">
          <IconButton
            aria-label="Notification preferences"
            onClick={onOpenPreferences}
            sx={headerAction}
          >
            <Iconify icon="solar:settings-bold-duotone" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Close notifications">
          <IconButton aria-label="Close notifications" onClick={onClose} sx={headerAction}>
            <Iconify icon={GlobalIcons.cancel} width={24} />
          </IconButton>
        </Tooltip>
      </Stack>
      <CustomTabs
        aria-label="Notification inbox filters"
        value={tabs.value}
        onChange={tabs.onChange}
        guardUnsavedChanges={false}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
        slotProps={{ tab: { '&.Mui-focusVisible': focusOutline } }}
      >
        {inboxTabs.map(({ value, label }) => (
          <Tab
            key={value}
            value={value}
            label={value === 'unread' && unreadCount ? `${label} (${unreadCount})` : label}
            id={`${drawerId}-${value}-tab`}
            aria-controls={`${drawerId}-${value}-panel`}
          />
        ))}
      </CustomTabs>
      {inboxTabs.map(({ value }) => {
        const active = tabs.value === value;
        return (
          <Box
            key={value}
            id={`${drawerId}-${value}-panel`}
            role="tabpanel"
            aria-labelledby={`${drawerId}-${value}-tab`}
            hidden={!active}
            tabIndex={active ? 0 : undefined}
            sx={{
              display: active ? 'flex' : 'none',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              bgcolor: 'background.paper',
              '&:focus-visible': focusOutline,
            }}
          >
            {open && active && (
              <NotificationInbox owner={owner} unreadOnly={value === 'unread'} onOpen={onClose} />
            )}
          </Box>
        );
      })}
      {open && <EnableNotifications />}
    </Drawer>
  );
}
