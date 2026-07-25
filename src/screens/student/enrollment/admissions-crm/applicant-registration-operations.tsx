'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import {
  Replay,
  History,
  TaskAlt,
  FactCheck,
  UploadFile,
  CheckCircle,
  Description,
} from '@mui/icons-material';
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
  useUploadAdmissionCrmRegistrationDocumentMutation,
  useGetAdmissionCrmApplicantDocumentChecklistQuery,
  useGetAdmissionCrmDocumentChecklistTemplatesQuery,
  useConfirmAdmissionCrmDocumentOriginalSeenMutation,
  useIssueAdmissionCrmRegistrationApplicationMutation,
  useReturnAdmissionCrmRegistrationForCorrectionMutation,
  useRecordAdmissionCrmRegistrationPaymentReferenceMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { RegistrationResponseEditor } from './registration-response-editor';
import { hasApplicantRegistrationDraft } from './applicant-registration-draft-state';
import { useApplicantWorkspaceDirtyState } from './applicant-workspace-dirty-context';
import { ApplicantSwitchRow, ApplicantEmptyState } from './applicant-workspace-primitives';

type Props = {
  leadId: string;
  academicYearId: string;
  hasRegistration: boolean;
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

export function ApplicantRegistrationOperations({
  leadId,
  academicYearId,
  hasRegistration,
}: Props) {
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const canUploadDocuments = hasGrantedPermission(
    permissions,
    'Students.Enrollment.AdmissionsCrm.ReviewDocuments'
  );
  const registrationQuery = useGetCurrentAdmissionCrmRegistrationByLeadQuery(
    { leadId },
    { skip: !hasRegistration }
  );
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
  };

  const clearDocumentReason = (requirementKey: string) => {
    setDocumentReasonByKey((current) => {
      const next = { ...current };
      delete next[requirementKey];
      return next;
    });
  };

  if (registrationQuery.isFetching) return <LinearProgress />;

  if (!registration) {
    return (
      <Box component="section">
        <Stack spacing={1.25}>
          <Typography variant="subtitle2">Registration</Typography>
          <ApplicantEmptyState
            title="Registration has not been issued"
            description="Select a template and expiry date to start the applicant registration."
            action={
              !issueFormOpen ? (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Description />}
                  onClick={() => setIssueFormOpen(true)}
                >
                  Issue registration
                </Button>
              ) : undefined
            }
          />
          {issueFormOpen ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' },
                gap: 1,
              }}
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
                  ).then((saved) => {
                    if (saved) closeIssueForm();
                  })
                }
              >
                Issue
              </LoadingButton>
              <Button size="small" onClick={closeIssueForm}>
                Cancel
              </Button>
            </Box>
          ) : null}
        </Stack>
      </Box>
    );
  }

  return (
    <Stack spacing={1.25}>
      <RegistrationResponseEditor registration={registration} />

      <Box component="section">
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
                  'Registration expiry extended.',
                  true
                ).then((saved) => {
                  if (saved) setNewExpiry(initialNewExpiry);
                })
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
                  'Registration returned for correction.',
                  true
                ).then((saved) => {
                  if (saved) setCorrectionFields('');
                })
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
                  'Registration link revoked.',
                  true
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
              <LoadingButton
                variant="text"
                loading={waiveFeeState.isLoading}
                disabled={!reason.trim()}
                onClick={() =>
                  perform(
                    () =>
                      waiveFee({ applicationId: registration.id, reason: reason.trim() }).unwrap(),
                    'Registration fee waived.',
                    true
                  )
                }
              >
                Waive Fee
              </LoadingButton>
            </Stack>
          ) : null}
          {isRegistrationBusy ? <LinearProgress /> : null}
        </Stack>
      </Box>

      <Box component="section">
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
                  ).then((saved) => {
                    if (saved) setChecklistTemplateId('');
                  })
                }
              >
                Assign Checklist
              </LoadingButton>
            </Stack>
          ) : null}
          {checklist ? (
            <>
              <Stack direction="row" gap={1} flexWrap="wrap">
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
                  {document.uploadInstructions ? (
                    <Typography variant="caption" color="text.secondary">
                      Family upload guidance: {document.uploadInstructions}
                    </Typography>
                  ) : null}
                  {document.id &&
                  [
                    AdmissionCrmApplicantDocumentStatus.Uploaded,
                    AdmissionCrmApplicantDocumentStatus.UnderReview,
                  ].includes(document.status as AdmissionCrmApplicantDocumentStatus) &&
                  document.rejectionReasons?.length ? (
                    <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Common rejection reasons:
                      </Typography>
                      {document.rejectionReasons.map((rejectionReason) => (
                        <Button
                          key={rejectionReason}
                          size="small"
                          variant="text"
                          onClick={() =>
                            setDocumentReasonByKey((current) => ({
                              ...current,
                              [document.requirementKey]: rejectionReason,
                            }))
                          }
                        >
                          {rejectionReason}
                        </Button>
                      ))}
                    </Stack>
                  ) : null}
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    {canUploadDocuments ? (
                      <Button
                        component="label"
                        size="small"
                        variant="outlined"
                        startIcon={<UploadFile />}
                      >
                        Choose File
                        <input
                          hidden
                          type="file"
                          accept={document.acceptedExtensions
                            .map((extension) => `.${extension}`)
                            .join(',')}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file && file.size > document.maximumSizeMb * 1024 * 1024) {
                              shikshaMitraToast.error({
                                message: `${document.requirementName} must be ${document.maximumSizeMb} MB or smaller.`,
                              });
                              event.target.value = '';
                              return;
                            }
                            const extension = file?.name.split('.').pop()?.toLowerCase();
                            if (
                              file &&
                              extension &&
                              !document.acceptedExtensions.some(
                                (accepted) => accepted.toLowerCase() === extension
                              )
                            ) {
                              shikshaMitraToast.error({
                                message: `${document.requirementName} accepts ${document.acceptedExtensions.join(', ')} files.`,
                              });
                              event.target.value = '';
                              return;
                            }
                            setDocumentFileByKey((current) => ({
                              ...current,
                              [document.requirementKey]: file,
                            }));
                            event.target.value = '';
                          }}
                        />
                      </Button>
                    ) : null}
                    {canUploadDocuments && document.validityDateRequired ? (
                      <TextField
                        size="small"
                        type="date"
                        label="Valid Until"
                        value={documentValidUntilByKey[document.requirementKey] || ''}
                        onChange={(event) =>
                          setDocumentValidUntilByKey((current) => ({
                            ...current,
                            [document.requirementKey]: event.target.value,
                          }))
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    ) : null}
                    {canUploadDocuments && documentFileByKey[document.requirementKey] ? (
                      <Stack direction="row" gap={1} alignItems="center" minWidth={0}>
                        <Typography
                          variant="caption"
                          noWrap
                          title={documentFileByKey[document.requirementKey]?.name}
                          sx={{ maxWidth: 180 }}
                        >
                          {documentFileByKey[document.requirementKey]?.name}
                        </Typography>
                        <LoadingButton
                          size="small"
                          variant="contained"
                          loading={uploadState.isLoading}
                          disabled={
                            document.validityDateRequired &&
                            !documentValidUntilByKey[document.requirementKey]
                          }
                          onClick={() =>
                            perform(
                              () =>
                                uploadDocument({
                                  registrationApplicationId: registration.id,
                                  requirementKey: document.requirementKey,
                                  file: documentFileByKey[document.requirementKey]!,
                                  validUntil:
                                    documentValidUntilByKey[document.requirementKey] || null,
                                }).unwrap(),
                              `${document.requirementName} uploaded.`
                            ).then((saved) => {
                              if (!saved) return;
                              setDocumentFileByKey((current) => ({
                                ...current,
                                [document.requirementKey]: undefined,
                              }));
                              setDocumentValidUntilByKey((current) => {
                                const next = { ...current };
                                delete next[document.requirementKey];
                                return next;
                              });
                            })
                          }
                        >
                          Upload
                        </LoadingButton>
                      </Stack>
                    ) : null}
                    <TextField
                      size="small"
                      label="Decision or waiver reason"
                      helperText={
                        document.rejectionReasons?.length
                          ? 'Choose a common reason above or enter a specific reason.'
                          : undefined
                      }
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
                            ).then((saved) => {
                              if (saved) clearDocumentReason(document.requirementKey);
                            })
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
                          ).then((saved) => {
                            if (saved) clearDocumentReason(document.requirementKey);
                          })
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
                  <ApplicantSwitchRow
                    label="Enable readiness override"
                    description="Continue despite unresolved blocking document requirements."
                    checked={overrideReadiness}
                    onChange={setOverrideReadiness}
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
                          : 'Admission readiness confirmed.',
                        true
                      ).then((saved) => {
                        if (saved) setOverrideReadiness(false);
                      })
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
      </Box>
    </Stack>
  );
}
