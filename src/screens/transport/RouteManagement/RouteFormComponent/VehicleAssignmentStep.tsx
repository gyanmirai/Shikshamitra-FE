import type { FormikProps } from 'formik';

import React from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Chip, TextField, Typography, Autocomplete } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  useGetSelectableDriversQuery,
  useGetAssignableVehiclesQuery,
  useGetSelectableConductorsQuery,
} from 'src/redux/transport/vehicle-management/route-management-api';

import RouteDetailsView from './RouteBasicView';

import type { IRoutePayload, IVehicleAssignmentPayload } from '../Components/type';

interface VehicleAssignmentStepProps {
  formik: FormikProps<IRoutePayload>;
}

const VehicleAssignmentStep = ({ formik }: VehicleAssignmentStepProps) => {
  // Fetch available vehicles, drivers, and conductors at the top level of the component
  const { data: availableVehicles = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignableVehiclesQuery,
  });

  const { data: availableDrivers = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSelectableDriversQuery,
  });

  const { data: availableConductors = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSelectableConductorsQuery,
  });

  const handleVehiclesSelect = (selectedVehicles: string[]) => {
    const newVehicleAssignments: IVehicleAssignmentPayload[] = selectedVehicles.map(
      (vehicleValue, index) => {
        const existingAssignment = formik.values.vehicleAssignments.find(
          (assignment) => assignment.vehicleId === vehicleValue
        );
        const vehicleData = availableVehicles?.find(
          (vehicle: any) => vehicle.value === vehicleValue
        );

        return (
          existingAssignment || {
            vehicleId: vehicleData?.vehicleId || vehicleValue,
            vehicleNo: vehicleData?.vehicleNo || '',
            capacity: vehicleData?.capacity || 0,
            driverId: '',
            driverName: '',
            conductorId: '',
            conductorName: '',
          }
        );
      }
    );

    formik.setFieldValue('vehicleAssignments', newVehicleAssignments);
  };

  // Get selected vehicle values for the autocomplete
  const selectedVehicleValues = formik.values.vehicleAssignments.map(
    (assignment) => assignment.vehicleId
  );

  // Helper function to get vehicle assignment error message
  const getVehicleAssignmentError = () => {
    if (formik.touched.vehicleAssignments && formik.errors.vehicleAssignments) {
      if (typeof formik.errors.vehicleAssignments === 'string') {
        return formik.errors.vehicleAssignments;
      }
    }
    return undefined;
  };

  // Helper functions for nested error handling
  const getNestedError = (errors: any, path: string): string | undefined => {
    const pathArray = path.split('.');
    let current = errors;

    // eslint-disable-next-line no-restricted-syntax
    for (const key of pathArray) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  };

  const getNestedTouched = (touched: any, path: string): boolean => {
    const pathArray = path.split('.');
    let current = touched;

    // eslint-disable-next-line no-restricted-syntax
    for (const key of pathArray) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return false;
      }
    }

    return Boolean(current);
  };

  return (
    <SectionCard title="Vehicle Assignments">
      <Grid container spacing={2} size={{ xs: 12 }}>
        {/* Select Vehicles */}
        <Grid size={{ xs: 12 }}>
          <RouteDetailsView values={formik.values} />
        </Grid>
        <Grid size={{ xs: 12 }} sx={{ mb: 3 }}>
          <ShakingTextField
            error={!!(formik.touched.vehicleAssignments && formik.errors.vehicleAssignments)}
          >
            <Autocomplete
              multiple
              fullWidth
              options={availableVehicles?.map((vehicle: any) => vehicle.value)}
              getOptionLabel={(option) =>
                availableVehicles?.find((vehicle: any) => vehicle.value === option)?.label || option
              }
              value={selectedVehicleValues}
              onChange={(event, newValue) => {
                handleVehiclesSelect(newValue);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const vehicleLabel =
                    availableVehicles?.find((vehicle: any) => vehicle.value === option)?.label ||
                    option;
                  return (
                    <Chip
                      variant="outlined"
                      label={vehicleLabel}
                      size="small"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Vehicle *"
                  size="small"
                  error={!!(formik.touched.vehicleAssignments && formik.errors.vehicleAssignments)}
                  helperText={getVehicleAssignmentError()}
                />
              )}
            />
          </ShakingTextField>
        </Grid>

        {/* Vehicle Assignments List */}
        {formik.values.vehicleAssignments.map((assignment, index) => (
          <Grid size={{ xs: 12 }} key={assignment.vehicleId} sx={{ mb: 3 }}>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2,
                backgroundColor: '#f9f9f9',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                {/* Vehicle Number and Capacity */}
                <Grid size={{ xs: 12, md: 1 }}>
                  <Typography variant="h6" color="primary">
                    {index + 1}.
                  </Typography>
                </Grid>

                {/* Vehicle Info (Disabled) */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Vehicle"
                    value={`${assignment.vehicleNo} (${assignment.capacity.toString().padStart(2, '0')}) Capacity: ${assignment.capacity}`}
                    disabled
                    size="small"
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#000',
                        opacity: 0.8,
                      },
                    }}
                  />
                </Grid>

                {/* Driver Selection */}
                <Grid size={{ xs: 12, md: 3.5 }}>
                  <ShakingTextField
                    error={
                      getNestedTouched(formik.touched, `vehicleAssignments.${index}.driverId`) &&
                      !!getNestedError(formik.errors, `vehicleAssignments.${index}.driverId`)
                    }
                  >
                    <CustomSelect
                      label="Driver *"
                      name={`vehicleAssignments.${index}.driverId`}
                      fullWidth
                      options={availableDrivers}
                      value={assignment.driverId}
                      onChange={(value) => {
                        const selectedDriver = availableDrivers.find(
                          (driver: any) => driver.value === value
                        );
                        formik.setFieldValue(`vehicleAssignments.${index}.driverId`, value);
                        formik.setFieldValue(
                          `vehicleAssignments.${index}.driverName`,
                          selectedDriver?.label || ''
                        );
                      }}
                      error={
                        getNestedTouched(formik.touched, `vehicleAssignments.${index}.driverId`) &&
                        !!getNestedError(formik.errors, `vehicleAssignments.${index}.driverId`)
                      }
                      helperText={
                        getNestedTouched(formik.touched, `vehicleAssignments.${index}.driverId`)
                          ? getNestedError(formik.errors, `vehicleAssignments.${index}.driverId`)
                          : undefined
                      }
                      formControlProps={{ fullWidth: true }}
                      size="small"
                      renderValue={(selected) => {
                        const driver = availableDrivers.find((d: any) => d.value === selected);
                        return driver ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            {driver.label}
                          </Box>
                        ) : (
                          ''
                        );
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Conductor Selection */}
                <Grid size={{ xs: 12, md: 3.5 }}>
                  <ShakingTextField
                    error={
                      getNestedTouched(formik.touched, `vehicleAssignments.${index}.conductorId`) &&
                      !!getNestedError(formik.errors, `vehicleAssignments.${index}.conductorId`)
                    }
                  >
                    <CustomSelect
                      label="Conductor"
                      name={`vehicleAssignments.${index}.conductorId`}
                      options={availableConductors}
                      value={assignment.conductorId}
                      onChange={(value) => {
                        const selectedConductor = availableConductors.find(
                          (conductor: any) => conductor.value === value
                        );
                        formik.setFieldValue(`vehicleAssignments.${index}.conductorId`, value);
                        formik.setFieldValue(
                          `vehicleAssignments.${index}.conductorName`,
                          selectedConductor?.label || ''
                        );
                      }}
                      error={
                        getNestedTouched(
                          formik.touched,
                          `vehicleAssignments.${index}.conductorId`
                        ) &&
                        !!getNestedError(formik.errors, `vehicleAssignments.${index}.conductorId`)
                      }
                      helperText={
                        getNestedTouched(formik.touched, `vehicleAssignments.${index}.conductorId`)
                          ? getNestedError(formik.errors, `vehicleAssignments.${index}.conductorId`)
                          : undefined
                      }
                      formControlProps={{ fullWidth: true }}
                      size="small"
                      renderValue={(selected) => {
                        const conductor = availableConductors.find(
                          (c: any) => c.value === selected
                        );
                        return conductor ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            {conductor.label}
                          </Box>
                        ) : (
                          ''
                        );
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}

        {/* No Vehicles Selected Message */}
        {formik.values.vehicleAssignments.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body1">
                Please select vehicles from the dropdown above to assign drivers and conductors.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </SectionCard>
  );
};

export default VehicleAssignmentStep;
