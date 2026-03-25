import type { RootState } from 'src/redux/store';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Grid, Stack, Skeleton } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useCreateFeeStructureMutation,
  useUpdateFeeStructureMutation,
  useGetFeeStructureDetailsQuery,
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

  const { data: feeStructureData, isLoading: feeStructureLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeStructureDetailsQuery,
    params: editData?.id,
    options: {
      skip: !editData?.id,
    },
  });

  const [saveStandardFeeStructures] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveStandardFeeStructuresMutation,
  });

  // Define step components
  const allSteps = [GeneralInfoStep, FeeStructureStep];
  const feeStructureInitialValues = useMemo(
    () => getInitialFeeStructureData(currentYear, feeStructureData),
    [currentYear, feeStructureData]
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
            feeStructureId: feeStructureData?.id,
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
        // Transform form data to update payload
        const payload = Object.entries(values.feeStructureClasses as Record<string, any[]>)
          .filter(([_, structures]) => structures.length > 0)
          .map(([classId, structures]) => ({
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
          }));

        await saveStandardFeeStructures({
          feeStructureId: values.id,
          body: payload,
        }).unwrap();

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
    <>
      {feeStructureLoading ? (
        <Box p={3}>
          <Stack spacing={3}>
            {/* Stepper Header Skeleton */}
            <Skeleton variant="text" width="40%" height={32} />
            <Skeleton variant="rectangular" height={2} width="100%" />

            <Grid container spacing={3}>
              {[...Array(4)].map((_, index) => (
                <Grid key={index} size={{ xs: 12, md: 4 }}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>

            {/* Content Area Skeleton */}
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />

            {/* Footer Buttons Skeleton */}
            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
            </Stack>
          </Stack>
        </Box>
      ) : (
        <CustomStepperWithFormik
          scrollbarHeight="400px"
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
              <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
                <Box p={2}>
                  <StepComponent
                    formik={formik}
                    editData={editData}
                    classList={classList}
                    setClassList={setClassList}
                  />
                </Box>
              </BackPopUpChecked>
            );
          }}
        />
      )}
    </>
  );
};

export default FeeStructureFormStepper;
