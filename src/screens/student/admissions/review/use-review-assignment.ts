import type { ReviewSummary } from 'src/redux/student/admissions/admission-review-types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { useAssignAdmissionReviewMutation } from 'src/redux/student/admissions/admission-review-api';

import { useReviewRecovery } from './use-review-recovery';

const assignmentValues = (summary: ReviewSummary) => ({
  assignedReviewerId: summary.assignedReviewerId,
  dueAt: summary.dueAt,
  reason: '',
});
export function useReviewAssignment(
  initial: ReviewSummary,
  onClose: () => void,
  onReload: () => Promise<ReviewSummary>
) {
  const recovery = useReviewRecovery(initial, onReload);
  const [assign] = useAssignAdmissionReviewMutation();
  const formik = useFormik({
    initialValues: assignmentValues(initial),
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .required('Explain the assignment change.')
        .max(1024, 'Use 1,024 characters or fewer.'),
      dueAt: Yup.string()
        .nullable()
        .test('date', 'Choose a valid deadline.', (value) => !value || dayjs(value).isValid()),
    }),
    onSubmit: async (values) => {
      recovery.setError('');
      try {
        const { summary } = recovery;
        await assign({
          applicationId: summary.applicationId,
          stageId: summary.stageId,
          concurrencyStamp: summary.concurrencyStamp,
          ...values,
          reason: values.reason.trim(),
        }).unwrap();
        shikshaMitraToast.success({ message: 'Review assignment updated' });
        onClose();
      } catch (failure) {
        recovery.fail(failure);
      }
    },
  });
  return {
    recovery,
    formik,
    busy: formik.isSubmitting || recovery.reloading,
    reload: () =>
      recovery.reload((updated) => formik.resetForm({ values: assignmentValues(updated) })),
  };
}
