'use client';

import { LoadingButton } from 'src/components/loading-button';

import {
  Box,
  Paper,
  Alert,
  Stack,
  Button,
  Dialog,
  Collapse,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormHelperText,
  LinearProgress,
} from '@mui/material';

import { quickInquiryFieldLimits } from './quick-inquiry-options';

import { usePipelineWorkspaceWorkspace } from './pipeline-workspace-context';

import { PipelineQuickInquiryDetails } from './pipeline-workspace-section-21';

const permissionRoot = 'Students.Enrollment.AdmissionsCrm';

const actionPermissions = {
  add: `${permissionRoot}.Add`,
  assignOwner: `${permissionRoot}.AssignOwner`,
  manageTasks: `${permissionRoot}.ManageTasks`,
  changeStage: `${permissionRoot}.ChangeStage`,
  archiveReopen: `${permissionRoot}.ArchiveReopen`,
  scheduleExam: `${permissionRoot}.ScheduleExam`,
  issueRegistrationForm: `${permissionRoot}.IssueRegistrationForm`,
  overrideExamCapacity: `${permissionRoot}.OverrideExamCapacity`,
  manageConfiguration: `${permissionRoot}.ManageConfiguration`,
};

export function PipelineWorkspaceSection2() {
  const { state: controllerState, actions, meta } = usePipelineWorkspaceWorkspace();
  const {
    academicMediumId,
    academicYearName,
    admissionYearSettingsHref,
    admissionYearStandardOptions,
    admissionYearStandardOptionsQuery,
    admissionYearStandardsLoading,
    availableSourceOptions,
    boardInputRef,
    boardOptions,
    can,
    channelInputRef,
    closeQuickInquiry,
    contactInputRef,
    createLeadState,
    duplicateMatches,
    duplicateReasonInputRef,
    duplicateReviewed,
    emailInputRef,
    firstNameInputRef,
    guardianInputRef,
    handleCreateInquiry,
    inquirySourceInputRef,
    inquiryTypeInputRef,
    mediumInputRef,
    mediumOptions,
    pipelineSettingsHref,
    previewDuplicatesState,
    quickDialogOpen,
    quickForm,
    quickFormSubmitted,
    quickInquiryOptions,
    quickInquiryOptionsLoading,
    quickInquiryOptionsMissing,
    quickInquiryOptionsQuery,
    quickInquiryOptionsUnavailable,
    quickInquiryPhoneInvalid,
    routeInputRef,
    selectedQuickInquiryRoute,
    selectedStandard,
    setDuplicateReviewed,
    setQuickEmailTouched,
    setQuickForm,
    setShowOptionalQuickInquiryFields,
    showOptionalQuickInquiryFields,
    showQuickInquiryContactError,
    showQuickInquiryEmailError,
    standardOptions,
    targetStandardInputRef,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <Dialog open={quickDialogOpen} onClose={closeQuickInquiry} fullWidth maxWidth="md">
        <DialogTitle>Add Inquiry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">
              New applicants start in New Inquiry. Board, medium, and standard come from the
              published Admission Year Setup.
            </Alert>
            <Paper variant="outlined" sx={{ p: 1.25 }}>
              <Typography variant="caption" color="text.secondary">
                Admission year
              </Typography>
              <Typography variant="body2">
                {academicYearName || 'Selected academic year'}
              </Typography>
            </Paper>

            {quickInquiryOptionsLoading && <LinearProgress aria-label="Loading inquiry options" />}
            {quickInquiryOptionsQuery.isError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => quickInquiryOptionsQuery.refetch()}
                  >
                    Retry
                  </Button>
                }
              >
                Inquiry sources, types, channels, and admission pathways could not be loaded.
              </Alert>
            )}
            {quickInquiryOptionsMissing && (
              <Alert
                severity="warning"
                action={
                  can(actionPermissions.manageConfiguration) ? (
                    <Button color="inherit" size="small" href={pipelineSettingsHref}>
                      Open Pipeline Settings
                    </Button>
                  ) : undefined
                }
              >
                Add Inquiry needs an active channel, source, inquiry type, and admission pathway.
              </Alert>
            )}
            {quickInquiryOptionsQuery.data?.isAdmissionCycleActive === false && (
              <Alert
                severity="warning"
                action={
                  can(actionPermissions.manageConfiguration) ? (
                    <Button color="inherit" size="small" href={admissionYearSettingsHref}>
                      Open Admission Year Setup
                    </Button>
                  ) : undefined
                }
              >
                Add Inquiry is unavailable because the admission year is not active.
              </Alert>
            )}
            {admissionYearStandardOptionsQuery.isError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => admissionYearStandardOptionsQuery.refetch()}
                  >
                    Retry
                  </Button>
                }
              >
                Boards, mediums, and standards could not be loaded from Admission Year Setup.
              </Alert>
            )}
            {!admissionYearStandardsLoading &&
              admissionYearStandardOptionsQuery.data &&
              !admissionYearStandardOptions.length && (
                <Alert
                  severity="warning"
                  action={
                    can(actionPermissions.manageConfiguration) ? (
                      <Button color="inherit" size="small" href={admissionYearSettingsHref}>
                        Open Admission Year Setup
                      </Button>
                    ) : undefined
                  }
                >
                  No standards are available in the published Admission Year Setup.
                </Alert>
              )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Student details
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                <TextField
                  required
                  fullWidth
                  inputRef={firstNameInputRef}
                  name="firstName"
                  autoComplete="given-name"
                  label="First name"
                  value={quickForm.firstName}
                  error={quickFormSubmitted && !quickForm.firstName.trim()}
                  helperText={
                    quickFormSubmitted && !quickForm.firstName.trim()
                      ? 'Enter the student’s first name.'
                      : undefined
                  }
                  slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.name } }}
                  onChange={(event) => {
                    setQuickForm((current) => ({ ...current, firstName: event.target.value }));
                    setDuplicateReviewed(false);
                  }}
                />
                <TextField
                  fullWidth
                  name="middleName"
                  autoComplete="additional-name"
                  label="Middle name (optional)"
                  value={quickForm.middleName}
                  slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.name } }}
                  onChange={(event) => {
                    setQuickForm((current) => ({ ...current, middleName: event.target.value }));
                    setDuplicateReviewed(false);
                  }}
                />
                <TextField
                  fullWidth
                  name="lastName"
                  autoComplete="family-name"
                  label="Last name (optional)"
                  value={quickForm.lastName}
                  slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.name } }}
                  onChange={(event) => {
                    setQuickForm((current) => ({ ...current, lastName: event.target.value }));
                    setDuplicateReviewed(false);
                  }}
                />
              </Stack>
              <FormHelperText>
                Keep middle and last names separate so registration can reuse them without asking
                the family again. They remain optional for students with a single name.
              </FormHelperText>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Family contact
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                <TextField
                  required
                  fullWidth
                  inputRef={guardianInputRef}
                  name="parentGuardianName"
                  autoComplete="name"
                  label="Parent or guardian"
                  value={quickForm.parentGuardianName}
                  error={quickFormSubmitted && !quickForm.parentGuardianName.trim()}
                  helperText={
                    quickFormSubmitted && !quickForm.parentGuardianName.trim()
                      ? 'Enter the parent or guardian name.'
                      : undefined
                  }
                  slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.name } }}
                  onChange={(event) => {
                    setQuickForm((current) => ({
                      ...current,
                      parentGuardianName: event.target.value,
                    }));
                    setDuplicateReviewed(false);
                  }}
                />
                <TextField
                  required
                  fullWidth
                  inputRef={contactInputRef}
                  name="primaryContactNo"
                  label="Contact number"
                  type="tel"
                  autoComplete="tel"
                  value={quickForm.primaryContactNo}
                  error={showQuickInquiryContactError || quickInquiryPhoneInvalid}
                  helperText={
                    quickInquiryPhoneInvalid
                      ? 'Enter a valid contact number containing 7 to 15 digits.'
                      : showQuickInquiryContactError
                        ? 'Add the parent or guardian mobile number.'
                        : 'Used for admission follow-up and status messages.'
                  }
                  slotProps={{
                    htmlInput: {
                      inputMode: 'tel',
                      maxLength: quickInquiryFieldLimits.contact,
                    },
                  }}
                  onChange={(event) => {
                    setQuickForm((current) => ({
                      ...current,
                      primaryContactNo: event.target.value,
                    }));
                    setDuplicateReviewed(false);
                  }}
                />
                <TextField
                  fullWidth
                  inputRef={emailInputRef}
                  name="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={quickForm.email}
                  error={showQuickInquiryEmailError}
                  helperText={
                    showQuickInquiryEmailError
                      ? 'Enter a valid email address, for example parent@example.com.'
                      : 'Optional.'
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">@</InputAdornment>,
                  }}
                  slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.email } }}
                  onBlur={() => setQuickEmailTouched(true)}
                  onChange={(event) => {
                    setQuickForm((current) => ({ ...current, email: event.target.value }));
                    setDuplicateReviewed(false);
                  }}
                />
              </Stack>
            </Box>

            <PipelineQuickInquiryDetails />

            <Box>
              <Button
                size="small"
                onClick={() => setShowOptionalQuickInquiryFields((current) => !current)}
                aria-expanded={showOptionalQuickInquiryFields}
                aria-controls="quick-inquiry-optional-fields"
              >
                {showOptionalQuickInquiryFields ? 'Hide optional details' : 'Add optional details'}
              </Button>
              <Collapse in={showOptionalQuickInquiryFields}>
                <Stack id="quick-inquiry-optional-fields" spacing={1} sx={{ pt: 1 }}>
                  <TextField
                    name="admissionIntent"
                    label="Intent notes"
                    value={quickForm.admissionIntent}
                    slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.intent } }}
                    onChange={(event) => {
                      setQuickForm((current) => ({
                        ...current,
                        admissionIntent: event.target.value,
                      }));
                      setDuplicateReviewed(false);
                    }}
                    helperText="Optional context beyond the selected admission pathway."
                  />
                  <TextField
                    name="campaignName"
                    label="Campaign"
                    value={quickForm.campaignName}
                    slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.campaign } }}
                    onChange={(event) =>
                      setQuickForm((current) => ({
                        ...current,
                        campaignName: event.target.value,
                      }))
                    }
                  />
                  <TextField
                    name="notes"
                    label="Internal notes"
                    value={quickForm.notes}
                    slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.notes } }}
                    onChange={(event) =>
                      setQuickForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    multiline
                    minRows={2}
                  />
                </Stack>
              </Collapse>
            </Box>

            {duplicateMatches.length > 0 && (
              <Alert severity="warning">
                {duplicateMatches.length} likely duplicate inquiry record
                {duplicateMatches.length === 1 ? '' : 's'} found. Review them from the applicant
                workspace after creation or cancel this entry.
              </Alert>
            )}
            {duplicateMatches.length > 0 && (
              <TextField
                required
                fullWidth
                inputRef={duplicateReasonInputRef}
                name="duplicateContinueReason"
                label="Reason to continue"
                value={quickForm.duplicateContinueReason}
                slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.notes } }}
                error={quickFormSubmitted && !quickForm.duplicateContinueReason.trim()}
                helperText={
                  quickFormSubmitted && !quickForm.duplicateContinueReason.trim()
                    ? 'Explain why this possible duplicate should be created.'
                    : 'This reason is stored for audit review.'
                }
                onChange={(event) =>
                  setQuickForm((current) => ({
                    ...current,
                    duplicateContinueReason: event.target.value,
                  }))
                }
                multiline
                minRows={2}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeQuickInquiry}
            disabled={createLeadState.isLoading || previewDuplicatesState.isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            loading={createLeadState.isLoading || previewDuplicatesState.isLoading}
            disabled={quickInquiryOptionsUnavailable}
            onClick={handleCreateInquiry}
          >
            {duplicateReviewed && duplicateMatches.length ? 'Create Anyway' : 'Create Inquiry'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
