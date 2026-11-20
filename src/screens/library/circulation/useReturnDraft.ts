import type { LibraryLoanReturnRequest } from 'src/redux/library/circulation-commands';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useReturnLibraryLoanMutation } from 'src/redux/library/loans-api';

import { useReturnLookup } from './useReturnLookup';
import { matchesReturnTarget } from './return-target';
import { useCommandAttempt } from './useCommandAttempt';
import { returnSchema, hasReturnCharge } from './return-form';
import { returnFingerprint, buildCanonicalReturn, returnNeedsDateReason } from './return-request';

import type { ReturnValues } from './return-form';
import type { LibraryReturnTarget } from './return-target';

export function useReturnDraft(
  accessionNo: string,
  canReturn: boolean,
  onClose: (event: unknown, submitted: boolean) => void,
  target?: LibraryReturnTarget
) {
  const [save, result] = useReturnLibraryLoanMutation();
  const attempt = useCommandAttempt<{
    loanId: string;
    body: Omit<LibraryLoanReturnRequest, 'idempotencyKey'>;
  }>();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const formik = useFormik<ReturnValues>({
    initialValues: {
      accessionNo,
      returnDate: null,
      chargeCategory: 'none',
      amount: '',
      fineDueDate: null,
      copyStatus: 0,
      remarks: '',
      unknownOriginalDatesReason: '',
      assessmentAcademicYearId: '',
      assessmentAcademicYearReason: '',
      assessmentReason: '',
      chargeDate: null,
    },
    validationSchema: returnSchema,
    onSubmit: async (values) => {
      if (inFlight.current) return;
      const key = returnFingerprint(values);
      const retry = attempt.retry(key);
      const current = lookup.currentData;
      if (
        !canReturn ||
        (!retry &&
          (!current?.loan.canReturn ||
            !current.copy.copyId ||
            !current.loan.revision ||
            !matchesTarget ||
            lookup.pending ||
            attempt.conflict))
      ) {
        setError('Review the exact active loan before returning this copy.');
        return;
      }
      if (
        !retry &&
        current &&
        returnNeedsDateReason(current) &&
        !values.unknownOriginalDatesReason?.trim()
      ) {
        formik.setFieldTouched('unknownOriginalDatesReason', true, false);
        formik.setFieldError(
          'unknownOriginalDatesReason',
          'Explain the physical return while the original school dates remain unconfirmed.'
        );
        return;
      }
      if (
        !retry &&
        current &&
        hasReturnCharge(values.chargeCategory) &&
        values.assessmentAcademicYearId !== current.loan.academicYearId &&
        !values.assessmentAcademicYearReason?.trim()
      ) {
        formik.setFieldTouched('assessmentAcademicYearReason', true, false);
        formik.setFieldError(
          'assessmentAcademicYearReason',
          'Explain the academic context for this new assessment.'
        );
        return;
      }
      inFlight.current = true;
      setError('');
      try {
        const prepared =
          retry ||
          attempt.prepare(key, {
            loanId: current!.loan.id,
            body: buildCanonicalReturn(values, current!),
          });
        const saved = await save({
          loanId: prepared.loanId,
          body: { ...prepared.body, idempotencyKey: prepared.idempotencyKey },
        }).unwrap();
        shikshaMitraToast.success({
          message: saved.wasReplay
            ? 'The previously submitted return was recovered.'
            : 'Physical copy returned successfully.',
        });
        formik.resetForm({ values });
        onClose(null, true);
      } catch (cause) {
        attempt.failed(key, cause);
        setError(
          parseApiProblemDetail(cause).detail ||
            'The return could not be confirmed. Your draft and submission attempt are retained.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  const lookup = useReturnLookup(formik.values.accessionNo, canReturn);
  const matchesTarget = matchesReturnTarget(lookup.currentData, target || lookup.target);
  const retry = attempt.retry(returnFingerprint(formik.values));
  return {
    formik,
    lookup,
    error,
    busy: formik.isSubmitting || result.isLoading,
    uncertain: Boolean(retry),
    conflict: attempt.conflict,
    identityMismatch: Boolean(lookup.currentData && !matchesTarget),
    review: () => {
      attempt.reviewed();
      lookup.refetch();
    },
    canSubmit:
      canReturn &&
      Boolean(
        retry ||
        (lookup.currentData?.loan.canReturn &&
          matchesTarget &&
          !lookup.pending &&
          !lookup.isError &&
          !attempt.conflict)
      ),
  };
}
