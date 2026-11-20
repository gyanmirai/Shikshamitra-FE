import { useState } from 'react';
import { Alert, Stack, Button, Skeleton } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  usePersonalNotificationPreferencesQuery,
  usePersonalNotificationPreferenceOptionsQuery,
} from 'src/redux/communication/notification-self-api';

import { NotificationPreferenceForm } from './notification-preference-form';

type Selection = { category: string; studentId: string | null };
type Props = { owner: string; onClose: () => void };

function categoryLabel(category: string) {
  const name = category.split('.').at(-1) ?? category;
  if (name === 'Student360') return 'Student Academic 360';
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function NotificationPreferences({ owner, onClose }: Props) {
  return <OwnedNotificationPreferences key={owner} owner={owner} onClose={onClose} />;
}

function OwnedNotificationPreferences({ owner, onClose }: Props) {
  const [selection, setSelection] = useState<Selection>();
  const options = usePersonalNotificationPreferenceOptionsQuery(owner, { refetchOnFocus: true });
  const preferences = usePersonalNotificationPreferencesQuery(owner);
  const data = options.currentData;
  const categories = data?.categories;
  const category = categories?.find((item) => item.category === selection?.category) ?? categories?.[0];
  const studentId = data?.students.find((item) => item.studentId === selection?.studentId)?.studentId ?? null;

  if (options.isError || preferences.isError || !data || !category || !preferences.currentData) {
    const failed = options.isError || preferences.isError;
    return (
      <CustomDialog open hasForm={false} guardUnsavedChanges={false}
        title="Notification Preferences" handleClose={onClose}>
        <DialogScrollContent>
          {failed ? (
            <Alert severity="error" action={<Button size="small" onClick={() => {
              options.refetch();
              preferences.refetch();
            }}>Retry</Button>}>
              Your notification preferences could not be loaded.
            </Alert>
          ) : categories && !categories.length ? (
            <Alert severity="info">No notification categories are available yet.</Alert>
          ) : (
            <Stack gap={1.5} role="status" aria-label="Loading notification preferences">
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={104} />
            </Stack>
          )}
        </DialogScrollContent>
      </CustomDialog>
    );
  }

  const current = { category: category.category, studentId };
  const matchesSelection = (item: Selection) => item.category === current.category && item.studentId === studentId;
  return (
    <NotificationPreferenceForm key={`${current.category}:${studentId ?? ''}`}
      owner={owner} selection={current} availableChannels={category.channels} options={data}
      categoryLabel={categoryLabel} onSelect={setSelection} onClose={onClose}
      saved={preferences.currentData.find(matchesSelection)}
      onReload={async () => (await preferences.refetch().unwrap()).find(matchesSelection)}
      onAccessChanged={() => { options.refetch(); }} />
  );
}
