'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionApplication,
  ApproveAndFinalizeAdmissionInput,
  AdmissionApplicationDecisionInput,
} from 'src/redux/student/admissions/admission-applications-api';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetAdmissionApprovalPreviewQuery,
  useLazyGetAdmissionApplicationQuery,
  useRejectAdmissionApplicationMutation,
  useWaitlistAdmissionApplicationMutation,
  useLazyGetAdmissionApplicationWorkflowQuery,
  useGetAdmissionApplicationDecisionHistoryQuery,
  useApproveAndFinalizeAdmissionApplicationMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';

export function useAdmissionApproval(application: AdmissionApplication, readHistory = true) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage);
  const previewQuery = useGetAdmissionApprovalPreviewQuery(application.id, {
    skip: !canManage || ![1, 4, 5, 6].includes(application.status),
  });
  // History and evidence belong to a reopened finalized record, not the submission path.
  const historyQuery = useGetAdmissionApplicationDecisionHistoryQuery(application.id, {
    skip: !readHistory || application.status !== 11,
  });
  const [approve, approval] = useApproveAndFinalizeAdmissionApplicationMutation();
  const [reject, rejection] = useRejectAdmissionApplicationMutation();
  const [waitlist, waiting] = useWaitlistAdmissionApplicationMutation();
  const [reload] = useLazyGetAdmissionApplicationQuery();
  const [reloadWorkflow] = useLazyGetAdmissionApplicationWorkflowQuery();
  const [errorMessage, setError] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);
  const requestKey = useRef<string | null>(null);
  const pendingInput = useRef<ApproveAndFinalizeAdmissionInput | null>(null);
  const runApproval = async (
    value: Omit<ApproveAndFinalizeAdmissionInput, 'idempotencyKey' | 'concurrencyStamp'>
  ) => {
    if (!canManage || !application.concurrencyStamp) return null;
    requestKey.current ??= crypto.randomUUID();
    pendingInput.current ??= {
      ...value,
      concurrencyStamp: application.concurrencyStamp,
      idempotencyKey: requestKey.current,
    };
    setError(null);
    try {
      const result = await approve({
        id: application.id,
        input: pendingInput.current,
      }).unwrap();
      requestKey.current = null;
      pendingInput.current = null;
      shikshaMitraToast.success({ message: 'Admission finalized' });
      return result;
    } catch (error) {
      const message =
        parseApiProblemDetail(error).detail ||
        'Unable to finalize admission. Retry or reload the latest application.';
      setError(message);
      shikshaMitraToast.error({ message });
      return null;
    }
  };
  const runDecision = async (
    action: 'reject' | 'waitlist',
    input: AdmissionApplicationDecisionInput
  ) => {
    if (!canManage || !input.concurrencyStamp) return false;
    try {
      await (action === 'reject' ? reject : waitlist)({ id: application.id, input }).unwrap();
      shikshaMitraToast.success({
        message: action === 'reject' ? 'Application rejected' : 'Application waitlisted',
      });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to record the decision',
      });
      return false;
    }
  };
  return {
    canManage,
    previewQuery,
    historyQuery,
    runApproval,
    runDecision,
    busy: recovering || approval.isLoading || rejection.isLoading || waiting.isLoading,
    reloadApplication: () => reload(application.id).unwrap(),
    error: errorMessage,
    reloadLatest: async () => {
      setRecovering(true);
      try {
        const [latest] = await Promise.all([
          reload(application.id).unwrap(),
          reloadWorkflow(application.id).unwrap(),
        ]);
        await previewQuery.refetch().unwrap();
        setError(null);
        requestKey.current = null;
        pendingInput.current = null;
        return latest;
      } finally {
        setRecovering(false);
      }
    },
    resetRequest: () => {
      requestKey.current = null;
      pendingInput.current = null;
      setError(null);
    },
  };
}
