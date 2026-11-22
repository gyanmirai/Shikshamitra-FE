import type { AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';
import type { AcademicNotificationOperationStatus } from 'src/redux/academic-notifications/delivery-types';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { ExpandMore } from '@mui/icons-material';
import { fDateTime } from 'src/utils/format-time';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CommunicationCampaignStatus } from 'src/redux/communication/communicationTypes';
import { useCancelAcademicNotificationOperationMutation } from 'src/redux/academic-notifications/delivery-api';
import { Stack, Alert, Button, Accordion, Typography, AccordionDetails, AccordionSummary } from '@mui/material';
import { dispatchStatusLabels, operationStatusLabels } from 'src/redux/academic-notifications/delivery-adapters';
import { notificationEventKeyLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';

import { NotificationApprovalReview } from './notification-approval-review';

const cancellable = [
  CommunicationCampaignStatus.PendingApproval, CommunicationCampaignStatus.Scheduled,
  CommunicationCampaignStatus.Queued, CommunicationCampaignStatus.Sending,
];

export function NotificationDeliveryDetails({ operation, identity, canManage }: {
  operation: AcademicNotificationOperationStatus;
  identity: AcademicNotificationCacheIdentity;
  canManage: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  const [cancel, result] = useCancelAcademicNotificationOperationMutation();
  const { operationId } = operation;
  const canReview = canManage && operation.canReviewApproval === true;
  const canCancel = canManage && !canReview && cancellable.includes(operation.status);

  async function cancelPending() {
    if (result.isLoading) return;
    await cancel({ ...identity, operationId });
    setConfirm(false);
  }

  return (
    <Stack gap={1} sx={{ p: 1 }}>
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <Typography variant="subtitle2">{notificationEventKeyLabel(operation.eventKey)}</Typography>
        {operation.isSynthetic && <Label color="info">Template test</Label>}
        <Label>{operation.approvalRejected ? 'Rejected' : (operationStatusLabels[operation.status] ?? 'Status unavailable')}</Label>
        <Typography variant="caption" color="text.secondary">{fDateTime(operation.createdAt)}</Typography>
        {canCancel && (
          <Button size="small" color="error" disabled={result.isLoading} onClick={() => setConfirm(true)}>
            Cancel pending deliveries
          </Button>
        )}
      </Stack>
      {result.isError && <Alert severity="error">Pending deliveries could not be cancelled. Refresh the status and try again.</Alert>}
      {result.data && (
        <Alert severity="info">
          Cancelled {result.data.cancelledDispatches} pending deliveries and {result.data.cancelledIntents} pending jobs.
          {result.data.remainingInFlight > 0 && ` Work still in progress ${result.data.remainingInFlight}.`}
        </Alert>
      )}
      <NotificationApprovalReview identity={identity} operationId={operationId} active={canReview} />
      {!canReview && (
        <Accordion disableGutters elevation={0} variant="outlined">
          <AccordionSummary expandIcon={<ExpandMore />}>Delivery totals</AccordionSummary>
          <AccordionDetails sx={{ maxHeight: 180, overflowY: 'auto' }}>
            <Stack gap={0.5}>
              {operation.deliveries.map((entry) => (
                <Typography key={`${entry.channel}/${entry.status}`} variant="body2">
                  {notificationChannelLabels[entry.channel]} · {dispatchStatusLabels[entry.status]} · {entry.count}
                </Typography>
              ))}
              <Typography variant="body2">Excluded before sending · {operation.excludedBeforeDispatch}</Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
      {confirm && (
        <ConfirmDialog open title="Cancel pending deliveries"
          content="Cancel work that has not started for this notification. In-progress deliveries may still finish."
          disableCancel={result.isLoading} disableBackdropClick={result.isLoading} disableEscapeKeyDown={result.isLoading}
          onClose={() => { if (!result.isLoading) setConfirm(false); }}
          action={<Button color="error" variant="contained" loading={result.isLoading}
            onClick={() => cancelPending()}>Cancel pending deliveries</Button>} />
      )}
    </Stack>
  );
}
