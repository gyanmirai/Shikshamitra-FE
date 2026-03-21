'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsive-multi-select';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import { TransportReportTitle, VehicleFleetReportMap } from 'src/enums/transport-reports';

import { getTransportValidationSchema } from '../getTransportReportValidationSchema';

// Mock Data (Replace with actual API calls)
const mockVehicles = [
  { id: 'v1', name: 'Bus 1' },
  { id: 'v2', name: 'Bus 2' },
];
const mockRoutes = [
  { id: 'r1', name: 'Route A' },
  { id: 'r2', name: 'Route B' },
];
const mockDrivers = [
  { id: 'd1', name: 'Driver X' },
  { id: 'd2', name: 'Driver Y' },
];
const mockStatuses = [
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
];
const mockVehicleTypes = [
  { id: 'bus', name: 'Bus' },
  { id: 'van', name: 'Van' },
];
const mockAvailabilityStatuses = [
  { id: 'available', name: 'Available' },
  { id: 'onTrip', name: 'On Trip' },
  { id: 'repair', name: 'Repair' },
];
const mockFitnessStatuses = [
  { id: 'fit', name: 'Fit' },
  { id: 'unfit', name: 'Unfit' },
];

const VehicleFleetReportFieldsMap = {
  [TransportReportTitle.VehicleMaster]: ['types', 'statuses', 'routes'],
  [TransportReportTitle.VehicleAvailabilityStatus]: [
    'vehicles',
    'statuses', // Reusing statuses for Availability Status
    'drivers',
    'routes',
  ],
  [TransportReportTitle.VehicleFitnessInspection]: [
    'vehicles',
    'status', // Fitness Status (Single)
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.VehicleFuelConsumption]: ['vehicles', 'fromDate', 'toDate'],
  [TransportReportTitle.VehicleMileage]: ['vehicles', 'month', 'fromDate', 'toDate'],
  [TransportReportTitle.VehicleInsuranceExpiry]: [
    'vehicles',
    'fromDate',
    'toDate',
    'status', // Expiry Status
  ],
  [TransportReportTitle.VehiclePollutionCertificateExpiry]: [
    'vehicles',
    'fromDate',
    'toDate',
    'status', // Expiry Status
  ],
  [TransportReportTitle.VehiclePermitStatus]: ['vehicles', 'types', 'fromDate', 'toDate'],
  [TransportReportTitle.VehicleMaintenanceSchedule]: [
    'vehicles',
    'status', // Maintenance Status
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.VehicleBreakdownLog]: ['vehicles', 'drivers', 'fromDate', 'toDate'],
  [TransportReportTitle.VehicleRepairServiceHistory]: [
    'vehicles',
    'types', // Service Type
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.VehicleTyreReplacement]: ['vehicles', 'fromDate', 'toDate'],
};

const initialValues = {
  report: '',
  vehicles: [] as string[],
  vehicle: '',
  routes: [] as string[],
  route: '',
  drivers: [] as string[],
  driver: '',
  types: [] as string[],
  type: '',
  statuses: [] as string[],
  status: '',
  fromDate: null,
  toDate: null,
  month: null,
};

