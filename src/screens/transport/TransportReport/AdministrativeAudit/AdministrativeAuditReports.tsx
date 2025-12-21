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
import { TransportReportTitle, AdministrativeAuditReportMap } from 'src/enums/transport-reports';

import { getTransportValidationSchema } from '../getTransportReportValidationSchema';

// Mock Data
const mockUsers = [
  { id: 'u1', name: 'User A' },
  { id: 'u2', name: 'User B' },
];
const mockModules = [
  { id: 'transport', name: 'Transport' },
  { id: 'finance', name: 'Finance' },
];
const mockActions = [
  { id: 'create', name: 'Create' },
  { id: 'update', name: 'Update' },
  { id: 'delete', name: 'Delete' },
];
const mockParameters = [
  { id: 'p1', name: 'Parameter 1' },
  { id: 'p2', name: 'Parameter 2' },
];
const mockAuditStatuses = [
  { id: 'pass', name: 'Pass' },
  { id: 'fail', name: 'Fail' },
  { id: 'pending', name: 'Pending' },
];
const mockVehicles = [
  { id: 'v1', name: 'Bus 1' },
  { id: 'v2', name: 'Bus 2' },
];
const mockRoutes = [
  { id: 'r1', name: 'Route A' },
  { id: 'r2', name: 'Route B' },
];
const mockCostTypes = [
  { id: 'fuel', name: 'Fuel' },
  { id: 'maintenance', name: 'Maintenance' },
  { id: 'driver', name: 'Driver' },
  { id: 'all', name: 'All' },
];

const AdministrativeAuditReportFieldsMap = {
  [TransportReportTitle.TransportActivityLog]: [
    'staffs', // User (Reusing staffs for User)
    'types', // Module
    'statuses', // Action (Reusing statuses for Action)
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.TransportAudit]: [
    'types', // Parameter
    'status', // Audit Status
    'fromDate',
    'toDate',
  ],
  [TransportReportTitle.MonthlyTransportationSummary]: ['month', 'vehicles', 'routes'],
  [TransportReportTitle.TransportCostAnalysis]: [
    'vehicles',
    'month',
    'type', // Cost Type
  ],
  [TransportReportTitle.TransportPerformanceDashboard]: ['month', 'vehicles', 'routes'],
};

const initialValues = {
  report: '',
  staffs: [] as string[],
  types: [] as string[],
  statuses: [] as string[],
  status: '',
  type: '',
  vehicles: [] as string[],
  routes: [] as string[],
  month: null,
  fromDate: null,
  toDate: null,
};

const AdministrativeAuditReports = ({ report }: { report: string }) => {
  const mappedReport = AdministrativeAuditReportMap.find((opt) => opt.label === report)?.value;
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
      AdministrativeAuditReportFieldsMap[
        mappedReport as keyof typeof AdministrativeAuditReportFieldsMap
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
              {/* Staff (Multi) - User */}
              {showField('staffs') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.staffs && !!formik.touched.staffs}>
                    <ResponsiveMultiSelect
                      label="User *"
                      options={[{ id: 'all', name: 'All' }, ...mockUsers]}
                      value={formik.values.staffs}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockUsers.map((v) => v.id);
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

              {/* Types (Multi) - Module / Parameter */}
              {showField('types') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.types && !!formik.touched.types}>
                    <ResponsiveMultiSelect
                      label={
                        mappedReport === TransportReportTitle.TransportAudit
                          ? 'Parameter *'
                          : 'Module *'
                      }
                      options={
                        mappedReport === TransportReportTitle.TransportAudit
                          ? [{ id: 'all', name: 'All' }, ...mockParameters]
                          : [{ id: 'all', name: 'All' }, ...mockModules]
                      }
                      value={formik.values.types}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const isParam = mappedReport === TransportReportTitle.TransportAudit;
                        const dataList = isParam ? mockParameters : mockModules;
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

              {/* Statuses (Multi) - Action */}
              {showField('statuses') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.statuses && !!formik.touched.statuses}>
                    <ResponsiveMultiSelect
                      label="Action *"
                      options={[{ id: 'all', name: 'All' }, ...mockActions]}
                      value={formik.values.statuses}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = mockActions.map((v) => v.id);
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

              {/* Status (Single) - Audit Status */}
              {showField('status') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.status && !!formik.touched.status}>
                    <Autocomplete
                      options={mockAuditStatuses}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      value={mockAuditStatuses.find((v) => v.id === formik.values.status) || null}
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

              {/* Type (Single) - Cost Type */}
              {showField('type') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.type && !!formik.touched.type}>
                    <Autocomplete
                      options={mockCostTypes}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      value={mockCostTypes.find((v) => v.id === formik.values.type) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('type', newValue ? newValue.id : '');
                      }}
                      size="small"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cost Type *"
                          error={!!formik.errors.type && !!formik.touched.type}
                          helperText={(formik.touched.type && formik.errors.type) as string}
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

              {/* Month */}
              {showField('month') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.month && !!formik.touched.month}>
                    <DatePicker
                      format="MM/YYYY"
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

              {/* From Date */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.fromDate && !!formik.touched.fromDate}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      label="From Date"
                      value={formik.values.fromDate}
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
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

export default AdministrativeAuditReports;
