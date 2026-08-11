'use client';

import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Download, Visibility, Description, EmailOutlined, ReplayOutlined } from '@mui/icons-material';
import { Chip, Alert, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';
import { AdmissionCrmGeneratedDocumentType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import {
  useIssueAdmissionCrmGeneratedDocumentMutation,
  useSendAdmissionCrmGeneratedDocumentEmailMutation,
  useGetAdmissionCrmGeneratedDocumentHistoryQuery,
  usePreviewAdmissionCrmGeneratedDocumentMutation,
  useGetAdmissionCrmGeneratedDocumentAvailabilityQuery,
} from 'src/redux/student/admissions-crm/final-admission-api';
import { useRetryAdmissionCrmMessageDeliveryMutation } from 'src/redux/student/admissions-crm/communication-exams-events-api';
import type { AdmissionCrmMessageDeliveryLogDto } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { ApplicantSection } from './applicant-workspace-primitives';

type Props = {
  leadId: string;
  allowedDocumentTypes?: readonly AdmissionCrmGeneratedDocumentType[];
  title?: string;
  description?: string;
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

export function GeneratedDocumentOperations({
  leadId,
  allowedDocumentTypes,
  title = 'Generated documents',
  description = 'Preview and issue applicant-safe documents with an audited history.',
}: Props) {
  const configuredDocumentTypes = useMemo(
    () => (allowedDocumentTypes?.length ? [...allowedDocumentTypes] : documentTypes),
    [allowedDocumentTypes]
  );
  const availabilityQuery = useGetAdmissionCrmGeneratedDocumentAvailabilityQuery({ leadId });
  const availableDocumentTypes = useMemo(
    () =>
      configuredDocumentTypes.filter(
        (type) =>
          !availabilityQuery.data ||
          availabilityQuery.data.some((item) => item.documentType === type && item.isAvailable)
      ),
    [availabilityQuery.data, configuredDocumentTypes]
  );
  const unavailableDocuments = useMemo(
    () =>
      (availabilityQuery.data || []).filter(
        (item) => configuredDocumentTypes.includes(item.documentType) && !item.isAvailable
      ),
    [availabilityQuery.data, configuredDocumentTypes]
  );
  const [documentType, setDocumentType] = useState<AdmissionCrmGeneratedDocumentType>(
    configuredDocumentTypes[0]
  );
  const [language, setLanguage] = useState('en');
  const [reason, setReason] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [delivery, setDelivery] = useState<AdmissionCrmMessageDeliveryLogDto | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [preview, previewState] = usePreviewAdmissionCrmGeneratedDocumentMutation();
  const [issue, issueState] = useIssueAdmissionCrmGeneratedDocumentMutation();
  const [sendEmail, sendEmailState] = useSendAdmissionCrmGeneratedDocumentEmailMutation();
  const [retryDelivery, retryState] = useRetryAdmissionCrmMessageDeliveryMutation();
  const historyQuery = useGetAdmissionCrmGeneratedDocumentHistoryQuery({ leadId });
  const visibleHistory = useMemo(
    () =>
      (historyQuery.data || []).filter((item) =>
        configuredDocumentTypes.includes(item.documentType)
      ),
    [configuredDocumentTypes, historyQuery.data]
  );

  useEffect(() => {
    if (availableDocumentTypes.length > 0 && !availableDocumentTypes.includes(documentType)) {
      setDocumentType(availableDocumentTypes[0]);
    }
  }, [availableDocumentTypes, documentType]);

  useEffect(() => {
    if (availabilityQuery.data && availableDocumentTypes.length === 0) setEditorOpen(false);
  }, [availabilityQuery.data, availableDocumentTypes.length]);

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
      setEditorOpen(false);
      shikshaMitraToast.success({ message: `${result.documentTypeName} issued.` });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error, 'Unable to issue the document.') });
    }
  };

  const runSendEmail = async () => {
    try {
      const result = await sendEmail({
        leadId,
        documentType,
        language,
        reason: reason.trim() || null,
      }).unwrap();
      setDelivery(result.delivery || null);
      setDeliveryError(result.deliveryError || null);
      if (result.deliveryError || !result.delivery) {
        shikshaMitraToast.warning({
          message: 'The hall ticket was issued, but the email was not sent. Check the applicant email and retry.',
        });
        return;
      }
      const delivered = ['Sent', 'Delivered'].includes(result.delivery.status);
      if (delivered) {
        shikshaMitraToast.success({ message: 'Hall ticket sent to the applicant email.' });
      } else {
        shikshaMitraToast.warning({
          message: `Hall ticket issued; email status is ${result.delivery.status}.`,
        });
      }
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error, 'Unable to email the hall ticket.') });
    }
  };

  const runRetry = async () => {
    if (!delivery) return;
    try {
      const result = await retryDelivery({
        deliveryLogId: delivery.id,
        body: { reason: 'Retry hall ticket email' },
      }).unwrap();
      setDelivery(result);
      setDeliveryError(null);
      shikshaMitraToast.success({ message: `Email retry recorded with status ${result.status}.` });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error, 'Unable to retry the email.') });
    }
  };

  const hallTicketOnly =
    configuredDocumentTypes.length === 1 &&
    configuredDocumentTypes[0] === AdmissionCrmGeneratedDocumentType.HallTicket;
  const hallTicketDisabled =
    hallTicketOnly &&
    unavailableDocuments.some((item) => item.reasonCode === 'AdmissionCrm:HallTicketDisabledForExam');

  if (hallTicketDisabled) return null;

  return (
    <ApplicantSection
      title={title}
      description={description}
      action={
        <Button
          size="small"
          variant={editorOpen ? 'text' : 'outlined'}
          startIcon={<Description />}
          disabled={availabilityQuery.isFetching || availableDocumentTypes.length === 0}
          onClick={() => setEditorOpen((current) => !current)}
        >
          {editorOpen ? 'Close' : 'Generate document'}
        </Button>
      }
    >
      <Stack spacing={1.25}>
        <Chip
          size="small"
          label="CRM-owned"
          color="primary"
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        />
        {availableDocumentTypes.length === 0
          ? unavailableDocuments.map((item) => (
              <Alert key={item.documentType} severity="info">
                {item.message}
              </Alert>
            ))
          : null}
        {editorOpen ? (
          <>
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
                {availableDocumentTypes.map((type) => (
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
                {hallTicketOnly ? 'Preview Hall Ticket' : 'Preview'}
              </LoadingButton>
              {hallTicketOnly ? (
                <LoadingButton
                  variant="contained"
                  startIcon={<EmailOutlined />}
                  loading={sendEmailState.isLoading}
                  onClick={runSendEmail}
                >
                  Send Hall Ticket
                </LoadingButton>
              ) : (
                <LoadingButton
                  variant="contained"
                  startIcon={<Description />}
                  loading={issueState.isLoading}
                  onClick={runIssue}
                >
                  Issue document
                </LoadingButton>
              )}
            </Stack>
          </>
        ) : null}
        {delivery ? (
          <Alert
            severity={['Sent', 'Delivered'].includes(delivery.status) ? 'success' : 'warning'}
            action={
              !['Sent', 'Delivered'].includes(delivery.status) ? (
                <LoadingButton
                  color="inherit"
                  size="small"
                  startIcon={<ReplayOutlined />}
                  loading={retryState.isLoading}
                  onClick={runRetry}
                >
                  Retry
                </LoadingButton>
              ) : undefined
            }
          >
            Email status: {delivery.status}. {delivery.statusDetails}
          </Alert>
        ) : null}
        {deliveryError && !delivery ? (
          <Alert severity="warning">
            Hall ticket issued, but the email was not sent: {deliveryError}. Correct the applicant
            email or communication setup, then use Send Hall Ticket again.
          </Alert>
        ) : null}
        {historyQuery.isFetching ? (
          <Typography variant="caption">{'Loading issue history\u2026'}</Typography>
        ) : null}
        {historyQuery.isError ? (
          <Alert severity="warning">Document history is temporarily unavailable.</Alert>
        ) : null}
        {visibleHistory.length > 0 ? (
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              Issue history
            </Typography>
            {visibleHistory.map((item) => (
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
    </ApplicantSection>
  );
}
