import type { AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';
import type { AcademicNotificationSource, AcademicNotificationHistoryItem } from 'src/redux/academic-notifications/delivery-types';

import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Box, Alert, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { AcademicDispatchStatus } from 'src/redux/academic-notifications/delivery-types';
import { dispatchStatusLabels } from 'src/redux/academic-notifications/delivery-adapters';
import { notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';
import { useAcademicNotificationHistoryQuery, useRetryAcademicNotificationDispatchMutation } from 'src/redux/academic-notifications/delivery-api';

import { NotificationFilterRow } from './notification-filter-row';
import { NotificationHistoryTable } from './notification-history-table';

const options = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(dispatchStatusLabels).map(([value, label]) => ({ value, label })),
];
const refresh = { refetchOnFocus: true, pollingInterval: 15000, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: true };

export function NotificationHistoryList({ identity, source, operationId, canManage }: {
  identity: AcademicNotificationCacheIdentity;
  source: AcademicNotificationSource;
  operationId?: string;
  canManage: boolean;
}) {
  const retryLock = useRef(false);
  const [paging, setPaging] = useState({ index: 0, size: 10 });
  const [status, setStatus] = useState('all');
  const [selection, setSelection] = useState<AcademicNotificationHistoryItem | null>(null);
  const [feedback, setFeedback] = useState<{ severity: 'info' | 'error'; message: string }>();
  const [retry, retryResult] = useRetryAcademicNotificationDispatchMutation();
  const { eventKey, sourceType, sourceId } = source;
  const query = useAcademicNotificationHistoryQuery({
    ...identity, eventKey, sourceType, sourceId, operationId,
    state: status === 'all' ? undefined : Number(status),
    skipCount: paging.index * paging.size, maxResultCount: paging.size,
  }, refresh);
  const result = query.isError ? undefined : query.currentData;
  const channel = selection?.channel == null ? 'Delivery' : notificationChannelLabels[selection.channel];

  async function queueRetry() {
    if (!canManage || !selection?.dispatchId || !selection.attemptId || retryLock.current) return;
    retryLock.current = true;
    setFeedback(undefined);
    try {
      const response = await retry({ ...identity, dispatchId: selection.dispatchId, attemptId: selection.attemptId }).unwrap();
      const scheduled = fDateTime(response.nextAttemptAt);
      setFeedback({ severity: 'info', message: response.status === AcademicDispatchStatus.Pending
        ? `${channel} retry queued.${scheduled ? ` Next attempt at ${scheduled}.` : ''}`
        : 'The delivery status has changed. Check the latest attempt in history.' });
    } catch (error) {
      const code = (error as { status?: number } | null)?.status;
      setFeedback({ severity: 'error', message: code === 409
        ? 'This attempt now needs review. Check the latest delivery status before sending again.'
        : 'The retry could not be confirmed. Check the latest delivery status before trying again.' });
    } finally {
      retryLock.current = false;
      setSelection(null);
    }
  }

  function changeStatus(value: string) {
    setStatus(value);
    setPaging((current) => ({ ...current, index: 0 }));
  }

  return (
    <>
      <NotificationFilterRow>
        <CustomSelect label="Delivery status" size="small" value={status} options={options}
          onChange={(value) => changeStatus(String(value))} />
      </NotificationFilterRow>
      {feedback && <Alert severity={feedback.severity} sx={{ mx: 1, mb: 1 }} onClose={() => setFeedback(undefined)}>
        {feedback.message}
      </Alert>}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <NotificationHistoryTable items={result?.items ?? []} total={result?.totalCount ?? 0}
          page={paging.index} pageSize={paging.size} loading={!result && query.isFetching}
          refreshing={Boolean(result && query.isFetching)} error={query.error} status={status} onStatusChange={(value) => changeStatus(value)}
          onDeliveryRetry={canManage ? setSelection : undefined} retryBusy={retryResult.isLoading}
          onRetry={query.refetch} onPage={(page, size) => setPaging({ index: page - 1, size })} />
      </Box>
      {canManage && selection && (
        <ConfirmDialog open title="Retry Delivery"
          content={`Queue another ${channel} attempt for this recipient? The previous attempt stays in history.`}
          icon={<Iconify icon="mdi:information-outline" />}
          disableCancel={retryResult.isLoading} disableBackdropClick disableEscapeKeyDown={retryResult.isLoading}
          onClose={() => { if (!retryLock.current) setSelection(null); }}
          action={<Button variant="contained" loading={retryResult.isLoading} onClick={() => queueRetry()}
            startIcon={<Iconify icon="mdi:refresh" />}>Queue retry</Button>} />
      )}
    </>
  );
}
