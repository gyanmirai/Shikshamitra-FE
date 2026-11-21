import type { LibraryCopyState } from 'src/redux/library/copy-lifecycle-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUpdateBookCopyStatusMutation } from 'src/redux/library/bookList/bookList-api';

import { copyStateOptions } from './copy-state-options';

export function useCopyStatusDraft(
  state: LibraryCopyState,
  canUpdate: boolean,
  onClose: (event: unknown, submitted: boolean) => void
) {
  const [save, result] = useUpdateBookCopyStatusMutation();
  const [snapshot] = useState(state);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const options = copyStateOptions(snapshot);
  const canEdit =
    canUpdate &&
    !snapshot.requiresLoanReconciliation &&
    Boolean(snapshot.revision) &&
    (snapshot.canEditNotes || snapshot.canChangeCondition);
  const formik = useFormik<{ status: number | ''; remarks: string }>({
    initialValues: { status: snapshot.status, remarks: snapshot.remarks || '' },
    validationSchema: Yup.object({
      status: Yup.number()
        .transform((value, original) => (original === '' ? undefined : value))
        .oneOf(options.map((option) => option.id))
        .required('Choose a copy status'),
      remarks: Yup.string()
        .max(500, 'Use at most 500 characters')
        .when('status', {
          is: (status: number) => status !== snapshot.status,
          then: (schema) => schema.trim().required('Explain the reason for this status change'),
        }),
    }),
    onSubmit: async (values) => {
      if (
        inFlight.current ||
        !canEdit ||
        (values.status === snapshot.status && !snapshot.canEditNotes)
      )
        return;
      inFlight.current = true;
      setError('');
      try {
        await save({
          bookId: snapshot.bookId,
          accessionNumber: snapshot.accessionNumber,
          body: { ...values, status: Number(values.status), revision: snapshot.revision },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Copy status updated.' });
        formik.resetForm({ values });
        onClose(null, true);
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail ||
            'Could not update this copy. Your changes are retained.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  const canSubmit = canEdit && (formik.values.status !== snapshot.status || snapshot.canEditNotes);
  return {
    formik,
    error,
    snapshot,
    options,
    canEdit,
    canSubmit,
    busy: formik.isSubmitting || result.isLoading,
  };
}
