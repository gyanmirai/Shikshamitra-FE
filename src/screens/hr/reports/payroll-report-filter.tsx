import type { Dayjs } from 'dayjs';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';
import { EmployeeStatusTypeOptions } from 'src/enums/employee-status-type';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';

// Static data for components (copied from PayrollComponentDialog.tsx)
const EARNING_COMPONENTS = [
  'Basic Salary',
  'House Rent Allowance (HRA)',
  'Transport Allowance',
  'Special Allowance',
  'Medical Allowance',
  'Bonus',
];

const DEDUCTION_COMPONENTS = [
  'Provident Fund (PF)',
  'Professional Tax',
  'Income Tax (TDS)',
  'Loan Recovery',
  'Health Insurance',
  'Other Deductions',
];

export const PAYROLL_REPORT_TYPES = [
  'Salary Register',
  'Employee Payslip',
  'Monthly Payroll Summary',
  'Allowance Report',
  'Deduction Report',
  'Payroll Reconciliation Report',
  'Leave Encashment Report',
  'Final Settlement Report',
] as const;

export type PayrollReportType = (typeof PAYROLL_REPORT_TYPES)[number];

const PAYROLL_REPORT_FILTERS: Record<
  PayrollReportType,
  {
    employee?: 'single' | 'multi';
    department?: 'multi';
    status?: 'multi';
    month?: boolean;
    allowanceType?: 'multi';
    deductionType?: 'multi';
  }
> = {
  'Salary Register': { department: 'multi', status: 'multi', month: true },
  'Employee Payslip': { employee: 'multi', month: true },
  'Monthly Payroll Summary': { employee: 'multi', department: 'multi', status: 'multi' },
  'Allowance Report': { employee: 'multi', allowanceType: 'multi', month: true },
  'Deduction Report': { employee: 'multi', deductionType: 'multi', month: true },
  'Payroll Reconciliation Report': { employee: 'multi', department: 'multi' },
  'Leave Encashment Report': { employee: 'multi', month: true },
  'Final Settlement Report': { employee: 'single' },
};

