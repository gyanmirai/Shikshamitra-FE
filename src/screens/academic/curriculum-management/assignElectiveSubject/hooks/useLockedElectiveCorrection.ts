import type { ElectiveCorrectionReview, ElectiveCorrectionRequest } from 'src/redux/classManagementApi/studentElectiveAssignment/electiveCorrectionTypes';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import {
  usePreviewLockedElectiveCorrectionMutation,
  useConfirmLockedElectiveCorrectionMutation,
} from 'src/redux/classManagementApi/studentElectiveAssignment/studentElectiveAssignment';

export type CorrectionContext = Pick<ElectiveCorrectionRequest, 'academicMediumId' | 'classId' | 'divisionId' | 'electiveGroupId'>;

function errorMessage(error: unknown) {
  const response = error as { data?: { error?: { message?: string } } };
  return response?.data?.error?.message ?? 'Unable to apply this change. Review the changes again and retry.';
}

export default function useLockedElectiveCorrection(context: CorrectionContext, studentId: string, selectedSubjectId: string, onSaved: () => void) {
  const [preview, { isLoading: isReviewing }] = usePreviewLockedElectiveCorrectionMutation();
  const [confirm, { isLoading: isSaving }] = useConfirmLockedElectiveCorrectionMutation();
  const [review, setReview] = useState<{ input: ElectiveCorrectionRequest; result: ElectiveCorrectionReview } | null>(null);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const form = useFormik({
    initialValues: { selectedSubjectId, preferredSubjectId: '', reason: '' },
    validationSchema: Yup.object({ selectedSubjectId: Yup.string().required('Select a subject'), reason: Yup.string().max(1000, 'Use 1,000 characters or fewer') }),
    onSubmit: async (values) => {
      if (busy.current) return;
      busy.current = true;
      setError('');
      const input = { ...context, studentId, ...values, preferredSubjectId: values.preferredSubjectId || null };
      try {
        setReview({ input, result: await preview(input).unwrap() });
      } catch (failure) { setError(errorMessage(failure)); }
      finally { busy.current = false; }
    },
  });
  const confirmChanges = async () => {
    if (!review || busy.current) return;
    busy.current = true;
    setError('');
    try {
      await confirm({ ...review.input, reviewToken: review.result.reviewToken }).unwrap();
      onSaved();
    } catch (failure) {
      setError(errorMessage(failure));
      setReview(null);
    } finally { busy.current = false; }
  };
  return { form, review: review?.result, error, isBusy: isReviewing || isSaving,
    hasChanges: form.values.selectedSubjectId !== selectedSubjectId || !!form.values.preferredSubjectId,
    backToEdit: () => { setReview(null); setError(''); }, confirmChanges };
}
