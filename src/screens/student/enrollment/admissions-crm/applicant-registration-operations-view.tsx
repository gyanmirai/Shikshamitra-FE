'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Description } from '@mui/icons-material';

import {
  Box,
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import { ApplicantEmptyState } from './applicant-workspace-primitives';

import { useApplicantRegistrationWorkspace } from './applicant-registration-operations-context';

import { ApplicantRegistrationSection1 } from './applicant-registration-operations-section-1';

import { ApplicantRegistrationSection2 } from './applicant-registration-operations-section-2';

export function ApplicantRegistrationView() {
  const { state: controllerState, actions, meta } = useApplicantRegistrationWorkspace();
  const {
    canIssueRegistration,
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
    setIssueFormOpen,
    setRegistrationTemplateId,
    setSeriesId,
    templatesQuery,
    waiveFee,
  } = { ...controllerState, ...actions, ...meta };

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
      <ApplicantRegistrationSection1 />

      <ApplicantRegistrationSection2 />
    </Stack>
  );
}
