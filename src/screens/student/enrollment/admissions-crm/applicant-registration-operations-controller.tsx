'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';

import { useMemo, useState, useEffect } from 'react';

import { shikshaMitraToast } from 'src/components/toast';

import { hasGrantedPermission } from 'src/utils/permissions';

import {
  AdmissionCrmRegistrationTemplateStatus,
  AdmissionCrmDocumentChecklistTemplateStatus,
  AdmissionCrmRegistrationAccessMode,
} from 'src/redux/student/admissions-crm/registration-documents-contracts';

import {
  useGetAdmissionCrmFormNumberSeriesQuery,
  useExtendAdmissionCrmRegistrationMutation,
  useRevokeAdmissionCrmRegistrationMutation,
  useVerifyAdmissionCrmRegistrationMutation,
  useReissueAdmissionCrmRegistrationMutation,
  useWaiveAdmissionCrmRegistrationFeeMutation,
  useGetAdmissionCrmRegistrationTemplatesQuery,
  useGetAdmissionCrmRegistrationReadinessQuery,
  useWaiveAdmissionCrmApplicantDocumentMutation,
  useAssignAdmissionCrmDocumentChecklistMutation,
  useReviewAdmissionCrmApplicantDocumentMutation,
  useGetCurrentAdmissionCrmRegistrationByLeadQuery,
  useUploadAdmissionCrmRegistrationDocumentMutation,
  useGetAdmissionCrmApplicantDocumentChecklistQuery,
  useGetAdmissionCrmDocumentChecklistTemplatesQuery,
  useIssueAdmissionCrmRegistrationApplicationMutation,
  useReturnAdmissionCrmRegistrationForCorrectionMutation,
  useRecordAdmissionCrmRegistrationPaymentReferenceMutation,
} from 'src/redux/student/admissions-crm/registration-documents-api';

import {
  useConfirmAdmissionCrmDocumentReadinessMutation,
  useConfirmAdmissionCrmDocumentOriginalSeenMutation,
} from 'src/redux/student/admissions-crm/core-leads-api';

import { admissionCrmActionPermissions } from './admission-action-permissions';

import { hasApplicantRegistrationDraft } from './applicant-registration-draft-state';

import { useApplicantWorkspaceDirtyState } from './applicant-workspace-dirty-context';

type Props = {
  leadId: string;
  academicYearId: string;
  hasRegistration: boolean;
  requestedActionCode?: string;
};

const dateInDays = (days: number) => {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
};

const readError = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.detail || data?.errorCode || fallback;
  }
  return fallback;
};

