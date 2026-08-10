'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';

import { useMemo, useState, useEffect } from 'react';

import { shikshaMitraToast } from 'src/components/toast';

import { hasGrantedPermission } from 'src/utils/permissions';

import {
  AdmissionCrmSeatOfferType,
  AdmissionCrmSeatPoolStatus,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmAdmissionDecisionStatus,
  type CreateAdmissionCrmSeatOfferDto,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

import {
  useGetAdmissionCrmWaitlistQuery,
  useGetAdmissionCrmSeatPoolsQuery,
  useGetAdmissionCrmSeatOffersQuery,
  useIssueAdmissionCrmSeatOfferMutation,
  useCreateAdmissionCrmSeatOfferMutation,
  useExpireAdmissionCrmSeatOfferMutation,
  useRevokeAdmissionCrmSeatOfferMutation,
  useSubmitAdmissionCrmSeatOfferMutation,
  useApproveAdmissionCrmSeatOfferMutation,
  useRespondAdmissionCrmSeatOfferMutation,
  useAddAdmissionCrmLeadToWaitlistMutation,
  useSupersedeAdmissionCrmSeatOfferMutation,
  useRunAdmissionCrmWaitlistPromotionMutation,
  useWithdrawAdmissionCrmWaitlistEntryMutation,
  useRecordAdmissionCrmAdmissionDecisionMutation,
  useGetAdmissionCrmAdmissionDecisionHistoryQuery,
  usePrepareAdmissionCrmWaitlistPromotionMutation,
  useUpdateAdmissionCrmWaitlistGovernanceMutation,
} from 'src/redux/student/admissions-crm/final-admission-api';

import { AdmissionCrmStructuredReviewStatus } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  useGetAdmissionCrmReviewConfigurationQuery,
  useGetAdmissionCrmStructuredReviewByLeadQuery,
} from 'src/redux/student/admissions-crm/communication-exams-events-api';

import { admissionCrmActionPermissions } from './admission-action-permissions';

import { useApplicantWorkspaceDirtyState } from './applicant-workspace-dirty-context';

type Props = {
  leadId: string;
  academicYearId: string;
};

const dateTimeLocal = (daysFromNow: number) => {
  const value = new Date();
  value.setDate(value.getDate() + daysFromNow);
  return value.toISOString().slice(0, 16);
};

const readError = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.errorCode || data?.detail || fallback;
  }
  return fallback;
};

