import type { LibraryLoan } from 'src/redux/library/circulation-types';

import { useFormik } from 'formik';
import { useRef, useMemo } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { useLoanMaintenanceCommand } from './useLoanMaintenanceCommand';
import { reviewDateBody, initialReviewValues } from './loan-review-fields';
import { reviewSchema, reviewRangeError } from './loan-maintenance-schema';

import type { ExactLoanSession } from './useExactLoanSession';
import type { DateReviewValues } from './loan-maintenance-types';

export function useDateReviewDraft(
  loan: LibraryLoan,
  session: ExactLoanSession,
  allowed: boolean,
  onClose: (event: unknown, submitted: boolean) => void
) {
  const inFlight = useRef(false);
  /** Memoization Justification: Formik must keep the eligible-field validation contract of the opened loan through background reads. */
  const schema = useMemo(() => reviewSchema(loan), [loan]);
  const command = useLoanMaintenanceCommand(() => {
    formik.resetForm();
    onClose(null, true);
  });
  const formik = useFormik<DateReviewValues>({
    initialValues: initialReviewValues(loan),
    validationSchema: schema,
    validateOnMount: true,
    onSubmit: async (values) => {
      if (inFlight.current || !allowed) return;
      inFlight.current = true;
      try {
        if (command.uncertain) {
          await command.submit();
          return;
        }
        if (command.conflict || session.changed)
          throw new Error('Reload the changed saved loan for review before submitting.');
        const fresh = await session.verify();
        if (fresh.canReviewDates !== true)
          throw new Error(
            'The current saved record does not permit date review. Your draft is retained.'
          );
        const rangeError = reviewRangeError(loan, values);
        if (rangeError) throw new Error(rangeError);
        await command.submit({
          kind: 'reviewDates',
          loanId: loan.id,
          body: reviewDateBody(loan, values),
        });
      } catch (cause) {
        command.setError(
          parseApiProblemDetail(cause).detail ||
            (cause instanceof Error ? cause.message : 'The school dates could not be verified.')
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  const current =
    loan.canReviewDates === true &&
    session.latest?.canReviewDates === true &&
    !session.changed &&
    !session.error &&
    !session.fetching;
  return {
    formik,
    command,
    current,
    busy: formik.isSubmitting || command.busy,
    error: command.error || session.error,
    canSubmit:
      allowed &&
      (command.uncertain ||
        (current && !command.conflict && formik.isValid && !reviewRangeError(loan, formik.values))),
  };
}
