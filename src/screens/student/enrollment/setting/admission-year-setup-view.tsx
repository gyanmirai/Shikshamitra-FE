'use client';

import type { IData } from 'src/components/customizabaleTable/types';

import type { AdmissionCrmAdmissionYearSetupDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { Iconify } from 'src/components/iconify';

import CustomizableTable from 'src/components/customizabaleTable';

import {
  Box,
  Chip,
  Step,
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  Divider,
  Stepper,
  TextField,
  StepLabel,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  LinearProgress,
} from '@mui/material';

import { EnrollmentSettingsPage } from './enrollment-settings-page';

import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
  enrollmentEmbeddedTableContainerSx,
} from '../admissions-crm/workspace-table-patterns';

import {
  type AdmissionYearSetupStep,
  validateAdmissionYearSetupForPublish,
} from './admission-year-setup-model';

import { useAdmissionYearSetupWorkspace } from './admission-year-setup-context';

const setupSteps = ['Admission scope', 'Dates and gates', 'Ownership', 'Review and publish'];

export function AdmissionYearSetupView() {
  const { state: controllerState, actions, meta } = useAdmissionYearSetupWorkspace();
  const {
    academicYearId,
    academicYearName,
    activeStep,
    closeDialogOpen,
    closeReason,
    columns,
    draft,
    form,
    handleClose,
    handleCreateDraft,
    handleNext,
    handlePublish,
    hasRequiredQueryError,
    hasRequiredQueryPending,
    isBusy,
    isDirty,
    publishDialogOpen,
    published,
    renderStep,
    saveDraft,
    setActiveStep,
    setCloseDialogOpen,
    setCloseReason,
    setPublishDialogOpen,
    setValidationErrors,
    staffQuery,
    standardsQuery,
    validationErrors,
    versions,
    versionsQuery,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <EnrollmentSettingsPage
        title="Admission Year Setup"
        description="Define the admission scope and publish one versioned setup for the selected academic year."
        layout={draft ? 'document' : 'table'}
      >
        <Stack spacing={1.5} sx={{ minWidth: 0, minHeight: 0, flex: 1 }}>
          {!academicYearId ? (
            <Alert severity="warning">Select an academic year before configuring admissions.</Alert>
          ) : null}
          {versionsQuery.isFetching || standardsQuery.isFetching || staffQuery.isFetching ? (
            <LinearProgress aria-label="Loading Admission Year Setup" />
          ) : null}
          {hasRequiredQueryError ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  onClick={() => {
                    versionsQuery.refetch();
                    standardsQuery.refetch();
                    staffQuery.refetch();
                  }}
                >
                  Retry
                </Button>
              }
            >
              Admission Year Setup could not be loaded.
            </Alert>
          ) : null}

          {academicYearId && !hasRequiredQueryError ? (
            <Paper
              data-testid="admission-year-context"
              variant="outlined"
              sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1.5 }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                gap={2}
                alignItems={{ md: 'center' }}
                justifyContent="space-between"
              >
                <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                  <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="overline" color="text.secondary">
                      Selected academic year
                    </Typography>
                    {draft ? (
                      <Chip
                        size="small"
                        color="warning"
                        variant="outlined"
                        label={`Draft v${draft.version}`}
                      />
                    ) : published ? (
                      <Chip
                        size="small"
                        color="success"
                        variant="outlined"
                        label={`Published v${published.version}`}
                        icon={<Iconify icon="mdi:check-decagram-outline" />}
                      />
                    ) : (
                      <Chip size="small" variant="outlined" label="Not published" />
                    )}
                  </Stack>
                  <Typography component="h2" variant="h5" sx={{ textWrap: 'balance' }}>
                    {draft
                      ? `Continue setup for ${academicYearName || academicYearId}`
                      : published
                        ? `${academicYearName || academicYearId} is accepting governed admissions`
                        : `Prepare admissions for ${academicYearName || academicYearId}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textWrap: 'pretty' }}>
                    {draft
                      ? 'Complete the remaining decisions, save the draft, and publish when the school is ready.'
                      : published
                        ? 'The published version governs new inquiries. Create a new version to change future admissions.'
                        : 'Choose the standards, dates, gates, and owners that will govern every new applicant.'}
                  </Typography>
                  {!draft && !published ? (
                    <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ pt: 0.25 }}>
                      {['Choose standards', 'Set dates & gates', 'Assign owners'].map((item) => (
                        <Chip
                          key={item}
                          size="small"
                          variant="outlined"
                          icon={<Iconify icon="mdi:check-circle-outline" />}
                          label={item}
                        />
                      ))}
                    </Stack>
                  ) : null}
                </Stack>
                <Stack direction="row" gap={1} flexWrap="wrap" sx={{ flexShrink: 0 }}>
                  {published && !draft ? (
                    <Button
                      color="warning"
                      startIcon={<Iconify icon="mdi:lock-outline" />}
                      disabled={isBusy}
                      onClick={() => setCloseDialogOpen(true)}
                    >
                      Close admission year
                    </Button>
                  ) : null}
                  {draft ? (
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="mdi:content-save-outline" />}
                      disabled={
                        isBusy || !isDirty || hasRequiredQueryError || hasRequiredQueryPending
                      }
                      onClick={() => saveDraft()}
                    >
                      Save draft
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="mdi:file-document-plus-outline" />}
                      disabled={
                        isBusy ||
                        !academicYearId ||
                        hasRequiredQueryError ||
                        hasRequiredQueryPending
                      }
                      onClick={handleCreateDraft}
                    >
                      {versions.length ? 'Create new version' : 'Start setup'}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ) : null}

          {draft && !hasRequiredQueryError && !hasRequiredQueryPending ? (
            <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1.5 }}>
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{ mb: 3, minWidth: 0, overflowX: 'auto' }}
              >
                {setupSteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {validationErrors.length ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {validationErrors.map((error) => (
                    <Typography key={error} variant="body2">
                      {error}
                    </Typography>
                  ))}
                </Alert>
              ) : null}

              <Box sx={{ minHeight: 280 }}>{renderStep()}</Box>

              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" gap={1}>
                <Button
                  startIcon={<Iconify icon="eva:arrow-back-fill" />}
                  disabled={activeStep === 0 || isBusy}
                  onClick={() =>
                    setActiveStep((current) => Math.max(0, current - 1) as AdmissionYearSetupStep)
                  }
                >
                  Back
                </Button>
                <Stack direction="row" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:content-save-outline" />}
                    disabled={
                      isBusy || !isDirty || hasRequiredQueryError || hasRequiredQueryPending
                    }
                    onClick={() => saveDraft()}
                  >
                    Save draft
                  </Button>
                  {activeStep < 3 ? (
                    <Button
                      variant="contained"
                      endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                      disabled={isBusy || hasRequiredQueryError || hasRequiredQueryPending}
                      onClick={handleNext}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Iconify icon="mdi:publish" />}
                      disabled={isBusy || hasRequiredQueryError || hasRequiredQueryPending}
                      onClick={() => {
                        const errors = validateAdmissionYearSetupForPublish(form);
                        setValidationErrors(errors);
                        if (!errors.length) setPublishDialogOpen(true);
                      }}
                    >
                      Publish version
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ) : null}

          {!hasRequiredQueryError ? (
            <Box
              component="section"
              aria-labelledby="admission-year-version-history-title"
              sx={{
                pt: 0.5,
                display: 'flex',
                flexDirection: 'column',
                flex: draft ? undefined : 1,
                minHeight: draft ? undefined : 0,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ mb: 1 }}
              >
                <Typography id="admission-year-version-history-title" component="h2" variant="h6">
                  Version history
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {versions.length} {versions.length === 1 ? 'version' : 'versions'}
                </Typography>
              </Stack>
              <CustomizableTable
                tableId="student-enrollment-admission-year-versions"
                tableTitle="Admission Year Versions"
                columns={columns}
                data={versions as unknown as IData[]}
                isLoading={versionsQuery.isLoading}
                isFilter
                isPagination
                defaultRowsPerPage={10}
                rowsPerPageOptions={[10, 25]}
                noDataText={
                  <EnrollmentTableEmptyState
                    title="No Admission Year versions"
                    description="Start setup to create the first version for this academic year."
                  />
                }
                rowProps={(row) => {
                  const version = row as unknown as AdmissionCrmAdmissionYearSetupDto;
                  return {
                    'data-testid': 'student-enrollment-admission-year-version-row',
                    'data-version': version.version,
                  };
                }}
                wrapperProps={{ sx: enrollmentTableWrapperSx }}
                tableContainerProps={{
                  sx: draft ? enrollmentEmbeddedTableContainerSx : enrollmentTableContainerSx,
                }}
              />
            </Box>
          ) : null}
        </Stack>
      </EnrollmentSettingsPage>

      <Dialog
        open={publishDialogOpen && !hasRequiredQueryError && !hasRequiredQueryPending}
        onClose={() => !isBusy && setPublishDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Publish Admission Year version {draft?.version}?</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Applicants captured after publication retain this version even when a newer version is
            published.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button disabled={isBusy} onClick={() => setPublishDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={isBusy || hasRequiredQueryError || hasRequiredQueryPending}
            onClick={handlePublish}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={closeDialogOpen && !hasRequiredQueryError && !hasRequiredQueryPending}
        onClose={() => !isBusy && setCloseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Close Admission Year?</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning">
              Closing blocks new inquiries under this published version. Existing applicant records
              remain available.
            </Alert>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Reason"
              value={closeReason}
              onChange={(event) => setCloseReason(event.target.value)}
              inputProps={{ maxLength: 2000 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={isBusy} onClick={() => setCloseDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={isBusy || !closeReason.trim()}
            onClick={handleClose}
          >
            Close Admission Year
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
