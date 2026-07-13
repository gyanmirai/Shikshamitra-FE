'use client';

import type { IconButtonProps } from '@mui/material/IconButton';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import { Label } from 'src/components/label';
import { useState, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { varHover } from 'src/components/animate';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';

import { NotificationItem } from './notification-item';

import type { NotificationItemProps } from './notification-item';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export type NotificationsDrawerProps = IconButtonProps & {
  data?: NotificationItemProps[];
};

const notificationsData: NotificationItemProps[] = [
  {
    id: '1',
    type: 'messsage',
    title: 'message 1',
    category: 'chat',
    isUnRead: true,
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    createdAt: '2025-03-21T10:30:00Z',
  },
  {
    id: '2',
    type: 'messsage',
    title: 'message 2',
    category: 'chat',
    isUnRead: false,
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    createdAt: '2025-03-21T10:30:00Z',
  },
  {
    id: '3',
    type: 'messsage',
    title: 'message 4',
    category: 'chat',
    isUnRead: true,
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    createdAt: '2025-03-21T10:30:00Z',
  },
];
export function NotificationsDrawer({
  data = notificationsData,
  sx,
  ...other
}: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState(notificationsData);

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length;
  const TABS = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: totalUnRead },
  ];
  const drawer = useBoolean();

  const [currentTab, setCurrentTab] = useState('all');

  const filteredNotifications = notifications.filter((notification) =>
    currentTab === 'all' ? true : notification.isUnRead
  );

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, isUnRead: false })));
  };

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Notifications
      </Typography>

      {!!totalUnRead && (
        <Tooltip title="Mark all as read">
          <IconButton
            aria-label="Mark all notifications as read"
            color="primary"
            onClick={handleMarkAllAsRead}
          >
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      <IconButton
        aria-label="Close notifications"
        onClick={drawer.onFalse}
        sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
      >
        <Iconify icon="mingcute:close-line" />
      </IconButton>

      {/* <IconButton>
        <Iconify icon="solar:settings-bold-duotone" />
      </IconButton> */}
    </Stack>
  );

  const renderTabs = (
    <CustomTabs variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={
                (tab.value === 'unread' && 'info') ||
                (tab.value === 'archived' && 'success') ||
                'default'
              }
            >
              {tab.count}
            </Label>
          }
        />
      ))}
    </CustomTabs>
  );

  const renderList = (
    <Scrollbar>
      <Box component="ul">
        {filteredNotifications?.map((notification) => (
          //
          <Box component="li" key={notification.id} sx={{ display: 'flex' }}>
            <NotificationItem notification={notification} />
          </Box>
        ))}
      </Box>
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        aria-label="Open notifications"
        component={motion.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={drawer.onTrue}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <SvgIcon>
            {/* https://icon-sets.iconify.design/solar/bell-bing-bold-duotone/ */}
            <path
              fill="currentColor"
              d="M18.75 9v.704c0 .845.24 1.671.692 2.374l1.108 1.723c1.011 1.574.239 3.713-1.52 4.21a25.794 25.794 0 0 1-14.06 0c-1.759-.497-2.531-2.636-1.52-4.21l1.108-1.723a4.393 4.393 0 0 0 .693-2.374V9c0-3.866 3.022-7 6.749-7s6.75 3.134 6.75 7"
              opacity="0.5"
            />
            <path
              fill="currentColor"
              d="M12.75 6a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0zM7.243 18.545a5.002 5.002 0 0 0 9.513 0c-3.145.59-6.367.59-9.513 0"
            />
          </SvgIcon>
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 1, maxWidth: 420 } }}
      >
        {renderHead}

        {renderTabs}

        {renderList}

        <Box sx={{ p: 1 }}>
          <Button fullWidth size="large">
            View all
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
