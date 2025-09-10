import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import GeneralInfoStep from './GeneralInfoStep1';
import FeeStructureStep from './FeeStructureStep2';
import { getInitialFeeStructureData } from './FeeStructureInitialValues';
import { finaceFeeStructureValidationSchema } from './financeValidationSchema';

import type { IFeeStructureFormProps } from '../type';

const FeeStructureFormStepper: React.FC<IFeeStructureFormProps> = ({ onClose, editData }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Define step components
  const allSteps = [GeneralInfoStep, FeeStructureStep];
  const feeStructureInitialValues = useMemo(() => getInitialFeeStructureData(editData), [editData]);
  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={feeStructureInitialValues}
      steps={['General Information', 'Class Fee Structure']}
      activeStep={activeStep}
      handleBack={() => setActiveStep(activeStep - 1)}
      validateOnChange
      validationSchema={finaceFeeStructureValidationSchema[activeStep]} // pass schema step-wise
      handleNext={(isLastStep, values) => {
        if (isLastStep) {
          // Final submit
          if (editData) {
            // Update API call here
          } else {
            // Create API call here
          }
          onClose(null, true);
          return;
        }
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }) => {
        const StepComponent = allSteps[step];
        return (
          <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
            <Box p={2}>
              <StepComponent formik={formik} editData={editData} />
            </Box>
          </BackPopUpChecked>
        );
      }}
    />
  );
};

export default FeeStructureFormStepper;
