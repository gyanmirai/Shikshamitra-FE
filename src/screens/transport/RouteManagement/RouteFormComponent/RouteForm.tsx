import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useAssignStopsToRouteMutation,
  useAssignVehicleToRouteMutation,
} from 'src/redux/transport/vehicle-management/route-management-api';

import RouteStopsStep from './StopsStep';
import RouteInformationStep from './RouteInformationStep';
import VehicleAssignmentStep from './VehicleAssignmentStep';
import { getInitialRouteData } from './getInitialRouteData';
import { routeValidationSchema } from './RouteValidationSchema';

import type { IRoutePayload } from '../Components/type';

const RouteFormStepper = ({
  onClose,
  selectedRoute,
}: {
  onClose: (e: any, isSubmit: boolean) => void;
  selectedRoute?: IRoutePayload;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [routeId, setRouteId] = useState<string | null>(selectedRoute?.id || null);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [createRoute] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateRouteMutation,
  });
  const [updateRoute] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateRouteMutation,
  });
  const [assignStopsToRoute] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignStopsToRouteMutation,
  });
  const [assignVehicleToRoute] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignVehicleToRouteMutation,
  });

  const steps = ['Route Information', 'Stops', 'Vehicle Assignment'];
  const stepComponents = [RouteInformationStep, RouteStopsStep, VehicleAssignmentStep];

  const initialValues = useMemo(() => getInitialRouteData(selectedRoute), [selectedRoute]);

  const toIso = useCallback((value: any) => (value ? dayjs(value).toISOString() : null), []);

  const buildRoutePayload = useCallback(
    (values: IRoutePayload) => ({
      routeName: values.routeName,
      routeCode: values.routeCode,
      routeType: values.routeType,
      distance: Number(values.distance || 0),
      duration: values.duration,
      description: values.description,
      startPoint: values.startPoint,
      endPoint: values.endPoint,
      pickupSchedule: {
        startTime: toIso(values.pickupSchedule?.startTime),
        endTime: toIso(values.pickupSchedule?.endTime),
      },
      dropoffSchedule: {
        startTime: toIso(values.dropoffSchedule?.startTime),
        endTime: toIso(values.dropoffSchedule?.endTime),
      },
    }),
    [toIso]
  );

  const buildRouteStopsPayload = useCallback(
    (values: IRoutePayload) =>
      values.stops.map((stop: any, index: number) => ({
        stopId: stop.stopId || stop.id,
        expectedArrivalTime: toIso(stop.expectedArrivalTime),
        expectedDepartureTime: toIso(stop.expectedDepartureTime),
        distanceFromPrevious: stop.distanceFromPrevious ? Number(stop.distanceFromPrevious) : null,
        order: index + 1,
      })),
    [toIso]
  );

  const buildVehicleAssignmentPayload = useCallback(
    (values: IRoutePayload) => ({
      vehicleId: values.vehicleAssignment?.vehicleId,
      driverStaffId: values.vehicleAssignment?.driverId,
      conductorStaffId: values.vehicleAssignment?.conductorId || null,
    }),
    []
  );

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
          const body = buildRoutePayload(values);
          if (routeId) {
            await updateRoute({
              routeId,
              academicMediumId: currentMedium?.id,
              body,
            }).unwrap();
          } else {
            const response = await createRoute({
              academicMediumId: currentMedium?.id,
              body,
            }).unwrap();
            setRouteId(response?.id || response?.data?.id || null);
          }
          shikshaMitraToast.success({
            message: `Route "${values.routeName}" information saved successfully.`,
          });
        } else if (activeStep === 1) {
          const persistedRouteId = routeId || selectedRoute?.id;
          if (!persistedRouteId) {
            throw new Error('Route information must be saved before assigning stops.');
          }
          await assignStopsToRoute({
            routeId: persistedRouteId,
            academicMediumId: currentMedium?.id,
            stops: buildRouteStopsPayload(values),
          }).unwrap();
          shikshaMitraToast.success({
            message: `Stops for route "${values.routeName}" saved successfully.`,
          });
        } else if (activeStep === 2) {
          const persistedRouteId = routeId || selectedRoute?.id;
          if (!persistedRouteId) {
            throw new Error('Route information must be saved before assigning a vehicle.');
          }
          await assignVehicleToRoute({
            routeId: persistedRouteId,
            academicMediumId: currentMedium?.id,
            body: buildVehicleAssignmentPayload(values),
          }).unwrap();
          shikshaMitraToast.success({
            message: `Vehicle assignment for route "${values.routeName}" saved successfully.`,
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
    [
      activeStep,
      assignStopsToRoute,
      assignVehicleToRoute,
      buildRoutePayload,
      buildRouteStopsPayload,
      buildVehicleAssignmentPayload,
      createRoute,
      currentMedium?.id,
      onClose,
      routeId,
      selectedRoute,
      updateRoute,
    ]
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
