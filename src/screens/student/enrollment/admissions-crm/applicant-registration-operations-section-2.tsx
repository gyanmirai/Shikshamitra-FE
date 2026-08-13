'use client';

import { shikshaMitraToast } from 'src/components/toast';

import { LoadingButton } from 'src/components/loading-button';

import { TaskAlt, UploadFile, CheckCircle } from '@mui/icons-material';

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

import { AdmissionCrmApplicantDocumentStatus } from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { ApplicantSwitchRow } from './applicant-workspace-primitives';

import { useApplicantRegistrationWorkspace } from './applicant-registration-operations-context';

const documentStatusLabels: Record<AdmissionCrmApplicantDocumentStatus, string> = {
  [AdmissionCrmApplicantDocumentStatus.Uploaded]: 'Uploaded',
  [AdmissionCrmApplicantDocumentStatus.UnderReview]: 'Under review',
  [AdmissionCrmApplicantDocumentStatus.Verified]: 'Verified',
  [AdmissionCrmApplicantDocumentStatus.Rejected]: 'Rejected',
  [AdmissionCrmApplicantDocumentStatus.Expired]: 'Expired',
  [AdmissionCrmApplicantDocumentStatus.Waived]: 'Waived',
  [AdmissionCrmApplicantDocumentStatus.OriginalSeen]: 'Original seen',
};

export function ApplicantRegistrationSection2() {
  const { state: controllerState, actions, meta } = useApplicantRegistrationWorkspace();
  const {
    assignChecklist,
    assignState,
    canAssignDocumentChecklist,
    canConfirmAdmissionReadiness,
    canConfirmOriginalSeen,
    canUploadDocuments,
    canWaiveDocuments,
    checklist,
    checklistQuery,
    checklistTemplateId,
    checklistTemplatesQuery,
    clearDocumentReason,
    confirmReadiness,
    documentFileByKey,
    documentReasonByKey,
    documentValidUntilByKey,
    markOriginalSeen,
    originalState,
    overrideReadiness,
    perform,
    readinessState,
    reason,
    registration,
    reviewDocument,
    reviewState,
    setChecklistTemplateId,
    setDocumentFileByKey,
    setDocumentReasonByKey,
    setDocumentValidUntilByKey,
    setOverrideReadiness,
    uploadDocument,
    uploadState,
    waiveDocument,
    waiveDocumentState,
  } = { ...controllerState, ...actions, ...meta };

  if (!registration) return null;

  return (
    <>
      <Box component="section">
        <Stack spacing={1.25}>
          <Typography variant="subtitle2">Document Verification</Typography>
          {checklistQuery.isFetching ? (
            <LinearProgress aria-label="Loading applicant document checklist" />
          ) : null}
          {checklistQuery.isError || checklistTemplatesQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    checklistQuery.refetch();
                    checklistTemplatesQuery.refetch();
                  }}
                >
                  Retry
                </Button>
              }
            >
              Document requirements could not be loaded. Retry before assigning or reviewing a
              checklist.
            </Alert>
          ) : null}
          {!checklist &&
          !checklistQuery.isFetching &&
          !checklistQuery.isError &&
          !checklistTemplatesQuery.isError &&
          canAssignDocumentChecklist ? (
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
                        aria-label={`Choose file for ${document.requirementName}`}
                      >
                        Choose File
                        <input
                          hidden
                          type="file"
                          aria-label={`Choose file for ${document.requirementName}`}
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
                        slotProps={{
                          inputLabel: { shrink: true },
                          htmlInput: {
                            'aria-label': `Valid until for ${document.requirementName}`,
                          },
                        }}
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
                          aria-label={`Upload ${document.requirementName}`}
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
                      slotProps={{
                        htmlInput: {
                          'aria-label': `Decision or waiver reason for ${document.requirementName}`,
                        },
                      }}
                      sx={{ flex: 1 }}
                    />
                    {document.id &&
                    canUploadDocuments &&
                    [
                      AdmissionCrmApplicantDocumentStatus.Uploaded,
                      AdmissionCrmApplicantDocumentStatus.UnderReview,
                    ].includes(document.status as AdmissionCrmApplicantDocumentStatus) ? (
                      <>
                        <LoadingButton
                          size="small"
                          variant="outlined"
                          aria-label={`Verify ${document.requirementName}`}
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
                          aria-label={`Reject ${document.requirementName}`}
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
                    canConfirmOriginalSeen &&
                    document.requiresOriginal &&
                    document.status === AdmissionCrmApplicantDocumentStatus.Verified &&
                    !document.originalSeen ? (
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        aria-label={`Confirm original seen for ${document.requirementName}`}
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
                    canWaiveDocuments &&
                    document.status !== AdmissionCrmApplicantDocumentStatus.Waived ? (
                      <LoadingButton
                        size="small"
                        variant="text"
                        aria-label={`Waive ${document.requirementName}`}
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
              {!checklist.readinessConfirmed && canConfirmAdmissionReadiness ? (
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
    </>
  );
}
