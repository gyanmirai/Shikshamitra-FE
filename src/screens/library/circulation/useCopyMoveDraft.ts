import type { LibraryCopyMoveOptions } from 'src/redux/library/copy-lifecycle-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useMoveLibraryCopyMutation } from 'src/redux/library/copy-lifecycle-api';

export function useCopyMoveDraft(
  options: LibraryCopyMoveOptions | undefined,
  authorized: boolean,
  onClose: () => void
) {
  const [save, result] = useMoveLibraryCopyMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const state = options?.state;
  const canMove =
    authorized && Boolean(state?.canMove && state.revision && !state.requiresLoanReconciliation);
  const formik = useFormik({
    initialValues: { sectionId: state?.sectionId || '', shelfId: state?.shelfId || '', reason: '' },
    enableReinitialize: true,
    validationSchema: Yup.object({
      sectionId: Yup.string()
        .required('Choose a destination section')
        .oneOf(options?.sections.map((section) => section.id) || [], 'Choose an available section'),
      shelfId: Yup.string()
        .required('Choose a destination shelf')
        .test('section-shelf', 'Choose a shelf in the selected section', (value, context) => {
          const parent = context.parent as { sectionId: string };
          return Boolean(
            options?.sections
              .find((section) => section.id === parent.sectionId)
              ?.shelfDetails.some((shelf) => shelf.id === value)
          );
        })
        .test('changed-location', 'Choose a different location', (value, context) => {
          const parent = context.parent as { sectionId: string };
          return parent.sectionId !== state?.sectionId || value !== state?.shelfId;
        }),
      reason: Yup.string()
        .trim()
        .required('Explain the reason for this move')
        .max(500, 'Use at most 500 characters'),
    }),
    onSubmit: async (values) => {
      if (inFlight.current || !canMove || !state) return;
      inFlight.current = true;
      setError('');
      try {
        await save({
          bookId: state.bookId,
          copyId: state.copyId,
          body: { ...values, revision: state.revision },
        }).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({ message: 'Copy moved.' });
        onClose();
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail || 'Could not move this copy. Your draft is retained.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  return { formik, error, canMove, busy: formik.isSubmitting || result.isLoading };
}
