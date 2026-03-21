import { Box } from '@mui/material';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddVehicleMutation,
  useUpdateVehicleMutation,
  useUploadVehicleDocumentMutation,
  useUpdateVehicleDocumentMutation,
  useVehicleMantenceDetailsMutation,
  useUpdateVehicleMaintenanceMutation,
} from 'src/redux/transport/vehicle-management/vehicle-management-api';

import VehicleGeneralStep from './VehicleGeneralStep';
import VehicleDocumentsStep from './VehicleDocumentsStep';
import VehicleMaintenanceStep from './VehicleMaintenanceStep';
import { getInitialVehicleData } from './getInitialVehicleData';
import { vehicleValidationSchema } from './vehicleValidationSchema';

import type { IVehiclePayload } from '../components/type';

const VehicleFormStepper = ({
  onClose,
  editData,
}: {
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IVehiclePayload;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [vehicleId, setVehicleId] = useState<string | null>(editData?.id || null);

  const steps = ['Basic Information', 'Documents', 'Vehicle Maintenance'];
  const stepComponents = [VehicleGeneralStep, VehicleDocumentsStep, VehicleMaintenanceStep];

  const initialValues = useMemo(() => getInitialVehicleData(editData), [editData]);

  // Add Vehicle
  const { addVehicle } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddVehicleMutation,
  });

  // Update Vehicle
  const { updateVehicle } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateVehicleMutation,
  });

  // Upload Vehicle Document
  const { uploadVehicleDocument } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadVehicleDocumentMutation,
  });

  // Update Vehicle Document
  const { updateVehicleDocument } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateVehicleDocumentMutation,
  });

  // Vehicle Maintenance Details
  const { vehicleMantenceDetails } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useVehicleMantenceDetailsMutation,
  });

  // Update Vehicle Maintenance
  const { updateVehicleMaintenance } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateVehicleMaintenanceMutation,
  });

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
        // Step 1: Basic Information
        if (activeStep === 0) {
          const step1Data = {
            registrationNo: values.registrationNo,
            vehicleName: values.vehicleName,
            vehicleType: values.vehicleType,
            vehicleCompany: values.vehicleCompany,
            model: values.model,
            yearOfManufacture: values.yearOfManufacture,
            seatingCapacity: values.seatingCapacity,
            vehicleColor: values.vehicleColor,
            schoolAssignedNo: values.schoolAssignedNo,
            owner: values.owner,
            fuelType: values.fuelType,
            isAc: values.isAc,
            description: values.description,
          };

          if (editData?.id) {
            // Update existing vehicle
            await updateVehicle({ vehicleId: editData.id, data: step1Data }).unwrap();
            shikshaMitraToast.success({
              message: `Vehicle "${values.registrationNo}" updated successfully.`,
            });
          } else {
            // Create new vehicle
            const response = await addVehicle(step1Data).unwrap();
            setVehicleId(response.id || response.vehicleId); // Store the vehicleId for next steps
            shikshaMitraToast.success({
              message: `Vehicle "${values.registrationNo}" registered successfully.`,
            });
          }
        }
        // Step 2: Documents
        else if (activeStep === 1) {
          if (!vehicleId) {
            throw new Error('Vehicle ID not found. Please complete Step 1 first.');
          }

          // Upload or update documents in parallel
          if (values.documents && values.documents.length > 0) {
            const documentPromises = values.documents.map((doc: any) => {
              const documentData = {
                documentTypeId: doc.documentTypeId,
                file: doc.file,
                fileName: doc.fileName,
              };

              // If document has an ID, update it; otherwise, upload new
              if (editData?.id && doc.id) {
                return updateVehicleDocument({
                  vehicleId,
                  documentId: doc.id,
                  data: documentData,
                }).unwrap();
              }
              return uploadVehicleDocument({ vehicleId, data: documentData }).unwrap();
            });
            await Promise.all(documentPromises);
          }

          shikshaMitraToast.success({
            message: editData?.id
              ? `Documents for "${values.registrationNo}" updated successfully.`
              : `Documents for "${values.registrationNo}" uploaded successfully.`,
          });
        }
        // Step 3: Vehicle Maintenance
        else if (activeStep === 2) {
          if (!vehicleId) {
            throw new Error('Vehicle ID not found. Please complete Step 1 first.');
          }

          const maintenanceData = {
            insurance: values.insurance,
            puc: values.puc,
            roadTax: values.roadTax,
          };

          // Use update mutation if editing, otherwise create new
          if (editData?.id) {
            await updateVehicleMaintenance({ vehicleId, data: maintenanceData }).unwrap();
          } else {
            await vehicleMantenceDetails({ vehicleId, data: maintenanceData }).unwrap();
          }

          shikshaMitraToast.success({
            message: editData?.id
              ? `Maintenance details for "${values.registrationNo}" updated successfully.`
              : `Maintenance details for "${values.registrationNo}" saved successfully.`,
          });
        }

        if (!isLastStep) {
          if (!isSaveButton) {
            setActiveStep(activeStep + 1);
          }
        } else {
          onClose?.(null, true);
        }
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Something went wrong. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeStep,
      onClose,
      vehicleId,
      editData,
      addVehicle,
      updateVehicle,
      uploadVehicleDocument,
      updateVehicleDocument,
      vehicleMantenceDetails,
      updateVehicleMaintenance,
    ]
  );

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={initialValues}
      steps={steps}
      activeStep={activeStep}
      validateOnChange
      isDisabledLabel={!editData}
      onStepClick={(step) => {
        if (editData) {
          setActiveStep(step);
        }
      }}
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
