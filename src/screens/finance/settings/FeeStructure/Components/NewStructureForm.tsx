import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useCreateFeeStructureMutation,
  useUpdateFeeStructureMutation,
  useSaveStandardFeeStructuresMutation,
} from 'src/redux/finance/financeFeeStructure';

import GeneralInfoStep from './GeneralInfoStep1';
import FeeStructureStep from './FeeStructureStep2';
import { getInitialFeeStructureData } from './FeeStructureInitialValues';
import { finaceFeeStructureValidationSchema } from './financeValidationSchema';

import type { IFeeStructureFormProps } from '../type';

const FeeStructureFormStepper: React.FC<IFeeStructureFormProps> = ({ onClose, editData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [classList, setClassList] = useState<any[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Create mutation
  const [createFeeStructure] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateFeeStructureMutation,
  });

  const [updateFeeStructure] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeStructureMutation,
  });

  const [saveStandardFeeStructures] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveStandardFeeStructuresMutation,
  });

  // Define step components
  const allSteps = [GeneralInfoStep, FeeStructureStep];
  const feeStructureInitialValues = useMemo(
    () => getInitialFeeStructureData(currentYear, editData),
    [currentYear, editData]
  );
  const handleSave = async (
    isLastStep: boolean,
    values: any,
    formik: any,
    setIsLoading: (val: boolean) => void,
    isDraft: boolean = false
  ) => {
    setIsLoading(true);
    try {
      if (isDraft) {
        shikshaMitraToast.success({ message: 'Draft saved successfully' });
        return;
      }

      if (activeStep === 0) {
        // Transform form data to API format
        const payload = {
          name: values.name,
          boardId: values.boardId,
          mediumId: values.mediumId,
          receiptBookId: values.receiptBookId,
        };

        if (editData || values.id) {
          await updateFeeStructure({
            feeStructureId: editData?.id ?? values.id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({ message: 'Fee Structure updated successfully' });
        } else {
          // Create API call
          const res = await createFeeStructure({
            academicYearId: currentYear?.id,
            body: payload,
          }).unwrap();

          formik.setFieldValue('id', res.id);
          shikshaMitraToast.success({
            message: `Fee Structure "${values.name}" created successfully`,
          });
        }
        setActiveStep(activeStep + 1);
        return;
      }

      if (isLastStep) {
        // Transform form data to update payload — API expects one object per class
        const classEntries = Object.entries(
          values.feeStructureClasses as Record<string, any[]>
        ).filter(([_, structures]) => structures.length > 0);

        await Promise.all(
          classEntries.map(([classId, structures]) =>
            saveStandardFeeStructures({
              feeStructureId: values.id,
              body: {
                standardId: classId,
                standardFeeStructures: structures.map((s) => ({
                  name: s.name,
                  feeHeads: s.feeHeads.map((fh: any) => ({
                    feeHeadId: fh.feeHeadId,
                    amount: fh.amount,
                    isOneTime: fh.isOneTime,
                    isOptional: fh.isOptional,
                  })),
                })),
              },
            }).unwrap()
          )
        );

        shikshaMitraToast.success({
          message: `Standard fee structures saved successfully`,
        });
        onClose(null, true);
        return;
      }
      setActiveStep(activeStep + 1);
    } catch (error) {
      console.error('Failed to save fee structure:', error);
      shikshaMitraToast.error({
        message: `Failed to save fee structure`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <CustomStepperWithFormik
        initialValues={feeStructureInitialValues}
        steps={['General Information', 'Class Fee Structure']}
        activeStep={activeStep}
        handleBack={() => setActiveStep(activeStep - 1)}
        handleNext={(
          isLastStep: boolean,
          value: any,
          formik: any,
          setIsLoading: (val: boolean) => void
        ) => handleSave(isLastStep, value, formik, setIsLoading)}
        onSave={(
          isLastStep: boolean,
          value: any,
          formik: any,
          setIsLoading: (val: boolean) => void
        ) => handleSave(isLastStep, value, formik, setIsLoading, true)}
        validateOnChange
        validationSchema={finaceFeeStructureValidationSchema[activeStep]} // pass schema step-wise
        renderItem={({ formik, activeStep: step }) => {
          const StepComponent = allSteps[step];
          return (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <BackPopUpChecked
                  initialValues={formik.initialValues}
                  currentValues={formik.values}
                >
                  <Box p={2}>
                    <StepComponent
                      formik={formik}
                      editData={editData}
                      classList={classList}
                      setClassList={setClassList}
                    />
                  </Box>
                </BackPopUpChecked>
              </motion.div>
            </AnimatePresence>
          );
        }}
      />
    </motion.div>
  );
};

export default FeeStructureFormStepper;
