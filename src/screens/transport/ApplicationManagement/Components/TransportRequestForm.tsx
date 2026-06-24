'use client';

import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddTransportMemberMutation,
  useUpdateTransportApplicationMutation,
} from 'src/redux/transport/vehicle-management/member-manage-api';

import SelectStudentStep from './SelectStudentStep';
import TransportApplicationForm from './TransportApplicationForm';
import { transportValidationSchema } from './transportRequestValidation';

import type { ITransportApplicationPayload } from '../type';

const getInitialTransportData = (selectedApplication: ITransportApplicationPayload | null) => ({
  id: selectedApplication?.id || '',
  applicationType: selectedApplication?.applicationType ?? 0,
  memberType: selectedApplication?.memberType ?? 0,
  sourceId:
    selectedApplication?.sourceId ||
    selectedApplication?.studentId ||
    selectedApplication?.employeeId ||
    '',
  employeeId: selectedApplication?.employeeId || '',
  studentId: selectedApplication?.studentId || '',
  name: selectedApplication?.name || '',
  className: selectedApplication?.class || '',
  class: selectedApplication?.class || '',
  division: selectedApplication?.division || '',
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
  const currentMedium = useSelector((state: RootState) => state.globalState.currentMedium);

  const [addTransportMember, { isLoading: isAdding }] = useAddTransportMemberMutation();
  const [updateTransportApplication, { isLoading: isUpdating }] =
    useUpdateTransportApplicationMutation();

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
          if (!values.sourceId) {
            shikshaMitraToast.error({ message: 'Please select a member before proceeding' });
            setIsLoading(false);
            return;
          }
        } else if (activeStep === 1) {
          const memberType = Number(values.memberType ?? 0);
          const payload = {
            applicationType: selectedApplication?.applicationType ?? 0,
            memberType,
            memberId: selectedApplication?.memberId || undefined,
            studentId: memberType === 0 ? values.studentId || values.sourceId : undefined,
            employeeId: memberType === 1 ? values.employeeId || values.sourceId : undefined,
            requestedStopId: values.searchStop,
            pickupType: values.pickupType,
            landmark: values.landmark,
            areaLocality: values.areaLocality,
            addressLine1: values.addressLine1,
            description: values.description,
          };

          if (!currentMedium?.id) {
            shikshaMitraToast.error({ message: 'Academic medium is required' });
            setIsLoading(false);
            return;
          }

          if (selectedApplication?.id) {
            await updateTransportApplication({
              applicationId: selectedApplication.id,
              academicMediumId: currentMedium.id,
              body: payload,
            }).unwrap();
          } else {
            await addTransportMember({
              academicMediumId: currentMedium.id,
              body: payload,
            }).unwrap();
          }

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
    [
      activeStep,
      onClose,
      selectedApplication,
      currentMedium?.id,
      addTransportMember,
      updateTransportApplication,
    ]
  );

  return (
    <CustomStepperWithFormik
      scrollbarHeight="420px"
      initialValues={initialValues}
      steps={steps}
      activeStep={activeStep}
      disableSubmit={isAdding || isUpdating}
      validateOnChange={false}
      onStepClick={(step) => {
        if (selectedApplication) {
          setActiveStep(step);
        }
      }}
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
