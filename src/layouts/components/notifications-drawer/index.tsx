'use client';

import type { RootState } from 'src/redux/store';

import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { Iconify } from 'src/components/iconify';
import { varHover } from 'src/components/animate';
import { useId, useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { webPushOwner } from 'src/hooks/notifications/web-push-device';
import EnableNotifications from 'src/components/notification-inbox/enable-notifications';
import { NotificationInbox } from 'src/components/notification-inbox/notification-inbox';
import { Box, Tab, Badge, Stack, Drawer, SvgIcon, IconButton, Typography } from '@mui/material';
import { usePersonalNotificationUnreadCountQuery } from 'src/redux/communication/notification-self-api';

type InboxTab = 'all' | 'unread';

export function NotificationsDrawer() {
  const { data, status } = useSession();
  const profile = (data as { profile?: { sub?: string; tenantid?: string } } | null)?.profile;
  const { user, sessionContext } = useSelector((state: RootState) => state.auth);
  const owner = status === 'authenticated' && sessionContext?.tenantId === profile?.tenantid && user?.sub === profile?.sub
    ? webPushOwner(profile?.tenantid, profile?.sub) : null;
  return owner ? <OwnedNotificationsDrawer key={owner} owner={owner} /> : null;
}

function OwnedNotificationsDrawer({ owner }: { owner: string }) {
  const descriptionId = useId();
  const drawerId = useId();
  const drawer = useBoolean();
  const openDrawer = drawer.onTrue;
  const [tab, setTab] = useState<InboxTab>('all');
  const unread = usePersonalNotificationUnreadCountQuery(owner, {
    refetchOnFocus: true, refetchOnMountOrArgChange: true, pollingInterval: 60000, skipPollingIfUnfocused: true,
  });
  const unreadCount = unread.isError ? undefined : unread.currentData?.unreadCount;
  const unreadDescription = unreadCount === undefined ? '' : `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('openNotifications') === '1') {
      openDrawer();
      url.searchParams.delete('openNotifications');
      window.history.replaceState(window.history.state, '', url);
    }
    if (!('serviceWorker' in navigator)) return undefined;
    const openFromWorker = (event: MessageEvent) => {
      if (typeof ServiceWorker !== 'undefined' && event.source instanceof ServiceWorker &&
        event.source.scriptURL === new URL('/notification-sw.js', window.location.origin).href &&
        event.data?.type === 'OPEN_SCHOOL_NOTIFICATIONS') openDrawer();
    };
    navigator.serviceWorker.addEventListener('message', openFromWorker);
    return () => navigator.serviceWorker.removeEventListener('message', openFromWorker);
  }, [openDrawer]);

  return (
    <>
      <span id={descriptionId} hidden>{unreadDescription}</span>
      <IconButton data-slot="notifications" aria-label="Open notifications" aria-describedby={descriptionId} aria-haspopup="dialog"
        component={motion.button} whileTap="tap" whileHover="hover" variants={varHover(1.05)}
        onClick={drawer.onTrue}>
        <Badge badgeContent={unreadCount} color="error" aria-hidden="true">
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

      <Drawer open={drawer.value} onClose={drawer.onFalse} anchor="right"
        slotProps={{ paper: { role: 'dialog', 'aria-modal': true, 'aria-labelledby': drawerId, sx: { width: 1, maxWidth: 420 } } }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ py: 1.5, pl: 2, pr: 1.5 }}>
          <Typography id={drawerId} variant="h6" sx={{ flexGrow: 1 }}>Notifications</Typography>
          <IconButton aria-label="Close notifications" onClick={drawer.onFalse}><Iconify icon="mingcute:close-line" /></IconButton>
        </Stack>
        {drawer.value && <EnableNotifications />}
        <CustomTabs variant="fullWidth" aria-label="Notification inbox filters" value={tab} guardUnsavedChanges={false}
          onChange={(_, value: InboxTab) => setTab(value)}>
          <Tab value="all" label="All" id={`${drawerId}-all`} aria-controls={`${drawerId}-inbox`} />
          <Tab value="unread" label={unreadCount ? `Unread (${unreadCount})` : 'Unread'}
            id={`${drawerId}-unread`} aria-controls={`${drawerId}-inbox`} />
        </CustomTabs>
        <Box id={`${drawerId}-inbox`} role="tabpanel" aria-labelledby={`${drawerId}-${tab}`}
          sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {drawer.value && <NotificationInbox key={tab} owner={owner} unreadOnly={tab === 'unread'} onOpen={drawer.onFalse} />}
        </Box>
      </Drawer>
    </>
  );
}
