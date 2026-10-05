'use client';

import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
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
  const [activeStep, setActiveStep] = useState(0);
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
    validationSchema,
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
  } = useWorkflowStageEditor({ open, stage, stageTypes, stages, forms, readOnly, onClose, onSave });
  const verificationRequired =
    formik.values.stageType === 1 &&
    readAdmissionFormStagePolicy(formik.values.configurationJson)?.requireSectionVerification;

  useEffect(() => {
    if (open) setActiveStep(0);
  }, [open, stage?.id]);

  const validateCurrentStep = async () => {
    if (readOnly) return {};
    const errors = await formik.validateForm();
    const basicErrors = Object.fromEntries(
      Object.entries(errors).filter(
        ([field]) =>
          ['name', 'code', 'description', 'stageType'].includes(field) ||
          (field === 'configurationJson' && metadata?.supportsFormAttachment && !formDefinitionId)
      )
    );
    if (activeStep === 0) return basicErrors;
    if (Object.keys(basicErrors).length > 0) setActiveStep(0);
    return errors;
  };

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
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <CustomStepperWithFormik
              steps={['Basics', 'Settings']}
              activeStep={activeStep}
              initialValues={formik.initialValues}
              formikInstance={{ ...formik, validateForm: validateCurrentStep }}
              validationSchema={validationSchema}
              showSaveButton={false}
              nextButtonLabel="Next"
              finalButtonLabel={readOnly ? 'Close' : 'Save stage'}
              completedSteps={activeStep === 1 ? [0] : []}
              isStepClickable={(index) => index <= activeStep}
              onStepClick={(index) => setActiveStep(index)}
              onCancel={requestClose}
              handleBack={() => setActiveStep(0)}
              disableSubmit={
                !readOnly &&
                (formik.values.stageType === 0 ||
                  Boolean(verificationRequired && formDetailsUnavailable))
              }
              errors={[
                Boolean(
                  (formik.touched.name && formik.errors.name) ||
                  (formik.touched.code && formik.errors.code) ||
                  (formik.touched.description && formik.errors.description) ||
                  (formik.touched.configurationJson &&
                    formik.errors.configurationJson &&
                    !formDefinitionId &&
                    metadata?.supportsFormAttachment)
                ),
                Boolean(
                  formik.touched.configurationJson &&
                  formik.errors.configurationJson &&
                  (!metadata?.supportsFormAttachment || formDefinitionId)
                ),
              ]}
              backButtonProps={{
                startIcon: <Iconify icon={activeStep === 0 ? 'mdi:close' : 'mdi:arrow-left'} />,
              }}
              saveAndNextButtonProps={{
                startIcon:
                  activeStep === 1 ? (
                    <Iconify icon={readOnly ? 'mdi:close' : 'mdi:content-save-outline'} />
                  ) : null,
              }}
              handleNext={(isLastStep) => {
                if (!isLastStep) setActiveStep(1);
                else if (readOnly) requestClose();
                else formik.submitForm();
              }}
              renderItem={() => (
                <WorkflowStageFields
                  formik={formik}
                  activeStep={activeStep}
                  onGoToBasics={() => setActiveStep(0)}
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
              )}
            />
          </Box>
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
