'use client';

import { Box } from '@mui/material';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useAddTransportMemberMutation } from 'src/redux/transport/vehicle-management/member-manage-api';

import SelectStudentStep from './SelectStudentStep';
import TransportApplicationForm from './TransportApplicationForm';
import { transportValidationSchema } from './transportRequestValidation';

import type { ITransportApplicationPayload } from '../type';

const getInitialTransportData = (selectedApplication: ITransportApplicationPayload | null) => ({
  studentId: selectedApplication?.studentId || '',
  name: selectedApplication?.name || '',
  className: selectedApplication?.class || '',
  rollNo: selectedApplication?.rollNo || '',
  role: selectedApplication?.role || '',
  grNo: selectedApplication?.grNo || '',
  contactNo: selectedApplication?.contactNo || '',
  photoUrl: selectedApplication?.photoUrl || '',
  searchStop: selectedApplication?.searchStop || '',
  pickupType: selectedApplication?.pickupType || '',
  landmark: selectedApplication?.landmark || '',
  areaLocality: selectedApplication?.areaLocality || '',
  description: selectedApplication?.description || '',
  selectedStudent: selectedApplication?.selectedStudent || '',
});

const TransportApplicationStepper = ({
  onClose,
  selectedApplication,
}: {
  onClose: (e: any, isSubmit: boolean) => void;
  selectedApplication: ITransportApplicationPayload | null;
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const { addTransportMember, isLoading: isAdding } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddTransportMemberMutation,
  });

  // Step Names
  const steps = ['Select Member', 'Transport Application'];

  // Step Components
  const stepComponents = [SelectStudentStep, TransportApplicationForm];

  // Initial Values
  const initialValues = useMemo(
    () => getInitialTransportData(selectedApplication),
    [selectedApplication]
  );

  // Handle Save / Next
  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: ITransportApplicationPayload,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      setIsLoading(true);
      try {
        if (activeStep === 0) {
          if (!values.studentId) {
            shikshaMitraToast.error({ message: 'Please select a student before proceeding' });
            setIsLoading(false);
            return;
          }
        } else if (activeStep === 1) {
          // Call the API to save transport application
          const payload = {
            studentId: values.studentId,
            pickupType: values.pickupType,
            stopId: values.searchStop,
            landmark: values.landmark,
            areaLocality: values.areaLocality,
            description: values.description,
          };

          await addTransportMember(payload);

          shikshaMitraToast.success({
            message: `Transport application saved successfully for "${values.name}"`,
          });
        }

        if (!isLastStep) {
          if (!isSaveButton) setActiveStep(activeStep + 1);
        } else {
          shikshaMitraToast.success({
            message: selectedApplication
              ? `Transport application updated successfully`
              : `Transport application created successfully`,
          });
          onClose?.(null, true);
        }
      } catch (error: any) {
        console.error(error);
        shikshaMitraToast.error({
          message: error?.data?.message || 'Something went wrong. Please try again',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeStep, onClose, selectedApplication, addTransportMember]
  );

  return (
    <CustomStepperWithFormik
      scrollbarHeight="420px"
      initialValues={initialValues}
      steps={steps}
      activeStep={activeStep}
      validateOnChange={false}
      handleBack={() => setActiveStep(activeStep - 1)}
      validationSchema={
        transportValidationSchema[activeStep as keyof typeof transportValidationSchema]
      }
      handleNext={(
        isLastStep: boolean,
        value: any,
        formik: any,
        setIsLoading: (val: boolean) => void
      ) => handleSave(isLastStep, value, formik, setIsLoading)}
      onSave={(isLastStep, value, formik, setIsLoading) =>
        handleSave(isLastStep, value, formik, setIsLoading, true)
      }
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

export default TransportApplicationStepper;
