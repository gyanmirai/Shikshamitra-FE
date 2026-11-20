'use client';

import type { RootState } from 'src/redux/store';
import type { LibraryNotificationSetting } from 'src/redux/library/library-adapters';

import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Alert, Stack, Button, LinearProgress } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  useGetLibraryNotificationSettingsQuery,
  useUpdateLibraryNotificationSettingsMutation,
} from 'src/redux/library/notifications-api';

import { NotificationSettingsTable } from '../NotificationSettingsTable';
import { NotificationTemplateDialog } from '../NotificationTemplateDialog';

export default function LibraryNotificationGroupPanel({
  group,
  onBusyChange,
}: {
  group: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(permissions, 'Library.Notification.View');
  const query = useGetLibraryNotificationSettingsQuery(undefined, { skip: !canView });
  const canManage =
    canView &&
    hasGrantedPermission(permissions, 'Library.Notification.Add') &&
    query.currentData?.canManageSettings === true;
  const [selected, setSelected] = useState<LibraryNotificationSetting | null>(null);
  const [save, result] = useUpdateLibraryNotificationSettingsMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  useEffect(() => {
    onBusyChange?.(result.isLoading);
    return () => onBusyChange?.(false);
  }, [onBusyChange, result.isLoading]);
  useUnsavedNavigation(false, { blockNavigation: result.isLoading, guardContextChanges: true });
  const toggle = async (setting: LibraryNotificationSetting, isActive: boolean) => {
    if (!canManage || inFlight.current) return;
    inFlight.current = true;
    setError('');
    try {
      await save({ items: [{ id: setting.id, isActive }] }).unwrap();
      shikshaMitraToast.success({ message: 'Notification setting updated.' });
    } catch (cause) {
      setError(
        parseApiProblemDetail(cause).detail || 'Could not update this notification setting.'
      );
    } finally {
      inFlight.current = false;
    }
  };
  return (
    <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
      {result.isLoading && <LinearProgress aria-label="Updating notification setting" />}
      {!canView && <Alert severity="info">Notification view permission is required.</Alert>}
      {query.isFetching && <LinearProgress aria-label="Loading notification templates" />}
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Could not load notification templates.
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {query.currentData && (
        <NotificationSettingsTable
          items={query.currentData.items.filter((item) => !group || item.eventGroup === group)}
          canManage={canManage}
          busy={result.isLoading}
          onToggle={toggle}
          onOpen={setSelected}
        />
      )}
      {selected && (
        <NotificationTemplateDialog
          key={selected.id}
          setting={selected}
          canEdit={canManage}
          onClose={() => setSelected(null)}
        />
      )}
    </Stack>
  );
}
