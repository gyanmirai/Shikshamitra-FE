import type { AcademicNotificationEvent, AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';
import type { AcademicNotificationSource, AcademicNotificationHistoryItem } from 'src/redux/academic-notifications/delivery-types';

import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useSearchParams } from 'next/navigation';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { academicPaths } from 'src/constants/academic-menu';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Alert, Button, Skeleton, Typography } from '@mui/material';
import { AcademicDispatchStatus } from 'src/redux/academic-notifications/delivery-types';
import { notificationRecordId, dispatchStatusLabels } from 'src/redux/academic-notifications/delivery-adapters';
import { notificationEventKeyLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';
import {
  useAcademicNotificationHistoryQuery, useAcademicNotificationOperationQuery, useRetryAcademicNotificationDispatchMutation,
} from 'src/redux/academic-notifications/delivery-api';

import { NotificationFilterRow } from './Components/notification-filter-row';
import { NotificationHistoryTable } from './Components/notification-history-table';
import { NotificationDeliveryDetails } from './Components/notification-delivery-details';
import { NotificationPendingApprovals } from './Components/notification-pending-approvals';
import { NotificationRecentDeliveries } from './Components/notification-recent-deliveries';

const options = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(dispatchStatusLabels).map(([value, label]) => ({ value, label })),
];
const refresh = { refetchOnFocus: true, pollingInterval: 15000, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: true };

function historySource(params: URLSearchParams): AcademicNotificationSource | undefined {
  const eventKey = params.get('eventKey') ?? '';
  const sourceType = params.get('sourceType') ?? '';
  const sourceId = notificationRecordId(params.get('sourceId'));
  if (!sourceId || !/^Academic\.[\w.]{1,100}$/.test(eventKey) || !/^Academic\.[\w.]{1,100}$/.test(sourceType)) return undefined;
  return { eventKey, sourceType, sourceId };
}

export function NotificationHistoryWorkspace({ identity, canManage, events }: {
  identity: AcademicNotificationCacheIdentity;
  canManage: boolean;
  events: AcademicNotificationEvent[];
}) {
  const params = useSearchParams();
  const operationId = notificationRecordId(params.get('operation'));
  const source = historySource(params);
  const historyOperationId = notificationRecordId(params.get('deliveryOperation')) ?? undefined;
  const pendingApprovals = canManage && params.get('historyMode') === 'approvals';
  const recentPath = `${academicPaths.notification}?view=history`;
  const approvalsPath = `${recentPath}&historyMode=approvals`;
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
    const canManageOperation = canManage && !operation.currentData.isSynthetic;
    const approvalHistory = canManageOperation && operation.currentData.approvalRequired;
    const reviewing = canManageOperation && operation.currentData.canReviewApproval === true;
    return (
      <>
        <Button size="small" component={RouterLink} href={approvalHistory ? approvalsPath : recentPath}
          sx={{ alignSelf: 'flex-start', mx: 1 }}>{approvalHistory ? 'Pending Approvals' : 'Recent Deliveries'}</Button>
        <Box sx={reviewing ? { flex: 1, minHeight: 0, overflowY: 'auto' } : { flexShrink: 0 }}>
          <NotificationDeliveryDetails key={`summary-${operationId}`}
            operation={operation.currentData} identity={identity} canManage={canManageOperation} />
        </Box>
        {!reviewing && (
          <NotificationHistoryList key={`attempts-${operationId}`}
            identity={identity} source={operation.currentData} operationId={operationId} canManage={canManageOperation} />
        )}
      </>
    );
  }
  return source ? (
    <>
      <Button size="small" component={RouterLink} href={recentPath}
        sx={{ alignSelf: 'flex-start', mx: 1 }}>Recent Deliveries</Button>
      <Typography variant="subtitle2" sx={{ p: 1 }}>{notificationEventKeyLabel(source.eventKey)}</Typography>
      <NotificationHistoryList key={`${source.eventKey}/${source.sourceType}/${source.sourceId}/${historyOperationId ?? ''}`}
        identity={identity} source={source} operationId={historyOperationId} canManage={canManage} />
    </>
  ) : (
    <>
      {canManage && (
        <Button size="small" component={RouterLink} href={pendingApprovals ? recentPath : approvalsPath}
          sx={{ alignSelf: 'flex-start', mx: 1 }}>
          {pendingApprovals ? 'Recent Deliveries' : 'Pending Approvals'}
        </Button>
      )}
      {pendingApprovals
        ? <NotificationPendingApprovals identity={identity} />
        : <NotificationRecentDeliveries identity={identity} events={events}
          eventKey={params.get('historyEvent') ?? undefined} cursor={params.get('historyCursor') ?? undefined} />}
    </>
  );
}

function NotificationHistoryList({ identity, source, operationId, canManage }: {
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
