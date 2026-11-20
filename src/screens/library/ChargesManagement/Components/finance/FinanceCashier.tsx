import { DialogScrollContent } from 'src/components/customDialog';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { LibraryChargeStatusType } from 'src/enums/library_charges_type';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';
import ReceiptPreviewDialog from 'src/screens/finance/InvoiceAndReceipt/Components/ReceiptManagement/Components/ReceiptPreviewDialog';

import { useFinanceCashier } from './useFinanceCashier';
import { FinanceCashierActions } from './FinanceCashierActions';
import { FinanceAssessmentSummary } from './FinanceAssessmentSummary';

import type { ICollectChargesProps } from '../type';

export function FinanceCashier(props: ICollectChargesProps) {
  const { onClose } = props;
  const state = useFinanceCashier(props);
  const {
    access,
    opened,
    assessment,
    source,
    receivable,
    result,
    preview,
    setPreview,
    posted,
    locked,
  } = state;
  if (!access.ready)
    return (
      <DialogScrollContent>
        <Typography role="status">Loading access...</Typography>
      </DialogScrollContent>
    );
  if (!access.source)
    return (
      <DialogScrollContent>
        <Alert severity="error">Library charge access is required.</Alert>
      </DialogScrollContent>
    );
  if (!assessment)
    return (
      <DialogScrollContent>
        {opened.query.isError ? (
          <Alert severity="error" action={<Button onClick={opened.retry}>Retry</Button>}>
            {parseApiProblemDetail(opened.query.error).detail}
          </Alert>
        ) : (
          <Typography role="status">Loading the saved Library assessment...</Typography>
        )}
      </DialogScrollContent>
    );
  const legacyClosed = !posted && assessment.status !== LibraryChargeStatusType.Pending;
  const confirmed = Boolean(
    source &&
    assessment.academicYearId &&
    assessment.schoolChargeDate &&
    assessment.schoolDueDate &&
    assessment.currency === 'INR' &&
    [1, 2].includes(assessment.chargeDateProvenance || 0) &&
    [1, 2].includes(assessment.dueDateProvenance || 0)
  );
  return (
    <>
      {state.contextConfirmation}
      <DialogScrollContent>
        <Stack spacing={2}>
          <FinanceAssessmentSummary assessment={assessment} receivable={receivable} />
          {opened.query.isError && (
            <Alert severity="error">{parseApiProblemDetail(opened.query.error).detail}</Alert>
          )}
          {legacyClosed ? (
            <Alert severity="info">
              This historical Library settlement record has no linked Finance payment evidence.
              Review the original register before any financial action.
            </Alert>
          ) : !confirmed || !source ? (
            <Alert severity="warning">
              Confirm the saved assessment year, school dates and currency before posting to
              Finance.
            </Alert>
          ) : (
            <FinanceCashierActions state={state} />
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button variant="outlined" disabled={locked} onClick={() => onClose(null, false)}>
          Close
        </Button>
      </DialogActions>
      {preview && result && access.receipt && (
        <ReceiptPreviewDialog receiptId={result.receiptId} onClose={() => setPreview(false)} />
      )}
    </>
  );
}
