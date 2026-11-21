import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Alert, Stack, Button, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  useFinalizeStockCountMutation,
  useGetStockApprovalPreviewQuery,
} from 'src/redux/library/stock-verification-api';

import { useCommandAttempt } from '../circulation/useCommandAttempt';

export function StockApprovalDialog({
  id,
  onClose,
  onApproved,
  onViewFindings,
}: {
  id: string;
  onClose: () => void;
  onApproved: () => void;
  onViewFindings: () => void;
}) {
  const preview = useGetStockApprovalPreviewQuery(id, { refetchOnMountOrArgChange: true });
  const [finalize, save] = useFinalizeStockCountMutation();
  const attempt = useCommandAttempt<{ revision: string }>();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const review = preview.isError ? undefined : preview.currentData;
  const retry = review ? attempt.retry(review.revision) : undefined;
  const busy = preview.isFetching || save.isLoading;
  const guard = useUnsavedNavigation(Boolean(retry), {
    blockNavigation: busy,
    guardContextChanges: true,
    onNavigationApproved: onClose,
    onBeforeTraversal: onClose,
    description: retry
      ? 'The count may already be approved. You can retry here or check its saved status after closing.'
      : undefined,
  });

  const refresh = async () => {
    setError('');
    try {
      await preview.refetch().unwrap();
      attempt.reviewed();
    } catch (cause) {
      setError(
        parseApiProblemDetail(cause).detail || 'Could not load the updated approval preview.'
      );
    }
  };
  const approve = async () => {
    if (!review?.canFinalize || attempt.conflict || busy || inFlight.current) return;
    inFlight.current = true;
    setError('');
    try {
      await finalize({
        id,
        body: retry ?? attempt.prepare(review.revision, { revision: review.revision }),
      }).unwrap();
      onApproved();
    } catch (cause) {
      attempt.failed(review.revision, cause);
      if (!(cause && typeof cause === 'object' && 'status' in cause && cause.status === 409)) {
        setError(parseApiProblemDetail(cause).detail || 'Could not confirm approval.');
      }
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <>
      <ConfirmDialog
        open
        title="Approve Stock Count?"
        icon="info"
        cancelText="Close"
        onClose={() => guard.requestNavigation(() => undefined)}
        bodyBusy={busy}
        busyLabel={save.isLoading ? 'Saving the stock count result' : 'Checking the findings'}
        content={
          <Stack spacing={1.5}>
            <Typography variant="body2">
              Approval closes the count and saves its findings and decisions as the published
              result.
            </Typography>
            <Button
              size="small"
              sx={{ alignSelf: 'flex-start' }}
              onClick={onViewFindings}
              disabled={busy || Boolean(retry)}
            >
              View findings
            </Button>
            {review && (
              <Stack spacing={0.5}>
                <Typography variant="body2">{review.expectedCopyCount} expected copies</Typography>
                <Typography variant="body2">{review.observationCount} recorded scans</Typography>
                <Typography variant="body2">{review.findingCount} findings</Typography>
                <Typography variant="body2">{review.discrepancyCount} flagged findings</Typography>
                {review.missingDecisionCount > 0 && (
                  <Typography variant="body2">
                    {review.missingDecisionCount} missing decisions
                  </Typography>
                )}
                {review.staleDecisionCount > 0 && (
                  <Typography variant="body2">
                    {review.staleDecisionCount} decisions need another review
                  </Typography>
                )}
              </Stack>
            )}
            {attempt.conflict || preview.isError || (review && !review.canFinalize) ? (
              <Alert
                severity={preview.isError ? 'error' : 'warning'}
                action={
                  <Button size="small" onClick={refresh}>
                    Refresh preview
                  </Button>
                }
              >
                {preview.isError
                  ? 'Could not load the approval preview.'
                  : attempt.conflict
                    ? 'The evidence changed. Refresh the preview and review the current findings.'
                    : 'Record current decisions for the flagged findings in Reconciliation.'}
              </Alert>
            ) : null}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        }
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.prerequisites} />}
            onClick={approve}
            disabled={busy || attempt.conflict || !review?.canFinalize}
          >
            {retry ? 'Retry approval' : 'Approve count'}
          </Button>
        }
      />
      {guard.confirmation}
    </>
  );
}