const PayrollReportFilter = () => {
  const { data: employeeData } = useGetEmployeeQuery({});

  const employees = useMemo(() => employeeData?.items || [], [employeeData]);

  const departmentOptions = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((emp: any) => {
      if (emp.department) {
        depts.add(emp.department);
      }
    });
    return Array.from(depts).sort();
  }, [employees]);

  const formik = useFormik<{
    report: PayrollReportType | null;
    employees: any[];
    departments: string[];
    statuses: any[];
    month: Dayjs | null;
    allowanceTypes: string[];
    deductionTypes: string[];
  }>({
    initialValues: {
      report: null,
      employees: [],
      departments: [],
      statuses: [],
      month: null,
      allowanceTypes: [],
      deductionTypes: [],
    },
    validationSchema: Yup.object().shape({
      report: Yup.string().required('Report is required').nullable(),
      employees: Yup.array().when('report', {
        is: (report: PayrollReportType) => report && PAYROLL_REPORT_FILTERS[report]?.employee,
        then: (schema) => schema.min(1, 'At least one employee is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
      departments: Yup.array().when('report', {
        is: (report: PayrollReportType) => report && PAYROLL_REPORT_FILTERS[report]?.department,
        then: (schema) => schema.min(1, 'At least one department is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
      statuses: Yup.array().when('report', {
        is: (report: PayrollReportType) => report && PAYROLL_REPORT_FILTERS[report]?.status,
        then: (schema) => schema.min(1, 'At least one status is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
      month: Yup.date().when('report', {
        is: (report: PayrollReportType) => report && PAYROLL_REPORT_FILTERS[report]?.month,
        then: (schema) => schema.required('Month is required').nullable(),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
      allowanceTypes: Yup.array().when('report', {
        is: (report: PayrollReportType) => report && PAYROLL_REPORT_FILTERS[report]?.allowanceType,
        then: (schema) => schema.min(1, 'At least one allowance type is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
      deductionTypes: Yup.array().when('report', {
        is: (report: PayrollReportType) => report && PAYROLL_REPORT_FILTERS[report]?.deductionType,
        then: (schema) => schema.min(1, 'At least one deduction type is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: (values) => {
      // Add logic to generate report here
    },
  });

  const { values, setFieldValue, errors, touched, handleSubmit } = formik;
  const selectedReport = values.report;

  const handleReportChange = (event: any, newValue: PayrollReportType | null) => {
    setFieldValue('report', newValue);
    // Reset filters
    setFieldValue('employees', []);
    setFieldValue('departments', []);
    setFieldValue('statuses', []);
    setFieldValue('month', null);
    setFieldValue('allowanceTypes', []);
    setFieldValue('deductionTypes', []);
  };

  const renderFilters = () => {
    if (!selectedReport) return null;

    const config = PAYROLL_REPORT_FILTERS[selectedReport];
    const filters = [];

    if (config.employee) {
      filters.push(
        <Grid size={{ xs: 12, md: 4 }} key="employee">
          <Autocomplete
            multiple={config.employee === 'multi'}
            options={employees}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName} (${option.employeeCode || ''})`
            }
            value={config.employee === 'multi' ? values.employees : values.employees[0] || null}
            onChange={(event, newValue) => {
              setFieldValue(
                'employees',
                config.employee === 'multi' ? (newValue as any[]) : newValue ? [newValue] : []
              );
            }}
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label={config.employee === 'multi' ? 'Select Employees' : 'Select Employee'}
                placeholder={config.employee === 'multi' ? 'Select Employees' : 'Select Employee'}
                error={touched.employees && Boolean(errors.employees)}
                helperText={touched.employees && (errors.employees as string)}
              />
            )}
          />
        </Grid>
      );
    }

    if (config.department) {
      filters.push(
        <Grid size={{ xs: 12, md: 4 }} key="department">
          <Autocomplete
            multiple
            options={departmentOptions}
            value={values.departments}
            onChange={(event, newValue) => {
              setFieldValue('departments', newValue);
            }}
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Departments"
                placeholder="Select Departments"
                error={touched.departments && Boolean(errors.departments)}
                helperText={touched.departments && (errors.departments as string)}
              />
            )}
          />
        </Grid>
      );
    }

    if (config.status) {
      filters.push(
        <Grid size={{ xs: 12, md: 4 }} key="status">
          <Autocomplete
            multiple
            options={EmployeeStatusTypeOptions}
            getOptionLabel={(option) => option.label}
            value={values.statuses}
            onChange={(event, newValue) => {
              setFieldValue('statuses', newValue);
            }}
            size="small"
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Status"
                placeholder="Select Status"
                error={touched.statuses && Boolean(errors.statuses)}
                helperText={touched.statuses && (errors.statuses as string)}
              />
            )}
          />
        </Grid>
      );
    }

    if (config.month) {
      filters.push(
        <Grid size={{ xs: 12, md: 4 }} key="month">
          <DatePicker
            label="Select Month"
            views={['month']}
            value={values.month}
            onChange={(newValue) => setFieldValue('month', newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: touched.month && Boolean(errors.month),
                helperText: touched.month && (errors.month as string),
              },
            }}
          />
        </Grid>
      );
    }

    if (config.allowanceType) {
      filters.push(
        <Grid size={{ xs: 12, md: 4 }} key="allowanceType">
          <Autocomplete
            multiple
            options={EARNING_COMPONENTS}
            value={values.allowanceTypes}
            onChange={(event, newValue) => {
              setFieldValue('allowanceTypes', newValue);
            }}
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Allowance Types"
                placeholder="Select Allowance Types"
                error={touched.allowanceTypes && Boolean(errors.allowanceTypes)}
                helperText={touched.allowanceTypes && (errors.allowanceTypes as string)}
              />
            )}
          />
        </Grid>
      );
    }

    if (config.deductionType) {
      filters.push(
        <Grid size={{ xs: 12, md: 4 }} key="deductionType">
          <Autocomplete
            multiple
            options={DEDUCTION_COMPONENTS}
            value={values.deductionTypes}
            onChange={(event, newValue) => {
              setFieldValue('deductionTypes', newValue);
            }}
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Deduction"
                placeholder="Select Deduction"
                error={touched.deductionTypes && Boolean(errors.deductionTypes)}
                helperText={touched.deductionTypes && (errors.deductionTypes as string)}
              />
            )}
          />
        </Grid>
      );
    }

    return filters;
  };

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              options={PAYROLL_REPORT_TYPES}
              value={selectedReport}
              onChange={handleReportChange}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Report"
                  placeholder="Select Report"
                  error={touched.report && Boolean(errors.report)}
                  helperText={touched.report && errors.report}
                />
              )}
            />
          </Grid>
          {renderFilters()}
          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={() => handleSubmit()}
              disabled={!selectedReport}
              size="small"
              sx={{ px: 4 }}
              startIcon={<Iconify icon={GlobalIcons.report} width={20} height={20} />}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

export default PayrollReportFilter;
