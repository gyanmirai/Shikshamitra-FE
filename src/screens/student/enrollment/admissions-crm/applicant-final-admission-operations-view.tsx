'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Add, Gavel, Cancel } from '@mui/icons-material';

import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import {
  AdmissionCrmWaitlistStatus,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmAdmissionDecisionStatus,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

import { ApplicantStructuredReview } from './applicant-structured-review';

import { ApplicantSwitchRow } from './applicant-workspace-primitives';

import { useApplicantFinalAdmissionWorkspace } from './applicant-final-admission-operations-context';

import { ApplicantWaitlistEntryPanel } from './applicant-final-admission-operations-section-3';

import { ApplicantSeatOffersPanel } from './applicant-final-admission-operations-section-2';

import { ApplicantOfferPreparationPanel } from './applicant-final-admission-operations-section-1';
import { formatEnrollmentDate } from './enrollment-display';

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

export function ApplicantFinalAdmissionView() {
  const { state: controllerState, actions, meta } = useApplicantFinalAdmissionWorkspace();
  const {
    academicYearId,
    addToWaitlist,
    addWaitlistState,
    anyLoading,
    approveOffer,
    approveState,
    canApproveOffers,
    canCancelAdmission,
    canMakeAdmissionDecision,
    canManageOffers,
    canManageWaitlist,
    canOverrideEligibility,
    canOverrideSeatCapacity,
    capacityOverride,
    capacityOverrideReason,
    createOffer,
    createOfferState,
    decisionOfferId,
    decisionOverride,
    decisionOverrideReason,
    decisionReason,
    decisionState,
    decisionStatus,
    decisionsQuery,
    expireOffer,
    expireState,
    finalAdmissionQueriesFailed,
    governanceState,
    issueOffer,
    issueState,
    leadId,
    leadWaitlistEntries,
    offerFormOpen,
    offerLanguage,
    offerPayload,
    offerTerms,
    offerType,
    offers,
    offersQuery,
    perform,
    pools,
    poolsQuery,
    preparePromotion,
    priorityOverride,
    priorityOverrideReason,
    promotionState,
    recordDecision,
    respondOffer,
    respondState,
    responseReason,
    revokeOffer,
    revokeState,
    runPromotionState,
    runWaitlistPromotion,
    seatPoolId,
    selectedPool,
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
    structuredReviewBlocksDecision,
    structuredReviewUnavailable,
    submitOffer,
    submitState,
    supersedeOffer,
    supersedeState,
    updateWaitlistGovernance,
    validFrom,
    validUntil,
    waitlistPriority,
    waitlistQuery,
    withdrawState,
    withdrawWaitlist,
  } = { ...controllerState, ...actions, ...meta };

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
        {anyLoading ? <LinearProgress aria-label="Loading final admission readiness" /> : null}
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
          <ApplicantOfferPreparationPanel />
        ) : null}

        <ApplicantSeatOffersPanel />

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
          <ApplicantWaitlistEntryPanel />
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
                  {decision.decidedAt ? formatEnrollmentDate(decision.decidedAt, true) : ''}
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
