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
import { TransportReportTitle, AttendanceTripReportMap } from 'src/enums/transport-reports';

import { getTransportValidationSchema } from '../getTransportReportValidationSchema';

// Mock Data
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
const mockTripShifts = [
  { id: 'morning', name: 'Morning' },
  { id: 'evening', name: 'Evening' },
  { id: 'both', name: 'Both' },
];
const mockStandards = [
  { id: 'std1', name: 'Class 1' },
  { id: 'std2', name: 'Class 2' },
];
const mockDivisions = [
  { id: 'div1', name: 'A' },
  { id: 'div2', name: 'B' },
];
const mockStudents = [
  { id: 'stu1', name: 'Student 1' },
  { id: 'stu2', name: 'Student 2' },
];
const mockPickupStatuses = [
  { id: 'picked', name: 'Picked Up' },
  { id: 'missed', name: 'Missed' },
];

const mockStops = [
  { id: 's1', name: 'Stop X' },
  { id: 's2', name: 'Stop Y' },
];
const mockStaffs = [
  { id: 's1', name: 'Staff A' },
  { id: 's2', name: 'Staff B' },
];
const mockReasons = [
  { id: 'sick', name: 'Sick' },
  { id: 'late', name: 'Late' },
];
const mockIncidentTypes = [
  { id: 'accident', name: 'Accident' },
  { id: 'breakdown', name: 'Breakdown' },
];

const AttendanceTripReportFieldsMap = {
  [TransportReportTitle.DailyTrip]: [
    'vehicles',
    'routes',
    'type', // Trip Shift
    'drivers',
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.StudentTransportAttendance]: [
    'standards',
    'divisions',
    'routes',
    'students',
    'status', // Pickup Status (Using status for simplicity, could separate)
    // 'dropStatus', // Drop Status (Would need another field or reuse status/type)
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.DriverTripAttendance]: [
    'drivers',
    'vehicles',
    'routes',
    'type', // Trip Shift
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.BusLoadingUnloading]: [
    'vehicles',
    'routes',
    'stops',
    'staffs', // Staff Incharge
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.MissedPickupDrop]: [
    'standards',
    'divisions',
    'routes',
    'stops',
    'students',
    'types', // Reason
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.TripDelayIncidentLog]: [
    'vehicles',
    'routes',
    'types', // Incident Type
    'fromDate',
    'toDate',
  ],
};

const initialValues = {
  report: '',
  vehicles: [] as string[],
  routes: [] as string[],
  drivers: [] as string[],
  standards: [] as string[],
  divisions: [] as string[],
  students: [] as string[],
  stops: [] as string[],
  staffs: [] as string[],
  type: '',
  types: [] as string[],
  status: '',
  fromDate: null,
  toDate: null,
};

const AttendanceTripReports = ({ report }: { report: string }) => {
  const mappedReport = AttendanceTripReportMap.find((opt) => opt.label === report)?.value;
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
    () =>
      AttendanceTripReportFieldsMap[mappedReport as keyof typeof AttendanceTripReportFieldsMap] ||
      [],
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
              {/* Vehicle (Multi) */}
              {showField('vehicles') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.vehicles && !!formik.touched.vehicles}>
                    <ResponsiveMultiSelect
                      label="Vehicle *"
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

              {/* Standard (Multi) */}
              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.standards && !!formik.touched.standards}>
                    <ResponsiveMultiSelect
                      label="Class *"
                      options={[{ id: 'all', name: 'All' }, ...mockStandards]}
                      value={formik.values.standards}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockStandards.map((v) => v.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.standards.includes('all');
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
                        formik.setFieldValue('standards', finalValues);
                      }}
                      error={!!formik.errors.standards && !!formik.touched.standards}
                      helperText={(formik.touched.standards && formik.errors.standards) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Division (Multi) */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.divisions && !!formik.touched.divisions}>
                    <ResponsiveMultiSelect
                      label="Division *"
                      options={[{ id: 'all', name: 'All' }, ...mockDivisions]}
                      value={formik.values.divisions}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockDivisions.map((v) => v.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.divisions.includes('all');
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
                        formik.setFieldValue('divisions', finalValues);
                      }}
                      error={!!formik.errors.divisions && !!formik.touched.divisions}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Student (Multi) */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.students && !!formik.touched.students}>
                    <ResponsiveMultiSelect
                      label="Student *"
                      options={[{ id: 'all', name: 'All' }, ...mockStudents]}
                      value={formik.values.students}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockStudents.map((v) => v.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.students.includes('all');
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
                        formik.setFieldValue('students', finalValues);
                      }}
                      error={!!formik.errors.students && !!formik.touched.students}
                      helperText={(formik.touched.students && formik.errors.students) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Stop (Multi) */}
              {showField('stops') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.stops && !!formik.touched.stops}>
                    <ResponsiveMultiSelect
                      label="Stop *"
                      options={[{ id: 'all', name: 'All' }, ...mockStops]}
                      value={formik.values.stops}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockStops.map((v) => v.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.stops.includes('all');
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
                        formik.setFieldValue('stops', finalValues);
                      }}
                      error={!!formik.errors.stops && !!formik.touched.stops}
                      helperText={(formik.touched.stops && formik.errors.stops) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Staff (Multi) - Incharge */}
              {showField('staffs') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.staffs && !!formik.touched.staffs}>
                    <ResponsiveMultiSelect
                      label="Staff Incharge *"
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

              {/* Type (Single) - Trip Shift */}
              {showField('type') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.type && !!formik.touched.type}>
                    <Autocomplete
                      options={mockTripShifts}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      value={mockTripShifts.find((v) => v.id === formik.values.type) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('type', newValue ? newValue.id : '');
                      }}
                      size="small"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Trip Shift *"
                          error={!!formik.errors.type && !!formik.touched.type}
                          helperText={(formik.touched.type && formik.errors.type) as string}
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Status (Single) - Pickup/Drop Status */}
              {showField('status') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.status && !!formik.touched.status}>
                    <Autocomplete
                      options={mockPickupStatuses}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      value={mockPickupStatuses.find((v) => v.id === formik.values.status) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('status', newValue ? newValue.id : '');
                      }}
                      size="small"
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

              {/* Types (Multi) - Incident Type / Reason */}
              {showField('types') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.types && !!formik.touched.types}>
                    <ResponsiveMultiSelect
                      label={
                        mappedReport === TransportReportTitle.MissedPickupDrop
                          ? 'Reason *'
                          : 'Incident Type *'
                      }
                      options={
                        mappedReport === TransportReportTitle.MissedPickupDrop
                          ? [{ id: 'all', name: 'All' }, ...mockReasons]
                          : [{ id: 'all', name: 'All' }, ...mockIncidentTypes]
                      }
                      value={formik.values.types}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const isReason = mappedReport === TransportReportTitle.MissedPickupDrop;
                        const dataList = isReason ? mockReasons : mockIncidentTypes;
                        const allRealIds = dataList.map((v) => v.id);
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
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.fromDate}
                      onChange={(newValue) => {
                        formik.setFieldValue('fromDate', newValue);
                      }}
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
                      format="DD/MM/YYYY"
                      label="To Date"
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.toDate}
                      onChange={(newValue) => {
                        formik.setFieldValue('toDate', newValue);
                      }}
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

export default AttendanceTripReports;
