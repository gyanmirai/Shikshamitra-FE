import type { AcademicNotificationSource } from 'src/redux/academic-notifications/delivery-types';
import type { AcademicNotificationCacheIdentity, AcademicNotificationCatalogueQueryState } from 'src/redux/academic-notifications/types';

import { createPortal } from 'react-dom';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { RouterLink } from 'src/routes/components';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Alert, Button, Skeleton, Typography } from '@mui/material';
import { notificationRecordId } from 'src/redux/academic-notifications/delivery-adapters';
import { notificationEventKeyLabel } from 'src/redux/academic-notifications/response-adapters';
import { useAcademicNotificationOperationQuery } from 'src/redux/academic-notifications/delivery-api';

import { NotificationHistoryList } from './Components/notification-history-list';
import { NotificationDeliveryDetails } from './Components/notification-delivery-details';
import { NotificationPendingApprovals } from './Components/notification-pending-approvals';
import { NotificationRecentDeliveries } from './Components/notification-recent-deliveries';

const refresh = { refetchOnFocus: true, pollingInterval: 15000, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: true };

function historySource(params: URLSearchParams): AcademicNotificationSource | undefined {
  const eventKey = params.get('eventKey') ?? '';
  const sourceType = params.get('sourceType') ?? '';
  const sourceId = notificationRecordId(params.get('sourceId'));
  if (!sourceId || !/^Academic\.[\w.]{1,100}$/.test(eventKey) || !/^Academic\.[\w.]{1,100}$/.test(sourceType)) return undefined;
  return { eventKey, sourceType, sourceId };
}

export function NotificationHistoryWorkspace({ identity, canManage, catalogue, actionTarget }: {
  identity: AcademicNotificationCacheIdentity;
  canManage: boolean;
  catalogue: AcademicNotificationCatalogueQueryState;
  actionTarget: HTMLElement | null;
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
  const approvalHistory = pendingApprovals ||
    (canManage && !operation.isError && operation.currentData?.approvalRequired === true && !operation.currentData.isSynthetic);
  const showApprovalsLink = operationId ? approvalHistory : !source && !pendingApprovals;
  const listIcon = showApprovalsLink ? GlobalIcons.approveDecision : GlobalIcons.history;
  const navigationIcon = operationId || source ? GlobalIcons.back : listIcon;
  const navigation = actionTarget && (operationId || source || canManage) && createPortal(
    <Box sx={{ p: 1 }}>
      <Button
        size="small"
        color="inherit"
        variant="outlined"
        component={RouterLink}
        href={showApprovalsLink ? approvalsPath : recentPath}
        startIcon={<Iconify icon={navigationIcon} width={16} />}
      >
        {showApprovalsLink ? 'Pending Approvals' : 'Recent Deliveries'}
      </Button>
    </Box>,
    actionTarget
  );

  if (operationId) {
    return (
      <>
        {navigation}
        <NotificationDeliveryOperation
          key={operationId} operationId={operationId} query={operation} identity={identity} canManage={canManage}
        />
      </>
    );
  }
  return source ? (
    <>
      {navigation}
      <Typography component="h2" variant="subtitle1" sx={{ px: 1 }}>{notificationEventKeyLabel(source.eventKey)}</Typography>
      <NotificationHistoryList key={`${source.eventKey}/${source.sourceType}/${source.sourceId}/${historyOperationId ?? ''}`}
        identity={identity} source={source} operationId={historyOperationId} canManage={canManage} />
    </>
  ) : (
    <>
      {navigation}
      {pendingApprovals
        ? <NotificationPendingApprovals identity={identity} />
        : <NotificationRecentDeliveries identity={identity} catalogue={catalogue}
          eventKey={params.get('historyEvent') ?? undefined} cursor={params.get('historyCursor') ?? undefined} />}
    </>
  );
}

function NotificationDeliveryOperation({ operationId, query, identity, canManage }: {
  operationId: string;
  query: ReturnType<typeof useAcademicNotificationOperationQuery>;
  identity: AcademicNotificationCacheIdentity;
  canManage: boolean;
}) {
  const operation = query.currentData;
  if (query.isError || (operation && !Array.isArray(operation.deliveries))) return (
    <Alert severity="error" action={<Button size="small" onClick={query.refetch}>Retry</Button>}>
      This delivery operation could not be loaded. Check that you still have access to its Academic record.
    </Alert>
  );
  if (!operation) {
    return <Skeleton role="status" aria-label="Loading delivery status" variant="rounded" height={80} />;
  }
  const canManageOperation = canManage && !operation.isSynthetic;
  const reviewing = canManageOperation && operation.canReviewApproval === true;
  return (
    <>
      <Box sx={reviewing ? { flex: 1, minHeight: 0, overflowY: 'auto' } : { flexShrink: 0 }}>
        <NotificationDeliveryDetails operation={operation} identity={identity} canManage={canManageOperation} />
      </Box>
      {!reviewing && (
        <NotificationHistoryList identity={identity} source={operation}
          operationId={operationId} canManage={canManageOperation} />
      )}
    </>
  );
}
