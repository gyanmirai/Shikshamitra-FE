import type { LibraryCopyState } from 'src/redux/library/copy-lifecycle-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useWriteOffLibraryCopyMutation } from 'src/redux/library/copy-lifecycle-api';

export function useCopyWriteOffDraft(
  state: LibraryCopyState | undefined,
  authorized: boolean,
  onClose: () => void
) {
  const [save, result] = useWriteOffLibraryCopyMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const canWriteOff =
    authorized &&
    Boolean(state?.canWriteOff && state.revision && !state.requiresLoanReconciliation);
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .required('Explain the reason for this write-off')
        .max(500, 'Use at most 500 characters'),
    }),
    onSubmit: async (values) => {
      if (inFlight.current || !canWriteOff || !state) return;
      inFlight.current = true;
      setError('');
      try {
        await save({
          bookId: state.bookId,
          copyId: state.copyId,
          body: { ...values, revision: state.revision },
        }).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({
          message: 'Copy written off. History and charges are retained.',
        });
        onClose();
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail ||
            'Could not write off this copy. Your reason is retained.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  return { formik, error, canWriteOff, busy: formik.isSubmitting || result.isLoading };
}
