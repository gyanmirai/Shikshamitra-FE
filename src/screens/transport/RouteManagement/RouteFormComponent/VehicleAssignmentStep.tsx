import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, TextField, Autocomplete } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetStaffOptionsQuery } from 'src/redux/transport/vehicle-management/driver-conductor-api';
import { useGetVehicleOptionsQuery } from 'src/redux/transport/vehicle-management/vehicle-management-api';

import RouteDetailsView from './RouteBasicView';

import type { IRoutePayload } from '../Components/type';

interface VehicleAssignmentStepProps {
  formik: FormikProps<IRoutePayload>;
}

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

const VehicleAssignmentStep = ({ formik }: VehicleAssignmentStepProps) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { data: availableVehicles = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetVehicleOptionsQuery,
    params: { academicMediumId: currentMedium?.id, onlyAssignable: false },
    options: { skip: !currentMedium?.id },
  });
  const { data: availableDrivers = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStaffOptionsQuery,
    params: { academicMediumId: currentMedium?.id, role: 0, onlyAssignable: false },
    options: { skip: !currentMedium?.id },
  });
  const { data: availableConductors = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStaffOptionsQuery,
    params: { academicMediumId: currentMedium?.id, role: 1, onlyAssignable: false },
    options: { skip: !currentMedium?.id },
  });

  const handleVehicleSelect = (selectedVehicle: any | null) => {
    if (!selectedVehicle) {
      formik.setFieldValue('vehicleAssignment', {
        vehicleId: '',
        vehicleNo: '',
        capacity: 0,
        driverId: '',
        driverName: '',
        conductorId: '',
        conductorName: '',
      });
      return;
    }

    formik.setFieldValue('vehicleAssignment', {
      vehicleId: selectedVehicle.id || selectedVehicle.value,
      vehicleNo: selectedVehicle.code || selectedVehicle.name || '',
      capacity: 0,
      driverId: formik.values.vehicleAssignment?.driverId || '',
      driverName: formik.values.vehicleAssignment?.driverName || '',
      conductorId: formik.values.vehicleAssignment?.conductorId || '',
      conductorName: formik.values.vehicleAssignment?.conductorName || '',
    });
  };

  const selectedVehicle =
    availableVehicles.find(
      (vehicle: any) => (vehicle.id || vehicle.value) === formik.values.vehicleAssignment?.vehicleId
    ) || null;

  return (
    <>
      <RouteDetailsView values={formik.values} />
      <SectionCard title="Vehicle Assignment" paperProps={{ sx: { mt: 2 } }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={
              getNestedTouched(formik.touched, 'vehicleAssignment.vehicleId') &&
              !!getNestedError(formik.errors, 'vehicleAssignment.vehicleId')
            }
          >
            <Autocomplete
              fullWidth
              options={availableVehicles || []}
              getOptionLabel={(option) => option?.label || ''}
              value={selectedVehicle}
              onChange={(_, newValue) => {
                handleVehicleSelect(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Vehicle"
                  size="small"
                  error={
                    getNestedTouched(formik.touched, 'vehicleAssignment.vehicleId') &&
                    !!getNestedError(formik.errors, 'vehicleAssignment.vehicleId')
                  }
                  helperText={
                    getNestedTouched(formik.touched, 'vehicleAssignment.vehicleId')
                      ? getNestedError(formik.errors, 'vehicleAssignment.vehicleId')
                      : undefined
                  }
                />
              )}
            />
          </ShakingTextField>
        </Grid>

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
              value={formik.values.vehicleAssignment?.driverId || ''}
              labelKey="name"
              onChange={(value) => {
                const selectedDriver = availableDrivers.find(
                  (driver: any) => driver.value === value || driver.id === value
                );
                formik.setFieldValue('vehicleAssignment.driverId', selectedDriver?.value || value);
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
                return driver ? <Box display="flex">{driver.label}</Box> : '';
              }}
            />
          </ShakingTextField>
        </Grid>

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
              value={formik.values.vehicleAssignment?.conductorId || ''}
              onChange={(value) => {
                const selectedConductor = availableConductors.find(
                  (conductor: any) => conductor.value === value || conductor.id === value
                );
                formik.setFieldValue('vehicleAssignment.conductorId', value || '');
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
                return conductor ? <Box display="flex">{conductor.label}</Box> : '';
              }}
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>
    </>
  );
};

export default VehicleAssignmentStep;
