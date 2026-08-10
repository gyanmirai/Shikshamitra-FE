'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Replay, History, FactCheck } from '@mui/icons-material';

import { Box, Chip, Stack, TextField, Typography, LinearProgress } from '@mui/material';

import {
  AdmissionCrmRegistrationStatus,
  AdmissionCrmRegistrationFeeStatus,
} from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { RegistrationResponseEditor } from './registration-response-editor';

import { useApplicantRegistrationWorkspace } from './applicant-registration-operations-context';

const registrationStatusLabels: Record<AdmissionCrmRegistrationStatus, string> = {
  [AdmissionCrmRegistrationStatus.Issued]: 'Issued',
  [AdmissionCrmRegistrationStatus.Opened]: 'Opened',
  [AdmissionCrmRegistrationStatus.Started]: 'Started',
  [AdmissionCrmRegistrationStatus.PartiallyCompleted]: 'Partially completed',
  [AdmissionCrmRegistrationStatus.Submitted]: 'Submitted',
  [AdmissionCrmRegistrationStatus.ReturnedForCorrection]: 'Returned for correction',
  [AdmissionCrmRegistrationStatus.Resubmitted]: 'Resubmitted',
  [AdmissionCrmRegistrationStatus.Verified]: 'Verified',
  [AdmissionCrmRegistrationStatus.Expired]: 'Expired',
  [AdmissionCrmRegistrationStatus.Revoked]: 'Revoked',
  [AdmissionCrmRegistrationStatus.Withdrawn]: 'Withdrawn',
  [AdmissionCrmRegistrationStatus.AdmissionReady]: 'Admission ready',
};

