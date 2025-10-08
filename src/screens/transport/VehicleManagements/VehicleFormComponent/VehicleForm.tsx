import { Box } from '@mui/material';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import VehicleGeneralStep from './VehicleGeneralStep';
import VehicleDocumentsStep from './VehicleDocumentsStep';
import VehicleMaintenanceStep from './VehicleMaintenanceStep';
import { getInitialVehicleData } from './getInitialVehicleData';
import { vehicleValidationSchema } from './vehicleValidationSchema';

import type { IVehiclePayload } from '../Components/type';

const VehicleFormStepper = ({
  onClose,
  editData,
}: {
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IVehiclePayload;
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Basic Information', 'Documents', 'Vehicle Maintenance'];
  const stepComponents = [VehicleGeneralStep, VehicleDocumentsStep, VehicleMaintenanceStep];

  const initialValues = useMemo(() => getInitialVehicleData(editData), [editData]);

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: IVehiclePayload,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      setIsLoading(true);
      try {
        if (activeStep === 0) {
          shikshaMitraToast.success({
            message: `Vehicle "${values.registrationNo}" basic information saved successfully.`,
          });
        } else if (activeStep === 1) {
          shikshaMitraToast.success({
            message: `Documents for "${values.registrationNo}" saved successfully.`,
          });
        } else if (activeStep === 2) {
          shikshaMitraToast.success({
            message: `Maintenance details for "${values.registrationNo}" saved successfully.`,
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
      initialValues={initialValues}
      steps={steps}
      activeStep={activeStep}
      validateOnChange
      isDisabledLabel={!editData}
      handleBack={() => setActiveStep(activeStep - 1)}
      validationSchema={vehicleValidationSchema[activeStep as keyof typeof vehicleValidationSchema]}
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

export default VehicleFormStepper;
