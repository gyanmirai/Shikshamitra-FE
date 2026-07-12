'use client';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { UploadFile } from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Chip, Alert, Stack, Divider, TextField, Typography } from '@mui/material';

import { readPublicAdmissionStatusProblem } from './public-status-utils';

export type PublicApplicantDocument = {
  id?: string | null;
  requirementKey: string;
  requirementName: string;
  isCurrentlyRequired: boolean;
  blocksAdmissionReadiness: boolean;
  requiresOriginal: boolean;
  validityDateRequired: boolean;
  originalSeen: boolean;
  status?: number | null;
  version: number;
  fileName?: string | null;
  validUntil?: string | null;
  decisionReason?: string | null;
  acceptedExtensions: string[];
  maximumSizeMb: number;
  uploadInstructions?: string | null;
};

export type PublicDocumentChecklist = {
  assignmentId: string;
  checklistName: string;
  checklistTemplateVersion: number;
  completionPercentage: number;
  admissionReady: boolean;
  readinessConfirmed: boolean;
  requiredReadinessApprovalCount: number;
  receivedReadinessApprovalCount: number;
  awaitingSecondReadinessApproval: boolean;
  blockingReasons: string[];
  documents: PublicApplicantDocument[];
};

type Props = {
  tenantId: string;
  token: string;
  accessSessionToken: string;
  checklist: PublicDocumentChecklist;
  onUpdated: (checklist: PublicDocumentChecklist) => void;
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const statusNames: Record<number, string> = {
  0: 'Uploaded',
  1: 'Under review',
  2: 'Verified',
  3: 'Rejected',
  4: 'Expired',
  5: 'Waived',
  6: 'Original seen',
};

const canReplace = (status?: number | null) => status == null || status === 3 || status === 4;

export default function PublicDocuments({
  tenantId,
  token,
  accessSessionToken,
  checklist,
  onUpdated,
}: Props) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | undefined>>({});
  const [validUntil, setValidUntil] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const upload = async (document: PublicApplicantDocument) => {
    const file = selectedFiles[document.requirementKey];
    if (!file) {
      shikshaMitraToast.error({ message: 'Choose a document file.' });
      return;
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!document.acceptedExtensions.includes(extension)) {
      shikshaMitraToast.error({
        message: `Accepted formats: ${document.acceptedExtensions.join(', ')}`,
      });
      return;
    }
    if (file.size > document.maximumSizeMb * 1024 * 1024) {
      shikshaMitraToast.error({ message: `Maximum file size is ${document.maximumSizeMb} MB.` });
      return;
    }
    if (document.validityDateRequired && !validUntil[document.requirementKey]) {
      shikshaMitraToast.error({ message: 'Enter the document validity date.' });
      return;
    }
    setUploadingKey(document.requirementKey);
    try {
      const form = new FormData();
      form.append('AccessSessionToken', accessSessionToken);
      form.append('RequirementKey', document.requirementKey);
      if (validUntil[document.requirementKey])
        form.append('ValidUntil', validUntil[document.requirementKey]);
      form.append('File', file);
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/registration/documents`,
        { method: 'POST', body: form }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          'Unable to upload document.'
        );
        throw new Error(problem.message);
      }
      onUpdated((await response.json()) as PublicDocumentChecklist);
      setSelectedFiles((current) => ({ ...current, [document.requirementKey]: undefined }));
      shikshaMitraToast.success({ message: 'Document uploaded for review.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : 'Unable to upload document.',
      });
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Divider />
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="subtitle1">Documents</Typography>
          <Typography variant="caption" color="text.secondary">
            {checklist.checklistName} - version {checklist.checklistTemplateVersion}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${checklist.completionPercentage.toFixed(0)}% complete`}
          color={checklist.completionPercentage === 100 ? 'success' : 'default'}
        />
      </Stack>
      {checklist.blockingReasons.length ? (
        <Alert severity="warning">{checklist.blockingReasons.join(' ')}</Alert>
      ) : checklist.awaitingSecondReadinessApproval ? (
        <Alert severity="info">Document verification is awaiting the second school approval.</Alert>
      ) : (
        <Alert severity="success">All blocking document requirements are resolved.</Alert>
      )}
      {checklist.documents.map((document) => (
        <Stack
          key={document.requirementKey}
          spacing={1}
          sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="body2">
                {document.requirementName}
                {document.isCurrentlyRequired ? ' *' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {document.uploadInstructions ||
                  `${document.acceptedExtensions.join(', ')} up to ${document.maximumSizeMb} MB`}
              </Typography>
              {document.decisionReason ? (
                <Typography variant="caption" color="error" display="block">
                  {document.decisionReason}
                </Typography>
              ) : null}
            </Box>
            <Chip
              size="small"
              label={document.status == null ? 'Missing' : statusNames[document.status]}
              color={
                document.status === 2 || document.status === 5 || document.status === 6
                  ? 'success'
                  : document.status === 3 || document.status === 4
                    ? 'error'
                    : 'default'
              }
            />
          </Stack>
          {canReplace(document.status) ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
              <TextField
                size="small"
                type="file"
                inputProps={{
                  accept: document.acceptedExtensions.map((item) => `.${item}`).join(','),
                }}
                onChange={(event) =>
                  setSelectedFiles((current) => ({
                    ...current,
                    [document.requirementKey]: (event.target as HTMLInputElement).files?.[0],
                  }))
                }
              />
              {document.validityDateRequired ? (
                <TextField
                  size="small"
                  type="date"
                  label="Valid until"
                  InputLabelProps={{ shrink: true }}
                  value={validUntil[document.requirementKey] || ''}
                  onChange={(event) =>
                    setValidUntil((current) => ({
                      ...current,
                      [document.requirementKey]: event.target.value,
                    }))
                  }
                />
              ) : null}
              <LoadingButton
                size="small"
                variant="outlined"
                startIcon={<UploadFile />}
                loading={uploadingKey === document.requirementKey}
                disabled={!selectedFiles[document.requirementKey]}
                onClick={() => upload(document)}
              >
                Upload
              </LoadingButton>
            </Stack>
          ) : null}
          {document.requiresOriginal && document.status === 2 ? (
            <Alert severity="info">
              Present the original at school reception for confirmation.
            </Alert>
          ) : null}
        </Stack>
      ))}
    </Stack>
  );
}
