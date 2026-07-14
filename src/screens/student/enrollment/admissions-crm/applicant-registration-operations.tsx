'use client';

import { useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Replay, History, TaskAlt, FactCheck, CheckCircle, Description } from '@mui/icons-material';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Divider,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionCrmRegistrationStatus,
  AdmissionCrmRegistrationFeeStatus,
  AdmissionCrmApplicantDocumentStatus,
  AdmissionCrmRegistrationTemplateStatus,
  useGetAdmissionCrmFormNumberSeriesQuery,
  useExtendAdmissionCrmRegistrationMutation,
  useRevokeAdmissionCrmRegistrationMutation,
  useVerifyAdmissionCrmRegistrationMutation,
  useReissueAdmissionCrmRegistrationMutation,
  AdmissionCrmDocumentChecklistTemplateStatus,
  useWaiveAdmissionCrmRegistrationFeeMutation,
  useGetAdmissionCrmRegistrationTemplatesQuery,
  useWaiveAdmissionCrmApplicantDocumentMutation,
  useAssignAdmissionCrmDocumentChecklistMutation,
  useReviewAdmissionCrmApplicantDocumentMutation,
  useConfirmAdmissionCrmDocumentReadinessMutation,
  useGetCurrentAdmissionCrmRegistrationByLeadQuery,
  useGetAdmissionCrmApplicantDocumentChecklistQuery,
  useGetAdmissionCrmDocumentChecklistTemplatesQuery,
  useConfirmAdmissionCrmDocumentOriginalSeenMutation,
  useIssueAdmissionCrmRegistrationApplicationMutation,
  useReturnAdmissionCrmRegistrationForCorrectionMutation,
  useRecordAdmissionCrmRegistrationPaymentReferenceMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

type Props = {
  leadId: string;
  academicYearId: string;
};

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

