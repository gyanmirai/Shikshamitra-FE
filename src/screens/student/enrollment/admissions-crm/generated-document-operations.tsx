'use client';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { shikshaMitraToast } from 'src/components/toast';
import { Download, Visibility, Description } from '@mui/icons-material';
import { Chip, Alert, Paper, Stack, MenuItem, TextField, Typography } from '@mui/material';
import {
  AdmissionCrmGeneratedDocumentType,
  useIssueAdmissionCrmGeneratedDocumentMutation,
  useGetAdmissionCrmGeneratedDocumentHistoryQuery,
  usePreviewAdmissionCrmGeneratedDocumentMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

type Props = {
  leadId: string;
};

const documentTypeLabels: Record<AdmissionCrmGeneratedDocumentType, string> = {
  [AdmissionCrmGeneratedDocumentType.HallTicket]: 'Hall ticket',
  [AdmissionCrmGeneratedDocumentType.RegistrationAcknowledgement]: 'Registration acknowledgement',
  [AdmissionCrmGeneratedDocumentType.OfferLetter]: 'Offer letter',
  [AdmissionCrmGeneratedDocumentType.AdmissionLetter]: 'Admission letter',
  [AdmissionCrmGeneratedDocumentType.CorrectionNotice]: 'Correction notice',
  [AdmissionCrmGeneratedDocumentType.CancellationLetter]: 'Cancellation letter',
};

const documentTypes = Object.values(AdmissionCrmGeneratedDocumentType).filter(
  (value): value is AdmissionCrmGeneratedDocumentType => typeof value === 'number'
);

const readError = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.detail || data?.errorCode || fallback;
  }
  return fallback;
};

const openPdf = (content: string, fileName: string, download: boolean) => {
  const binary = window.atob(content);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  if (download) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  } else {
    const previewWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!previewWindow) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
    }
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export function GeneratedDocumentOperations({ leadId }: Props) {
  const [documentType, setDocumentType] = useState<AdmissionCrmGeneratedDocumentType>(
    AdmissionCrmGeneratedDocumentType.HallTicket
  );
  const [language, setLanguage] = useState('en');
  const [reason, setReason] = useState('');
  const [preview, previewState] = usePreviewAdmissionCrmGeneratedDocumentMutation();
  const [issue, issueState] = useIssueAdmissionCrmGeneratedDocumentMutation();
  const historyQuery = useGetAdmissionCrmGeneratedDocumentHistoryQuery({ leadId });

  const runPreview = async () => {
    try {
      const result = await preview({ leadId, documentType, language }).unwrap();
      openPdf(result.content, result.fileName, false);
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error, 'Unable to preview the document.') });
    }
  };

  const runIssue = async () => {
    try {
      const result = await issue({
        leadId,
        documentType,
        language,
        reason: reason.trim() || null,
      }).unwrap();
      openPdf(result.content, result.fileName, true);
      setReason('');
      shikshaMitraToast.success({ message: `${result.documentTypeName} issued.` });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error, 'Unable to issue the document.') });
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography variant="subtitle2">Generated documents</Typography>
          <Chip size="small" label="CRM-owned" color="primary" variant="outlined" />
        </Stack>
        <Alert severity="info">
          Preview or issue applicant-safe hall tickets, acknowledgements, offers, admission letters,
          correction notices, and cancellation letters. Issuing creates an audited timeline event.
        </Alert>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <TextField
            select
            fullWidth
            size="small"
            label="Document"
            value={documentType}
            onChange={(event) =>
              setDocumentType(Number(event.target.value) as AdmissionCrmGeneratedDocumentType)
            }
          >
            {documentTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {documentTypeLabels[type]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            size="small"
            label="Language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="gu">Gujarati</MenuItem>
            <MenuItem value="hi">Hindi</MenuItem>
          </TextField>
          <TextField
            fullWidth
            size="small"
            label="Issue reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Required for a correction or override"
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <LoadingButton
            variant="outlined"
            startIcon={<Visibility />}
            loading={previewState.isLoading}
            onClick={runPreview}
          >
            Preview
          </LoadingButton>
          <LoadingButton
            variant="contained"
            startIcon={<Description />}
            loading={issueState.isLoading}
            onClick={runIssue}
          >
            Issue document
          </LoadingButton>
        </Stack>
        {historyQuery.isFetching ? (
          <Typography variant="caption">Loading issue history...</Typography>
        ) : null}
        {historyQuery.isError ? (
          <Alert severity="warning">Document history is temporarily unavailable.</Alert>
        ) : null}
        {(historyQuery.data || []).length > 0 ? (
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              Issue history
            </Typography>
            {(historyQuery.data || []).map((item) => (
              <Stack
                key={item.timelineEventId}
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                gap={1}
                sx={{ py: 0.5 }}
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  <Download fontSize="small" color="action" />
                  <Typography variant="body2">{item.documentTypeName}</Typography>
                  <Chip size="small" label={item.language.toUpperCase()} variant="outlined" />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {new Date(item.generatedAt).toLocaleString()}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
