import type {
  AdmissionApplication,
  AdmissionApplicationDecisionInput,
} from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';

import { useReviewRecovery } from '../review/use-review-recovery';
import { admissionDecisionRequiresReason } from './application-decision-model';
import { canPerformAdmissionDecision } from './use-admission-application-decisions';

import type { AdmissionDecisionAction } from './use-admission-application-decisions';

export function useApplicationDecisionForm({
  action,
  application,
  onSubmit,
  onClose,
  onReload,
}: {
  action: AdmissionDecisionAction | null;
  application: AdmissionApplication;
  onSubmit: (input: AdmissionApplicationDecisionInput) => Promise<boolean>;
  onClose: () => void;
  onReload: () => Promise<AdmissionApplication>;
}) {
  const recovery = useReviewRecovery(application, onReload, 'application');
  const current = recovery.summary;
  const requiresReason = admissionDecisionRequiresReason(action);
  const canRecord = Boolean(
    action &&
    current.concurrencyStamp &&
    canPerformAdmissionDecision(current.status, action) &&
    !recovery.error
  );
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .max(512, 'Use 512 characters or fewer')
        .test(
          'required-reason',
          'Reason is required for this decision',
          (value) => !requiresReason || Boolean(value?.trim())
        ),
    }),
    onSubmit: async (values, helpers) => {
      if (!canRecord) return;
      try {
        const success = await onSubmit({
          reason: values.reason.trim() || undefined,
          concurrencyStamp: current.concurrencyStamp,
        });
        if (success) {
          helpers.resetForm();
          onClose();
        } else
          recovery.setError(
            'Unable to confirm the decision. Your edits are still here. Reload the application before trying again.'
          );
      } catch (error) {
        recovery.fail(error);
      }
    },
  });
  return {
    formik,
    current,
    recovery,
    canRecord,
    requiresReason,
    reload: () => recovery.reload(() => formik.resetForm()),
  };
}
