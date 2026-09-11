'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Drawer, Button, Divider, IconButton, Typography } from '@mui/material';

import { WorkflowStageFields } from './workflow-builder/components/workflow-stage-fields';
import { useWorkflowStageEditor } from './workflow-builder/hooks/use-workflow-stage-editor';

type Props = {
  open: boolean;
  stage: AdmissionWorkflowStage | null;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  stages?: AdmissionWorkflowStage[];
  readOnly: boolean;
  onClose: () => void;
  onSave: (stage: AdmissionWorkflowStage) => void;
};

export function AdmissionWorkflowStageDrawer(props: Props) {
  const { open, stage, stageTypes, forms, stages = [], readOnly, onClose, onSave } = props;
  const { formik, metadata, formDefinitionId, discard, close, requestClose } =
    useWorkflowStageEditor({ open, stage, stageTypes, stages, forms, readOnly, onClose, onSave });

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={requestClose}
        PaperProps={{ sx: { width: { xs: 1, sm: 600 }, maxWidth: 1 } }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={formik.handleSubmit}
          sx={{ height: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
            <Box>
              <Typography variant="h6">{readOnly ? 'Stage details' : 'Configure stage'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Choose the activities and requirements for this stage.
              </Typography>
            </Box>
            <IconButton aria-label="Close stage editor" onClick={requestClose}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider />
          <WorkflowStageFields
            formik={formik}
            metadata={metadata}
            stageTypes={stageTypes}
            forms={forms}
            stages={stages}
            formDefinitionId={formDefinitionId}
            readOnly={readOnly}
          />
          {!readOnly && (
            <>
              <Divider />
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 2 }}>
                <Button variant="outlined" size="small" onClick={requestClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
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
