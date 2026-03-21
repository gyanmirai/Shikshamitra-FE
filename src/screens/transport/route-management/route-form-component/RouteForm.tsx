import { Box } from '@mui/material';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import RouteStopsStep from './StopsStep';
import RouteInformationStep from './RouteInformationStep';
import { getInitialRouteData } from './getInitialRouteData';
import VehicleAssignmentStep from './VehicleAssignmentStep';
import { routeValidationSchema } from './RouteValidationSchema';

import type { IRoutePayload } from '../components/type';

const RouteFormStepper = ({
  onClose,
  selectedRoute,
}: {
  onClose: (e: any, isSubmit: boolean) => void;
  selectedRoute?: IRoutePayload;
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Route Information', 'Stops', 'Vehicle Assignment'];
  const stepComponents = [RouteInformationStep, RouteStopsStep, VehicleAssignmentStep];

  const initialValues = useMemo(() => getInitialRouteData(selectedRoute), [selectedRoute]);

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: IRoutePayload,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      setIsLoading(true);
      try {
        if (activeStep === 0) {
          shikshaMitraToast.success({
            message: `Route "${values.routeName}" information saved successfully.`,
          });
        } else if (activeStep === 1) {
          shikshaMitraToast.success({
            message: `Stops for route "${values.routeName}" saved successfully.`,
          });
        }

        if (!isLastStep) {
          if (!isSaveButton) {
            setActiveStep(activeStep + 1);
          }
        } else {
          shikshaMitraToast.success({
            message: selectedRoute
              ? `Route "${values.routeName}" updated successfully.`
              : `Route "${values.routeName}" created successfully.`,
          });
          onClose?.(null, true);
        }
      } catch (error) {
        shikshaMitraToast.error({
          message: 'Something went wrong. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeStep, onClose, selectedRoute]
  );

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={initialValues}
      steps={steps}
      activeStep={activeStep}
      validateOnChange
      isDisabledLabel={!selectedRoute}
      onStepClick={(step) => {
        if (selectedRoute) {
          setActiveStep(step);
        }
      }}
      handleBack={() => setActiveStep(activeStep - 1)}
      validationSchema={routeValidationSchema[activeStep as keyof typeof routeValidationSchema]}
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

export default RouteFormStepper;
