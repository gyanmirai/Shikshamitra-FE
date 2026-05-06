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
import { TransportReportTitle, StudentTransportReportMap } from 'src/enums/transport-reports';

import { getTransportValidationSchema } from '../getTransportReportValidationSchema';

// Mock Data
const mockStandards = [
  { id: 'std1', name: 'Class 1' },
  { id: 'std2', name: 'Class 2' },
];
const mockDivisions = [
  { id: 'div1', name: 'A' },
  { id: 'div2', name: 'B' },
];
const mockRoutes = [
  { id: 'r1', name: 'Route A' },
  { id: 'r2', name: 'Route B' },
];
const mockStops = [
  { id: 's1', name: 'Stop X' },
  { id: 's2', name: 'Stop Y' },
];
const mockStudents = [
  { id: 'stu1', name: 'Student 1' },
  { id: 'stu2', name: 'Student 2' },
];
const mockFeeStatuses = [
  { id: 'paid', name: 'Paid' },
  { id: 'unpaid', name: 'Unpaid' },
  { id: 'partial', name: 'Partial' },
];
const mockCardStatuses = [
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
  { id: 'lost', name: 'Lost' },
  { id: 'reissued', name: 'Reissued' },
];
const mockEnrolmentStatuses = [
  { id: 'active', name: 'Active' },
  { id: 'pending', name: 'Pending' },
  { id: 'rejected', name: 'Rejected' },
];

const StudentTransportReportFieldsMap = {
  [TransportReportTitle.TransportRegisteredStudentsList]: [
    'standards',
    'divisions',
    'routes',
    'stops', // Pickup & Drop Stops (Simplified)
    'status', // Fee Status
    'students',
  ],
  [TransportReportTitle.NonTransportStudentsList]: ['standards', 'divisions', 'students'],
  [TransportReportTitle.ClassWiseTransportStudentList]: ['standards', 'divisions', 'routes'],
  [TransportReportTitle.StudentPickupDropChangeRequest]: [
    'standards',
    'divisions',
    'routes',
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.TransportIDCardRegister]: [
    'standards',
    'divisions',
    'routes',
    'status', // Card Status
    'fromDate', // Issue From Date
    'toDate', // Issue To Date
  ],
  [TransportReportTitle.StudentTransportCancellation]: [
    'standards',
    'divisions',
    'routes',
    'fromDate', // Cancellation From Date
    'toDate', // Cancellation To Date
  ],
  [TransportReportTitle.NewTransportEnrolment]: [
    'standards',
    'divisions',
    'routes',
    'fromDate', // Enrollment From Date
    'toDate', // Enrollment To Date
    'status', // Enrollment Status
  ],
};

const initialValues = {
  report: '',
  standards: [] as string[],
  divisions: [] as string[],
  routes: [] as string[],
  stops: [] as string[],
  students: [] as string[],
  status: '',
  fromDate: null,
  toDate: null,
};

const StudentTransportReports = ({ report }: { report: string }) => {
  const mappedReport = StudentTransportReportMap.find((opt) => opt.label === report)?.value;

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
      //      window.alert('Report Generated Successfully!');
      setSubmitting(false);
    },
  });

  const currentFields = useMemo(
    () =>
      StudentTransportReportFieldsMap[
        mappedReport as keyof typeof StudentTransportReportFieldsMap
      ] || [],
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

              {/* Stop (Multi) */}
              {showField('stops') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.stops && !!formik.touched.stops}>
                    <ResponsiveMultiSelect
                      label="Stop (Pickup/Drop) *"
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

              {/* Status (Single) */}
              {showField('status') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.status && !!formik.touched.status}>
                    <Autocomplete
                      options={
                        mappedReport === TransportReportTitle.TransportRegisteredStudentsList
                          ? mockFeeStatuses
                          : mappedReport === TransportReportTitle.TransportIDCardRegister
                            ? mockCardStatuses
                            : mockEnrolmentStatuses
                      }
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      value={
                        (
                          (mappedReport === TransportReportTitle.TransportRegisteredStudentsList
                            ? mockFeeStatuses
                            : mappedReport === TransportReportTitle.TransportIDCardRegister
                              ? mockCardStatuses
                              : mockEnrolmentStatuses) as any[]
                        ).find((v) => v.id === formik.values.status) || null
                      }
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

export default StudentTransportReports;
