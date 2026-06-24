import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
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

import type { IVehiclePayload } from '../Components/type';

const VehicleFormStepper = ({
  onClose,
  editData,
}: {
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IVehiclePayload;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [vehicleId, setVehicleId] = useState<string | null>(editData?.id || null);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const steps = ['Basic Information', 'Documents', 'Vehicle Maintenance'];
  const stepComponents = [VehicleGeneralStep, VehicleDocumentsStep, VehicleMaintenanceStep];

  const initialValues = useMemo(() => getInitialVehicleData(editData), [editData]);

  const [addVehicle] = useAddVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [uploadVehicleDocument] = useUploadVehicleDocumentMutation();
  const [updateVehicleDocument] = useUpdateVehicleDocumentMutation();
  const [vehicleMantenceDetails] = useVehicleMantenceDetailsMutation();
  const [updateVehicleMaintenance] = useUpdateVehicleMaintenanceMutation();

  const toIsoString = (value: any) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value.toISOString === 'function') return value.toISOString();
    return null;
  };

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
        const academicMediumId = currentMedium?.id;
        if (!academicMediumId) {
          throw new Error('Please select an academic medium before saving vehicle details.');
        }

        // Step 1: Basic Information
        if (activeStep === 0) {
          const step1Data = {
            registrationNo: values.registrationNo,
            vehicleNo: values.vehicleNo,
            vehicleName: values.vehicleName,
            vehicleTypeId: values.vehicleType,
            vehicleCompany: values.vehicleCompany,
            model: values.model,
            yearOfManufacture: values.yearOfManufacture,
            seatingCapacity: values.seatingCapacity,
            vehicleColor: values.vehicleColor,
            schoolAssignedNo: values.schoolAssignedNo,
            owner: values.owner,
            fuelTypeId: values.fuelType,
            isAc: values.isAc,
            description: values.description,
          };

          if (editData?.id) {
            // Update existing vehicle
            await updateVehicle({
              vehicleId: editData.id,
              academicMediumId,
              body: step1Data,
            }).unwrap();
            shikshaMitraToast.success({
              message: `Vehicle "${values.registrationNo}" updated successfully.`,
            });
          } else {
            // Create new vehicle
            const response = await addVehicle({ academicMediumId, body: step1Data }).unwrap();
            setVehicleId(response.id || response.vehicleId);
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
            const documentPromises = values.documents
              .filter((doc: any) => doc?.file instanceof File && doc?.requiredDocumentId)
              .map((doc: any) => {
                const formData = new FormData();
                formData.append('requiredDocumentId', doc.requiredDocumentId);
                formData.append('file', doc.file);
                formData.append('fileName', doc.fileName || doc.file.name);

                if (doc.id) {
                  return updateVehicleDocument({
                    vehicleId,
                    documentId: doc.id,
                    academicMediumId,
                    body: formData,
                  }).unwrap();
                }

                return uploadVehicleDocument({
                  vehicleId,
                  academicMediumId,
                  body: formData,
                }).unwrap();
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

          const complianceData = {
            insuranceCompany: values.insuranceCompany || null,
            policyNo: values.policyNo || null,
            insuranceIssueDate: toIsoString(values.insuranceIssueDate),
            insuranceExpiryDate: toIsoString(values.insuranceExpiryDate),
            coverageAmount: values.coverageAmount === undefined ? null : values.coverageAmount,
            pucCertificateNo: values.pucCertificateNo || null,
            pucIssueDate: toIsoString(values.pucIssueDate),
            pucExpiryDate: toIsoString(values.pucExpiryDate),
            fitnessCertificateNo: values.fitnessCertificateNo || null,
            fitnessIssueDate: toIsoString(values.fitnessIssueDate),
            fitnessExpiryDate: toIsoString(values.fitnessExpiryDate),
            roadTaxReceiptNo: values.roadTaxReceiptNo || null,
            roadTaxIssueDate: toIsoString(values.roadTaxIssueDate),
          };

          // Use update mutation if editing, otherwise create new
          if (editData?.id) {
            await updateVehicleMaintenance({
              vehicleId,
              academicMediumId,
              body: complianceData,
            }).unwrap();
          } else {
            await vehicleMantenceDetails({
              vehicleId,
              academicMediumId,
              body: complianceData,
            }).unwrap();
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
      currentMedium?.id,
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