export function useApplicantRegistrationController({
  leadId,
  academicYearId,
  hasRegistration,
  requestedActionCode,
}: Props) {
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const canUploadDocuments = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.reviewDocuments
  );
  const canIssueRegistration = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.issueRegistrationForm
  );
  const canVerifyRegistration = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.verifyRegistration
  );
  const canManageRegistrationLinks = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.manageRegistrationLinks
  );
  const canWaiveRegistrationFee = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.waiveRegistrationFee
  );
  const canAssignDocumentChecklist = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.manageDocumentConfiguration
  );
  const canWaiveDocuments = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.waiveDocuments
  );
  const canConfirmOriginalSeen = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.confirmOriginalSeen
  );
  const canConfirmAdmissionReadiness = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.confirmAdmissionReadiness
  );
  const registrationQuery = useGetCurrentAdmissionCrmRegistrationByLeadQuery(
    { leadId },
    { skip: !hasRegistration }
  );
  const registration = registrationQuery.data;
  const readinessQuery = useGetAdmissionCrmRegistrationReadinessQuery(
    { leadId },
    { skip: Boolean(registration) }
  );
  const templatesQuery = useGetAdmissionCrmRegistrationTemplatesQuery(
    {
      academicYearId,
      status: AdmissionCrmRegistrationTemplateStatus.Published,
      maxResultCount: 100,
    },
    { skip: Boolean(registration) }
  );

  const seriesQuery = useGetAdmissionCrmFormNumberSeriesQuery(
    { academicYearId },
    { skip: Boolean(registration) }
  );

  const checklistTemplatesQuery = useGetAdmissionCrmDocumentChecklistTemplatesQuery({
    academicYearId,
    status: AdmissionCrmDocumentChecklistTemplateStatus.Published,
    maxResultCount: 100,
  });

  const checklistQuery = useGetAdmissionCrmApplicantDocumentChecklistQuery(
    { registrationApplicationId: registration?.id || '' },
    { skip: !registration }
  );

  const [registrationTemplateId, setRegistrationTemplateId] = useState('');

  const [accessMode, setAccessMode] = useState(AdmissionCrmRegistrationAccessMode.Online);

  const [issueFormOpen, setIssueFormOpen] = useState(false);

  const [seriesId, setSeriesId] = useState('');

  const [checklistTemplateId, setChecklistTemplateId] = useState('');

  const [reason, setReason] = useState('');

  const [correctionFields, setCorrectionFields] = useState('');

  const [initialNewExpiry] = useState(() => dateInDays(14));

  const [newExpiry, setNewExpiry] = useState(initialNewExpiry);

  const initialReissueDays = 14;

  const [reissueDays, setReissueDays] = useState(initialReissueDays);

  const [paymentReference, setPaymentReference] = useState('');

  const [overrideReadiness, setOverrideReadiness] = useState(false);

  const [documentReasonByKey, setDocumentReasonByKey] = useState<Record<string, string>>({});

  const [documentFileByKey, setDocumentFileByKey] = useState<Record<string, File | undefined>>({});

  const [documentValidUntilByKey, setDocumentValidUntilByKey] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (requestedActionCode === 'StartRegistration' && canIssueRegistration && !registration) {
      setIssueFormOpen(true);
    }
  }, [canIssueRegistration, registration, requestedActionCode]);

  useEffect(() => {
    let targetId: string | undefined;
    if (requestedActionCode === 'StartRegistration') {
      targetId = 'registration-issue-operation';
    } else if (requestedActionCode === 'ContinueRegistration') {
      targetId = 'registration-response-operation';
    } else if (
      requestedActionCode === 'VerifyRegistration' ||
      requestedActionCode === 'ReviewRegistrationCorrection' ||
      requestedActionCode === 'ReissueRegistration'
    ) {
      targetId = 'registration-lifecycle-operation';
    }
    if (!targetId) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [issueFormOpen, registration?.id, requestedActionCode]);

  useApplicantWorkspaceDirtyState(
    `registration-operations-${leadId}`,
    hasApplicantRegistrationDraft({
      issueFormOpen,
      registrationTemplateId,
      seriesId,
      checklistTemplateId,
      reason,
      correctionFields,
      newExpiry,
      initialNewExpiry,
      reissueDays,
      initialReissueDays,
      paymentReference,
      overrideReadiness,
      documentReasonByKey,
      documentFileByKey,
      documentValidUntilByKey,
    })
  );

  const [issue, issueState] = useIssueAdmissionCrmRegistrationApplicationMutation();

  const [returnForCorrection, correctionState] =
    useReturnAdmissionCrmRegistrationForCorrectionMutation();

  const [verify, verifyState] = useVerifyAdmissionCrmRegistrationMutation();

  const [extend, extendState] = useExtendAdmissionCrmRegistrationMutation();

  const [revoke, revokeState] = useRevokeAdmissionCrmRegistrationMutation();

  const [reissue, reissueState] = useReissueAdmissionCrmRegistrationMutation();

  const [recordPayment, paymentState] = useRecordAdmissionCrmRegistrationPaymentReferenceMutation();

  const [waiveFee, waiveFeeState] = useWaiveAdmissionCrmRegistrationFeeMutation();

  const [assignChecklist, assignState] = useAssignAdmissionCrmDocumentChecklistMutation();

  const [reviewDocument, reviewState] = useReviewAdmissionCrmApplicantDocumentMutation();

  const [markOriginalSeen, originalState] = useConfirmAdmissionCrmDocumentOriginalSeenMutation();

  const [waiveDocument, waiveDocumentState] = useWaiveAdmissionCrmApplicantDocumentMutation();

  const [confirmReadiness, readinessState] = useConfirmAdmissionCrmDocumentReadinessMutation();

  const [uploadDocument, uploadState] = useUploadAdmissionCrmRegistrationDocumentMutation();

  const allFieldKeys = useMemo(
    () =>
      registration?.sections.flatMap((section) => section.fields.map((field) => field.key)) || [],
    [registration]
  );

  const checklist = checklistQuery.data;

  const isRegistrationBusy = [
    correctionState,
    verifyState,
    extendState,
    revokeState,
    reissueState,
    paymentState,
    waiveFeeState,
  ].some((state) => state.isLoading);

  const perform = async (
    action: () => Promise<unknown>,
    success: string,
    clearSharedReason = false
  ) => {
    try {
      await action();
      if (clearSharedReason) setReason('');
      shikshaMitraToast.success({ message: success });
      return true;
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error, 'Unable to complete the action.') });
      return false;
    }
  };

  const closeIssueForm = () => {
    setIssueFormOpen(false);
    setRegistrationTemplateId('');
    setSeriesId('');
    setAccessMode(AdmissionCrmRegistrationAccessMode.Online);
  };

  const clearDocumentReason = (requirementKey: string) => {
    setDocumentReasonByKey((current) => {
      const next = { ...current };
      delete next[requirementKey];
      return next;
    });
  };

  return {
    state: {
      allFieldKeys,
      accessMode,
      checklist,
      checklistTemplateId,
      correctionFields,
      documentFileByKey,
      documentReasonByKey,
      documentValidUntilByKey,
      extend,
      initialNewExpiry,
      initialReissueDays,
      leadId,
      newExpiry,
      overrideReadiness,
      paymentReference,
      reason,
      registration,
      registrationTemplateId,
      reissue,
      reissueDays,
      returnForCorrection,
      reviewDocument,
      revoke,
      seriesId,
      verify,
    },
    actions: {
      assignChecklist,
      assignState,
      clearDocumentReason,
      closeIssueForm,
      confirmReadiness,
      issue,
      issueFormOpen,
      issueState,
      markOriginalSeen,
      perform,
      readinessState,
      recordPayment,
      setChecklistTemplateId,
      setAccessMode,
      setCorrectionFields,
      setDocumentFileByKey,
      setDocumentReasonByKey,
      setDocumentValidUntilByKey,
      setIssueFormOpen,
      setNewExpiry,
      setOverrideReadiness,
      setPaymentReference,
      setReason,
      setRegistrationTemplateId,
      setReissueDays,
      setSeriesId,
      uploadDocument,
      uploadState,
      waiveDocument,
      waiveDocumentState,
      waiveFee,
      waiveFeeState,
    },
    meta: {
      canAssignDocumentChecklist,
      canConfirmAdmissionReadiness,
      canConfirmOriginalSeen,
      canIssueRegistration,
      canManageRegistrationLinks,
      canUploadDocuments,
      canVerifyRegistration,
      canWaiveDocuments,
      canWaiveRegistrationFee,
      checklistQuery,
      checklistTemplatesQuery,
      correctionState,
      extendState,
      isRegistrationBusy,
      originalState,
      paymentState,
      registrationQuery,
      readinessQuery,
      reissueState,
      reviewState,
      revokeState,
      seriesQuery,
      templatesQuery,
      verifyState,
    },
  };
}

export type ApplicantRegistrationController = ReturnType<typeof useApplicantRegistrationController>;
