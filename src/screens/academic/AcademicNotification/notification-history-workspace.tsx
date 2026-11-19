import type { AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';
import type { AcademicNotificationSource } from 'src/redux/academic-notifications/delivery-types';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CustomSelect from 'src/components/custom-select';
import { Box, Alert, Button, Skeleton, Typography } from '@mui/material';
import { notificationEventKeyLabel } from 'src/redux/academic-notifications/response-adapters';
import { useAcademicNotificationHistoryQuery, useAcademicNotificationOperationQuery } from 'src/redux/academic-notifications/delivery-api';

import { NotificationHistoryTable } from './Components/notification-history-table';
import { NotificationDeliveryDetails } from './Components/notification-delivery-details';
import { historyOperationId, dispatchStatusLabels } from './notification-delivery-labels';

const options = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(dispatchStatusLabels).map(([value, label]) => ({ value, label })),
];
const refresh = { refetchOnFocus: true, pollingInterval: 15000, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: true };

function historySource(params: URLSearchParams): AcademicNotificationSource | undefined {
  const eventKey = params.get('eventKey') ?? '';
  const sourceType = params.get('sourceType') ?? '';
  const sourceId = historyOperationId(params.get('sourceId'));
  if (!sourceId || !/^Academic\.[\w.]{1,100}$/.test(eventKey) || !/^Academic\.[\w.]{1,100}$/.test(sourceType)) return undefined;
  return { eventKey, sourceType, sourceId };
}

export function NotificationHistoryWorkspace({ identity, canManage }: {
  identity: AcademicNotificationCacheIdentity;
  canManage: boolean;
}) {
  const params = useSearchParams();
  const operationId = historyOperationId(params.get('operation'));
  const source = historySource(params);
  const operation = useAcademicNotificationOperationQuery({
    ...identity, operationId: operationId ?? '',
  }, { ...refresh, skip: !operationId });
  if (operationId) {
    if (operation.isError) return (
      <Alert severity="error" sx={{ m: 1 }}
        action={<Button size="small" onClick={operation.refetch}>Retry</Button>}>
        This delivery operation could not be loaded. Check that you still have access to its Academic record.
      </Alert>
    );
    if (!operation.currentData) return <Skeleton variant="rounded" height={80} sx={{ m: 1 }} aria-label="Loading delivery status" />;
    return (
      <>
        <NotificationDeliveryDetails key={`summary-${operationId}`}
          operation={operation.currentData} identity={identity} canManage={canManage} />
        <NotificationHistoryList key={`attempts-${operationId}`}
          identity={identity} source={operation.currentData} operationId={operationId} />
      </>
    );
  }
  return source ? (
    <>
      <Typography variant="subtitle2" sx={{ p: 1 }}>{notificationEventKeyLabel(source.eventKey)}</Typography>
      <NotificationHistoryList key={`${source.eventKey}/${source.sourceType}/${source.sourceId}`} identity={identity} source={source} />
    </>
  ) : <Alert severity="info" sx={{ m: 1 }}>Open delivery history from an Academic record or a notification send confirmation.</Alert>;
}

function NotificationHistoryList({ identity, source, operationId }: {
  identity: AcademicNotificationCacheIdentity;
  source: AcademicNotificationSource;
  operationId?: string;
}) {
  const [paging, setPaging] = useState({ index: 0, size: 10 });
  const [status, setStatus] = useState('all');
  const { eventKey, sourceType, sourceId } = source;
  const query = useAcademicNotificationHistoryQuery({
    ...identity, eventKey, sourceType, sourceId, operationId,
    state: status === 'all' ? undefined : Number(status),
    skipCount: paging.index * paging.size, maxResultCount: paging.size,
  }, refresh);
  const result = query.isError ? undefined : query.currentData;

  return (
    <>
      <Box sx={{ p: 1 }}>
        <CustomSelect label="Delivery status" size="small" value={status} options={options} sx={{ minWidth: 200 }}
          onChange={(value) => {
            setStatus(String(value));
            setPaging({ index: 0, size: paging.size });
          }} />
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <NotificationHistoryTable items={result?.items ?? []} total={result?.totalCount ?? 0}
          page={paging.index} pageSize={paging.size} loading={!result && query.isFetching}
          refreshing={Boolean(result && query.isFetching)} error={query.error} filtered={status !== 'all'}
          onRetry={query.refetch} onPage={(page, size) => setPaging({ index: page - 1, size })} />
      </Box>
    </>
  );
}
