import { Box } from '@mui/material';
import { useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import BookCopiesStep from './BookCopiesStep';
import BookGeneralStep from './BookGeneralForm';
import { bookValidationSchema } from './BookManageValidation';
import { getInitialBookData } from '../Components/BookManageInitialValues';

import type { IBookPayload } from '../Components/type';

const BookFormStepper = ({
  onClose,
  editData,
}: {
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IBookPayload;
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['General Information', 'Manage Copies'];

  const stepComponents = [BookGeneralStep, BookCopiesStep];

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: IBookPayload,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      setIsLoading(true);
      try {
        if (activeStep === 0) {
          shikshaMitraToast.success({
            message: `Book "${values.title}" by ${values.author} general information saved successfully.`,
          });
        } else if (activeStep === 1) {
          shikshaMitraToast.success({
            message: `Copies for "${values.title}" saved successfully.`,
          });
        }

        if (!isLastStep) {
          if (!isSaveButton) {
            setActiveStep(activeStep + 1);
          }
        } else {
          onClose?.(null, true);
        }
      } catch (error) {
        console.log(error);
        shikshaMitraToast.error({
          message: 'Something went wrong. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeStep, onClose]
  );

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={getInitialBookData(editData)}
      steps={steps}
      activeStep={activeStep}
      validateOnChange
      handleBack={() => setActiveStep(activeStep - 1)}
      validationSchema={bookValidationSchema[activeStep as keyof typeof bookValidationSchema]}
      handleNext={(
        isLastStep: boolean,
        value: any,
        formik: any,
        setIsLoading: (val: boolean) => void
      ) => handleSave(isLastStep, value, formik, setIsLoading)}
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
