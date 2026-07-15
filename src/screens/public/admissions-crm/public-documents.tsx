'use client';

import { useState } from 'react';
import { UploadFile } from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { AdmissionCrmApplicantDocumentStatus } from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Divider,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import { publicAdmissionsActionCopy } from './public-admissions-copy';
import { readPublicAdmissionStatusProblem } from './public-status-utils';
import { getAccessibleStatusChipProps } from './public-admissions-styles';
import { formatPublicNumber, getPublicStatusLabel } from './public-admissions-format';

import type { PublicAdmissionsLanguage } from './public-admissions-copy';

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
  language?: PublicAdmissionsLanguage;
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const canReplace = (status?: number | null) => status == null || status === 3 || status === 4;

export default function PublicDocuments({
  tenantId,
  token,
  accessSessionToken,
  checklist,
  onUpdated,
  language = 'en',
}: Props) {
  const copy = publicAdmissionsActionCopy[language];
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | undefined>>({});
  const [validUntil, setValidUntil] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const upload = async (document: PublicApplicantDocument) => {
    const file = selectedFiles[document.requirementKey];
    if (!file) {
      shikshaMitraToast.error({ message: copy.chooseDocument });
      return;
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!document.acceptedExtensions.includes(extension)) {
      shikshaMitraToast.error({
        message: `${copy.acceptedFormats}: ${document.acceptedExtensions.join(', ')}`,
      });
      return;
    }
    if (file.size > document.maximumSizeMb * 1024 * 1024) {
      shikshaMitraToast.error({
        message: `${copy.maximumFileSize} ${formatPublicNumber(document.maximumSizeMb, language)} MB.`,
      });
      return;
    }
    if (document.validityDateRequired && !validUntil[document.requirementKey]) {
      shikshaMitraToast.error({ message: copy.enterValidityDate });
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
          copy.uploadFailed,
          language
        );
        throw new Error(problem.message);
      }
      onUpdated((await response.json()) as PublicDocumentChecklist);
      setSelectedFiles((current) => ({ ...current, [document.requirementKey]: undefined }));
      shikshaMitraToast.success({ message: copy.uploadSuccess });
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : copy.uploadFailed,
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
          <Typography variant="subtitle1">{copy.documentsTitle}</Typography>
          <Typography variant="caption" color="text.secondary">
            {checklist.checklistName} - {copy.version} {checklist.checklistTemplateVersion}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${formatPublicNumber(checklist.completionPercentage, language, { maximumFractionDigits: 0 })}% ${copy.complete}`}
          {...getAccessibleStatusChipProps(
            checklist.completionPercentage === 100 ? 'success' : 'default'
          )}
        />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, checklist.completionPercentage))}
        aria-label={`${formatPublicNumber(checklist.completionPercentage, language, { maximumFractionDigits: 0 })}% ${copy.documentsComplete}`}
      />
      {checklist.blockingReasons.length ? (
        <Alert severity="warning">{checklist.blockingReasons.join(' ')}</Alert>
      ) : checklist.awaitingSecondReadinessApproval ? (
        <Alert severity="info">{copy.secondApproval}</Alert>
      ) : (
        <Alert severity="success">{copy.requirementsResolved}</Alert>
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
              label={
                document.status == null
                  ? copy.missing
                  : getPublicStatusLabel(
                      AdmissionCrmApplicantDocumentStatus[document.status],
                      language
                    )
              }
              {...getAccessibleStatusChipProps(
                document.status === 2 || document.status === 5 || document.status === 6
                  ? 'success'
                  : document.status === 3 || document.status === 4
                    ? 'error'
                    : 'default'
              )}
            />
          </Stack>
          {canReplace(document.status) ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
              <TextField
                size="small"
                type="file"
                inputProps={{
                  accept: document.acceptedExtensions.map((item) => `.${item}`).join(','),
                  'aria-label': `Choose ${document.requirementName}`,
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
                  label={copy.validUntil}
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
                {copy.upload}
              </LoadingButton>
            </Stack>
          ) : null}
          {document.requiresOriginal && document.status === 2 ? (
            <Alert severity="info">{copy.presentOriginal}</Alert>
          ) : null}
        </Stack>
      ))}
    </Stack>
  );
}
