import type {
  AdmissionApplication,
  AdmissionApplicationDecisionInput,
} from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';

import { useReviewRecovery } from '../review/use-review-recovery';
import { managedReviewAllowsDecision } from '../review/review-model';
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
  const requiresExpiry = action === 'offer';
  const reaffirm =
    action === 'approve' &&
    current.reviewDecision?.managedReviewEnabled &&
    current.reviewDecision.canApprove &&
    [6, 7, 8].includes(current.status);
  const canRecord = Boolean(
    action &&
    current.concurrencyStamp &&
    (canPerformAdmissionDecision(current.status, action) || reaffirm) &&
    managedReviewAllowsDecision(current.reviewDecision, action) &&
    !recovery.error
  );
  const formik = useFormik({
    initialValues: { reason: '', offerExpiresAt: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .max(512, 'Use 512 characters or fewer')
        .test(
          'required-reason',
          'Reason is required for this decision',
          (value) => !requiresReason || Boolean(value?.trim())
        ),
      offerExpiresAt: Yup.string().test(
        'future-offer-expiry',
        'Offer expiry must be in the future',
        (value) => !requiresExpiry || Boolean(value && new Date(value).getTime() > Date.now())
      ),
    }),
    onSubmit: async (values, helpers) => {
      if (!canRecord) return;
      try {
        const success = await onSubmit({
          reason: values.reason.trim() || undefined,
          offerExpiresAt: values.offerExpiresAt
            ? new Date(values.offerExpiresAt).toISOString()
            : undefined,
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
    requiresExpiry,
    reload: () => recovery.reload(() => formik.resetForm()),
  };
}
