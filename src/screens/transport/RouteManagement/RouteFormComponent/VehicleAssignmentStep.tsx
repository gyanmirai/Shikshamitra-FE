import type { FormikProps } from 'formik';

import React from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, TextField, Autocomplete } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  useGetSelectableDriversQuery,
  useGetAssignableVehiclesQuery,
  useGetSelectableConductorsQuery,
} from 'src/redux/transport/vehicle-management/route-management-api';

import RouteDetailsView from './RouteBasicView';

import type { IRoutePayload } from '../Components/type';

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

  const handleVehicleSelect = (selectedVehicle: string | null) => {
    if (!selectedVehicle) {
      formik.setFieldValue('vehicleAssignment', null);
      return;
    }

    const vehicleData = availableVehicles?.find(
      (vehicle: any) => vehicle.value === selectedVehicle
    );

    const newAssignment = {
      vehicleId: vehicleData?.vehicleId || selectedVehicle,
      vehicleNo: vehicleData?.vehicleNo || '',
      capacity: vehicleData?.capacity || 0,
      driverId: '',
      driverName: '',
      conductorId: '',
      conductorName: '',
    };

    // ✅ Remove the array wrapper if you're only assigning one vehicle
    formik.setFieldValue('vehicleAssignment', newAssignment);
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
    <>
      <RouteDetailsView values={formik.values} />
      <SectionCard title="Vehicle Assignments" paperProps={{ sx: { mt: 2 } }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={
              !!(
                typeof formik?.touched?.vehicleAssignment === 'object' &&
                !Array.isArray(formik?.touched?.vehicleAssignment) &&
                formik?.touched?.vehicleAssignment?.vehicleId &&
                (formik?.errors?.vehicleAssignment as any)?.vehicleId
              )
            }
          >
            <Autocomplete
              fullWidth
              options={availableVehicles || []}
              getOptionLabel={(option) => option?.label || ''}
              value={
                availableVehicles?.find(
                  (vehicle: any) => vehicle.vehicleId === formik.values.vehicleAssignment?.vehicleId
                ) || null
              }
              onChange={(event, newValue) => {
                handleVehicleSelect(newValue ? newValue.value : null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Vehicle"
                  size="small"
                  error={
                    !!(
                      typeof formik.touched.vehicleAssignment === 'object' &&
                      !Array.isArray(formik.touched.vehicleAssignment) &&
                      formik.touched.vehicleAssignment?.vehicleId &&
                      (formik.errors.vehicleAssignment as any)?.vehicleId
                    )
                  }
                  helperText={
                    typeof formik.touched.vehicleAssignment === 'object' &&
                    !Array.isArray(formik.touched.vehicleAssignment) &&
                    formik.touched.vehicleAssignment?.vehicleId &&
                    (formik.errors.vehicleAssignment as any)?.vehicleId
                  }
                />
              )}
            />
          </ShakingTextField>
        </Grid>
        {/* Driver Selection */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={
              getNestedTouched(formik.touched, 'vehicleAssignment.driverId') &&
              !!getNestedError(formik.errors, 'vehicleAssignment.driverId')
            }
          >
            <CustomSelect
              label="Driver"
              name="vehicleAssignment.driverId"
              fullWidth
              options={availableDrivers}
              value={formik.values.vehicleAssignment.driverId}
              labelKey="name"
              onChange={(value) => {
                const selectedDriver = availableDrivers.find(
                  (driver: any) => driver.value === value
                );
                formik.setFieldValue('vehicleAssignment.driverId', selectedDriver?.value || '');
                formik.setFieldValue('vehicleAssignment.driverName', selectedDriver?.label || '');
                formik.setFieldTouched('vehicleAssignment.driverId', false);
              }}
              error={
                getNestedTouched(formik.touched, 'vehicleAssignment.driverId') &&
                !!getNestedError(formik.errors, 'vehicleAssignment.driverId')
              }
              helperText={
                getNestedTouched(formik.touched, 'vehicleAssignment.driverId')
                  ? getNestedError(formik.errors, 'vehicleAssignment.driverId')
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
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={
              getNestedTouched(formik.touched, 'vehicleAssignment.conductorId') &&
              !!getNestedError(formik.errors, 'vehicleAssignment.conductorId')
            }
          >
            <CustomSelect
              label="Conductor"
              name="vehicleAssignment.conductorId"
              options={availableConductors}
              value={formik.values.vehicleAssignment.conductorId}
              onChange={(value) => {
                const selectedConductor = availableConductors.find(
                  (conductor: any) => conductor.value === value
                );
                formik.setFieldValue('vehicleAssignment.conductorId', value);
                formik.setFieldValue(
                  'vehicleAssignment.conductorName',
                  selectedConductor?.label || ''
                );
              }}
              error={
                getNestedTouched(formik.touched, 'vehicleAssignment.conductorId') &&
                !!getNestedError(formik.errors, 'vehicleAssignment.conductorId')
              }
              helperText={
                getNestedTouched(formik.touched, 'vehicleAssignment.conductorId')
                  ? getNestedError(formik.errors, 'vehicleAssignment.conductorId')
                  : undefined
              }
              formControlProps={{ fullWidth: true }}
              size="small"
              renderValue={(selected) => {
                const conductor = availableConductors.find((c: any) => c.value === selected);
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

        {/* Vehicle Assignments List */}
      </SectionCard>
    </>
  );
};

export default VehicleAssignmentStep;
