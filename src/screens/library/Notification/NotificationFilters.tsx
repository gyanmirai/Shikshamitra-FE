import type { LibraryNotificationSettings } from 'src/redux/library/library-adapters';

import { Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import { notificationGroups, notificationStatuses } from './notification-display';

export function NotificationFilters({
  values,
  settings,
  onChange,
}: {
  values: { tab: string; eventType: string; channel: string; status: string };
  settings?: LibraryNotificationSettings;
  onChange: (values: Record<string, string | number>) => void;
}) {
  const events =
    settings?.events.filter(
      (event) =>
        !values.tab ||
        event.eventGroup ===
          notificationGroups.find((group) => group.value === values.tab)?.eventGroup
    ) || [];
  const filters = [
    {
      name: 'tab',
      label: 'Event group',
      options: [{ value: '', label: 'All groups' }, ...notificationGroups],
    },
    {
      name: 'eventType',
      label: 'Event',
      options: [
        { value: '', label: 'All events' },
        ...events.map((event) => ({ value: event.eventType, label: event.eventName })),
      ],
    },
    {
      name: 'channel',
      label: 'Channel',
      options: [
        { value: '', label: 'All channels' },
        ...(settings?.channels.map((channel) => ({
          value: channel.channel,
          label: channel.label,
        })) || []),
      ],
    },
    {
      name: 'status',
      label: 'Delivery status',
      options: [
        { value: '', label: 'All statuses' },
        ...notificationStatuses.map((status) => ({ value: status, label: status })),
      ],
    },
  ] as const;
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ px: 1, py: 1 }}>
      {filters.map(({ name, label, options }) => (
        <CustomSelect
          key={name}
          label={label}
          size="small"
          fullWidth
          options={
            values[name] && !options.some((option) => option.value === values[name])
              ? [
                  ...options,
                  {
                    value: values[name],
                    label: `Selected ${label.toLowerCase()}: ${values[name]}`,
                  },
                ]
              : [...options]
          }
          value={values[name]}
          onChange={(value) =>
            onChange({
              [name]: String(value),
              page: 1,
              ...(name === 'tab' ? { eventType: '' } : {}),
            })
          }
        />
      ))}
    </Stack>
  );
}