export function ApplicantRegistrationSection1() {
  const { state: controllerState, actions, meta } = useApplicantRegistrationWorkspace();
  const {
    allFieldKeys,
    canIssueRegistration,
    canManageRegistrationLinks,
    canVerifyRegistration,
    canWaiveRegistrationFee,
    correctionFields,
    correctionState,
    extend,
    extendState,
    initialNewExpiry,
    initialReissueDays,
    isRegistrationBusy,
    newExpiry,
    paymentReference,
    paymentState,
    perform,
    reason,
    recordPayment,
    registration,
    reissue,
    reissueDays,
    reissueState,
    returnForCorrection,
    revoke,
    revokeState,
    setCorrectionFields,
    setNewExpiry,
    setPaymentReference,
    setReason,
    setReissueDays,
    verify,
    verifyState,
    waiveFee,
    waiveFeeState,
  } = { ...controllerState, ...actions, ...meta };

  if (!registration) return null;

  return (
    <>
      <Box id="registration-response-operation" tabIndex={-1}>
        <RegistrationResponseEditor registration={registration} />
      </Box>
      <Box id="registration-lifecycle-operation" component="section" tabIndex={-1}>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="subtitle2">Registration {registration.formNumber}</Typography>
              <Typography variant="caption" color="text.secondary">
                Expires {new Date(registration.linkExpiresAt).toLocaleDateString()} -{' '}
                {registration.completionPercentage.toFixed(0)}% complete
              </Typography>
            </Box>
            <Chip
              size="small"
              label={registrationStatusLabels[registration.status]}
              color={
                registration.status === AdmissionCrmRegistrationStatus.AdmissionReady
                  ? 'success'
                  : 'default'
              }
            />
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            <TextField
              size="small"
              label="Reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              helperText="Required for correction, expiry, revoke, reissue, and waivers."
            />
            <TextField
              size="small"
              type="date"
              label="New expiry"
              value={newExpiry}
              onChange={(event) => setNewExpiry(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            {canManageRegistrationLinks ? (
              <LoadingButton
                variant="outlined"
                loading={extendState.isLoading}
                disabled={!reason.trim()}
                onClick={() =>
                  perform(
                    () =>
                      extend({
                        applicationId: registration.id,
                        newExpiry: new Date(`${newExpiry}T23:59:59`).toISOString(),
                        reason: reason.trim(),
                      }).unwrap(),
                    'Registration expiry extended.',
                    true
                  ).then((saved) => {
                    if (saved) setNewExpiry(initialNewExpiry);
                  })
                }
              >
                Extend Link
              </LoadingButton>
            ) : null}
          </Box>
          <TextField
            size="small"
            label="Correction field keys"
            value={correctionFields}
            onChange={(event) => setCorrectionFields(event.target.value)}
            helperText={`Comma-separated fields. Available: ${allFieldKeys.join(', ') || 'none'}`}
          />
          <Stack direction="row" gap={1} flexWrap="wrap">
            {canVerifyRegistration ? (
              <LoadingButton
                variant="outlined"
                startIcon={<Replay />}
                loading={correctionState.isLoading}
                disabled={!reason.trim() || !correctionFields.trim()}
                onClick={() =>
                  perform(
                    () =>
                      returnForCorrection({
                        applicationId: registration.id,
                        fieldKeys: correctionFields
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean),
                        reason: reason.trim(),
                      }).unwrap(),
                    'Registration returned for correction.',
                    true
                  ).then((saved) => {
                    if (saved) setCorrectionFields('');
                  })
                }
              >
                Return for Correction
              </LoadingButton>
            ) : null}
            {canVerifyRegistration ? (
              <LoadingButton
                variant="contained"
                startIcon={<FactCheck />}
                loading={verifyState.isLoading}
                disabled={
                  ![
                    AdmissionCrmRegistrationStatus.Submitted,
                    AdmissionCrmRegistrationStatus.Resubmitted,
                  ].includes(registration.status)
                }
                onClick={() =>
                  perform(
                    () => verify({ applicationId: registration.id }).unwrap(),
                    'Registration verified.'
                  )
                }
              >
                Verify Registration
              </LoadingButton>
            ) : null}
            {canManageRegistrationLinks ? (
              <LoadingButton
                color="error"
                variant="outlined"
                loading={revokeState.isLoading}
                disabled={
                  !reason.trim() || registration.status === AdmissionCrmRegistrationStatus.Revoked
                }
                onClick={() =>
                  perform(
                    () =>
                      revoke({ applicationId: registration.id, reason: reason.trim() }).unwrap(),
                    'Registration link revoked.',
                    true
                  )
                }
              >
                Revoke
              </LoadingButton>
            ) : null}
          </Stack>
          {canManageRegistrationLinks &&
          (registration.status === AdmissionCrmRegistrationStatus.Revoked ||
            new Date(registration.linkExpiresAt) <= new Date()) ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                size="small"
                type="number"
                label="Reissue expiry days"
                value={reissueDays}
                onChange={(event) => setReissueDays(Number(event.target.value))}
                slotProps={{ htmlInput: { min: 1, max: 365 } }}
              />
              <LoadingButton
                variant="outlined"
                startIcon={<History />}
                loading={reissueState.isLoading}
                disabled={!reason.trim() || reissueDays < 1 || reissueDays > 365}
                onClick={() =>
                  perform(
                    () =>
                      reissue({
                        applicationId: registration.id,
                        linkExpiryDays: reissueDays,
                        reason: reason.trim(),
                      }).unwrap(),
                    'Registration link reissued.',
                    true
                  ).then((saved) => {
                    if (saved) setReissueDays(initialReissueDays);
                  })
                }
              >
                Reissue Link
              </LoadingButton>
            </Stack>
          ) : null}
          {registration.feeAmount > 0 ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
              <Chip
                size="small"
                label={`Fee status ${AdmissionCrmRegistrationFeeStatus[registration.feeStatus]}`}
              />
              <TextField
                size="small"
                label="Payment reference"
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
              />
              {canIssueRegistration ? (
                <LoadingButton
                  variant="outlined"
                  loading={paymentState.isLoading}
                  disabled={!paymentReference.trim()}
                  onClick={() =>
                    perform(
                      () =>
                        recordPayment({
                          applicationId: registration.id,
                          paymentReference: paymentReference.trim(),
                        }).unwrap(),
                      'Payment reference recorded.'
                    ).then((saved) => {
                      if (saved) setPaymentReference('');
                    })
                  }
                >
                  Record Reference
                </LoadingButton>
              ) : null}
              {canWaiveRegistrationFee ? (
                <LoadingButton
                  variant="text"
                  loading={waiveFeeState.isLoading}
                  disabled={!reason.trim()}
                  onClick={() =>
                    perform(
                      () =>
                        waiveFee({
                          applicationId: registration.id,
                          reason: reason.trim(),
                        }).unwrap(),
                      'Registration fee waived.',
                      true
                    )
                  }
                >
                  Waive Fee
                </LoadingButton>
              ) : null}
            </Stack>
          ) : null}
          {isRegistrationBusy ? <LinearProgress /> : null}
        </Stack>
      </Box>
    </>
  );
}
