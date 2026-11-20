import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  LibraryNotificationHistory,
  LibraryNotificationSettings,
} from 'src/redux/library/library-adapters';

import { fDateTime } from 'src/utils/format-time';

import { NotificationStatus, notificationStatuses } from './notification-display';
import { type DeliveryActions, NotificationDeliveryActions } from './NotificationDeliveryActions';

export function notificationHistoryColumns(
  settings: LibraryNotificationSettings | undefined,
  actions: DeliveryActions
): IColumn[] {
  const columns: IColumn[] = [
    { id: 'subject', label: 'Subject', rowHeader: true },
    {
      id: 'eventType',
      label: 'Event',
      filterType: 'enum',
      enumOptions:
        settings?.events.map((event) => ({ label: event.eventName, value: event.eventType })) || [],
      render: (_, row) => row.eventName,
    },
    { id: 'recipientName', label: 'Recipient' },
    { id: 'recipientRelationship', label: 'Relationship', defaultHidden: true },
    {
      id: 'channel',
      label: 'Channel',
      filterType: 'enum',
      enumOptions:
        settings?.channels.map((channel) => ({ label: channel.label, value: channel.channel })) ||
        [],
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum',
      enumOptions: notificationStatuses.map((value) => ({ value, label: value })),
      render: (value) => <NotificationStatus status={value} />,
    },
    { id: 'attemptCount', label: 'Attempts', cellSx: { textAlign: 'right' } },
    { id: 'creationTime', label: 'Created', render: (value) => fDateTime(value) },
    { id: 'sentAt', label: 'Sent', render: (value) => fDateTime(value) || 'Not sent' },
    {
      id: 'nextAttemptAt',
      label: 'Next attempt',
      render: (value) => fDateTime(value) || 'Not scheduled',
      defaultHidden: true,
    },
    {
      id: 'readAt',
      label: 'Read',
      render: (value) => fDateTime(value) || 'Not recorded',
      defaultHidden: true,
    },
    {
      id: 'actions',
      label: 'Actions',
      sticky: true,
      stickyPosition: 'right',
      render: (_, row) => (
        <NotificationDeliveryActions item={row as LibraryNotificationHistory} {...actions} />
      ),
    },
  ];
  return columns.map((column) => ({
    ...column,
    isSort: false,
    isFilter: column.filterType === 'enum' && Boolean(column.enumOptions?.length),
    filterOperators: ['equals'],
  }));
}
