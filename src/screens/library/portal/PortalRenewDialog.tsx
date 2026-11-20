import type {
  PortalLoan,
  PortalRenewPreview,
  PortalRenewCommand,
} from 'src/redux/library/library-portal-api';

import { useRef, useState } from 'react';
import { formatDateOnly } from 'src/utils/date-only';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useRenewPortalLoanMutation,
  useLazyPortalLibraryRenewPreviewQuery,
} from 'src/redux/library/library-portal-api';

import { useCommandAttempt } from '../circulation/useCommandAttempt';

const renewalReviewCodes = new Set([
  'Library:Circulation:010082',
  'Library:Circulation:010085',
  'Library:Circulation:010088',
]);

export default function PortalRenewDialog({
  studentId,
  loan,
  onClose,
}: {
  studentId: string;
  loan: PortalLoan;
  onClose: () => void;
}) {
  const [plan, setPlan] = useState<PortalRenewPreview>();
  const [recorded, setRecorded] = useState<PortalLoan>();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const identity = { studentId, loanId: loan.id };
  const [preview, reviewing] = useLazyPortalLibraryRenewPreviewQuery();
  const [renew, saving] = useRenewPortalLoanMutation();
  const attempt = useCommandAttempt<Omit<PortalRenewCommand, 'idempotencyKey'>>();
  const retry = attempt.retry(loan.id);
  const busy = reviewing.isFetching || saving.isLoading;
  const review = async () => {
    if (inFlight.current || retry) return;
    inFlight.current = true;
    setPlan(undefined);
    setError('');
    try {
      setPlan(await preview(identity).unwrap());
      attempt.reviewed();
    } catch (problem) {
      setError(parseApiProblemDetail(problem).detail || 'Could not review the renewal.');
    } finally {
      inFlight.current = false;
    }
  };
  const save = async () => {
    if (
      inFlight.current ||
      recorded ||
      (!retry && (!plan?.canRenew || !plan.schoolDate || !plan.revision))
    )
      return;
    const body =
      retry ||
      attempt.prepare(loan.id, { schoolDate: plan!.schoolDate!, revision: plan!.revision! });
    inFlight.current = true;
    setError('');
    try {
      setRecorded(await renew({ ...identity, body }).unwrap());
    } catch (problem) {
      const detail = parseApiProblemDetail(problem);
      const stale = Boolean(detail.errorCode && renewalReviewCodes.has(detail.errorCode));
      attempt.failed(loan.id, stale ? { status: 409 } : problem);
      if (stale) setPlan(undefined);
      setError(
        stale
          ? 'This loan or its terms changed. Review the due date again.'
          : detail.detail || 'Could not confirm the renewal. Retry the same request when prompted.'
      );
    } finally {
      inFlight.current = false;
    }
  };
  return (
    <CustomDialog
      open
      hasForm={false}
      title="Renew loan"
      maxWidth="sm"
      handleClose={onClose}
      disableClose={busy}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Typography variant="subtitle1">{loan.title ?? loan.accession}</Typography>
          <Typography variant="body2">
            Current due date {loan.dueOn ? formatDateOnly(loan.dueOn) : 'unconfirmed'}
          </Typography>
          {recorded ? (
            <Alert severity="success">
              Renewed. The recorded due date is {formatDateOnly(recorded.dueOn)}.
            </Alert>
          ) : (
            plan && (
              <Alert severity={plan.canRenew ? 'info' : 'warning'}>
                {plan.canRenew
                  ? `New due date ${formatDateOnly(plan.dueOn)}`
                  : plan.reasons.join(' ')}
              </Alert>
            )
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button size="small" onClick={onClose} disabled={busy}>
          Close
        </Button>
        {!recorded && (
          <>
            <Button
              size="small"
              variant="outlined"
              disabled={busy || Boolean(retry)}
              onClick={review}
            >
              Review due date
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={save}
              disabled={busy || (!retry && (!plan?.canRenew || attempt.conflict))}
            >
              {retry ? 'Retry unchanged renewal' : 'Confirm renewal'}
            </Button>
          </>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
