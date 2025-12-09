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
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import { TransportReportTitle, DriverStaffReportMap } from 'src/enums/transport-reports';

import { getTransportValidationSchema } from '../getTransportReportValidationSchema';

// Mock Data
const mockDrivers = [
  { id: 'd1', name: 'Driver X' },
  { id: 'd2', name: 'Driver Y' },
];
const mockStaffs = [
  { id: 's1', name: 'Conductor A' },
  { id: 's2', name: 'Assistant B' },
];
const mockVehicles = [
  { id: 'v1', name: 'Bus 1' },
  { id: 'v2', name: 'Bus 2' },
];
const mockStatuses = [
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
];
const mockShifts = [
  { id: 'morning', name: 'Morning' },
  { id: 'evening', name: 'Evening' },
];
const mockLicenseStatuses = [
  { id: 'valid', name: 'Valid' },
  { id: 'expired', name: 'Expired' },
  { id: 'expiringSoon', name: 'Expiring Soon' },
];
const mockIncidentTypes = [
  { id: 'accident', name: 'Accident' },
  { id: 'delay', name: 'Delay' },
];

const DriverStaffReportFieldsMap = {
  [TransportReportTitle.DriverMaster]: ['drivers', 'status', 'vehicles'],
  [TransportReportTitle.ConductorAssistantMaster]: ['staffs', 'status', 'vehicles'],
  [TransportReportTitle.DriverAttendance]: [
    'drivers',
    'type', // Shift
    'vehicles',
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.DriverLicenseExpiry]: [
    'drivers',
    'fromDate',
    'toDate',
    'status', // License Status
  ],
  [TransportReportTitle.DriverBackgroundVerification]: [
    'drivers',
    'status', // Verification Status (Simplified for now)
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.DriverPerformanceIncident]: [
    'drivers',
    'types', // Incident Type
    'fromDate',
    'toDate',
  ],
};

const initialValues = {
  report: '',
  drivers: [] as string[],
  staffs: [] as string[],
  vehicles: [] as string[],
  status: '',
  type: '',
  types: [] as string[],
  fromDate: null,
  toDate: null,
};

const DriverStaffReports = ({ report }: { report: string }) => {
  const mappedReport = DriverStaffReportMap.find((opt) => opt.label === report)?.value;
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
      // console.log('Generating Report:', values);
      window.alert('Report Generated Successfully!');
      setSubmitting(false);
    },
  });

  const currentFields = useMemo(
    () => DriverStaffReportFieldsMap[mappedReport as keyof typeof DriverStaffReportFieldsMap] || [],
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

              {/* Staff (Multi) */}
              {showField('staffs') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.staffs && !!formik.touched.staffs}>
                    <ResponsiveMultiSelect
                      label="Staff *"
                      options={[{ id: 'all', name: 'All' }, ...mockStaffs]}
                      value={formik.values.staffs}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockStaffs.map((v) => v.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.staffs.includes('all');
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
                        formik.setFieldValue('staffs', finalValues);
                      }}
                      error={!!formik.errors.staffs && !!formik.touched.staffs}
                      helperText={(formik.touched.staffs && formik.errors.staffs) as string}
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
                        mappedReport === TransportReportTitle.DriverLicenseExpiry
                          ? mockLicenseStatuses
                          : mockStatuses
                      }
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      value={
                        (
                          (mappedReport === TransportReportTitle.DriverLicenseExpiry
                            ? mockLicenseStatuses
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
                          size="small"
                          error={!!formik.errors.status && !!formik.touched.status}
                          helperText={(formik.touched.status && formik.errors.status) as string}
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Vehicle (Multi) */}
              {showField('vehicles') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.vehicles && !!formik.touched.vehicles}>
                    <ResponsiveMultiSelect
                      label="Assigned Vehicle *"
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

              {/* Type (Single) - Shift */}
              {showField('type') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.type && !!formik.touched.type}>
                    <Autocomplete
                      options={mockShifts}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      value={mockShifts.find((v) => v.id === formik.values.type) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('type', newValue ? newValue.id : '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Shift *"
                          size="small"
                          error={!!formik.errors.type && !!formik.touched.type}
                          helperText={(formik.touched.type && formik.errors.type) as string}
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Types (Multi) - Incident Type */}
              {showField('types') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.types && !!formik.touched.types}>
                    <ResponsiveMultiSelect
                      label="Incident Type *"
                      options={[{ id: 'all', name: 'All' }, ...mockIncidentTypes]}
                      value={formik.values.types}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockIncidentTypes.map((v) => v.id);
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

              {/* From Date */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.fromDate && !!formik.touched.fromDate}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      label="From Date"
                      value={formik.values.fromDate}
                      onChange={(newValue) => {
                        formik.setFieldValue('fromDate', newValue);
                      }}
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
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
                      format="DD/MM/YYYY"
                      label="To Date"
                      value={formik.values.toDate}
                      onChange={(newValue) => {
                        formik.setFieldValue('toDate', newValue);
                      }}
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!formik.errors.toDate && !!formik.touched.toDate,
                          helperText: (formik.touched.toDate && formik.errors.toDate) as string,
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

export default DriverStaffReports;
