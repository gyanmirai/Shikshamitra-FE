'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { useGetConcessionTypesQuery } from 'src/redux/finance/concessionType';
import {
  useUpdateValueEntryMutation,
  useCreateBasicDetailsMutation,
  useSaveConcessionTypesMutation,
  useUpdateFeeHeadfeeHeadsDataMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import ValueEntryStep from './ConcessionSteps/ValueEntryStep';
// Import new step components
import BasicDetailsStep from './ConcessionSteps/BasicDetailsStep';
import { concessionStepValidations } from './ConcessionValidation';
import FeeHeadMappingStep from './ConcessionSteps/FeeHeadMappingStep';
// Import helpers
import { getInitialConcessionFormData } from './ConcessionInitialValues';
import ConcessionTypeSelectionStep from './ConcessionSteps/ConcessionTypeSelectionStep';

import type { IConcessionFormProps } from '../type';

const STEPS = ['Basic Details', 'Concession Types', 'Fee Heads', 'Value Entry'];

const NewConcessionRequestForm: React.FC<IConcessionFormProps> = ({
  onClose,
  open,
  student,
  editData,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [activeStep, setActiveStep] = useState(0);

  // API Mutations
  const [createBasicDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateBasicDetailsMutation,
  });
  const [saveConcessionTypes] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveConcessionTypesMutation,
  });
  const [updateFeeHeadsData] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeHeadfeeHeadsDataMutation,
  });
  const [updateValueEntry] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateValueEntryMutation,
  });

  // Fetch concession types once at top level
  const { data: concessionTypes = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypesQuery,
    params: { academicYearId: currentYear?.id },
    options: { skip: !currentYear?.id },
  });

  const handleNext = async (
    isLastStep: boolean,
    values: any,
    _formik: any,
    setIsLoading: (v: boolean) => void
  ) => {
    setIsLoading(true);
    try {
      if (activeStep === 0) {
        // Step 1 – create basic details
        const res: any = await createBasicDetails({
          boardId: values.boardId,
          educationMediumId: values.mediumId,
          standardId: values.standardId,
          divisionId: values.divisionId,
          studentId: values.studentId,
        }).unwrap();
        const reqId = res?.data?.concessionRequestId;
        _formik.setFieldValue('id', reqId);

        shikshaMitraToast.success({ message: 'Basic details saved' });
        setActiveStep((s) => s + 1);
      } else if (activeStep === 1) {
        // Step 2 – save concession types
        if (!values.id) throw new Error('Missing concession request ID');
        await saveConcessionTypes({
          concessionRequestId: values.id,
          concessionTypeIds: values.concessionTypeIds,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Concession types saved' });
        setActiveStep((s) => s + 1);
      } else if (activeStep === 2) {
        // Step 3 – save fee heads
        if (!values.id) throw new Error('Missing concession request ID');
        // Build feeHeadsData: array of { concessionTypeId, feeHeadIds }
        const feeHeadsData = Object.entries(values.selectedFeeHeads).map(
          ([concessionTypeId, feeHeadIds]) => ({ concessionTypeId, feeHeadIds })
        );
        await updateFeeHeadsData({
          concessionRequestId: values.id,
          feeHeadsData,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Fee heads saved' });
        setActiveStep((s) => s + 1);
      } else if (isLastStep) {
        // Step 4 – value entry + submit
        if (!values.id) throw new Error('Missing concession request ID');
        // Build concessionTypeValues
        const concessionTypeValues = Object.entries(values.selectedFeeHeads).map(
          ([concessionTypeId, feeHeadIds]: any) => ({
            concessionTypeId,
            feeHeadValues: (feeHeadIds as string[]).map((feeHeadId: string) => {
              const entry = values.valueEntries?.[concessionTypeId]?.[feeHeadId] || {
                basedOn: 0,
                amount: 0,
              };

              return {
                feeHeadId,
                basedOn: entry.basedOn,
                amount: entry.amount,
              };
            }),
          })
        );

        await updateValueEntry({
          concessionRequestId: values.id,
          concessionTypeValues,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Concession request submitted successfully' });
        onClose(null, true);
      }
    } catch (err: any) {
      console.error(err);
      shikshaMitraToast.error({
        message: err?.data?.message || err?.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  const renderItem = ({
    formik,
    activeStep: step,
  }: {
    formik: any;
    activeStep: number;
    isBackClick: boolean;
  }) => {
    switch (step) {
      case 0:
        return <BasicDetailsStep formik={formik} />;
      case 1:
        return (
          <ConcessionTypeSelectionStep
            formik={formik}
            concessionTypes={concessionTypes?.items || []}
          />
        );
      case 2:
        return (
          <FeeHeadMappingStep formik={formik} concessionTypes={concessionTypes?.items || []} />
        );
      case 3:
        return <ValueEntryStep formik={formik} concessionTypes={concessionTypes?.items || []} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Cancel button row */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
        >
          Cancel
        </Button>
      </Box>

      <CustomStepperWithFormik
        steps={STEPS}
        activeStep={activeStep}
        initialValues={getInitialConcessionFormData()}
        validationSchema={concessionStepValidations[activeStep]}
        handleNext={handleNext}
        handleBack={handleBack}
        renderItem={renderItem}
        showSaveButton={false}
        scrollbarHeight="calc(100vh - 280px)"
      />
    </Box>
  );
};

export default NewConcessionRequestForm;