const documentStatusLabels: Record<AdmissionCrmApplicantDocumentStatus, string> = {
  [AdmissionCrmApplicantDocumentStatus.Uploaded]: 'Uploaded',
  [AdmissionCrmApplicantDocumentStatus.UnderReview]: 'Under review',
  [AdmissionCrmApplicantDocumentStatus.Verified]: 'Verified',
  [AdmissionCrmApplicantDocumentStatus.Rejected]: 'Rejected',
  [AdmissionCrmApplicantDocumentStatus.Expired]: 'Expired',
  [AdmissionCrmApplicantDocumentStatus.Waived]: 'Waived',
  [AdmissionCrmApplicantDocumentStatus.OriginalSeen]: 'Original seen',
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

export function ApplicantRegistrationOperations({ leadId, academicYearId }: Props) {
  const registrationQuery = useGetCurrentAdmissionCrmRegistrationByLeadQuery({ leadId });
  const registration = registrationQuery.data;
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
  const [seriesId, setSeriesId] = useState('');
  const [checklistTemplateId, setChecklistTemplateId] = useState('');
  const [reason, setReason] = useState('');
  const [correctionFields, setCorrectionFields] = useState('');
  const [newExpiry, setNewExpiry] = useState(dateInDays(14));
  const [reissueDays, setReissueDays] = useState(14);
  const [paymentReference, setPaymentReference] = useState('');
  const [overrideReadiness, setOverrideReadiness] = useState(false);
  const [documentReasonByKey, setDocumentReasonByKey] = useState<Record<string, string>>({});

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

  const perform = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      setReason('');
      shikshaMitraToast.success({ message: success });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error, 'Unable to complete the action.') });
    }
  };

  if (registrationQuery.isFetching) return <LinearProgress />;

  if (!registration) {
    return (
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Typography variant="subtitle2">Registration</Typography>
          <Alert severity="info">No CRM registration has been issued for this applicant.</Alert>
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 1 }}
          >
            <TextField
              select
              size="small"
              label="Registration template"
              value={registrationTemplateId}
              onChange={(event) => setRegistrationTemplateId(event.target.value)}
            >
              {(templatesQuery.data?.items || []).map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name} - v{template.version}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Form number series"
              value={seriesId}
              onChange={(event) => setSeriesId(event.target.value)}
            >
              <MenuItem value="">Automatic or manual fallback</MenuItem>
              {(seriesQuery.data?.items || [])
                .filter((item) => item.isActive)
                .map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name} - {item.nextPreview}
                  </MenuItem>
                ))}
            </TextField>
            <LoadingButton
              variant="contained"
              startIcon={<Description />}
              loading={issueState.isLoading}
              disabled={!registrationTemplateId}
              onClick={() =>
                perform(
                  () =>
                    issue({
                      leadId,
                      body: {
                        registrationTemplateId,
                        formNumberSeriesId: seriesId || null,
                        waiveFee: false,
                      },
                    }).unwrap(),
                  'Registration issued.'
                )
              }
            >
              Issue
            </LoadingButton>
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack spacing={1.25}>
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
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
                  'Registration expiry extended.'
                )
              }
            >
              Extend Link
            </LoadingButton>
          </Box>
          <TextField
            size="small"
            label="Correction field keys"
            value={correctionFields}
            onChange={(event) => setCorrectionFields(event.target.value)}
            helperText={`Comma-separated fields. Available: ${allFieldKeys.join(', ') || 'none'}`}
          />
          <Stack direction="row" gap={1} flexWrap="wrap">
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
                  'Registration returned for correction.'
                )
              }
            >
              Return for Correction
            </LoadingButton>
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
            <LoadingButton
              color="error"
              variant="outlined"
              loading={revokeState.isLoading}
              disabled={
                !reason.trim() || registration.status === AdmissionCrmRegistrationStatus.Revoked
              }
              onClick={() =>
                perform(
                  () => revoke({ applicationId: registration.id, reason: reason.trim() }).unwrap(),
                  'Registration link revoked.'
                )
              }
            >
              Revoke
            </LoadingButton>
          </Stack>
          {registration.status === AdmissionCrmRegistrationStatus.Revoked ||
          new Date(registration.linkExpiresAt) <= new Date() ? (
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
                    'Registration link reissued.'
                  )
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
                  )
                }
              >
                Record Reference
              </LoadingButton>
              <LoadingButton
                variant="text"
                loading={waiveFeeState.isLoading}
                disabled={!reason.trim()}
                onClick={() =>
                  perform(
                    () =>
                      waiveFee({ applicationId: registration.id, reason: reason.trim() }).unwrap(),
                    'Registration fee waived.'
                  )
                }
              >
                Waive Fee
              </LoadingButton>
            </Stack>
          ) : null}
          {isRegistrationBusy ? <LinearProgress /> : null}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Typography variant="subtitle2">Document Verification</Typography>
          {checklistQuery.isFetching ? <LinearProgress /> : null}
          {!checklist && !checklistQuery.isFetching ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                select
                size="small"
                fullWidth
                label="Document checklist"
                value={checklistTemplateId}
                onChange={(event) => setChecklistTemplateId(event.target.value)}
              >
                {(checklistTemplatesQuery.data?.items || []).map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name} - v{template.version}
                  </MenuItem>
                ))}
              </TextField>
              <LoadingButton
                variant="outlined"
                loading={assignState.isLoading}
                disabled={!checklistTemplateId}
                onClick={() =>
                  perform(
                    () =>
                      assignChecklist({
                        registrationApplicationId: registration.id,
                        checklistTemplateId,
                      }).unwrap(),
                    'Document checklist assigned.'
                  )
                }
              >
                Assign Checklist
              </LoadingButton>
            </Stack>
          ) : null}
          {checklist ? (
            <>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                <Chip
                  size="small"
                  label={`${checklist.completionPercentage.toFixed(0)}% complete`}
                />
                <Chip
                  size="small"
                  label={`${checklist.receivedReadinessApprovalCount}/${checklist.requiredReadinessApprovalCount} readiness approvals`}
                />
                {checklist.awaitingSecondReadinessApproval ? (
                  <Chip size="small" color="info" label="Awaiting second approver" />
                ) : null}
                {checklist.readinessConfirmed ? (
                  <Chip size="small" color="success" label="Readiness confirmed" />
                ) : null}
              </Stack>
              {checklist.blockingReasons.length ? (
                <Alert severity="warning">{checklist.blockingReasons.join(' ')}</Alert>
              ) : null}
              <Divider />
              {checklist.documents.map((document) => (
                <Stack
                  key={document.requirementKey}
                  spacing={0.75}
                  sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Box>
                      <Typography variant="body2">
                        {document.requirementName}
                        {document.isCurrentlyRequired ? ' *' : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {document.fileName || 'No file uploaded'}
                        {document.decisionReason ? ` - ${document.decisionReason}` : ''}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={
                        document.status == null ? 'Missing' : documentStatusLabels[document.status]
                      }
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <TextField
                      size="small"
                      label="Decision or waiver reason"
                      value={documentReasonByKey[document.requirementKey] || ''}
                      onChange={(event) =>
                        setDocumentReasonByKey((current) => ({
                          ...current,
                          [document.requirementKey]: event.target.value,
                        }))
                      }
                      sx={{ flex: 1 }}
                    />
                    {document.id &&
                    [
                      AdmissionCrmApplicantDocumentStatus.Uploaded,
                      AdmissionCrmApplicantDocumentStatus.UnderReview,
                    ].includes(document.status as AdmissionCrmApplicantDocumentStatus) ? (
                      <>
                        <LoadingButton
                          size="small"
                          variant="outlined"
                          loading={reviewState.isLoading}
                          onClick={() =>
                            perform(
                              () =>
                                reviewDocument({
                                  documentId: document.id!,
                                  approve: true,
                                }).unwrap(),
                              'Document verified.'
                            )
                          }
                        >
                          Verify
                        </LoadingButton>
                        <LoadingButton
                          size="small"
                          color="error"
                          variant="outlined"
                          loading={reviewState.isLoading}
                          disabled={!documentReasonByKey[document.requirementKey]?.trim()}
                          onClick={() =>
                            perform(
                              () =>
                                reviewDocument({
                                  documentId: document.id!,
                                  approve: false,
                                  reason: documentReasonByKey[document.requirementKey].trim(),
                                }).unwrap(),
                              'Document rejected.'
                            )
                          }
                        >
                          Reject
                        </LoadingButton>
                      </>
                    ) : null}
                    {document.id &&
                    document.requiresOriginal &&
                    document.status === AdmissionCrmApplicantDocumentStatus.Verified &&
                    !document.originalSeen ? (
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        loading={originalState.isLoading}
                        onClick={() =>
                          perform(
                            () => markOriginalSeen({ documentId: document.id! }).unwrap(),
                            'Original document confirmed.'
                          )
                        }
                      >
                        Original Seen
                      </LoadingButton>
                    ) : null}
                    {!checklist.readinessConfirmed &&
                    document.status !== AdmissionCrmApplicantDocumentStatus.Waived ? (
                      <LoadingButton
                        size="small"
                        variant="text"
                        loading={waiveDocumentState.isLoading}
                        disabled={!documentReasonByKey[document.requirementKey]?.trim()}
                        onClick={() =>
                          perform(
                            () =>
                              waiveDocument({
                                assignmentId: checklist.assignmentId,
                                requirementKey: document.requirementKey,
                                reason: documentReasonByKey[document.requirementKey].trim(),
                              }).unwrap(),
                            'Document requirement waived.'
                          )
                        }
                      >
                        Waive
                      </LoadingButton>
                    ) : null}
                  </Stack>
                </Stack>
              ))}
              {!checklist.readinessConfirmed ? (
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={overrideReadiness}
                        onChange={(event) => setOverrideReadiness(event.target.checked)}
                      />
                    }
                    label="Override unresolved blocking requirements"
                  />
                  <LoadingButton
                    variant="contained"
                    startIcon={
                      checklist.awaitingSecondReadinessApproval ? <CheckCircle /> : <TaskAlt />
                    }
                    loading={readinessState.isLoading}
                    disabled={
                      (overrideReadiness || checklist.blockingReasons.length > 0) && !reason.trim()
                    }
                    onClick={() =>
                      perform(
                        () =>
                          confirmReadiness({
                            assignmentId: checklist.assignmentId,
                            overrideBlockingRequirements: overrideReadiness,
                            reason: reason.trim() || null,
                          }).unwrap(),
                        checklist.requiredReadinessApprovalCount === 2 &&
                          checklist.receivedReadinessApprovalCount === 0
                          ? 'First readiness approval recorded.'
                          : 'Admission readiness confirmed.'
                      )
                    }
                  >
                    {checklist.awaitingSecondReadinessApproval
                      ? 'Give Second Approval'
                      : 'Confirm Readiness'}
                  </LoadingButton>
                </Stack>
              ) : null}
            </>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}
