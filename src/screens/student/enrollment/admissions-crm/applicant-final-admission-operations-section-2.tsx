'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Send, Gavel, SyncAlt, Approval, CheckCircle, HourglassTop } from '@mui/icons-material';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

import { AdmissionCrmSeatOfferStatus } from 'src/redux/student/admissions-crm/final-admission-contracts';

import { ApplicantEmptyState } from './applicant-workspace-primitives';

import { useApplicantFinalAdmissionWorkspace } from './applicant-final-admission-operations-context';
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

export function ApplicantSeatOffersPanel() {
  const { state: controllerState, actions, meta } = useApplicantFinalAdmissionWorkspace();
  const {
    approveOffer,
    approveState,
    canApproveOffers,
    canManageOffers,
    canOverrideSeatCapacity,
    capacityOverride,
    capacityOverrideReason,
    expireOffer,
    expireState,
    finalAdmissionQueriesFailed,
    issueOffer,
    issueState,
    offerPayload,
    offers,
    offersQuery,
    perform,
    respondOffer,
    respondState,
    responseReason,
    revokeOffer,
    revokeState,
    seatPoolId,
    submitOffer,
    submitState,
    supersedeOffer,
    supersedeState,
    validFrom,
    validUntil,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <Stack spacing={1}>
      {offers.map((offer) => (
        <Paper key={offer.id} variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
          <Stack spacing={0.75}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {offer.offerNumber} - v{offer.version}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Expires {formatEnrollmentDate(offer.validUntil, true)}
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
                {formatEnrollmentDate(offer.reservation.expiresAt, true)}
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
                      perform(() => approveOffer({ offerId: offer.id }).unwrap(), 'Offer approved.')
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
                      canOverrideSeatCapacity && capacityOverride && !capacityOverrideReason.trim()
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
                {[AdmissionCrmSeatOfferStatus.Issued, AdmissionCrmSeatOfferStatus.Opened].includes(
                  offer.status
                ) && canManageOffers ? (
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
                {[AdmissionCrmSeatOfferStatus.Issued, AdmissionCrmSeatOfferStatus.Opened].includes(
                  offer.status
                ) &&
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
  );
}
