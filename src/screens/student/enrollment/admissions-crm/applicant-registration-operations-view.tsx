'use client';

import { useState } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import { shikshaMitraToast } from 'src/components/toast';

import { Description, ReplayOutlined } from '@mui/icons-material';

import {
  Box,
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { AdmissionCrmRegistrationAccessMode } from 'src/redux/student/admissions-crm/registration-documents-contracts';
import type { AdmissionCrmMessageDeliveryLogDto } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';
import { useSendAdmissionCrmRegistrationInvitationMutation } from 'src/redux/student/admissions-crm/registration-documents-api';

import { ApplicantEmptyState } from './applicant-workspace-primitives';

import { useApplicantRegistrationWorkspace } from './applicant-registration-operations-context';

import { ApplicantRegistrationSection1 } from './applicant-registration-operations-section-1';

import { ApplicantRegistrationSection2 } from './applicant-registration-operations-section-2';

export function ApplicantRegistrationView() {
  const [invitationDelivery, setInvitationDelivery] =
    useState<AdmissionCrmMessageDeliveryLogDto | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [sendInvitation, sendInvitationState] =
    useSendAdmissionCrmRegistrationInvitationMutation();
  const { state: controllerState, actions, meta } = useApplicantRegistrationWorkspace();
  const {
    canIssueRegistration,
    accessMode,
    closeIssueForm,
    issue,
    issueFormOpen,
    issueState,
    leadId,
    perform,
    registration,
    registrationQuery,
    registrationTemplateId,
    seriesId,
    seriesQuery,
    readinessQuery,
    setIssueFormOpen,
    setAccessMode,
    setRegistrationTemplateId,
    setSeriesId,
    templatesQuery,
    waiveFee,
  } = { ...controllerState, ...actions, ...meta };

  const invitationDelivered =
    invitationDelivery != null && ['Sent', 'Delivered'].includes(invitationDelivery.status);

  const applyInvitationResult = (result: {
    delivery?: AdmissionCrmMessageDeliveryLogDto | null;
    deliveryError?: string | null;
  }) => {
    setInvitationDelivery(result.delivery || null);
    setInvitationError(result.deliveryError || null);
  };

  if (registrationQuery.isFetching) return <LinearProgress />;

  if (registrationQuery.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => registrationQuery.refetch()}>
            Retry
          </Button>
        }
      >
        Registration details could not be loaded. Retry before issuing or updating a registration.
      </Alert>
    );
  }

  if (!registration) {
    return (
      <Box id="registration-issue-operation" component="section" tabIndex={-1}>
        <Stack spacing={1.25}>
          <Typography variant="subtitle2">Registration</Typography>
          {templatesQuery.isError || seriesQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    templatesQuery.refetch();
                    seriesQuery.refetch();
                  }}
                >
                  Retry
                </Button>
              }
            >
              Registration templates or number series could not be loaded.
            </Alert>
          ) : null}
          {readinessQuery.isFetching ? (
            <LinearProgress aria-label="Checking registration readiness" />
          ) : null}
          {readinessQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => readinessQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Registration readiness could not be checked.
            </Alert>
          ) : null}
          {readinessQuery.data?.blockers.map((blocker) => (
            <Alert key={blocker.code} severity="warning">
              {blocker.message}
            </Alert>
          ))}
          <ApplicantEmptyState
            title="Registration has not been issued"
            description="Select a template and expiry date to start the applicant registration."
            action={
              !issueFormOpen && canIssueRegistration ? (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Description />}
                  disabled={templatesQuery.isError || seriesQuery.isError}
                  onClick={() => setIssueFormOpen(true)}
                >
                  Issue registration
                </Button>
              ) : undefined
            }
          />
          {issueFormOpen && canIssueRegistration ? (
            <Stack spacing={1.25}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  How should the form be completed?
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  value={accessMode}
                  onChange={(_, value) => {
                    if (value != null) setAccessMode(value);
                  }}
                  aria-label="Registration access mode"
                >
                  <ToggleButton value={AdmissionCrmRegistrationAccessMode.Online}>
                    Send online
                  </ToggleButton>
                  <ToggleButton value={AdmissionCrmRegistrationAccessMode.StaffAssisted}>
                    Staff-assisted
                  </ToggleButton>
                  <ToggleButton value={AdmissionCrmRegistrationAccessMode.Both}>
                    Both
                  </ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color="text.secondary">
                  {accessMode === AdmissionCrmRegistrationAccessMode.Online
                    ? 'Email a secure link for the family to complete.'
                    : accessMode === AdmissionCrmRegistrationAccessMode.StaffAssisted
                      ? 'Issue the same form for staff to enter with the family.'
                      : 'Email the secure link and allow staff to help with the same shared draft.'}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
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
              </Box>
              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <LoadingButton
                  variant="contained"
                  startIcon={<Description />}
                  loading={issueState.isLoading}
                  disabled={
                    !registrationTemplateId ||
                    readinessQuery.isFetching ||
                    !readinessQuery.data?.canIssue
                  }
                  onClick={() => {
                    perform(
                      async () => {
                        const result = await issue({
                          leadId,
                          body: {
                            registrationTemplateId,
                            accessMode,
                            formNumberSeriesId: seriesId || null,
                            waiveFee: false,
                          },
                        }).unwrap();
                        applyInvitationResult(result);
                        if (result.deliveryError) {
                          shikshaMitraToast.warning({
                            message:
                              'Registration was issued, but the invitation was not sent. Use the inline retry action after correcting the delivery issue.',
                          });
                        }
                      },
                      'Registration issued.'
                    ).then((saved) => {
                      if (saved) closeIssueForm();
                    });
                  }}
                >
                  Issue
                </LoadingButton>
                <Button size="small" onClick={closeIssueForm}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </Box>
    );
  }

  return (
    <Stack spacing={1.25}>
      {registration.accessMode !== AdmissionCrmRegistrationAccessMode.StaffAssisted &&
      canIssueRegistration ? (
        <Alert
          severity={invitationDelivered ? 'success' : invitationDelivery || invitationError ? 'warning' : 'info'}
          action={
            !invitationDelivered ? (
              <LoadingButton
                color="inherit"
                size="small"
                startIcon={<ReplayOutlined />}
                loading={sendInvitationState.isLoading}
                onClick={() =>
                  perform(
                    async () => {
                      const result = await sendInvitation({ registrationId: registration.id }).unwrap();
                      applyInvitationResult(result);
                    },
                    'Registration invitation attempt recorded.'
                  )
                }
              >
                {invitationDelivery || invitationError ? 'Retry invitation' : 'Send invitation'}
              </LoadingButton>
            ) : undefined
          }
        >
          {invitationError
            ? `Invitation was not sent: ${invitationError}`
            : invitationDelivery
              ? `Invitation status: ${invitationDelivery.status}. ${invitationDelivery.statusDetails}`
              : 'Online registration access is enabled. Send or retry the secure invitation email here.'}
        </Alert>
      ) : null}
      <ApplicantRegistrationSection1 />

      <ApplicantRegistrationSection2 />
    </Stack>
  );
}
