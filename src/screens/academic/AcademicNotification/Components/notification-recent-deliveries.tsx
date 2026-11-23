import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AcademicNotificationRecentDelivery } from 'src/redux/academic-notifications/delivery-types';
import type { AcademicNotificationEvent, AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';

import { useRouter } from 'next/navigation';
import { fDateTime } from 'src/utils/format-time';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { Stack, Button, Typography } from '@mui/material';
import { academicPaths } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { notificationEventKeyLabel } from 'src/redux/academic-notifications/response-adapters';
import { useAcademicNotificationRecentDeliveriesQuery } from 'src/redux/academic-notifications/delivery-api';


function deliveryPath(item: AcademicNotificationRecentDelivery) {
  const query = new URLSearchParams({ view: 'history' });
  if (item.canViewSummary) query.set('operation', item.operationId);
  else {
    query.set('eventKey', item.eventKey);
    query.set('sourceType', item.sourceType);
    query.set('sourceId', item.sourceId);
    query.set('deliveryOperation', item.operationId);
  }
  return `${academicPaths.notification}?${query}`;
}

function recentPath(eventKey?: string, cursor?: string) {
  const query = new URLSearchParams({ view: 'history' });
  if (eventKey) query.set('historyEvent', eventKey);
  if (cursor) query.set('historyCursor', cursor);
  return `${academicPaths.notification}?${query}`;
}

export function NotificationRecentDeliveries({ identity, events, eventKey, cursor }: {
  identity: AcademicNotificationCacheIdentity;
  events: AcademicNotificationEvent[];
  eventKey?: string;
  cursor?: string;
}) {
  const router = useRouter();
  const eventOptions = events.filter((event) => event.availability.isAvailable || event.manualAvailability?.isAvailable)
    .map(({ definition }) => ({ value: definition.eventKey, label: notificationEventKeyLabel(definition.eventKey) }))
    .sort((first, second) => first.label.localeCompare(second.label));
  const selectedEvent = eventKey && /^Academic\.[\w.]{1,150}$/.test(eventKey) ? eventKey : undefined;
  if (selectedEvent && !eventOptions.some((item) => item.value === selectedEvent)) {
    eventOptions.unshift({ value: selectedEvent, label: notificationEventKeyLabel(selectedEvent) });
  }
  const query = useAcademicNotificationRecentDeliveriesQuery({ ...identity, eventKey: selectedEvent, cursor }, {
    refetchOnFocus: true, refetchOnMountOrArgChange: true,
  });
  const current = query.isError ? undefined : query.currentData;
  const next = current?.nextCursor;
  const selectedOption = eventOptions.find(({ value }) => value === selectedEvent);
  const filters: IParams['filters'] = selectedOption ? [{
    column: 'notification', type: 'equals', value: selectedOption.value, valueType: 'enum',
    label: 'Notification', displayValue: selectedOption.label,
  }] : [];
  const columns: IColumn[] = [
    { id: 'notification', label: 'Notification', rowHeader: true, minWidth: 160, isSort: false,
      isFilter: eventOptions.length > 0, filterType: 'enum', enumOptions: eventOptions, render: (value) => value,
    },
    { id: 'createdAt', label: 'Created', minWidth: 160, isSort: false, isFilter: false },
  ];

  function setEvent(event?: string) {
    router.push(recentPath(event));
  }

  return (
    <Stack gap={1} sx={{ p: 1, flex: 1, minHeight: 0 }}>
      <Typography variant="subtitle2" component="h2">Recent Deliveries</Typography>
      {eventOptions.length > 0 && (
        <CustomSelect label="Notification event" size="small" isSearch value={selectedEvent ?? 'all'}
          options={[{ value: 'all', label: 'All events' }, ...eventOptions]}
          onChange={(value) => setEvent(value === 'all' ? undefined : String(value))}
          sx={{ width: { xs: 1, sm: 320 } }} />
      )}
      <CustomizableTable tableId="academic-notification-recent-deliveries" tableTitle="Recent Academic notifications"
        columns={columns} data={(current?.items ?? []).map((item) => ({
          id: item.operationId,
          notification: (
            <Button size="small" component={RouterLink} href={deliveryPath(item)}>
              {notificationEventKeyLabel(item.eventKey)}
            </Button>
          ),
          createdAt: fDateTime(item.createdAt, 'DD MMM YYYY h:mm:ss a') ?? '—',
        }))}
        isPagination={false} isSearch={false} showColumns showFullScreen showExport={false}
        filters={filters} onServerFilter={(criteria) => setEvent(criteria.at(-1)?.value)}
        isLoading={!current && query.isFetching} isRefreshing={Boolean(current) && query.isFetching}
        error={query.error} onRetry={query.refetch}
        noDataText={cursor ? 'No deliveries found on this page.' : 'No deliveries to show.'}
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }} tableContainerProps={{ sx: { height: 1, minHeight: 0 } }} />
      {(cursor || next) && (
        <Stack direction="row" gap={1} justifyContent="flex-end">
          {cursor && <Button size="small" component={RouterLink} href={recentPath(selectedEvent)}>Newest</Button>}
          {next && (
            <Button size="small" component={RouterLink}
              href={recentPath(selectedEvent, next)}>Older deliveries</Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
