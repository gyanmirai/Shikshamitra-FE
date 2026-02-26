import type { FormikProps } from 'formik';

import React from 'react';
import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import RouteDetailsView from './RouteBasicView';
import vehicleManagementData from '../../../../json/transport/transportModuleData.json';

import type { IRoutePayload } from '../Components/type';

interface VehicleAssignmentStepProps {
  formik: FormikProps<IRoutePayload>;
}

const VehicleAssignmentStep = ({ formik }: VehicleAssignmentStepProps) => {
  // Fetch available vehicles, drivers, and conductors at the top level of the component
  // const { data: availableVehicles = [] } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetAssignableVehiclesQuery,
  // });
  const [availableVehicles, setAvailableVehicles] = React.useState(
    vehicleManagementData.assignableVehiclesData
  );
  const [availableDrivers, setSelectableDriversData] = React.useState(
    vehicleManagementData.selectableDriversData
  );
  const [availableConductors, setSelectableConductorsData] = React.useState(
    vehicleManagementData.selectableConductorsData
  );

  // const { data: availableDrivers = [] } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetSelectableDriversQuery,
  // });

  // const { data: availableConductors = [] } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetSelectableConductorsQuery,
  // });

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
            <PaginatedSearchSelect
              key={formik.values.vehicleAssignment?.vehicleId || 'vehicle-empty'}
              fullWidth
              label="Vehicle"
              noOptionsText="No Vehicle Found"
              minChars={0}
              size="small"
              fetchOptions={async (query: string, page: number) => {
                const items = (availableVehicles || []) as any[];
                const filtered = items.filter((o: any) =>
                  (o.label || '').toLowerCase().includes(query.toLowerCase())
                );
                const pageSize = 10;
                const start = (page - 1) * pageSize;
                return {
                  data: filtered.slice(start, start + pageSize),
                  hasMore: start + pageSize < filtered.length,
                };
              }}
              getOptionLabel={(option: any) => option?.label || ''}
              value={
                availableVehicles?.find(
                  (v: any) => v.vehicleId === formik.values.vehicleAssignment?.vehicleId
                ) || null
              }
              onChange={(_, newValue: any) => {
                handleVehicleSelect(newValue ? newValue.value : null);
              }}
              isOptionEqualToValue={(option: any, val: any) => option.value === val.value}
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
                formik.touched.vehicleAssignment?.vehicleId
                  ? ((formik.errors.vehicleAssignment as any)?.vehicleId as string)
                  : undefined
              }
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
            <PaginatedSearchSelect
              key={formik.values.vehicleAssignment?.driverId || 'driver-empty'}
              fullWidth
              label="Driver"
              noOptionsText="No Driver Found"
              minChars={0}
              size="small"
              fetchOptions={async (query: string, page: number) => {
                const items = (availableDrivers || []) as any[];
                const filtered = items.filter((o: any) =>
                  (o.label || '').toLowerCase().includes(query.toLowerCase())
                );
                const pageSize = 10;
                const start = (page - 1) * pageSize;
                return {
                  data: filtered.slice(start, start + pageSize),
                  hasMore: start + pageSize < filtered.length,
                };
              }}
              getOptionLabel={(option: any) => option?.label || ''}
              value={
                availableDrivers.find(
                  (d: any) => d.value === formik.values.vehicleAssignment.driverId
                ) || null
              }
              onChange={(_, newValue: any) => {
                formik.setFieldValue('vehicleAssignment.driverId', newValue?.value || '');
                formik.setFieldValue('vehicleAssignment.driverName', newValue?.label || '');
                formik.setFieldTouched('vehicleAssignment.driverId', false);
              }}
              isOptionEqualToValue={(option: any, val: any) => option.value === val.value}
              error={
                getNestedTouched(formik.touched, 'vehicleAssignment.driverId') &&
                !!getNestedError(formik.errors, 'vehicleAssignment.driverId')
              }
              helperText={
                getNestedTouched(formik.touched, 'vehicleAssignment.driverId')
                  ? getNestedError(formik.errors, 'vehicleAssignment.driverId')
                  : undefined
              }
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
            <PaginatedSearchSelect
              key={formik.values.vehicleAssignment?.conductorId || 'conductor-empty'}
              fullWidth
              label="Conductor"
              noOptionsText="No Conductor Found"
              minChars={0}
              size="small"
              fetchOptions={async (query: string, page: number) => {
                const items = (availableConductors || []) as any[];
                const filtered = items.filter((o: any) =>
                  (o.label || '').toLowerCase().includes(query.toLowerCase())
                );
                const pageSize = 10;
                const start = (page - 1) * pageSize;
                return {
                  data: filtered.slice(start, start + pageSize),
                  hasMore: start + pageSize < filtered.length,
                };
              }}
              getOptionLabel={(option: any) => option?.label || ''}
              value={
                availableConductors.find(
                  (c: any) => c.value === formik.values.vehicleAssignment.conductorId
                ) || null
              }
              onChange={(_, newValue: any) => {
                formik.setFieldValue('vehicleAssignment.conductorId', newValue?.value || '');
                formik.setFieldValue('vehicleAssignment.conductorName', newValue?.label || '');
              }}
              isOptionEqualToValue={(option: any, val: any) => option.value === val.value}
              error={
                getNestedTouched(formik.touched, 'vehicleAssignment.conductorId') &&
                !!getNestedError(formik.errors, 'vehicleAssignment.conductorId')
              }
              helperText={
                getNestedTouched(formik.touched, 'vehicleAssignment.conductorId')
                  ? getNestedError(formik.errors, 'vehicleAssignment.conductorId')
                  : undefined
              }
            />
          </ShakingTextField>
        </Grid>

        {/* Vehicle Assignments List */}
      </SectionCard>
    </>
  );
};

export default VehicleAssignmentStep;
