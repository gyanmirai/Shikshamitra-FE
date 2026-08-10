'use client';

import { LoadingButton } from 'src/components/loading-button';

import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Dialog,
  Button,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { InquiryFormTemplatePreviewDialog } from './inquiry-form-template-preview';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

export function AdmissionsCrmConfigurationSection8() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    duplicateInquiryFormTemplate,
    handleConfirmCycleUpdate,
    handleConfirmStageUpdate,
    handleDuplicateFormTemplate,
    inquiryFormPreviewTemplate,
    isCreatingTemplate,
    isUpdatingCycle,
    isUpdatingPipelineStage,
    pendingCycleUpdate,
    pendingStageUpdate,
    setDuplicateInquiryFormTemplate,
    setInquiryFormPreviewTemplate,
    setPendingCycleUpdate,
    setPendingStageUpdate,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <Dialog
        open={Boolean(pendingCycleUpdate)}
        onClose={() => {
          if (!isUpdatingCycle) setPendingCycleUpdate(null);
        }}
        fullWidth
        maxWidth="md"
        aria-labelledby="cycle-impact-preview-title"
      >
        <DialogTitle id="cycle-impact-preview-title">Review Admission Year Impact</DialogTitle>
        <DialogContent dividers>
          {pendingCycleUpdate ? (
            <Stack spacing={1.5}>
              <Alert severity="warning">
                This is a consequential configuration change. Review the affected applicants,
                dependent configuration, and warnings before saving.
              </Alert>
              <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                <Chip
                  color={pendingCycleUpdate.preview.affectedApplicantCount ? 'warning' : 'default'}
                  label={`${pendingCycleUpdate.preview.affectedApplicantCount} affected applicants`}
                />
                <Chip
                  label={`${pendingCycleUpdate.preview.configurationReferenceCount} configuration references`}
                />
                <Chip label={`${pendingCycleUpdate.preview.changedFields.length} changed fields`} />
              </Stack>
              {pendingCycleUpdate.preview.changedFields.length ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Changed fields
                  </Typography>
                  <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
                    {pendingCycleUpdate.preview.changedFields.map((field) => (
                      <Chip key={field} size="small" label={field} variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              ) : null}
              {pendingCycleUpdate.preview.warnings.map((warning) => (
                <Alert key={warning} severity="warning">
                  {warning}
                </Alert>
              ))}
              {pendingCycleUpdate.preview.referenceFamilies.length ? (
                <Stack spacing={0.75}>
                  <Typography variant="subtitle2">Dependent configuration</Typography>
                  {pendingCycleUpdate.preview.referenceFamilies.map((family) => (
                    <Paper key={family.family} variant="outlined" sx={{ p: 1.25 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {family.family}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {family.description}
                          </Typography>
                        </Box>
                        <Chip size="small" label={`${family.referenceCount} references`} />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button disabled={isUpdatingCycle} onClick={() => setPendingCycleUpdate(null)}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={isUpdatingCycle}
            onClick={handleConfirmCycleUpdate}
          >
            Save Reviewed Changes
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(pendingStageUpdate)}
        onClose={() => {
          if (!isUpdatingPipelineStage) setPendingStageUpdate(null);
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby="stage-impact-preview-title"
      >
        <DialogTitle id="stage-impact-preview-title">Review Pipeline Stage Impact</DialogTitle>
        <DialogContent dividers>
          {pendingStageUpdate ? (
            <Stack spacing={1.5}>
              <Alert severity="warning">
                Changes to {pendingStageUpdate.stageName} can affect active applicants, routing,
                exams, seats, and reporting.
              </Alert>
              <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                <Chip
                  color={pendingStageUpdate.preview.affectedApplicantCount ? 'warning' : 'default'}
                  label={`${pendingStageUpdate.preview.affectedApplicantCount} affected applicants`}
                />
                <Chip
                  label={`${pendingStageUpdate.preview.configurationReferenceCount} configuration references`}
                />
              </Stack>
              {pendingStageUpdate.preview.warnings.map((warning) => (
                <Alert key={warning} severity="warning">
                  {warning}
                </Alert>
              ))}
              {pendingStageUpdate.preview.referenceFamilies.map((family) => (
                <Paper key={family.family} variant="outlined" sx={{ p: 1.25 }}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {family.family}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {family.description}
                      </Typography>
                    </Box>
                    <Chip size="small" label={family.referenceCount} />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button disabled={isUpdatingPipelineStage} onClick={() => setPendingStageUpdate(null)}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={isUpdatingPipelineStage}
            onClick={handleConfirmStageUpdate}
          >
            Save Reviewed Stage
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(duplicateInquiryFormTemplate)}
        onClose={() => {
          if (!isCreatingTemplate) setDuplicateInquiryFormTemplate(null);
        }}
        fullWidth
        maxWidth="xs"
        aria-labelledby="duplicate-inquiry-form-title"
      >
        <DialogTitle id="duplicate-inquiry-form-title">Duplicate Inquiry Form?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Create an inactive draft with the same fields, translations, consent, and visibility
            rules. The original form will not change.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isCreatingTemplate}
            onClick={() => setDuplicateInquiryFormTemplate(null)}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            loading={isCreatingTemplate}
            disabled={!duplicateInquiryFormTemplate}
            onClick={() => {
              if (duplicateInquiryFormTemplate) {
                handleDuplicateFormTemplate(duplicateInquiryFormTemplate);
              }
            }}
          >
            Create Draft Copy
          </LoadingButton>
        </DialogActions>
      </Dialog>
      {inquiryFormPreviewTemplate ? (
        <InquiryFormTemplatePreviewDialog
          key={inquiryFormPreviewTemplate.id}
          template={inquiryFormPreviewTemplate}
          onClose={() => setInquiryFormPreviewTemplate(null)}
        />
      ) : null}
    </>
  );
}
