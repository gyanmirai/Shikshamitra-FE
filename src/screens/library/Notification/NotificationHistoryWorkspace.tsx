'use client';

import type { NotificationSendResult } from 'src/redux/library/notification-types';
import type { LibraryNotificationHistory } from 'src/redux/library/library-adapters';

import { useState } from 'react';
import { Box, Alert, Button, Typography } from '@mui/material';
import {
  useGetLibraryNotificationHistoryQuery,
  useGetLibraryNotificationSettingsQuery,
} from 'src/redux/library/notifications-api';

import { notificationZone } from './notification-display';
import { NotificationFilters } from './NotificationFilters';
import { NotificationRunDialog } from './NotificationRunDialog';
import { useNotificationAccess } from './useNotificationAccess';
import { useNotificationLocation } from './useNotificationLocation';
import { NotificationRetryDialog } from './NotificationRetryDialog';
import { NotificationResultDialog } from './NotificationResultDialog';
import { NotificationHistoryTable } from './NotificationHistoryTable';
import { NotificationHistoryHeader } from './NotificationHistoryHeader';
import { NotificationDeliveryDetail } from './NotificationDeliveryDetail';
import { NotificationComposerDialog } from './composer/NotificationComposerDialog';

export function NotificationHistoryWorkspace({
  'data-testid': testId,
}: {
  'data-testid'?: string;
}) {
  const { canView, canAct } = useNotificationAccess();
  const location = useNotificationLocation();
  const settings = useGetLibraryNotificationSettingsQuery(undefined, { skip: !canView });
  const query = useGetLibraryNotificationHistoryQuery(
    {
      eventGroup: location.eventGroup,
      eventType: location.eventType || undefined,
      channel: location.channel || undefined,
      status: location.status || undefined,
      page: location.page,
      pageSize: location.pageSize,
    },
    {
      skip: !canView,
      refetchOnMountOrArgChange: true,
      pollingInterval: 15000,
      skipPollingIfUnfocused: true,
    }
  );
  const [detail, setDetail] = useState<LibraryNotificationHistory | null>(null);
  const [retry, setRetry] = useState<LibraryNotificationHistory | null>(null);
  const [command, setCommand] = useState<'compose' | 'run' | null>(null);
  const [result, setResult] = useState<NotificationSendResult | null>(null);
  const complete = (outcome: NotificationSendResult) => {
    setCommand(null);
    setResult(outcome);
  };
  const data = query.currentData;
  const visibleDetail = data?.items.find((item) => item.id === detail?.id);
  return (
    <Box
      data-testid={testId}
      sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      <NotificationHistoryHeader canAct={canAct} onCommand={setCommand} />
      {!canView && <Alert severity="info">Notification view permission is required.</Alert>}
      <NotificationFilters
        values={location}
        settings={settings.currentData}
        onChange={location.update}
      />
      <Typography variant="caption" color="text.secondary" sx={{ px: 1, pb: 1 }}>
        All authorized years · Times shown in {notificationZone()} · Delivery status refreshes while
        this page is active
      </Typography>
      {settings.isError && (
        <Alert
          severity="warning"
          action={
            <Button size="small" onClick={() => settings.refetch()}>
              Retry
            </Button>
          }
        >
          Event and channel options could not be loaded. Delivery history remains available.
        </Alert>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <NotificationHistoryTable
          items={data?.items || []}
          page={data ? location.page : 1}
          pageSize={location.pageSize}
          totalCount={data?.totalCount || 0}
          loading={canView && !data && query.isFetching}
          refreshing={Boolean(data && query.isFetching)}
          error={query.error}
          canRetry={canAct}
          settings={settings.currentData}
          criteria={location}
          onCriteria={(values) => location.update({ ...values, page: 1 })}
          onPage={(page, pageSize) => location.update({ page, pageSize })}
          onRetry={() => query.refetch()}
          onOpen={setDetail}
          onRetryDelivery={setRetry}
        />
      </Box>
      {visibleDetail && (
        <NotificationDeliveryDetail item={visibleDetail} onClose={() => setDetail(null)} />
      )}
      {retry && (
        <NotificationRetryDialog key={retry.id} item={retry} onClose={() => setRetry(null)} />
      )}
      {command === 'compose' && (
        <NotificationComposerDialog onClose={() => setCommand(null)} onComplete={complete} />
      )}
      {command === 'run' && (
        <NotificationRunDialog onClose={() => setCommand(null)} onComplete={complete} />
      )}
      {result && <NotificationResultDialog result={result} onClose={() => setResult(null)} />}
    </Box>
  );
}
