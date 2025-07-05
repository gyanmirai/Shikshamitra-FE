import { useState } from 'react';

import { Box } from '@mui/material';

import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import SelectExam from './selectExamStep1';
import ExamDetails from './examDetailsStep2';
import { validationSchema } from '../validationSchema';

import type { INewExamFormProps } from '../type';

const NewExamForm = ({ onClose, editData }: INewExamFormProps) => {
  // Active step for stepper navigation
  const [activeStep, setActiveStep] = useState(0);
  const allTimetableSteps = [SelectExam, ExamDetails];

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={{
        examType: '',
        examName: '',
        className: '',
        divisions: [],
        subjects: [],
        description: '',
      }}
      steps={['Basic Details', 'Schedule']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validateOnChange
      validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      // validationSchema={yup.object().shape({})}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }) => {
        const StepComponent = allTimetableSteps[step];
        return (
          <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
            <Box p={2}>
              <StepComponent {...formik} />
            </Box>
          </BackPopUpChecked>
        );
      }}
    />
  );
};

export default NewExamForm;
