'use client';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { libraryPaths } from 'src/constants/library-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Alert, Button, Typography, LinearProgress } from '@mui/material';
import { useGetLibraryNotificationSettingsQuery } from 'src/redux/library/notifications-api';

import { notificationGroups } from './notification-display';
import { useNotificationAccess } from './useNotificationAccess';
import { useNotificationLocation } from './useNotificationLocation';
import { NotificationSetupDialog } from './setup/NotificationSetupDialog';
import LibraryNotificationGroupPanel from './Components/LibraryNotificationGroupPanel';

export function NotificationSettingsScreen() {
  const access = useNotificationAccess();
  const location = useNotificationLocation();
  const query = useGetLibraryNotificationSettingsQuery(undefined, { skip: !access.canView });
  const [setupOpen, setSetupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const settings = query.currentData;
  const canManage = access.canAct && settings?.canManageSettings === true;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Notification Settings"
        description="Configure delivery routing, reminder timing and Library event templates."
        links={[
          { name: 'Library', href: libraryPaths.dashboard },
          { name: 'Notification', href: libraryPaths.notification },
          { name: 'Notification Settings' },
        ]}
        sx={{ px: 1 }}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              href={libraryPaths.notification}
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.history} />}
              disabled={busy}
            >
              Delivery history
            </Button>
            {canManage && (
              <Button
                size="small"
                variant="contained"
                color="inherit"
                onClick={() => setSetupOpen(true)}
                disabled={busy || !settings?.setup}
                startIcon={<Iconify icon={GlobalIcons.academicFieldSettings} />}
              >
                Configure delivery
              </Button>
            )}
          </Stack>
        }
      />
      {query.isFetching && <LinearProgress aria-label="Loading notification setup" />}
      {!access.canView && <Alert severity="info">Notification view permission is required.</Alert>}
      {settings && (
        <Stack spacing={1} sx={{ px: 1, py: 1 }}>
          {!canManage && (
            <Alert severity="info">
              Global configuration is read-only. An authorized operator with school-wide scope can
              update it.
            </Alert>
          )}
          {!settings.setup ? (
            <Alert severity="warning">
              Delivery setup is unavailable. Reload before configuring notifications.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Library timezone: {settings.setup.timeZoneId || 'Not configured'} · Automatic
                reminder time: {settings.setup.automaticReminderTimeLocal || 'Not configured'}
              </Typography>
              {settings.setup.needsConfiguration && (
                <Alert severity="warning">
                  Automatic reminders need configuration.{' '}
                  {settings.setup.configurationIssues.join(' ')}
                </Alert>
              )}
            </>
          )}
        </Stack>
      )}
      <Box sx={{ px: 1, py: 1 }}>
        <CustomSelect
          label="Event group"
          size="small"
          value={location.tab}
          fullWidth
          disabled={busy}
          options={[{ value: '', label: 'All groups' }, ...notificationGroups]}
          onChange={(value) => location.update({ tab: String(value) })}
        />
      </Box>
      <LibraryNotificationGroupPanel group={location.eventGroup || ''} onBusyChange={setBusy} />
      {setupOpen && settings?.setup && (
        <NotificationSetupDialog
          setup={settings.setup}
          canManage={canManage}
          onClose={() => setSetupOpen(false)}
        />
      )}
    </Box>
  );
}
