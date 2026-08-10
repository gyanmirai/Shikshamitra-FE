'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import {
  Add,
  Send,
  Gavel,
  Cancel,
  SyncAlt,
  Approval,
  CheckCircle,
  HourglassTop,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmSeatOfferType,
  AdmissionCrmSeatPoolStatus,
  AdmissionCrmWaitlistStatus,
  AdmissionCrmSeatOfferStatus,
  useGetAdmissionCrmWaitlistQuery,
  useGetAdmissionCrmSeatPoolsQuery,
  useGetAdmissionCrmSeatOffersQuery,
  AdmissionCrmStructuredReviewStatus,
  AdmissionCrmAdmissionDecisionStatus,
  type CreateAdmissionCrmSeatOfferDto,
  useIssueAdmissionCrmSeatOfferMutation,
  useCreateAdmissionCrmSeatOfferMutation,
  useExpireAdmissionCrmSeatOfferMutation,
  useRevokeAdmissionCrmSeatOfferMutation,
  useSubmitAdmissionCrmSeatOfferMutation,
  useGetAdmissionCrmWaitlistHistoryQuery,
  useApproveAdmissionCrmSeatOfferMutation,
  useRespondAdmissionCrmSeatOfferMutation,
  useAddAdmissionCrmLeadToWaitlistMutation,
  useSupersedeAdmissionCrmSeatOfferMutation,
  useGetAdmissionCrmReviewConfigurationQuery,
  useRunAdmissionCrmWaitlistPromotionMutation,
  useWithdrawAdmissionCrmWaitlistEntryMutation,
  useGetAdmissionCrmStructuredReviewByLeadQuery,
  useRecordAdmissionCrmAdmissionDecisionMutation,
  useGetAdmissionCrmAdmissionDecisionHistoryQuery,
  usePrepareAdmissionCrmWaitlistPromotionMutation,
  useUpdateAdmissionCrmWaitlistGovernanceMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { ApplicantStructuredReview } from './applicant-structured-review';
import { admissionCrmActionPermissions } from './admission-action-permissions';
import { useApplicantWorkspaceDirtyState } from './applicant-workspace-dirty-context';
import {
  ApplicantSwitchRow,
  ApplicantEmptyState,
  ApplicantActionPanel,
} from './applicant-workspace-primitives';

type Props = {
  leadId: string;
  academicYearId: string;
};

const offerStatusLabels: Record<AdmissionCrmSeatOfferStatus, string> = {
  [AdmissionCrmSeatOfferStatus.Draft]: 'Draft',
  [AdmissionCrmSeatOfferStatus.ApprovalPending]: 'Approval pending',
  [AdmissionCrmSeatOfferStatus.Approved]: 'Approved',
  [AdmissionCrmSeatOfferStatus.Issued]: 'Issued',
  [AdmissionCrmSeatOfferStatus.Accepted]: 'Accepted',
  [AdmissionCrmSeatOfferStatus.Declined]: 'Declined',
  [AdmissionCrmSeatOfferStatus.Expired]: 'Expired',
  [AdmissionCrmSeatOfferStatus.Revoked]: 'Revoked',
  [AdmissionCrmSeatOfferStatus.Superseded]: 'Superseded',
  [AdmissionCrmSeatOfferStatus.Cancelled]: 'Cancelled',
  [AdmissionCrmSeatOfferStatus.Opened]: 'Opened',
};

const decisionStatusLabels: Record<AdmissionCrmAdmissionDecisionStatus, string> = {
  [AdmissionCrmAdmissionDecisionStatus.Pending]: 'Pending',
  [AdmissionCrmAdmissionDecisionStatus.Approved]: 'Approved',
  [AdmissionCrmAdmissionDecisionStatus.Rejected]: 'Rejected',
  [AdmissionCrmAdmissionDecisionStatus.Waitlisted]: 'Waitlisted',
  [AdmissionCrmAdmissionDecisionStatus.Withdrawn]: 'Withdrawn',
  [AdmissionCrmAdmissionDecisionStatus.Expired]: 'Expired',
  [AdmissionCrmAdmissionDecisionStatus.Cancelled]: 'Cancelled',
};

