'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionApplicationStatus,
  AdmissionApplicationDecisionInput,
} from 'src/redux/student/admissions/admission-applications-api';

import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useIssueAdmissionOfferMutation,
  useAcceptAdmissionOfferMutation,
  useDeclineAdmissionOfferMutation,
  useEnrollAdmissionApplicationMutation,
  useGetAdmissionEnrollmentOptionsQuery,
  useRejectAdmissionApplicationMutation,
  useApproveAdmissionApplicationMutation,
  useWaitlistAdmissionApplicationMutation,
  useMarkAdmissionApplicationInReviewMutation,
  useGetAdmissionApplicationDecisionHistoryQuery,
} from 'src/redux/student/admissions/admission-applications-api';

export type AdmissionDecisionAction =
  | 'review'
  | 'approve'
  | 'reject'
  | 'waitlist'
  | 'offer'
  | 'accept'
  | 'decline';

export function useAdmissionApplicationDecisions(
  id: string,
  status?: AdmissionApplicationStatus,
) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const historyQuery = useGetAdmissionApplicationDecisionHistoryQuery(id);
  const canEnroll = hasGrantedPermission(permissions, 'Students.Admissions.Applications.Enroll');
  const enrollmentOptionsQuery = useGetAdmissionEnrollmentOptionsQuery(id, {
    skip: !canEnroll || status !== 8,
  });
  const [markInReview, reviewState] = useMarkAdmissionApplicationInReviewMutation();
  const [approve, approveState] = useApproveAdmissionApplicationMutation();
  const [reject, rejectState] = useRejectAdmissionApplicationMutation();
  const [waitlist, waitlistState] = useWaitlistAdmissionApplicationMutation();
  const [issueOffer, offerState] = useIssueAdmissionOfferMutation();
  const [acceptOffer, acceptState] = useAcceptAdmissionOfferMutation();
  const [declineOffer, declineState] = useDeclineAdmissionOfferMutation();
  const [enroll, enrollState] = useEnrollAdmissionApplicationMutation();

  const runDecision = async (
    action: AdmissionDecisionAction,
    input: AdmissionApplicationDecisionInput,
  ): Promise<boolean> => {
    try {
      const request = {
        id,
        input,
      };
      if (action === 'review') await markInReview(request).unwrap();
      if (action === 'approve') await approve(request).unwrap();
      if (action === 'reject') await reject(request).unwrap();
      if (action === 'waitlist') await waitlist(request).unwrap();
      if (action === 'offer') await issueOffer(request).unwrap();
      if (action === 'accept') await acceptOffer(request).unwrap();
      if (action === 'decline') await declineOffer(request).unwrap();
      shikshaMitraToast.success({ message: getSuccessMessage(action) });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to update the application decision',
      });
      return false;
    }
  };

  const runEnrollment = async (
    concurrencyStamp?: string | null,
    divisionId?: string | null,
  ): Promise<boolean> => {
    try {
      await enroll({ id, concurrencyStamp, divisionId }).unwrap();
      shikshaMitraToast.success({ message: 'Applicant enrolled successfully' });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to enroll the applicant',
      });
      return false;
    }
  };

  return {
    historyQuery,
    enrollmentOptionsQuery,
    runDecision,
    runEnrollment,
    isBusy:
      reviewState.isLoading ||
      approveState.isLoading ||
      rejectState.isLoading ||
      waitlistState.isLoading ||
      offerState.isLoading ||
      acceptState.isLoading ||
      declineState.isLoading ||
      enrollState.isLoading,
    canDecide: hasGrantedPermission(permissions, 'Students.Admissions.Applications.Decide'),
    canOffer: hasGrantedPermission(permissions, 'Students.Admissions.Applications.Offer'),
    canEnroll,
  };
}

export function canPerformAdmissionDecision(
  status: AdmissionApplicationStatus,
  action: AdmissionDecisionAction,
): boolean {
  if (action === 'review') return status === 1;
  if (action === 'approve') return status === 1 || status === 4 || status === 5;
  if (action === 'reject') return status === 1 || status === 4 || status === 5 || status === 6;
  if (action === 'waitlist') return status === 1 || status === 4;
  if (action === 'offer') return status === 6;
  return status === 7;
}

function getSuccessMessage(action: AdmissionDecisionAction): string {
  const labels: Record<AdmissionDecisionAction, string> = {
    review: 'Application moved to review',
    approve: 'Application approved',
    reject: 'Application rejected',
    waitlist: 'Application waitlisted',
    offer: 'Admission offer issued',
    accept: 'Admission offer accepted',
    decline: 'Admission offer declined',
  };
  return labels[action];
}
