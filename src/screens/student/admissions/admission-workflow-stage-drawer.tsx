'use client';

import type { ReactNode } from 'react';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Stack, Drawer, Button, Divider, IconButton, Typography } from '@mui/material';
import { getDocumentConfigurationError } from 'src/redux/student/admissions/admission-document-policy-validation';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { isApplicationStageType } from './workflow-builder/workflow-stage-configuration';
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
  onSave: (stage: AdmissionWorkflowStage) => void | boolean;
  placementField?: ReactNode;
};

export function AdmissionWorkflowStageDrawer(props: Props) {
  const {
    open,
    stage,
    stageTypes,
    forms,
    stages: suppliedStages,
    readOnly,
    onClose,
    onSave,
    placementField,
  } = props;
  const stages = suppliedStages ?? [];
  const {
    formik,
    metadata,
    formDefinitionId,
    forms: resolvedForms,
    discard,
    close,
    requestClose,
  } = useWorkflowStageEditor({ open, stage, stageTypes, stages, forms, readOnly, onClose, onSave });
  const invalidDocumentSettings =
    formik.values.stageType === 5 &&
    Boolean(getDocumentConfigurationError(formik.values.configurationJson));

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={requestClose}
        PaperProps={{ sx: { width: { xs: 1, sm: 720 }, maxWidth: 1 } }}
      >
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ px: { xs: 2, sm: 3 }, py: 2 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" component="div">
                <AdmissionDialogTitle
                  title={`${readOnly ? 'View' : 'Configure'} ${metadata?.displayName ?? 'stage'}`}
                  helpText={
                    readOnly
                      ? 'Review this stage’s details and completion rules.'
                      : 'Apply changes updates this stage in the journey. Use Save draft to store the workflow.'
                  }
                  helpLabel="Stage configuration information"
                />
              </Typography>
            </Box>
            <IconButton
              aria-label="Close stage editor"
              size="small"
              onClick={requestClose}
              sx={{ width: 44, height: 44, flexShrink: 0 }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider />
          <Box
            component="form"
            noValidate
            onSubmit={formik.handleSubmit}
            sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
              {Boolean(
                (formik.touched.code && formik.errors.code) ||
                (formik.touched.description && formik.errors.description)
              ) && (
                <StudentFeedback
                  notificationKey="STU-0161"
                  presentation="persistent"
                  severity="error"
                  sx={{ mx: 2, mt: 2 }}
                >
                  This stage has invalid saved details. Restore a valid workflow version or replace
                  this stage before applying changes.
                </StudentFeedback>
              )}
              {formik.touched.stageType && formik.errors.stageType && (
                <StudentFeedback
                  notificationKey="STU-0162"
                  presentation="inline"
                  severity="error"
                  sx={{ mx: 2, mt: 2 }}
                >
                  {formik.errors.stageType}
                </StudentFeedback>
              )}
              {placementField}
              <WorkflowStageFields
                formik={formik}
                metadata={metadata}
                stageTypes={stageTypes}
                forms={resolvedForms}
                stages={stages}
                formDefinitionId={formDefinitionId}
                readOnly={readOnly}
                isNewStage={
                  suppliedStages !== undefined && !stages.some((item) => item.id === stage?.id)
                }
              />
            </Scrollbar>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
            >
              <Button size="small" variant="outlined" onClick={requestClose}>
                Back
              </Button>
              <Button
                size="small"
                variant="contained"
                type={readOnly ? 'button' : 'submit'}
                onClick={readOnly ? requestClose : undefined}
                disabled={
                  !readOnly &&
                  (!isApplicationStageType(formik.values.stageType) || invalidDocumentSettings)
                }
                startIcon={<Iconify icon={readOnly ? 'mdi:close' : 'mdi:content-save-outline'} />}
              >
                {readOnly ? 'Close' : 'Apply changes'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard stage changes?"
        content="Your changes to this stage have not been added to the workflow draft."
        action={
          <Button size="small" variant="contained" color="error" onClick={close}>
            Discard changes
          </Button>
        }
      />
    </>
  );
}
