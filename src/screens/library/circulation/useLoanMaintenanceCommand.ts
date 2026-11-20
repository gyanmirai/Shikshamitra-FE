import type { LibraryLoanCommandResult } from 'src/redux/library/circulation-types';

import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useRenewLibraryLoanMutation,
  useReviewLibraryLoanDatesMutation,
} from 'src/redux/library/loans-api';

import { useCommandAttempt } from './useCommandAttempt';

import type { MaintenancePayload } from './loan-maintenance-types';

export function useLoanMaintenanceCommand(onSuccess: (result: LibraryLoanCommandResult) => void) {
  const [renew, renewal] = useRenewLibraryLoanMutation();
  const [review, dateReview] = useReviewLibraryLoanDatesMutation();
  const attempt = useCommandAttempt<MaintenancePayload>();
  const [fingerprint, setFingerprint] = useState('');
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const retry = attempt.retry(fingerprint);
  return {
    error,
    setError,
    uncertain: Boolean(retry),
    conflict: attempt.conflict,
    busy: renewal.isLoading || dateReview.isLoading,
    submit: async (payload?: MaintenancePayload) => {
      if (inFlight.current || (!retry && !payload)) return;
      const key = retry ? fingerprint : JSON.stringify(payload);
      const prepared = retry || attempt.prepare(key, payload!);
      inFlight.current = true;
      setFingerprint(key);
      setError('');
      try {
        const result =
          prepared.kind === 'renew'
            ? await renew({
                loanId: prepared.loanId,
                body: { ...prepared.body, idempotencyKey: prepared.idempotencyKey },
              }).unwrap()
            : await review({
                loanId: prepared.loanId,
                body: { ...prepared.body, idempotencyKey: prepared.idempotencyKey },
              }).unwrap();
        shikshaMitraToast.success({
          message: result.wasReplay
            ? 'The previous submission was recovered.'
            : prepared.kind === 'renew'
              ? 'Loan renewed.'
              : 'School dates confirmed.',
        });
        onSuccess(result);
      } catch (cause) {
        attempt.failed(key, cause);
        setError(
          parseApiProblemDetail(cause).detail ||
            'The submission could not be confirmed. Your draft is retained.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  };
}
