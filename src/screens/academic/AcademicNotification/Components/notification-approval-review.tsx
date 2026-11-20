import type { AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';

import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Alert, Stack, Button, Skeleton } from '@mui/material';
import { CommunicationCampaignStatus } from 'src/redux/communication/communicationTypes';
import { AcademicNotificationReviewDetails } from 'src/components/academic-notification-action/review-details';
import {
  useAcademicNotificationApprovalReviewQuery, useDecideAcademicNotificationApprovalMutation,
} from 'src/redux/academic-notifications/delivery-api';

const decisions = {
  approve: {
    label: 'Approve send',
    title: 'Approve Notification Send',
    content: 'Queue these reviewed notifications for the eligible recipients?',
    icon: GlobalIcons.approveDecision,
  },
  reject: {
    label: 'Reject send',
    title: 'Reject Notification Send',
    content: 'Reject this request? The sender will need to review and submit a new request to send these notifications.',
    icon: GlobalIcons.cancel,
  },
};
const changedRequest = 'This request has changed. Ask the sender to review and submit a new request.';

export function NotificationApprovalReview({ identity, operationId, active }: {
  identity: AcademicNotificationCacheIdentity;
  operationId: string;
  active: boolean;
}) {
  const [selection, setSelection] = useState<keyof typeof decisions | null>(null);
  const [feedback, setFeedback] = useState<{ severity: 'info' | 'error'; message: string }>();
  const lock = useRef(false);
  const review = useAcademicNotificationApprovalReviewQuery({ ...identity, operationId },
    { skip: !active, refetchOnMountOrArgChange: true });
  const [decide, decisionState] = useDecideAcademicNotificationApprovalMutation();
  const current = active && !review.isError ? review.currentData : undefined;
  const decision = selection ? decisions[selection] : null;
  const canSubmit = !!current && !review.isFetching && !decisionState.isLoading;
  const canApprove = current?.canApprove === true && feedback?.message !== changedRequest;

  async function confirmDecision() {
    if (!selection || !canSubmit || lock.current || (selection === 'approve' && !canApprove)) return;
    lock.current = true;
    setFeedback(undefined);
    try {
      const result = await decide({ ...identity, operationId, decision: selection }).unwrap();
      let message = 'Notification request rejected.';
      if (selection === 'approve') {
        message = result.status === CommunicationCampaignStatus.Queued
          ? 'Notification approved and queued.'
          : 'Notification send approved.';
      }
      setFeedback({ severity: 'info', message });
    } catch (error) {
      const response = error as { data?: { error?: { code?: string } } } | null;
      setFeedback({ severity: 'error', message: response?.data?.error?.code === 'Communication:Notification:ReviewChanged'
        ? changedRequest : 'The decision could not be confirmed. Check the current request status before trying again.' });
    } finally {
      lock.current = false;
      setSelection(null);
    }
  }

  return (
    <>
      {feedback && <Alert severity={feedback.severity}>{feedback.message}</Alert>}
      {active && !current && review.isFetching && <Skeleton variant="rounded" height={104} aria-label="Loading approval review" />}
      {active && review.isError && (
        <Alert severity="error" action={<Button size="small" onClick={review.refetch}>Retry</Button>}>
          The approval review could not be loaded. Check that you still have access to the request.
        </Alert>
      )}
      {current && (
        <>
          {canApprove ? <AcademicNotificationReviewDetails review={current} /> : (
            feedback?.message !== changedRequest && <Alert severity="warning">{changedRequest}</Alert>
          )}
          <Stack direction="row" gap={1} flexWrap="wrap">
            {canApprove && (
              <Button size="small" variant="contained" disabled={!canSubmit} onClick={() => setSelection('approve')}>Approve send</Button>
            )}
            <Button size="small" variant="outlined" color="error"
              disabled={!canSubmit} onClick={() => setSelection('reject')}>Reject send</Button>
          </Stack>
        </>
      )}
      {active && decision && (
        <ConfirmDialog open title={decision.title} content={decision.content}
          icon={selection === 'approve' ? 'info' : 'warning'}
          onClose={() => setSelection(null)} disableCancel={decisionState.isLoading}
          action={<Button variant="contained" color={selection === 'approve' ? 'primary' : 'error'}
            startIcon={<Iconify icon={decision.icon} />} loading={decisionState.isLoading}
            disabled={!canSubmit || (selection === 'approve' && !canApprove)}
            onClick={() => confirmDecision()}>{decision.label}</Button>} />
      )}
    </>
  );
}
