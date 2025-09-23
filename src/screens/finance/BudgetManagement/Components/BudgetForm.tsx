import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import BudgetStep1 from './BudgetInfo';
import BudgetStep3 from './BudgetStep3';
import Step2Allocation from './SubCategoryStep2';
import { budgetValidationSchema } from './BudgetValidationSchema';

const NewBudgetForm = ({ onClose, editData }: { onClose: () => void; editData?: any }) => {
  const [activeStep, setActiveStep] = useState(0);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const allSteps = [BudgetStep1, Step2Allocation, BudgetStep3];

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={{
        board: '',
        budgetTitle: '',
        budgetCategory: '',
        budgetSubCategories: [], // dropdown selection
        startDate: '',
        endDate: '',
        totalBudgetAmount: '',
        spendingThreshold: '',
        departments: [],
        description: '',
        subCategories: [], // array of {category, amount, notes}
      }}
      steps={['Basic Information', 'Allocation by Sub Category', 'Review & Share']}
      activeStep={activeStep}
      handleBack={() => setActiveStep(activeStep - 1)}
      validateOnChange
      validationSchema={budgetValidationSchema(currentYear)[activeStep]}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }) => {
        const StepComponent = allSteps[step];
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

export default NewBudgetForm;
