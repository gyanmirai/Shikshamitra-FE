'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Box, Stack } from '@mui/material';
import React, { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import { stepValidationSchemas } from './rubricValidation';
import { useRubricTemplateSave } from './useRubricTemplateSave';
import { changeRubricScoringModel } from './rubricScoringModel';
import { RubricReviewStep } from './components/RubricReviewStep';
import { RubricScoringSetup } from './components/RubricScoringSetup';
import { builderSteps, buildInitialValues } from './rubricFormValues';
import { RubricCriteriaBuilder } from './components/RubricCriteriaBuilder';
import { RubricBasicInformation } from './components/RubricBasicInformation';

import type { ScoringDrafts } from './rubricScoringModel';
import type { RubricConfigFormProps, RubricConfigFormValues } from './types';

const RubricConfigForm: React.FC<RubricConfigFormProps> = ({
  editData,
  onClose,
  onStateChange,
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [activeStep, setActiveStep] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(0);
  const scoringDrafts = useRef<ScoringDrafts>({});

  const rubricFormik = useFormik<RubricConfigFormValues>({
    initialValues: buildInitialValues(editData),
    validationSchema: stepValidationSchemas[activeStep],
    validateOnChange: false,
    onSubmit: () => {},
  });

  React.useEffect(() => {
    scoringDrafts.current = {};
  }, [editData?.id]);

  const { submitRubric, isSaving, submitMode } = useRubricTemplateSave(
    { editData, onClose },
    currentMedium?.id,
    (values) => rubricFormik.resetForm({ values })
  );
  React.useEffect(() => {
    onStateChange?.({ dirty: rubricFormik.dirty, busy: isSaving });
  }, [onStateChange, rubricFormik.dirty, isSaving]);

  return (
    <CustomStepperWithFormik
      initialValues={rubricFormik.initialValues}
      formikInstance={rubricFormik}
      steps={builderSteps}
      activeStep={activeStep}
      completedSteps={Array.from({ length: maxReachedStep }, (_, index) => index).filter(
        (index) => index !== activeStep
      )}
      isStepClickable={(index) => index <= maxReachedStep}
      onStepClick={(index) => setActiveStep(index)}
      validateForwardStepClick
      validateOnChange={false}
      validationSchema={stepValidationSchemas[activeStep]}
      showSaveButton={activeStep === builderSteps.length - 1}
      saveButtonLabel="Save draft"
      nextButtonLabel="Next"
      finalButtonLabel="Publish Rubric"
      saveButtonProps={{
        loading: isSaving && submitMode === 'draft',
        disabled: isSaving,
        startIcon: <Iconify icon="solar:diskette-bold" />,
        children: 'Save draft',
      }}
      saveAndNextButtonProps={{
        loading: isSaving && submitMode === 'publish',
        disabled: isSaving,
        startIcon:
          activeStep === builderSteps.length - 1 ? <Iconify icon="solar:upload-bold" /> : null,
      }}
      handleBack={() => setActiveStep((step) => Math.max(step - 1, 0))}
      handleNext={(isLastStep, values, _formik, setIsLoading) => {
        if (!isLastStep) {
          const nextStep = Math.min(activeStep + 1, builderSteps.length - 1);
          setMaxReachedStep((reached) => Math.max(reached, nextStep));
          setActiveStep(nextStep);
          return;
        }

        submitRubric('publish', values, setIsLoading);
      }}
      onSave={(_isLastStep, values, _formik, setIsLoading) =>
        submitRubric('draft', values, setIsLoading)
      }
      renderItem={({ formik, activeStep: step }) => (
        <Box>
          {/* Step content */}
          <Box sx={{ p: { xs: 1.5, md: 2 } }}>
            {step === 0 ? <RubricBasicInformation formik={formik} /> : null}
            {step === 1 ? (
              <Stack spacing={1.5}>
                <RubricScoringSetup
                  formik={formik}
                  isEditing={Boolean(editData)}
                  onModelChange={(value) => changeRubricScoringModel(formik, value, scoringDrafts)}
                />
                <RubricCriteriaBuilder formik={formik} />
              </Stack>
            ) : null}
            {step === 2 ? <RubricReviewStep formik={formik} /> : null}
          </Box>
        </Box>
      )}
    />
  );
};

export default RubricConfigForm;