const waitlistStatusLabels: Record<AdmissionCrmWaitlistStatus, string> = {
  [AdmissionCrmWaitlistStatus.Active]: 'Active',
  [AdmissionCrmWaitlistStatus.Promoted]: 'Promoted',
  [AdmissionCrmWaitlistStatus.Accepted]: 'Accepted',
  [AdmissionCrmWaitlistStatus.Withdrawn]: 'Withdrawn',
  [AdmissionCrmWaitlistStatus.Expired]: 'Expired',
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

function WaitlistHistory({ entryId }: { entryId: string }) {
  const history = useGetAdmissionCrmWaitlistHistoryQuery({ entryId });
  if (!history.data?.length) return null;
  const latest = history.data[history.data.length - 1];
  return (
    <Typography variant="caption" color="text.secondary">
      Last change: {latest.reason} · {new Date(latest.occurredAt).toLocaleString()}
    </Typography>
  );
}

export function ApplicantFinalAdmissionOperations({ leadId, academicYearId }: Props) {
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

  return (
    <Box component="section">
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Box>
            <Typography variant="subtitle2">Final Admission and Seats</Typography>
            <Typography variant="caption" color="text.secondary">
              Govern offers, reservations, waitlist movement, and final decisions.
            </Typography>
          </Box>
          {selectedPool ? (
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip size="small" label={`${selectedPool.remainingCapacity} remaining`} />
              <Chip size="small" label={`${selectedPool.reservedSeats} reserved`} />
              <Chip size="small" label={`${selectedPool.acceptedSeats} accepted`} />
              {selectedPool.isOverCapacity ? (
                <Chip size="small" color="error" label="Over capacity" />
              ) : null}
            </Stack>
          ) : null}
        </Stack>
        {anyLoading ? <LinearProgress /> : null}
        {finalAdmissionQueriesFailed ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  poolsQuery.refetch();
                  offersQuery.refetch();
                  decisionsQuery.refetch();
                }}
              >
                Retry
              </Button>
            }
          >
            Offer and seat details could not be loaded. Retry before taking a final-admission
            action.
          </Alert>
        ) : null}
        {!poolsQuery.isFetching && !poolsQuery.isError && !pools.length ? (
          <Alert severity="warning">
            Configure an active class placement plan before creating offers.
          </Alert>
        ) : null}
        {waitlistQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => waitlistQuery.refetch()}>
                Retry
              </Button>
            }
          >
            Waitlist details could not be loaded. Retry before taking a waitlist action.
          </Alert>
        ) : null}

        <ApplicantStructuredReview leadId={leadId} academicYearId={academicYearId} />

        {canManageOffers && !finalAdmissionQueriesFailed && !offerFormOpen ? (
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            disabled={poolsQuery.isError || offersQuery.isError || pools.length === 0}
            onClick={() => setOfferFormOpen(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Create offer
          </Button>
        ) : canManageOffers && !finalAdmissionQueriesFailed ? (
          <ApplicantActionPanel>
            <Stack spacing={1.25}>
              <TextField
                select
                size="small"
                label="Class Placement Plan"
                value={seatPoolId}
                onChange={(event) => setSeatPoolId(event.target.value)}
              >
                {pools.map((pool) => (
                  <MenuItem key={pool.id} value={pool.id}>
                    {pool.code} - {pool.name} ({pool.remainingCapacity} remaining)
                  </MenuItem>
                ))}
              </TextField>

              <Divider />
              <Typography variant="subtitle2">Offer Preparation</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
                  gap: 1,
                }}
              >
                <TextField
                  select
                  size="small"
                  label="Offer type"
                  value={offerType}
                  onChange={(event) => setOfferType(Number(event.target.value))}
                >
                  <MenuItem value={AdmissionCrmSeatOfferType.Provisional}>Provisional</MenuItem>
                  <MenuItem value={AdmissionCrmSeatOfferType.Final}>Final</MenuItem>
                </TextField>
                <TextField
                  size="small"
                  label="Language"
                  value={offerLanguage}
                  onChange={(event) => setOfferLanguage(event.target.value)}
                />
                <TextField
                  size="small"
                  type="datetime-local"
                  label="Valid from"
                  value={validFrom}
                  onChange={(event) => setValidFrom(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  size="small"
                  type="datetime-local"
                  label="Valid until"
                  value={validUntil}
                  onChange={(event) => setValidUntil(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
              <TextField
                size="small"
                multiline
                minRows={2}
                label="Offer conditions"
                value={offerTerms}
                onChange={(event) => setOfferTerms(event.target.value)}
              />
              <LoadingButton
                variant="contained"
                startIcon={<Add />}
                loading={createOfferState.isLoading}
                disabled={
                  poolsQuery.isError ||
                  offersQuery.isError ||
                  !seatPoolId ||
                  !offerTerms.trim() ||
                  new Date(validUntil) <= new Date(validFrom)
                }
                onClick={() =>
                  perform(
                    () => createOffer({ leadId, body: offerPayload() }).unwrap(),
                    'Seat offer draft created.'
                  )
                }
              >
                Create Offer Draft
              </LoadingButton>

              <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
                {canOverrideSeatCapacity ? (
                  <>
                    <ApplicantSwitchRow
                      label="Enable capacity override"
                      description="Allow this offer to exceed configured seat capacity."
                      checked={capacityOverride}
                      onChange={setCapacityOverride}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      label="Capacity override reason"
                      value={capacityOverrideReason}
                      disabled={!capacityOverride}
                      onChange={(event) => setCapacityOverrideReason(event.target.value)}
                    />
                  </>
                ) : null}
                <TextField
                  size="small"
                  fullWidth
                  label="Response or revocation reason"
                  value={responseReason}
                  onChange={(event) => setResponseReason(event.target.value)}
                />
              </Stack>
              <Button
                size="small"
                onClick={() => setOfferFormOpen(false)}
                sx={{ alignSelf: 'flex-start' }}
              >
                Cancel offer preparation
              </Button>
            </Stack>
          </ApplicantActionPanel>
        ) : null}

        <Stack spacing={1}>
          {offers.map((offer) => (
            <Paper key={offer.id} variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
              <Stack spacing={0.75}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  gap={1}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {offer.offerNumber} - v{offer.version}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expires {new Date(offer.validUntil).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color={
                      offer.status === AdmissionCrmSeatOfferStatus.Accepted
                        ? 'success'
                        : offer.status === AdmissionCrmSeatOfferStatus.ApprovalPending
                          ? 'warning'
                          : 'default'
                    }
                    label={offerStatusLabels[offer.status]}
                  />
                </Stack>
                {offer.reservation ? (
                  <Typography variant="caption" color="text.secondary">
                    Reservation {offer.reservation.status} - expires{' '}
                    {new Date(offer.reservation.expiresAt).toLocaleString()}
                  </Typography>
                ) : null}
                {!finalAdmissionQueriesFailed ? (
                  <Stack direction="row" gap={1} flexWrap="wrap">
                  {offer.status === AdmissionCrmSeatOfferStatus.Draft && canManageOffers ? (
                    <LoadingButton
                      size="small"
                      variant="outlined"
                      startIcon={<Send />}
                      loading={submitState.isLoading}
                      onClick={() =>
                        perform(
                          () => submitOffer({ offerId: offer.id }).unwrap(),
                          'Offer submitted for approval.'
                        )
                      }
                    >
                      Submit
                    </LoadingButton>
                  ) : null}
                  {offer.status === AdmissionCrmSeatOfferStatus.ApprovalPending &&
                  canApproveOffers ? (
                    <LoadingButton
                      size="small"
                      variant="outlined"
                      startIcon={<Approval />}
                      loading={approveState.isLoading}
                      onClick={() =>
                        perform(
                          () => approveOffer({ offerId: offer.id }).unwrap(),
                          'Offer approved.'
                        )
                      }
                    >
                      Approve
                    </LoadingButton>
                  ) : null}
                  {offer.status === AdmissionCrmSeatOfferStatus.Approved && canManageOffers ? (
                    <LoadingButton
                      size="small"
                      variant="contained"
                      startIcon={<Gavel />}
                      loading={issueState.isLoading}
                      disabled={
                        canOverrideSeatCapacity &&
                        capacityOverride &&
                        !capacityOverrideReason.trim()
                      }
                      onClick={() =>
                        perform(
                          () =>
                            issueOffer({
                              offerId: offer.id,
                              body: {
                                capacityOverride: canOverrideSeatCapacity && capacityOverride,
                                capacityOverrideReason:
                                  canOverrideSeatCapacity && capacityOverride
                                    ? capacityOverrideReason.trim() || undefined
                                    : undefined,
                              },
                            }).unwrap(),
                          'Offer issued and seat reserved.'
                        )
                      }
                    >
                      Issue
                    </LoadingButton>
                  ) : null}
                  {[
                    AdmissionCrmSeatOfferStatus.Issued,
                    AdmissionCrmSeatOfferStatus.Opened,
                  ].includes(offer.status) && canManageOffers ? (
                    <>
                      <LoadingButton
                        size="small"
                        color="success"
                        variant="contained"
                        startIcon={<CheckCircle />}
                        loading={respondState.isLoading}
                        onClick={() =>
                          perform(
                            () =>
                              respondOffer({
                                offerId: offer.id,
                                action: 'accept',
                                body: { responseSource: 'Staff recorded' },
                              }).unwrap(),
                            'Offer acceptance recorded.'
                          )
                        }
                      >
                        Accept
                      </LoadingButton>
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        color="error"
                        loading={respondState.isLoading}
                        onClick={() =>
                          perform(
                            () =>
                              respondOffer({
                                offerId: offer.id,
                                action: 'decline',
                                body: {
                                  responseSource: 'Staff recorded',
                                  reason: responseReason.trim() || undefined,
                                },
                              }).unwrap(),
                            'Offer decline recorded.'
                          )
                        }
                      >
                        Decline
                      </LoadingButton>
                    </>
                  ) : null}
                  {[
                    AdmissionCrmSeatOfferStatus.Approved,
                    AdmissionCrmSeatOfferStatus.Issued,
                    AdmissionCrmSeatOfferStatus.Opened,
                  ].includes(offer.status) && canManageOffers ? (
                    <LoadingButton
                      size="small"
                      variant="text"
                      color="error"
                      loading={revokeState.isLoading}
                      disabled={!responseReason.trim()}
                      onClick={() =>
                        perform(
                          () =>
                            revokeOffer({
                              offerId: offer.id,
                              reason: responseReason.trim(),
                            }).unwrap(),
                          'Offer revoked.'
                        )
                      }
                    >
                      Revoke
                    </LoadingButton>
                  ) : null}
                  {[
                    AdmissionCrmSeatOfferStatus.Issued,
                    AdmissionCrmSeatOfferStatus.Opened,
                  ].includes(offer.status) &&
                  new Date(offer.validUntil) <= new Date() &&
                  canManageOffers ? (
                    <LoadingButton
                      size="small"
                      variant="text"
                      startIcon={<HourglassTop />}
                      loading={expireState.isLoading}
                      onClick={() =>
                        perform(
                          () => expireOffer({ offerId: offer.id }).unwrap(),
                          'Offer expired and seat released.'
                        )
                      }
                    >
                      Expire
                    </LoadingButton>
                  ) : null}
                  {[
                    AdmissionCrmSeatOfferStatus.Draft,
                    AdmissionCrmSeatOfferStatus.ApprovalPending,
                    AdmissionCrmSeatOfferStatus.Approved,
                    AdmissionCrmSeatOfferStatus.Issued,
                    AdmissionCrmSeatOfferStatus.Opened,
                  ].includes(offer.status) && canManageOffers ? (
                    <LoadingButton
                      size="small"
                      variant="text"
                      startIcon={<SyncAlt />}
                      loading={supersedeState.isLoading}
                      disabled={
                        !responseReason.trim() ||
                        !seatPoolId ||
                        new Date(validUntil) <= new Date(validFrom)
                      }
                      onClick={() =>
                        perform(
                          () =>
                            supersedeOffer({
                              offerId: offer.id,
                              body: { ...offerPayload(), reason: responseReason.trim() },
                            }).unwrap(),
                          'Replacement offer draft created and prior version preserved.'
                        )
                      }
                    >
                      Supersede
                    </LoadingButton>
                  ) : null}
                  </Stack>
                ) : null}
              </Stack>
            </Paper>
          ))}
          {!offersQuery.isFetching && !offersQuery.isError && !offers.length ? (
            <ApplicantEmptyState
              title="No seat offers"
              description="Create an offer draft after selecting an eligible class placement plan."
            />
          ) : null}
        </Stack>

        <Divider />
        <Stack direction="row" alignItems="center">
          <Typography variant="subtitle2" sx={{ flex: 1 }}>
            Waitlist
          </Typography>
          {canManageWaitlist && !finalAdmissionQueriesFailed ? (
            <LoadingButton
              size="small"
              loading={runPromotionState.isLoading}
              disabled={
                waitlistQuery.isError ||
                !seatPoolId ||
                !leadWaitlistEntries.some(
                  (entry) => entry.status === AdmissionCrmWaitlistStatus.Active
                )
              }
              onClick={() =>
                perform(
                  () =>
                    runWaitlistPromotion({
                      academicYearId,
                      seatPoolId,
                      maximumOffers: Math.max(1, selectedPool?.remainingCapacity || 1),
                      offer: offerPayload(),
                    }).unwrap(),
                  'Capacity-aware waitlist promotion drafts prepared.'
                )
              }
            >
              Prepare next offers
            </LoadingButton>
          ) : null}
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
          {canManageWaitlist && !finalAdmissionQueriesFailed ? (
            <>
              <TextField
                size="small"
                type="number"
                label="Priority score"
                value={waitlistPriority}
                onChange={(event) => setWaitlistPriority(Number(event.target.value))}
              />
              <LoadingButton
                variant="outlined"
                loading={addWaitlistState.isLoading}
                disabled={waitlistQuery.isError || !seatPoolId}
                onClick={() =>
                  perform(
                    () =>
                      addToWaitlist({
                        leadId,
                        body: { seatPoolId, priorityScore: waitlistPriority },
                      }).unwrap(),
                    'Applicant added to the waitlist.'
                  )
                }
              >
                Add to Waitlist
              </LoadingButton>
              <ApplicantSwitchRow
                label="Enable rank override"
                checked={priorityOverride}
                onChange={setPriorityOverride}
              />
              <TextField
                size="small"
                fullWidth
                label="Priority override reason"
                value={priorityOverrideReason}
                disabled={!priorityOverride}
                onChange={(event) => setPriorityOverrideReason(event.target.value)}
              />
            </>
          ) : null}
        </Stack>
        {leadWaitlistEntries.map((entry) => (
          <Stack
            key={entry.id}
            direction={{ xs: 'column', sm: 'row' }}
            gap={1}
            alignItems={{ sm: 'center' }}
          >
            <Chip
              size="small"
              label={`#${entry.currentPosition || '-'} ${waitlistStatusLabels[entry.status]}`}
            />
            <Typography variant="body2">Priority {entry.priorityScore}</Typography>
            {entry.isProtected ? <Chip size="small" color="info" label="Protected" /> : null}
            {entry.promotionPaused ? (
              <Chip size="small" color="warning" label="Promotion paused" />
            ) : null}
            {entry.status === AdmissionCrmWaitlistStatus.Active &&
            canManageWaitlist &&
            !finalAdmissionQueriesFailed &&
            !waitlistQuery.isError ? (
              <>
                <LoadingButton
                  size="small"
                  variant="outlined"
                  loading={promotionState.isLoading}
                  disabled={priorityOverride && !priorityOverrideReason.trim()}
                  onClick={() =>
                    perform(
                      () =>
                        preparePromotion({
                          entryId: entry.id,
                          body: {
                            ...offerPayload(),
                            overridePriority: priorityOverride,
                            overrideReason: priorityOverrideReason.trim() || undefined,
                          },
                        }).unwrap(),
                      'Waitlist promotion offer prepared.'
                    )
                  }
                >
                  Prepare Promotion
                </LoadingButton>
                <LoadingButton
                  size="small"
                  variant="text"
                  color="error"
                  loading={withdrawState.isLoading}
                  disabled={!responseReason.trim()}
                  onClick={() =>
                    perform(
                      () =>
                        withdrawWaitlist({
                          entryId: entry.id,
                          reason: responseReason.trim(),
                        }).unwrap(),
                      'Waitlist entry withdrawn.'
                    )
                  }
                >
                  Withdraw
                </LoadingButton>
                <LoadingButton
                  size="small"
                  loading={governanceState.isLoading}
                  disabled={!responseReason.trim()}
                  onClick={() =>
                    perform(
                      () =>
                        updateWaitlistGovernance({
                          entryId: entry.id,
                          priorityScore: entry.priorityScore,
                          isProtected: !entry.isProtected,
                          promotionPaused: entry.promotionPaused,
                          reason: responseReason.trim(),
                        }).unwrap(),
                      entry.isProtected
                        ? 'Waitlist protection removed.'
                        : 'Waitlist position protected.'
                    )
                  }
                >
                  {entry.isProtected ? 'Unprotect' : 'Protect'}
                </LoadingButton>
                <LoadingButton
                  size="small"
                  loading={governanceState.isLoading}
                  disabled={!responseReason.trim()}
                  onClick={() =>
                    perform(
                      () =>
                        updateWaitlistGovernance({
                          entryId: entry.id,
                          priorityScore: entry.priorityScore,
                          isProtected: entry.isProtected,
                          promotionPaused: !entry.promotionPaused,
                          reason: responseReason.trim(),
                        }).unwrap(),
                      entry.promotionPaused
                        ? 'Waitlist promotion resumed.'
                        : 'Waitlist promotion paused.'
                    )
                  }
                >
                  {entry.promotionPaused ? 'Resume' : 'Pause'}
                </LoadingButton>
              </>
            ) : null}
            <WaitlistHistory entryId={entry.id} />
          </Stack>
        ))}

        <Divider />
        <Typography variant="subtitle2">Final Decision</Typography>
        {structuredReviewBlocksDecision ? (
          <Alert severity={structuredReviewUnavailable ? 'error' : 'warning'}>
            {structuredReviewUnavailable
              ? 'Review readiness could not be verified. Retry the structured review before recording a decision.'
              : 'Complete the required structured review before approving, rejecting, or waitlisting this applicant.'}
          </Alert>
        ) : null}
        {canMakeAdmissionDecision && !finalAdmissionQueriesFailed ? (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              <TextField
                select
                size="small"
                label="Decision"
                value={decisionStatus}
                onChange={(event) => setDecisionStatus(Number(event.target.value))}
              >
                {Object.entries(decisionStatusLabels)
                  .filter(
                    ([value]) =>
                      Number(value) !== AdmissionCrmAdmissionDecisionStatus.Pending &&
                      (Number(value) !== AdmissionCrmAdmissionDecisionStatus.Cancelled ||
                        canCancelAdmission)
                  )
                  .map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Accepted offer"
                value={decisionOfferId}
                onChange={(event) => setDecisionOfferId(event.target.value)}
              >
                <MenuItem value="">No offer selected</MenuItem>
                {offers.map((offer) => (
                  <MenuItem key={offer.id} value={offer.id}>
                    {offer.offerNumber} - {offerStatusLabels[offer.status]}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <TextField
              size="small"
              fullWidth
              label="Decision reason"
              value={decisionReason}
              onChange={(event) => setDecisionReason(event.target.value)}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
              {canOverrideEligibility ? (
                <ApplicantSwitchRow
                  label="Enable governed override"
                  description="Record an exception to the configured admission decision rules."
                  checked={decisionOverride}
                  onChange={setDecisionOverride}
                />
              ) : null}
              {canOverrideEligibility ? (
                <TextField
                  size="small"
                  fullWidth
                  label="Override reason"
                  value={decisionOverrideReason}
                  disabled={!decisionOverride}
                  onChange={(event) => setDecisionOverrideReason(event.target.value)}
                />
              ) : null}
              <LoadingButton
                variant="contained"
                startIcon={
                  decisionStatus === AdmissionCrmAdmissionDecisionStatus.Cancelled ? (
                    <Cancel />
                  ) : (
                    <Gavel />
                  )
                }
                loading={decisionState.isLoading}
                disabled={
                  !decisionReason.trim() ||
                  (decisionOverride && !decisionOverrideReason.trim()) ||
                  structuredReviewBlocksDecision ||
                  (decisionStatus === AdmissionCrmAdmissionDecisionStatus.Cancelled &&
                    (!decisionOfferId || !canCancelAdmission))
                }
                onClick={() =>
                  perform(
                    () =>
                      recordDecision({
                        leadId,
                        body: {
                          status: decisionStatus,
                          seatPoolId: seatPoolId || undefined,
                          offerId: decisionOfferId || undefined,
                          reason: decisionReason.trim(),
                          overrideUsed: decisionOverride,
                          overrideReason: decisionOverrideReason.trim() || undefined,
                        },
                      }).unwrap(),
                    'Admission decision recorded.'
                  )
                }
              >
                Record Decision
              </LoadingButton>
            </Stack>
          </>
        ) : null}
        {(decisionsQuery.data || []).length ? (
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              Decision history
            </Typography>
            {(decisionsQuery.data || []).map((decision) => (
              <Stack
                key={decision.id}
                direction={{ xs: 'column', sm: 'row' }}
                gap={1}
                alignItems={{ sm: 'center' }}
              >
                <Chip size="small" label={decisionStatusLabels[decision.status]} />
                <Typography variant="body2">{decision.reason}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {decision.decidedAt ? new Date(decision.decidedAt).toLocaleString() : ''}
                  {decision.overrideUsed ? ' - override' : ''}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
