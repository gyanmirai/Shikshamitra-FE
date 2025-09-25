import { useState } from 'react';
import { Box } from '@mui/material';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import BookCopiesStep from './BookCopiesStep';
import BookGeneralStep from './BookGeneralForm';
import { bookValidationSchema } from './BookManageValidation';
import { getInitialBookData } from '../Components/BookManageInitialValues';

import type { IBookPayload } from '../Components/type';

const BookFormStepper = ({ onClose, editData }: { onClose: any; editData?: IBookPayload }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['General Information', 'Manage Copies'];

  const stepComponents = [BookGeneralStep, BookCopiesStep];

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={getInitialBookData(editData)}
      steps={steps}
      activeStep={activeStep}
      validateOnChange
      handleBack={() => setActiveStep(activeStep - 1)}
      validationSchema={bookValidationSchema[activeStep as keyof typeof bookValidationSchema]}
      handleNext={(isLastStep, values) => {
        if (isLastStep) {
          // final submit
          console.log('SUBMIT', values);
          onClose(null, true);
        } else {
          setActiveStep(activeStep + 1);
        }
      }}
      renderItem={({ formik, activeStep: step }) => {
        const StepComponent = stepComponents[step];
        return (
          <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
            <Box p={2}>
              <StepComponent formik={formik} />
            </Box>
          </BackPopUpChecked>
        );
      }}
    />
  );
};

export default BookFormStepper;
