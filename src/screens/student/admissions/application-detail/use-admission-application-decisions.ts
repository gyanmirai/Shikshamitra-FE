'use client';

import type { RootState } from 'src/redux/store';
import type {
  FinalizeAdmissionInput,
  AdmissionApplicationStatus,
  AdmissionFinalizationResult,
  AdmissionApplicationDecisionInput,
} from 'src/redux/student/admissions/admission-applications-api';

import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useRejectAdmissionApplicationMutation,
  useApproveAdmissionApplicationMutation,
  useFinalizeAdmissionApplicationMutation,
  useGetAdmissionFinalizationPreviewQuery,
  useWaitlistAdmissionApplicationMutation,
  useGetAdmissionApplicationDecisionHistoryQuery,
} from 'src/redux/student/admissions/admission-applications-api';

import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';

export type AdmissionDecisionAction = 'approve' | 'reject' | 'waitlist';

export function useAdmissionApplicationDecisions(
  id: string,
  status?: AdmissionApplicationStatus,
  journeyCompleted = false
) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const historyQuery = useGetAdmissionApplicationDecisionHistoryQuery(id);
  const canFinalize = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage);
  const finalizationPreviewQuery = useGetAdmissionFinalizationPreviewQuery(id, {
    skip: !canFinalize || status !== 6 || !journeyCompleted,
  });
  const [approve, approveState] = useApproveAdmissionApplicationMutation();
  const [reject, rejectState] = useRejectAdmissionApplicationMutation();
  const [waitlist, waitlistState] = useWaitlistAdmissionApplicationMutation();
  const [finalizeAdmission, finalizeState] = useFinalizeAdmissionApplicationMutation();
  const finalizationKey = useRef<string | null>(null);

  const runDecision = async (
    action: AdmissionDecisionAction,
    input: AdmissionApplicationDecisionInput
  ): Promise<boolean> => {
    if (!input.concurrencyStamp) {
      shikshaMitraToast.error({
        message: 'The application changed or is still loading. Refresh it before continuing.',
      });
      return false;
    }
    try {
      const request = {
        id,
        input,
      };
      if (action === 'approve') await approve(request).unwrap();
      if (action === 'reject') await reject(request).unwrap();
      if (action === 'waitlist') await waitlist(request).unwrap();
      shikshaMitraToast.success({ message: getSuccessMessage(action) });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to update the application decision',
      });
      return false;
    }
  };

  const runFinalization = async (
    concurrencyStamp: string | null | undefined,
    value: Omit<FinalizeAdmissionInput, 'concurrencyStamp' | 'idempotencyKey'>,
    onFinalized?: (result: AdmissionFinalizationResult) => void
  ): Promise<boolean> => {
    if (!concurrencyStamp) {
      shikshaMitraToast.error({
        message: 'The application changed or is still loading. Refresh it before finalizing.',
      });
      return false;
    }
    try {
      finalizationKey.current ??= crypto.randomUUID();
      const result = await finalizeAdmission({
        id,
        input: { ...value, concurrencyStamp, idempotencyKey: finalizationKey.current },
      }).unwrap();
      finalizationKey.current = null;
      shikshaMitraToast.success({ message: 'Admission finalized' });
      onFinalized?.(result);
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to finalize the admission',
      });
      return false;
    }
  };

  return {
    historyQuery,
    finalizationPreviewQuery,
    runDecision,
    runFinalization,
    isBusy:
      approveState.isLoading ||
      rejectState.isLoading ||
      waitlistState.isLoading ||
      finalizeState.isLoading,
    canDecide: hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage),
    canFinalize,
  };
}

export function canPerformAdmissionDecision(
  status: AdmissionApplicationStatus,
  action: AdmissionDecisionAction
): boolean {
  if (action === 'approve') return status === 1 || status === 4 || status === 5;
  if (action === 'reject') return status === 1 || status === 4 || status === 5 || status === 6;
  return action === 'waitlist' && (status === 1 || status === 4);
}

function getSuccessMessage(action: AdmissionDecisionAction): string {
  const labels: Record<AdmissionDecisionAction, string> = {
    approve: 'Application approved',
    reject: 'Application rejected',
    waitlist: 'Application waitlisted',
  };
  return labels[action];
}
