import { Alert, Button, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { FinancePostingForm } from './FinancePostingForm';
import { FinanceBindingForm } from './FinanceBindingForm';
import { financeAmount } from './FinanceAssessmentSummary';
import { FinanceApprovalForm } from './FinanceApprovalForm';
import { FinanceCollectionForm } from './FinanceCollectionForm';
import { FinanceCorrectionsActions } from './FinanceCorrectionsActions';

import type { useFinanceCashier } from './useFinanceCashier';

export function FinanceCashierActions({ state }: { state: ReturnType<typeof useFinanceCashier> }) {
  const {
    source,
    query,
    posted,
    access,
    blocked,
    changed,
    callbacks,
    result,
    setResult,
    setPreview,
  } = state;
  if (!source) return null;
  return (
    <>
      {query.isError && (
        <Alert
          severity="error"
          action={<Button onClick={() => query.refetch()}>Retry Finance</Button>}
        >
          {parseApiProblemDetail(query.error).detail}
        </Alert>
      )}
      {state.correctionAction === null && (
        <>
          {!posted &&
            (access.post ? (
              <FinancePostingForm
                source={source}
                disabled={blocked('post')}
                onChanged={changed}
                {...callbacks.post}
              />
            ) : (
              <Alert severity="info">
                Finance charge posting permission is required to create this receivable.
              </Alert>
            ))}
          {posted && access.bind && (
            <FinanceBindingForm
              source={source}
              disabled={blocked('bind')}
              onChanged={changed}
              {...callbacks.bind}
            />
          )}
          {posted && access.approve && (
            <FinanceApprovalForm
              source={source}
              disabled={blocked('approve')}
              onChanged={changed}
              {...callbacks.approve}
            />
          )}
          {posted && !result && access.collectionView && (
            <FinanceCollectionForm
              source={source}
              disabled={blocked('collect')}
              onChanged={changed}
              {...callbacks.collect}
              canCollect={access.collect}
              onReceipt={setResult}
            />
          )}
          {posted && !access.collectionView && (
            <Alert severity="info">
              Finance approval and policy binding are separate from collection. A cashier with
              collection access can record payment when the assessment is ready.
            </Alert>
          )}
        </>
      )}
      {posted && <FinanceCorrectionsActions state={state} />}
      {result && (
        <Alert severity={result.verificationStatus === 1 ? 'info' : 'success'}>
          {result.verificationStatus === 1
            ? 'Payment submitted for bank verification'
            : 'Payment recorded'}
          : {financeAmount(result.acceptedAmount, result.receivable.currency)}. Receipt{' '}
          {result.receiptNumber}.
        </Alert>
      )}
      {result && access.receipt && (
        <Button variant="outlined" onClick={() => setPreview(true)}>
          View receipt
        </Button>
      )}
      {result && !access.receipt && (
        <Typography variant="body2">
          Receipt viewing permission is required to open this document.
        </Typography>
      )}
    </>
  );
}
