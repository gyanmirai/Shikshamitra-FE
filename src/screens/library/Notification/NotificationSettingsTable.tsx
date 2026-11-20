import type { IColumn } from 'src/components/customizabaleTable/types';
import type { LibraryNotificationSetting } from 'src/redux/library/library-adapters';

import { Switch } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { NotificationStatus } from './notification-display';

export function NotificationSettingsTable({
  items,
  canManage,
  busy,
  onToggle,
  onOpen,
}: {
  items: LibraryNotificationSetting[];
  canManage: boolean;
  busy: boolean;
  onToggle: (setting: LibraryNotificationSetting, active: boolean) => void;
  onOpen: (setting: LibraryNotificationSetting) => void;
}) {
  const columns: IColumn[] = [
    { id: 'eventName', label: 'Event', rowHeader: true },
    { id: 'recipientRole', label: 'Audience' },
    { id: 'channel', label: 'Channel' },
    {
      id: 'isComingSoon',
      label: 'Availability',
      render: (_, row) =>
        row.isComingSoon ? 'Coming soon' : row.isChannelAvailable ? 'Available' : 'Unavailable',
    },
    {
      id: 'lastStatus',
      label: 'Latest delivery',
      render: (value) => <NotificationStatus status={value} />,
    },
    {
      id: 'isActive',
      label: 'Active',
      render: (_, row) => (
        <Switch
          size="small"
          checked={row.isActive}
          slotProps={{ input: { 'aria-label': `Enable ${row.eventName} by ${row.channel}` } }}
          disabled={busy || !canManage || !row.isChannelAvailable || row.isComingSoon}
          onChange={(_event, checked) => onToggle(row as LibraryNotificationSetting, checked)}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sticky: true,
      stickyPosition: 'right',
      render: (_, row) => {
        const editable = canManage && row.isChannelAvailable && !row.isComingSoon;
        return (
          <AdaptiveThreeDotsActions
            directActionLimit={2}
            actions={[
              {
                id: 'template',
                icon: editable ? GlobalIcons.edit : GlobalIcons.eye,
                label: `${editable ? 'Edit' : 'View'} ${row.eventName} template by ${row.channel}`,
                disabled: busy,
                onClick: () => onOpen(row as LibraryNotificationSetting),
              },
            ]}
          />
        );
      },
    },
  ];
  return (
    <CustomizableTable
      tableId="library-notification-settings"
      data={items}
      columns={columns.map((column) => ({ ...column, isSort: false, isFilter: false }))}
      isPagination={false}
      isSearch={false}
      isFilter={false}
      showExport={false}
      noDataText="No notification templates in this group."
    />
  );
}