export function useApplicantFinalAdmissionController({ leadId, academicYearId }: Props) {
  const permissions = useSelector((root: RootState) => root.auth.permissions);

  const canManageOffers = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.manageOffers
  );

  const canApproveOffers = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.approveOffers
  );

  const canManageWaitlist = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.manageWaitlist
  );

  const canMakeAdmissionDecision = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.makeAdmissionDecision
  );

  const canOverrideSeatCapacity = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.overrideSeatCapacity
  );

  const canCancelAdmission = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.cancelAdmission
  );

  const canOverrideEligibility = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.overrideEligibility
  );

  const canViewStructuredReviews = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.viewStructuredReviews
  );

  const [seatPoolId, setSeatPoolId] = useState('');

  const [offerFormOpen, setOfferFormOpen] = useState(false);

  const [offerType, setOfferType] = useState(AdmissionCrmSeatOfferType.Final);

  const [offerLanguage, setOfferLanguage] = useState('en');

  const [validFrom, setValidFrom] = useState(() => dateTimeLocal(0));

  const [validUntil, setValidUntil] = useState(() => dateTimeLocal(7));

  const [offerTerms, setOfferTerms] = useState('Admission is subject to submitted records.');

  const [capacityOverride, setCapacityOverride] = useState(false);

  const [capacityOverrideReason, setCapacityOverrideReason] = useState('');

  const [responseReason, setResponseReason] = useState('');

  const [waitlistPriority, setWaitlistPriority] = useState(0);

  const [priorityOverride, setPriorityOverride] = useState(false);

  const [priorityOverrideReason, setPriorityOverrideReason] = useState('');

  const [decisionStatus, setDecisionStatus] = useState(
    AdmissionCrmAdmissionDecisionStatus.Approved
  );

  const [decisionOfferId, setDecisionOfferId] = useState('');

  const [decisionReason, setDecisionReason] = useState('');

  const [decisionOverride, setDecisionOverride] = useState(false);

  const [decisionOverrideReason, setDecisionOverrideReason] = useState('');

  useApplicantWorkspaceDirtyState(`offer-preparation-${leadId}`, offerFormOpen);

  const poolsQuery = useGetAdmissionCrmSeatPoolsQuery({
    academicYearId,
    status: AdmissionCrmSeatPoolStatus.Active,
    maxResultCount: 100,
  });

  const offersQuery = useGetAdmissionCrmSeatOffersQuery({
    academicYearId,
    leadId,
    maxResultCount: 50,
  });

  const waitlistQuery = useGetAdmissionCrmWaitlistQuery({ seatPoolId }, { skip: !seatPoolId });

  const decisionsQuery = useGetAdmissionCrmAdmissionDecisionHistoryQuery({ leadId });

  const reviewConfigurationQuery = useGetAdmissionCrmReviewConfigurationQuery(
    { academicYearId },
    { skip: !canViewStructuredReviews }
  );

  const structuredReviewEnabled = reviewConfigurationQuery.data?.isEnabled === true;

  const structuredReviewQuery = useGetAdmissionCrmStructuredReviewByLeadQuery(
    { leadId },
    { skip: !canViewStructuredReviews || !structuredReviewEnabled }
  );

  const [createOffer, createOfferState] = useCreateAdmissionCrmSeatOfferMutation();

  const [submitOffer, submitState] = useSubmitAdmissionCrmSeatOfferMutation();

  const [approveOffer, approveState] = useApproveAdmissionCrmSeatOfferMutation();

  const [issueOffer, issueState] = useIssueAdmissionCrmSeatOfferMutation();

  const [respondOffer, respondState] = useRespondAdmissionCrmSeatOfferMutation();

  const [revokeOffer, revokeState] = useRevokeAdmissionCrmSeatOfferMutation();

  const [expireOffer, expireState] = useExpireAdmissionCrmSeatOfferMutation();

  const [supersedeOffer, supersedeState] = useSupersedeAdmissionCrmSeatOfferMutation();

  const [addToWaitlist, addWaitlistState] = useAddAdmissionCrmLeadToWaitlistMutation();

  const [preparePromotion, promotionState] = usePrepareAdmissionCrmWaitlistPromotionMutation();

  const [withdrawWaitlist, withdrawState] = useWithdrawAdmissionCrmWaitlistEntryMutation();

  const [updateWaitlistGovernance, governanceState] =
    useUpdateAdmissionCrmWaitlistGovernanceMutation();

  const [runWaitlistPromotion, runPromotionState] = useRunAdmissionCrmWaitlistPromotionMutation();

  const [recordDecision, decisionState] = useRecordAdmissionCrmAdmissionDecisionMutation();

  const pools = useMemo(() => poolsQuery.data?.items || [], [poolsQuery.data]);

  const offers = useMemo(() => offersQuery.data?.items || [], [offersQuery.data]);

  const selectedPool = pools.find((pool) => pool.id === seatPoolId);

  const acceptedOffers = offers.filter(
    (offer) => offer.status === AdmissionCrmSeatOfferStatus.Accepted
  );

  const leadWaitlistEntries = (waitlistQuery.data || []).filter((entry) => entry.leadId === leadId);

  const reviewRequiredForDecision = [
    AdmissionCrmAdmissionDecisionStatus.Approved,
    AdmissionCrmAdmissionDecisionStatus.Rejected,
    AdmissionCrmAdmissionDecisionStatus.Waitlisted,
  ].includes(decisionStatus);

  const structuredReviewReady =
    structuredReviewQuery.data?.status === AdmissionCrmStructuredReviewStatus.ReadyForDecision ||
    structuredReviewQuery.data?.status === AdmissionCrmStructuredReviewStatus.Closed;

  const structuredReviewUnavailable =
    canViewStructuredReviews &&
    (reviewConfigurationQuery.isError ||
      (structuredReviewEnabled && structuredReviewQuery.isError));

  const structuredReviewBlocksDecision =
    !decisionOverride &&
    reviewRequiredForDecision &&
    (structuredReviewUnavailable || (structuredReviewEnabled && !structuredReviewReady));

  useEffect(() => {
    if (!seatPoolId && pools.length) setSeatPoolId(pools[0].id);
  }, [pools, seatPoolId]);

  useEffect(() => {
    if (!decisionOfferId && acceptedOffers.length) setDecisionOfferId(acceptedOffers[0].id);
  }, [acceptedOffers, decisionOfferId]);

  const perform = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message: success });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error, 'Unable to complete the action.') });
    }
  };

  const offerPayload = (): CreateAdmissionCrmSeatOfferDto => ({
    seatPoolId,
    offerType,
    terms: { conditions: offerTerms.trim() },
    language: offerLanguage.trim() || 'en',
    validFrom: new Date(validFrom).toISOString(),
    validUntil: new Date(validUntil).toISOString(),
  });

  const anyLoading =
    poolsQuery.isFetching ||
    offersQuery.isFetching ||
    decisionsQuery.isFetching ||
    waitlistQuery.isFetching;

  const finalAdmissionQueriesFailed =
    poolsQuery.isError || offersQuery.isError || decisionsQuery.isError;

  return {
    state: {
      academicYearId,
      addToWaitlist,
      capacityOverride,
      capacityOverrideReason,
      decisionOfferId,
      decisionOverride,
      decisionOverrideReason,
      decisionReason,
      decisionStatus,
      finalAdmissionQueriesFailed,
      leadId,
      leadWaitlistEntries,
      offerFormOpen,
      offerLanguage,
      offerPayload,
      offerTerms,
      offerType,
      offers,
      pools,
      priorityOverride,
      priorityOverrideReason,
      respondOffer,
      responseReason,
      revokeOffer,
      seatPoolId,
      selectedPool,
      structuredReviewBlocksDecision,
      structuredReviewUnavailable,
      submitOffer,
      validFrom,
      validUntil,
      waitlistPriority,
    },
    actions: {
      approveOffer,
      approveState,
      createOffer,
      createOfferState,
      expireOffer,
      expireState,
      issueOffer,
      issueState,
      perform,
      preparePromotion,
      recordDecision,
      runPromotionState,
      runWaitlistPromotion,
      setCapacityOverride,
      setCapacityOverrideReason,
      setDecisionOfferId,
      setDecisionOverride,
      setDecisionOverrideReason,
      setDecisionReason,
      setDecisionStatus,
      setOfferFormOpen,
      setOfferLanguage,
      setOfferTerms,
      setOfferType,
      setPriorityOverride,
      setPriorityOverrideReason,
      setResponseReason,
      setSeatPoolId,
      setValidFrom,
      setValidUntil,
      setWaitlistPriority,
      supersedeOffer,
      supersedeState,
      updateWaitlistGovernance,
      withdrawState,
      withdrawWaitlist,
    },
    meta: {
      addWaitlistState,
      anyLoading,
      canApproveOffers,
      canCancelAdmission,
      canMakeAdmissionDecision,
      canManageOffers,
      canManageWaitlist,
      canOverrideEligibility,
      canOverrideSeatCapacity,
      decisionState,
      decisionsQuery,
      governanceState,
      offersQuery,
      poolsQuery,
      promotionState,
      respondState,
      revokeState,
      submitState,
      waitlistQuery,
    },
  };
}

export type ApplicantFinalAdmissionController = ReturnType<
  typeof useApplicantFinalAdmissionController
>;
