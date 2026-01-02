import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useCreateFeeStructureMutation,
  useUpdateFeeStructureMutation,
} from 'src/redux/finance/financeFeeStructure';

import GeneralInfoStep from './GeneralInfoStep1';
import FeeStructureStep from './FeeStructureStep2';
import { getInitialFeeStructureData } from './FeeStructureInitialValues';
import { finaceFeeStructureValidationSchema } from './financeValidationSchema';

import type { IFeeStructureFormProps } from '../type';

const FeeStructureFormStepper: React.FC<IFeeStructureFormProps> = ({ onClose, editData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Create mutation
  const { createFeeStructure } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateFeeStructureMutation,
  });

  // Update mutation
  const { updateFeeStructure } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeStructureMutation,
  });

  // Define step components
  const allSteps = [GeneralInfoStep, FeeStructureStep];
  const feeStructureInitialValues = useMemo(
    () => getInitialFeeStructureData(currentYear, editData),
    [currentYear, editData]
  );

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={feeStructureInitialValues}
      steps={['General Information', 'Class Fee Structure']}
      activeStep={activeStep}
      handleBack={() => setActiveStep(activeStep - 1)}
      validateOnChange
      validationSchema={finaceFeeStructureValidationSchema[activeStep]} // pass schema step-wise
      handleNext={async (isLastStep, values) => {
        if (isLastStep) {
          try {
            // Transform form data to API format
            const payload = {
              name: values.feeStructureName,
              academicYearId: values.academicYear,
              boardId: values.board,
              mediumId: values.medium,
              receiptBookId: values.receiptBook,
            };

            if (editData) {
              // Update API call
              await updateFeeStructure({
                feeStructureId: editData.id,
                body: payload,
              }).unwrap();

              shikshaMitraToast.success({
                message: `Fee Structure "${values.feeStructureName}" updated successfully`,
              });
            } else {
              // Create API call
              await createFeeStructure(payload).unwrap();

              shikshaMitraToast.success({
                message: `Fee Structure "${values.feeStructureName}" created successfully`,
              });
            }
            onClose(null, true);
          } catch (error) {
            console.error('Failed to save fee structure:', error);
            shikshaMitraToast.error({
              message: `Failed to ${editData ? 'update' : 'create'} fee structure`,
            });
          }
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
