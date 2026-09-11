import type { ReviewSummary } from 'src/redux/student/admissions/admission-review-types';

import { useRef } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useSubmitAdmissionReviewMutation,
  useSaveAdmissionReviewDraftMutation,
} from 'src/redux/student/admissions/admission-review-api';

import { useReviewRecovery } from './use-review-recovery';
import { reviewDraftSchema, reviewDraftValues, reviewSubmitIssue } from './review-model';

export function useReviewEditor(
  initial: ReviewSummary,
  onClose: () => void,
  onReload: () => Promise<ReviewSummary>
) {
  const recovery = useReviewRecovery(initial, onReload);
  const { summary, setSummary, setError } = recovery;
  const mode = useRef<'draft' | 'submit'>('draft');
  const [save] = useSaveAdmissionReviewDraftMutation();
  const [submit] = useSubmitAdmissionReviewMutation();
  const formik = useFormik({
    initialValues: reviewDraftValues(initial),
    validationSchema: reviewDraftSchema,
    onSubmit: async (values) => {
      setError('');
      const issue = mode.current === 'submit' ? reviewSubmitIssue(values, summary) : null;
      if (issue) {
        setError(issue);
        return;
      }
      try {
        const command = {
          applicationId: summary.applicationId,
          stageId: summary.stageId,
          concurrencyStamp: summary.concurrencyStamp,
          ...values,
        };
        const updated = await (
          mode.current === 'submit' ? submit(command) : save(command)
        ).unwrap();
        setSummary(updated);
        formik.resetForm({ values: reviewDraftValues(updated) });
        shikshaMitraToast.success({
          message:
            mode.current === 'submit'
              ? 'Recommendation submitted for a decision'
              : 'Review draft saved',
        });
        if (mode.current === 'submit') onClose();
      } catch (failure) {
        recovery.fail(failure);
      }
    },
  });
  return {
    summary,
    formik,
    error: recovery.error,
    reloading: recovery.reloading,
    reload: () =>
      recovery.reload((updated) => formik.resetForm({ values: reviewDraftValues(updated) })),
    save: (next: 'draft' | 'submit') => {
      mode.current = next;
      formik.handleSubmit();
    },
  };
}
