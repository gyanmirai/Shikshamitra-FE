'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Drawer, Button, Divider, IconButton, Typography } from '@mui/material';
import { readAdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { WorkflowStageFields } from './workflow-builder/components/workflow-stage-fields';
import { useWorkflowStageEditor } from './workflow-builder/hooks/use-workflow-stage-editor';

type Props = {
  open: boolean;
  stage: AdmissionWorkflowStage | null;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  stages?: AdmissionWorkflowStage[];
  transitions?: AdmissionWorkflowTransition[];
  readOnly: boolean;
  onClose: () => void;
  onSave: (stage: AdmissionWorkflowStage) => void;
};

export function AdmissionWorkflowStageDrawer(props: Props) {
  const {
    open,
    stage,
    stageTypes,
    forms,
    stages = [],
    transitions,
    readOnly,
    onClose,
    onSave,
  } = props;
  const {
    formik,
    metadata,
    formDefinitionId,
    forms: resolvedForms,
    formDetailsLoading,
    formDetailsError,
    formDetailsUnavailable,
    retryFormDetails,
    discard,
    close,
    requestClose,
  } =
    useWorkflowStageEditor({ open, stage, stageTypes, stages, forms, readOnly, onClose, onSave });
  const verificationRequired =
    formik.values.stageType === 1 &&
    readAdmissionFormStagePolicy(formik.values.configurationJson)?.requireSectionVerification;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={requestClose}
        PaperProps={{ sx: { width: { xs: 1, sm: 720 }, maxWidth: 1 } }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={formik.handleSubmit}
          sx={{ height: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={1}
            sx={{ px: { xs: 2, sm: 3 }, py: 2 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6">{readOnly ? 'Stage details' : 'Configure stage'}</Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {metadata?.displayName ?? 'Stage'} · {formik.values.code || 'New stage'}
                </Typography>
                <Label color={formik.values.isRequired ? 'default' : 'info'}>
                  {formik.values.isRequired ? 'Required' : 'Optional'}
                </Label>
              </Stack>
            </Box>
            <IconButton
              aria-label="Close stage editor"
              onClick={requestClose}
              sx={{ width: 44, height: 44, mt: -0.75, mr: -1 }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider />
          <WorkflowStageFields
            formik={formik}
            metadata={metadata}
            stageTypes={stageTypes}
            forms={resolvedForms}
            formDetailsLoading={formDetailsLoading}
            formDetailsError={formDetailsError}
            onRetryFormDetails={retryFormDetails}
            stages={stages}
            transitions={transitions}
            formDefinitionId={formDefinitionId}
            readOnly={readOnly}
          />
          {!readOnly && (
            <>
              <Divider />
              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={1}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: 'background.paper',
                  '& .MuiButton-root': {
                    minHeight: 44,
                    minWidth: { sm: 104 },
                    flex: { xs: 1, sm: 'initial' },
                  },
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="mdi:close" />}
                  onClick={requestClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    formik.values.stageType === 0 ||
                    (verificationRequired && formDetailsUnavailable)
                  }
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon="mdi:content-save-outline" />}
                >
                  Save stage
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Drawer>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard stage changes?"
        content="Your changes to this stage have not been added to the workflow draft."
        action={
          <Button variant="contained" color="error" onClick={close}>
            Discard changes
          </Button>
        }
      />
    </>
  );
}