const VehicleFleetReports = ({ report }: { report: string }) => {
  const mappedReport = VehicleFleetReportMap.find((opt) => opt.label === report)?.value;
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [dynamicSchema, setDynamicSchema] = useState(getTransportValidationSchema([], currentYear));

  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report: mappedReport || '',
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Report Generated Successfully!');
      setSubmitting(false);
    },
  });

  const currentFields = useMemo(
    () =>
      VehicleFleetReportFieldsMap[mappedReport as keyof typeof VehicleFleetReportFieldsMap] || [],
    [mappedReport]
  );

  useEffect(() => {
    const schema = getTransportValidationSchema(currentFields, currentYear);
    setDynamicSchema(schema);
  }, [currentFields, currentYear]);

  const showField = (field: string) => currentFields.includes(field);

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Vehicle Type (Multi) */}
              {showField('types') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.types && !!formik.touched.types}>
                    <ResponsiveMultiSelect
                      label="Vehicle Type *"
                      options={[{ id: 'all', name: 'All' }, ...mockVehicleTypes]}
                      value={formik.values.types}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockVehicleTypes.map((v) => v.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.types.includes('all');
                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }
                        formik.setFieldValue('types', finalValues);
                      }}
                      error={!!formik.errors.types && !!formik.touched.types}
                      helperText={(formik.touched.types && formik.errors.types) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Status (Multi) */}
              {showField('statuses') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.statuses && !!formik.touched.statuses}>
                    <ResponsiveMultiSelect
                      label="Status *"
                      options={[
                        { id: 'all', name: 'All' },
                        ...(mappedReport === TransportReportTitle.VehicleAvailabilityStatus
                          ? mockAvailabilityStatuses
                          : mockStatuses),
                      ]}
                      value={formik.values.statuses}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const currentOptions =
                          mappedReport === TransportReportTitle.VehicleAvailabilityStatus
                            ? mockAvailabilityStatuses
                            : mockStatuses;
                        const allRealIds = currentOptions.map((v) => v.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.statuses.includes('all');
                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }
                        formik.setFieldValue('statuses', finalValues);
                      }}
                      error={!!formik.errors.statuses && !!formik.touched.statuses}
                      helperText={(formik.touched.statuses && formik.errors.statuses) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Status (Single) */}
              {showField('status') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.status && !!formik.touched.status}>
                    <Autocomplete
                      options={
                        mappedReport === TransportReportTitle.VehicleFitnessInspection
                          ? mockFitnessStatuses
                          : mockStatuses
                      }
                      size="small"
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      value={
                        (
                          (mappedReport === TransportReportTitle.VehicleFitnessInspection
                            ? mockFitnessStatuses
                            : mockStatuses) as any[]
                        ).find((v) => v.id === formik.values.status) || null
                      }
                      onChange={(_, newValue) => {
                        formik.setFieldValue('status', newValue ? newValue.id : '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Status *"
                          error={!!formik.errors.status && !!formik.touched.status}
                          helperText={(formik.touched.status && formik.errors.status) as string}
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Route (Multi) */}
              {showField('routes') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.routes && !!formik.touched.routes}>
                    <ResponsiveMultiSelect
                      label="Route *"
                      options={[{ id: 'all', name: 'All' }, ...mockRoutes]}
                      value={formik.values.routes}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockRoutes.map((v) => v.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.routes.includes('all');
                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }
                        formik.setFieldValue('routes', finalValues);
                      }}
                      error={!!formik.errors.routes && !!formik.touched.routes}
                      helperText={(formik.touched.routes && formik.errors.routes) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Vehicle (Multi) */}
              {showField('vehicles') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.vehicles && !!formik.touched.vehicles}>
                    <ResponsiveMultiSelect
                      label="Vehicle No *"
                      options={[{ id: 'all', name: 'All' }, ...mockVehicles]}
                      value={formik.values.vehicles}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockVehicles.map((v) => v.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.vehicles.includes('all');
                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }
                        formik.setFieldValue('vehicles', finalValues);
                      }}
                      error={!!formik.errors.vehicles && !!formik.touched.vehicles}
                      helperText={(formik.touched.vehicles && formik.errors.vehicles) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Driver (Multi) */}
              {showField('drivers') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.drivers && !!formik.touched.drivers}>
                    <ResponsiveMultiSelect
                      label="Driver *"
                      options={[{ id: 'all', name: 'All' }, ...mockDrivers]}
                      value={formik.values.drivers}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockDrivers.map((v) => v.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.drivers.includes('all');
                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }
                        formik.setFieldValue('drivers', finalValues);
                      }}
                      error={!!formik.errors.drivers && !!formik.touched.drivers}
                      helperText={(formik.touched.drivers && formik.errors.drivers) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* From Date */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.fromDate && !!formik.touched.fromDate}>
                    <DatePicker
                      label="From Date"
                      format="DD/MM/YYYY"
                      value={formik.values.fromDate}
                      onChange={(newValue) => {
                        formik.setFieldValue('fromDate', newValue);
                      }}
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: !!formik.errors.fromDate && !!formik.touched.fromDate,
                          helperText: (formik.touched.fromDate && formik.errors.fromDate) as string,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* To Date */}
              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.toDate && !!formik.touched.toDate}>
                    <DatePicker
                      label="To Date"
                      format="DD/MM/YYYY"
                      value={formik.values.toDate}
                      onChange={(newValue) => {
                        formik.setFieldValue('toDate', newValue);
                      }}
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: !!formik.errors.toDate && !!formik.touched.toDate,
                          helperText: (formik.touched.toDate && formik.errors.toDate) as string,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Month */}
              {showField('month') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.month && !!formik.touched.month}>
                    <DatePicker
                      label="Month *"
                      views={['month', 'year']}
                      value={formik.values.month}
                      onChange={(newValue) => {
                        formik.setFieldValue('month', newValue);
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: !!formik.errors.month && !!formik.touched.month,
                          helperText: (formik.touched.month && formik.errors.month) as string,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  type="submit"
                  startIcon={<Iconify icon={GlobalIcons.report} />}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default VehicleFleetReports;
